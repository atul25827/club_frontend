"use client";

import { useEffect, useState } from "react";
import { BookingStatsType } from "@/types";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { DashboardDefinition } from "./config";
import { Plus, Calendar } from "lucide-react";

interface DynamicDashboardSectionProps {
    definition: DashboardDefinition;
}

const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "-";
    const dateStr = dateString.split(" ")[0];
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    } catch {
        return dateString;
    }
};

export function DynamicDashboardSection({ definition }: DynamicDashboardSectionProps) {
    const [bookings, setBookings] = useState<any[]>([]);
    const [stats, setStats] = useState<BookingStatsType | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, bookingsData] = await Promise.all([
                    definition.getStats(),
                    definition.getList(1, 5)
                ]);
                setStats(statsData);
                setBookings(bookingsData.data);
            } catch (error) {
                console.error(`Failed to fetch dashboard data for ${definition.id}`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [definition]);

    const handleViewDetails = (row: any) => {
        const id = row.booking_id || row.name || row.club_booking_id;
        if (definition.id.includes("club")) {
            router.push(`/club-booking-list/${id}`);
        } else {
            router.push(`/bookings/${id}`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 mb-12">
            {/* <h2 className="text-[28px] font-semibold text-[#271E4A] font-poppins">{definition.title}</h2> */}

            {/* Stats Section */}
            <DashboardStats stats={stats} cards={definition.statsCards} viewAllHref={definition.viewAllHref} />

            {/* Recent Bookings Section */}
            <div className="">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[16px] sm:text-[24px] font-medium text-[#271E4A] font-poppins">{definition.listTitle}</h2>
                    <div className="flex items-center gap-4">
                        <Link href={definition.viewAllHref}>
                            <Button variant="outline" className="cursor-pointer bg-white text-[#5C5CFF] border-[#5C5CFF] hover:bg-[#5C5CFF]/10 font-medium px-2 sm:px-5 h-8 sm:h-11 rounded-xl transition-all">
                                View List <span className="ml-1">→</span>
                            </Button>
                        </Link>
                        <Link href="/club-booking" className="hidden md:block">
                            <Button className="w-full md:w-auto rounded-xl bg-[#5C5CFF] hover:bg-[#4d4dec] text-white font-medium h-11 px-6 shadow-sm transition-all active:scale-95">
                                New Booking
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden flex flex-col gap-4">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : bookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl border-gray-200 bg-gray-50/50">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                                <Calendar className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">No bookings found.</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">Your recent club bookings will appear here.</p>
                        </div>
                    ) : (
                        bookings.map((booking, idx) => (
                            <div key={idx} onClick={() => handleViewDetails(booking)} className="bg-white rounded-[12px] border border-[#EAECF0] p-5 shadow-sm flex flex-col gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-[#101828] text-[15px]">
                                        {booking.booking_id?.toUpperCase() || booking.club_booking_id?.toUpperCase() || booking.name?.toUpperCase()}
                                    </div>
                                    {definition.columns.find(c => c.key.includes('status')) && (
                                        <StatusBadge status={booking.booking_status || booking.status || booking.approval_status || "-"} />
                                    )}
                                </div>
                                <div className="font-bold text-[#101828] text-[15px] mb-1">
                                    {booking.event_name || booking.name || "Untitled Event"}
                                </div>
                                <div className="w-full h-px bg-[#EAECF0]" />
                                <div className="flex flex-col gap-2 mt-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[#667085]">Dates</span>
                                        <span className="font-medium text-[#101828]">
                                            {formatDisplayDate(booking.from_date)} - {formatDisplayDate(booking.to_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[#667085]">Created By</span>
                                        <span className="font-medium text-[#101828]">{booking.full_name || booking.owner || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    <Link href={definition.viewAllHref} className="mt-2 block w-full">
                        <Button variant="outline" className="w-full h-12 text-[#5C5CFF] border-[#5C5CFF] bg-white hover:bg-[#5C5CFF]/10 rounded-xl font-medium transition-all">
                            View List <span className="ml-1">→</span>
                        </Button>
                    </Link>

                    <Link href="/club-booking" className="mt-1 block w-full">
                        <Button className="w-full h-12 rounded-xl bg-[#5C5CFF] hover:bg-[#4d4dec] text-white font-medium text-base shadow-sm transition-all">
                            New Booking
                        </Button>
                    </Link>
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block rounded-lg overflow-hidden border border-[#E0E0E0]">
                    <Table>
                        <TableHeader className="bg-[#EDF4FC]">
                            <TableRow className="border-none hover:bg-[#EDF4FC]">
                                {definition.columns.map((col, idx) => (
                                    <TableHead key={idx} className="py-4 font-normal text-[#5A5A5A] text-sm whitespace-nowrap">
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={definition.columns.length} className="h-24 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : bookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={definition.columns.length} className="h-24 text-center text-muted-foreground">No bookings found.</TableCell>
                                </TableRow>
                            ) : (
                                bookings.map((booking, rowIdx) => (
                                    <TableRow
                                        key={rowIdx}
                                        className="border-b border-gray-100 hover:bg-slate-50"
                                    >
                                        {definition.columns.map((col, colIdx) => {
                                            const value = booking[col.key];
                                            return (
                                                <TableCell key={colIdx} className="py-4 text-[#101828] text-sm">
                                                    {col.render ? (
                                                        col.render(booking, handleViewDetails)
                                                    ) : col.key.includes('status') ? (
                                                        <StatusBadge status={value || "-"} />
                                                    ) : (
                                                        value || "-"
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
