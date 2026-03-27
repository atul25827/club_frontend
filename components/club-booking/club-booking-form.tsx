"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileText, Utensils, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    { id: 1, label: "Event Information", icon: FileText, activeClass: "bg-[#dbeafe] text-[#155dfc]", indicatorClass: "bg-[#155dfc]" },
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
    const loadBooking = useCallback(async (id: string, restoreTab: boolean = false) => {
        setIsLoading(true);
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
            setIsLoading(false);
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
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", String(tab));
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    // ── Persist booking ID in URL ─────────────────────────────────────────────
    const persistBookingId = useCallback((id: string, tab: number = activeTab) => {
        setBookingId(id);
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
                await loadBooking(id);
                goToTab(2);
            } else {
                goToTab(2);
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
            if (bookingId) await loadBooking(bookingId);
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
            if (bookingId) await loadBooking(bookingId);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to remove entry");
            if (bookingId) await loadBooking(bookingId); // Re-sync just in case
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
            if (bookingId) await loadBooking(bookingId);
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
            if (bookingId) await loadBooking(bookingId);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to remove entry");
            if (bookingId) await loadBooking(bookingId);
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
                <Loader2 className="w-8 h-8 animate-spin text-[#155dfc]" />
                <span className="ml-3 text-[#6a7282]">Loading booking...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full p-2">
            {/* ── Tab Navigation ── */}
            <div className="flex items-center gap-8 border-b border-[#d9d9d9] pb-4 relative">
                {TABS.map(({ id, label, icon: Icon, activeClass, indicatorClass }) => (
                    <button
                        key={id}
                        onClick={() => goToTab(id)}
                        className={`flex items-center gap-4 relative pb-4 -mb-4 ${activeTab === id ? "text-[#101828]" : "text-[#6a7282]"}`}
                    >
                        <div className={`p-2 rounded-[10px] w-9 h-6 flex items-center justify-center ${activeTab === id ? activeClass : "bg-gray-100 text-gray-500"}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-[20px]">{label}</span>
                        {activeTab === id && (
                            <div className={`absolute bottom-0 left-0 right-0 h-1 ${indicatorClass} rounded-t-full`} />
                        )}
                    </button>
                ))}
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
                        className="cursor-pointer bg-[#155dfc] hover:bg-blue-700 text-white font-medium text-[16px] px-8 py-3 rounded-[8px] w-[140px] h-[52px]"
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
                        disabled={isSubmitting}
                        className="cursor-pointer bg-[#155dfc] hover:bg-blue-700 text-white font-medium text-[16px] px-8 py-3 rounded-[8px] h-[52px]"
                    >
                        Submit
                    </Button>
                )}
            </div>

            {/* ── Confirmation Modal ── */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <h3 className="text-[20px] font-bold text-gray-900 mb-2">Submit Booking</h3>
                        <p className="text-gray-500 mb-6 text-[15px]">
                            Are you sure you want to finalize and submit this booking? Ensure all details (food, stay, and event info) are correct as this action goes to the next approval stage.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                                className="border-[#e5e7eb] text-[#364153]"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#155dfc] hover:bg-blue-700 text-white min-w-[140px]"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                         <Loader2 className="w-4 h-4 animate-spin" /> Submitting
                                    </span>
                                ) : (
                                    "Confirm & Submit"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
