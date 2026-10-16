import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract host reliably across Vercel Edge, proxies, and localhost
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.hostname ||
    '';

  // Check if request is coming from CMS subdomain (e.g., cms.printtodayuk.com, cms.localhost:3001, admin.printtodayuk.com)
  const isCmsSubdomain =
    host.startsWith('cms.') ||
    host.startsWith('admin.') ||
    host.includes('cms.localhost') ||
    host.includes('admin.localhost');

  const cmsSession = request.cookies.get('cms_session')?.value;

  let response: NextResponse;

  if (isCmsSubdomain) {
    // 1. Root request on CMS subdomain (e.g. https://cms.printtodayuk.com/)
    if (pathname === '/' || pathname === '') {
      const targetPath = cmsSession ? '/cms/dashboard' : '/cms/login';
      response = NextResponse.rewrite(new URL(targetPath, request.url));
    }
    // 2. Short paths without /cms prefix on subdomain (e.g. /login or /dashboard)
    else if (pathname === '/login') {
      response = NextResponse.rewrite(new URL('/cms/login', request.url));
    } else if (pathname === '/dashboard') {
      response = NextResponse.rewrite(new URL('/cms/dashboard', request.url));
    }
    // 3. Any other path not prefixed with /cms on the subdomain
    else if (!pathname.startsWith('/cms')) {
      response = NextResponse.rewrite(new URL(`/cms${pathname}`, request.url));
    }
    // 4. Already starts with /cms
    else {
      response = NextResponse.next();
    }

    response.headers.set('x-cms-subdomain', 'true');
  } else {
    // Friendly redirect for /all products or /all%20products
    try {
      const decoded = decodeURIComponent(pathname);
      if (decoded === '/all products' || pathname === '/all%20products') {
        const url = request.nextUrl.clone();
        url.pathname = '/all-products';
        return NextResponse.redirect(url);
      }
    } catch {}

    // Standard storefront domain (e.g. printtodayuk.com, www.printtodayuk.com, localhost:3001)
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
