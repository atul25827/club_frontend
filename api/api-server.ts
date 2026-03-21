import { Academy, MasterData } from "@/types";
import { API_ROUTES } from "./api-routes";
import { getBaseUrl, mapAcademyData } from "@/lib/client-fetcher";
import { serverFetch } from "@/lib/server-fetcher";

export const apiServer = {
    async getMasterData(): Promise<MasterData | null> {
        try {
            const json = await serverFetch(API_ROUTES.masterData.get);
            return json.message;
        } catch (error) {
            console.error("Error fetching master data:", error);
            return null;
        }
    },

    async getAcademiesWithHalls(): Promise<Academy[]> {
        try {
            const json = await serverFetch(API_ROUTES.academy.getAcademiesWithHalls, { skipAuth: true });
            const rawData = json.message?.data || [];
            return mapAcademyData(rawData, getBaseUrl());
        } catch (error) {
            console.error("Error fetching academies:", error);
            return [];
        }
    },

    async getBookingDetails(bookingId: string): Promise<any> {
        try {
            const json = await serverFetch(API_ROUTES.booking.getDetails, {
                params: { booking_id: bookingId },
            });
            return json.message?.data || json.message || null;
        } catch (error) {
            console.error("Error fetching booking details:", error);
            return null;
        }
    },

    async getBookingAuditTrail(bookingId: string): Promise<any[]> {
        try {
            const json = await serverFetch(API_ROUTES.booking.getAuditTrail, {
                params: { booking_id: bookingId },
            });
            return json.message?.message || [];
        } catch (error) {
            console.error("Error fetching audit trail:", error);
            return [];
        }
    },
};
