import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: {
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url_length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      message: 'POST endpoint working',
      received: body
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to parse JSON',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}