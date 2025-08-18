import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * CRITICAL: Token-based authentication fallback for Vercel
 * 
 * This implementation handles the case where cookies aren't properly
 * transmitted in Vercel's serverless environment by also checking
 * for Authorization headers.
 */
export async function createClientWithToken(request?: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Try to get cookies
  let cookieStore: any
  try {
    cookieStore = await cookies()
  } catch {
    cookieStore = null
  }

  // Extract access token from various sources
  let accessToken: string | null = null
  
  // 1. Try Authorization header (if request provided)
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7)
      console.log('🔑 Found access token in Authorization header')
    }
  }

  // 2. Try extracting from cookie header directly (if request provided)
  if (!accessToken && request) {
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = cookieHeader.split(';').map(c => {
      const [name, ...value] = c.trim().split('=')
      return { name: name.trim(), value: value.join('=').trim() }
    })
    
    // Look for Supabase auth token in cookies
    const authCookie = cookies.find(c => 
      c.name === 'sb-access-token' || 
      c.name.includes('auth-token') ||
      c.name.startsWith('sb-') && c.name.includes('auth')
    )
    
    if (authCookie) {
      accessToken = authCookie.value
      console.log('🍪 Found access token in cookies')
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
          
          // Parse cookies from request header as fallback
          if (request) {
            const cookieHeader = request.headers.get('cookie') || ''
            return cookieHeader.split(';').filter(Boolean).map(cookie => {
              const [name, ...value] = cookie.trim().split('=')
              return { name: name.trim(), value: value.join('=').trim() }
            })
          }
          
          return []
        },
        setAll(cookiesToSet) {
          // Try to set cookies if possible
          if (cookieStore) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, {
                  ...options,
                  domain: undefined, // Let Vercel handle domain
                  path: '/',
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production'
                })
              })
            } catch {
              // Expected to fail in some contexts
            }
          }
        },
      },
      auth: {
        // If we found an access token, use it directly
        ...(accessToken ? { persistSession: false } : {}),
      },
      global: {
        // Add the access token to headers if available
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    }
  )
}