import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encryptSession } from "@/lib/session-crypto";
import { getSession } from "@/services/session";

/**
 * Syncs the Frappe session with a secure Next.js JWT cookie.
 * 
 * Called locally by the client right after `api.login()`.
 * This protects against client-side tampering of the role cookie.
 */
export async function POST(request: Request) {
    const cookieStore = await cookies();
    const sid = cookieStore.get("sid")?.value;

    if (!sid) {
        return NextResponse.json({ error: "No active Frappe session" }, { status: 401 });
    }

    try {
        // Forward the cookies to get the true role from Frappe backend
        const allCookies = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        const { user, role } = await getSession(allCookies);

        if (!user || !role) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // Create a signed JWT payload
        const sessionPayload = {
            userId: user.id,
            role: role, // The UPPERCASE secure role fetched directly from the backend
        };

        const sessionToken = await encryptSession(sessionPayload);
        const isSecure = process.env.NEXT_PUBLIC_NODE_ENV === "production" ? true : false;
        // Set the secure, HttpOnly, encrypted role cookie
        cookieStore.set("app_session", sessionToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days (matching standard Frappe sid length typically)
            path: "/",
        });

        // Delete the insecure legacy plain text role cookie (if it still exists in the user's browser)
        cookieStore.delete("role");

        return NextResponse.json({ success: true, user, role });
    } catch (error) {
        console.error("Session sync failed:", error);
        return NextResponse.json({ error: "Failed to sync session" }, { status: 500 });
    }
}

/**
 * Clears the secure session during logout.
 */
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete("app_session");
    cookieStore.delete("role"); // Cleanup legacy
    return NextResponse.json({ success: true });
}
