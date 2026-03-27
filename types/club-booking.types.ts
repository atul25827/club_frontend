// ─── Tab 1: Event Information ────────────────────────────────────────────────

export interface Tab1FormData {
    guest_region: string;
    event_name: string;
    from_date: string;
    to_date: string;
}

// ─── Tab 2: Food & Catering ──────────────────────────────────────────────────

export interface FoodCateringEntry {
    name?: string;
    booking_for?: string;
    day?: string;
    // Academy fields
    total_no_of_guest?: number;
    // Club House fields
    distributor_or_guest_name?: string;
    designation?: string;
    firm_or_hospital_name?: string;
    repeat_guest?: "Yes" | "No";
    state?: string;
    country?: string;
    // Common
    food_preferences?: string;
    meal_type?: string;
    veg?: number;
    non_veg?: number;
    jain?: number;
    other?: number;
    stay_required?: boolean;
    check_in_date?: string;
    check_out_date?: string;
    remark?: string;
    is_food?: number;
    is_stay?: number;
}

export interface Tab2FormData {
    booking_for: string;
    day_wise_plan: string;
    total_number_of_guests: string;
    guest_name: string;
    designation: string;
    firm_hospital_name: string;
    repeat_guest: string;
    state: string;
    country: string;
    food_preference: string;
    meal_type: string;
    veg: string;
    non_veg: string;
    jain: string;
    others: string;
    stay_required: boolean;
    check_in_date: string;
    check_out_date: string;
    remark: string;
}

// ─── Tab 3: Stay ─────────────────────────────────────────────────────────────

export interface StayEntry {
    name?: string;
    distributor_or_guest_name?: string;
    designation?: string;
    check_in_date?: string;
    check_out_date?: string;
    firm_or_hospital_name?: string;
    repeat_guest?: "Yes" | "No";
    state?: string;
    country?: string;
    remark?: string;
    is_food?: number;
    is_stay?: number;
    booking_for?: string;
}

export interface Tab3FormData {
    guest_name: string;
    designation: string;
    check_in_date: string;
    check_out_date: string;
    firm_hospital_name: string;
    repeat_guest: string;
    state: string;
    country: string;
    remark: string;
}

// ─── Global Booking State ────────────────────────────────────────────────────

export interface BookingState {
    booking_id: string | null;
    tab1: Tab1FormData;
    food_and_catering: FoodCateringEntry[];
    stay: StayEntry[];
}

// ─── Day-wise Option ─────────────────────────────────────────────────────────

export interface DayOption {
    label: string; // "Day 1 (2026-02-22)"
    value: string; // "2026-02-22"
}
