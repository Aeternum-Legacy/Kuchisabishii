# 🚨 QUICK DATABASE FIX - Supabase Web Editor

The original SQL script had command-line syntax that doesn't work in Supabase web editor. Use this instead:

## 📋 STEPS TO FIX DATABASE

### 1. Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project: **rmuudrltyqylhwqbogek**
3. Navigate to: **SQL Editor**

### 2. Copy and Run This SQL Script

**File**: `database/supabase-web-migration.sql`

```sql
-- SUPABASE WEB EDITOR COMPATIBLE MIGRATION
-- Run this script in Supabase Dashboard > SQL Editor
-- Fixes onboarding skip redirect loop issue

-- ===============================================
-- STEP 1: ENSURE PROFILES TABLE HAS CORRECT STRUCTURE
-- ===============================================

-- Add onboarding_completed column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding_completed_at column if it doesn't exist  
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add email_verified column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add privacy_level column if it doesn't exist
ALTER TABLE public.profiles  
ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'friends';

-- ===============================================
-- STEP 2: SET EXISTING OAUTH USERS AS ONBOARDED
-- ===============================================

-- Mark all Google OAuth users as having completed onboarding
-- This prevents them from being stuck in onboarding loops
UPDATE public.profiles 
SET 
  onboarding_completed = TRUE,
  onboarding_completed_at = COALESCE(onboarding_completed_at, NOW()),
  updated_at = NOW()
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.app_metadata->>'provider' = 'google'
);

-- ===============================================  
-- STEP 3: CREATE MISSING PROFILES FOR OAUTH USERS
-- ===============================================

-- Create profiles for OAuth users who don't have them yet
INSERT INTO public.profiles (
  id, 
  email, 
  display_name, 
  first_name, 
  last_name,
  profile_image_url, 
  onboarding_completed, 
  onboarding_completed_at,
  email_verified, 
  privacy_level,
  created_at, 
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'name', 
    ''
  ),
  COALESCE(au.raw_user_meta_data->>'given_name', ''),
  COALESCE(au.raw_user_meta_data->>'family_name', ''),
  COALESCE(
    au.raw_user_meta_data->>'avatar_url', 
    au.raw_user_meta_data->>'picture'
  ),
  TRUE, -- OAuth users are considered onboarded
  NOW(), -- Set onboarding completion time
  au.email_confirmed_at IS NOT NULL,
  'friends', -- Default privacy level
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL 
  AND au.app_metadata->>'provider' = 'google';

-- ===============================================
-- STEP 4: ENSURE PROPER UPDATED_AT TRIGGER
-- ===============================================

-- Create or replace the timestamp update function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;

-- Create the trigger
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ===============================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. Click "RUN" in Supabase SQL Editor

You should see success messages for each operation.

### 4. Verify the Fix (Optional)

Run this verification query separately:

```sql
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  au.app_metadata->>'provider' as provider,
  p.onboarding_completed,
  p.onboarding_completed_at,
  p.display_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.app_metadata->>'provider' = 'google'
  AND au.created_at >= NOW() - INTERVAL '7 days'
ORDER BY au.created_at DESC;
```

## ✅ Expected Results

After running the migration:
- All Google OAuth users will have `onboarding_completed = true`
- Missing profiles will be created for OAuth users
- Onboarding skip should work without redirect loops

**This fixes the root cause of the onboarding redirect loop issue!** 🎉