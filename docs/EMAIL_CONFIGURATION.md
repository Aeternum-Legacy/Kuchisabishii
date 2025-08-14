# Email Configuration Guide for Kuchisabishii

## 🎯 Overview
This guide will help you set up custom email templates and configure the sender email address (info@kuchisabishii.io) in Supabase.

## 📧 Step 1: Configure Custom Sender Email

### A. Domain Setup (Required First)
1. **Verify Domain Ownership**
   - Add Kuchisabishii.io domain to your email service provider
   - Common providers: SendGrid, Resend, Mailgun, AWS SES, Postmark

2. **DNS Records Required**
   ```
   Type: MX
   Host: @
   Value: [Your email provider's MX records]
   Priority: 10

   Type: TXT (SPF)
   Host: @
   Value: "v=spf1 include:[provider] ~all"

   Type: TXT (DKIM)
   Host: [provider-specific]
   Value: [DKIM key from provider]
   ```

### B. Email Service Provider Setup

#### Option 1: Resend (Recommended - Easy Setup)
1. Sign up at https://resend.com
2. Add domain kuchisabishii.io
3. Verify DNS records
4. Get API key
5. Note the API endpoint

#### Option 2: SendGrid
1. Sign up at https://sendgrid.com
2. Verify domain kuchisabishii.io
3. Create API key with full access
4. Note SMTP credentials

#### Option 3: AWS SES
1. Add domain in AWS SES console
2. Verify domain ownership
3. Move out of sandbox mode
4. Get SMTP credentials

## 📝 Step 2: Configure Supabase Email Settings

### Navigate to Supabase Dashboard
1. Go to your project dashboard
2. Click **Settings** → **Auth**
3. Scroll to **Email Templates** section

### Configure SMTP Settings
1. Click **Settings** → **Auth** → **SMTP Settings**
2. Enable **"Custom SMTP"**
3. Enter your SMTP configuration:

```
For Resend:
- Host: smtp.resend.com
- Port: 465 (SSL) or 587 (TLS)
- Username: resend
- Password: [Your API Key]
- Sender Email: info@kuchisabishii.io
- Sender Name: Kuchisabishii

For SendGrid:
- Host: smtp.sendgrid.net
- Port: 465 (SSL) or 587 (TLS)
- Username: apikey
- Password: [Your API Key]
- Sender Email: info@kuchisabishii.io
- Sender Name: Kuchisabishii

For AWS SES:
- Host: email-smtp.[region].amazonaws.com
- Port: 465 (SSL) or 587 (TLS)
- Username: [SMTP Username]
- Password: [SMTP Password]
- Sender Email: info@kuchisabishii.io
- Sender Name: Kuchisabishii
```

4. Test the configuration with **"Send Test Email"**

## 🎨 Step 3: Update Email Templates in Supabase

### Navigate to Email Templates
1. Go to **Settings** → **Auth** → **Email Templates**
2. You'll see different template types:
   - Confirm Email
   - Reset Password
   - Magic Link
   - Invite User
   - Change Email

### Update "Confirm Email" Template

**Subject:**
```
🍜 Welcome to Kuchisabishii - Verify Your Email
```

**HTML Body:**
Copy the HTML from `src/lib/email/templates.ts` → `verification.html`

Important: Replace `${confirmationUrl}` with Supabase variable:
```html
<!-- Replace this -->
<a href="${confirmationUrl}">

<!-- With this -->
<a href="{{ .ConfirmationURL }}">
```

### Update "Reset Password" Template

**Subject:**
```
🔐 Reset Your Kuchisabishii Password
```

**HTML Body:**
Copy the HTML from `src/lib/email/templates.ts` → `passwordReset.html`

Replace `${resetUrl}` with `{{ .ConfirmationURL }}`

### Template Variables Available in Supabase
- `{{ .ConfirmationURL }}` - The verification/reset link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Verification token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL

## 🔧 Step 4: Update Redirect URLs

1. Go to **Settings** → **Auth** → **URL Configuration**
2. Update these URLs:

```
Site URL: https://kuchisabishii.io
Redirect URLs: 
  - https://kuchisabishii.io/auth/callback
  - https://kuchisabishii.io/auth/confirm
  - https://kuchisabishii.io/auth/reset-password
  - http://localhost:3000/auth/callback (for development)
```

## 🧪 Step 5: Test Email Configuration

### Test Verification Email
1. Sign up with a test account
2. Check if email arrives from info@kuchisabishii.io
3. Verify branding is correct
4. Test the verification link

### Test Password Reset
1. Click "Forgot Password"
2. Enter test email
3. Check email formatting
4. Test reset link functionality

## 🚀 Step 6: Production Checklist

- [ ] Domain DNS records configured
- [ ] Email provider account active
- [ ] SMTP settings tested in Supabase
- [ ] All email templates updated
- [ ] Sender email shows as info@kuchisabishii.io
- [ ] Redirect URLs configured correctly
- [ ] Test emails working properly
- [ ] Logo displays correctly in emails
- [ ] Links work on mobile devices

## 📌 Environment Variables Needed

Add these to your `.env.local`:

```env
# Email Configuration (for API-based sending)
EMAIL_FROM=info@kuchisabishii.io
EMAIL_FROM_NAME=Kuchisabishii

# Resend (if using)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# SendGrid (if using)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# AWS SES (if using)
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=xxxxxxxxxxxxx
AWS_SES_SECRET_ACCESS_KEY=xxxxxxxxxxxxx
```

## 🆘 Troubleshooting

### Emails not sending
1. Check SMTP credentials
2. Verify domain DNS records
3. Check Supabase logs: **Settings** → **Logs** → **Auth Logs**

### Emails going to spam
1. Ensure SPF/DKIM records are set
2. Add DMARC record
3. Use a reputable email service
4. Avoid spam trigger words

### Custom sender not showing
1. Verify SMTP is enabled in Supabase
2. Check "Sender Email" field in SMTP settings
3. Test with "Send Test Email" button

## 📚 Additional Resources

- [Supabase Email Auth Docs](https://supabase.com/docs/guides/auth/auth-email)
- [Resend Documentation](https://resend.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)

## 🎯 Quick Setup with Resend (Fastest Option)

1. **Sign up at Resend.com** (free tier available)
2. **Add domain** kuchisabishii.io
3. **Add DNS records** they provide
4. **Get API key**
5. **In Supabase:**
   - Enable Custom SMTP
   - Host: smtp.resend.com
   - Port: 465
   - Username: resend
   - Password: [API Key]
   - Sender: info@kuchisabishii.io
6. **Update templates** with custom HTML
7. **Test everything!**

---

Once configured, all emails will be sent from **info@kuchisabishii.io** with your custom Kuchisabishii branding! 🎉