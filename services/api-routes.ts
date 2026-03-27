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
    },
} as const;
