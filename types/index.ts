export type UserRole = string;

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    employeeCode?: string;
}

export interface Hall {
    id: string;
    name: string;
    academyId: string;
    capacity?: number;
    wifi?: number | boolean;
    screen?: number | boolean;
    hall_name: string;
}

export interface Academy {
    id: string;
    name: string;
    location?: string;
    rating?: number;
    pricePerSession?: number;
    imageUrl?: string;
    sports?: string[];
    halls?: Hall[];
}

export interface Session {
    id: string;
    date: string | Date;
    startTime: string;
    endTime: string;
    hallId: string;
    bookingType: string;
    eventDate?: Date; // Added based on usage in booking-form
    trainingHall?: string; // Added based on usage in booking-form
}

export interface Booking {
    booking_id: string;
    academyId: string;
    academy?: string; // Academy Name
    hallId: string;
    date: string;
    timeSlot: string;
    status: string;
    event_status?: string; // Status from API if different
    organizer: string;
    fullName: string;
    full_name?: string; // Mapped from backend
    department: string;
    eventName: string;
    event_title?: string; // Title from API if different
    contactNumber: string;
    merilianCode?: string;
    attendeesVertical?: string;
    attendeesDepartment?: string;
    trainingTitle?: string;
    description?: string;
    participantsCount: number;
    email: string;
    matsEvent?: string;
    matsRequestNo?: string;
    itRequirements?: string;
    sessions?: Session[];
    event_start_date?: string;
    event_end_date?: string;
    owner?: string;
    id?: string;
    specificRequirements?: string;
    overall_status?: string;
    booking_status?: string;
    // Added for export compatibility
    contact_number?: string;
    vertical?: string;
    merilian_code?: string;
    no_of_participants?: number;
    no_of_participants_international?: number;
    event_type?: string;
    it_requirement?: string;
    specific_requirement_if_any?: string;
    mats_event?: string;
    mats_request_number?: string;
    comment?: string;
    creation?: string;
    modified?: string;
    event_planning?: Array<{
        name?: string;
        event_date: string;
        event_start_time: string;
        event_end_time: string;
        hall: string;
        booking_type?: string;
    }>;
}

export interface Company {
    company_code: string;
    name: string;
}

export interface Department {
    name: string;
}

export interface BookingType {
    name: string;
}

export interface ITRequirement {
    name: string;
}

export interface MasterData {
    master_company: Company[];
    department_master: Department[];
    booking_type: BookingType[];
    it_requirements: ITRequirement[];
    [key: string]: any;
}

export interface BookingStatsType {
    total_bookings: number;
    total_approved: number;
    total_pending: number;
    total_rejected: number;
    total_cancel: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total_count: number;
    page_number: number;
    page_length: number;
}

// Raw API Response Type for Booking Details
export interface BookingDetail {
    name: string;
    booking_id: string;
    event_title: string;
    overall_status: string;
    event_status: string;
    event_start_date: string;
    event_end_date?: string;
    start_date?: string; // fallback if needed
    academy: string;
    no_of_participants: number;
    vertical: string;
    vertical_name: string;
    department: string;
    merilian_code: string;
    full_name: string;
    contact_number: string;
    email: string;
    description: string;
    specific_requirements: string;
    it_requirement: string;
    mats_event: string;
    mats_request_number: string;
    event_type?: string;
    no_of_participants_international?: number;
    comment?: string;
    cancel_comment?: string; // Reason for cancellation request
    owner?: string;
    can_approve?: boolean; // Indicates if the user can act on this booking
    can_cancel?: boolean; // Indicates if the user can act on cancel request
    is_cancelled?: boolean;
    cancel_request?: boolean;
    event_planning: Array<{
        name?: string;
        event_date: string;
        event_start_time: string;
        event_end_time: string;
        hall: string;
        booking_type?: string;
    }>;
}

export interface AuditLogEntry {
    timestamp: string;
    action: string;
    user: string;
    user_role: string;
    comment?: string;
    status: string;
}
