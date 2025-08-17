# 🔧 MANUAL CONFIGURATION GUIDE - Supabase Native OAuth

This guide contains ALL the manual configurations you need to complete for the Supabase native OAuth implementation.

---

## 🎯 QUICK START CHECKLIST

- [ ] **Database Migration**: Run SQL script in Supabase
- [ ] **Google Cloud Console**: Update OAuth redirect URIs
- [ ] **Supabase Dashboard**: Enable Google OAuth provider
- [ ] **Vercel Environment**: Add required variables
- [ ] **Test OAuth Flow**: Verify end-to-end functionality

---

## 1. 🗄️ DATABASE MIGRATION (CRITICAL - DO THIS FIRST)

### Execute Database Consolidation Script

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your project → SQL Editor
3. **Copy and run this SQL**:

```sql
-- CRITICAL: Database Consolidation Script
-- Consolidates dual table architecture to fix onboarding skip issue

-- Step 1: Ensure profiles table has correct structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Step 2: Set existing OAuth users as onboarded (they skipped onboarding)
UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.app_metadata->>'provider' = 'google'
);

-- Step 3: Create missing profiles for OAuth users
INSERT INTO public.profiles (
  id, email, display_name, first_name, last_name, 
  profile_image_url, onboarding_completed, email_verified, created_at, updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', ''),
  COALESCE(au.raw_user_meta_data->>'given_name', ''),
  COALESCE(au.raw_user_meta_data->>'family_name', ''),
  COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture'),
  TRUE, -- OAuth users are considered onboarded
  au.email_confirmed_at IS NOT NULL,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL AND au.app_metadata->>'provider' = 'google';

-- Step 4: Update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## 2. 🟢 GOOGLE CLOUD CONSOLE CONFIGURATION

### Step 1: Access Your Google Cloud Project
1. **Go to**: https://console.cloud.google.com/
2. **Select your project** or create a new one for Kuchisabishii

### Step 2: Update OAuth 2.0 Client
1. **Navigate to**: APIs & Services → Credentials
2. **Find your existing OAuth 2.0 Client ID** (or create one if none exists)
3. **Click Edit** (pencil icon)

### Step 3: Configure Authorized URIs

**Authorized JavaScript origins:**
```
http://localhost:3000
https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app
https://your-production-domain.com
```

**Authorized redirect URIs** (CRITICAL - ADD THIS):
```
https://rmuudrltyqylhwqbogek.supabase.co/auth/v1/callback
http://localhost:54321/auth/v1/callback
```

### Step 4: Save Configuration
- Click **SAVE**
- Copy your **Client ID** and **Client Secret** (you'll need these for Supabase)

---

## 3. 🟦 SUPABASE DASHBOARD CONFIGURATION

### Step 1: Access Supabase Authentication
1. **Go to**: https://supabase.com/dashboard
2. **Select your project**: rmuudrltyqylhwqbogek
3. **Navigate to**: Authentication → Settings

### Step 2: Configure Site URLs
```
Site URL: https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app

Additional redirect URLs:
https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/api/auth/callback/google
https://your-production-domain.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

### Step 3: Enable Google OAuth Provider
1. **Navigate to**: Authentication → Providers
2. **Find Google** and click to enable
3. **Configure**:
   - **Enable Google provider**: Toggle ON
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
   - **Redirect URL** (read-only): `https://rmuudrltyqylhwqbogek.supabase.co/auth/v1/callback`

### Step 4: Save Settings
- Click **Save** to apply all changes

---

## 4. ⚡ VERCEL ENVIRONMENT VARIABLES

### Step 1: Access Vercel Project Settings
1. **Go to**: https://vercel.com/dashboard
2. **Find your Kuchisabishii project**
3. **Navigate to**: Settings → Environment Variables

### Step 2: Add Required Variables

**For Production:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://rmuudrltyqylhwqbogek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdXVkcmx0eXF5bGh3cWJvZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MDY4NzEsImV4cCI6MjA0OTk4Mjg3MX0.J_-7f8-dIQfgYhj8cGQWQc3hGxAeJMHLDQLrwWLVjC4
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com  
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

**For Preview/Staging:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://rmuudrltyqylhwqbogek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdXVkcmx0eXF5bGh3cWJvZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MDY4NzEsImV4cCI6MjA0OTk4Mjg3MX0.J_-7f8-dIQfgYhj8cGQWQc3hGxAeJMHLDQLrwWLVjC4
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app
```

**For Development (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://rmuudrltyqylhwqbogek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdXVkcmx0eXF5bGh3cWJvZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MDY4NzEsImV4cCI6MjA0OTk4Mjg3MX0.J_-7f8-dIQfgYhj8cGQWQc3hGxAeJMHLDQLrwWLVjC4
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. ✅ VERIFICATION STEPS

### Test 1: OAuth Flow
1. **Visit your staging app**: https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app
2. **Click "Sign in with Google"**
3. **Complete Google OAuth**
4. **Expected**: Redirect to dashboard (NOT onboarding loop)

### Test 2: Onboarding Skip  
1. **If redirected to onboarding**, click "Skip for now"
2. **Expected**: Land on dashboard without redirect loops
3. **Browser console**: Should show NO 401 Unauthorized errors

### Test 3: Session Persistence
1. **Refresh the page**
2. **Expected**: Remain authenticated, stay on dashboard
3. **Navigate between pages**
4. **Expected**: Authentication state maintained

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: 401 Unauthorized errors
**Solution**: Check that Google Client ID/Secret match between Google Cloud Console and Supabase

### Issue: Infinite redirect loops  
**Solution**: Verify database migration was executed and onboarding_completed is set properly

### Issue: OAuth callback fails
**Solution**: Ensure redirect URIs in Google Cloud Console exactly match Supabase auth callback URL

### Issue: Environment variables not working
**Solution**: Redeploy Vercel project after adding environment variables

---

## 📞 SUPPORT

If you encounter issues:

1. **Check Vercel Function Logs**: Vercel Dashboard → Functions → View logs
2. **Check Supabase Auth Logs**: Supabase Dashboard → Authentication → Logs  
3. **Browser Console**: Look for JavaScript errors and network failures
4. **Database**: Verify profiles table has data for your user

---

**🎉 Once configured, the onboarding skip issue will be resolved and OAuth will work smoothly!**