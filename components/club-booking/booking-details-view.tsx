"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { StatusBadge } from "@/components/ui/status-badge";
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

export function BookingDetailsView({ booking }: { booking: any }) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionToPerform, setActionToPerform] = useState<'Approve' | 'Reject' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        const isStay = item.is_stay || item.stay_required;
        const isFood = item.is_food === 1 || item.booking_for;

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
    console.log(stayList, "stayList")
    return (
        <div className="w-full p-2 sm:p-4 lg:p-2 space-y-8 animate-in fade-in duration-500 bg-white">

            {/* 1. Booking Summary */}
            <div className="flex items-center justify-between border-b pb-1.5 border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md flex items-center justify-center bg-purple-50 text-[#7D3FD0]">
                        <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-[17px] font-bold text-[#271E4A] tracking-tight">Booking Summary</h2>
                </div>


                <div className="flex gap-3 ml-4">
                    <Link href="/club-booking-list" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">

                        <Button
                            variant="outline"
                            className="cursor-pointer border-[#e5e7eb] text-[#364153] gap-2 font-medium h-9 px-4 rounded-lg transition-all active:scale-95 shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1 " />  Back
                        </Button>
                    </Link>
                    {booking?.can_approve && (
                        <>
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
                        </>
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
                        <div className="hidden md:block rounded-xl border border-gray-100 overflow-x-auto shadow-sm thin-scrollbar">
                            <Table>
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow className="hover:bg-transparent border-gray-100 h-10">
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Guest Name</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Designation</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Organization</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">State/Country</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Check-in</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Check-out</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Stay Type</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap text-center px-4">Repeat</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest min-w-[200px] px-4">Remark</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stayList.map((stay: any, idx: number) => (
                                        <TableRow key={idx} className="hover:bg-slate-50 border-gray-50 transition-colors h-12">
                                            <TableCell className="font-bold text-[#101828] text-[13px] py-2 px-4">{stay.distributor_or_guest_name || "—"}</TableCell>
                                            <TableCell className="text-gray-500 text-[13px] px-4">{stay.designation || "—"}</TableCell>
                                            <TableCell className="text-gray-500 text-[13px] whitespace-nowrap px-4">{stay.firm_or_hospital_name || "—"}</TableCell>
                                            <TableCell className="text-gray-500 text-[13px] px-4">{stay.state ? `${stay.state}, ${stay.country || ""}` : stay.country || "—"}</TableCell>
                                            <TableCell className="font-semibold text-gray-700 text-[12px] px-4">{formatDisplayDate(stay.check_in_date)}</TableCell>
                                            <TableCell className="font-semibold text-gray-700 text-[12px] px-4">{formatDisplayDate(stay.check_out_date)}</TableCell>
                                            <TableCell className="text-[12px] px-4">
                                                <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    {getStayType(stay)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center px-4">
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                                    stay.repeat_guest === "Yes" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                                                )}>
                                                    {stay.repeat_guest || "No"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-600 text-[12px] italic leading-relaxed px-4 truncate max-w-[250px]">{stay.remark || "—"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Mobile Stacked View */}
                        <div className="md:hidden space-y-3">
                            {stayList.map((stay: any, idx: number) => (
                                <div key={idx} className="border border-gray-100 rounded-xl p-4 space-y-3 shadow-sm bg-gray-50/10">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#101828] text-[14px]">{stay.distributor_or_guest_name || "Guest"}</span>
                                            <span className="text-[11px] text-slate-500">{stay.designation || "No Designation"}</span>
                                        </div>
                                        <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                            {getStayType(stay)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                                        <KeyValueItem label="Organization" value={stay.firm_or_hospital_name} />
                                        <KeyValueItem label="Location" value={stay.country} />
                                        <KeyValueItem label="Check-in" value={formatDisplayDate(stay.check_in_date)} />
                                        <KeyValueItem label="Check-out" value={formatDisplayDate(stay.check_out_date)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : <EmptyDataView message="No stay details available" />}
            </SectionWrapper>

            {/* 3. Food & Catering Details */}
            <SectionWrapper title="Food & Catering" icon={Utensils} iconClass="bg-[#dcfce7] text-green-600">
                {foodList.length > 0 ? (
                    <>
                        <div className="hidden md:block rounded-xl border border-gray-100 overflow-x-auto shadow-sm thin-scrollbar">
                            <Table className="min-w-[1400px]">
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow className="hover:bg-transparent border-gray-100 h-10">
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Booking For</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Day</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Guest Name</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Total Guests</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Designation</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Firm/Hospital</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Repeat Guest</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">State</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Country</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Food Pref.</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4">Meal Type</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4 text-center">Veg</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4 text-center">Non-Veg</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4 text-center">Jain</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap px-4 text-center">Other</TableHead>
                                        <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest min-w-[200px] px-4">Remark</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {foodList.map((food: any, idx: number) => (
                                        <TableRow key={idx} className="hover:bg-slate-50 border-gray-50 transition-colors h-12">
                                            <TableCell className="text-gray-600 font-medium text-[13px] px-4">{food.booking_for || "—"}</TableCell>
                                            <TableCell className="font-bold text-[#101828] text-[13px] py-2 px-4 text-nowrap">
                                                <span className="">{formatDates(food.day)}</span>
                                            </TableCell>
                                            <TableCell className="text-gray-600 text-[13px] px-4 font-semibold">{food.distributor_or_guest_name || "—"}</TableCell>
                                            <TableCell className="font-bold text-green-700 text-[14px] px-4 text-center">{food.total_no_of_guest || 0}</TableCell>
                                            <TableCell className="text-gray-500 text-[13px] px-4 whitespace-nowrap">{food.designation || "—"}</TableCell>
                                            <TableCell className="text-gray-500 text-[13px] px-4 whitespace-nowrap">{food.firm_or_hospital_name || "—"}</TableCell>
                                            <TableCell className="text-center px-4">
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                                    food.repeat_guest === "Yes" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                                                )}>
                                                    {food.repeat_guest || "No"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-[13px] px-4 whitespace-nowrap">{food.state || "—"}</TableCell>
                                            <TableCell className="text-gray-500 text-[13px] px-4 whitespace-nowrap">{food.country || "—"}</TableCell>
                                            <TableCell className="text-gray-600 text-[12px] whitespace-nowrap px-4">{food.food_preferences || "—"}</TableCell>
                                            <TableCell className="text-[12px] px-4">
                                                <span className="bg-green-50 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                    {food.meal_type || "—"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center px-4">
                                                <span className="text-green-600 font-bold" title="Vegetarian">{food.veg || 0}</span>
                                            </TableCell>
                                            <TableCell className="text-center px-4">
                                                <span className="text-red-600 font-bold" title="Non-Vegetarian">{food.non_veg || 0}</span>
                                            </TableCell>
                                            <TableCell className="text-center px-4">
                                                <span className="text-orange-600 font-bold" title="Jain">{food.jain || 0}</span>
                                            </TableCell>
                                            <TableCell className="text-center px-4">
                                                <span className="text-gray-600 font-bold" title="Other">{food.other || 0}</span>
                                            </TableCell>
                                            <TableCell className="text-gray-600 text-[12px] italic leading-relaxed px-4 truncate max-w-[250px]">{food.remark || "—"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Mobile Stacked View */}
                        <div className="md:hidden space-y-3">
                            {foodList.map((food: any, idx: number) => (
                                <div key={idx} className="border border-gray-100 rounded-xl p-4 space-y-3 shadow-sm bg-gray-50/10">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#101828] text-[14px]">{formatDates(food.day)}</span>
                                            <span className="text-[11px] text-gray-500 uppercase">{food.booking_for || "Booking"}</span>
                                        </div>
                                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                                            {food.meal_type || "N/A"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                                        <KeyValueItem label="Guest Name" value={food.distributor_or_guest_name} />
                                        <KeyValueItem label="Total Guests" value={food.total_no_of_guest} />
                                        <KeyValueItem label="Firm/Hospital" value={food.firm_or_hospital_name} />
                                        <KeyValueItem label="Food Pref" value={food.food_preferences} />
                                        <div className="col-span-full py-2 bg-white rounded-lg border border-gray-100/50 flex justify-around">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-green-600 uppercase font-bold" title="Vegetarian">V: {food.veg || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-red-600 uppercase font-bold" title="Non-Vegetarian">N: {food.non_veg || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-orange-600 uppercase font-bold" title="Jain">J: {food.jain || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-gray-600 uppercase font-bold" title="Other">O: {food.other || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {food.remark && (
                                        <div className="pt-2 border-t border-gray-100">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Remark:</span>
                                            <p className="text-[12px] text-gray-600 italic leading-tight">{food.remark}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : <EmptyDataView message="No food or catering records found" />}
            </SectionWrapper>
        </div>
    );
}


