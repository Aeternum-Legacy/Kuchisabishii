/**
 * Custom Email Templates for Kuchisabishii
 * Branded email communications for better user experience
 */

import { getBaseUrl } from '../env'

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  /**
   * Email Verification Template
   * Sent when user signs up for a new account
   */
  verification: {
    subject: '🍜 Welcome to Kuchisabishii - Verify Your Email',
    html: (confirmationUrl: string, userName?: string) => {
      const baseUrl = getBaseUrl()
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kuchisabishii</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8F6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF8F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px; background: linear-gradient(135deg, #FB923C 0%, #EF4444 100%); border-radius: 16px 16px 0 0;">
              <img src="${baseUrl}/images/kuchisabishii-logo.png" alt="Kuchisabishii" width="80" height="80" style="border-radius: 12px; background: white; padding: 8px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 10px; font-weight: 700;">Welcome to Kuchisabishii!</h1>
              <p style="color: #FED7AA; font-size: 16px; margin: 0;">When Your Mouth is Lonely</p>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px 30px 20px;">
              <h2 style="color: #1F2937; font-size: 22px; margin: 0 0 20px; font-weight: 600;">
                ${userName ? `Hi ${userName},` : 'Hello Food Lover,'}
              </h2>
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                We're excited to have you join our community of food enthusiasts! Kuchisabishii is more than just a food app – it's your personal journey through flavors, emotions, and culinary discoveries.
              </p>
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                To get started on your taste adventure, please verify your email address:
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 30px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #FB923C 0%, #EF4444 100%);">
                    <a href="${confirmationUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding: 20px 30px; background-color: #FEF3C7; border-radius: 12px; margin: 0 30px;">
              <h3 style="color: #92400E; font-size: 18px; margin: 0 0 15px; font-weight: 600;">
                🎯 What's Next?
              </h3>
              <ul style="color: #78350F; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Complete your taste profile with our AI-powered questionnaire</li>
                <li>Log your first food experience and start your journey</li>
                <li>Discover restaurants that match your unique palate</li>
                <li>Connect with friends who share your taste preferences</li>
              </ul>
            </td>
          </tr>

          <!-- Alternative Link -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #6B7280; font-size: 12px; line-height: 1.6; margin: 10px 0 0; word-break: break-all;">
                ${confirmationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; border-top: 1px solid #E5E7EB;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px;">
                      Follow your taste journey:
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 0 10px;">
                          <a href="https://instagram.com/kuchisabishii" style="color: #FB923C; text-decoration: none;">Instagram</a>
                        </td>
                        <td style="padding: 0 10px;">
                          <a href="https://twitter.com/kuchisabishii" style="color: #FB923C; text-decoration: none;">Twitter</a>
                        </td>
                        <td style="padding: 0 10px;">
                          <a href="${baseUrl}" style="color: #FB923C; text-decoration: none;">Website</a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #9CA3AF; font-size: 12px; margin: 20px 0 0;">
                      © 2024 Kuchisabishii. All rights reserved.<br>
                      This email was sent to you because you signed up for Kuchisabishii.<br>
                      If you didn't sign up, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
    },
    text: (confirmationUrl: string, userName?: string) => `
Welcome to Kuchisabishii - When Your Mouth is Lonely!

${userName ? `Hi ${userName},` : 'Hello Food Lover,'}

We're excited to have you join our community of food enthusiasts! Kuchisabishii is more than just a food app – it's your personal journey through flavors, emotions, and culinary discoveries.

Please verify your email address by clicking the link below:

${confirmationUrl}

What's Next?
- Complete your taste profile with our AI-powered questionnaire
- Log your first food experience and start your journey
- Discover restaurants that match your unique palate
- Connect with friends who share your taste preferences

If you didn't sign up for Kuchisabishii, please ignore this email.

Best regards,
The Kuchisabishii Team

© 2024 Kuchisabishii. All rights reserved.
    `
  },

  /**
   * Password Reset Template
   */
  passwordReset: {
    subject: '🔐 Reset Your Kuchisabishii Password',
    html: (resetUrl: string, userName?: string) => {
      const baseUrl = getBaseUrl()
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8F6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF8F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px; background: linear-gradient(135deg, #FB923C 0%, #EF4444 100%); border-radius: 16px 16px 0 0;">
              <img src="${baseUrl}/images/kuchisabishii-logo.png" alt="Kuchisabishii" width="80" height="80" style="border-radius: 12px; background: white; padding: 8px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 10px; font-weight: 700;">Password Reset Request</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1F2937; font-size: 20px; margin: 0 0 20px;">
                ${userName ? `Hi ${userName},` : 'Hello,'}
              </h2>
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 12px; background: linear-gradient(135deg, #FB923C 0%, #EF4444 100%);">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                            Reset My Password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                If you didn't request this password reset, you can safely ignore this email. Your password won't be changed.
              </p>
              
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                This link will expire in 1 hour for security reasons.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; border-top: 1px solid #E5E7EB;">
              <p style="color: #9CA3AF; font-size: 12px; margin: 0; text-align: center;">
                © 2024 Kuchisabishii. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
    },
    text: (resetUrl: string, userName?: string) => `
Password Reset Request

${userName ? `Hi ${userName},` : 'Hello,'}

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, you can safely ignore this email. Your password won't be changed.

Best regards,
The Kuchisabishii Team

© 2024 Kuchisabishii. All rights reserved.
    `
  },

  /**
   * Welcome Email (after verification)
   */
  welcome: {
    subject: '🎉 You\'re All Set! Start Your Kuchisabishii Journey',
    html: (userName?: string) => {
      const baseUrl = getBaseUrl()
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kuchisabishii!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8F6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FFF8F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px; background: linear-gradient(135deg, #FB923C 0%, #EF4444 100%); border-radius: 16px 16px 0 0;">
              <img src="${baseUrl}/images/kuchisabishii-logo.png" alt="Kuchisabishii" width="80" height="80" style="border-radius: 12px; background: white; padding: 8px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 10px; font-weight: 700;">You're Ready to Go! 🚀</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1F2937; font-size: 20px; margin: 0 0 20px;">
                ${userName ? `Welcome aboard, ${userName}!` : 'Welcome aboard!'}
              </h2>
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Your email is verified and your account is ready! Here are some quick tips to get the most out of Kuchisabishii:
              </p>

              <!-- Quick Start Guide -->
              <div style="background-color: #FEF3C7; border-radius: 12px; padding: 20px; margin: 0 0 30px;">
                <h3 style="color: #92400E; font-size: 18px; margin: 0 0 15px;">🏃 Quick Start Guide</h3>
                <ol style="color: #78350F; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>Build Your Taste Profile:</strong> Take our 5-minute AI questionnaire</li>
                  <li><strong>Log Your First Meal:</strong> Start tracking your food experiences</li>
                  <li><strong>Get Recommendations:</strong> Discover dishes matched to your palate</li>
                  <li><strong>Connect with Friends:</strong> Share and discover together</li>
                </ol>
              </div>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 12px; background: linear-gradient(135deg, #FB923C 0%, #EF4444 100%);">
                          <a href="${baseUrl}/onboarding" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                            Start Your Taste Journey
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; border-top: 1px solid #E5E7EB;">
              <p style="color: #9CA3AF; font-size: 12px; margin: 0; text-align: center;">
                © 2024 Kuchisabishii. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
    },
    text: (userName?: string) => {
      const baseUrl = getBaseUrl()
      return `
You're Ready to Go! 🚀

${userName ? `Welcome aboard, ${userName}!` : 'Welcome aboard!'}

Your email is verified and your account is ready! Here are some quick tips to get the most out of Kuchisabishii:

Quick Start Guide:
1. Build Your Taste Profile: Take our 5-minute AI questionnaire
2. Log Your First Meal: Start tracking your food experiences
3. Get Recommendations: Discover dishes matched to your palate
4. Connect with Friends: Share and discover together

Start your taste journey at: ${baseUrl}/onboarding

Best regards,
The Kuchisabishii Team

© 2024 Kuchisabishii. All rights reserved.
    `
    }
  }
}

// Named export functions for backwards compatibility
export function getEmailVerificationTemplate(
  confirmationUrl: string, 
  userName?: string
): EmailTemplate {
  return {
    subject: emailTemplates.verification.subject,
    html: emailTemplates.verification.html(confirmationUrl, userName),
    text: emailTemplates.verification.text(confirmationUrl, userName)
  }
}

export function getPasswordResetTemplate(
  resetUrl: string, 
  userName?: string
): EmailTemplate {
  return {
    subject: emailTemplates.passwordReset.subject,
    html: emailTemplates.passwordReset.html(resetUrl, userName),
    text: emailTemplates.passwordReset.text(resetUrl, userName)
  }
}

export function getWelcomeTemplate(userName?: string): EmailTemplate {
  return {
    subject: emailTemplates.welcome.subject,
    html: emailTemplates.welcome.html(userName),
    text: emailTemplates.welcome.text(userName)
  }
}


export interface EmailTemplate {
  subject: string
  html: string
  text: string
}