import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Clean OAuth Callback Handler
 * 
 * Uses unified Supabase client for OAuth code exchange and user profile management
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  
  if (error) {
    return NextResponse.redirect(new URL(`/?error=oauth_error&details=${encodeURIComponent(error)}`, requestUrl.origin))
  }
  
  // For PKCE flow, we expect an authorization code
  if (!code) {
    return NextResponse.redirect(new URL('/app', requestUrl.origin))
  }

  try {
    const supabase = await createClient()
    
    // Use Supabase's native OAuth token exchange
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('❌ Supabase OAuth exchange failed:', exchangeError)
      throw new Error(`OAuth exchange failed: ${exchangeError.message}`)
    }
    
    if (!data.session || !data.user) {
      throw new Error('No session or user data received from OAuth')
    }
    
    
    // Create or update user profile with OAuth data
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: data.user.email || '',
        display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
        first_name: data.user.user_metadata?.given_name || '',
        last_name: data.user.user_metadata?.family_name || '',
        profile_image_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
        email_verified: data.user.email_confirmed_at ? true : false,
        privacy_level: 'friends',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
    
    if (profileError) {
      // Don't fail the authentication for profile errors
    }
    
    // Check onboarding status to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single()
    
    const redirectUrl = profile?.onboarding_completed ? '/app' : '/onboarding/intro'
    
    
    // Supabase handles all session management automatically
    return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    
  } catch (error) {
    return NextResponse.redirect(new URL(`/?error=auth_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`, requestUrl.origin))
  }
}