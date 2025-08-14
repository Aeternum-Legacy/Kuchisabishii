import { NextRequest, NextResponse } from 'next/server'
import { emailTemplates } from '@/lib/email/templates'

/**
 * API endpoint for sending custom emails
 * This can be used as a fallback if Supabase email customization is limited
 */

// Example using Resend (recommended)
async function sendEmailWithResend(
  to: string,
  subject: string,
  html: string,
  text: string
) {
  const resendApiKey = process.env.RESEND_API_KEY
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`
    },
    body: JSON.stringify({
      from: 'Kuchisabishii <info@kuchisabishii.io>',
      to: [to],
      subject,
      html,
      text,
      reply_to: 'support@kuchisabishii.io'
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return await response.json()
}

// Example using SendGrid
async function sendEmailWithSendGrid(
  to: string,
  subject: string,
  html: string,
  text: string
) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  
  if (!sendgridApiKey) {
    throw new Error('SENDGRID_API_KEY not configured')
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sendgridApiKey}`
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }]
      }],
      from: {
        email: 'info@kuchisabishii.io',
        name: 'Kuchisabishii'
      },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send email: ${error}`)
  }

  return { success: true }
}

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json()

    // Validate input
    if (!type || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to' },
        { status: 400 }
      )
    }

    // Get the appropriate template
    let subject: string
    let html: string
    let text: string

    switch (type) {
      case 'verification':
        subject = emailTemplates.verification.subject
        html = emailTemplates.verification.html(
          data?.confirmationUrl || '',
          data?.userName
        )
        text = emailTemplates.verification.text(
          data?.confirmationUrl || '',
          data?.userName
        )
        break

      case 'passwordReset':
        subject = emailTemplates.passwordReset.subject
        html = emailTemplates.passwordReset.html(
          data?.resetUrl || '',
          data?.userName
        )
        text = emailTemplates.passwordReset.text(
          data?.resetUrl || '',
          data?.userName
        )
        break

      case 'welcome':
        subject = emailTemplates.welcome.subject
        html = emailTemplates.welcome.html(data?.userName)
        text = emailTemplates.welcome.text(data?.userName)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // Determine which email service to use
    let result
    
    if (process.env.RESEND_API_KEY) {
      result = await sendEmailWithResend(to, subject, html, text)
    } else if (process.env.SENDGRID_API_KEY) {
      result = await sendEmailWithSendGrid(to, subject, html, text)
    } else {
      // Fallback to Supabase (requires configuration)
      return NextResponse.json(
        { 
          error: 'No email service configured. Please set up RESEND_API_KEY or SENDGRID_API_KEY',
          help: 'See /docs/EMAIL_CONFIGURATION.md for setup instructions'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      result
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error },
      { status: 500 }
    )
  }
}

// GET endpoint to test email configuration
export async function GET() {
  const hasResend = !!process.env.RESEND_API_KEY
  const hasSendGrid = !!process.env.SENDGRID_API_KEY
  
  return NextResponse.json({
    configured: hasResend || hasSendGrid,
    services: {
      resend: hasResend,
      sendgrid: hasSendGrid
    },
    sender: 'info@kuchisabishii.io',
    templates: Object.keys(emailTemplates),
    usage: {
      endpoint: 'POST /api/email/send',
      body: {
        type: 'verification | passwordReset | welcome',
        to: 'user@example.com',
        data: {
          userName: 'John Doe',
          confirmationUrl: 'https://...',
          resetUrl: 'https://...'
        }
      }
    }
  })
}