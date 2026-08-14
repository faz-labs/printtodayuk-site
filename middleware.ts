import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Check if request is coming from a CMS subdomain (e.g., cms.printtodayuk.com, cms.localhost:3001, admin.localhost:3001)
  const isCmsSubdomain =
    host.startsWith('cms.') ||
    host.startsWith('admin.');

  const cmsSession = request.cookies.get('cms_session')?.value;

  let response: NextResponse;

  if (isCmsSubdomain) {
    const url = request.nextUrl.clone();

    // If root on CMS subdomain (e.g. http://cms.domain.com/)
    if (pathname === '/' || pathname === '') {
      url.pathname = cmsSession ? '/cms/dashboard' : '/cms/login';
      response = NextResponse.rewrite(url);
    } else if (pathname === '/login') {
      url.pathname = '/cms/login';
      response = NextResponse.rewrite(url);
    } else if (pathname === '/dashboard') {
      url.pathname = '/cms/dashboard';
      response = NextResponse.rewrite(url);
    } else if (!pathname.startsWith('/cms')) {
      url.pathname = `/cms${pathname}`;
      response = NextResponse.rewrite(url);
    } else {
      response = NextResponse.next();
    }

    response.headers.set('x-cms-subdomain', 'true');
  } else {
    // Standard domain routing (e.g. printtodayuk.com or localhost:3001)
    response = NextResponse.next();
    if (pathname.startsWith('/cms')) {
      response.headers.set('x-cms-route', 'true');
    }
  }

  // Security Headers Enhancement
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.svg, .png, .jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
