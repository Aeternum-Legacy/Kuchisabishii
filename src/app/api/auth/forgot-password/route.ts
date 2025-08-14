import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { emailService } from '@/lib/email/service'
import { getPasswordResetTemplate } from '@/lib/email/templates'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)
    
    const supabase = await createClient()
    
    // Get user profile for personalized email
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, first_name')
      .eq('email', validatedData.email)
      .single()

    if (profile) {
      const displayName = profile.display_name || profile.first_name || 'there'
      
      // Generate password reset token
      const { data, error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password`
      })
      
      if (!error) {
        // Send custom password reset email
        const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?email=${encodeURIComponent(validatedData.email)}`
        const emailTemplate = getPasswordResetTemplate(resetLink, displayName)
        
        try {
          await emailService.sendEmail(validatedData.email, emailTemplate)
          console.log('Password reset email sent successfully')
        } catch (emailError) {
          console.error('Failed to send custom reset email:', emailError)
          // Supabase default email will still be sent
        }
      }
    }

    // Always return success message for security (don't reveal if email exists)
    return NextResponse.json({
      message: 'If an account with that email exists, you will receive a password reset link within a few minutes. Please check your inbox and spam folder.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}