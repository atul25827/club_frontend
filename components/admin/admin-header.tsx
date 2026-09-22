"use client";
import React from "react";

import { useAuth } from "@/context/auth-context";
import { User, LogOut, KeyRound } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { LayoutGrid, ClipboardList, CheckSquare, Book, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NeedHelpModal } from "./need-help-modal";
import { MerilLogo } from "../meril-logo";

const sidebarItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { title: "All Bookings", href: "/club-booking-list", icon: CheckSquare },
    { title: "Booking", href: "/club-booking", icon: ClipboardList },
    { title: "Tutorial", href: "/tutorial", icon: Book },
];

import { useRouter } from "next/navigation";

interface AdminHeaderProps {
    title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Default to Admin User if no user in context (for dev/mock)
    const displayUser = user || { name: "", role: "" };

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 w-full shadow-md">
            <div className="flex items-center gap-3">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            <Menu className="w-6 h-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0 flex flex-col py-6 bg-[#0F1629] border-r-0 text-white">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        
                        {/* Logo */}
                        <div className="px-6 mb-8 pt-2">
                            <MerilLogo className="h-12 w-28" />
                        </div>

                        {/* <div className="px-6 mb-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Workspace</p>
                        </div> */}

                        {/* Navigation */}
                        <nav className="flex-1 w-full flex flex-col gap-2 px-4 overflow-y-auto">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm",
                                            isActive
                                                ? "bg-[#1E293B] text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                                        <span>{item.title}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Need Help Modal wrapper inside a dark block */}
                        <div className="px-4 mt-auto mb-4">
                            <div className="bg-[#1E293B] rounded-xl p-1">
                                <NeedHelpModal isMobile />
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#271E4A] font-poppins">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-[#271E4A]">{displayUser.name}</p>
                    <p className="text-xs text-gray-500">{(Array.isArray(displayUser.role) ? displayUser.role : [displayUser.role || ""]).includes("Club Admin") || (Array.isArray(displayUser.role) ? displayUser.role : [displayUser.role || ""]).includes("CLUB ADMIN") ? "Approver" : "Requestor"}</p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="h-10 w-10 cursor-pointer border border-gray-200">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-[#F2F4F7] text-[#475467] font-medium">
                                {displayUser.name?.[0] || ""}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/change-password")}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            <span>Change Password</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
