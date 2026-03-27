import { format, addDays, parseISO, isValid, differenceInDays } from "date-fns";
import type { DayOption } from "@/types/club-booking.types";

/**
 * Generate day-wise options between two date strings (inclusive).
 * Returns an array of { label: "Day 1 (22 Feb 2026)", value: "2026-02-22" }.
 * Returns [] if dates are invalid or to_date < from_date.
 */
export function generateDayOptions(from_date: string, to_date: string): DayOption[] {
    if (!from_date || !to_date) return [];

    const start = parseISO(from_date);
    const end = parseISO(to_date);

    if (!isValid(start) || !isValid(end)) return [];

    const days = differenceInDays(end, start);
    if (days < 0) return [];

    return Array.from({ length: days + 1 }, (_, i) => {
        const date = addDays(start, i);
        return {
            label: `Day ${i + 1} (${format(date, "dd MMM yyyy")})`,
            value: format(date, "yyyy-MM-dd"),
        };
    });
}

/** Format a date string to display format */
export function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return "-";
    try {
        return format(parseISO(dateStr), "dd MMM yyyy");
    } catch {
        return dateStr;
    }
}
