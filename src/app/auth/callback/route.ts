import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/onboarding'

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.session) {
        // Enhanced session handling - ensure cookies are properly set
        const response = NextResponse.redirect(new URL(next, requestUrl.origin))
        
        // Set additional auth success indicator for client-side handling
        response.cookies.set('auth-success', 'true', {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 // 1 minute, just for the redirect
        })
        
        return response
      } else {
        console.error('Session exchange failed:', error)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // If there's an error, redirect to login with error message
  return NextResponse.redirect(new URL('/?error=auth_callback_error', requestUrl.origin))
}