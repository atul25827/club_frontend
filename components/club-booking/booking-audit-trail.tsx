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
import { api } from "@/services/api";
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

    const formatComment = (comment: string) => {
        if (!comment) return null;

        let formatted = comment;

        // Strip basic HTML if sent by Frappe
        formatted = formatted.replace(/<b>/g, '').replace(/<\/b>/g, '');

        // If the comment has no line breaks but seems to be a concatenated track-change string:
        if (!formatted.includes('\n')) {
            // Split before "Row X:"
            formatted = formatted.replace(/(Row \d+:)/g, '\n$1');
            // Split before "No. of"
            formatted = formatted.replace(/(No\. of)/g, '\n$1');
            // Specific splits for fields to ensure readability
            formatted = formatted.replace(/(Event Start Date changed)/g, '\n$1');
            formatted = formatted.replace(/(Event End Date changed)/g, '\n$1');
            formatted = formatted.replace(/(Event Title changed)/g, '\n$1');
            formatted = formatted.replace(/(Club changed)/g, '\n$1');
        }

        // Now split by newline or <br> and render
        const lines = formatted.split(/\n|<br\s*\/?>/i).map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length === 0) return null;

        if (lines.length === 1) {
            return <div className="italic text-slate-700 text-sm wrap-break-word break-all">"{lines[0]}"</div>;
        }

        return (
            <div className="flex flex-col gap-1 mt-1 w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Updates</span>
                <ul className="space-y-1.5 list-disc pl-4 marker:text-slate-300 w-full">
                    {lines.map((line, idx) => (
                        <li key={idx} className="text-slate-700 text-xs leading-relaxed wrap-break-word break-all">
                            {line}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
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
                    {(!Array.isArray(auditLogs) || auditLogs.length === 0) ? (
                        <div className="text-center text-slate-500 py-8 italic">No audit history found.</div>
                    ) : (
                        auditLogs.map((log, index) => (
                            <div key={index} className="relative w-full">
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
                                        <div className="mt-2 bg-slate-50 p-3 rounded-md border border-slate-100 w-full overflow-hidden">
                                            {formatComment(log.comment)}
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
