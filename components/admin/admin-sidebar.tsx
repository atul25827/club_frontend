import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, Calendar, CheckSquare, Book, ChevronDown, ChevronUp, User, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MerilLogo } from "../meril-logo";
import { NeedHelpModal } from "./need-help-modal";

type SidebarItem = {
    title: string;
    href?: string;
    icon: any;
    subItems?: { title: string; href: string; icon: any }[];
};

const sidebarItems: SidebarItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
    },
    // {
    //     title: "Bookings",
    //     icon: Calendar,
    //     subItems: [
    //         { title: "All Booking", href: "/club-booking-list", icon: CheckSquare },
    //         { title: "Create Booking", href: "/club-booking", icon: Plus },
    //     ]
    // },
    { title: "All Booking", href: "/club-booking-list", icon: CheckSquare },
    { title: "Create Booking", href: "/club-booking", icon: Plus },
    {
        title: "Tutorial",
        icon: Book,
        href: "/tutorial",
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<string[]>(["Bookings"]);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleMenu = (title: string) => {
        setOpenMenus(prev => prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]);
    };

    return (
        <aside className={cn(
            "bg-[#0F1629] hidden lg:flex flex-col py-6 h-screen relative shrink-0 z-50 text-white transition-all duration-300",
            isCollapsed ? "w-[100px]" : "w-[260px]"
        )}>
            {/* Logo */}
            <div className={cn("mb-8 pt-2 flex items-center h-[48px]", isCollapsed ? "px-1 justify-center" : "px-6 justify-start")}>
                <MerilLogo className={isCollapsed ? "h-10 w-[64px]" : "h-12 w-28"} />
            </div>

            {/* Navigation */}
            <nav className={cn("flex-1 w-full flex flex-col gap-2 overflow-y-auto", isCollapsed ? "px-2" : "px-4")}>
                {sidebarItems.map((item) => {
                    if (!item) return null;
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isActive = pathname === item.href || (item.href && pathname.startsWith(item.href + "/"));
                    const isAnySubActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"));
                    const isOpen = openMenus.includes(item.title);

                    return (
                        <div key={item.title} className="flex flex-col gap-1">
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex transition-all duration-200 group font-medium border border-transparent outline-none",
                                        isCollapsed
                                            ? "flex-col items-center justify-center gap-1.5 py-3 rounded-[16px] text-center"
                                            : "flex-row items-center gap-3 px-4 py-3 rounded-xl w-full",
                                        isActive
                                            ? "bg-[#1E293B] text-white"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn(
                                        isCollapsed ? "h-6 w-6" : "h-5 w-5",
                                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                                    )} />
                                    <span className={cn(
                                        isCollapsed ? "text-[10px] tracking-wide" : "text-sm"
                                    )}>{item.title}</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => !isCollapsed && toggleMenu(item.title)}
                                    className={cn(
                                        "flex transition-all duration-200 group font-medium border border-transparent outline-none",
                                        isCollapsed
                                            ? "flex-col items-center justify-center gap-1.5 py-3 rounded-[16px] text-center w-full"
                                            : "flex-row items-center justify-between px-4 py-3 rounded-xl w-full",
                                        isAnySubActive && !isOpen && !isCollapsed ? "bg-white/5 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <div className={cn("flex items-center", isCollapsed ? "flex-col gap-1.5" : "flex-row gap-3")}>
                                        <item.icon className={cn(
                                            isCollapsed ? "h-6 w-6" : "h-5 w-5",
                                            isAnySubActive && !isOpen ? "text-white" : "text-gray-400 group-hover:text-white"
                                        )} />
                                        <span className={cn(isCollapsed ? "text-[10px] tracking-wide" : "text-sm")}>{item.title}</span>
                                    </div>
                                    {!isCollapsed && (isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </button>
                            )}

                            {hasSubItems && isOpen && !isCollapsed && (
                                <div className="flex flex-col gap-1 ml-4 mt-1 border-l border-gray-800 pl-4">
                                    {item.subItems!.map(sub => {
                                        const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                                        return (
                                            <Link
                                                key={sub.title}
                                                href={sub.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm",
                                                    isSubActive
                                                        ? "bg-[#1E293B] text-white"
                                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <sub.icon className={cn("h-[18px] w-[18px]", isSubActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                                                <span>{sub.title}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Need Help Modal and Toggle */}
            <div className={cn("mt-auto mb-4 flex flex-col gap-6 w-full", isCollapsed ? "px-2 items-center" : "px-4")}>
                <div className={cn(
                    "bg-[#1E293B] rounded-xl w-full",
                    isCollapsed ? "p-1 [&_span]:hidden [&_button]:px-0 [&_button]:justify-center [&_svg]:mx-auto" : "p-1"
                )}>
                    <NeedHelpModal isMobile />
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "flex items-center transition-all duration-200 group border border-transparent outline-none",
                        isCollapsed
                            ? "w-[38px] h-[38px] rounded-xl bg-white/5 justify-center hover:bg-white/10"
                            : "h-[38px] px-3.5 rounded-xl bg-white/5 hover:bg-white/10 gap-2 w-full"
                    )}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white" />
                            <span className="text-[13px] font-medium text-gray-400 group-hover:text-white">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
