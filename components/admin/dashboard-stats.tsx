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
            "grid gap-6 mb-8",
            "grid-cols-1 sm:grid-cols-2",
            cards.length <= 5 ? "lg:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-6"
        )}>
            {cards.map((card, index) => {
                const value = stats[card.key] ?? 0;
                return (
                    <div
                        key={index}
                        onClick={() => handleCardClick(card.filterValue)}
                        className={cn(
                            "rounded-[16px] p-4 flex items-center gap-5 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer",
                            card.bgClass
                        )}
                    >
                        <card.icon className={cn("w-8 h-8", card.iconClass)} strokeWidth={1.5} />
                        <div className="flex flex-col">
                            <span className={cn("text-2xl font-bold tracking-tight", card.textClass)}>
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
