import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  
  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=oauth_error', requestUrl.origin))
  }
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', requestUrl.origin))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user info')
    }

    const googleUser = await userResponse.json()
    
    // Create or update user in Supabase
    const supabase = await createClient()
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single()
    
    if (!existingUser) {
      // Create new user
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: googleUser.id,
          email: googleUser.email,
          display_name: googleUser.name || '',
          first_name: googleUser.given_name || '',
          last_name: googleUser.family_name || '',
          profile_image_url: googleUser.picture,
          email_verified: true,
          privacy_level: 'friends',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Failed to create user:', insertError)
        throw new Error('Failed to create user account')
      }
    }
    
    // Sign in the user to Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: googleUser.email,
      password: googleUser.id // Use Google ID as password for OAuth users
    })
    
    if (authError) {
      // If password sign-in fails, create a Supabase user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: googleUser.email,
        password: googleUser.id,
        options: {
          emailRedirectTo: `${requestUrl.origin}/auth/callback`,
          data: {
            display_name: googleUser.name,
            first_name: googleUser.given_name,
            last_name: googleUser.family_name,
            profile_image_url: googleUser.picture,
            email_verified: true
          }
        }
      })
      
      if (signUpError) {
        console.error('Failed to create Supabase auth user:', signUpError)
        throw new Error('Failed to authenticate user')
      }
    }
    
    // Redirect to home page
    return NextResponse.redirect(new URL('/', requestUrl.origin))
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=callback_error', requestUrl.origin))
  }
}