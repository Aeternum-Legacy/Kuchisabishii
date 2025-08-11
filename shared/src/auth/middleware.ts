// Authentication middleware helpers for Next.js
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware helper to check authentication status
 */
export async function withAuth(
  request: NextRequest,
  options: {
    redirectTo?: string;
    requireAuth?: boolean;
  } = {}
) {
  const { redirectTo = '/login', requireAuth = true } = options;

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();

  // If authentication is required but user is not authenticated
  if (requireAuth && (!user || error)) {
    const redirectUrl = new URL(redirectTo, request.url);
    redirectUrl.searchParams.set('redirect_to', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If authentication is not required but user is authenticated, might want to redirect
  if (!requireAuth && user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

/**
 * Helper to get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {
          // No-op in read-only context
        },
        remove() {
          // No-op in read-only context
        },
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Helper to get user profile from request
 */
export async function getUserProfile(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return null;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {
          // No-op in read-only context
        },
        remove() {
          // No-op in read-only context
        },
      },
    }
  );

  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Rate limiting middleware helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60 * 1000 // 1 minute
  ) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the time window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Check if user has exceeded the limit
    if (validRequests.length >= this.maxRequests) {
      return true;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return false;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) {
      return Date.now();
    }

    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.windowMs;
  }
}

/**
 * Create rate limiting middleware
 */
export function createRateLimitMiddleware(
  maxRequests = 100,
  windowMs = 60 * 1000
) {
  const limiter = new RateLimiter(maxRequests, windowMs);

  return async (request: NextRequest) => {
    // Use IP address or user ID as identifier
    const user = await getAuthenticatedUser(request);
    const identifier = user?.id || request.ip || 'anonymous';

    if (limiter.isRateLimited(identifier)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again later.`,
          resetTime: limiter.getResetTime(identifier),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': limiter.getRemainingRequests(identifier).toString(),
            'X-RateLimit-Reset': limiter.getResetTime(identifier).toString(),
          },
        }
      );
    }

    return null; // Continue to next middleware
  };
}

/**
 * CORS middleware helper
 */
export function createCorsMiddleware(options: {
  origin?: string | string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
} = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization'],
    credentials = true,
  } = options;

  return (request: NextRequest) => {
    const response = NextResponse.next();

    // Handle CORS
    const requestOrigin = request.headers.get('origin');
    
    if (Array.isArray(origin)) {
      if (requestOrigin && origin.includes(requestOrigin)) {
        response.headers.set('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (origin === '*') {
      response.headers.set('Access-Control-Allow-Origin', '*');
    } else if (origin === requestOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', headers.join(', '));
    
    if (credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }

    return response;
  };
}

/**
 * Security headers middleware
 */
export function createSecurityHeadersMiddleware() {
  return (request: NextRequest) => {
    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.supabase.co wss://realtime.supabase.co;"
    );

    return response;
  };
}

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(...middlewares: Array<(request: NextRequest) => Promise<NextResponse | null> | NextResponse | null>) {
  return async (request: NextRequest) => {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result) {
        return result;
      }
    }
    return NextResponse.next();
  };
}