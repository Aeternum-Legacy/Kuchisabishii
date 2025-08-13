# Kuchisabishii Authentication Setup Guide

This guide walks you through setting up the complete authentication system for Kuchisabishii, including email/password authentication and social login with Google and Apple.

## Overview

The authentication system includes:
- Email/password registration and login
- Google OAuth integration
- Apple Sign-In integration
- Email verification system
- Rate limiting for security
- Password strength validation
- Session management
- Animated UI transitions

## Prerequisites

1. Supabase project with authentication enabled
2. Google Cloud Console account (for Google OAuth)
3. Apple Developer account (for Apple Sign-In)
4. Domain ownership (for production deployment)

## Supabase Configuration

### 1. Database Setup

The authentication system requires a `profiles` table. Ensure this table exists in your Supabase database:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    location TEXT,
    dietary_restrictions TEXT[],
    date_of_birth DATE,
    privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('private', 'friends', 'public')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

### 2. Authentication Settings

In your Supabase dashboard:

1. Go to **Authentication** > **Settings**
2. Configure the following settings:
   - **Site URL**: `http://localhost:3000` (development) / `https://yourdomain.com` (production)
   - **Redirect URLs**: Add your callback URLs
   - **Email templates**: Customize confirmation and recovery emails
   - **Rate limiting**: Configure as needed

### 3. Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth Provider Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_PRIVATE_KEY_ID=your-apple-private-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your Apple private key here
-----END PRIVATE KEY-----"
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API and Google OAuth2 API

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Fill in the required information:
   - **Application name**: Kuchisabishii
   - **User support email**: Your email
   - **Application homepage**: Your app URL
   - **Application privacy policy**: Your privacy policy URL
   - **Authorized domains**: Add your domain

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure:
   - **Name**: Kuchisabishii Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

### 4. Configure Supabase Google OAuth

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Google** provider
3. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

## Apple Sign-In Setup

### 1. Apple Developer Configuration

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**

### 2. Create App ID

1. Go to **Identifiers** > **App IDs**
2. Register a new App ID:
   - **Description**: Kuchisabishii
   - **Bundle ID**: `com.yourcompany.kuchisabishii`
   - **Capabilities**: Enable "Sign In with Apple"

### 3. Create Service ID

1. Go to **Identifiers** > **Services IDs**
2. Register a new Services ID:
   - **Description**: Kuchisabishii Web
   - **Identifier**: `com.yourcompany.kuchisabishii.web`
   - **Sign In with Apple**: Configure domains and return URLs
     - **Domains**: `yourdomain.com`
     - **Return URLs**: `https://yourdomain.com/auth/callback`

### 4. Create Private Key

1. Go to **Keys**
2. Create a new key:
   - **Key Name**: Kuchisabishii Sign In
   - **Services**: Enable "Sign In with Apple"
   - **Primary App ID**: Select your app ID
3. Download the private key file (.p8)

### 5. Configure Supabase Apple OAuth

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Apple** provider
3. Enter your Apple credentials:
   - **Client ID**: Your Services ID
   - **Team ID**: From Apple Developer account
   - **Key ID**: From the private key
   - **Private Key**: Contents of the .p8 file

## Email Configuration

### 1. SMTP Settings (Production)

For production, configure SMTP in Supabase:

1. Go to **Authentication** > **Settings**
2. Configure SMTP settings:
   - **SMTP Host**: Your email provider's SMTP host
   - **SMTP Port**: Usually 587 for TLS
   - **SMTP Username**: Your SMTP username
   - **SMTP Password**: Your SMTP password
   - **From Email**: `noreply@yourdomain.com`

### 2. Email Templates

Customize email templates in Supabase:

1. **Confirm signup**: Welcome message with verification link
2. **Reset password**: Password reset instructions
3. **Change email address**: Email change confirmation

## Security Configuration

### 1. Rate Limiting

The system includes built-in rate limiting:
- **Authentication**: 5 attempts per 15 minutes
- **Password reset**: 3 attempts per hour
- **Email resend**: 3 attempts per 5 minutes
- **Social auth**: 10 attempts per 10 minutes

### 2. Session Security

Session management includes:
- Automatic token refresh
- Secure cookie settings
- Session expiration handling
- CSRF protection

### 3. Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Testing

### 1. Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Test the authentication flows:
   - Email registration and login
   - Password strength validation
   - Email verification
   - Social login (requires OAuth setup)

### 2. Integration Tests

Run the authentication tests:

```bash
npm test tests/auth/auth-integration.test.ts
```

### 3. Manual Testing Checklist

- [ ] User can register with email/password
- [ ] User receives verification email
- [ ] User can verify email and login
- [ ] Password strength validation works
- [ ] Rate limiting prevents abuse
- [ ] Google OAuth redirects correctly
- [ ] Apple Sign-In redirects correctly
- [ ] Social login creates profiles
- [ ] Error messages are user-friendly
- [ ] Loading states work properly
- [ ] Animations are smooth

## Deployment

### 1. Environment Variables

Set production environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
# ... other production values
```

### 2. Domain Configuration

1. Update OAuth redirect URLs in:
   - Google Cloud Console
   - Apple Developer Portal
   - Supabase Authentication settings

2. Configure DNS and SSL certificates

3. Update CORS settings in Supabase if needed

### 3. Monitoring

Set up monitoring for:
- Authentication success/failure rates
- Rate limiting triggers
- Email delivery status
- OAuth provider health
- API response times

## Troubleshooting

### Common Issues

1. **OAuth redirect mismatch**: Ensure URLs in provider configs match exactly
2. **Email not sending**: Check SMTP settings and quotas
3. **Rate limiting too aggressive**: Adjust limits in middleware
4. **Session not persisting**: Verify cookie settings and domain
5. **Social login profile creation fails**: Check RLS policies

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
```

### Support

For issues specific to:
- **Supabase**: Check [Supabase documentation](https://supabase.com/docs)
- **Google OAuth**: Check [Google Identity documentation](https://developers.google.com/identity)
- **Apple Sign-In**: Check [Apple Sign-In documentation](https://developer.apple.com/sign-in-with-apple/)

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Rotate keys regularly**: Update OAuth secrets periodically
3. **Monitor authentication logs**: Watch for suspicious activity
4. **Keep dependencies updated**: Regularly update auth-related packages
5. **Implement proper error handling**: Don't expose sensitive information
6. **Use HTTPS in production**: Ensure all communications are encrypted
7. **Validate all inputs**: Don't trust client-side validation alone
8. **Implement proper session timeout**: Balance security and user experience

This completes the authentication setup for Kuchisabishii. The system provides a secure, user-friendly authentication experience with modern social login options and robust security measures.