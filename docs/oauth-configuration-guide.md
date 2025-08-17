# External Configuration Guide for Supabase Native OAuth

This comprehensive guide covers all external service configurations required to implement Supabase native OAuth with Google for the Kuchisabishii application.

## Overview

The Kuchisabishii app uses Supabase's native OAuth implementation with custom callback handling. This guide provides step-by-step instructions for configuring:

1. **Google Cloud Console** - OAuth 2.0 Client setup
2. **Supabase Dashboard** - Authentication provider configuration  
3. **Vercel** - Environment variables and deployment settings
4. **Database** - Schema and security configuration

## 🔐 1. Google Cloud Console Configuration

### Step 1: Create or Access Google Cloud Project

1. Navigate to: https://console.cloud.google.com/
2. Select existing project or create new project for Kuchisabishii
3. Note your **Project ID** (you'll need this later)

### Step 2: Enable Required APIs

1. Go to **APIs & Services > Library**
2. Enable these APIs:
   - **Google+ API** (for user profile access)
   - **People API** (for contact information)
   - **Maps JavaScript API** (if using Google Maps features)

### Step 3: Configure OAuth Consent Screen

1. Navigate to: **APIs & Services > OAuth consent screen**
2. Choose **External** user type (unless you have G Suite)
3. Fill in required fields:
   ```
   App name: Kuchisabishii
   User support email: people@kuchisabishii.io
   Developer contact email: people@kuchisabishii.io
   ```
4. Add these scopes:
   - `openid`
   - `email` 
   - `profile`
5. **Save and Continue** through all steps

### Step 4: Create OAuth 2.0 Client ID

1. Go to: **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth 2.0 Client ID**
3. Select **Web application**
4. Configure as follows:

   **Name**: `Kuchisabishii Web Client`
   
   **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3006
   https://your-staging-domain.vercel.app
   https://your-production-domain.com
   https://auelvsosyxrvbvxozhuz.supabase.co
   ```
   
   **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3006/api/auth/callback/google
   https://your-staging-domain.vercel.app/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   https://auelvsosyxrvbvxozhuz.supabase.co/auth/v1/callback
   ```

5. Click **CREATE**
6. **Copy and save**:
   - **Client ID**: `455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-[your-secret]`

### Verification Steps

1. Test OAuth flow at: https://developers.google.com/oauthplayground/
2. Use Client ID and verify scopes work correctly
3. Ensure redirect URIs are exactly matching (case sensitive)

---

## 🗄️ 2. Supabase Dashboard Configuration

### Step 1: Access Supabase Project

1. Navigate to: https://supabase.com/dashboard
2. Select your project: `auelvsosyxrvbvxozhuz`
3. Current project URL: `https://auelvsosyxrvbvxozhuz.supabase.co`

### Step 2: Enable Google Auth Provider

1. Go to: **Authentication > Providers**
2. Find **Google** in the provider list
3. Toggle **Enable** to ON
4. Configure Google settings:

   ```
   Client ID: 455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
   Client Secret: [Your Google Client Secret from step 1]
   ```

### Step 3: Configure Redirect URLs

1. In **Authentication > Settings**
2. Set **Site URL**: 
   ```
   Development: http://localhost:3006
   Staging: https://your-staging-domain.vercel.app  
   Production: https://your-production-domain.com
   ```

3. **Additional Redirect URLs** (one per line):
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3006/api/auth/callback/google
   https://your-staging-domain.vercel.app/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```

### Step 4: Email Configuration

1. In **Authentication > Settings**
2. **SMTP Settings**:
   ```
   Sender name: Kuchisabishii
   Sender email: people@kuchisabishii.io
   Host: smtp.mail.me.com
   Port: 587
   Username: people@kuchisabishii.io
   Password: meha-dyvx-rvuk-hrys
   ```

### Step 5: Auth Hooks Configuration

1. In **Authentication > Hooks** 
2. **Custom Access Token Hook**: (Optional)
   ```sql
   -- Add custom claims to JWT token
   CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
   RETURNS JSONB
   LANGUAGE plpgsql
   AS $$
   DECLARE
     claims JSONB;
     user_role TEXT;
   BEGIN
     -- Default claims
     claims := event->'claims';
     
     -- Add custom user role
     SELECT role INTO user_role FROM public.user_profiles 
     WHERE id = (event->'user_id')::UUID;
     
     claims := jsonb_set(claims, '{user_role}', to_jsonb(COALESCE(user_role, 'user')));
     
     RETURN jsonb_set(event, '{claims}', claims);
   END;
   $$;
   ```

### Verification Steps

1. Test Google OAuth: **Authentication > Users > Invite User > OAuth**
2. Verify redirect URLs work in browser
3. Check user creation in **Authentication > Users**

---

## 🚀 3. Vercel Configuration

### Step 1: Environment Variables Setup

1. Navigate to your Vercel project dashboard
2. Go to **Settings > Environment Variables**
3. Add the following variables for **ALL ENVIRONMENTS** (Development, Preview, Production):

#### Core Supabase Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://auelvsosyxrvbvxozhuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDY5MjQsImV4cCI6MjA3MDU4MjkyNH0.c7JJcY6MROjGKvPz_BGs8lYCXXv6jz7jZ-cvOFtHeZc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNjkyNCwiZXhwIjoyMDcwNTgyOTI0fQ.Z9VUjI-otF-41iFFbEaBZ4RKId3Kh2x7vuHL6i_tDhE
```

#### OAuth Variables
```bash
GOOGLE_CLIENT_ID=455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
```

#### App Configuration
```bash
# Development
NEXTAUTH_URL=http://localhost:3006

# Staging  
NEXTAUTH_URL=https://your-staging-domain.vercel.app

# Production
NEXTAUTH_URL=https://your-production-domain.com
```

#### Security Variables
```bash
NEXTAUTH_SECRET=[generate-32-character-secret]
JWT_SECRET=[generate-another-32-character-secret]
ENCRYPTION_KEY=[generate-32-character-encryption-key]
```

### Step 2: Domain Configuration

1. **Custom Domains** (if applicable):
   ```
   Production: your-production-domain.com
   Staging: staging.your-domain.com
   ```

2. **Automatic Deployments**:
   - **Production Branch**: `master`
   - **Staging Branch**: `staging`
   - **Development**: All other branches

### Step 3: Build & Deployment Settings

1. **Build Command**: `npm run build`
2. **Output Directory**: `.next`
3. **Install Command**: `npm install`
4. **Node.js Version**: `18.x` or `20.x`

### Step 4: Function Configuration

1. **Serverless Functions**: Ensure API routes work
2. **Runtime**: Node.js 18.x
3. **Memory**: 1024 MB (default)
4. **Timeout**: 10 seconds

### Verification Steps

1. Check all environment variables are set correctly
2. Deploy and test OAuth flow on staging
3. Verify redirects work with production domain
4. Test API endpoints: `/api/auth/callback/google`

---

## 🗄️ 4. Database Schema Configuration

### Step 1: Core Schema Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create profiles table that matches auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    location TEXT,
    dietary_restrictions TEXT[],
    privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'private')),
    onboarding_completed BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles  
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());
```

### Step 2: Auth Trigger Setup

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        first_name,
        last_name,
        profile_image_url,
        email_verified
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name', 
        NEW.raw_user_meta_data->>'profile_image_url',
        COALESCE((NEW.raw_user_meta_data->>'email_verified')::boolean, false)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Storage Configuration

1. **Create Storage Bucket** in Supabase Dashboard:
   ```
   Bucket name: user-uploads
   Public: false (private bucket)
   ```

2. **Storage Policies**:
   ```sql
   -- Allow users to upload their own profile images
   CREATE POLICY "Users can upload own profile images" ON storage.objects
       FOR INSERT WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to view their own uploads
   CREATE POLICY "Users can view own uploads" ON storage.objects
       FOR SELECT USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### Verification Steps

1. Test user creation through Google OAuth
2. Verify profile data is created correctly
3. Check RLS policies work as expected
4. Test storage upload permissions

---

## 🧪 5. Testing & Verification

### Complete OAuth Flow Test

1. **Development Environment**:
   ```bash
   npm run dev
   # Navigate to http://localhost:3006
   # Click "Sign in with Google"
   # Verify redirect and profile creation
   ```

2. **Staging Environment**:
   ```bash
   # Deploy to staging
   # Test OAuth flow
   # Verify environment variables
   ```

3. **Production Environment**:
   ```bash
   # Deploy to production
   # Test with production domain
   # Verify all configurations
   ```

### Debug Checklist

- [ ] Google Client ID/Secret are correct
- [ ] Redirect URIs match exactly (case sensitive)
- [ ] Supabase environment variables are set
- [ ] Database schema is applied
- [ ] RLS policies are enabled
- [ ] Storage bucket is configured
- [ ] Email SMTP settings work
- [ ] Vercel environment variables are set for all environments

### Common Issues & Solutions

1. **"Redirect URI mismatch"**:
   - Verify exact match in Google Console
   - Check for trailing slashes
   - Ensure protocol (http vs https) matches

2. **"Invalid client_id"**:
   - Verify Client ID in both Google Console and Supabase
   - Check environment variables are deployed

3. **"User creation failed"**:
   - Check database schema is applied
   - Verify RLS policies allow user insertion
   - Check Supabase service role key

4. **"Session not persisting"**:
   - Verify cookie domain settings
   - Check NEXTAUTH_URL matches deployment URL
   - Ensure Supabase project URL is correct

---

## 📋 Environment Variable Reference

### Complete `.env` File Template

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://auelvsosyxrvbvxozhuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDY5MjQsImV4cCI6MjA3MDU4MjkyNH0.c7JJcY6MROjGKvPz_BGs8lYCXXv6jz7jZ-cvOFtHeZc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNjkyNCwiZXhwIjoyMDcwNTgyOTI0fQ.Z9VUjI-otF-41iFFbEaBZ4RKId3Kh2x7vuHL6i_tDhE

# Authentication Configuration  
NEXTAUTH_URL=http://localhost:3006
NEXTAUTH_SECRET=your-32-character-secret-key-here

# OAuth Provider Configuration
GOOGLE_CLIENT_ID=455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security Configuration
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key

# Optional: Additional Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza-your-google-maps-api-key
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn-for-error-tracking
```

This configuration guide provides everything needed to successfully implement Supabase native OAuth with Google. Each service configuration is essential for the complete OAuth flow to function properly.