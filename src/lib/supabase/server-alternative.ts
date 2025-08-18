import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

export async function createClientFromRequest(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Extract cookies directly from request headers
  const cookieHeader = request.headers.get('cookie') || ''
  
  console.log('🍪 Request cookie header:', {
    hasCookies: !!cookieHeader,
    cookieLength: cookieHeader.length,
    supabaseCookies: cookieHeader.split(';').filter(c => c.includes('supabase')),
    timestamp: new Date().toISOString()
  })

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookies = cookieHeader
            .split(';')
            .filter(Boolean)
            .map(cookie => {
              const [name, ...rest] = cookie.trim().split('=')
              return {
                name: name.trim(),
                value: rest.join('=').trim()
              }
            })
          
          console.log('🔍 Parsed cookies:', {
            total: cookies.length,
            supabaseCookies: cookies.filter(c => c.name.includes('supabase')).length,
            cookieNames: cookies.map(c => c.name)
          })
          
          return cookies
        },
        setAll(cookiesToSet) {
          // In API routes, we can't set cookies this way
          // They should be set via NextResponse
          console.log('⚠️ setAll called but not implemented in request-based client')
        },
      },
    }
  )
}