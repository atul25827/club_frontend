import { api } from "@/services/api";
import { BookingStatsType } from "@/types";
import { Calendar, CalendarCheck, Clock, XSquare, Ban, LucideIcon } from "lucide-react";

export interface DashboardColumn {
    header: string;
    key: string;
    render?: (row: any, onViewDetails?: (row: any) => void) => React.ReactNode;
}

export interface DashboardStatsCardConfig {
    label: string;
    key: keyof BookingStatsType;
    icon: LucideIcon;
    bgClass: string;
    textClass: string;
    iconClass: string;
}

export interface DashboardDefinition {
    id: string;
    roles: string[];
    title: string;
    listTitle: string;
    getStats: () => Promise<BookingStatsType | null>;
    getList: (page: number, limit: number) => Promise<{ data: any[]; total_count: number }>;
    columns: DashboardColumn[];
    statsCards: DashboardStatsCardConfig[];
    viewAllHref: string;
}

export const DASHBOARD_REGISTRY: DashboardDefinition[] = [
    {
        id: "club-admin",
        roles: ["Club Admin"],
        title: "Club Admin Dashboard",
        listTitle: "Latest Club Bookings",
        getStats: () => api.getClubApproverStats(),
        getList: (page, limit) => api.getApproverClubBookingList(page, limit),
        viewAllHref: "/club-booking-list",
        statsCards: [
            { label: "Total Events", key: "total_bookings", icon: Calendar, bgClass: "bg-[#E3E8FF]", textClass: "text-[#33398A]", iconClass: "text-[#33398A]" },
            // { label: "Total Submitted", key: "total_submitted", icon: Clock, bgClass: "bg-[#E0F2FE]", textClass: "text-[#0369A1]", iconClass: "text-[#0369A1]" },
            { label: "Total Pending", key: "total_pending", icon: Clock, bgClass: "bg-[#FEF0C7]", textClass: "text-[#B54708]", iconClass: "text-[#B54708]" },
            { label: "Total Approved", key: "total_approved", icon: CalendarCheck, bgClass: "bg-[#D1FADF]", textClass: "text-[#027A48]", iconClass: "text-[#027A48]" },
            { label: "Total Rejected", key: "total_rejected", icon: XSquare, bgClass: "bg-red-100", textClass: "text-red-600", iconClass: "text-red-600" },
            // { label: "Total Cancelled", key: "total_cancelled", icon: Ban, bgClass: "bg-orange-100", textClass: "text-orange-600", iconClass: "text-orange-600" },
        ],
        columns: [
            {
                header: "Booking ID",
                key: "name",
                render: (row, onViewDetails) => (
                    <button
                        onClick={() => onViewDetails?.(row)}
                        className="text-[#6941C6] font-medium hover:underline cursor-pointer"
                    >
                        #{row.club_booking_id?.toUpperCase() || row.name}
                    </button>
                )
            },
            { header: "Event Name", key: "event_name" },
            { header: "Full Name", key: "full_name" },
            { header: "From Date", key: "from_date" },
            { header: "To Date", key: "to_date" },
            { header: "Status", key: "booking_status" },
        ]
    },
    {
        id: "club-user",
        roles: ["Club User"],
        title: "Club User Dashboard",
        listTitle: "Your Recent Club Bookings",
        getStats: () => api.getUserClubBookingStats(),
        getList: (page, limit) => api.getClubBookingList(page, limit),
        viewAllHref: "/club-booking-list",
        statsCards: [
            { label: "Total Events", key: "total_bookings", icon: Calendar, bgClass: "bg-[#E3E8FF]", textClass: "text-[#33398A]", iconClass: "text-[#33398A]" },
            { label: "Total Submitted", key: "total_submitted", icon: Clock, bgClass: "bg-[#E0F2FE]", textClass: "text-[#0369A1]", iconClass: "text-[#0369A1]" },
            // { label: "Total Pending", key: "total_pending", icon: Clock, bgClass: "bg-[#FEF0C7]", textClass: "text-[#B54708]", iconClass: "text-[#B54708]" },
            { label: "Total Approved", key: "total_approved", icon: CalendarCheck, bgClass: "bg-[#D1FADF]", textClass: "text-[#027A48]", iconClass: "text-[#027A48]" },
            { label: "Total Rejected", key: "total_rejected", icon: XSquare, bgClass: "bg-red-100", textClass: "text-red-600", iconClass: "text-red-600" },
            // { label: "Total Cancelled", key: "total_cancelled", icon: Ban, bgClass: "bg-orange-100", textClass: "text-orange-600", iconClass: "text-orange-600" },
        ],
        columns: [
            {
                header: "Booking ID",
                key: "name",
                render: (row, onViewDetails) => (
                    <button
                        onClick={() => onViewDetails?.(row)}
                        className="text-[#6941C6] font-medium hover:underline cursor-pointer"
                    >
                        #{row.club_booking_id?.toUpperCase() || row.name}
                    </button>
                )
            },
            { header: "Event Name", key: "event_name" },
            { header: "From Date", key: "from_date" },
            { header: "To Date", key: "to_date" },
            { header: "Status", key: "booking_status" },
        ]
    },
    // {
    //     id: "academy-admin",
    //     roles: ["Academy Admin", "Administrator"],
    //     title: "Academy Dashboard",
    //     listTitle: "Your Booking",
    //     getStats: () => api.getApproverStats(),
    //     getList: (page, limit) => api.getApproverBookingList(page, limit, {}),
    //     viewAllHref: "/bookings",
    //     statsCards: [
    //         { label: "Total Events", key: "total_bookings", icon: Calendar, bgClass: "bg-[#E3E8FF]", textClass: "text-[#33398A]", iconClass: "text-[#33398A]" },
    //         { label: "Total Pending", key: "total_pending", icon: Clock, bgClass: "bg-[#FEF0C7]", textClass: "text-[#B54708]", iconClass: "text-[#B54708]" },
    //         { label: "Total Approved", key: "total_approved", icon: CalendarCheck, bgClass: "bg-[#D1FADF]", textClass: "text-[#027A48]", iconClass: "text-[#027A48]" },
    //         { label: "Total Rejected", key: "total_rejected", icon: XSquare, bgClass: "bg-red-100", textClass: "text-red-600", iconClass: "text-red-600" },
    //         { label: "Total Cancel", key: "total_cancel", icon: Ban, bgClass: "bg-orange-100", textClass: "text-orange-600", iconClass: "text-orange-600" },
    //     ],
    //     columns: [
    //         { header: "Booking ID", key: "booking_id" },
    //         { header: "Academy", key: "academy" },
    //         { header: "Full Name", key: "full_name" },
    //         { header: "Event Start Date", key: "event_start_date" },
    //         { header: "Event Start End", key: "event_end_date" },
    //         { header: "Training/Event Title", key: "event_title" },
    //     ]
    // }
];

