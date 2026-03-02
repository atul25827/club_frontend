import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Define guarded routes
    const adminRoutes = ['/dashboard', '/bookings', '/booking', '/admin'];
    const userRoutes = ['/my-bookings', '/book', '/calendar', '/about'];

    const isProtectedAdminRoute = adminRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    const isProtectedUserRoute = userRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // SCENARIO 1: Any Protected Route Access
    if (isProtectedAdminRoute || isProtectedUserRoute) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        let user;
        try {
            user = JSON.parse(decodeURIComponent(token));
        } catch (e) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }

        const role = user.role?.toUpperCase();

        // RULE A: Non-Admins cannot access Admin Routes
        if (isProtectedAdminRoute && role !== 'ACADEMY ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // RULE B: Admins cannot access User-Only Routes (like My Bookings)
        // This enforces the strict role separation you asked for.
        if (isProtectedUserRoute && role === 'ACADEMY ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // SCENARIO 3: Public Route Access (already logged in)
    // Prevent authenticated users from visiting Login page
    if (pathname === '/login') {
        if (token) {
            try {
                const user = JSON.parse(decodeURIComponent(token));
                if (user.role?.toUpperCase() === 'ACADEMY ADMIN') {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
                return NextResponse.redirect(new URL('/', request.url));
            } catch (e) {
                // Token invalid, let them stay on login page to re-login
            }
        }
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
