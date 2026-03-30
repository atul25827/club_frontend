import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decryptSession } from '@/lib/session-crypto';

/**
 * Middleware — Fast, secure, cookie-based routing (UX layer).
 * 
 * Verifies the cryptographically signed `app_session` JWT.
 * 
 * ❌ No API calls here — Edge-compatible & fast.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const sid = request.cookies.get('sid')?.value;
    const sessionCookie = request.cookies.get('app_session')?.value;

    let role: string[] | null = null;
    let isValidSession = false;

    if (sid && sessionCookie) {
        // Decrypt the JWT to extract the tamper-proof role
        const session = await decryptSession(sessionCookie);
        if (session && session.role) {
            const rawRole = session.role;
            const roleArray = Array.isArray(rawRole) ? rawRole : [rawRole];
            role = roleArray.map((r: string) => r?.toUpperCase() || "");
            isValidSession = true;
        }
    }

    // Define guarded route patterns
    const protectedRoutes = ['/dashboard', '/club-booking', '/club-booking/', '/club-booking-list', '/club-booking-list/'];

    const isProtectedRoute = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // ❌ Not logged in or tampered JWT → redirect to login
    if (!isValidSession && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        // Wipe invalid cookies immediately
        response.cookies.delete('app_session');
        response.cookies.delete('role');
        return response;
    }

    // Default page redirection
    if (pathname === '/') {
        if (isValidSession) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Prevent authenticated users from visiting login page
    if (pathname === '/login' && isValidSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configure Matcher
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
