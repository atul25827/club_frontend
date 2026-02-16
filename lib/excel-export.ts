import * as XLSX from "xlsx";
import { Booking } from "@/types";

export const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const formatBookingForExport = (booking: Booking) => {
    // Helper to format event planning details
    const eventPlanningDetails = booking.event_planning?.map(plan =>
        `Date: ${plan.event_date}, Time: ${plan.event_start_time}-${plan.event_end_time}, Hall: ${plan.hall}, Type: ${plan.booking_type}`
    ).join(' | ') || "N/A";

    return {
        "Booking ID": booking.booking_id,
        "Academy": booking.academy || "N/A",
        "Full Name": booking.full_name || "N/A",
        "Event Title": booking.event_title || "N/A",
        "Start Date": booking.event_start_date,
        "End Date": booking.event_end_date,
        "Status": booking.event_status || "N/A",
        "Booking Status": booking.booking_status || "N/A",
        "Overall Status": booking.overall_status || "N/A",
        "Contact Number": booking.contact_number || "N/A",
        "Email": booking.email || "N/A",
        "Vertical": booking.vertical || "N/A",
        "Department": booking.department || "N/A",
        "Merilian Code": booking.merilian_code || "N/A",
        "Participants (Domestic)": booking.no_of_participants || 0,
        "Participants (International)": booking.no_of_participants_international || 0,
        "Event Type": booking.event_type || "N/A",
        "Description": booking.description || "N/A",
        "IT Requirement": booking.it_requirement || "N/A",
        "Specific Requirement": booking.specific_requirement_if_any || "N/A",
        "MATS Event": booking.mats_event || "No",
        "MATS Request No": booking.mats_request_number || "N/A",
        "Comment": booking.comment || "N/A",
        "Event Planning Details": eventPlanningDetails,
        "Created On": booking.creation || "N/A",
        "Modified On": booking.modified || "N/A",
        "Owner": booking.owner || "N/A"
    };
};
