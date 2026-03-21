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

    let role = null;
    let isValidSession = false;

    if (sid && sessionCookie) {
        // Decrypt the JWT to extract the tamper-proof role
        const session = await decryptSession(sessionCookie);
        if (session && session.role) {
            role = session.role.toUpperCase();
            isValidSession = true;
        }
    }

    // Define guarded route patterns
    const adminRoutes = ['/dashboard', '/bookings', '/booking', '/admin'];
    const userRoutes = ['/my-bookings', '/book'];
    const isProtectedAdminRoute = adminRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    const isProtectedUserRoute = userRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    //  Not logged in or tampered JWT → redirect to login
    if (!isValidSession && (isProtectedAdminRoute || isProtectedUserRoute)) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        // Wipe invalid cookies immediately
        response.cookies.delete('app_session');
        response.cookies.delete('role'); 
        return response;
    }

    // Fast role-based routing (UX only, real check done in SSR via requireAuth)
    if (sid && role) {
        // Non-admins cannot access admin routes
        if (isProtectedAdminRoute && role !== 'ACADEMY ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Admins cannot access user-only routes
        if (isProtectedUserRoute && role === 'ACADEMY ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Prevent authenticated users from visiting login page
    if (pathname === '/login' && sid && role) {
        if (role === 'ACADEMY ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
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
