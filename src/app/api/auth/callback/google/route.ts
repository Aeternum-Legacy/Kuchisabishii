import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  
  console.log('🔍 OAuth Callback Started:', {
    url: requestUrl.toString(),
    hasCode: !!code,
    error,
    timestamp: new Date().toISOString()
  })
  
  if (error) {
    console.error('❌ Google OAuth error:', error)
    return NextResponse.redirect(new URL(`/debug-oauth?error=oauth_error&details=${encodeURIComponent(error)}`, requestUrl.origin))
  }
  
  if (!code) {
    console.error('❌ No authorization code received')
    return NextResponse.redirect(new URL('/debug-oauth?error=no_code', requestUrl.origin))
  }

  try {
    console.log('🔄 Step 1: Starting token exchange with Google...')
    
    // Check environment variables first
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error(`Missing OAuth credentials: clientId=${!!process.env.GOOGLE_CLIENT_ID}, clientSecret=${!!process.env.GOOGLE_CLIENT_SECRET}`)
    }
    
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
    
    console.log('🔄 Step 2: Token exchange response received:', {
      status: tokenResponse.status,
      ok: tokenResponse.ok
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
    console.log('✅ Google user authenticated:', {
      email: googleUser.email,
      name: googleUser.name,
      id: googleUser.id,
      verified_email: googleUser.verified_email
    })
    
    // Create Supabase client
    const supabase = await createClient()
    console.log('🔗 Supabase client created')
    
    // Check if user already has a valid session first
    const { data: { session: existingSession } } = await supabase.auth.getSession()
    
    if (existingSession?.user?.email === googleUser.email) {
      console.log('✅ User already has valid session, redirecting...')
      
      // Check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', existingSession.user.id)
        .single()
      
      const redirectUrl = profile?.onboarding_completed ? '/app' : '/onboarding/intro'
      console.log('🔄 Redirecting existing session to:', redirectUrl)
      
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    }
    
    console.log('🔄 Step 4: No existing session, handling OAuth user...')
    
    // Find existing user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    let userId: string | undefined
    let existingUser = null
    
    if (!listError && users) {
      existingUser = users.find(u => u.email === googleUser.email)
      if (existingUser) {
        userId = existingUser.id
        console.log('✅ Found existing user:', { id: existingUser.id, email: existingUser.email })
      }
    }
    
    // Generate a temporary password for signing in
    const tempPassword = crypto.randomUUID() + crypto.randomUUID()
    
    if (existingUser) {
      // Update existing user's password for sign-in
      console.log('🔄 Updating existing user password...')
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId!, {
        password: tempPassword,
        user_metadata: {
          ...existingUser.user_metadata,
          display_name: googleUser.name,
          first_name: googleUser.given_name,
          last_name: googleUser.family_name,
          profile_image_url: googleUser.picture,
          provider: 'google',
          google_id: googleUser.id
        }
      })
      
      if (updateError) {
        console.error('Failed to update user:', updateError)
        throw new Error('Failed to update user')
      }
    } else {
      // Create new user
      console.log('🔄 Creating new user...')
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
      
      if (signUpError) {
        console.error('Signup error:', signUpError)
        throw new Error(`Failed to create user: ${signUpError.message}`)
      }
      
      userId = signUpData?.user?.id
      console.log('✅ New user created:', userId)
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
    
    // Now sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: googleUser.email,
      password: tempPassword
    })
    
    if (signInError || !signInData.session) {
      console.error('Sign in failed:', signInError)
      throw new Error('Failed to create session')
    }
    
    // Success! Set cookies and redirect
    console.log('🎉 OAuth Success! Creating session and redirecting:', {
      userId: userId,
      email: googleUser.email,
      sessionExists: !!signInData.session,
      accessToken: signInData.session.access_token ? 'SET' : 'MISSING'
    })
    
    // Determine redirect URL based on profile completeness
    let redirectUrl = '/onboarding/intro'
    
    // Check if profile is complete
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single()
    
    if (profile?.onboarding_completed) {
      redirectUrl = '/app'
    }
    
    console.log('🔄 Redirecting to:', redirectUrl)
    const response = NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    
    // Set proper Supabase auth cookies
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
    const projectRef = supabaseUrl.hostname.split('.')[0]
    
    response.cookies.set(`sb-${projectRef}-auth-token`, JSON.stringify({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      provider_token: null,
      provider_refresh_token: null,
      user: signInData.user
    }), {
      httpOnly: false, // Supabase client needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    
    console.log('🍪 Session cookies set, redirecting to:', redirectUrl)
    return response
    
  } catch (error) {
    console.error('💥 OAuth callback error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.redirect(new URL(`/?error=auth_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`, requestUrl.origin))
  }
}