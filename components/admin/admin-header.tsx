"use client";

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

interface AdminHeaderProps {
    title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
    const { user, logout } = useAuth();

    // Default to Admin User if no user in context (for dev/mock)
    const displayUser = user || { name: "", role: "" };

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 w-full shadow-md">
            <h1 className="text-[24px] font-semibold text-[#271E4A] font-poppins">{title}</h1>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-[#271E4A]">{displayUser.name}</p>
                    <p className="text-xs text-gray-500">{(Array.isArray(displayUser.role) ? displayUser.role : [displayUser.role || ""]).includes("Academy Admin") || (Array.isArray(displayUser.role) ? displayUser.role : [displayUser.role || ""]).includes("ACADEMY ADMIN") ? "Approver" : ""}</p>
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
                        {/* <DropdownMenuItem className="cursor-pointer">
                            <KeyRound className="mr-2 h-4 w-4" />
                            <span>Change Password</span>
                        </DropdownMenuItem> */}
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
