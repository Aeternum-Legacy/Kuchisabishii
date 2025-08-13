import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// POST /api/friends/qr-token - Generate verification token for QR codes
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Generate a secure verification token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Store the token in the database
    const { error: insertError } = await supabase
      .from('qr_verification_tokens')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        used: false
      })

    if (insertError) {
      console.error('Error storing verification token:', insertError)
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
    }

    return NextResponse.json({ 
      token,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('QR token generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/friends/qr-token?token=xyz - Validate verification token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Validate the token
    const { data: tokenData, error: tokenError } = await supabase
      .from('qr_verification_tokens')
      .select(`
        id,
        user_id,
        expires_at,
        used,
        profiles!qr_verification_tokens_user_id_fkey(
          id,
          display_name,
          first_name,
          last_name,
          profile_image_url,
          email
        )
      `)
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    // Check if token has been used
    if (tokenData.used) {
      return NextResponse.json({ error: 'Token has already been used' }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: tokenData.profiles.id,
        displayName: tokenData.profiles.display_name,
        firstName: tokenData.profiles.first_name,
        lastName: tokenData.profiles.last_name,
        profileImage: tokenData.profiles.profile_image_url,
        email: tokenData.profiles.email
      }
    })

  } catch (error) {
    console.error('QR token validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}