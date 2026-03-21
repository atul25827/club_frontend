"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar, MapPin } from "lucide-react";
import { useAcademy } from "@/context/academy-context";
import { useBookingExport } from "@/hooks/use-booking-export";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatBookingForExport } from "@/lib/excel-export";

export function MyBookingsList() {
    const router = useRouter();
    const { academies } = useAcademy();

    // State
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageLength] = useState(10); // Default per API

    // Filters State
    const [statusFilter, setStatusFilter] = useState("all");
    const [academyFilter, setAcademyFilter] = useState("all");
    const [hallFilter, setHallFilter] = useState("all");

    // Derived Hall Options based on Academy Selection
    const halls = useMemo(() => {
        if (academyFilter === "all") return [];
        const academy = academies.find(a => a.name === academyFilter || a.id === academyFilter);
        return academy ? (academy.halls || []) : [];
    }, [academyFilter, academies]);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getPaginatedBookings(
                currentPage,
                pageLength,
                {
                    academy: academyFilter,
                    hall: hallFilter,
                    status: statusFilter
                }
            );
            setBookings(data?.data);
            setTotalCount(data?.total_count);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageLength, academyFilter, hallFilter, statusFilter]);

    const { handleExport, isExporting } = useBookingExport(
        async (page, limit, filters) => {
            const data = await api.exportBookings(
                page,
                limit,
                filters
            );
            return { data: data?.data || [], total_count: data?.total_count || 0 };
        },
        formatBookingForExport,
        "Bookings"
    );

    // Initial Fetch & Refetch on changes
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [academyFilter, hallFilter, statusFilter]);

    const handleViewDetails = (bookingId: string) => {
        router.push(`/my-bookings/${bookingId}`);
    };

    const totalPages = Math.ceil(totalCount / pageLength);
    return (
        <div className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(131,131,131,0.64)] p-6 md:p-8 ">

            {/* Top Filters & Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[140px] h-[44px] rounded-[6px] border-[#BEBEBE] text-[#8E8787]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Academy Filter */}
                    <Select value={academyFilter} onValueChange={(val) => { setAcademyFilter(val); setHallFilter("all"); }}>
                        <SelectTrigger className="w-full md:w-[180px] h-[44px] rounded-[6px] border-[#BEBEBE] text-[#8E8787]">
                            <SelectValue placeholder="Select Academy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Academies</SelectItem>
                            {academies.map((ac) => (
                                <SelectItem key={ac.id} value={ac.id}>{ac.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Hall Filter */}
                    <Select value={hallFilter} onValueChange={setHallFilter} disabled={academyFilter === "all"}>
                        <SelectTrigger className="w-full md:w-[220px] h-[44px] rounded-[6px] border-[#BEBEBE] text-[#8E8787]">
                            <SelectValue placeholder="Select Conference & Hall" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Halls</SelectItem>
                            {halls.map((h) => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    variant="outline"
                    className="w-full md:w-auto h-[44px] px-6 rounded-[6px] border-[#B4B4B4] text-[#271E4A] hover:bg-slate-50"
                    onClick={() => handleExport({
                        academy: academyFilter,
                        hall: hallFilter,
                        status: statusFilter
                    })}
                    disabled={isExporting}
                >
                    {isExporting ? "Exporting..." : "Export"}
                </Button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg overflow-hidden border border-[#EAECF0]">
                <Table>
                    <TableHeader className="bg-[#F7F9FC]">
                        <TableRow className="border-b border-[#EAECF0] hover:bg-[#F7F9FC] text-nowrap">
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Booking ID</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Academy</TableHead>
                            {/* <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Hall</TableHead> */}
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Full Name</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Event Start Date</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Event Start End</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Training/Event Title</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm text-left">Status</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm text-left">Booking Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">Loading bookings...</TableCell>
                            </TableRow>
                        ) : bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    No bookings found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => (
                                <TableRow key={booking?.booking_id} className="border-b border-[#EAECF0] hover:bg-slate-50 text-nowrap">
                                    <TableCell className="py-4 text-[#344054] font-medium text-sm">
                                        <button onClick={() => handleViewDetails(booking?.booking_id)} className="text-[#6941C6] hover:underline cursor-pointer">
                                            #{booking?.booking_id.toUpperCase()}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.academy}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.full_name || "N/A"}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.event_start_date}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.event_end_date}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.event_title || "N/A"}</TableCell>
                                    <TableCell className="py-4 text-left">
                                        <StatusBadge status={booking.event_status || "Pending"} />
                                    </TableCell>
                                    <TableCell className="py-4 text-left">
                                        {booking.booking_status}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-600 text-sm">Recent Bookings</h3>
                    <span className="text-xs text-slate-500">{bookings.length} of {totalCount}</span>
                </div>
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No bookings found.</div>
                ) : (
                    bookings?.map((booking) => (
                        <div key={booking.booking_id} onClick={() => handleViewDetails(booking.booking_id)} className="bg-white border border-[#e5e7eb] rounded-[14px] p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <span className="font-medium text-[#6941C6] text-sm">#{booking?.booking_id?.toUpperCase()}</span>
                                <StatusBadge status={booking.event_status || "Pending"} />
                            </div>
                            <h4 className="font-medium text-[#101828] text-base mb-4 line-clamp-2">
                                {booking.event_title || "Untitled Event"}
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-[#4a5565]">
                                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <MapPin className="h-3 w-3 text-slate-500" />
                                    </div>
                                    <span>{booking.academy}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#4a5565]">
                                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <Calendar className="h-3 w-3 text-slate-500" />
                                    </div>
                                    <span>{booking.event_start_date}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {/* Simplified Pagination: Show current range or simple steps */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)) // Show subset
                                .map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            isActive={currentPage === page}
                                            onClick={() => setCurrentPage(page)}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
