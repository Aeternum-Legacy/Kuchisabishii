-- IMMEDIATE ONBOARDING FIX - Supabase Web Editor Compatible
-- Purpose: Fix OAuth user profile and onboarding status issues

-- Step 1: Ensure profiles table exists with correct schema
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    bio TEXT,
    profile_image_url TEXT,
    location TEXT,
    date_of_birth DATE,
    dietary_restrictions TEXT[],
    favorite_cuisines TEXT[],
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'private')),
    notification_preferences JSONB DEFAULT '{
        "food_recommendations": true,
        "friend_activity": true,
        "new_followers": true,
        "review_responses": true,
        "system_updates": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add onboarding_completed if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
    
    -- Add onboarding_completed_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'onboarding_completed_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add email_verified if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Step 3: Create profiles for all auth users who don't have them
INSERT INTO public.profiles (
    id, 
    email, 
    display_name, 
    first_name, 
    last_name, 
    profile_image_url,
    email_verified,
    onboarding_completed,
    created_at, 
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email),
    au.raw_user_meta_data->>'first_name',
    au.raw_user_meta_data->>'last_name',
    au.raw_user_meta_data->>'profile_image_url',
    (au.email_confirmed_at IS NOT NULL),
    FALSE, -- Default to not onboarded so users can skip
    au.created_at,
    COALESCE(au.updated_at, au.created_at)
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Update existing profiles to ensure consistency
UPDATE public.profiles 
SET 
    email = au.email,
    first_name = COALESCE(public.profiles.first_name, au.raw_user_meta_data->>'first_name'),
    last_name = COALESCE(public.profiles.last_name, au.raw_user_meta_data->>'last_name'),
    profile_image_url = COALESCE(public.profiles.profile_image_url, au.raw_user_meta_data->>'profile_image_url'),
    email_verified = (au.email_confirmed_at IS NOT NULL),
    updated_at = NOW()
FROM auth.users au
WHERE public.profiles.id = au.id;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);

-- Step 6: Create update trigger
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_profiles_updated_at_column();

-- Step 7: Show results
SELECT 
    'Total auth users' as metric,
    COUNT(*)::text as value
FROM auth.users
UNION ALL
SELECT 
    'Total profiles' as metric,
    COUNT(*)::text as value
FROM public.profiles
UNION ALL
SELECT 
    'Missing profiles' as metric,
    COUNT(*)::text as value
FROM auth.users au 
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
UNION ALL
SELECT 
    'Recent OAuth users' as metric,
    COUNT(*)::text as value
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY metric;