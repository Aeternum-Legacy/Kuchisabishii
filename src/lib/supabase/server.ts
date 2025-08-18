import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, environment variables might not be available
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const cookieStore = await cookies()
  
  // Debug: Log available cookies
  console.log('🍪 Server cookies debug:', {
    totalCookies: cookieStore.getAll().length,
    cookieNames: cookieStore.getAll().map(c => c.name),
    supabaseCookies: cookieStore.getAll().filter(c => c.name.includes('supabase')),
    timestamp: new Date().toISOString()
  })

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          console.log('🔍 getAll() called, returning:', allCookies.length, 'cookies')
          return allCookies
        },
        setAll(cookiesToSet) {
          try {
            console.log('🔧 setAll() called with:', cookiesToSet.length, 'cookies')
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log('  Setting cookie:', name, 'with options:', options)
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.log('⚠️ setAll() failed:', error)
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}