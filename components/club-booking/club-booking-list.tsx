"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search } from "lucide-react";
import { api } from "@/services/api";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface ClubBookingListItem {
    name: string;
    club_booking_id: string;
    event_name: string;
    from_date: string;
    to_date: string;
    booking_status: string;
    approval_status: string | null;
    guest_region: string;
    creation: string;
    owner: string;
    full_name: string;
    is_submitted: boolean;
}

interface ClubBookingListProps {
    onViewDetails: (booking: ClubBookingListItem) => void;
}

export function ClubBookingList({ onViewDetails }: ClubBookingListProps) {
    // State
    const [bookings, setBookings] = useState<ClubBookingListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Default per request

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getClubBookingList(
                currentPage,
                itemsPerPage,
                {
                    status: statusFilter,
                    search_name: searchTerm
                }
            );
            setBookings(response.data);
            setTotalCount(response.total_count);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, statusFilter, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 300); // 300ms debounce for search/filter inputs
        return () => clearTimeout(timer);
    }, [fetchBookings]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="bg-white rounded-[24px]">
            {/* Top Filters & Actions */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by Event Name"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="pl-10 h-[44px] rounded-[6px] border-[#BEBEBE]"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-full md:w-[200px] h-[44px] rounded-[6px] border-[#BEBEBE] text-[#8E8787]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Submitted">Submitted</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg overflow-hidden border border-[#EAECF0]">
                <Table>
                    <TableHeader className="bg-[#F7F9FC]">
                        <TableRow className="border-b border-[#EAECF0] hover:bg-[#F7F9FC] text-nowrap">
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Booking ID</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Guest Region</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Requester Name</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Event Title</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Start Date</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">End Date</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm text-left">Booking Status</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm text-left">Approval Status</TableHead>
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
                                <TableRow key={booking.name} className="border-b border-[#EAECF0] hover:bg-slate-50 text-nowrap">
                                    <TableCell className="py-4 text-[#344054] font-medium text-sm">
                                        <button onClick={() => onViewDetails(booking)} className="text-[#6941C6] hover:underline cursor-pointer">
                                            #{booking.club_booking_id.toUpperCase()}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.guest_region || "-"}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.full_name || "-"}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.event_name || "-"}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.from_date}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.to_date}</TableCell>
                                    <TableCell className="py-4 text-left">
                                        <StatusBadge status={booking.booking_status || "Pending"} />
                                    </TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking?.approval_status || "-"}</TableCell>
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
                    <span className="text-xs text-slate-500">{bookings.length} showing</span>
                </div>
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No bookings found.</div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.name} onClick={() => onViewDetails(booking)} className="bg-white border border-[#e5e7eb] rounded-[14px] p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <span className="font-medium text-[#6941C6] text-sm">#{booking.club_booking_id.toUpperCase()}</span>
                                <StatusBadge status={booking.booking_status || "Pending"} />
                            </div>
                            <h4 className="font-medium text-[#101828] text-base mb-4 line-clamp-2">
                                {booking.event_name || "Untitled Event"}
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-[#4a5565]">
                                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <MapPin className="h-3 w-3 text-slate-500" />
                                    </div>
                                    <span>{booking.guest_region || "-"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#4a5565]">
                                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <Calendar className="h-3 w-3 text-slate-500" />
                                    </div>
                                    <span>{booking.from_date}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {/* {totalPages > 1 && ( */}
            <div className="mt-6">
                <Pagination className="flex justify-end">
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
            {/* )} */}
        </div>
    );
}
