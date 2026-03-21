import { cookies } from "next/headers";
import { buildUrl, extractErrorMessage, FrappeApiError } from "./client-fetcher";

// ─── Server-side Fetch ──────────────────────────────────────────────────────

/**
 * Server-side fetch wrapper for Frappe API.
 *
 * - Reads cookies from `next/headers` and forwards as Cookie header
 * - Returns full JSON response (caller extracts .message as needed)
 * - Throws FrappeApiError on non-ok responses
 * - If skipAuth is true, skips cookie forwarding (for public endpoints)
 */
export async function serverFetch(
    route: string,
    options: { params?: Record<string, string>; skipAuth?: boolean } = {}
): Promise<any> {
    const url = buildUrl(route, options.params);

    const headers: Record<string, string> = {};

    if (!options.skipAuth) {
        const cookieStore = await cookies();
        headers["Cookie"] = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");
    }

    const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new FrappeApiError(extractErrorMessage(errorData), response.status, errorData);
    }

    return response.json();
}
