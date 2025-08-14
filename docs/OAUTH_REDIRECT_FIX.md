# OAuth Redirect Fix Guide

## Issue Identified
Google OAuth authentication succeeds in Supabase but doesn't redirect properly to the home page.

## Root Cause
OAuth redirect URL configuration mismatch between:
- Staging URL: `https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app`
- Google OAuth configured redirect URLs

## Required Fixes

### 1. Update Google OAuth Authorized Redirect URIs

In Google Cloud Console (https://console.cloud.google.com/):
1. Go to "APIs & Services" → "Credentials"
2. Click on "Kuchisabishii Web Client"
3. Add these Authorized redirect URIs:

```
https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/api/auth/callback/google
https://kuchisabishii.io/api/auth/callback/google
https://staging.kuchisabishii.io/api/auth/callback/google
```

**Note**: Using NextAuth.js instead of Supabase OAuth for professional domain appearance.

### 2. Remove Supabase OAuth URLs (No Longer Needed)

Since we're using NextAuth.js for professional OAuth flow:
1. Go to Supabase Dashboard → "Authentication" → "URL Configuration"
2. **Remove** the Supabase callback URLs (we no longer use them)
3. Keep only your domain URLs if any

### 3. Update Vercel Environment Variables

Set these environment variables in Vercel for the staging branch:
```
NEXTAUTH_URL=https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app
GOOGLE_CLIENT_ID=[Your Google Client ID]
GOOGLE_CLIENT_SECRET=[Your Google Client Secret]
```

## Testing Steps

1. Open staging URL
2. Click "Continue with Google"
3. Complete Google authentication
4. Verify redirect to home page (not stuck on login)

## Expected Flow

1. User clicks "Continue with Google"
2. Redirects to Google OAuth
3. User authenticates with Google
4. Google redirects to: `${NEXTAUTH_URL}/auth/callback`
5. Supabase processes the callback
6. User profile created/updated in database
7. Auth state updated in application
8. User redirected to home page

## Verification Commands

```bash
# Check current environment
echo $NEXTAUTH_URL

# Test OAuth URL generation
curl -X POST https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/api/auth/social/google

# Check auth callback
curl https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/auth/callback
```