"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileText, Utensils, BedDouble, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tab1EventInfo } from "./tab1-event-info";
import { Tab2FoodCatering } from "./tab2-food-catering";
import { Tab3Stay } from "./tab3-stay";
import { validateTab1, toErrorMap } from "@/lib/booking-validation";
import { encryptId, decryptId } from "@/lib/encrypt";
import { api } from "@/services/api";
import type { ClubMasterData } from "@/types";
import type { Tab1FormData, FoodCateringEntry, StayEntry } from "@/types/club-booking.types";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
    { id: 1, label: "Event Information", icon: FileText },
    { id: 2, label: "Food & Catering", icon: Utensils },
    { id: 3, label: "Stay", icon: BedDouble },
] as const;

// ─── Main form ────────────────────────────────────────────────────────────────

export interface BookingFormProps {
    masterData: ClubMasterData | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function BookingForm({ masterData, onSuccess }: BookingFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local State Replacing Context
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [tab1, setTab1] = useState<Tab1FormData>({
        guest_region: "", event_name: "", from_date: "", to_date: ""
    });
    const [foodAndCatering, setFoodAndCatering] = useState<FoodCateringEntry[]>([]);
    const [stay, setStay] = useState<StayEntry[]>([]);

    const [activeTab, setActiveTab] = useState(1);
    const [tab1Errors, setTab1Errors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // ── Load Booking Data ──────────────────────────────────────────────────────
    const loadBooking = useCallback(async (id: string, restoreTab: boolean = false, isBackground: boolean = false) => {
        if (!isBackground) setIsLoading(true);
        try {
            const data = await api.getClubBookingDetails(id);
            if (data) {
                setBookingId(data.name || data.club_booking_id || id);
                setTab1({
                    guest_region: data.guest_region ?? "",
                    event_name: data.event_name ?? "",
                    from_date: data.from_date ?? "",
                    to_date: data.to_date ?? "",
                });
                setFoodAndCatering(Array.isArray(data.food_and_catering) ? data.food_and_catering : []);
                setStay(Array.isArray(data.stay) ? data.stay : []);

                if (restoreTab) {
                    const tabParam = searchParams.get("tab");
                    if (tabParam && ["1", "2", "3"].includes(tabParam)) {
                        setActiveTab(Number(tabParam) as 1 | 2 | 3);
                    }
                }
            }
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    }, [searchParams]);

    // ── On mount: restore from URL if booking_id present ──────────────────────
    useEffect(() => {
        const encrypted = searchParams.get("bid");
        if (!encrypted) return;
        const id = decryptId(encrypted);
        if (!id) return;
        loadBooking(id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Persist active tab in URL ──────────────────────────────────────────────
    const goToTab = useCallback((tab: number) => {
        if (tab > 1 && !bookingId) {
            toast.error("Please complete Event Information first");
            return;
        }
        setActiveTab(tab as 1 | 2 | 3);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", String(tab));
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams, bookingId]);

    // ── Persist booking ID in URL ─────────────────────────────────────────────
    const persistBookingId = useCallback((id: string, tab: number = activeTab) => {
        setBookingId(id);
        setActiveTab(tab as 1 | 2 | 3);
        const params = new URLSearchParams(searchParams.toString());
        params.set("bid", encryptId(id));
        params.set("tab", String(tab));
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [searchParams, router, activeTab]);

    // ── Tab 1 field change ─────────────────────────────────────────────────────
    const handleTab1Change = useCallback((field: keyof Tab1FormData, value: string) => {
        setTab1(prev => ({ ...prev, [field]: value }));
        if (tab1Errors[field]) {
            setTab1Errors((e) => { const n = { ...e }; delete n[field]; return n; });
        }
    }, [tab1Errors]);

    // ── Next: validate Tab1 → CREATE or UPDATE booking ────────────────────────
    const handleNextFromTab1 = async () => {
        const errors = validateTab1(tab1);
        if (errors.length > 0) {
            setTab1Errors(toErrorMap(errors));
            return;
        }
        setTab1Errors({});
        setIsSubmitting(true);

        try {
            const payload: Record<string, any> = {
                guest_region: tab1.guest_region,
                event_name: tab1.event_name,
                from_date: tab1.from_date,
                to_date: tab1.to_date,
            };
            if (bookingId) {
                payload.club_booking_id = bookingId;
            }

            const result = await api.saveClubBooking(payload);
            const id = result?.club_booking_id || result?.name || result?.booking_id || bookingId;

            if (id) {
                persistBookingId(id, 2);
                await loadBooking(id, false, true); // Silent refresh
            }
            toast.success(bookingId ? "Booking updated" : "Booking created");
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to save booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Form Add/Remove ────────────────────────────────────────────────────────

    const handleAddFood = async (entry: FoodCateringEntry) => {
        setIsSubmitting(true);
        try {
            const payload: Record<string, any> = {
                club_booking_id: bookingId,
                food_and_catering: [{ doctype: "Food and Stay Child", ...entry }]
            };
            await api.saveClubBooking(payload);
            toast.success("Food & catering entry saved");
            if (bookingId) await loadBooking(bookingId, false, true);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to save food entry");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveFood = async (childId: string) => {
        setIsSubmitting(true);
        try {
            await api.deleteChild(childId);
            toast.success("Entry removed");
            if (bookingId) await loadBooking(bookingId, false, true);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to remove entry");
            if (bookingId) await loadBooking(bookingId, false, true); // Re-sync just in case
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddStay = async (entry: StayEntry) => {
        setIsSubmitting(true);
        try {
            const payload: Record<string, any> = {
                club_booking_id: bookingId,
                stay: [{ doctype: "Food and Stay Child", ...entry }]
            };
            await api.saveClubBooking(payload);
            toast.success("Stay entry saved");
            if (bookingId) await loadBooking(bookingId, false, true);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to save stay entry");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveStay = async (childId: string) => {
        setIsSubmitting(true);
        try {
            await api.deleteChild(childId);
            toast.success("Entry removed");
            if (bookingId) await loadBooking(bookingId, false, true);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to remove entry");
            if (bookingId) await loadBooking(bookingId, false, true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Final submit ──────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (!bookingId) throw new Error("Booking ID missing");
            // Just submit it by relying on backend state!
            await api.submitClubBooking({ club_booking_id: bookingId });
            toast.success("Booking submitted successfully!");
            setShowConfirmModal(false);
            onSuccess?.();
        } catch (err: any) {
            toast.error(err?.message ?? "Submission failed. Please try again.");
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Navigation ────────────────────────────────────────────────────────────
    const handleNext = async () => {
        if (activeTab === 1) {
            await handleNextFromTab1();
        } else if (activeTab === 2) {
            goToTab(3); // Already saved dynamically; just advance!
        }
    };

    const handleBack = () => {
        goToTab(activeTab - 1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#7D3FD0]" />
                <span className="ml-3 text-[#6a7282]">Loading booking...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full p-2">
            {/* ── Tab Navigation ── */}
            <div className="flex items-center gap-6 sm:gap-8 border-b border-[#E2E8F0] pb-0 relative overflow-x-auto no-scrollbar whitespace-nowrap px-1">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const isDisabled = id > 1 && !bookingId;
                    return (
                        <button
                            key={id}
                            disabled={isDisabled}
                            onClick={() => goToTab(id)}
                            className={cn(
                                "flex items-center gap-2 relative pb-3 transition-all",
                                activeTab === id ? "text-[#33398A]" : "text-[#94A3B8]",
                                isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer"
                            )}
                        >
                            <Icon className={cn("w-[18px] h-[18px]", activeTab === id ? "text-[#33398A]" : "text-[#94A3B8]")} />
                            <span className={cn("text-[14px] sm:text-[15px]", activeTab === id ? "font-bold" : "font-medium")}>{label}</span>
                            {activeTab === id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#33398A] rounded-t-full" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Form Content ── */}
            <div className="mt-2 min-h-[300px]">
                {activeTab === 1 && (
                    <Tab1EventInfo
                        data={tab1}
                        errors={tab1Errors}
                        onChange={handleTab1Change}
                        masterData={masterData}
                    />
                )}

                {activeTab === 2 && (
                    <Tab2FoodCatering
                        fromDate={tab1.from_date}
                        toDate={tab1.to_date}
                        masterData={masterData}
                        entries={foodAndCatering}
                        onAdd={handleAddFood}
                        onRemove={handleRemoveFood}
                        isSubmitting={isSubmitting}
                    />
                )}

                {activeTab === 3 && (
                    <Tab3Stay
                        entries={stay}
                        onAdd={handleAddStay}
                        onRemove={handleRemoveStay}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex flex-row max-sm:gap-3 gap-4 justify-end mt-4">
                {activeTab > 1 && (
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="cursor-pointer border-[#5C5CFF] text-[#5C5CFF] bg-white hover:bg-[#5C5CFF]/10 font-medium text-[16px] px-8 py-3 rounded-xl h-[52px] max-sm:flex-1 sm:w-[140px] transition-all"
                    >
                        <span className="mr-1">←</span> Back
                    </Button>
                )}

                {activeTab < 3 ? (
                    <Button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="cursor-pointer bg-[#5C5CFF] hover:bg-[#4d4dec] text-white font-medium text-[16px] px-8 py-3 rounded-xl h-[52px] max-sm:flex-1 sm:w-[140px] shadow-sm transition-all"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                            </span>
                        ) : (
                            <>Next <span className="ml-1">→</span></>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isSubmitting || !bookingId}
                        className="cursor-pointer bg-[#5C5CFF] hover:bg-[#4d4dec] text-white font-medium text-[16px] px-8 py-3 rounded-xl h-[52px] max-sm:flex-1 sm:w-[140px] shadow-sm disabled:opacity-50 disabled:grayscale transition-all"
                    >
                        Submit
                    </Button>
                )}
            </div>

            {/* ── Submission Confirmation Dialog ── */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-[420px] rounded-xl p-0 border border-gray-200 shadow-lg">

                    <div className="p-6">
                        <DialogHeader>
                            <div className="flex items-start gap-3 mb-3">

                                {/* Subtle Icon */}
                                <div className="p-2 bg-gray-100 rounded-md">
                                    <CheckCircle2 className="w-5 h-5 text-gray-700" />
                                </div>

                                <div>
                                    <DialogTitle className="text-lg font-semibold text-gray-900">
                                        Confirm Submission
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-gray-500 mt-1 leading-relaxed">
                                        Please review your details before submitting. This action will start the approval process.
                                    </DialogDescription>
                                </div>

                            </div>
                        </DialogHeader>

                        <DialogFooter className="mt-6 flex justify-end gap-2">

                            {/* Secondary Button */}
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                                className=" cursor-pointer h-10 px-4 text-sm"
                            >
                                Cancel
                            </Button>

                            {/* Primary Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="cursor-pointer h-10 px-5 text-sm bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white font-medium text-[14px] rounded-[8px]  shadow-lg shadow-purple-100 disabled:opacity-50 disabled:grayscale"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </span>
                                ) : (
                                    "Submit"
                                )}
                            </Button>

                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
