import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Unified Supabase Server Client
 * Production-ready implementation with proper error handling and security
 */

// Primary cookie-based client for Server Components
// SECURITY: Always uses anon key to respect RLS policies for user authentication
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // CRITICAL SECURITY FIX: Always use anon key to ensure RLS policies are respected
  // This prevents users from seeing other users' profiles
  const apiKey = supabaseAnonKey

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    apiKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options = {} }) => {
              const vercelOptions = {
                ...options,
                domain: undefined, // Let Vercel handle domain
                path: options.path || '/',
                sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: options.httpOnly ?? false
              }
              cookieStore.set(name, value, vercelOptions)
            })
          } catch {
            // Expected to fail in Server Components - cookies handled by middleware
          }
        },
      },
    }
  )
}

// Request-based client for API routes
export async function createClientFromRequest(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const cookieHeader = request.headers.get('cookie') || ''
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieHeader
            .split(';')
            .filter(Boolean)
            .map(cookie => {
              const [name, ...rest] = cookie.trim().split('=')
              return {
                name: name.trim(),
                value: rest.join('=').trim()
              }
            })
        },
        setAll() {
          // Cannot set cookies in API routes - handled by NextResponse
        },
      },
    }
  )
}

// Service role client for admin operations (profile creation, etc.)
export async function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for service role client')
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Service role client doesn't need to manage cookies
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

// Token-based client for maximum compatibility
export async function createClientWithToken(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Try to get cookies first
  let cookieStore: any
  try {
    cookieStore = await cookies()
  } catch {
    cookieStore = null
  }

  // Extract access token from various sources
  let accessToken: string | null = null
  
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7)
  }

  // Check cookies for token
  if (!accessToken) {
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = cookieHeader.split(';').map(c => {
      const [name, ...value] = c.trim().split('=')
      return { name: name.trim(), value: value.join('=').trim() }
    })
    
    const authCookie = cookies.find(c => 
      c.name === 'sb-access-token' || 
      c.name.includes('auth-token') ||
      (c.name.startsWith('sb-') && c.name.includes('auth'))
    )
    
    if (authCookie) {
      accessToken = authCookie.value
    }
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          if (cookieStore) {
            try {
              return cookieStore.getAll()
            } catch {
              // Fall through
            }
          }
          
          // Parse from request header
          const cookieHeader = request.headers.get('cookie') || ''
          return cookieHeader.split(';').filter(Boolean).map(cookie => {
            const [name, ...value] = cookie.trim().split('=')
            return { name: name.trim(), value: value.join('=').trim() }
          })
        },
        setAll(cookiesToSet) {
          if (cookieStore) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, {
                  ...options,
                  domain: undefined,
                  path: '/',
                  sameSite: 'lax' as const,
                  secure: process.env.NODE_ENV === 'production'
                })
              })
            } catch {
              // Expected in some contexts
            }
          }
        },
      },
      auth: {
        ...(accessToken ? { persistSession: false } : {}),
      },
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    }
  )
}