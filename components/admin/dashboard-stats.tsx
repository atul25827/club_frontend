"use client";

import { BookingStatsType } from "@/types";
import { cn } from "@/lib/utils";
import { DashboardStatsCardConfig } from "@/app/(afterlogin)/dashboard/config";

interface DashboardStatsProps {
    stats: BookingStatsType | null;
    cards: DashboardStatsCardConfig[];
}

export function DashboardStats({ stats, cards }: DashboardStatsProps) {
    if (!stats || !cards) return null;

    return (
        <div className={cn(
            "grid gap-6 mb-8",
            "grid-cols-1 sm:grid-cols-2",
            cards.length <= 5 ? "lg:grid-cols-5" : "lg:grid-cols-3 xl:grid-cols-6"
        )}>
            {cards.map((card, index) => {
                const value = stats[card.key] ?? 0;
                return (
                    <div
                        key={index}
                        className={cn(
                            "rounded-[16px] p-6 flex items-center gap-5 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer",
                            card.bgClass
                        )}
                    >
                        <card.icon className={cn("w-10 h-10", card.iconClass)} strokeWidth={1.5} />
                        <div className="flex flex-col">
                            <span className={cn("text-3xl font-bold tracking-tight", card.textClass)}>
                                {value}
                            </span>
                            <span className={cn("text-base font-medium opacity-90", card.textClass)}>
                                {card.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
