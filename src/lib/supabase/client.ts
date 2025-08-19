import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// SPARC Architecture: Simplified Supabase Client Factory
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build, this is expected
    if (typeof window === 'undefined') {
      return null
    }
    // In browser, this is a configuration error
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // SPARC Architecture: Native OAuth Configuration
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'implicit', // Changed from PKCE to implicit for staging testing
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      debug: true // Enable debug for OAuth troubleshooting
    },
    global: {
      headers: {
        'X-Client-Info': 'kuchisabishii-web@1.0.0'
      }
    }
  })
}

// Export the configured Supabase client
export const supabase = getSupabaseClient()