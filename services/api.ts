import { Academy, Hall, Booking, BookingStatsType, PaginatedResponse, MasterData, PendingAttendanceBooking } from "@/types";
import { API_ROUTES } from "./api-routes";
import { clientFetch, getBaseUrl, mapAcademyData, DEFAULT_STATS } from "@/lib/client-fetcher";

export type { Academy, Hall, Booking };

export const api = {
    // ─── Auth ───────────────────────────────────────────────────────────────

    async getLoggedUser() {
        try {
            const json = await clientFetch(API_ROUTES.auth.getLoggedUser);
            return json.message;
        } catch {
            return null;
        }
    },

    async login(usr: string, pwd: string): Promise<{ data?: any; error?: string }> {
        try {
            const json = await clientFetch(API_ROUTES.auth.login, {
                method: "POST",
                body: { usr, pwd },
            });
            return { data: json };
        } catch (error: any) {
            return { error: error.message || "Network error occurred during login" };
        }
    },

    async logout() {
        try {
            await clientFetch(API_ROUTES.auth.logout, { method: "POST" });
        } catch (error) {
            console.error("Logout failed", error);
        }
    },

    // ─── Academy ────────────────────────────────────────────────────────────

    async getAcademiesWithHalls(): Promise<Academy[]> {
        try {
            const json = await clientFetch(API_ROUTES.academy.getAcademiesWithHalls, { skipAuth: true });
            const rawData = json.message?.data || [];
            return mapAcademyData(rawData, getBaseUrl());
        } catch (error) {
            console.error("Error fetching academies:", error);
            return [];
        }
    },

    // ─── Booking ────────────────────────────────────────────────────────────

    async getCalendarBookings(start_date: string, end_date: string, academyId?: string, hallId?: string): Promise<Booking[]> {
        const params: Record<string, string> = { start_date, end_date };
        if (academyId && academyId !== "all") params.academy = academyId;
        if (hallId && hallId !== "all") params.hall = hallId;

        try {
            const json = await clientFetch(API_ROUTES.booking.getCalendar, { params, skipAuth: true });
            return json.message || [];
        } catch (error) {
            console.error("Error fetching calendar bookings:", error);
            return [];
        }
    },

    async createBooking(bookingData: any) {
        return clientFetch(API_ROUTES.booking.create, {
            method: "POST",
            body: bookingData,
        });
    },

    async getUserBookingStats(headers: Record<string, string> = {}): Promise<{ message: BookingStatsType }> {
        try {
            return await clientFetch(API_ROUTES.booking.getUserStats, { headers });
        } catch (error) {
            console.error("Error fetching booking stats:", error);
            return { message: { ...DEFAULT_STATS } };
        }
    },

    async getPaginatedBookings(
        page: number = 1,
        limit: number = 10,
        filters: { academy?: string; hall?: string; status?: string } = {}
    ): Promise<PaginatedResponse<Booking>> {
        const params: Record<string, string> = {
            page_number: page.toString(),
            page_length: limit.toString(),
        };
        if (filters.academy && filters.academy !== "all") params.academy = filters.academy;
        if (filters.hall && filters.hall !== "all") params.hall = filters.hall;
        if (filters.status && filters.status !== "all") params.status = filters.status;

        try {
            const json = await clientFetch(API_ROUTES.booking.getList, { params });
            return json.message;
        } catch (error) {
            console.error("Error fetching paginated bookings:", error);
            return { data: [], total_count: 0, page_number: page, page_length: limit };
        }
    },

    async exportBookings(
        page: number = 1,
        limit: number = 1000,
        filters: { academy?: string; hall?: string; status?: string } = {}
    ): Promise<PaginatedResponse<Booking>> {
        const params: Record<string, string> = {
            page_number: page.toString(),
            page_length: limit.toString(),
        };
        if (filters.academy && filters.academy !== "all") params.academy = filters.academy;
        if (filters.hall && filters.hall !== "all") params.hall = filters.hall;
        if (filters.status && filters.status !== "all") params.status = filters.status;

        try {
            const json = await clientFetch(API_ROUTES.booking.getExport, { params });
            return json.message;
        } catch (error) {
            console.error("Error fetching export bookings:", error);
            return { data: [], total_count: 0, page_number: 1, page_length: 10 };
        }
    },

    async getApproverStats(): Promise<BookingStatsType> {
        try {
            const json = await clientFetch(API_ROUTES.booking.getApproverStats);
            return json.message;
        } catch (error) {
            console.error("Error fetching stats:", error);
            return { ...DEFAULT_STATS };
        }
    },

    async getApproverBookingList(
        page: number = 1,
        limit: number = 10,
        filters: { status?: string; search?: string; academy?: string; hall?: string } = {}
    ): Promise<PaginatedResponse<Booking>> {
        const params: Record<string, string> = {
            page_number: page.toString(),
            page_length: limit.toString(),
        };
        if (filters.status && filters.status !== "all") params.status = filters.status;
        if (filters.search) params.search_name = filters.search;
        if (filters.academy && filters.academy !== "all") params.academy = filters.academy;
        if (filters.hall && filters.hall !== "all") params.hall = filters.hall;

        try {
            const json = await clientFetch(API_ROUTES.booking.getApproverList, { params });
            return {
                data: json.message.data || [],
                total_count: json.message.total_count,
                page_number: json.message.page_number,
                page_length: json.message.page_length,
            };
        } catch (error) {
            console.error("Error fetching approver bookings:", error);
            return { data: [], total_count: 0, page_number: page, page_length: limit };
        }
    },

    async updateBookingStatus(bookingId: string, action: "Approve" | "Reject", remark?: string, requestType: "booking" | "cancel_request" = "booking"): Promise<any> {
        return clientFetch(API_ROUTES.booking.updateStatus, {
            method: "POST",
            body: { booking_id: bookingId, action, remark, request_type: requestType },
        });
    },

    async getUpcomingBookings(): Promise<any[]> {
        try {
            const json = await clientFetch(API_ROUTES.booking.getUpcoming);
            return json.message || [];
        } catch (error) {
            console.error("Error fetching upcoming bookings", error);
            return [];
        }
    },

    async cancelBooking(bookingId: string, cancelComment: string): Promise<any> {
        return clientFetch(API_ROUTES.booking.cancel, {
            method: "POST",
            body: { booking_id: bookingId, cancel_comment: cancelComment },
        });
    },

    async updateBookingEventPlanning(bookingId: string, payload: { event_planning_data: any[]; no_of_participants?: number; no_of_participants_international?: number }): Promise<any> {
        return clientFetch(API_ROUTES.booking.updateEventPlanning, {
            method: "POST",
            body: {
                booking_id: bookingId,
                event_planning_data: payload.event_planning_data,
                no_of_participants: payload.no_of_participants,
                no_of_participants_international: payload.no_of_participants_international,
            },
        });
    },

    async getBookingAuditTrail(bookingId: string): Promise<any[]> {
        try {
            const json = await clientFetch(API_ROUTES.booking.getAuditTrail, {
                params: { booking_id: bookingId },
            });
            return json.message || [];
        } catch (error) {
            console.error("Error fetching audit trail", error);
            return [];
        }
    },

    async uploadAttendanceFiles(bookingId: string, files: File[]): Promise<any> {
        const formData = new FormData();
        formData.append("booking_id", bookingId);
        files.forEach((file) => formData.append("files", file));

        return clientFetch(API_ROUTES.booking.uploadAttendance, {
            method: "POST",
            formData,
        });
    },

    async checkPendingAttendance(): Promise<PendingAttendanceBooking[]> {
        try {
            const json = await clientFetch(API_ROUTES.booking.checkPendingAttendance);
            return json.message?.data || json.message || [];
        } catch (error) {
            console.error("Error checking pending attendance", error);
            return [];
        }
    },

    // ─── Master Data ────────────────────────────────────────────────────────

    async getMasterData(): Promise<MasterData | null> {
        try {
            const json = await clientFetch(API_ROUTES.masterData.get);
            return json.message;
        } catch (error) {
            console.error("Error fetching master data:", error);
            return null;
        }
    },
};
