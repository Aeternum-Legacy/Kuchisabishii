import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface SessionInfo {
  user: {
    id: string
    email?: string
    displayName?: string
    firstName?: string
    lastName?: string
  } | null
  isAuthenticated: boolean
  expiresAt?: number
}

export async function getServerSession(): Promise<SessionInfo> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        user: null,
        isAuthenticated: false
      }
    }

    // Get additional user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, first_name, last_name')
      .eq('id', user.id)
      .single()

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: profile?.display_name || user.user_metadata?.display_name,
        firstName: profile?.first_name || user.user_metadata?.first_name,
        lastName: profile?.last_name || user.user_metadata?.last_name
      },
      isAuthenticated: true,
      expiresAt: user.session?.expires_at
    }
  } catch (error) {
    console.error('Error getting server session:', error)
    return {
      user: null,
      isAuthenticated: false
    }
  }
}

export function requireAuth() {
  return async function authGuard(
    request: NextRequest
  ): Promise<{ authorized: boolean; user?: any; response?: NextResponse }> {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
      }

      return {
        authorized: true,
        user
      }
    } catch (error) {
      console.error('Auth guard error:', error)
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Authentication service error' },
          { status: 500 }
        )
      }
    }
  }
}

export async function refreshSession(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    
    // Clear Supabase session cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ]

    cookiesToClear.forEach(cookieName => {
      cookieStore.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })
  } catch (error) {
    console.error('Error clearing session:', error)
  }
}

export function createSecureResponse(data: any, options?: {
  headers?: Record<string, string>
  status?: number
}): NextResponse {
  const response = NextResponse.json(data, {
    status: options?.status || 200,
    headers: {
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(options?.headers || {})
    }
  })

  return response
}