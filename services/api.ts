import { Country, State, ClubMasterData } from "@/types";
import { API_ROUTES } from "./api-routes";
import { clientFetch } from "@/lib/client-fetcher";

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

    async getHelpSupportSettings(app_name: string) {
        try {
            const json = await clientFetch(API_ROUTES.support.getHelpSettings, {
                method: "POST",
                body: { app_name },
            });
            return json.message;
        } catch (error) {
            console.error("Error fetching support settings:", error);
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

    async changePassword(data: any): Promise<{ data?: any; error?: string }> {
        try {
            const json = await clientFetch(API_ROUTES.auth.changePassword, {
                method: "POST",
                body: data,
            });
            // Based on API specs, error responses (e.g. 401, 400) might throw an error or return json with error status.
            // Adjust depending on how clientFetch handles non-2xx responses.
            if (json.status === "error") {
                return { error: json.message };
            }
            return { data: json };
        } catch (error: any) {
            return { error: error.message || "Failed to change password" };
        }
    },

    // ─── Master Data ────────────────────────────────────────────────────────

    async getClubMasterData(): Promise<ClubMasterData | null> {
        try {
            const json = await clientFetch(API_ROUTES.clubMasterData.get);
            return json.message;
        } catch (error) {
            console.error("Error fetching club master data:", error);
            return null;
        }
    },

    async getCountries(search_name?: string): Promise<Country[]> {
        try {
            const json = await clientFetch(API_ROUTES.clubMasterData.getCountries, {
                params: search_name ? { search_name } : undefined,
            });
            const result = json.message?.data ?? json.message ?? [];
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error("Error fetching countries:", error);
            return [];
        }
    },

    async getStates(country: string): Promise<State[]> {
        try {
            const json = await clientFetch(API_ROUTES.clubMasterData.getStates, {
                params: { country },
            });
            const result = json.message?.data ?? json.message ?? [];
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error("Error fetching states:", error);
            return [];
        }
    },

    // ─── Club Booking ────────────────────────────────────────────────────────

    async saveClubBooking(payload: Record<string, any>): Promise<any> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.create, {
                method: "POST",
                body: payload,
            });
            return json.message;
        } catch (error) {
            console.error("Error saving club booking:", error);
            throw error;
        }
    },

    async submitClubBooking(payload: Record<string, any>): Promise<any> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.submit, {
                method: "POST",
                body: payload,
            });
            return json.message;
        } catch (error) {
            console.error("Error submitting club booking:", error);
            throw error;
        }
    },

    async getClubBookingDetails(booking_id: string): Promise<any> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.getDetails, {
                params: { club_booking_id: booking_id },
            });
            // Frappe responses can either map to json.data or json.message based on standard vs custom
            const result = json.message.data;
            return result;
        } catch (error) {
            console.error("Error fetching club booking details:", error);
            return null;
        }
    },

    async deleteChild(child_name: string): Promise<any> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.deleteChild, {
                method: "POST",
                body: { name: child_name },
            });
            return json.message ?? json.data;
        } catch (error) {
            console.error("Error deleting child entry:", error);
            throw error;
        }
    },

    async getClubBookingList(
        page_number: number,
        page_length: number,
        filters: { status?: string; search_name?: string } = {}
    ): Promise<{ data: any[]; total_count: number }> {
        try {
            const params: any = { page_number, page_length };
            if (filters.status && filters.status !== "all") params.status = filters.status;
            if (filters.search_name) params.search_name = filters.search_name;

            const json = await clientFetch(API_ROUTES.clubBooking.getList, { params });
            const message = json.message || {};
            return {
                data: message.data || [],
                total_count: message.total_count || 0,
            };
        } catch (error) {
            console.error("Error fetching club booking list:", error);
            return { data: [], total_count: 0 };
        }
    },

    async getUserClubBookingStats(): Promise<any> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.getUserStats);
            return json.message;
        } catch (error) {
            console.error("Error fetching user club booking stats:", error);
            return null;
        }
    },

    async getApproverClubStats(): Promise<any> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.getClubApproverStats);
            return json.message;
        } catch (error) {
            console.error("Error fetching approver club booking stats:", error);
            return null;
        }
    },

    async getApproverClubBookingList(
        page_number: number,
        page_length: number,
        filters: { status?: string; search_name?: string } = {}
    ): Promise<{ data: any[]; total_count: number }> {
        try {
            const params: any = { page_number, page_length };
            if (filters.status && filters.status !== "all") params.status = filters.status;
            if (filters.search_name) params.search_name = filters.search_name;

            const json = await clientFetch(API_ROUTES.clubBooking.getApproverList, { params });
            const message = json.message || {};
            return {
                data: message.data || [],
                total_count: message.total_count || 0,
            };
        } catch (error) {
            console.error("Error fetching approver club booking list:", error);
            return { data: [], total_count: 0 };
        }
    },

    async updateClubBookingStatus(club_booking_id: string, action: string, remark: string): Promise<any> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.updateStatus, {
                method: "POST",
                body: { club_booking_id, action, remark },
            });
            return json.message;
        } catch (error) {
            console.error("Error updating club booking status:", error);
            throw error;
        }
    },

    async getClubApproverStats(): Promise<any> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.getClubApproverStats);
            console.log("json json.message", json.message);
            return json.message;
        } catch (error) {
            console.error("Error fetching academy approver stats:", error);
            return null;
        }
    },

    async getClubBookingAuditTrail(booking_id: string): Promise<any[]> {
        try {
            const json = await clientFetch(API_ROUTES.clubBooking.getAuditTrail, {
                params: { booking_id },
            });
            return json.message || [];
        } catch (error) {
            console.error("Error fetching club booking audit trail:", error);
            return [];
        }
    },

    async exportClubBookings(
        filters: { status?: string; search_name?: string } = {}
    ): Promise<{ data: any[]; total_count: number }> {
        try {
            const params: any = {};
            if (filters.status && filters.status !== "all") params.status = filters.status;
            if (filters.search_name) params.search_name = filters.search_name;

            const json = await clientFetch(API_ROUTES.clubBooking.getExport, {
                params,
            });
            const data = json.message?.data ?? json.message ?? [];
            return { data: Array.isArray(data) ? data : [], total_count: Array.isArray(data) ? data.length : 0 };
        } catch (error) {
            console.error("Error exporting club bookings:", error);
            return { data: [], total_count: 0 };
        }
    },

    async forgotPassword(email: string): Promise<{ data?: any; error?: string }> {
        try {
            const json = await clientFetch(API_ROUTES.auth.forgotPassword, {
                method: "POST",
                body: { email },
                skipAuth: true,
            });
            return { data: json };
        } catch (error: any) {
            return { error: error.message || "Request failed" };
        }
    },

    async resetPassword(data: any): Promise<{ data?: any; error?: string }> {
        try {
            const json = await clientFetch(API_ROUTES.auth.resetPassword, {
                method: "POST",
                body: data,
                skipAuth: true,
            });
            return { data: json };
        } catch (error: any) {
            return { error: error.message || "Password reset failed" };
        }
    },

    async verifyResetToken(token: string): Promise<{ data?: any; error?: string }> {
        try {
            const json = await clientFetch(API_ROUTES.auth.verifyResetToken, {
                method: "GET",
                params: { token },
                skipAuth: true,
            });
            return { data: json };
        } catch (error: any) {
            return { error: error.message || "Verification failed" };
        }
    },

    async registerUser(data: any): Promise<{ data?: any; error?: string }> {
        try {
            const json = await clientFetch(API_ROUTES.auth.registerUser, {
                method: "POST",
                body: data,
                skipAuth: true,
            });
            return { data: json };
        } catch (error: any) {
            return { error: error.message || "Registration failed" };
        }
    },

    async sendSignupOtp(email: string, employee_code: string): Promise<{ data?: any; error?: string }> {
        try {
            const json = await clientFetch(API_ROUTES.auth.sendSignupOtp, {
                method: "POST",
                body: { email, employee_code },
                skipAuth: true,
            });
            return { data: json };
        } catch (error: any) {
            return { error: error.message || "Failed to send OTP" };
        }
    },

    async verifySignupOtp(email: string, otp: string, employee_code: string): Promise<{ data?: any; error?: string }> {
        try {
            const json = await clientFetch(API_ROUTES.auth.verifySignupOtp, {
                method: "POST",
                body: { email, otp, employee_code },
                skipAuth: true,
            });
            return { data: json };
        } catch (error: any) {
            return { error: error.message || "Failed to verify OTP" };
        }
    },
};
