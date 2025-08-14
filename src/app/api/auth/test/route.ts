import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'NextAuth.js routes are working',
    url: request.url,
    timestamp: new Date().toISOString(),
    nextAuthUrl: process.env.NEXTAUTH_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing'
  })
}