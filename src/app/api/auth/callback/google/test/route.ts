import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    
    return NextResponse.json({
      message: 'Google OAuth callback route is accessible',
      timestamp: new Date().toISOString(),
      url: requestUrl.toString(),
      params: Object.fromEntries(requestUrl.searchParams),
      environment: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Callback test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}