import { NextRequest, NextResponse } from 'next/server'
import { socialAuthRateLimit } from '@/lib/middleware/rateLimit'
import { getBaseUrl, getOAuthCallbackUrl } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    // Use environment-aware base URL
    const baseUrl = getBaseUrl()
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { 
          error: 'Google OAuth not configured',
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          baseUrl
        },
        { status: 500 }
      )
    }
    
    // Build Google OAuth URL with environment-aware callback
    const redirectUri = getOAuthCallbackUrl('google')
    const googleOAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleOAuthUrl.searchParams.set('client_id', clientId)
    googleOAuthUrl.searchParams.set('redirect_uri', redirectUri)
    googleOAuthUrl.searchParams.set('response_type', 'code')
    googleOAuthUrl.searchParams.set('scope', 'email profile')
    googleOAuthUrl.searchParams.set('access_type', 'offline')
    googleOAuthUrl.searchParams.set('prompt', 'consent')
    
    return NextResponse.json({
      url: googleOAuthUrl.toString(),
      provider: 'google',
      redirectUri,
      message: 'Redirecting to Google OAuth'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to initiate Google authentication',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  // If action=signin, handle OAuth flow
  if (action === 'signin') {
    try {
      const baseUrl = getBaseUrl()
      const clientId = process.env.GOOGLE_CLIENT_ID
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET
      
      if (!clientId || !clientSecret) {
        return NextResponse.json(
          { 
            error: 'Google OAuth not configured',
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret
          },
          { status: 500 }
        )
      }
      
      // Build Google OAuth URL with environment-aware callback
      const redirectUri = getOAuthCallbackUrl('google')
      const googleOAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      googleOAuthUrl.searchParams.set('client_id', clientId)
      googleOAuthUrl.searchParams.set('redirect_uri', redirectUri)
      googleOAuthUrl.searchParams.set('response_type', 'code')
      googleOAuthUrl.searchParams.set('scope', 'email profile')
      googleOAuthUrl.searchParams.set('access_type', 'offline')
      googleOAuthUrl.searchParams.set('prompt', 'consent')
      
      return NextResponse.json({
        url: googleOAuthUrl.toString(),
        provider: 'google',
        redirectUri,
        message: 'Redirecting to Google OAuth'
      })
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Failed to initiate Google authentication',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  }
  
  // Default test response
  return NextResponse.json({
    message: 'Google OAuth endpoint is working',
    timestamp: new Date().toISOString(),
    method: 'GET',
    env: {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      nextAuthUrl: getBaseUrl()
    }
  })
}