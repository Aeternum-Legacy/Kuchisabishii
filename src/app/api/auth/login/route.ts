import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authRateLimit } from '@/lib/middleware/rateLimit'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = authRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.error,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    let supabase
    try {
      supabase = await createClient()
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      return NextResponse.json(
        { 
          error: 'Authentication service unavailable. Please check environment configuration.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 503 }
      )
    }
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    })

    if (authError) {
      // Check if it's an email not confirmed error
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { 
            error: 'Email not verified',
            code: 'EMAIL_NOT_VERIFIED',
            email: validatedData.email,
            message: 'Please check your email and click the confirmation link before signing in.'
          },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // Continue without profile data if fetch fails
    }

    // Return user data - Supabase handles session cookies automatically
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        displayName: profile?.display_name || authData.user.user_metadata?.display_name,
        firstName: profile?.first_name || authData.user.user_metadata?.first_name,
        lastName: profile?.last_name || authData.user.user_metadata?.last_name,
        profileImage: profile?.profile_image_url,
        onboardingCompleted: profile?.onboarding_completed || false
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check /api/health endpoint for configuration status'
      },
      { status: 500 }
    )
  }
}