import { NextRequest, NextResponse } from 'next/server'
import { socialAuthRateLimit } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  console.log('Google OAuth endpoint hit:', new Date().toISOString())
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

    // Create direct Google OAuth URL for professional appearance
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${baseUrl}/api/auth/callback/google`
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google OAuth not configured' },
        { status: 500 }
      )
    }
    
    // Build Google OAuth URL manually for better control
    const googleOAuthUrl = new URL('https://accounts.google.com/oauth/authorize')
    googleOAuthUrl.searchParams.set('client_id', clientId)
    googleOAuthUrl.searchParams.set('redirect_uri', redirectUri)
    googleOAuthUrl.searchParams.set('response_type', 'code')
    googleOAuthUrl.searchParams.set('scope', 'email profile')
    googleOAuthUrl.searchParams.set('access_type', 'offline')
    googleOAuthUrl.searchParams.set('prompt', 'consent')
    
    return NextResponse.json({
      url: googleOAuthUrl.toString(),
      provider: 'google',
      message: 'Redirecting to Google OAuth'
    })

  } catch (error) {
    console.error('Google auth API error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Google OAuth endpoint is working',
    timestamp: new Date().toISOString(),
    method: 'GET'
  })
}