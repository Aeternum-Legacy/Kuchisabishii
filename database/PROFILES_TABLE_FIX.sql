-- ===================================================================
-- COMPREHENSIVE PROFILES TABLE FIX
-- Fixes empty profiles table by addressing RLS, triggers, and permissions
-- ===================================================================

-- STEP 1: Fix RLS Policies to Allow Service Role Operations
-- ===================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new policies that allow service role operations
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Add service role policy for all operations
CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- STEP 2: Create Bulletproof Database Trigger
-- ===================================================================

-- Create improved trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_exists BOOLEAN := false;
BEGIN
  -- Check if profile already exists (avoid unique violations)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      first_name,
      last_name,
      profile_image_url,
      email_verified,
      privacy_level,
      onboarding_completed,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.email,
        'User'
      ),
      COALESCE(NEW.raw_user_meta_data->>'given_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'family_name', ''),
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
      ),
      CASE 
        WHEN NEW.email_confirmed_at IS NOT NULL THEN true 
        ELSE false 
      END,
      'friends',
      false,
      NOW(),
      NOW()
    );
    
    -- Log successful creation
    RAISE NOTICE 'Profile created for user: %', NEW.id;
  ELSE
    -- Update existing profile with latest OAuth data
    UPDATE public.profiles SET
      email = COALESCE(NEW.email, profiles.email),
      display_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        profiles.display_name
      ),
      profile_image_url = COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        profiles.profile_image_url
      ),
      email_verified = CASE 
        WHEN NEW.email_confirmed_at IS NOT NULL THEN true 
        ELSE profiles.email_verified 
      END,
      updated_at = NOW()
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Profile updated for user: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth.users insert
    RAISE WARNING 'Profile creation/update failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Fix Missing Profiles for Existing Users
-- ===================================================================

-- Create profiles for existing OAuth users who don't have them
INSERT INTO public.profiles (
  id,
  email,
  display_name,
  first_name,
  last_name,
  profile_image_url,
  email_verified,
  privacy_level,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.email, ''),
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    au.email,
    'User'
  ),
  COALESCE(au.raw_user_meta_data->>'given_name', ''),
  COALESCE(au.raw_user_meta_data->>'family_name', ''),
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  ),
  CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END,
  'friends',
  false,
  NOW(),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  profile_image_url = EXCLUDED.profile_image_url,
  email_verified = EXCLUDED.email_verified,
  updated_at = NOW();

-- STEP 4: Grant Proper Permissions
-- ===================================================================

-- Grant service role full access to profiles
GRANT ALL ON public.profiles TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Ensure anon and authenticated roles have basic access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- STEP 5: Verification Query
-- ===================================================================

-- Verify the fix worked
SELECT 
  'AUTH USERS' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'PROFILES' as table_name,
  COUNT(*) as count  
FROM public.profiles
UNION ALL
SELECT
  'MISSING PROFILES' as table_name,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Show recent profiles created
SELECT 
  id,
  email,
  display_name,
  onboarding_completed,
  created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;