import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authRateLimit } from '@/lib/middleware/rateLimit'
import { emailService } from '@/lib/email/service'
import { getEmailVerificationTemplate } from '@/lib/email/templates'
import { getBaseUrl } from '@/lib/env'

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
        emailRedirectTo: `${getBaseUrl()}/auth/callback`
      }
    })

    // Send custom verification email
    if (authData.user && !authData.user.email_confirmed_at) {
      const verificationLink = `${getBaseUrl()}/auth/verify-email?token=${authData.user.id}&email=${encodeURIComponent(validatedData.email)}`
      const emailTemplate = getEmailVerificationTemplate(verificationLink, validatedData.displayName)
      
      try {
        await emailService.sendEmail(validatedData.email, emailTemplate)
        console.log('Verification email sent successfully')
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Continue with registration even if email fails
      }
    }

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

    // Create user profile using admin client (bypasses RLS like OAuth callback)
    const adminClient = createAdminClient()
    
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        display_name: validatedData.displayName,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email_verified: false, // Will be true after email verification
        onboarding_completed: false, // User needs to complete onboarding
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
        hint: profileError.hint,
        userId: authData.user.id
      })
      
      // Critical: Clean up orphaned auth user if profile creation fails
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
        if (deleteError) {
          console.error('Failed to cleanup orphaned user:', deleteError)
        } else {
          console.log('✅ Cleaned up orphaned auth user:', authData.user.id)
        }
      } catch (cleanupError) {
        console.error('Cleanup operation failed:', cleanupError)
      }
      
      return NextResponse.json(
        { 
          error: 'Registration temporarily unavailable. Please try again in a few moments.',
          errorCode: 'PROFILE_CREATION_FAILED',
          retryable: true
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        displayName: validatedData.displayName,
        emailVerified: false
      },
      nextStep: 'email_verification'
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