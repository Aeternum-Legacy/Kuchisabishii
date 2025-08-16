import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a function to get the Supabase client
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build, this is okay
    if (typeof window === 'undefined') {
      return null
    }
    // In browser, this is a configuration error
    console.error('Missing Supabase environment variables')
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Configure OAuth flow for proper redirect handling
      flowType: 'pkce',
      // Set storage options for better session management
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    },
    // Enhanced global options
    global: {
      headers: {
        'X-Client-Info': 'kuchisabishii-web@1.0.0'
      }
    }
  })
}

export const supabase = getSupabaseClient()