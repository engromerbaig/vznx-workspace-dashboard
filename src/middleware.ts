// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from '@/lib/auth-config';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip auth check for public routes
  if (pathname === '/' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check if route is protected (any route beyond root)
  const isProtected = pathname !== '/';

  if (!isProtected) {
    return NextResponse.next();
  }

  // Get session token
  const sessionToken = request.cookies.get(AUTH_CONFIG.SESSION.COOKIE_NAME)?.value;
  
  if (!sessionToken) {
    console.log('❌ No session token - redirecting to login');
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verify session with backend
    const verifyResponse = await fetch(new URL('/api/auth/verify-session', request.url), {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!verifyResponse.ok) {
      console.log('❌ Session verification failed');
      const redirectResponse = NextResponse.redirect(new URL('/', request.url));
      redirectResponse.cookies.delete(AUTH_CONFIG.SESSION.COOKIE_NAME);
      return redirectResponse;
    }

    const { user } = await verifyResponse.json();
    
    if (!user) {
      console.log('❌ No user in session verification');
      const redirectResponse = NextResponse.redirect(new URL('/', request.url));
      redirectResponse.cookies.delete(AUTH_CONFIG.SESSION.COOKIE_NAME);
      return redirectResponse;
    }

    // Add user to headers for client components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user._id);
    
    const nextResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    return nextResponse;

  } catch (error) {
    console.error('Middleware error:', error);
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));
    redirectResponse.cookies.delete(AUTH_CONFIG.SESSION.COOKIE_NAME);
    return redirectResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};