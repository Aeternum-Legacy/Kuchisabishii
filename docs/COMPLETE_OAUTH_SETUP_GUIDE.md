# Complete Google OAuth Setup Guide - Professional Implementation

## 🎯 Goal
Implement Google OAuth that shows YOUR domain (not Supabase) during authentication.

## 📋 Prerequisites Checklist

### 1. Google Cloud Console Account
- [ ] Have access to Google Cloud Console
- [ ] Project created: "Kuchisabishii"
- [ ] OAuth consent screen configured

### 2. Vercel Deployment
- [ ] Staging branch deployed to Vercel
- [ ] Have access to Vercel dashboard
- [ ] Know your staging URL: `https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app`

### 3. Database
- [ ] Supabase account (for database only, NOT OAuth)
- [ ] Profiles table exists in Supabase

---

## 🔧 Step 1: Google Cloud Console Configuration

### A. OAuth Consent Screen Setup

1. Go to: https://console.cloud.google.com
2. Navigate to: **APIs & Services** → **OAuth consent screen**
3. Configure:

```
App name: Kuchisabishii
User support email: people@kuchisabishii.io
App logo: [Upload your logo]
Application home page: https://kuchisabishii.io
Application privacy policy: https://kuchisabishii.io/privacy
Application terms of service: https://kuchisabishii.io/terms
```

4. **Authorized domains** (CRITICAL):
```
kuchisabishii.io
kuchisabishii.vercel.app
kuchisabishii-staging.vercel.app
kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app ⚠️ (Try to add this)
```

**Note**: If Google rejects the long Vercel URL, we'll need a workaround.

### B. OAuth 2.0 Client ID Configuration

1. Go to: **APIs & Services** → **Credentials**
2. Click: **CREATE CREDENTIALS** → **OAuth client ID**
3. Choose: **Web application**
4. Configure:

**Name**: Kuchisabishii Web Client

**Authorized JavaScript origins** (ALL are needed):
```
http://localhost:3000
https://kuchisabishii.io
https://staging.kuchisabishii.io
https://kuchisabishii.vercel.app
https://kuchisabishii-staging.vercel.app
https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app
```

**Authorized redirect URIs** (EXACT paths required):
```
http://localhost:3000/api/auth/callback/google
https://kuchisabishii.io/api/auth/callback/google
https://staging.kuchisabishii.io/api/auth/callback/google
https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/api/auth/callback/google
```

5. **SAVE** and copy:
```
Client ID: [Your Google Client ID]
Client Secret: [Your Google Client Secret - keep secure!]
```

---

## 🔧 Step 2: Vercel Environment Variables

### Configure in Vercel Dashboard

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Set these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| GOOGLE_CLIENT_ID | [Your Google Client ID] | Preview |
| GOOGLE_CLIENT_SECRET | [Your Google Client Secret] | Preview |
| NEXTAUTH_URL | https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app | Preview (staging branch) |
| NEXTAUTH_SECRET | [generate random 32 char string] | Preview |

**IMPORTANT**: 
- Use "Preview" environment for staging
- NEXTAUTH_URL must match your exact deployment URL
- No trailing slashes in URLs

---

## 🔧 Step 3: Code Implementation

### OAuth Flow Overview
```
User clicks "Continue with Google"
    ↓
/api/auth/social/google (generates OAuth URL)
    ↓
Google OAuth Screen (shows YOUR domain)
    ↓
User authenticates with Google
    ↓
Google redirects to: /api/auth/callback/google
    ↓
Exchange code for user info
    ↓
Create/update user in Supabase
    ↓
Set session cookie
    ↓
Redirect to home page
```

### File Structure Required
```
src/
  app/
    api/
      auth/
        social/
          google/
            route.ts         # OAuth initiation endpoint
        callback/
          google/
            route.ts         # OAuth callback handler
  hooks/
    useAuth.ts              # Client-side auth hook
  components/
    auth/
      LoginForm.tsx         # Login UI with Google button
```

---

## 🧪 Step 4: Testing & Verification

### A. Test Environment Variables
```bash
# Visit this URL in browser:
https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/api/auth/social/google

# Should return:
{
  "message": "Google OAuth endpoint is working",
  "env": {
    "hasGoogleClientId": true,
    "hasGoogleClientSecret": true,
    "nextAuthUrl": "https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app"
  }
}
```

### B. Test OAuth URL Generation
```bash
# Visit:
https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/api/auth/social/google?action=signin

# Should return:
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "redirectUri": "https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/api/auth/callback/google"
}
```

### C. Test Complete Flow
1. Click "Continue with Google" button
2. Should redirect to Google OAuth
3. Google page should show YOUR domain (not Supabase)
4. After authentication, should redirect back to your app
5. User should be logged in

---

## 🚨 Common Issues & Solutions

### Issue 1: 404 Error
**Symptom**: Clicking Google button returns 404
**Cause**: POST method not working in Vercel deployment
**Solution**: Use GET method with ?action=signin parameter

### Issue 2: "Invalid domain" in Google Console
**Symptom**: Can't add long Vercel URL to authorized domains
**Cause**: Google doesn't accept complex subdomains
**Solutions**:
1. Set up custom domain: staging.kuchisabishii.io
2. Use simpler Vercel URL if possible
3. Contact Google Support for domain verification

### Issue 3: Redirect Mismatch Error
**Symptom**: "redirect_uri_mismatch" error
**Cause**: Callback URL doesn't match exactly
**Solution**: Ensure URLs match EXACTLY (including https://, no trailing slash)

### Issue 4: Environment Variables Not Loading
**Symptom**: OAuth returns "not configured" error
**Cause**: Variables not set for correct environment
**Solution**: Set for "Preview" environment in Vercel, redeploy

---

## ✅ Final Verification Checklist

- [ ] Google OAuth JavaScript origins include staging URL
- [ ] Google OAuth redirect URIs include /api/auth/callback/google
- [ ] Vercel has GOOGLE_CLIENT_ID in Preview environment
- [ ] Vercel has GOOGLE_CLIENT_SECRET in Preview environment
- [ ] Vercel has correct NEXTAUTH_URL for staging
- [ ] GET endpoint returns environment variables as "true"
- [ ] OAuth URL generation returns valid Google URL
- [ ] Clicking button redirects to Google
- [ ] Google shows YOUR domain during auth
- [ ] Successfully redirects back after auth
- [ ] User is logged in after OAuth

---

## 🎯 Current Status Check

Based on your latest tests:
- ✅ GET endpoint works
- ✅ Environment variables are loaded
- ❌ POST method returns 404 (using GET workaround)
- ❓ OAuth flow not completing

**Next Steps**:
1. Verify all Google Console URLs match exactly
2. Test the GET method with ?action=signin
3. Check browser console for any errors
4. Verify callback route is deployed