import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Get cookie store with error handling
  let cookieStore
  try {
    cookieStore = await cookies()
  } catch (error) {
    console.error('❌ Failed to get cookies:', error)
    // Fallback: create a mock cookie store
    cookieStore = {
      getAll: () => [],
      set: () => {},
      delete: () => {}
    }
  }

  // Debug: Log available cookies
  const allCookies = cookieStore.getAll()
  console.log('🍪 Server cookies (fixed):', {
    totalCookies: allCookies.length,
    cookieNames: allCookies.map(c => c.name),
    supabaseCookies: allCookies.filter(c => c.name.startsWith('sb-') || c.name.includes('supabase')),
    timestamp: new Date().toISOString()
  })

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          try {
            const cookies = cookieStore.getAll()
            console.log('🔍 getAll() called, returning:', cookies.length, 'cookies')
            return cookies
          } catch (error) {
            console.error('❌ getAll() failed:', error)
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            console.log('🔧 setAll() called with:', cookiesToSet.length, 'cookies')
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                console.log('  Setting cookie:', name)
                cookieStore.set(name, value, options)
              } catch (setCookieError) {
                console.log('  Failed to set cookie:', name, setCookieError)
              }
            })
          } catch (error) {
            console.log('⚠️ setAll() failed:', error)
            // Silently fail in Server Components
          }
        },
      },
    }
  )
}