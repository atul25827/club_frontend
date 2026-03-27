import { Country, State, ClubMasterData } from "@/types";
import { API_ROUTES } from "./api-routes";
import { getBaseUrl, mapAcademyData } from "@/lib/client-fetcher";
import { serverFetch } from "@/lib/server-fetcher";

export const apiServer = {
    async getClubMasterData(): Promise<ClubMasterData | null> {
        try {
            const json = await serverFetch(API_ROUTES.clubMasterData.get);
            console.log(json, "jsonjsonjsonjson");
            return json.message?.data || json.message || [];
        } catch (error) {
            console.error("Error fetching master data:", error);
            return null;
        }
    },

    async getCountries(): Promise<Country[]> {
        try {
            const json = await serverFetch(API_ROUTES.clubMasterData.getCountries);
            return json.message?.data || json.message || [];
        } catch (error) {
            console.error("Error fetching countries:", error);
            return [];
        }
    },

    async getStates(country: string): Promise<State[]> {
        try {
            const json = await serverFetch(API_ROUTES.clubMasterData.getStates, {
                params: { country },
            });
            return json.message?.data || json.message || [];
        } catch (error) {
            console.error("Error fetching states:", error);
            return [];
        }
    },

    async getBookingDetails(club_booking_id: string): Promise<any> {
        try {
            const json = await serverFetch(API_ROUTES.clubBooking.getDetails, {
                params: { club_booking_id },
            });
            return json.message?.data || json.message || null;
        } catch (error) {
            console.error("Error fetching booking details:", error);
            return null;
        }
    },

    async getBookingAuditTrail(club_booking_id: string): Promise<any[]> {
        try {
            // Placeholder for audit trail until an API route is defined
            return [];
        } catch (error) {
            console.error("Error fetching audit trail:", error);
            return [];
        }
    },

};
