import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Exclude local development environments from aggressive rewrites
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  
  // Define your application's base production domain name here
  const baseDomain = 'apexcontactsolutions.com'; 

  let subdomain = '';

  if (isLocalhost) {
    // For local testing: parse search queries like localhost:3000/?resolvedSubdomain=testclient
    const querySubdomain = url.searchParams.get('resolvedSubdomain');
    if (querySubdomain) subdomain = querySubdomain.toLowerCase();
  } else {
    // Production parsing: extract the lead sub-segment from the live hostname
    const parts = hostname.split('.');
    if (parts.length > 2 && !hostname.includes('www.' + baseDomain)) {
      subdomain = parts[0].toLowerCase();
    }
  }

  // Rewrite standard paths targeting valid custom subdomains safely into the dynamic segment folder
  if (subdomain && subdomain !== 'www') {
    // Guard tracking configurations to bypass looping raw asset paths or API networks
    if (
      !url.pathname.startsWith('/_next') && 
      !url.pathname.startsWith('/api') &&
      !url.pathname.includes('.')
    ) {
      url.pathname = `/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

// Ensure middleware runs across all matching asset layouts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};