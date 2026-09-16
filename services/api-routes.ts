/**
 * Centralized API route definitions.
 * All Frappe API paths in one place — easy to find, update, and maintain.
 */
export const API_ROUTES = {
    auth: {
        login: "/api/method/academy.api.auth.login",
        logout: "/api/method/logout",
        getLoggedUser: "/api/method/academy.api.auth.get_logged_user",
        orgotPassword: "/api/method/academy.api.auth.forgot_password",
        verifyResetToken: "/api/method/academy.api.auth.verify_reset_token",
        resetPassword: "/api/method/academy.api.auth.reset_password",
        registerUser: "/api/method/academy.api.auth.register_user",
        sendSignupOtp: "/api/method/academy.api.auth.send_signup_otp",
        verifySignupOtp: "/api/method/academy.api.auth.verify_signup_otp",
        forgotPassword: "/api/method/academy.api.auth.forgot_password",
        changePassword: "/api/method/academy.api.auth.change_user_password",
    },
    clubMasterData: {
        get: "/api/method/academy.api.club_master_data.get_club_masters",
        getCountries: "/api/method/academy.api.club_master_data.get_countries",
        getStates: "/api/method/academy.api.club_master_data.get_states",
    },
    clubBooking: {
        create: "/api/method/academy.api.club_booking.create_booking",
        submit: "/api/method/academy.api.club_booking.submit_booking",
        getDetails: "/api/method/academy.api.club_booking.get_club_booking_details",
        deleteChild: "/api/method/academy.api.club_booking.delete_club_booking_item",
        getList: "/api/method/academy.api.club_booking.get_club_booking_list",
        getUserStats: "/api/method/academy.api.club_booking.get_user_club_booking_stats",
        getClubApproverStats: "/api/method/academy.api.club_booking.get_approver_club_stats",
        getApproverList: "/api/method/academy.api.club_booking.get_approver_club_booking_list",
        updateStatus: "/api/method/academy.api.club_booking.update_club_booking_status",
        getAuditTrail: "/api/method/academy.api.club_booking.get_club_booking_audit_trail",
        getExport: "/api/method/academy.api.club_booking.get_club_booking_export",
    },
    support: {
        getHelpSettings: "/api/method/academy.api.support.get_help_support_settings",
        fetchTutorialVideos: "/api/method/academy.api.support.fetch_tutorial_videos",
    },
} as const;
