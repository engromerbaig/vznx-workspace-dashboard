// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from '@/lib/auth-config';
import { ROLES, isValidRole, type UserRole } from '@/lib/roles';

// Define protected routes and their required roles
const protectedRoutes: Record<string, UserRole[]> = {
  '/dashboard': [ROLES.SUPERADMIN, ROLES.MANAGER, ROLES.USER], // All authenticated users
  '/superadmin': [ROLES.SUPERADMIN], // Superadmin only
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip auth check for public routes
  if (pathname === '/' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtected = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

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

    // Validate user role
    if (!isValidRole(user.role)) {
      console.log(`❌ Invalid user role: ${user.role}`);
      const redirectResponse = NextResponse.redirect(new URL('/', request.url));
      redirectResponse.cookies.delete(AUTH_CONFIG.SESSION.COOKIE_NAME);
      return redirectResponse;
    }

    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(user.role)) {
        console.log(`❌ Role ${user.role} not allowed for ${route}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Add user to headers for client components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', user.role);
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
    '/dashboard/:path*',
    '/superadmin/:path*',
    '/unauthorized',
  ],
};