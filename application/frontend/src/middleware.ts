import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/t'];

const ANALYTICS_LOGIN_PATH = '/api/sa';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  const slug = process.env.ANALYTICS_SLUG || 'm7x';
  const analyticsBase = `/s/${slug}`;

  if (pathname.startsWith(analyticsBase)) {
    if (pathname === `${analyticsBase}/login`) {
      return NextResponse.next();
    }
    if (pathname === ANALYTICS_LOGIN_PATH) {
      return NextResponse.next();
    }

    const analyticsToken = request.cookies.get('analytics-auth')?.value;
    const secret = process.env.COOKIE_SECRET || 'default-dev-secret';
    const expected = Buffer.from(`analytics-${secret}`).toString('base64url');

    if (analyticsToken === expected) {
      return NextResponse.next();
    }

    const loginUrl = new URL(`${analyticsBase}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === ANALYTICS_LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get('partner-auth')?.value;
  const secret = process.env.COOKIE_SECRET || 'default-dev-secret';
  const expected = Buffer.from(secret).toString('base64url');

  if (token === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
