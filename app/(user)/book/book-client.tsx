"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { BookingForm } from "@/components/booking/booking-form";
import HallList from "@/components/academy/hall-list";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useAcademy } from "@/context/academy-context";
import { MasterData } from "@/types";
import { api } from "@/api/api";

interface BookPageClientProps {
    masterData: MasterData | null;
}

export default function BookPageClient({ masterData }: BookPageClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { academies } = useAcademy(); // Use context data
    const { isAuthenticated, isLoading } = useAuth();

    // State for client-fetched master data
    const [fetchedMasterData, setFetchedMasterData] = useState<MasterData | null>(null);

    // URL Params
    const academyIdParam = searchParams.get("academyId");
    const actionParam = searchParams.get("action");

    const isBookingMode = actionParam === "book";

    // Protect Booking Route & Fetch Master Data
    useEffect(() => {
        if (!isLoading && isBookingMode) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (!masterData && !fetchedMasterData) {
                // Fetch master data if not provided by server and not yet fetched
                api.getMasterData().then(data => {
                    if (data) setFetchedMasterData(data);
                });
            }
        }
    }, [isLoading, isBookingMode, isAuthenticated, router, masterData, fetchedMasterData]);

    // State for filter
    const [selectedAcademy, setSelectedAcademy] = useState<string>(academyIdParam || "all");

    useEffect(() => {
        // Sync state with URL param if it changes externally or on load
        if (academyIdParam) {
            setSelectedAcademy(academyIdParam);
        } else {
            setSelectedAcademy("all");
        }
    }, [academyIdParam]);

    const handleFilterChange = (value: string) => {
        setSelectedAcademy(value);
        if (value === "all") {
            router.push("/book");
        } else {
            router.push(`/book?academyId=${value}`);
        }
    };

    // Derive filtered halls from context data
    const filteredHalls = selectedAcademy === "all"
        ? academies.flatMap(a => a.halls || [])
        : academies.find(a => a.id === selectedAcademy)?.halls || [];

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
            {!isBookingMode && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-[24px] font-normal tracking-tight text-[#33398A] font-poppins">
                        Meril Conference Hall
                    </h1>

                    <div className="w-full md:w-[280px]">
                        <Select value={selectedAcademy} onValueChange={handleFilterChange}>
                            <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Select Academy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Academies</SelectItem>
                                {academies.map((academy) => (
                                    <SelectItem key={academy.id} value={academy.id}>
                                        {academy.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {isBookingMode ? (
                <BookingForm
                    academyId={academyIdParam || ""}
                    masterData={masterData || fetchedMasterData}
                    academies={academies}
                />
            ) : (
                <HallList halls={filteredHalls} />
            )}
        </div>
    );
}
