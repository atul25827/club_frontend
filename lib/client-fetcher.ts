// ─── Base URL ───────────────────────────────────────────────────────────────

export function getBaseUrl(): string {
    const url = process.env.NEXT_PUBLIC_FRAPPE_URL;
    if (!url) throw new Error("NEXT_PUBLIC_FRAPPE_URL is not defined");
    return url;
}

// ─── URL Builder ────────────────────────────────────────────────────────────

export function buildUrl(route: string, params?: Record<string, string>): string {
    const base = getBaseUrl();
    const searchParams = new URLSearchParams();
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value != null && value !== "") searchParams.append(key, value);
        }
    }
    const query = searchParams.toString();
    return `${base}${route}${query ? `?${query}` : ""}`;
}

// ─── Error Handling ─────────────────────────────────────────────────────────

export class FrappeApiError extends Error {
    status: number;
    responseData: any;

    constructor(message: string, status: number, responseData?: any) {
        super(message);
        this.name = "FrappeApiError";
        this.status = status;
        this.responseData = responseData;
    }
}

/**
 * Extracts a human-readable error message from Frappe's error response.
 * Handles: _server_messages, nested objects, JSON-encoded strings, exceptions.
 */
export function extractErrorMessage(data: any): string {
    if (data?._server_messages) {
        try {
            const messages = JSON.parse(data._server_messages);
            const parsed = JSON.parse(messages[0]);
            return typeof parsed === "string" ? parsed : parsed.message || JSON.stringify(parsed);
        } catch { /* fallthrough */ }
    }

    if (data?.message) {
        if (typeof data.message === "string") {
            if (data.message.trim().startsWith("{")) {
                try {
                    const parsed = JSON.parse(data.message);
                    if (parsed.message) return parsed.message;
                } catch { /* fallthrough */ }
            }
            return data.message;
        }
        if (typeof data.message === "object" && data.message.message) {
            return data.message.message;
        }
        return String(data.message);
    }

    if (data?.exception) return data.exception;

    return "Request failed";
}

// ─── Fetch Options ──────────────────────────────────────────────────────────

export interface FetchOptions {
    method?: "GET" | "POST";
    params?: Record<string, string>;
    body?: any;
    formData?: FormData;
    headers?: Record<string, string>;
    skipAuth?: boolean;
}

// ─── Client-side Fetch ──────────────────────────────────────────────────────

/**
 * Client-side fetch wrapper for Frappe API.
 *
 * - Uses `credentials: 'include'` to send sid cookie (unless skipAuth)
 * - Returns full JSON response (caller extracts .message as needed)
 * - Throws FrappeApiError on non-ok responses with extracted message
 */
export async function clientFetch(route: string, options: FetchOptions = {}): Promise<any> {
    const url = buildUrl(route, options.params);
    const { method = "GET", body, formData, headers: extraHeaders = {}, skipAuth = false } = options;

    const headers: Record<string, string> = { ...extraHeaders };
    if (body && !formData) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        method,
        credentials: skipAuth ? undefined : "include",
        cache: "no-store",
        headers,
        body: formData || (body ? JSON.stringify(body) : undefined),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new FrappeApiError(extractErrorMessage(errorData), response.status, errorData);
    }

    return response.json();
}

// ─── Shared Data Mappers ────────────────────────────────────────────────────

/**
 * Maps raw Frappe academy data to typed Academy objects.
 * Shared between client-side and server-side APIs.
 */

// ─── Default Stats ──────────────────────────────────────────────────────────

export const DEFAULT_STATS = {
    total_bookings: 0,
    total_approved: 0,
    total_pending: 0,
    total_rejected: 0,
    total_cancel: 0,
};
