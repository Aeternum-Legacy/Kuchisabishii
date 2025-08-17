import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * SPARC Architecture: Native Supabase OAuth Callback
 * 
 * This endpoint uses ONLY Supabase's native OAuth handling to:
 * 1. Exchange the authorization code for tokens using Supabase's built-in methods
 * 2. Create user profiles using the authenticated user data
 * 3. Redirect users based on onboarding completion status
 * 
 * NO manual token generation, NO manual session management, NO manual cookies
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  
  console.log('🔍 Supabase Native OAuth Callback:', {
    hasCode: !!code,
    error,
    url: requestUrl.toString(),
    timestamp: new Date().toISOString()
  })
  
  if (error) {
    console.error('❌ OAuth error:', error)
    return NextResponse.redirect(new URL(`/?error=oauth_error&details=${encodeURIComponent(error)}`, requestUrl.origin))
  }
  
  // For implicit flow, tokens are in URL fragment, not query params
  // Supabase handles this automatically, so we just redirect to success
  if (!code) {
    console.log('✅ Implicit flow detected - redirecting to app')
    return NextResponse.redirect(new URL('/app', requestUrl.origin))
  }

  try {
    // Create Supabase client and let it handle OAuth flow
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
    
    console.log('✅ Supabase OAuth success:', {
      userId: data.user.id,
      email: data.user.email,
      provider: data.user.app_metadata?.provider
    })
    
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
      console.warn('Profile upsert warning:', profileError)
      // Don't fail the authentication for profile errors
    }
    
    // Check onboarding status to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single()
    
    const redirectUrl = profile?.onboarding_completed ? '/app' : '/onboarding/intro'
    
    console.log('🔄 Redirecting to:', redirectUrl)
    
    // Supabase handles all session management automatically
    return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    
  } catch (error) {
    console.error('💥 OAuth callback error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    return NextResponse.redirect(new URL(`/?error=auth_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`, requestUrl.origin))
  }
}