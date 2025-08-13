import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { socialAuthRateLimit } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = socialAuthRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.error,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    const supabase = await createClient()
    
    // Get the redirect URL from the request or use default
    const { redirectTo } = await request.json().catch(() => ({}))
    const redirectUrl = redirectTo || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/callback`
    
    // Sign in with Apple OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUrl,
        scopes: 'name email'
      }
    })

    if (error) {
      console.error('Apple OAuth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      url: data.url,
      provider: 'apple'
    })

  } catch (error) {
    console.error('Apple auth API error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Apple authentication' },
      { status: 500 }
    )
  }
}