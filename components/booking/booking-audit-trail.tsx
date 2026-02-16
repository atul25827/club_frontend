"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, CalendarClock, User, CheckCircle2, Clock } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { AuditLogEntry } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface BookingAuditTrailProps {
    bookingId: string;
    auditLogs: AuditLogEntry[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function BookingAuditTrail({ bookingId, auditLogs, open: controlledOpen, onOpenChange: setControlledOpen, trigger }: BookingAuditTrailProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {trigger && (
                <SheetTrigger asChild>
                    {trigger}
                </SheetTrigger>
            )}
            {!trigger && !isControlled && (
                <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Audit Trail
                    </Button>
                </SheetTrigger>
            )}
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Booking History</SheetTitle>
                    <SheetDescription>
                        Timeline of actions and status changes for this booking.
                    </SheetDescription>
                </SheetHeader>



                <div className="relative pl-6 border-l border-slate-200 ml-4 space-y-8 pb-10">
                    {auditLogs.length === 0 ? (
                        <div className="text-center text-slate-500 py-8 italic">No audit history found.</div>
                    ) : (
                        auditLogs?.map((log, index) => (
                            <div key={index} className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-200 ring-4 ring-white flex items-center justify-center">
                                    <div className={`h-2 w-2 rounded-full ${getStatusDotColor(log.status)}`}></div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                                        </span>
                                        <StatusBadge status={log.status} className="scale-90 origin-right" />
                                    </div>

                                    <h4 className="font-semibold text-slate-900 leading-none">
                                        {log.action}
                                    </h4>

                                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                        <User className="h-3 w-3" />
                                        <span className="font-medium">{log.user}</span>
                                        <span className="text-xs text-slate-400">({log.user_role})</span>
                                    </div>

                                    {log.comment && (
                                        <div className="mt-2 text-sm bg-slate-50 p-3 rounded-md border border-slate-100 text-slate-700 italic">
                                            "{log.comment}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Upcoming / Future Placeholder (Visual cue for timeline continuation) */}
                    <div className="relative">
                        <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-slate-200 border-2 border-white ring-4 ring-white"></div>
                        <p className="text-xs text-slate-400 italic">End of history</p>
                    </div>
                </div>

            </SheetContent>
        </Sheet >
    );
}

function getStatusDotColor(status: string) {
    switch (status?.toLowerCase()) {
        case "approved": return "bg-green-500";
        case "rejected": return "bg-red-500";
        case "pending": return "bg-yellow-500";
        case "cancelled": return "bg-red-500";
        default: return "bg-slate-400";
    }
}
