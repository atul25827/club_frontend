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
    total_approved: number;
    total_pending: number;
    total_rejected: number;
    total_cancel: number;
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
