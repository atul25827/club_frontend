import type { Tab1FormData, FoodCateringEntry, StayEntry } from "@/types/club-booking.types";

// ─── Tab 1 Validation ────────────────────────────────────────────────────────

export interface ValidationError {
    field: string;
    message: string;
}

export function validateTab1(data: Tab1FormData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.event_name?.trim())
        errors.push({ field: "event_name", message: "Event name is required" });

    if (!data.from_date)
        errors.push({ field: "from_date", message: "From date is required" });

    if (!data.to_date)
        errors.push({ field: "to_date", message: "To date is required" });

    if (data.from_date && data.to_date && data.to_date < data.from_date)
        errors.push({ field: "to_date", message: "To date must be after From date" });

    return errors;
}

// ─── Tab 2 Validation ────────────────────────────────────────────────────────

export interface Tab2Draft {
    booking_for: string;
    day: string;
    total_no_of_guest: string;
    distributor_or_guest_name: string;
    designation: string;
    firm_or_hospital_name: string;
    repeat_guest: string;
    state: string;
    country: string;
    food_preferences: string;
    meal_type: string;
    veg: string;
    non_veg: string;
    jain: string;
    other: string;
    stay_required: boolean;
    check_in_date: string;
    check_out_date: string;
    remark: string;
}

export function validateTab2Draft(data: Tab2Draft): ValidationError[] {
    const errors: ValidationError[] = [];
    const hasGuestDetails = data.booking_for === "Club" || data.booking_for === "Club House" || data.booking_for === "Guest";

    if (!data.booking_for)
        errors.push({ field: "booking_for", message: "Booking For is required" });

    if (!data.day)
        errors.push({ field: "day", message: "Day-wise plan is required" });

    if (!data.food_preferences)
        errors.push({ field: "food_preferences", message: "Food preference is required" });

    if (!data.meal_type)
        errors.push({ field: "meal_type", message: "Meal type is required" });

    if (hasGuestDetails) {
        if (!data.distributor_or_guest_name?.trim())
            errors.push({ field: "distributor_or_guest_name", message: "Guest name is required" });
    } else {
        if (!data.total_no_of_guest || Number(data.total_no_of_guest) <= 0)
            errors.push({ field: "total_no_of_guest", message: "Total guests must be a positive number" });
    }

    // New validation: Guest count sums
    let total = Number(data.total_no_of_guest) || 0;
    if (hasGuestDetails && total === 0) total = 1; // Default to 1 guest for Club/Guest mode
    
    const v = Number(data.veg) || 0;
    const nv = Number(data.non_veg) || 0;
    const j = Number(data.jain) || 0;
    const o = Number(data.other) || 0;
    const sum = v + nv + j + o;

    if (total > 0 && sum > total) {
        errors.push({ 
            field: hasGuestDetails ? "veg" : "total_no_of_guest", 
            message: `Sum (${sum}) cannot exceed ${total} guest(s)` 
        });
    }

    if (data.stay_required) {
        if (!data.check_in_date)
            errors.push({ field: "check_in_date", message: "Check-in date is required" });
        if (!data.check_out_date)
            errors.push({ field: "check_out_date", message: "Check-out date is required" });
        if (data.check_in_date && data.check_out_date && data.check_out_date < data.check_in_date)
            errors.push({ field: "check_out_date", message: "Check-out must be after check-in" });
    }

    return errors;
}

// ─── Tab 3 Validation ────────────────────────────────────────────────────────

export interface Tab3Draft {
    distributor_or_guest_name: string;
    designation: string;
    check_in_date: string;
    check_out_date: string;
    firm_or_hospital_name: string;
    repeat_guest: string;
    state: string;
    country: string;
    remark: string;
}

export function validateTab3Draft(data: Tab3Draft): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.distributor_or_guest_name?.trim())
        errors.push({ field: "distributor_or_guest_name", message: "Guest name is required" });

    if (!data.check_in_date)
        errors.push({ field: "check_in_date", message: "Check-in date is required" });

    if (!data.check_out_date)
        errors.push({ field: "check_out_date", message: "Check-out date is required" });

    if (data.check_in_date && data.check_out_date && data.check_out_date < data.check_in_date)
        errors.push({ field: "check_out_date", message: "Check-out must be after check-in" });

    return errors;
}

/** Build a flat { field: message } map from error array for easy field lookup */
export function toErrorMap(errors: ValidationError[]): Record<string, string> {
    return errors.reduce((acc, e) => ({ ...acc, [e.field]: e.message }), {});
}
