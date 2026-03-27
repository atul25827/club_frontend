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
    { id: 1, label: "Event Information", icon: FileText, activeClass: "bg-[#f3e8ff] text-[#7D3FD0]", indicatorClass: "bg-[#7D3FD0]" },
    { id: 2, label: "Food & Catering", icon: Utensils, activeClass: "bg-[#dcfce7] text-green-600", indicatorClass: "bg-green-500" },
    { id: 3, label: "Stay", icon: BedDouble, activeClass: "bg-[#ffedd4] text-orange-500", indicatorClass: "bg-orange-400" },
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
            console.log("data", data);
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
        console.log("entry", entry);
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
            <div className="flex items-center gap-8 border-b border-[#d9d9d9] pb-4 relative">
                {TABS.map(({ id, label, icon: Icon, activeClass, indicatorClass }) => {
                    const isDisabled = id > 1 && !bookingId;
                    return (
                        <button
                            key={id}
                            disabled={isDisabled}
                            onClick={() => goToTab(id)}
                            className={cn(
                                "flex items-center gap-4 relative pb-4 -mb-4 transition-all",
                                activeTab === id ? "text-[#101828]" : "text-[#6a7282]",
                                isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-[10px] w-9 h-6 flex items-center justify-center transition-colors",
                                activeTab === id ? activeClass : "bg-gray-100 text-gray-500"
                            )}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-[20px]">{label}</span>
                            {activeTab === id && (
                                <div className={`absolute bottom-0 left-0 right-0 h-1 ${indicatorClass} rounded-t-full`} />
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
            <div className="flex gap-4 justify-end mt-4">
                {activeTab > 1 && (
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="cursor-pointer border-[#e5e7eb] text-[#364153] font-medium text-[16px] px-8 py-3 rounded-[8px] h-[52px]"
                    >
                        Back
                    </Button>
                )}

                {activeTab < 3 ? (
                    <Button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="cursor-pointer bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white font-medium text-[16px] px-8 py-3 rounded-[8px] w-[140px] h-[52px] shadow-lg shadow-purple-100"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                            </span>
                        ) : "Next"}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isSubmitting || !bookingId}
                        className="cursor-pointer bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white font-medium text-[16px] px-8 py-3 rounded-[8px] h-[52px] shadow-lg shadow-purple-100 disabled:opacity-50 disabled:grayscale"
                    >
                        Submit
                    </Button>
                )}
            </div>

            {/* ── Submission Confirmation Dialog ── */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-[#7D3FD0] h-2 w-full" />
                    <div className="p-6 pt-4">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-[#7D3FD0]" />
                                </div>
                                <DialogTitle className="text-xl font-bold text-gray-900">Ready to Submit?</DialogTitle>
                            </div>
                            <DialogDescription className="text-gray-500 text-[14px] leading-relaxed">
                                You are about to finalize this booking. Please ensure all details are correct as this will initiate the approval workflow.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-8 gap-3 sm:justify-end">
                            <Button 
                                variant="ghost" 
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                                className="text-gray-500 font-bold hover:bg-gray-50 rounded-xl px-6 h-11"
                            >
                                Not yet
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white font-bold rounded-xl px-8 h-11 min-w-[140px] shadow-lg shadow-purple-200 transition-all active:scale-95"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                         <Loader2 className="w-4 h-4 animate-spin" /> Finalizing
                                    </span>
                                ) : (
                                    "Yes, Submit"
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
