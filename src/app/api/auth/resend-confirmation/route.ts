import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { emailResendRateLimit } from '@/lib/middleware/rateLimit'
import { emailService } from '@/lib/email/service'
import { getEmailVerificationTemplate } from '@/lib/email/templates'

const resendSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = emailResendRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.error,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    const body = await request.json()
    const validatedData = resendSchema.parse(body)
    
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

    // Get the base URL - use production URL if available, fallback to localhost
    const baseUrl = process.env.NEXTAUTH_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000'
    
    // Get user profile for personalized email
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, first_name')
      .eq('email', validatedData.email)
      .single()

    const displayName = profile?.display_name || profile?.first_name || 'there'
    
    // Send custom verification email
    const verificationLink = `${baseUrl}/auth/verify-email?email=${encodeURIComponent(validatedData.email)}`
    const emailTemplate = getEmailVerificationTemplate(verificationLink, displayName)
    
    const emailSent = await emailService.sendEmail(validatedData.email, emailTemplate)
    
    if (!emailSent) {
      // Fallback to Supabase resend if custom email fails
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: validatedData.email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback`
        }
      })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: 'Confirmation email sent successfully. Please check your inbox.'
    })

  } catch (error) {
    console.error('Resend confirmation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}