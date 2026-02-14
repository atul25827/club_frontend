import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Define guarded routes
    // Removed '/book' and '/calendar' to make them public
    const protectedRoutes = ['/my-bookings'];
    const isAuthRoute = protectedRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/admin');
    const isAdminRoute = pathname.startsWith('/admin');

    if (isAuthRoute) {
        if (!token) {
            // Not authenticated -> Redirect to Login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        let user;
        try {
            user = JSON.parse(decodeURIComponent(token));
        } catch (e) {
            // If parse fails (maybe explicitly invalid or raw string issue), clear and redirect
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // 2. Check Role (if Admin route)
        if (isAdminRoute) {
            try {
                // Case insensitive check
                if (user.role?.toUpperCase() !== 'ACADEMY ADMIN') {
                    // Trusted user but not Admin -> Redirect to Home (or 403)
                    return NextResponse.redirect(new URL('/', request.url));
                }
            } catch (e) {
                // Invalid token format
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
    }

    // 3. Prevent authenticated users from visiting Login
    if (pathname === '/login') {
        if (token) {
            // Redirect based on role if possible
            try {
                const user = JSON.parse(decodeURIComponent(token));
                if (user.role?.toUpperCase() === 'ACADEMY ADMIN') {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            } catch (e) { }
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/book/:path*',
        '/calendar',
        '/my-bookings',
        '/admin/:path*',
        '/login',
    ],
};
