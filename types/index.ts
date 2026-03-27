export type UserRole = string | string[];

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    employeeCode?: string;
}

export interface BookingStatsType {
    total_bookings: number;
    total_submitted: number;
    total_approved: number;
    total_pending: number;
    total_rejected: number;
    total_cancelled?: number;
    total_cancel?: number; // compat
}

export interface ClubBookingSummary {
    name: string;
    club_booking_id: string;
    event_name: string;
    from_date: string;
    to_date: string;
    booking_status: string;
    approval_status: string;
    guest_region?: string;
    is_submitted: number;
    is_approved: number;
    is_rejected: number;
    is_cancelled: number;
    creation: string;
    owner: string;
    full_name: string;
    booking_id?: string; // mapping helper
}

export interface AuditLogEntry {
    timestamp: string;
    action: string;
    user: string;
    user_role: string;
    comment?: string;
    status: string;
}

export interface Country {
    name: string;
}

export interface State {
    name: string;
}

// Shared lookup item shape from Frappe get_all
export interface LookupItem {
    name: string;
}

export interface ClubMasterData {
    booking_for: LookupItem[];
    food_preferences: LookupItem[];
    meal_type: LookupItem[];
    service_type: LookupItem[];
}

// Legacy alias kept for backward compat
export type MasterData = Record<string, any>;
