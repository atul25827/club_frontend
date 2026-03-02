"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { type BookingDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Calendar, Clock, MapPin, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { BookingAuditTrail } from "@/components/booking/booking-audit-trail";
import { AttendanceSection } from "@/components/booking/attendance-section";
import { useAcademy } from "@/context/academy-context";
import { Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MasterData } from "@/types";
import { Input } from "@/components/ui/input";

import { AuditLogEntry } from "@/types";

interface BookingDetailsViewProps {
    booking: BookingDetail;
    auditLogs?: AuditLogEntry[];
}

import { StatusBadge } from "@/components/ui/status-badge";

export function BookingDetailsView({ booking, auditLogs }: BookingDetailsViewProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionToPerform, setActionToPerform] = useState<'Approve' | 'Reject' | null>(null);
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Session State
    // Edit Schedule Loop State
    const { user } = useAuth();
    const { academies } = useAcademy();
    const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
    const [scheduleFormData, setScheduleFormData] = useState<{
        no_of_participants: number | string;
        no_of_participants_international: number | string;
        event_planning: any[];
    }>({
        no_of_participants: "",
        no_of_participants_international: "",
        event_planning: []
    });
    const [masterData, setMasterData] = useState<MasterData | null>(null);

    // Fetch Master Data for Booking Types
    useEffect(() => {
        api.getMasterData().then(setMasterData);
    }, []);

    const initiateEditSchedule = () => {
        setScheduleFormData({
            no_of_participants: booking.no_of_participants || "",
            no_of_participants_international: booking.no_of_participants_international || "",
            event_planning: booking.event_planning ? JSON.parse(JSON.stringify(booking.event_planning)) : []
        });
        setIsEditScheduleOpen(true);
    };

    const updateSessionRow = (index: number, field: string, value: string) => {
        const updatedPlanning = [...scheduleFormData.event_planning];
        updatedPlanning[index] = { ...updatedPlanning[index], [field]: value };
        setScheduleFormData(prev => ({ ...prev, event_planning: updatedPlanning }));
    };

    const handleSaveSchedule = async () => {
        setIsSubmitting(true);
        try {
            await api.updateBookingEventPlanning(booking.booking_id, {
                event_planning_data: scheduleFormData.event_planning.map(s => ({
                    name: s.name,
                    hall: s.hall,
                    booking_type: s.booking_type
                })),
                no_of_participants: Number(scheduleFormData.no_of_participants) || 0,
                no_of_participants_international: Number(scheduleFormData.no_of_participants_international) || 0
            });
            toast.success("Schedule updated successfully");
            setIsEditScheduleOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const [requestType, setRequestType] = useState<'booking' | 'cancel_request'>('booking');

    const initiateAction = (action: 'Approve' | 'Reject', type: 'booking' | 'cancel_request' = 'booking') => {
        setActionToPerform(action);
        setRequestType(type);
        setRemarks("");
        setIsDialogOpen(true);
    };

    const confirmAction = async () => {
        if (!actionToPerform) return;

        setIsSubmitting(true);
        try {
            if (requestType === 'booking') {
                await api.updateBookingStatus(booking.booking_id, actionToPerform, remarks, 'booking');
                toast.success(`Booking ${actionToPerform} successfully`);
            } else {
                await api.updateBookingStatus(booking.booking_id, actionToPerform, remarks, 'cancel_request');
                toast.success(`Cancel Request ${actionToPerform} successfully`);
            }
            setIsDialogOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [cancelComment, setCancelComment] = useState("");

    const handleCancelBooking = async () => {
        if (!cancelComment.trim()) {
            toast.error("Please provide a reason for cancellation");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.cancelBooking(booking.booking_id, cancelComment);
            toast.success("Cancel Request Sent Successfully");
            setIsCancelDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to send cancel request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-2 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 -ml-2 text-slate-500 hover:text-slate-800 cursor-pointer shrink-0 mt-1">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-y-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-[16px] md:text-2xl font-bold text-[#271E4A] font-poppins wrap-break-word leading-tight">
                                    {booking.event_title || "Event Details"}
                                </h1>
                                <StatusBadge status={booking.event_status || "Pending"} />
                            </div>

                            <div className="flex items-center gap-2">
                                <BookingAuditTrail bookingId={booking.booking_id} auditLogs={auditLogs || []} />
                                {/* Cancel Button */}
                                {booking.is_cancellable && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCancelDialogOpen(true)}
                                        className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel Booking
                                    </Button>
                                )}

                                {/* Action Buttons for Cancel Request Approvers */}
                                {booking.can_cancel && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => initiateAction('Approve', 'cancel_request')}
                                            className="bg-[#D1FADF] cursor-pointer hover:bg-[#A6F4C5] text-[#027A48] border border-[#027A48]/20 gap-2 font-medium h-8"
                                        >
                                            <Check className="h-4 w-4" />
                                            Approve Cancel
                                        </Button>
                                        <Button
                                            onClick={() => initiateAction('Reject', 'cancel_request')}
                                            className="bg-[#FEE4E2] cursor-pointer hover:bg-[#FECDCA] text-[#B42318] border border-[#B42318]/20 gap-2 font-medium ml-2 h-8"
                                        >
                                            <X className="h-4 w-4" />
                                            Reject Cancel
                                        </Button>
                                    </div>
                                )}

                                {/* Action Buttons for Booking Approvers */}
                                {booking.can_approve && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => initiateAction('Approve', 'booking')}
                                            className="bg-[#D1FADF] cursor-pointer hover:bg-[#A6F4C5] text-[#027A48] border border-[#027A48]/20 gap-2 font-medium h-8"
                                        >
                                            <Check className="h-4 w-4" />
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => initiateAction('Reject', 'booking')}
                                            className="bg-[#FEE4E2] cursor-pointer hover:bg-[#FECDCA] text-[#B42318] border border-[#B42318]/20 gap-2 font-medium ml-2 h-8"
                                        >
                                            <X className="h-4 w-4" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                            <span className="whitespace-nowrap">
                                Booking Id: <span className="font-mono text-[#7D3FD0]">#{(booking.booking_id || booking.name || "").toUpperCase()}</span>
                            </span>
                            <span className="text-slate-300 hidden sm:inline">|</span>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>{booking?.event_start_date ? format(new Date(booking.event_start_date), "dd MMM yyyy") : "N/A"}</span>
                                </div>
                                <span className="text-slate-300">-</span>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>{booking.event_end_date ? format(new Date(booking.event_end_date), "dd MMM yyyy") : "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event & Venue Card */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2">
                            <CardTitle className="text-[14px] md:text-lg font-medium text-slate-800">
                                Event & Venue
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 mb-2">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Academy</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.academy}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Event Type</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.event_type}</p>
                                </div>
                                {(booking.event_type === 'Domestic' || booking.event_type === 'Both' || !booking.event_type) && (
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Participants(Dom.)</p>
                                        <p className="font-medium text-slate-900 text-sm">{booking.no_of_participants || 0}</p>
                                    </div>
                                )}
                                {(booking.event_type === 'International' || booking.event_type === 'Both') && (
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Participants(Int.)</p>
                                        <p className="font-medium text-slate-900 text-sm">{booking.no_of_participants_international || 0}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Vertical</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.vertical_name || "N/A"}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <p className="text-xs text-slate-500 font-medium">Department</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.department || "N/A"}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <p className="text-xs text-slate-500 font-medium">Merilian Code</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.merilian_code || "N/A"}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <p className="text-xs text-slate-500 font-medium">Full Name</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.full_name || "N/A"}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <p className="text-xs text-slate-500 font-medium">Contact Number</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.contact_number || "N/A"}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <p className="text-xs text-slate-500 font-medium">Email</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.email || "N/A"}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <p className="text-xs text-slate-500 font-medium">Description</p>
                                    <p className="font-medium text-slate-900 text-sm">{booking.description || "N/A"}</p>
                                </div>
                            </div>

                            {/* Description if available */}
                            {booking?.comment && (
                                <div className="">
                                    <h4 className="text-xs text-slate-500 font-medium">Comment</h4>
                                    <p className="font-medium text-slate-900 text-sm">
                                        {booking.comment}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {/* Sidebar - Right Column (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Requirements & Admin */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2">
                            <CardTitle className="text-[14px] md:text-lg font-medium text-slate-800">
                                Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 space-y-2">
                            <div>
                                <h4 className="text-xs text-slate-500 font-medium">Specific Requirements</h4>
                                <span className="font-medium text-slate-900 text-sm">{booking.specific_requirements || "None specified"}</span>
                            </div>
                            <div>
                                <h4 className="text-xs text-slate-500 font-medium">IT Requirements</h4>
                                <span className="font-medium text-slate-900 text-sm">{booking.it_requirement || "None specified"}</span>
                            </div>
                            <div>
                                <h4 className="text-xs text-slate-500 font-medium">MATS Status</h4>
                                <span className={cn("font-medium text-slate-900 text-sm", booking.mats_event === 'Yes' ? "text-green-600" : "text-slate-600")}>
                                    {booking.mats_event || "No"}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs text-slate-500 font-medium">MATS Request #</h4>
                                <span className="font-medium text-slate-900 text-sm">{booking.mats_request_number || "N/A"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Schedule */}
                <div className="lg:col-span-3 space-y-2">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-[14px] md:text-lg font-medium text-slate-800">
                                Schedule - Daywise Plan ({booking.event_planning?.length || 1} Days)
                            </CardTitle>
                            {user?.role === "Academy Admin" && (
                                <Button size="sm" variant="outline" className="h-8 gap-2" onClick={initiateEditSchedule}>
                                    <Pencil className="h-3.5 w-3.5" />
                                    {/* Edit Schedule */}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {booking.event_planning && booking.event_planning.length > 0 ? booking.event_planning.map((session: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 shadow-md transition-shadow group flex flex-col gap-3">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                            <div className="flex items-center gap-2">
                                                {/* <div className="h-6 px-1 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
                                                    {format(new Date(session.event_date), "EEEE")}
                                                </div> */}
                                                <span className="text-sm font-medium text-slate-800">
                                                    {new Date(session.event_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                {new Date(session.event_date).toLocaleDateString(undefined, { weekday: 'short' })}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-xs font-medium text-slate-700">{session.event_start_time || "09:00"} - {session.event_end_time || "17:00"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-xs font-medium text-slate-700">{session.hall}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{session.booking_type || "Full Day"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-8 text-slate-500 text-sm">No schedule details available.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attendance Section — visible only after event ends */}
                {(!!booking.can_submit_attendence || !!booking.attendance_submitted) && (
                    <div className="lg:col-span-3">
                        <AttendanceSection
                            bookingId={booking.booking_id}
                            attendanceSubmitted={!!booking.attendance_submitted}
                            attendanceFiles={booking.attendance_files || []}
                        />
                    </div>
                )}
            </div>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm {actionToPerform} {requestType === 'cancel_request' ? 'Cancel Request' : 'Booking'}</DialogTitle>
                        <DialogDescription>
                            Please provide remarks for this action.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <textarea
                                id="remarks"
                                className="flex min-h-[80px] w-full rounded-[6px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#BEBEBE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter your remarks here..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={confirmAction} disabled={isSubmitting} className={actionToPerform === 'Reject' ? "bg-red-600 hover:bg-red-700 cursor-pointer" : "bg-green-600 hover:bg-green-700 cursor-pointer"}>
                            {isSubmitting ? "Processing..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Booking Dialog */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Cancel Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cancel-comment" className="text-slate-700">Reason for Cancellation <span className="text-red-500">*</span></Label>
                            <textarea
                                id="cancel-comment"
                                className="flex min-h-[80px] w-full rounded-[6px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#BEBEBE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Please explain why you are cancelling..."
                                value={cancelComment}
                                onChange={(e) => setCancelComment(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isSubmitting}>Back</Button>
                        <Button onClick={handleCancelBooking} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
                            {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Edit Schedule Dialog */}
            <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Schedule & Participants</DialogTitle>
                        <DialogDescription>
                            Update participant counts and daywise plan details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {/* Participants Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-6">
                            {(booking.event_type === 'Domestic' || booking.event_type === 'Both' || !booking.event_type) && (
                                <div className="space-y-2">
                                    <Label>Participants (Domestic)</Label>
                                    <Input
                                        type="number"
                                        value={scheduleFormData.no_of_participants}
                                        onChange={(e) => setScheduleFormData(prev => ({ ...prev, no_of_participants: e.target.value }))}
                                    />
                                </div>
                            )}
                            {(booking.event_type === 'International' || booking.event_type === 'Both') && (
                                <div className="space-y-2">
                                    <Label>Participants (International)</Label>
                                    <Input
                                        type="number"
                                        value={scheduleFormData.no_of_participants_international}
                                        onChange={(e) => setScheduleFormData(prev => ({ ...prev, no_of_participants_international: e.target.value }))}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Schedule List */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-sm text-slate-900">Daywise Plan</h3>
                            <div className="space-y-3">
                                {scheduleFormData.event_planning.map((session, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                                        <div className="md:col-span-3 space-y-1">
                                            <Label className="text-xs text-slate-500">Date & Time</Label>
                                            <div className="text-sm font-medium text-slate-700">
                                                {format(new Date(session.event_date), "dd MMM, EEEE")}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {session.event_start_time} - {session.event_end_time}
                                            </div>
                                        </div>

                                        <div className="md:col-span-5 space-y-1">
                                            <Label className="text-xs text-slate-500">Training Hall</Label>
                                            <Select
                                                value={session.hall}
                                                onValueChange={(val) => updateSessionRow(idx, 'hall', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Hall" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academies.find(a => a.name === booking.academy)?.halls?.map((hall) => (
                                                        <SelectItem key={hall.id} value={hall.id}>
                                                            {hall.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="md:col-span-4 space-y-1">
                                            <Label className="text-xs text-slate-500">Booking Type</Label>
                                            <Select
                                                value={session.booking_type}
                                                onValueChange={(val) => updateSessionRow(idx, 'booking_type', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {masterData?.booking_type?.map((type) => (
                                                        <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
                                                    )) || (
                                                            <>
                                                                <SelectItem value="Full Day">Full Day</SelectItem>
                                                                <SelectItem value="Half Day">Half Day</SelectItem>
                                                            </>
                                                        )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setIsEditScheduleOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleSaveSchedule} disabled={isSubmitting} className="bg-[#7D3FD0] hover:bg-[#7D3FD0]/90">
                            {isSubmitting ? "Saving Changes..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
