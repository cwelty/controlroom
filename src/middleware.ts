import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminSecret = process.env.TASKFEED_ADMIN_SECRET;
    
    if (!adminSecret) {
      console.error('TASKFEED_ADMIN_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check for admin secret in different places
    const authHeader = request.headers.get('authorization');
    const secretFromHeader = authHeader?.replace('Bearer ', '');
    const secretFromQuery = request.nextUrl.searchParams.get('admin_secret');
    const secretFromCookie = request.cookies.get('admin_secret')?.value;

    const providedSecret = secretFromHeader || secretFromQuery || secretFromCookie;

    if (providedSecret !== adminSecret) {
      // If it's an API request, return JSON
      if (request.nextUrl.pathname.startsWith('/admin/api') || 
          request.headers.get('accept')?.includes('application/json')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // For page requests, redirect to a simple auth form
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    // If authenticated via query param, set a cookie for future requests
    if (secretFromQuery && !secretFromCookie) {
      const response = NextResponse.next();
      response.cookies.set('admin_secret', providedSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return response;
    }

    // Add no-cache headers for admin routes
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};