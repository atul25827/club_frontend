/**
 * Centralized API route definitions.
 * All Frappe API paths in one place — easy to find, update, and maintain.
 */
export const API_ROUTES = {
    auth: {
        login: "/api/method/academy.api.auth.login",
        logout: "/api/method/logout",
        getLoggedUser: "/api/method/academy.api.auth.get_logged_user",
    },
    academy: {
        getAcademiesWithHalls: "/api/method/academy.api.academy.get_academies_with_halls",
    },
    booking: {
        create: "/api/method/academy.api.booking.create_booking",
        getList: "/api/method/academy.api.booking.get_booking_list",
        getExport: "/api/method/academy.api.booking.get_booking_export",
        getDetails: "/api/method/academy.api.booking.get_booking_details",
        getCalendar: "/api/method/academy.api.booking.get_calendar_bookings",
        getUpcoming: "/api/method/academy.api.booking.get_upcoming_bookings",
        updateStatus: "/api/method/academy.api.booking.update_booking_status",
        cancel: "/api/method/academy.api.booking.cancel_booking",
        updateEventPlanning: "/api/method/academy.api.booking.update_booking_event_planning",
        getAuditTrail: "/api/method/academy.api.booking.get_booking_audit_trail",
        uploadAttendance: "/api/method/academy.api.booking.upload_attendance",
        checkPendingAttendance: "/api/method/academy.api.booking.check_pending_attendance",
        getUserStats: "/api/method/academy.api.booking.get_user_booking_stats",
        getApproverStats: "/api/method/academy.api.booking.get_approver_stats",
        getApproverList: "/api/method/academy.api.booking.get_approver_booking_list",
    },
    masterData: {
        get: "/api/method/academy.api.master_data.get_master_data",
    },
} as const;
