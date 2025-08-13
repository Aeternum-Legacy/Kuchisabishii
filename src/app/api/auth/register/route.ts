import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authRateLimit } from '@/lib/middleware/rateLimit'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
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
    const validatedData = registerSchema.parse(body)
    
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
    
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          display_name: validatedData.displayName,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName
        },
        emailRedirectTo: `${process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/auth/callback`
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // Create user profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        display_name: validatedData.displayName,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        privacy_level: 'friends', // Default privacy level
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      console.error('Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      
      // If profile creation fails, we should actually fail the registration
      // since the profile is essential for the app functionality
      return NextResponse.json(
        { 
          error: 'Failed to create user profile. Please try again.',
          details: 'Profile creation failed after successful authentication'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        displayName: validatedData.displayName
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
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