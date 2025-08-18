import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * CRITICAL: Cookie Architecture Fix for Vercel Serverless
 * 
 * This implementation addresses the confirmed cookie domain/path mismatch
 * causing 401 errors in the Vercel production environment.
 * 
 * Key fixes:
 * 1. Proper cookie domain handling for Vercel domains
 * 2. Correct sameSite and secure attributes
 * 3. Fallback error handling for serverless environments
 * 4. Debug logging for troubleshooting
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Get cookie store with error handling for serverless environments
  let cookieStore
  try {
    cookieStore = await cookies()
  } catch (error) {
    console.warn('⚠️ Cookie store access failed, using fallback:', error.message)
    // Fallback for serverless edge cases
    cookieStore = {
      getAll: () => [],
      set: () => {},
      delete: () => {}
    }
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          try {
            const allCookies = cookieStore.getAll()
            
            // Debug logging for production troubleshooting
            if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_MODE === 'true') {
              console.log('🍪 Server cookies (Vercel-fixed):', {
                total: allCookies.length,
                supabaseCookies: allCookies.filter(c => 
                  c.name.startsWith('sb-') || c.name.includes('supabase')
                ).length,
                cookieNames: allCookies.map(c => c.name).join(', ') || 'none'
              })
            }
            
            return allCookies.map(cookie => ({
              name: cookie.name,
              value: cookie.value
            }))
          } catch (error) {
            console.error('❌ getAll() failed:', error.message)
            return []
          }
        },
        
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options = {} }) => {
              // CRITICAL FIX: Proper cookie options for Vercel
              const vercelCookieOptions = {
                ...options,
                // Don't set domain for Vercel - let it default to current domain
                domain: undefined,
                // Ensure proper path
                path: options.path || '/',
                // Proper sameSite for OAuth flows
                sameSite: options.sameSite || 'lax',
                // Secure in production
                secure: process.env.NODE_ENV === 'production',
                // Don't set httpOnly for auth tokens that client needs to read
                httpOnly: options.httpOnly || false
              }

              try {
                cookieStore.set(name, value, vercelCookieOptions)
                
                if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_MODE === 'true') {
                  console.log('✅ Cookie set:', name, 'with options:', vercelCookieOptions)
                }
              } catch (setCookieError) {
                console.warn('⚠️ Failed to set cookie:', name, setCookieError.message)
              }
            })
          } catch (error) {
            console.warn('⚠️ setAll() failed (expected in Server Components):', error.message)
            // This is expected to fail in Server Components that don't handle responses
            // The cookies will be set by the client-side auth flow instead
          }
        },
      },
    }
  )
}

/**
 * Alternative implementation using request-based cookie handling
 * for API routes where cookies() might not work properly
 */
export function createClientFromRequest(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Extract cookies directly from request headers
  const cookieHeader = request.headers.get('cookie') || ''
  
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
          
          if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_MODE === 'true') {
            console.log('🔍 Request cookies:', {
              total: cookies.length,
              supabaseCookies: cookies.filter(c => 
                c.name.startsWith('sb-') || c.name.includes('supabase')
              ).length
            })
          }
          
          return cookies
        },
        setAll() {
          // Cannot set cookies from request-based client
          // These should be set via NextResponse in the actual API route
        },
      },
    }
  )
}