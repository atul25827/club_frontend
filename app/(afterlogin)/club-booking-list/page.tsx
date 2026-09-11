"use client";
import { useRouter } from "next/navigation";
import { encryptId } from "@/lib/encrypt";
import { ClubBookingList } from "@/components/club-booking/club-booking-list";
import { useAuth } from "@/context/auth-context";
import { useMemo } from "react";
import { LIST_REGISTRY } from "../dashboard/config";

export default function ClubBookingListPage() {
    const router = useRouter();
    const { role, isLoading, isAuthenticated } = useAuth();

    const activeConfig = useMemo(() => {
        if (!role) return null;

        const userRoles = Array.isArray(role) ? role : [role];
        const normalizedUserRoles = userRoles.map(r => r.toUpperCase());

        // Find the first matching list configuration
        // Usually Admin should take priority if they have both, or we could use tabs here too
        // But for now, we'll pick the first one found in the registry order
        return LIST_REGISTRY.find(list =>
            list.roles.some(requiredRole =>
                normalizedUserRoles.includes(requiredRole.toUpperCase())
            )
        );
    }, [role]);

    const handleViewDetails = (booking: any) => {
        const isDraft = booking.booking_status?.toLowerCase() === "draft" || booking.is_submitted === 0;

        if (isDraft) {
            router.push(`/club-booking?bid=${encryptId(booking.name)}`);
        } else {
            router.push(`/club-booking-list/${booking.name}`);
        }
    };

    if (isLoading || !isAuthenticated) {
        return null; // Prevents generic fallback UI from flashing during logout or initial load
    }

    if (!activeConfig) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <p>Checking permissions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ClubBookingList
                config={activeConfig}
                onViewDetails={handleViewDetails}
            />
        </div>
    );
}
