"use client";
import { useRouter } from "next/navigation";
import { encryptId } from "@/lib/encrypt";
import { ClubBookingList } from "@/components/club-booking/club-booking-list";

export default function ClubBookingListPage() {
    const router = useRouter();

    const handleViewDetails = (booking: any) => {
        // Safe check using both lowercase string comparison or is_submitted field (if added)
        const isDraft = booking.booking_status?.toLowerCase() === "draft" || booking.is_submitted === 0;

        if (isDraft) {
            // Edit mode for draft bookings
            router.push(`/club-booking?bid=${encryptId(booking.name)}`);
        } else {
            // View mode for submitted/other bookings
            router.push(`/club-booking-list/${booking.name}`);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Reusing the BookingList component - it manages its own state now by user request */}
            <ClubBookingList
                onViewDetails={handleViewDetails}
            />
        </div>
    );
}
