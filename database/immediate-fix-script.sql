-- IMMEDIATE DATABASE FIX SCRIPT
-- Kuchisabishii Queen-Led Hive - Database Architect
-- 
-- PURPOSE: Resolve OAuth → Dashboard redirect loop caused by table inconsistencies
-- CRITICAL: This script addresses the schema mismatch between OAuth and dashboard

-- ========================================
-- STEP 1: IDENTIFY CURRENT STATE
-- ========================================

DO $$ 
DECLARE
    profiles_exists BOOLEAN;
    user_profiles_exists BOOLEAN;
    profiles_count INTEGER;
    user_profiles_count INTEGER;
BEGIN
    -- Check if tables exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) INTO profiles_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) INTO user_profiles_exists;
    
    RAISE NOTICE 'TABLE EXISTENCE:';
    RAISE NOTICE '  profiles table exists: %', profiles_exists;
    RAISE NOTICE '  user_profiles table exists: %', user_profiles_exists;
    
    -- Get record counts if tables exist
    IF profiles_exists THEN
        SELECT COUNT(*) INTO profiles_count FROM public.profiles;
        RAISE NOTICE '  profiles record count: %', profiles_count;
    END IF;
    
    IF user_profiles_exists THEN
        SELECT COUNT(*) INTO user_profiles_count FROM public.user_profiles;
        RAISE NOTICE '  user_profiles record count: %', user_profiles_count;
    END IF;
END $$;

-- ========================================
-- STEP 2: DETERMINE WHICH TABLE TO USE AS PRIMARY
-- ========================================

DO $$
DECLARE
    use_profiles BOOLEAN := FALSE;
    use_user_profiles BOOLEAN := FALSE;
    profiles_has_onboarding BOOLEAN := FALSE;
    user_profiles_has_onboarding BOOLEAN := FALSE;
BEGIN
    -- Check if profiles table has onboarding_completed column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'onboarding_completed'
    ) INTO profiles_has_onboarding;
    
    -- Check if user_profiles table has onboarding_completed column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'user_profiles' 
          AND column_name = 'onboarding_completed'
    ) INTO user_profiles_has_onboarding;
    
    RAISE NOTICE 'ONBOARDING COLUMN STATUS:';
    RAISE NOTICE '  profiles.onboarding_completed exists: %', profiles_has_onboarding;
    RAISE NOTICE '  user_profiles.onboarding_completed exists: %', user_profiles_has_onboarding;
    
    -- Decision logic: prefer the table that OAuth callback is currently using
    -- Based on analysis, OAuth callback uses 'profiles' table
    IF profiles_has_onboarding THEN
        use_profiles := TRUE;
        RAISE NOTICE 'DECISION: Using profiles table as primary (OAuth compatibility)';
    ELSIF user_profiles_has_onboarding THEN
        use_user_profiles := TRUE;
        RAISE NOTICE 'DECISION: Using user_profiles table as primary (fallback)';
    ELSE
        RAISE EXCEPTION 'CRITICAL: No table has onboarding_completed column!';
    END IF;
END $$;

-- ========================================
-- STEP 3: ENSURE PROFILES TABLE EXISTS AND IS CORRECT
-- ========================================

-- Create profiles table if it doesn't exist (based on OAuth callback expectations)
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
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,  -- Changed from TRUE to FALSE
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

-- Ensure onboarding_completed column exists and has correct default
DO $$
BEGIN
    -- Add onboarding_completed if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;
        RAISE NOTICE 'Added onboarding_completed column to profiles table';
    END IF;
    
    -- Add onboarding_completed_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'onboarding_completed_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added onboarding_completed_at column to profiles table';
    END IF;
    
    -- Add email_verified if it doesn't exist (OAuth callback sets this)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added email_verified column to profiles table';
    END IF;
END $$;

-- ========================================
-- STEP 4: MIGRATE DATA FROM USER_PROFILES TO PROFILES
-- ========================================

DO $$
DECLARE
    user_profiles_exists BOOLEAN;
    migration_count INTEGER := 0;
