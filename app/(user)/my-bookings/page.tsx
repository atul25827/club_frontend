import { cookies } from "next/headers";
import { api } from "@/api/api";
import { BookingStats } from "@/components/booking/booking-stats";
import { MyBookingsList } from "./my-bookings-list";
import { requireAuth } from "@/api/auth";

export const metadata = {
    title: "My Bookings | Academy",
    description: "View and manage your academy bookings",
};

export default async function MyBookingsPage() {
    // 🔐 SSR Protection: only authenticated non-admin users can access
    await requireAuth();
    const cookieStore = await cookies();
    // We strictly need to pass 'Cookie' header for the Frappe backend to identify the user session
    // when calling from the server side.
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const headers = {
        Cookie: cookieHeader
    };

    // Fetch stats on Server Side
    const statsResponse = await api.getUserBookingStats(headers);
    const stats = statsResponse.message;

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Booking Stats Cards - Server Side Rendered Data */}
            <BookingStats stats={stats} />

            {/* Main Interactive List - Client Side Rendered (Pagination/Filtering) */}
            <MyBookingsList />
        </div>
    );
}
