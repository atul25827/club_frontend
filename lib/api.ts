import { Academy, Hall, Booking, BookingStatsType, PaginatedResponse } from "@/types";

export type { Academy, Hall, Booking }; // Re-export for backward compatibility if needed, or just let components import from types

export const api = {
    async getCalendarBookings(start_date: string, end_date: string, academyId?: string, hallId?: string): Promise<Booking[]> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            throw new Error("Configuration error: NEXT_PUBLIC_FRAPPE_URL is not defined");
        }
        const params = new URLSearchParams({
            start_date,
            end_date,
        });
        if (academyId && academyId !== 'all') params.append('academy', academyId);
        if (hallId && hallId !== 'all') params.append('hall', hallId);

        try {
            const res = await fetch(`${baseUrl}/api/method/academy.api.booking.get_calendar_bookings?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch calendar bookings');
            const data = await res.json();
            return data.message || [];
        } catch (error) {
            console.error("Error fetching calendar bookings:", error);
            return [];
        }
    },

    async getLoggedUser() {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) return null;
        try {
            const res = await fetch(`${baseUrl}/api/method/academy.api.auth.get_logged_user`, {
                method: 'GET',
                credentials: 'include', // Sends 'sid' cookie
                cache: 'no-store'
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.message;
        } catch (e) {
            console.error("Error fetching logged user:", e);
            return null;
        }
    },

    async login(usr: string, pwd: string): Promise<{ data?: any; error?: string }> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_BASE_URL is not defined");
            return { error: "Configuration error" };
        }

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.auth.login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usr, pwd }),
                credentials: 'include', // Important for cookies
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMessage = 'Login failed';

                if (errorData.message) {
                    if (typeof errorData.message === 'string') {
                        errorMessage = errorData.message;
                    } else if (typeof errorData.message === 'object') {
                        // Try to extract a readable message if possible
                        errorMessage = (errorData.message as any).message || JSON.stringify(errorData.message);
                    } else {
                        errorMessage = String(errorData.message);
                    }
                } else if (errorData.exception) {
                    errorMessage = errorData.exception;
                }

                return { error: errorMessage };
            }

            return { data: await response.json() };
        } catch (error: any) {
            console.error("Login network error:", error);
            return { error: error.message || "Network error occurred during login" };
        }
    },
    async logout() {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) return;

        try {
            await fetch(`${baseUrl}/api/method/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout failed", error);
        }
    },
    async getAcademiesWithHalls(): Promise<Academy[]> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_BASE_URL (or FRAPPE_URL) is not defined");
            // Fallback to empty array or mock if strictly needed, but better to return empty to signal issue
            return [];
        }

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.academy.get_academies_with_halls`, {
                cache: 'no-store' // Ensure fresh data
            });

            if (!response.ok) {
                console.error("Failed to fetch academies");
                return [];
            }
            const json = await response.json();
            // Expected response: { message: "Data Fetched Successfully", data: [...] }
            // Adjust based on actual API response structure provided by user
            const rawData = json.message.data || [];

            return rawData.map((item: any) => ({
                id: item.name, // "name" from API is the ID
                name: item.academy_name,
                imageUrl: item.attachment ? (item.attachment.startsWith('http') ? item.attachment : `${baseUrl}${encodeURI(item.attachment)}`) : '', // Handle potential relative URLs and encode spaces
                halls: (item.halls || []).map((h: any) => ({
                    id: h.name,
                    name: h.hall_name,
                    academyId: h.academy_name, // Or item.name if we want to link by ID
                    capacity: h.capacity || 0,
                    wifi: h.wifi || 0,
                    screen: h.screen || 0
                }))
            }));
        } catch (error) {
            console.error("Error fetching academies:", error);
            return [];
        }
    },

    async createBooking(bookingData: any) {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            throw new Error("Configuration error: NEXT_PUBLIC_FRAPPE_URL is not defined");
        }

        const response = await fetch(`${baseUrl}/api/method/academy.api.booking.create_booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
            credentials: 'include', // Include cookies for authentication
        });

        const result = await response.json();

        if (!response.ok) {
            let errorMessage = result.message || result.exception || "Failed to create booking";

            // 1. Check for standard Frappe server messages (most actionable errors)
            if (result._server_messages) {
                try {
                    // _server_messages is a JSON string of a list of JSON strings
                    const messages = JSON.parse(result._server_messages);
                    errorMessage = JSON.parse(messages[0]).message;
                } catch (e) { /* ignore parse error */ }
            }

            // 2. Handle case where message is a nested object or JSON string
            if (typeof errorMessage === 'object' && errorMessage.message) {
                errorMessage = errorMessage.message;
            } else if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(errorMessage);
                    if (parsed.message) errorMessage = parsed.message;
                } catch (e) { /* ignore parse error */ }
            }

            throw new Error(String(errorMessage));
        }

        return result;
    },

    async getUserBookingStats(headers: Record<string, string> = {}): Promise<{ message: BookingStatsType }> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            throw new Error("Configuration error: NEXT_PUBLIC_FRAPPE_URL is not defined");
        }

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_user_booking_stats`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                // Return default if auth fails or other error, ensuring page doesn't crash
                console.error("Failed to fetch stats, status:", response.status);
                return {
                    message: {
                        total_bookings: 0,
                        total_approved: 0,
                        total_pending: 0,
                        total_rejected: 0,
                        total_cancel: 0
                    }
                };
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching booking stats:", error);
            // Return default zero stats on error to handle gracefully
            return {
                message: {
                    total_bookings: 0,
                    total_approved: 0,
                    total_pending: 0,
                    total_rejected: 0,
                    total_cancel: 0
                }
            };
        }
    },

    async getPaginatedBookings(
        page: number = 1,
        limit: number = 10,
        filters: { academy?: string; hall?: string; status?: string } = {}
    ): Promise<PaginatedResponse<Booking>> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            throw new Error("Configuration error: NEXT_PUBLIC_FRAPPE_URL is not defined");
        }

        const queryParams = new URLSearchParams({
            page_number: page.toString(),
            page_length: limit.toString(),
        });

        if (filters.academy && filters.academy !== "all") queryParams.append("academy", filters.academy);
        if (filters.hall && filters.hall !== "all") queryParams.append("hall", filters.hall);
        if (filters.status && filters.status !== "all") queryParams.append("status", filters.status);

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_booking_list?${queryParams.toString()}`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error("Failed to fetch bookings");
            }

            const json = await response.json();
            return json.message; // Assuming the structure based on user description
        } catch (error) {
            console.error("Error fetching paginated bookings:", error);
            return {
                data: [],
                total_count: 0,
                page_number: page,
                page_length: limit
            };
        }
    },

    async exportBookings(
        page: number = 1,
        limit: number = 1000,
        filters: { academy?: string; hall?: string; status?: string } = {}
    ): Promise<PaginatedResponse<Booking>> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            throw new Error("Configuration error: NEXT_PUBLIC_FRAPPE_URL is not defined");
        }

        const queryParams = new URLSearchParams({
            page_number: page.toString(),
            page_length: limit.toString(),
        });

        if (filters.academy && filters.academy !== "all") queryParams.append("academy", filters.academy);
        if (filters.hall && filters.hall !== "all") queryParams.append("hall", filters.hall);
        if (filters.status && filters.status !== "all") queryParams.append("status", filters.status);

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_booking_export?${queryParams.toString()}`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error("Failed to fetch bookings");
            }

            const json = await response.json();
            console.log(json.message);
            return json.message; // Assuming the structure based on user description
        } catch (error) {
            console.error("Error fetching paginated bookings:", error);
            return {
                data: [],
                total_count: 0,
                page_number: 1,
                page_length: 10
            };
        }
    },

    async getApproverStats(): Promise<BookingStatsType> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error");

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_approver_stats`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            });
            if (!response.ok) throw new Error("Failed to fetch stats");
            const json = await response.json();
            return json.message;
        } catch (error) {
            console.error("Error fetching stats:", error);
            return { total_bookings: 0, total_approved: 0, total_rejected: 0, total_pending: 0, total_cancel: 0 };
        }
    },

    async getApproverBookingList(
        page: number = 1,
        limit: number = 10,
        filters: { status?: string; search?: string; academy?: string; hall?: string } = {}
    ): Promise<PaginatedResponse<Booking>> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error");

        const params = new URLSearchParams({
            page_number: page.toString(),
            page_length: limit.toString()
        });
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.search) params.append('search_name', filters.search);
        if (filters.academy && filters.academy !== 'all') params.append('academy', filters.academy);
        if (filters.hall && filters.hall !== 'all') params.append('hall', filters.hall);

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_approver_booking_list?${params.toString()}`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            });
            if (!response.ok) throw new Error("Failed to fetch bookings");

            const json = await response.json();

            return {
                data: json.message.data || [],
                total_count: json.message.total_count,
                page_number: json.message.page_number,
                page_length: json.message.page_length
            };
        } catch (error) {
            console.error("Error fetching approver bookings:", error);
            return {
                data: [],
                total_count: 0,
                page_number: page,
                page_length: limit
            };
        }
    },

    async updateBookingStatus(bookingId: string, action: "Approve" | "Reject", remark?: string, requestType: "booking" | "cancel_request" = "booking"): Promise<any> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error");

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.update_booking_status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    action,
                    remark,
                    request_type: requestType
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update status");
            }
            return await response.json();
        } catch (error) {
            console.error("Error updating booking status", error);
            throw error;
        }
    },
    async getUpcomingBookings(): Promise<any[]> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error");

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_upcoming_bookings`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            });

            if (!response.ok) {
                return [];
            }

            const json = await response.json();
            return json.message || [];
        } catch (error) {
            console.error("Error fetching upcoming bookings", error);
            return [];
        }
    },
    async getMasterData(): Promise<import("@/types").MasterData | null> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_FRAPPE_URL is not defined");
            return null;
        }

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.master_data.get_master_data`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error("Failed to fetch master data");
                return null;
            }

            const json = await response.json();
            return json.message;
        } catch (error) {
            console.error("Error fetching master data:", error);
            return null;
        }
    },

    async cancelBooking(bookingId: string, cancelComment: string): Promise<any> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error");

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.cancel_booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ booking_id: bookingId, cancel_comment: cancelComment }),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to cancel booking");
            }
            return await response.json();
        } catch (error) {
            console.error("Error cancelling booking", error);
            throw error;
        }
    },

    async updateBookingEventPlanning(bookingId: string, payload: { event_planning_data: any[], no_of_participants?: number, no_of_participants_international?: number }): Promise<any> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error");

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.update_booking_event_planning`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    event_planning_data: payload.event_planning_data,
                    no_of_participants: payload.no_of_participants,
                    no_of_participants_international: payload.no_of_participants_international
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update event planning");
            }
            return await response.json();
        } catch (error) {
            console.error("Error updating event planning", error);
            throw error;
        }
    },

    async getBookingAuditTrail(bookingId: string): Promise<any[]> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error");

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_booking_audit_trail?booking_id=${bookingId}`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error("Failed to fetch audit trail");
                return [];
            }

            const json = await response.json();
            return json.message || [];
        } catch (error) {
            console.error("Error fetching audit trail", error);
            return [];
        }
    },

    async uploadAttendanceFiles(bookingId: string, files: File[]): Promise<any> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error: NEXT_PUBLIC_FRAPPE_URL is not defined");

        const formData = new FormData();
        formData.append("booking_id", bookingId);
        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.upload_attendance`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || "Failed to upload attendance files");
            }

            return await response.json();
        } catch (error) {
            console.error("Error uploading attendance files", error);
            throw error;
        }
    },

    async checkPendingAttendance(): Promise<import("@/types").PendingAttendanceBooking[]> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) throw new Error("Configuration error: NEXT_PUBLIC_FRAPPE_URL is not defined");

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.check_pending_attendance`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error("Failed to check pending attendance");
                return [];
            }

            const json = await response.json();
            return json.message?.data || json.message || [];
        } catch (error) {
            console.error("Error checking pending attendance", error);
            return [];
        }
    },
};
