"use client";

import { useEffect, useState } from "react";
import { api } from "@/api/api";
import { Booking, BookingStatsType } from "@/types";
import { DashboardStats } from "@/components/admin/dashboard-stats";
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

export default function AdminDashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStatsType | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, bookingsData] = await Promise.all([
                    api.getApproverStats(),
                    api.getApproverBookingList(1, 5)
                ]);
                setStats(statsData);
                setBookings(bookingsData.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleViewDetails = (id: string) => {
        router.push(`/bookings/${id}`);
    };
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Section */}
            <DashboardStats stats={stats} />

            {/* Recent Bookings Section */}
            <div className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(216,210,252,0.64)] p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[24px] font-medium text-[#271E4A] font-poppins">Your Booking</h2>
                    <Link href="/bookings">
                        <Button variant="outline" className="bg-[#EDF2FA] text-[#271E4A] border-none hover:bg-slate-200">
                            View List
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#EDF4FC]">
                            <TableRow className="border-none hover:bg-[#EDF4FC]">
                                <TableHead className="py-4 font-normal text-[#5A5A5A] text-sm">Booking ID</TableHead>
                                <TableHead className="py-4 font-normal text-[#5A5A5A] text-sm">Academy</TableHead>
                                <TableHead className="py-4 font-normal text-[#5A5A5A] text-sm">Full Name</TableHead>
                                <TableHead className="py-4 font-normal text-[#5A5A5A] text-sm">Event Start Date</TableHead>
                                <TableHead className="py-4 font-normal text-[#5A5A5A] text-sm">Event Start End</TableHead>
                                <TableHead className="py-4 font-normal text-[#5A5A5A] text-sm">Training/Event Title</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : bookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No bookings found.</TableCell>
                                </TableRow>
                            ) : (
                                bookings.map((booking) => (
                                    <TableRow
                                        key={booking?.booking_id}
                                        className="border-b border-gray-100 hover:bg-slate-50 cursor-pointer"
                                        onClick={() => handleViewDetails(booking.booking_id)}
                                    >
                                        <TableCell className="py-4 font-medium text-[#101828] text-sm">{booking.booking_id}</TableCell>
                                        <TableCell className="py-4 text-[#101828] text-sm">{booking.academy || "N/A"}</TableCell>
                                        <TableCell className="py-4 text-[#33398A] font-medium text-sm">{booking.full_name || "N/A"}</TableCell>
                                        <TableCell className="py-4 text-[#101828] text-sm">{booking.event_start_date}</TableCell>
                                        <TableCell className="py-4 text-[#101828] text-sm">{booking.event_end_date}</TableCell>
                                        <TableCell className="py-4 text-[#101828] text-sm">{booking.event_title}</TableCell>
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
