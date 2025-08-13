# 🔧 Email Verification Fix for Preview Deployment

## Problem
Email verification links are redirecting to `localhost:3000` instead of the preview deployment URL `https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app`.

## Root Cause
The Supabase project configuration has `http://localhost:3000` set as the redirect URL but doesn't include the preview deployment domain.

## Solution Options

### Option 1: Quick Test Fix (Recommended)
Add the preview deployment URL to your Supabase project settings:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your Project → Authentication → URL Configuration
3. **Add to "Redirect URLs"**:
   ```
   https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app/auth/callback
   ```
4. **Save Changes**

### Option 2: Dynamic Redirect (Alternative)
For automatic preview deployments, you can also add:
```
https://*.vercel.app/auth/callback
```

### Option 3: Test Without Email Verification
Temporarily disable email confirmation in Supabase:
1. Go to Authentication → Settings
2. Uncheck "Enable email confirmations"
3. Users can sign up without email verification for testing

## Current Configuration
The application code is already correctly configured:
```typescript
emailRedirectTo: `${process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/auth/callback`
```

## Environment Variables
Preview deployment should have:
- `VERCEL_URL=kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app`
- This gets auto-set by Vercel

## Testing Steps After Fix
1. Register new account on preview site
2. Check email for verification link
3. Verify redirect goes to preview deployment URL
4. Complete authentication flow

## For Production
When deploying to production:
1. Add your production domain to Supabase redirect URLs
2. Ensure `NEXTAUTH_URL` environment variable is set correctly
3. Test email verification on production domain