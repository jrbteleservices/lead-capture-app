import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Check for Supabase auth cookie (simple fallback if auth-helpers is not installed)
  const token = req.cookies.get('sb:token')?.value;

  // If the user is trying to access /admin (but not the login page) and has no session/token
  if (req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin/login' && !token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return res;
}
// Removed accidental UI code and logout helper from middleware file.
// Authentication-related UI and client-side signOut should live in a React
// component (not middleware). Keep middleware focused on request handling.