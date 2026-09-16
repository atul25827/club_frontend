import * as XLSX from "xlsx";


export const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const formatClubBookingForExport = (booking: any) => {
    // Format food & catering entries as a readable summary
    const foodDetails = Array.isArray(booking.food_and_catering)
        ? booking.food_and_catering.map((f: any, i: number) =>
            `[${i + 1}] ${f.distributor_or_guest_name || "N/A"} | Booking For: ${f.booking_for || "N/A"} | Day: ${f.day || "N/A"} | Meal: ${f.meal_type || "N/A"} | Guests: ${f.total_no_of_guest || 0} | Veg: ${f.veg || 0}, Non-Veg: ${f.non_veg || 0}, Jain: ${f.jain || 0}, Other: ${f.other || 0}`
        ).join("\n")
        : "N/A";

    // Format stay entries as a readable summary
    const stayDetails = Array.isArray(booking.stay)
        ? booking.stay.map((s: any, i: number) =>
            `[${i + 1}] ${s.distributor_or_guest_name || "N/A"} | Designation: ${s.designation || "N/A"} | Org: ${s.firm_or_hospital_name || "N/A"} | Check-in: ${s.check_in_date || "N/A"} | Check-out: ${s.check_out_date || "N/A"} | Repeat: ${s.repeat_guest || "No"}`
        ).join("\n")
        : "N/A";

    return {
        "Booking ID": booking.club_booking_id || booking.name || "N/A",
        "Event Name": booking.event_name || "N/A",
        "Guest Region": booking.guest_region || "N/A",
        "From Date": booking.from_date || "N/A",
        "To Date": booking.to_date || "N/A",
        "Booking Status": booking.booking_status || "N/A",
        "Approval Status": booking.approval_status || "N/A",
        "Requestor": booking.full_name || "N/A",
        "Food & Catering Details": foodDetails,
        "Stay Details": stayDetails,
    };
};
