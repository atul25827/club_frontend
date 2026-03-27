"use client";

import { useRouter } from "next/navigation";
import { BookingForm } from "@/components/club-booking/club-booking-form";
import { ClubMasterData } from "@/types";

interface CreateBookingWrapperProps {
    masterData: ClubMasterData | null;
}

export function CreateBookingWrapper({ masterData }: CreateBookingWrapperProps) {
    const router = useRouter();

    return (
        <BookingForm
            masterData={masterData}
            onSuccess={() => router.push("/club-booking-list")}
            onCancel={() => router.back()}
        />
    );
}
