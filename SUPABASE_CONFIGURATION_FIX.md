# 🔧 Supabase Authentication Configuration Fix

## Current Issues
1. Email verification redirects to `localhost:3000` instead of preview URL
2. Social login providers (Google/Apple) are not enabled
3. Preview deployment URL not in allowed redirect URLs

## Required Supabase Dashboard Changes

### Step 1: Add Redirect URLs
**Navigate to**: Supabase Dashboard → Your Project → Authentication → URL Configuration

**Add these URLs to "Redirect URLs":**
```
https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app/auth/callback
https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app/
https://*.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### Step 2: Enable Social Providers
**Navigate to**: Authentication → Providers

**Enable and Configure:**

#### Google OAuth
1. Toggle "Google" to enabled
2. Add these credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
   - **Redirect URL**: `https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app/auth/callback`

#### Apple OAuth (Optional)
1. Toggle "Apple" to enabled
2. Add Apple OAuth configuration
3. **Redirect URL**: `https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app/auth/callback`

### Step 3: Email Configuration
**Navigate to**: Authentication → Settings

**Configure:**
- ✅ **Enable email confirmations** (keep enabled)
- **Confirm email change**: Enabled
- **Enable secure email change**: Enabled

### Step 4: Site URL Configuration
**Navigate to**: Settings → API

**Set Site URL to:**
```
https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app
```

## Alternative: Quick Test Setup

If you don't have Google/Apple OAuth credentials ready, you can:

### Option A: Disable Email Confirmation Temporarily
**Navigate to**: Authentication → Settings
- ❌ **Uncheck "Enable email confirmations"**
- Users can register without email verification

### Option B: Use Magic Link Auth
**Navigate to**: Authentication → Providers
- ✅ **Enable "Magic Link"**
- Users get login links via email instead of passwords

## Environment Variables Check

Ensure these are set in Vercel deployment:
```env
NEXT_PUBLIC_SUPABASE_URL=https://auelvsosyxrvbvxozhuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXTAUTH_URL=https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app
```

## Testing After Configuration

### Email Registration Test
1. Visit: https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app
2. Click "Sign Up"
3. Enter email and password
4. Check email for verification link
5. Verify link redirects to preview URL (not localhost)

### Social Login Test  
1. Click "Continue with Google"
2. Complete Google OAuth flow
3. Verify redirect back to application
4. Check user profile creation

### Phase 5 Feature Test
1. After authentication, visit `/onboarding`
2. Complete AI taste profiling
3. Navigate to `/profile` for enhanced features
4. Test all Phase 5 components

## Expected Results

✅ **Success Criteria:**
- Email verification links redirect to preview URL
- Social login providers work without errors
- Users can complete full authentication flow
- Phase 5 features accessible after login
- Mobile authentication works properly

## Quick Fix Priority

**Highest Priority**: Add redirect URLs to Supabase
**Medium Priority**: Enable one social provider (Google recommended)
**Lower Priority**: Configure Apple OAuth (if credentials available)

This will enable complete authentication testing for Phase 5! 🚀