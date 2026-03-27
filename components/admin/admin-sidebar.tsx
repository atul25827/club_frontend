"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, Calendar, CheckSquare, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MerilLogo } from "../meril-logo";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
    },
    {
        title: "All Bookings",
        href: "/club-booking-list",
        icon: CheckSquare,
    },
    {
        title: "Booking",
        href: "/club-booking",
        icon: ClipboardList,
    },
    // {
    //     title: "Reports",
    //     href: "/calendar",
    //     icon: Calendar,
    // },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-[100px] bg-[#D4D1E8] flex flex-col items-center py-6 h-screen fixed left-0 top-0 z-50">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 z-50">
                <MerilLogo className="h-10 w-16" />
            </Link>

            {/* Navigation */}
            <nav className="flex-1 w-full flex flex-col gap-4 items-center pt-6">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-[12px] w-[70px] h-[70px] transition-all duration-200 group",
                                isActive
                                    ? "bg-white shadow-md text-[#33398A]"
                                    : "text-[#5A5A5A] hover:bg-white/50"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6 mb-1", isActive ? "text-[#33398A]" : "text-[#5A5A5A]")} />
                            <span className={cn("text-[10px] font-medium text-center leading-tight", isActive ? "text-[#33398A]" : "text-[#5A5A5A]")}>
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Password / Settings */}
            {/* <button
                className="flex flex-col items-center justify-center p-3 rounded-[12px] w-[70px] h-[70px] text-[#5A5A5A] hover:bg-white/50 transition-all duration-200 mt-auto"
            >
                <Lock className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-medium text-center leading-tight">Password</span>
            </button> */}
        </aside>
    );
}
