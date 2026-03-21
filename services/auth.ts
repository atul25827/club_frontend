import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSession } from "./session";

/**
 * SSR-level auth protection.
 *
 * Validates the session against the Frappe backend (real security).
 * Middleware handles fast redirects (UX), but THIS is the real gate.
 *
 * Uses `getSession()` from `api/session.ts` — single source of truth.
 *
 * @param roleCheck - Optional role to require (e.g., "ACADEMY ADMIN")
 * @returns The user's role string (UPPERCASE)
 */
async function _requireAuth(roleCheck?: string): Promise<string> {
    const cookieStore = await cookies();
    const sid = cookieStore.get("sid")?.value;

    if (!sid) {
        redirect("/login");
    }

    try {
        const allCookies = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        const { user, role } = await getSession(allCookies);

        if (!user || !role) {
            redirect("/login");
        }

        if (roleCheck && role !== roleCheck.toUpperCase()) {
            redirect("/");
        }

        return role;
    } catch (error) {
        if (error && typeof error === "object" && "digest" in error) {
            throw error;
        }
        console.error("[requireAuth] Error:", error);
        redirect("/login");
    }
}

/**
 * Cached version of requireAuth.
 *
 * React `cache()` deduplicates within a single server request,
 * so calling this in both layout.tsx and page.tsx only hits the API once.
 */
export const requireAuth = cache(_requireAuth);
