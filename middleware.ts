import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // 1. Instantly skip internal asset payloads, APIs, and administrative modules
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Isolate multi-tenant link extensions cleanly
  let subdomain = '';
  if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      subdomain = parts[0].toLowerCase();
    }
  }

  // 3. Rewrite internal server routing locations for valid link addresses
  if (subdomain && subdomain !== 'www') {
    // Transparently passes the tenant parameters down to the core layout
    url.pathname = `/_subdomain/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Global path matcher profiles
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};