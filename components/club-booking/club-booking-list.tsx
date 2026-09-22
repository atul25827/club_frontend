"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search, Plus, Download, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListDefinition } from "@/app/(afterlogin)/dashboard/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBookingExport } from "@/hooks/use-booking-export";
import { formatClubBookingForExport } from "@/lib/excel-export";
import { api } from "@/services/api";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

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

interface ClubBookingListProps {
    config: ListDefinition;
    onViewDetails: (booking: any) => void;
}

export function ClubBookingList({ config, onViewDetails }: ClubBookingListProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState(searchParams?.get("status") || "all");

    // Export
    const { handleExport, isExporting } = useBookingExport(
        async (_page, _limit, filters) => {
            const result = await api.exportClubBookings(filters);
            return { data: result?.data || [], total_count: result?.total_count || 0 };
        },
        formatClubBookingForExport,
        "Club_Bookings"
    );

    // Sync searchParams to state if it changes
    useEffect(() => {
        const status = searchParams?.get("status");
        if (status && status !== statusFilter) {
            setStatusFilter(status);
            setCurrentPage(1);
        }
    }, [searchParams]);

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        setCurrentPage(1);
        if (searchParams) {
            const params = new URLSearchParams(searchParams.toString());
            if (val === 'all') {
                params.delete('status');
            } else {
                params.set('status', val);
            }
            router.replace(`?${params.toString()}`);
        }
    };

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
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
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

                    <Button
                        variant="outline"
                        onClick={() => handleExport({ status: statusFilter, search_name: searchTerm })}
                        disabled={isExporting}
                        className="w-full md:w-auto h-[44px] rounded-[8px] border-[#D0D5DD] text-[#344054] font-bold gap-2 px-5 transition-all active:scale-95 cursor-pointer"
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>

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
                                            <TableCell key={colIdx} className="py-4 text-[#344054] text-sm px-4 text-nowrap">
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
                        <div key={idx} onClick={() => onViewDetails(booking)} className="bg-white border border-[#EAECF0] rounded-[12px] p-5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="font-bold text-[#101828] text-[15px]">
                                    {booking[config.mobileFields.idKey]?.toUpperCase() || booking.name?.toUpperCase()}
                                </div>
                                <StatusBadge status={booking.booking_status || "-"} />
                            </div>
                            <div className="font-bold text-[#101828] text-[15px] mb-1">
                                {booking[config.mobileFields.titleKey] || "Untitled Event"}
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
                                    <span className="font-medium text-[#101828]">
                                        {booking.full_name || booking.owner || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages >= 1 && (
                <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500 font-medium">
                        Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} records
                    </div>
                    {totalPages > 1 && (
                        <Pagination className="justify-end w-auto mx-0">
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
                    )}
                </div>
            )}
        </div>
    );
}
