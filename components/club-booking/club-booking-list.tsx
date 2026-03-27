"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search, Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListDefinition } from "@/app/(afterlogin)/dashboard/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface ClubBookingListProps {
    config: ListDefinition;
    onViewDetails: (booking: any) => void;
}

export function ClubBookingList({ config, onViewDetails }: ClubBookingListProps) {
    // State
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await config.getList(
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
    }, [currentPage, itemsPerPage, statusFilter, searchTerm, config]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchBookings]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="">
            {/* <h2 className="text-2xl font-bold text-[#271E4A] mb-6">{config.title}</h2> */}

            {/* Top Filters & Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by Event Name"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-10 h-[44px] rounded-[8px] border-[#D0D5DD]"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[200px] h-[44px] rounded-[8px] border-[#D0D5DD] text-[#667085]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="Awaiting">Awaiting Approval</SelectItem>
                        </SelectContent>
                    </Select>

                    <Link href="/club-booking">
                        <Button className="w-full md:w-auto h-[44px] rounded-[8px] bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white font-bold gap-2 px-6 shadow-lg shadow-purple-100 transition-all active:scale-95">
                            <Plus className="h-5 w-5" />
                            Create New Booking
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl overflow-hidden border border-[#EAECF0]">
                <Table>
                    <TableHeader className="bg-[#F9FAFB]">
                        <TableRow className="border-b border-[#EAECF0] hover:bg-[#F9FAFB]">
                            {config.columns.map((col, idx) => (
                                <TableHead key={idx} className="py-4 font-semibold text-[#475467] text-sm px-4">
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={config.columns.length} className="h-32 text-center text-[#667085]">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-[#33398A] border-t-transparent rounded-full animate-spin" />
                                        Loading bookings...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={config.columns.length} className="h-32 text-center text-[#667085]">
                                    No bookings found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking, rowIdx) => (
                                <TableRow key={rowIdx} className="border-b border-[#EAECF0] hover:bg-[#F9FAFB] transition-colors">
                                    {config.columns.map((col, colIdx) => {
                                        const value = booking[col.key];
                                        return (
                                            <TableCell key={colIdx} className="py-4 text-[#344054] text-sm px-4">
                                                {col.render ? (
                                                    col.render(booking, onViewDetails)
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-[#667085]">Loading...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12 text-[#667085]">No bookings found.</div>
                ) : (
                    bookings.map((booking, idx) => (
                        <div key={idx} onClick={() => onViewDetails(booking)} className="bg-white border border-[#EAECF0] rounded-[16px] p-5 shadow-sm active:scale-[0.98] transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <span className="font-bold text-[#33398A] text-sm bg-[#EEF2FF] px-2.5 py-1 rounded-md">
                                    #{booking[config.mobileFields.idKey]?.toUpperCase() || booking.name}
                                </span>
                                <StatusBadge status={booking.booking_status || "-"} />
                            </div>
                            <h4 className="font-bold text-[#101828] text-lg mb-4 line-clamp-2 leading-tight">
                                {booking[config.mobileFields.titleKey] || "Untitled Event"}
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-[#475467]">
                                    <div className="h-6 w-6 rounded-full bg-[#F2F4F7] flex items-center justify-center shrink-0">
                                        <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                                    </div>
                                    <span className="font-medium">{booking[config.mobileFields.subtitleKey1] || "-"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#475467]">
                                    <div className="h-6 w-6 rounded-full bg-[#F2F4F7] flex items-center justify-center shrink-0">
                                        <Calendar className="h-3.5 w-3.5 text-[#667085]" />
                                    </div>
                                    <span className="font-medium">{booking[config.mobileFields.subtitleKey2]}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-8 border-t border-[#EAECF0] pt-6">
                    <Pagination>
                        <PaginationContent className="w-full justify-between">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className={cn("cursor-pointer border border-[#D0D5DD] rounded-lg h-9 px-3 text-sm font-semibold text-[#344054]", currentPage === 1 && "pointer-events-none opacity-50")}
                                />
                            </PaginationItem>

                            <div className="hidden sm:flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                                    .map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                isActive={currentPage === page}
                                                onClick={() => setCurrentPage(page)}
                                                className={cn(
                                                    "cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors",
                                                    currentPage === page
                                                        ? "bg-[#F9F5FF] text-[#33398A]"
                                                        : "text-[#667085] hover:bg-gray-50"
                                                )}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                            </div>

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className={cn("cursor-pointer border border-[#D0D5DD] rounded-lg h-9 px-3 text-sm font-semibold text-[#344054]", currentPage === totalPages && "pointer-events-none opacity-50")}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
