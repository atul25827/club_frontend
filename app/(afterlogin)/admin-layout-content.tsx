"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { usePathname } from "next/navigation";

export function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const getPageTitle = (path: string) => {
        if (path.includes("/dashboard")) return "Dashboard";
        // if (path.includes("/club-booking") && path.split("/").length > 3) return "Booking Details"; // /admin/bookings/123
        if (path.includes("/club-booking-list")) return "All Bookings";
        if (path.endsWith("/club-booking")) return "Create Booking"; // /admin/booking
        if (path.includes("/reports")) return "Reports";
        return "Dashboard";
    };

    const title = getPageTitle(pathname);

    return (
        <div className="flex h-screen overflow-hidden bg-[#F7F9FB]">
            <AdminSidebar />
            <div className="flex-1 flex flex-col ml-[100px] min-w-0 h-full">
                <AdminHeader title={title} />
                <main className="flex-1 p-4 bg-white overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
