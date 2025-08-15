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
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
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
    console.log('Google user authenticated:', googleUser.email)
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Generate a temporary password for the OAuth user
    const tempPassword = crypto.randomUUID() + crypto.randomUUID()
    
    // Try to sign up first (will fail if user exists)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: googleUser.email,
      password: tempPassword,
      options: {
        data: {
          display_name: googleUser.name,
          first_name: googleUser.given_name,
          last_name: googleUser.family_name,
          profile_image_url: googleUser.picture,
          provider: 'google',
          google_id: googleUser.id
        }
      }
    })
    
    let userId = signUpData?.user?.id
    
    // If signup failed because user exists, get existing user
    if (signUpError?.message.includes('already registered')) {
      // Get existing user by email
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
      if (!listError) {
        const existingUser = users?.find(u => u.email === googleUser.email)
        if (existingUser) {
          userId = existingUser.id
          // Update the user's password
          await supabase.auth.admin.updateUserById(userId, { password: tempPassword })
        }
      }
    }
    
    if (!userId) {
      throw new Error('Failed to create or find user')
    }
    
    // Create/update profile in database
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: googleUser.email,
        display_name: googleUser.name || '',
        first_name: googleUser.given_name || '',
        last_name: googleUser.family_name || '',
        profile_image_url: googleUser.picture,
        email_verified: true,
        privacy_level: 'friends',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
    
    if (profileError) {
      console.error('Profile upsert error:', profileError)
    }
    
    // Now sign in the user with the temporary password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: googleUser.email,
      password: tempPassword
    })
    
    if (signInError || !signInData.session) {
      console.error('Sign in failed:', signInError)
      throw new Error('Failed to create session')
    }
    
    // Success! Set cookies and redirect
    const response = NextResponse.redirect(new URL('/', requestUrl.origin))
    
    // Set Supabase auth cookies manually
    response.cookies.set('sb-access-token', signInData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    
    response.cookies.set('sb-refresh-token', signInData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    return response
    
    // Fallback redirect
    return NextResponse.redirect(new URL('/?auth=success', requestUrl.origin))
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=callback_error', requestUrl.origin))
  }
}