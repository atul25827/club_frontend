import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware — Fast, cookie-based routing (UX layer, NOT security).
 * 
 * Real security lives in SSR via `requireAuth()` in layout.tsx.
 * This middleware only does fast redirects using:
 *   - `sid` cookie (set by Frappe, HttpOnly) → is user logged in?
 *   - `role` cookie (set by /api/session, server-controlled) → what role?
 * 
 * ❌ No API calls here — Edge-compatible & fast.
 */
export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const sid = request.cookies.get('sid')?.value;
    const role = request.cookies.get('role')?.value?.toUpperCase();

    // Define guarded route patterns
    const adminRoutes = ['/dashboard', '/bookings', '/booking', '/admin'];
    const userRoutes = ['/my-bookings', '/book'];
    const isProtectedAdminRoute = adminRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    const isProtectedUserRoute = userRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    //  Not logged in → redirect to login
    if (!sid && (isProtectedAdminRoute || isProtectedUserRoute)) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    //  Fast role-based routing (UX only, real check done in SSR)
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
