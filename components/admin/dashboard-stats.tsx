"use client";

import { BookingStatsType } from "@/types";
import { Calendar, CalendarCheck, Clock, XSquare, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
    stats: BookingStatsType | null;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const {
        total_bookings = 0,
        total_approved = 0,
        total_pending = 0,
        total_rejected = 0,
        total_cancel = 0,
    } = stats || {};

    const statsData = [
        {
            label: "Total Events",
            value: total_bookings,
            icon: Calendar,
            bgClass: "bg-[#E3E8FF]",
            textClass: "text-[#33398A]",
            iconClass: "text-[#33398A]"
        },
        {
            label: "Total Approved",
            value: total_approved,
            icon: CalendarCheck,
            bgClass: "bg-[#D1FADF]",
            textClass: "text-[#027A48]",
            iconClass: "text-[#027A48]"
        },
        {
            label: "Total Pending",
            value: total_pending,
            icon: Clock,
            bgClass: "bg-[#FEF0C7]",
            textClass: "text-[#B54708]",
            iconClass: "text-[#B54708]"
        },
        {
            label: "Total Rejected",
            value: total_rejected,
            icon: XSquare,
            bgClass: "bg-red-100",
            textClass: "text-red-600",
            iconClass: "text-red-600"
        },
        {
            label: "Total Cancel",
            value: total_cancel,
            icon: Ban,
            bgClass: "bg-orange-100",
            textClass: "text-orange-600",
            iconClass: "text-orange-600"
        }

    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {statsData.map((stat, index) => (
                <div
                    key={index}
                    className={cn(
                        "rounded-[16px] p-6 flex items-center gap-5 shadow-sm transition-transform hover:scale-[1.02]",
                        stat.bgClass
                    )}
                >
                    <stat.icon className={cn("w-10 h-10", stat.iconClass)} strokeWidth={1.5} />
                    <div className="flex flex-col">
                        <span className={cn("text-3xl font-bold tracking-tight", stat.textClass)}>
                            {stat.value}
                        </span>
                        <span className={cn("text-base font-medium opacity-90", stat.textClass)}>
                            {stat.label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
