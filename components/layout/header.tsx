"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, User, Menu, X, Calendar, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MerilLogo } from "@/components/meril-logo";
import { useState, useEffect } from "react";

export function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Navigation Items
    const navItems = [
        { name: "Home", href: "/", showAlways: true },
        { name: "Book", href: "/book", showAlways: true },
        { name: "Calendar", href: "/calendar", showAlways: true },
        { name: "My Bookings", href: "/my-bookings", protected: true },
        { name: "About Us", href: "/about", showAlways: true },
    ];

    const filteredNavItems = navItems.filter(item => {
        if (item.showAlways) return true;
        if (item.protected && isAuthenticated) return true;
        return false;
    });

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-xl shadow-sm"
                style={{ background: "linear-gradient(117deg, #EDEFEB 14.42%, #FAF1E4 46.63%, #DFECF3 87.02%)" }}
            >
                <div className="container flex h-20 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center gap-2 z-50">
                        <MerilLogo className="h-10 w-16" />
                    </Link>

                    {/* Center: Desktop Navigation (Pill Shape) */}
                    <nav className="hidden lg:flex items-center p-1.5 bg-white/50 border border-white/40 shadow-sm backdrop-blur-md rounded-[12px] absolute left-1/2 -translate-x-1/2">
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "relative px-5 py-2.5 text-sm font-medium rounded-[12px] transition-all duration-300",
                                        isActive
                                            ? "text-white"
                                            : "text-slate-600 hover:text-[#7D3FD0] hover:bg-slate-100/50"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-[#7D3FD0] rounded-[12px] shadow-md"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: Auth & Mobile Toggle */}
                    <div className="flex items-center gap-4 z-50">
                        {isAuthenticated ? (
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="flex items-center gap-2 pl-1 pr-4 py-1 bg-[#7D3FD0] rounded-[12px] text-white shadow-lg shadow-purple-900/20 hover:bg-[#6c35b5] transition-colors cursor-default">
                                    <div className="h-8 w-8 rounded-[12px] bg-white/20 flex items-center justify-center">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium pr-1">{user?.name || "User"}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={logout}
                                    className="cursor-pointer text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-[12px]"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <Link href="/login" className="hidden sm:block">
                                <Button className="cursor-pointer rounded-[12px] bg-[#7D3FD0] hover:bg-[#6c35b5] text-white px-6 shadow-lg shadow-purple-900/20">
                                    Login
                                </Button>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-slate-700"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden fixed top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-border shadow-xl z-40 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            {filteredNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-3 rounded-[12px] text-lg font-medium transition-colors",
                                        pathname === item.href
                                            ? "bg-[#7D3FD0]/10 text-[#7D3FD0]"
                                            : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="border-t border-slate-100 pt-4 mt-2">
                                {isAuthenticated ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 px-4 py-2">
                                            <div className="h-10 w-10 rounded-[12px] bg-[#7D3FD0]/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-[#7D3FD0]" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{user?.name}</p>
                                                <p className="text-sm text-slate-500">Player</p>
                                            </div>
                                        </div>
                                        <Button
                                            // variant="destructive"
                                            className=" cursor-pointer w-full bg-white border border-slate-200 text-red-500 hover:bg-red-50 rounded-[12px]"
                                            onClick={logout}
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <Link href="/login">
                                        <Button className=" cursor-pointer w-full bg-[#7D3FD0] hover:bg-[#6c35b5] text-white rounded-[12px] h-12 text-lg">
                                            Login
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
