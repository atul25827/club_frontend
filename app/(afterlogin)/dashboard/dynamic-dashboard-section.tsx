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
import { Plus } from "lucide-react";

interface DynamicDashboardSectionProps {
    definition: DashboardDefinition;
}

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
                    <h2 className="text-[24px] font-medium text-[#271E4A] font-poppins">{definition.listTitle}</h2>
                    <div className="flex items-center gap-4">
                        <Link href={definition.viewAllHref}>
                            <Button variant="outline" className=" cursor-pointer bg-[#EDF2FA] text-[#271E4A] border-none hover:bg-slate-200">
                                View List
                            </Button>
                        </Link>
                        <Link href="/club-booking">
                            <Button className="w-full md:w-auto  rounded-[8px] bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white font-bold gap-2 px-4 shadow-lg shadow-purple-100 transition-all active:scale-95">
                                <Plus className="h-5 w-5" />
                                New Booking
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-[#E0E0E0]">
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
