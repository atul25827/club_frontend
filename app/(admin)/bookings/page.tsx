"use client";
import { useRouter } from "next/navigation";

import { BookingList } from "@/components/booking/booking-list";

export default function AdminBookingsPage() {
    const router = useRouter();

    const handleViewDetails = (bookingId: string) => {
        router.push(`/bookings/${bookingId}`); // Redirect to Admin Booking Details
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Reusing the BookingList component - it manages its own state now by user request */}
            <BookingList
                onViewDetails={handleViewDetails}
            />
        </div>
    );
}
