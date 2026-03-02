"use client";

import { useEffect, useState, useCallback } from "react";
import { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search } from "lucide-react"; // Added Search icon
import { useAcademy } from "@/context/academy-context";
import { api } from "@/lib/api";
import { useBookingExport } from "@/hooks/use-booking-export";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatBookingForExport } from "@/lib/excel-export";

interface BookingListProps {
    onViewDetails: (id: string) => void;
}

export function BookingList({ onViewDetails }: BookingListProps) {
    const { academies } = useAcademy();

    // State
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Default per request

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [academyFilter, setAcademyFilter] = useState("all");
    const [hallFilter, setHallFilter] = useState("all");

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getApproverBookingList(
                currentPage,
                itemsPerPage,
                {
                    status: statusFilter,
                    academy: academyFilter,
                    hall: hallFilter,
                    search: searchTerm
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
    }, [currentPage, itemsPerPage, statusFilter, academyFilter, hallFilter, searchTerm]);

    const { handleExport, isExporting } = useBookingExport(
        async (page, limit, filters) => {
            const response = await api.exportBookings(
                page,
                limit,
                filters
            );
            return { data: response.data, total_count: response.total_count };
        },
        formatBookingForExport,
        "Bookings"
    );


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 300); // 300ms debounce for search/filter inputs if they change rapidly
        return () => clearTimeout(timer);
    }, [fetchBookings]);

    // Derived State for Halls based on selected academy
    const availableHalls = academyFilter !== "all"
        ? academies.find(a => a.id === academyFilter)?.halls || []
        : [];

    const totalPages = Math.ceil(totalCount / itemsPerPage);


    return (
        <div className="bg-white rounded-[24px] shadow-[0px_4px_15px_0px_rgba(131,131,131,0.64)] p-6 md:p-8 ">
            {/* Top Filters & Actions */}
            <div className="flex flex-col gap-6 mb-8">
                {/* <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by ID, Title or Organizer"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="pl-10 h-[44px] rounded-[6px] border-[#BEBEBE]"
                        />
                    </div>
                </div> */}

                <div className="flex flex-col md:flex-row gap-4 w-full">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[200px] h-[44px] rounded-[6px] border-[#BEBEBE] text-[#8E8787]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Awaiting">Awaiting Approval</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Academy Filter */}
                    <Select value={academyFilter} onValueChange={(val) => { setAcademyFilter(val); setHallFilter("all"); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[240px] h-[44px] rounded-[6px] border-[#BEBEBE] text-[#8E8787]">
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
                    <Select value={hallFilter} onValueChange={(val) => { setHallFilter(val); setCurrentPage(1); }} disabled={academyFilter === "all"}>
                        <SelectTrigger className="w-full md:w-[240px] h-[44px] rounded-[6px] border-[#BEBEBE] text-[#8E8787]">
                            <SelectValue placeholder="Select Conference & Hall" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Halls</SelectItem>
                            {availableHalls.map((h) => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        className="w-full md:w-auto h-[44px] px-6 rounded-[6px] border-[#B4B4B4] text-[#271E4A] hover:bg-slate-50"
                        onClick={() => handleExport({
                            status: statusFilter,
                            academy: academyFilter,
                            hall: hallFilter,
                            search: searchTerm
                        })}
                        disabled={isExporting}
                    >
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg overflow-hidden border border-[#EAECF0]">
                <Table>
                    <TableHeader className="bg-[#F7F9FC]">
                        <TableRow className="border-b border-[#EAECF0] hover:bg-[#F7F9FC] text-nowrap">
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Booking ID</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Academy</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Full Name</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Event Start Date</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Event Start End</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm">Training/Event Title</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm text-left">Status</TableHead>
                            <TableHead className="py-4 font-medium text-[#271E4A] text-sm text-left">Current Status</TableHead>
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
                                <TableRow key={booking.booking_id} className="border-b border-[#EAECF0] hover:bg-slate-50 text-nowrap">
                                    <TableCell className="py-4 text-[#344054] font-medium text-sm">
                                        <button onClick={() => onViewDetails(booking.booking_id)} className="text-[#6941C6] hover:underline cursor-pointer">
                                            #{booking.booking_id.toUpperCase()}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.academy || "N/A"}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.full_name || "N/A"}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.event_start_date}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.event_end_date}</TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking.event_title || "N/A"}</TableCell>
                                    <TableCell className="py-4 text-left">
                                        <StatusBadge status={booking.event_status || "Pending"} />
                                    </TableCell>
                                    <TableCell className="py-4 text-[#101828] font-normal text-sm">{booking?.overall_status || "N/A"}</TableCell>
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
                        <div key={booking.booking_id} onClick={() => onViewDetails(booking.booking_id)} className="bg-white border border-[#e5e7eb] rounded-[14px] p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <span className="font-medium text-[#6941C6] text-sm">#{booking.booking_id.toUpperCase()}</span>
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
                                    <span>{booking.academy || "N/A"}</span>
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

            <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-slate-500">
                    Page {currentPage} of {Math.max(1, totalPages)}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages || loading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
