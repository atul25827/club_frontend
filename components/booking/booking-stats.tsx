import { Calendar, CalendarCheck, CalendarClock, CalendarX, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookingStatsProps {
    stats: {
        total_bookings: number;
        total_approved: number;
        total_pending: number;
        total_rejected: number;
        total_cancel: number;
    };
}

export function BookingStats({ stats }: BookingStatsProps) {
    const totalEvents = stats?.total_bookings || 0;
    const approvedCount = stats?.total_approved || 0;
    const pendingCount = stats?.total_pending || 0;
    const rejectedCount = stats?.total_rejected || 0;
    const cancelCount = stats?.total_cancel || 0;

    const statCards = [
        {
            label: "Total Events",
            value: totalEvents,
            icon: Calendar,
            className: "text-blue-600 bg-blue-50 border-blue-100",
            iconBg: "bg-blue-100 text-blue-600",
        },
        {
            label: "Approved",
            value: approvedCount,
            icon: CalendarCheck,
            className: "text-emerald-600 bg-emerald-50 border-emerald-100",
            iconBg: "bg-emerald-100 text-emerald-600",
        },
        {
            label: "Pending",
            value: pendingCount,
            icon: CalendarClock,
            className: "text-amber-600 bg-amber-50 border-amber-100",
            iconBg: "bg-amber-100 text-amber-600",
        },
        {
            label: "Rejected",
            value: rejectedCount,
            icon: CalendarX,
            className: "text-red-600 bg-red-50 border-red-100",
            iconBg: "bg-red-100 text-red-600",
        },
        {
            label: "Cancelled",
            value: cancelCount,
            icon: Ban,
            className: "text-orange-600 bg-orange-50 border-orange-100",
            iconBg: "bg-orange-100 text-orange-600",
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {statCards.map((stat, index) => (
                <div
                    key={index}
                    className={cn(
                        "bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-md",
                        "flex flex-col justify-center h-[110px]",
                        stat.className.split(' ').pop() // Use border color
                    )}
                >
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-slate-500 uppercase tracking-wide">
                                {stat.label}
                            </span>
                            <span className="text-3xl font-bold text-slate-800 mt-1">
                                {stat.value}
                            </span>
                        </div>
                        <div className={cn("p-2 rounded-lg", stat.iconBg)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
