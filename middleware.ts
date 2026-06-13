import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // 1. Identify environment parameters
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const baseDomain = 'apexcontactsolutions.com'; 

  let subdomain = '';

  if (isLocalhost) {
    // Local Testing Mode: Extract the query string explicitly
    const querySubdomain = url.searchParams.get('resolvedSubdomain');
    if (querySubdomain) {
      subdomain = querySubdomain.toLowerCase();
    }
  } else {
    // Production Cloudflare/Vercel Mode: Parse DNS subdomain splits
    const parts = hostname.split('.');
    if (parts.length > 2 && !hostname.includes('www.' + baseDomain)) {
      subdomain = parts[0].toLowerCase();
    }
  }

  // 2. Strict Routing Logic Block
  // If no valid custom subdomain is active, let Next.js serve the native root page layout natively
  if (!subdomain || subdomain === 'www') {
    return NextResponse.next();
  }

  // 3. Prevent loop hooks on standard asset dependencies
  if (
    !url.pathname.startsWith('/_next') && 
    !url.pathname.startsWith('/api') &&
    !url.pathname.includes('.')
  ) {
    // Rewrite path mapping directly into our dynamic folder tree
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Intercept all structural content layers efficiently
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};