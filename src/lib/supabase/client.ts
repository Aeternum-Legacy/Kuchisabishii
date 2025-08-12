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
      detectSessionInUrl: true
    }
  })
}

export const supabase = getSupabaseClient()