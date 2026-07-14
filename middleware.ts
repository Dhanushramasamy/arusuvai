import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const COOKIE_NAME = 'arusuvai_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no protection needed
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/menu') ||
    pathname === '/subscription'
  ) {
    return NextResponse.next();
  }

  // Read and verify session cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // Root redirect — logged-in users go to their dashboard; unauthenticated see landing page
  if (pathname === '/') {
    if (!session) {
      return NextResponse.next(); // Let the public landing page render
    }
    const dest =
      session.role === 'admin'
        ? '/admin'
        : session.role === 'delivery_person'
        ? '/delivery'
        : '/client';
    return NextResponse.redirect(new URL(dest, request.url));
  }


  // Protected route groups
  const isClientRoute   = pathname.startsWith('/client');
  const isAdminRoute    = pathname.startsWith('/admin');
  const isDeliveryRoute = pathname.startsWith('/delivery');

  if (isClientRoute || isAdminRoute || isDeliveryRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role mismatch → redirect to own dashboard
    if (isClientRoute && session.role !== 'client') {
      return NextResponse.redirect(new URL(roleDashboard(session.role), request.url));
    }
    if (isAdminRoute && session.role !== 'admin') {
      return NextResponse.redirect(new URL(roleDashboard(session.role), request.url));
    }
    if (isDeliveryRoute && session.role !== 'delivery_person') {
      return NextResponse.redirect(new URL(roleDashboard(session.role), request.url));
    }
  }

  // API route protection
  if (pathname.startsWith('/api/client')) {
    if (!session || session.role !== 'client') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }
  if (pathname.startsWith('/api/admin')) {
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }
  if (pathname.startsWith('/api/delivery')) {
    if (!session || session.role !== 'delivery_person') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

function roleDashboard(role: string): string {
  if (role === 'admin') return '/admin';
  if (role === 'delivery_person') return '/delivery';
  return '/client';
}

export const config = {
  matcher: [
    '/',
    '/client/:path*',
    '/admin/:path*',
    '/delivery/:path*',
    '/api/client/:path*',
    '/api/admin/:path*',
    '/api/delivery/:path*',
  ],
};