export interface ListDefinition {
    id: string;
    roles: string[];
    title: string;
    getList: (page: number, limit: number, filters?: any) => Promise<{ data: any[]; total_count: number }>;
    columns: DashboardColumn[];
    mobileFields: {
        idKey: string;
        titleKey: string;
        subtitleKey1: string;
        subtitleKey2: string;
    };
}

export const LIST_REGISTRY: ListDefinition[] = [
    {
        id: "club-admin-list",
        roles: ["Club Admin"],
        title: "Club Bookings (Approver View)",
        getList: (page, limit, filters) => api.getApproverClubBookingList(page, limit, filters),
        columns: [
            {
                header: "Booking ID",
                key: "club_booking_id",
                render: (row, onViewDetails) => (
                    <button
                        onClick={() => onViewDetails?.(row)}
                        className="text-[#6941C6] font-medium hover:underline cursor-pointer"
                    >
                        #{row.club_booking_id?.toUpperCase() || row.name}
                    </button>
                )
            },
            { header: "Guest Region", key: "guest_region" },
            { header: "Requester Name", key: "full_name" },
            { header: "Event Title", key: "event_name" },
            { header: "Start Date", key: "from_date" },
            { header: "End Date", key: "to_date" },
            { header: "Booking Status", key: "booking_status" },
            { header: "Approval Status", key: "approval_status" },
        ],
        mobileFields: {
            idKey: "club_booking_id",
            titleKey: "event_name",
            subtitleKey1: "full_name",
            subtitleKey2: "from_date"
        }
    },
    {
        id: "club-user-list",
        roles: ["Club User"],
        title: "Your Club Bookings",
        getList: (page, limit, filters) => api.getClubBookingList(page, limit, filters),
        columns: [
            {
                header: "Booking ID",
                key: "club_booking_id",
                render: (row, onViewDetails) => (
                    <button
                        onClick={() => onViewDetails?.(row)}
                        className="text-[#6941C6] font-medium hover:underline cursor-pointer"
                    >
                        #{row.club_booking_id?.toUpperCase() || row.name}
                    </button>
                )
            },
            { header: "Guest Region", key: "guest_region" },
            { header: "Event Title", key: "event_name" },
            { header: "Start Date", key: "from_date" },
            { header: "End Date", key: "to_date" },
            { header: "Booking Status", key: "booking_status" },
        ],
        mobileFields: {
            idKey: "club_booking_id",
            titleKey: "event_name",
            subtitleKey1: "from_date",
            subtitleKey2: "to_date"
        }
    }
];
