import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/about', '/privacy-policy', '/terms', '/risk-disclosure', '/disclaimer',
];

const USER_ROUTES = [
  '/dashboard', '/slots', '/earnings', '/transactions', '/referrals',
  '/withdrawals', '/leaderboard', '/matrix', '/my-orbit', '/notifications',
  '/profile', '/support', '/apex-pool', '/upgrade-vault',
];

const ADMIN_ROUTES = [
  '/admin', '/admin/users', '/admin/settings', '/admin/notifications',
  '/admin/support', '/admin/apex-pool', '/admin/withdrawals', '/admin/packages',
  '/admin/earnings', '/admin/matrix', '/admin/referrals', '/admin/security',
  '/admin/profile', '/admin/announcements', '/admin/transactions',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Allow API routes on all domains
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.html') ||
    pathname.endsWith('.txt') ||
    pathname.endsWith('.json')
  ) {
    return NextResponse.next();
  }

  // === MAIN DOMAIN (cylixdefi.live) → Coming Soon + Public Pages ===
  if (host === 'cylixdefi.live' || host === 'www.cylixdefi.live') {
    if (pathname === '/' || PUBLIC_ROUTES.some(r => pathname === r)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // === APP SUBDOMAIN (app.cylixdefi.live) → User pages ===
  if (host.startsWith('app.')) {
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // === ADMIN SUBDOMAIN (admin.cylixdefi.live) → Admin pages ===
  if (host.startsWith('admin.')) {
    if (USER_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
