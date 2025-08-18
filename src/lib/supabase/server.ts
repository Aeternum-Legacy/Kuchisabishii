import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * CRITICAL FIX: Cookie Architecture for Vercel Serverless
 * 
 * Addresses confirmed cookie domain/path mismatch causing 401 errors.
 * Key fixes: proper domain handling, secure attributes, fallback error handling.
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
    console.warn('⚠️ Cookie store access failed, using fallback:', error instanceof Error ? error.message : 'Unknown error')
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
            console.error('❌ getAll() failed:', error instanceof Error ? error.message : 'Unknown error')
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
                console.warn('⚠️ Failed to set cookie:', name, setCookieError instanceof Error ? setCookieError.message : 'Unknown error')
              }
            })
          } catch (error) {
            console.warn('⚠️ setAll() failed (expected in Server Components):', error instanceof Error ? error.message : 'Unknown error')
            // This is expected to fail in Server Components that don't handle responses
            // The cookies will be set by the client-side auth flow instead
          }
        },
      },
    }
  )
}