"use client";

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingAuditTrail } from './booking-audit-trail';
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
    FileText,
    Utensils,
    BedDouble,
    Info,
    Check,
    X,
    ChevronLeft
} from "lucide-react";
import { formatDisplayDate } from '@/lib/date-utils';
import Link from 'next/link';

// --- Reusable UI Sub-components ---

const SectionWrapper = ({ title, icon: Icon, iconClass, children, className }: { title: string, icon?: any, iconClass?: string, children: React.ReactNode, className?: string }) => (
    <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 border-b pb-1.5 border-gray-100">
            {Icon && (
                <div className={cn("p-1.5 rounded-md flex items-center justify-center", iconClass)}>
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <h2 className="text-[17px] font-bold text-[#271E4A] tracking-tight">{title}</h2>
        </div>
        {children}
    </div>
);

const KeyValueItem = ({ label, value, isFullWidth = false }: { label: string, value: any, isFullWidth?: boolean }) => (
    <div className={cn("flex flex-col gap-0.5", isFullWidth ? "col-span-full" : "")}>
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="text-[14px] font-semibold text-[#101828]">
            {value || "—"}
        </div>
    </div>
);

const EmptyDataView = ({ message }: { message: string }) => (
    <div className="py-8 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/20">
        <p className="text-gray-400 text-xs font-medium">{message}</p>
    </div>
);

// --- Main Component ---
import { StayListView, DayWiseListView } from "./shared-list-views";

export function BookingDetailsView({ booking }: { booking: any }) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionToPerform, setActionToPerform] = useState<'Approve' | 'Reject' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    console.log(booking, "booking")
    useEffect(() => {
        if (booking?.name) {
            api.getClubBookingAuditTrail(booking.name).then((data: any) => {
                let logs = [];
                if (Array.isArray(data)) {
                    logs = data;
                } else if (data && Array.isArray(data.message)) {
                    logs = data.message;
                } else if (data && Array.isArray(data.data)) {
                    logs = data.data;
                }
                setAuditLogs(logs);
            });
        }
    }, [booking?.name]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        try {
            return format(new Date(dateStr), "dd MMM yyyy");
        } catch {
            return dateStr;
        }
    };

    /** Handles comma-separated date strings (e.g. "2026-04-01, 2026-04-02") */
    const formatDates = (dateStr: string) => {
        if (!dateStr) return "—";
        // If it contains commas, split and format each date individually
        if (dateStr.includes(",")) {
            return dateStr
                .split(",")
                .map((d) => d.trim())
                .filter(Boolean)
                .map((d) => formatDate(d))
                .join(", ");
        }
        return formatDate(dateStr);
    };

    const getStayType = (item: any) => {
        const isStay = item.is_stay;
        const isFood = item.is_food;

        if (isStay && isFood) return "Stay + Food";
        if (isStay) return "Stay";
        if (isFood) return "Food Only";
        return "Not Specified";
    };

    const approvalStatusText = useMemo(() => {
        if (booking?.approval_status?.toLowerCase() === "awaiting approval" && booking?.current_approver) {
            return `Awaiting Approval from ${booking.current_approver}`;
        }
        return booking?.approval_status || "—";
    }, [booking]);

    const foodList = booking?.food_and_catering || [];
    const stayList = booking?.stay || booking?.stay_details || [];

    const getGuestTypeBadge = (guestType: string) => {
        if (!guestType) return <span className="text-gray-400">—</span>;
        const colorClass = guestType === "Doctor" ? "bg-blue-50 text-blue-700" :
            guestType === "Distributor" ? "bg-purple-50 text-purple-700" :
                "bg-gray-100 text-gray-700";
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>{guestType}</span>;
    };

    const getDisplayName = (entry: any) => {
        if (entry.guest_type === "Others") return entry.guest_name || "—";
        if (entry.guest_type === "Distributor") return entry.guest_name || entry.distributor_name || "—";
        if (entry.guest_type === "Doctor") return entry.guest_name || entry.contact_name || "—";
        return entry.guest_name || entry.distributor_or_guest_name || "—";
    };

    const getHospitalAccount = (entry: any) => {
        return entry.account_name || entry.firm_or_hospital_name || "—";
    };

    const initiateAction = (action: 'Approve' | 'Reject') => {
        setActionToPerform(action);
        setRemarks('');
        setIsDialogOpen(true);
    };

    const confirmAction = async () => {
        if (!actionToPerform) return;

        setIsSubmitting(true);
        try {
            const bookingId = booking?.name; // Standard Frappe name used for API
            await api.updateClubBookingStatus(bookingId, actionToPerform, remarks);
            toast.success(`Booking ${actionToPerform}ed successfully`);
            setIsDialogOpen(false);
            router.refresh(); // Refresh to update status UI
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="w-full p-2 sm:p-4 lg:p-2 pb-24 md:pb-4 space-y-8 animate-in fade-in duration-500 bg-white relative">

            {/* 1. Booking Summary */}
            <div className="flex items-center justify-between border-b pb-1.5 border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md flex items-center justify-center bg-purple-50 text-[#7D3FD0]">
                        <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-[17px] font-bold text-[#271E4A] tracking-tight">Booking Summary</h2>
                </div>


                <div className="flex items-center gap-3 ml-4">
                    <BookingAuditTrail bookingId={booking?.name || booking?.club_booking_id} auditLogs={auditLogs} />
                    <Link href="/club-booking-list" className="hidden md:inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">

                        <Button
                            variant="outline"
                            className="cursor-pointer border-[#e5e7eb] text-[#364153] gap-2 font-medium h-9 px-4 rounded-lg transition-all active:scale-95 shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1 " />  Back
                        </Button>
                    </Link>
                    {booking?.can_approve && (
                        <div className="hidden md:flex items-center gap-3">
                            <Button
                                onClick={() => initiateAction('Approve')}
                                className="bg-[#D1FADF] cursor-pointer hover:bg-[#A6F4C5] text-[#027A48] border border-[#027A48]/20 gap-2 font-medium h-9 px-4 rounded-lg transition-all active:scale-95 shadow-sm"
                            >
                                <Check className="h-4 w-4" />
                                Approve
                            </Button>
                            <Button
                                onClick={() => initiateAction('Reject')}
                                className="bg-[#FEE4E2] cursor-pointer hover:bg-[#FECDCA] text-[#B42318] border border-[#B42318]/20 gap-2 font-medium h-9 px-4 rounded-lg transition-all active:scale-95 shadow-sm"
                            >
                                <X className="h-4 w-4" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 bg-[#F9FAFB]/50 p-5 rounded-xl border border-gray-100">
                <KeyValueItem label="Booking ID" value={booking?.club_booking_id?.toUpperCase() || booking?.name} />
                <KeyValueItem label="Event Name" value={booking?.event_name} />
                <KeyValueItem label="Region" value={booking?.guest_region} />
                <KeyValueItem label="From Date" value={formatDate(booking?.from_date)} />
                <KeyValueItem label="To Date" value={formatDate(booking?.to_date)} />
                <KeyValueItem label="Status" value={<StatusBadge status={booking?.booking_status} />} />
                <KeyValueItem
                    label="Approval Status"
                    value={
                        <span className={cn(
                            "font-normal text-[14px]",
                            booking?.approval_status?.toLowerCase().includes("awaiting") ? "text-orange-600" : "text-[#101828]"
                        )}>
                            {approvalStatusText}
                        </span>
                    }
                />
            </div>

            {/* Approve/Reject Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {actionToPerform === 'Approve' ? <Check className="text-green-600" /> : <X className="text-red-600" />}
                            Confirm {actionToPerform} Booking
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Please provide any additional remarks or comments for this action.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remarks" className="font-bold text-gray-700">Remarks</Label>
                            <textarea
                                id="remarks"
                                className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3FD0] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                placeholder="Enter your remarks here..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="rounded-lg font-bold">
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAction}
                            disabled={isSubmitting}
                            className={cn(
                                "font-bold px-6 rounded-lg cursor-pointer",
                                actionToPerform === 'Reject' ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                            )}
                        >
                            {isSubmitting ? "Processing..." : `Confirm ${actionToPerform}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. Stay Details */}
            <SectionWrapper title="Stay Details" icon={BedDouble} iconClass="bg-[#ffedd4] text-orange-500">
                {stayList.length > 0 ? (
                    <>
                        <StayListView
                            entries={stayList}
                            showDelete={false}
                        />
                    </>
                ) : <EmptyDataView message="No stay details available" />}
            </SectionWrapper>

            {/* 3. Food & Catering Details */}
            <SectionWrapper title="Food & Catering" icon={Utensils} iconClass="bg-[#dcfce7] text-green-600">
                {foodList.length > 0 ? (
                    <>
                        <DayWiseListView
                            entries={foodList}
                            showDelete={false}
                        />
                    </>
                ) : <EmptyDataView message="No food or catering records found" />}
            </SectionWrapper>

            {/* Mobile Fixed Action Bar */}
            {booking?.can_approve && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex items-center gap-3 z-50 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)]">
                    <Button
                        onClick={() => initiateAction('Reject')}
                        className="flex-1 bg-[#FEE4E2] cursor-pointer hover:bg-[#FECDCA] text-[#B42318] border border-[#B42318]/20 gap-2 font-medium h-12 rounded-xl transition-all active:scale-95 shadow-sm text-[15px]"
                    >
                        <X className="h-5 w-5" />
                        Reject
                    </Button>
                    <Button
                        onClick={() => initiateAction('Approve')}
                        className="flex-1 bg-[#D1FADF] cursor-pointer hover:bg-[#A6F4C5] text-[#027A48] border border-[#027A48]/20 gap-2 font-medium h-12 rounded-xl transition-all active:scale-95 shadow-sm text-[15px]"
                    >
                        <Check className="h-5 w-5" />
                        Approve
                    </Button>
                </div>
            )}
        </div>
    );
}


