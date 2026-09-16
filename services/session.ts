import { User } from "@/types";
import { API_ROUTES } from "./api-routes";
import { getBaseUrl } from "@/lib/client-fetcher";

export interface SessionResult {
    user: User | null;
    role: string[] | null;
}

/**
 * Validates the user's session against the Frappe backend.
 *
 * Used by `requireAuth()` in `api/auth.ts` for SSR protection.
 *
 * @param cookieHeader - Raw cookie header string to forward to Frappe
 * @returns SessionResult with user data and normalized (UPPERCASE) role
 */
export async function getSession(cookieHeader: string): Promise<SessionResult> {
    let baseUrl: string;
    try {
        baseUrl = getBaseUrl();
    } catch {
        return { user: null, role: null };
    }

    try {
        const userRes = await fetch(`${baseUrl}${API_ROUTES.auth.getLoggedUser}`, {
            method: "GET",
            headers: { cookie: cookieHeader },
            cache: "no-store",
        });

        if (!userRes.ok) {
            return { user: null, role: null };
        }

        const userData = await userRes.json();
        const profile = userData.message;
        if (!profile || !profile.user_id) {
            return { user: null, role: null };
        }

        const user: User = {
            id: profile.user_id,
            name: profile.full_name || profile.user_id,
            email: profile.email || profile.user_id,
            role: profile.role || ["Club User"],
            employeeCode: profile.employee_code,
            avatarUrl: profile.image,
        };

        const roleArray = Array.isArray(user.role) ? user.role : [user.role || ""];
        const role = roleArray.map((r: string) => r.toUpperCase());

        return { user, role };
    } catch (error) {
        console.error("[getSession] Error:", error);
        return { user: null, role: null };
    }
}
