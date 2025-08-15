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
    
    // Create or sign in the user using Supabase Admin API
    // First, check if user exists in Supabase auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    let supabaseUserId = null
    
    if (!usersError) {
      const existingAuthUser = users?.find(u => u.email === googleUser.email)
      
      if (existingAuthUser) {
        supabaseUserId = existingAuthUser.id
      } else {
        // Create new auth user using admin API
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: googleUser.email,
          email_confirm: true,
          user_metadata: {
            display_name: googleUser.name,
            first_name: googleUser.given_name,
            last_name: googleUser.family_name,
            profile_image_url: googleUser.picture,
            provider: 'google',
            google_id: googleUser.id
          }
        })
        
        if (!createError && newUser?.user) {
          supabaseUserId = newUser.user.id
          
          // Update profile with correct Supabase user ID
          await supabase
            .from('profiles')
            .update({ id: supabaseUserId })
            .eq('email', googleUser.email)
        }
      }
    }
    
    // Generate a session token for the user
    if (supabaseUserId) {
      // Create a session using the service role
      const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: googleUser.email,
      })
      
      // Set auth cookie for session persistence
      const response = NextResponse.redirect(new URL('/', requestUrl.origin))
      
      // Set a custom session cookie
      response.cookies.set('sb-auth-token', JSON.stringify({
        user_id: supabaseUserId,
        email: googleUser.email,
        provider: 'google',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      return response
    }
    
    // Fallback redirect if session creation fails
    return NextResponse.redirect(new URL('/?auth=google_success', requestUrl.origin))
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=callback_error', requestUrl.origin))
  }
}