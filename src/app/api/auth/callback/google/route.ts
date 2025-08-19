import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * OAuth Callback Handler with RLS-Bypass Profile Creation
 * 
 * Uses admin client for profile operations to bypass RLS restrictions
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
    // Use regular client for OAuth exchange
    const supabase = await createClient()
    
    // Use Supabase's native OAuth token exchange
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('❌ Supabase OAuth exchange failed:', {
        error: exchangeError.message,
        code: exchangeError.status,
        details: exchangeError
      })
      
      // Provide specific error feedback for PKCE issues
      if (exchangeError.message.includes('code verifier') || exchangeError.message.includes('invalid_request')) {
        return NextResponse.redirect(new URL(`/?error=auth_failed&message=${encodeURIComponent('OAuth exchange failed: invalid request: both auth code and code verifier should be non-empty')}`, requestUrl.origin))
      }
      
      throw new Error(`OAuth exchange failed: ${exchangeError.message}`)
    }
    
    if (!data.session || !data.user) {
      throw new Error('No session or user data received from OAuth')
    }
    
    // Use admin client for profile operations (bypasses RLS)
    const adminClient = createAdminClient()
    
    console.log('📝 Creating/updating profile for user:', {
      userId: data.user.id,
      email: data.user.email,
      metadata: data.user.user_metadata
    })
    
    // Check if profile exists using admin client
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, onboarding_completed, email')
      .eq('id', data.user.id)
      .single()
    
    if (!existingProfile) {
      // Create new profile using admin client with retry logic
      console.log('🔨 Creating new profile with admin client...')
      
      const profileData = {
        id: data.user.id,
        email: data.user.email || '',
        display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email || '',
        first_name: data.user.user_metadata?.given_name || '',
        last_name: data.user.user_metadata?.family_name || '',
        profile_image_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
        email_verified: data.user.email_confirmed_at ? true : false,
        privacy_level: 'friends',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Retry logic for race conditions
      let insertAttempts = 0
      const maxAttempts = 3
      let insertError: any = null
      
      while (insertAttempts < maxAttempts) {
        insertAttempts++
        
        const { error } = await adminClient
          .from('profiles')
          .insert(profileData)
        
        if (!error) {
          console.log('✅ Profile created successfully with admin client for user:', data.user.id)
          insertError = null
          break
        }
        
        insertError = error
        
        // If it's a unique constraint violation, the profile might already exist
        if (error.code === '23505') {
          console.log('ℹ️ Profile already exists (race condition detected), continuing...')
          insertError = null
          break
        }
        
        console.warn(`⚠️ Profile INSERT attempt ${insertAttempts} failed:`, {
          error: error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Wait briefly before retry
        if (insertAttempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100 * insertAttempts))
        }
      }
      
      if (insertError) {
        console.error('❌ Profile INSERT failed after all attempts:', {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          attempts: insertAttempts
        })
        
        // Critical: Profile creation must succeed for auth to work properly
        throw new Error(`Profile creation failed after ${maxAttempts} attempts: ${insertError.message}`)
      }
    } else {
      // Update existing profile using admin client
      console.log('🔄 Updating existing profile...')
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({
          email: data.user.email || existingProfile.email,
          profile_image_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
          email_verified: data.user.email_confirmed_at ? true : false,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.user.id)
      
      if (updateError) {
        console.error('⚠️ Profile update failed (non-critical):', updateError)
      } else {
        console.log('✅ Profile updated successfully with admin client for user:', data.user.id)
      }
    }
    
    // Check onboarding status using admin client
    const { data: profile } = await adminClient
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single()
    
    const redirectUrl = profile?.onboarding_completed ? '/app' : '/onboarding/intro'
    
    console.log('📊 OAuth callback complete:', {
      userId: data.user.id,
      profileExists: !!profile,
      onboardingCompleted: profile?.onboarding_completed,
      redirectUrl
    })
    
    // Supabase handles all session management automatically
    return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    
  } catch (error) {
    console.error('🚨 OAuth callback critical error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.redirect(new URL(`/?error=auth_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`, requestUrl.origin))
  }
}