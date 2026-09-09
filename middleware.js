import { NextResponse } from 'next/server';

// El middleware corre en el Edge Runtime, donde no hay 'crypto' de Node
// disponible de la misma forma. Para mantenerlo simple y compatible,
// acá sólo chequeamos que exista la cookie; la validación criptográfica
// completa de la firma se hace en cada API/página server-side (lib/auth.js).
const COOKIE_NAME = 'qr_admin_session';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/lotes') ||
    (pathname.startsWith('/api/qr') && !pathname.startsWith('/api/qr/publico')) ||
    pathname.startsWith('/api/export');

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie || !cookie.value) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/lotes/:path*', '/api/qr/:path*', '/api/export/:path*'],
};
