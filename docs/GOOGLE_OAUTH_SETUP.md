# Google OAuth Setup Guide for Kuchisabishii

## Overview
This guide provides step-by-step instructions for setting up Google OAuth authentication for the Kuchisabishii app, including both development and production environments.

## Prerequisites
- Google account with access to Google Cloud Console
- Kuchisabishii project with Supabase backend
- Environment variables configured

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Name: `kuchisabishii-auth` (or your preferred name)
4. Note down the Project ID

### 1.2 Enable Required APIs
1. Navigate to **APIs & Services > Library**
2. Search and enable the following APIs:
   - **Google+ API** (for user profile data)
   - **Google Identity Services API** (for OAuth flow)
   - **People API** (for profile information)

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type (for public app)
3. Fill in required information:
   ```
   App name: Kuchisabishii
   User support email: [your-email]
   Developer contact information: [your-email]
   ```
4. **Scopes**: Add the following scopes:
   - `openid`
   - `email` 
   - `profile`
5. **Test users**: Add your development email addresses
6. **Save and Continue**

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Choose **Web application**
4. Configure as follows:
   ```
   Name: Kuchisabishii Web Client
   
   Authorized JavaScript origins:
   - http://localhost:3000 (development)
   - https://your-production-domain.com (production)
   
   Authorized redirect URIs:
   - http://localhost:3000/auth/callback (development)
   - https://your-production-domain.com/auth/callback (production)
   ```
5. **Create** and save the credentials:
   - Copy **Client ID**
   - Copy **Client Secret**

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Open your Supabase project dashboard
2. Go to **Authentication > Providers**
3. Find **Google** and toggle it **ON**

### 2.2 Configure Google Provider
1. Paste your Google OAuth credentials:
   ```
   Google Client ID: [from step 1.4]
   Google Client Secret: [from step 1.4]
   ```

### 2.3 Set Redirect URLs
1. In the Google provider settings, configure:
   ```
   Redirect URLs:
   - http://localhost:3000/auth/callback (development)
   - https://your-production-domain.com/auth/callback (production)
   ```

### 2.4 Configure Site URL
1. Go to **Authentication > Settings**
2. Set **Site URL** to:
   ```
   Development: http://localhost:3000
   Production: https://your-production-domain.com
   ```

## Step 3: Environment Variables

### 3.1 Update .env.local (Development)
Create/update your `.env.local` file:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Authentication URLs
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key
```

### 3.2 Production Environment Variables
For production deployment, ensure these variables are set:
```bash
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Production Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Production URLs
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-strong-production-secret
```

## Step 4: Testing Authentication Flow

### 4.1 Development Testing
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Verify user data appears in Supabase

### 4.2 Test Scenarios
Test the following scenarios:

**New User Registration:**
1. Use incognito/private browser mode
2. Sign in with Google account not previously used
3. Verify user profile creation in Supabase
4. Check onboarding flow completion

**Existing User Login:**
1. Sign in with previously registered Google account
2. Verify immediate app access (skip onboarding)
3. Check user data persistence

**Session Persistence:**
1. Sign in and close browser
2. Reopen app URL
3. Verify user remains authenticated

## Step 5: Production Deployment

### 5.1 Domain Setup
1. Update Google Cloud Console with production domain
2. Update Supabase settings with production URLs
3. Configure production environment variables

### 5.2 SSL Certificate
Ensure your production domain has valid SSL certificate:
- Google OAuth requires HTTPS in production
- Supabase requires HTTPS for security

### 5.3 Verification
1. Deploy to production
2. Test OAuth flow on production domain
3. Verify all authentication features work
4. Monitor error logs for any issues

## Step 6: Security Considerations

### 6.1 Environment Variables Security
- Never commit actual credentials to version control
- Use platform-specific secret management (Vercel, Netlify, etc.)
- Rotate secrets regularly

### 6.2 OAuth Security
- Keep Google Client Secret secure
- Use strong NEXTAUTH_SECRET
- Monitor authentication logs

### 6.3 CORS Configuration
Ensure proper CORS settings:
- Supabase: Configure allowed origins
- Google OAuth: Authorized domains only

## Troubleshooting

### Common Issues

**"redirect_uri_mismatch" Error:**
- Verify redirect URI exactly matches Google Console settings
- Check for trailing slashes or missing protocols
- Ensure development vs production URLs are correct

**"invalid_client" Error:**
- Check Google Client ID and Secret are correct
- Verify environment variables are loaded properly
- Ensure Google APIs are enabled

**Supabase Connection Issues:**
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify authentication providers are enabled

**Session Not Persisting:**
- Check NEXTAUTH_SECRET is set
- Verify storage settings in Supabase client
- Check browser localStorage/cookies

### Debug Steps
1. Check browser developer console for errors
2. Verify network requests in Network tab
3. Check Supabase logs for authentication attempts
4. Review Google Cloud Console audit logs

## Advanced Configuration

### Custom Scopes
To request additional Google profile data:
```javascript
// In your Supabase client configuration
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'openid email profile https://www.googleapis.com/auth/userinfo.profile'
  }
})
```

### Profile Data Mapping
Configure how Google profile data maps to your user profiles:
```sql
-- Supabase function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, profile_image_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Support and Resources

### Documentation Links
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

### Community Support
- Supabase Discord
- Google Cloud Community
- Stack Overflow with tags: `google-oauth`, `supabase`, `nextjs`

---

## Quick Reference

### Required URLs for Google Console
```
Development:
- Origin: http://localhost:3000
- Redirect: http://localhost:3000/auth/callback

Production:
- Origin: https://your-domain.com  
- Redirect: https://your-domain.com/auth/callback
```

### Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

### Test Checklist
- [ ] Google Cloud Console configured
- [ ] APIs enabled
- [ ] OAuth consent screen setup
- [ ] Credentials created
- [ ] Supabase provider enabled
- [ ] Environment variables set
- [ ] Development testing successful
- [ ] Production deployment verified