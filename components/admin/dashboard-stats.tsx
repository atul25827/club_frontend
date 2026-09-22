"use client";

import { BookingStatsType } from "@/types";
import { cn } from "@/lib/utils";
import { DashboardStatsCardConfig } from "@/app/(afterlogin)/dashboard/config";
import { useRouter } from "next/navigation";

interface DashboardStatsProps {
    stats: BookingStatsType | null;
    cards: DashboardStatsCardConfig[];
    viewAllHref?: string;
}

export function DashboardStats({ stats, cards, viewAllHref }: DashboardStatsProps) {
    const router = useRouter();

    if (!stats || !cards) return null;

    const handleCardClick = (filterValue?: string) => {
        if (!viewAllHref) return;
        if (filterValue && filterValue !== "all") {
            router.push(`${viewAllHref}?status=${filterValue}`);
        } else {
            router.push(viewAllHref);
        }
    };

    return (
        <div className={cn(
            "grid gap-4 mb-8",
            "grid-cols-2 lg:grid-cols-4"
        )}>
            {cards.map((card, index) => {
                const value = stats[card.key] ?? 0;
                return (
                    <div
                        key={index}
                        onClick={() => handleCardClick(card.filterValue)}
                        className={cn(
                            "bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3 shadow-sm transition-transform hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 cursor-pointer"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#475467]">
                                {card.label}
                            </span>
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", card.bgClass)}>
                                <card.icon className={cn("w-4 h-4", card.iconClass)} strokeWidth={2} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-bold text-[#101828] tracking-tight">
                                {value}
                            </span>
                            {/* {card.subText && (
                                <span className={cn("text-xs font-medium", card.subTextClass)}>
                                    {card.subText}
                                </span>
                            )} */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
