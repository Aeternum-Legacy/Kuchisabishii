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

    // Use NextAuth.js for professional OAuth flow (shows your domain, not Supabase)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const googleOAuthUrl = `${baseUrl}/api/auth/signin/google`
    
    return NextResponse.json({
      url: googleOAuthUrl,
      provider: 'google',
      message: 'Redirecting to professional OAuth flow'
    })

  } catch (error) {
    console.error('Google auth API error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    )
  }
}