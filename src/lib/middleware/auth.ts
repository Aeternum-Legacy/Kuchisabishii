/**
 * Authentication Middleware Utilities
 * Provides helper functions for API route authentication
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    user_metadata?: Record<string, unknown>
  }
}

/**
 * Middleware to authenticate API requests
 * Returns user data if authenticated, throws error if not
 */
export async function authenticateRequest(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      throw new Error('Not authenticated')
    }

    return user
  } catch (error) {
    throw new Error('Authentication failed')
  }
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: Record<string, unknown>, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T) => {
    try {
      const user = await authenticateRequest(request)
      return await handler(request, user as any, ...args)
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }
}

/**
 * Check if user has admin privileges
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id') // Could add admin field later
      .eq('id', userId)
      .single()

    // For now, return false - admin system can be implemented later
    return false
  } catch (error) {
    return false
  }
}

/**
 * Middleware for admin-only routes
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: NextRequest, user: Record<string, unknown>, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T) => {
    try {
      const user = await authenticateRequest(request)
      const userIsAdmin = await isAdmin(user.id)
      
      if (!userIsAdmin) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Admin access required'
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }

      return await handler(request, user as any, ...args)
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Rate limiting middleware
 */
export function withRateLimit<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) {
  return async (request: NextRequest, ...args: T) => {
    // Use IP or user ID for rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'

    if (!rateLimit(identifier, maxRequests, windowMs)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    return handler(request, ...args)
  }
}

/**
 * CORS middleware helper
 */
export function withCors<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T) => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      })
    }

    const response = await handler(request, ...args)
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }
}