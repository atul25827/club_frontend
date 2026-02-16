"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, startOfWeek, endOfWeek, getYear, setMonth, setYear, getMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAcademy } from "@/context/academy-context";
import { api } from "@/lib/api";
import { type Booking } from "@/types";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Generate years for dropdown (e.g., current year - 5 to current year + 5)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

interface CalendarViewProps {
    onEventClick?: (bookingId: string) => void;
}

export default function CalendarView({ onEventClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);

    const { academies } = useAcademy();

    // Selection state
    const [selectedAcademy, setSelectedAcademy] = useState<string>("");
    const [selectedHall, setSelectedHall] = useState<string>("");

    const [loading, setLoading] = useState(false);

    // Derived halls based on context data
    const allHalls = academies.flatMap(a => a.halls || []).map(h => ({ ...h, academyId: academies.find(a => a.halls?.some(hall => hall.id === h.id))?.id }));

    // Filter halls when academy changes
    const filteredHalls = (selectedAcademy !== "all" && selectedAcademy !== "")
        ? (academies.find(a => a.id === selectedAcademy)?.halls || [])
        : allHalls;

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const start = startOfMonth(currentDate).toISOString();
                const end = endOfMonth(currentDate).toISOString();
                const data = await api.getCalendarBookings(
                    format(startOfMonth(currentDate), "yyyy-MM-dd"),
                    format(endOfMonth(currentDate), "yyyy-MM-dd"),
                    selectedAcademy,
                    selectedHall
                );

                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch calendar events", error);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [currentDate, selectedAcademy, selectedHall]);

    // Reset selected hall if it doesn't belong to selected academy
    useEffect(() => {
        if (selectedAcademy !== "all" && selectedAcademy !== "" && selectedHall !== "all" && selectedHall !== "") {
            const hallBelongs = academies.find(a => a.id === selectedAcademy)?.halls?.some(h => h.id === selectedHall);
            if (!hallBelongs) setSelectedHall("");
        }
    }, [selectedAcademy, selectedHall, academies]);


    const handleMonthChange = (month: string) => {
        const newDate = setMonth(currentDate, MONTHS.indexOf(month));
        setCurrentDate(newDate);
    };

    const handleYearChange = (year: string) => {
        const newDate = setYear(currentDate, parseInt(year));
        setCurrentDate(newDate);
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    // Helper to get events for a specific date
    const getEventsForDay = (day: Date) => {
        return bookings.filter(booking => {
            if (!booking.event_start_date) return false;

            // Check if day is within start and end date (inclusive)
            const start = new Date(booking.event_start_date);
            // reset time to 0 to ensure accurate date-only comparison
            start.setHours(0, 0, 0, 0);

            const end = booking.event_end_date ? new Date(booking.event_end_date) : new Date(start);
            end.setHours(23, 59, 59, 999);

            return day >= start && day <= end;
        });
    };

    // Hover state
    const [hoveredEvent, setHoveredEvent] = useState<{ event: Booking; position: { x: number; y: number } } | null>(null);

    // We need useEffect to access window for positioning checks, but simple min check in style works.

    const handleEventMouseEnter = (event: Booking, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Position details
        setHoveredEvent({
            event,
            position: { x: rect.left, y: rect.bottom + 5 }
        });
    };

    const handleEventMouseLeave = () => {
        setHoveredEvent(null);
    };

    if (loading) {
        return <div className="h-[600px] w-full flex items-center justify-center animate-pulse bg-white rounded-xl">Loading calendar...</div>;
    }

    return (
        <div className="w-full bg-white p-6 rounded-[16px] shadow-sm border border-slate-100 relative">
            {/* Header / Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">

                {/* Filters Section */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto font-normal">
                    {/* Academy Filter */}
                    <Select value={selectedAcademy} onValueChange={setSelectedAcademy}>
                        <SelectTrigger className="w-full md:w-[220px] h-10 rounded-[6px] border-[#b4b4b4] text-[#8E8787] bg-white">
                            <SelectValue placeholder="Select Academy" />
                        </SelectTrigger>
                        <SelectContent className="border-[#b4b4b4]">
                            <SelectItem value="all" className="cursor-pointer focus:bg-[#f5f4f4]">All Academies</SelectItem>
                            {academies.map((academy) => (
                                <SelectItem key={academy.id} value={academy.id} className="cursor-pointer focus:bg-[#f5f4f4]">
                                    {academy.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Hall Filter */}
                    <Select value={selectedHall} onValueChange={setSelectedHall}>
                        <SelectTrigger className="w-full md:w-[220px] h-10 rounded-[6px] border-[#b4b4b4] text-[#8E8787] bg-white">
                            <SelectValue placeholder="Select Hall" />
                        </SelectTrigger>
                        <SelectContent className="border-[#b4b4b4]">
                            <SelectItem value="all" className="cursor-pointer focus:bg-[#f5f4f4]">All Halls</SelectItem>
                            {filteredHalls.map((hall) => (
                                <SelectItem key={hall.id} value={hall.id} className="cursor-pointer focus:bg-[#f5f4f4]">
                                    {hall.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Navigation Section */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto justify-end text-[#8E8787]">
                    <Select value={format(currentDate, "MMMM")} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-full md:w-[160px] h-10 rounded-[6px] border-[#B4B4B4] text-[#8E8787] font-normal focus:ring-offset-0">
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] border-[#B4B4B4]">
                            {MONTHS.map((month) => (
                                <SelectItem key={month} value={month} className="text-base cursor-pointer focus:bg-[#f5f4f4]">
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={getYear(currentDate).toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-full md:w-[120px] h-10 rounded-[6px] border-[#B4B4B4] text-[#8E8787] font-normal focus:ring-offset-0">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="border-[#B4B4B4]">
                            {YEARS.map((year) => (
                                <SelectItem key={year} value={year.toString()} className="text-base cursor-pointer focus:bg-[#f5f4f4]">
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Monthly Nav Arrows */}
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <button
                            onClick={() => setCurrentDate(addDays(currentDate, -30))} // Approximate month back
                            className="p-2 hover:bg-slate-50 rounded-[16px] text-slate-400 hover:text-[#0050fd] transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(addDays(currentDate, 30))} // Approximate month forward
                            className="p-2 hover:bg-slate-50 rounded-[16px] text-slate-400 hover:text-[#0050fd] transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="w-full overflow-x-auto pb-4">
                <div className="min-w-[800px]">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-4 mb-4">
                        {DAYS.map((day) => (
                            <div key={day} className="h-[50px] bg-[#f2f6ff] rounded-[8px] flex items-center justify-center">
                                <span className="text-[#0050fd] font-medium text-base font-poppins hidden md:block">{day}</span>
                                <span className="text-[#0050fd] font-medium text-base font-poppins md:hidden">{day.slice(0, 3)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Cells */}
                    <div className="grid grid-cols-7 gap-4">
                        {calendarDays.map((day) => {
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isToday = isSameDay(day, new Date());
                            const dayEvents = getEventsForDay(day);

                            return (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "min-h-[120px] md:min-h-[140px] bg-white border border-[#DEDEDE] rounded-[12px] p-2 md:p-3 transition-all duration-200 flex flex-col gap-2 relative group hover:border-[#0050fd]/30 hover:shadow-lg hover:shadow-blue-500/5",
                                        isCurrentMonth ? "border-slate-100" : "border-[#DEDEDE] bg-slate-50/30",
                                        isToday && " border-[#0050fd]/50"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "text-sm md:text-[16px] font-normal font-poppins ml-1",
                                            isCurrentMonth ? "text-black" : "text-slate-300",
                                            isToday && "text-[#0050fd]"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>

                                    <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px] md:max-h-[100px] scrollbar-hide">
                                        {dayEvents.map((event) => (
                                            <div
                                                key={event.booking_id}
                                                onClick={() => onEventClick?.(event?.booking_id)}
                                                onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                                                onMouseLeave={handleEventMouseLeave}
                                                className="px-1.5 md:px-2 py-1 md:py-1.5 rounded-[6px] bg-[#0050fd]/10 border-l-[3px] border-[#0050fd] hover:bg-[#0050fd] hover:border-[#0050fd] group/event transition-all cursor-pointer relative"
                                            >
                                                <p className="text-[10px] md:text-xs font-medium text-[#0050fd] line-clamp-1 group-hover/event:text-white">
                                                    {event.event_title}
                                                </p>
                                                {/* <p className="text-[8px] md:text-[10px] text-[#0050fd]/80 line-clamp-1 group-hover/event:text-white/90">
                                                    {event.status}
                                                </p> */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Hover Card Overlay */}
            {hoveredEvent && (
                <div
                    className="fixed z-50 bg-white rounded-[16px] shadow-xl p-4 border border-slate-100 min-w-[320px] animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: hoveredEvent.position.y,
                        // Start slightly shifted to prevent cursor from overlapping too much if needed
                        left: Math.min(hoveredEvent.position.x, typeof window !== 'undefined' ? window.innerWidth - 340 : 0) // Prevent overflow right
                    }}
                >
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
                        <span className="text-[#8E8787] font-poppins text-sm">Organizer :</span>
                        <span className="text-[#0f322e] font-poppins text-sm font-medium">{hoveredEvent.event.full_name || "N/A"}</span>

                        <span className="text-[#8E8787] font-poppins text-sm">Department :</span>
                        <span className="text-[#0f322e] font-poppins text-sm font-medium">{hoveredEvent.event.department || "N/A"}</span>

                        <span className="text-[#8E8787] font-poppins text-sm">Event Name :</span>
                        <span className="text-[#0f322e] font-poppins text-sm font-medium">{hoveredEvent.event.event_title || "N/A"}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
