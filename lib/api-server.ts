import { cookies } from "next/headers";
import { Academy, Hall, Booking } from "@/types";

export const apiServer = {
    async getMasterData(): Promise<import("@/types").MasterData | null> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_FRAPPE_URL is not defined");
            return null;
        }

        try {
            const cookieStore = await cookies();
            const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

            const response = await fetch(`${baseUrl}/api/method/academy.api.master_data.get_master_data`, {
                method: 'GET',
                headers: {
                    'Cookie': allCookies
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error(`Failed to fetch master data. Status: ${response.status} ${response.statusText}`);
                const text = await response.text();
                console.error("Response body:", text);
                return null;
            }
            const json = await response.json();
            return json.message;
        } catch (error) {
            console.error("Error fetching master data:", error);
            return null;
        }
    },

    async getAcademiesWithHalls(): Promise<Academy[]> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_BASE_URL (or FRAPPE_URL) is not defined");
            return [];
        }

        try {
            const response = await fetch(`${baseUrl}/api/method/academy.api.academy.get_academies_with_halls`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error("Failed to fetch academies");
                return [];
            }
            const json = await response.json();
            const rawData = json.message.data || [];

            return rawData.map((item: any) => ({
                id: item.name,
                name: item.academy_name,
                imageUrl: item.attachment ? (item.attachment.startsWith('http') ? item.attachment : `${baseUrl}${encodeURI(item.attachment)}`) : '',
                halls: (item.halls || []).map((h: any) => ({
                    id: h.name,
                    name: h.hall_name,
                    academyId: h.academy_name,
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

    async getBookingDetails(bookingId: string): Promise<any> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_FRAPPE_URL is not defined");
            return null;
        }

        try {
            const cookieStore = await cookies();
            const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_booking_details?booking_id=${bookingId}`, {
                method: 'GET',
                headers: {
                    'Cookie': allCookies
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error("Failed to fetch booking details server-side", response.status);
                return null;
            }

            const json = await response.json();
            const data = json.message?.data || json.message;
            return data || null;

        } catch (error) {
            console.error("Error fetching booking details:", error);
            return null;
        }
    },

    async getBookingAuditTrail(bookingId: string): Promise<any[]> {
        const baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_FRAPPE_URL is not defined");
            return [];
        }

        try {
            const cookieStore = await cookies();
            const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

            const response = await fetch(`${baseUrl}/api/method/academy.api.booking.get_booking_audit_trail?booking_id=${bookingId}`, {
                method: 'GET',
                headers: {
                    'Cookie': allCookies
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error("Failed to fetch audit trail server-side");
                return [];
            }

            const json = await response.json();
            return json.message.message || [];
        } catch (error) {
            console.error("Error fetching audit trail:", error);
            return [];
        }
    }
};