BEGIN
    -- Check if user_profiles table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) INTO user_profiles_exists;
    
    IF user_profiles_exists THEN
        RAISE NOTICE 'Migrating data from user_profiles to profiles...';
        
        -- Insert/update profiles from user_profiles data
        INSERT INTO public.profiles (
            id, username, display_name, bio, location, 
            dietary_restrictions, onboarding_completed, 
            created_at, updated_at
        )
        SELECT 
            up.id,
            up.username,
            up.display_name,
            up.bio,
            up.location,
            up.dietary_restrictions,
            COALESCE(up.onboarding_completed, FALSE),
            up.created_at,
            up.updated_at
        FROM public.user_profiles up
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = up.id
        );
        
        GET DIAGNOSTICS migration_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % records from user_profiles to profiles', migration_count;
        
        -- Update existing profiles with user_profiles data where profiles data is incomplete
        UPDATE public.profiles 
        SET 
            username = COALESCE(public.profiles.username, up.username),
            display_name = COALESCE(NULLIF(public.profiles.display_name, ''), up.display_name, public.profiles.display_name),
            bio = COALESCE(public.profiles.bio, up.bio),
            location = COALESCE(public.profiles.location, up.location),
            dietary_restrictions = COALESCE(public.profiles.dietary_restrictions, up.dietary_restrictions),
            onboarding_completed = CASE 
                WHEN up.onboarding_completed IS NOT NULL THEN up.onboarding_completed 
                ELSE public.profiles.onboarding_completed 
            END,
            updated_at = GREATEST(public.profiles.updated_at, up.updated_at)
        FROM public.user_profiles up
        WHERE public.profiles.id = up.id;
        
        GET DIAGNOSTICS migration_count = ROW_COUNT;
        RAISE NOTICE 'Updated % existing profiles with user_profiles data', migration_count;
    ELSE
        RAISE NOTICE 'No user_profiles table found, skipping migration';
    END IF;
END $$;

-- ========================================
-- STEP 5: FIX ORPHANED AUTH USERS
-- ========================================

-- Create profiles for auth.users that don't have profiles yet
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
    FALSE, -- Default to not onboarded
    au.created_at,
    COALESCE(au.updated_at, au.created_at)
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- ========================================
-- STEP 6: CREATE NECESSARY INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- ========================================
-- STEP 7: CREATE UPDATE TRIGGER
-- ========================================

CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_profiles_updated_at_column();

-- ========================================
-- STEP 8: VERIFY THE FIX
-- ========================================

DO $$
DECLARE
    total_auth_users INTEGER;
    total_profiles INTEGER;
    missing_profiles INTEGER;
    onboarded_users INTEGER;
    recent_oauth_users INTEGER;
BEGIN
    -- Count totals
    SELECT COUNT(*) INTO total_auth_users FROM auth.users;
    SELECT COUNT(*) INTO total_profiles FROM public.profiles;
    
    -- Count missing profiles
    SELECT COUNT(*) INTO missing_profiles 
    FROM auth.users au 
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id);
    
    -- Count onboarded users
    SELECT COUNT(*) INTO onboarded_users 
    FROM public.profiles 
    WHERE onboarding_completed = TRUE;
    
    -- Count recent OAuth users
    SELECT COUNT(*) INTO recent_oauth_users 
    FROM auth.users au
    JOIN public.profiles p ON au.id = p.id
    WHERE au.created_at >= NOW() - INTERVAL '24 hours'
      AND au.raw_user_meta_data->>'provider' = 'google';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE FIX VERIFICATION RESULTS:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total auth.users: %', total_auth_users;
    RAISE NOTICE 'Total profiles: %', total_profiles;
    RAISE NOTICE 'Missing profiles: %', missing_profiles;
    RAISE NOTICE 'Onboarded users: %', onboarded_users;
    RAISE NOTICE 'Recent OAuth users: %', recent_oauth_users;
    
    IF missing_profiles = 0 THEN
        RAISE NOTICE 'SUCCESS: All auth users have profiles';
    ELSE
        RAISE WARNING 'WARNING: % auth users still missing profiles', missing_profiles;
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- STEP 9: SHOW RECENT OAUTH USER STATUS
-- ========================================

\echo '=== RECENT OAUTH USERS STATUS ==='
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    p.onboarding_completed,
    p.email_verified,
    au.raw_user_meta_data->>'provider' as oauth_provider,
    CASE 
        WHEN p.id IS NULL THEN 'MISSING_PROFILE'
        WHEN p.onboarding_completed THEN 'ONBOARDED'
        ELSE 'NEEDS_ONBOARDING'
    END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.created_at >= NOW() - INTERVAL '7 days'
ORDER BY au.created_at DESC
LIMIT 10;

RAISE NOTICE 'Database fix script completed successfully!';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Update API endpoints to use profiles table consistently';
RAISE NOTICE '2. Test OAuth flow → dashboard access';
RAISE NOTICE '3. Monitor for any remaining redirect loops';