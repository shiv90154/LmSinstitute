import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Rate limiting function
 */
function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  current.count++;
  rateLimitStore.set(key, current);
  
  return { allowed: true, remaining: maxRequests - current.count };
}

/**
 * Enhanced middleware with comprehensive security and route protection
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

  // Apply rate limiting (more restrictive for API routes)
  const isApiRoute = pathname.startsWith('/api/');
  const maxRequests = isApiRoute ? 50 : 100; // Lower limit for API routes
  const rateLimit = checkRateLimit(clientIP, maxRequests);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '900', // 15 minutes
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          ...securityHeaders
        }
      }
    );
  }

  // Get token for authentication checks
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/auth',
    '/login',
    '/register',
    '/',
    '/blog',
    '/_next',
    '/favicon',
    '/robots.txt',
    '/sitemap.xml'
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  if (isPublicRoute) {
    const response = NextResponse.next();
    // Add security headers to all responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    return response;
  }

  // Admin-only routes
  const adminRoutes = [
    '/admin',
    '/api/admin'
  ];

  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Protected routes that require authentication
  const protectedRoutes = [
    '/student',
    '/admin',
    '/courses',
    '/mock-tests',
    '/current-affairs',
    '/study-materials',
    '/api/courses',
    '/api/tests',
    '/api/progress',
    '/api/student',
    '/api/payments',
    '/api/videos'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check authentication
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          },
          { 
            status: 401,
            headers: securityHeaders
          }
        );
      } else {
        // Redirect to login for page routes
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Check admin access for admin routes
    if (isAdminRoute && token.role !== 'admin') {
      if (isApiRoute) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Admin access required',
            code: 'ADMIN_REQUIRED'
          },
          { 
            status: 403,
            headers: securityHeaders
          }
        );
      } else {
        // Redirect to student dashboard for non-admin users
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }

    // Token expiration handling
    const now = Math.floor(Date.now() / 1000);
    const tokenExp = token.exp as number;
    const timeUntilExpiry = tokenExp - now;
    const fiveMinutes = 5 * 60;

    if (timeUntilExpiry <= 0) {
      // Token has expired
      if (isApiRoute) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Token expired',
            code: 'TOKEN_EXPIRED'
          },
          { 
            status: 401,
            headers: securityHeaders
          }
        );
      } else {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        loginUrl.searchParams.set('error', 'SessionExpired');
        return NextResponse.redirect(loginUrl);
      }
    }

    // Set token refresh header if close to expiration
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

    if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
      response.headers.set('X-Token-Refresh', 'true');
    }

    // Add user context headers for API routes
    if (isApiRoute) {
      response.headers.set('X-User-ID', token.sub || '');
      response.headers.set('X-User-Role', token.role as string || 'student');
    }

    return response;
  }

  // Default response with security headers
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
