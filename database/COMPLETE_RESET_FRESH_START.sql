-- ========================================
-- COMPLETE DATABASE RESET FOR FRESH TESTING
-- ========================================
-- This script safely resets all user data while preserving:
-- 1. Database schema (tables, columns)
-- 2. RLS policies
-- 3. Functions and triggers
-- 4. Indexes and constraints
-- ========================================

-- STEP 1: Disable RLS temporarily for cleanup
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships DISABLE ROW LEVEL SECURITY;

-- STEP 2: Clear all public schema data (preserves structure)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Delete from all tables in dependency order
    RAISE NOTICE 'Starting complete data reset...';
    
    -- Clear social features first
    DELETE FROM public.friendships;
    RAISE NOTICE 'Cleared friendships table';
    
    -- Clear reviews and experiences
    DELETE FROM public.restaurant_reviews;
    RAISE NOTICE 'Cleared restaurant_reviews table';
    
    DELETE FROM public.food_experiences;
    RAISE NOTICE 'Cleared food_experiences table';
    
    -- Clear restaurants (can be kept if you want sample data)
    DELETE FROM public.restaurants;
    RAISE NOTICE 'Cleared restaurants table';
    
    -- Clear user profiles
    DELETE FROM public.profiles;
    RAISE NOTICE 'Cleared profiles table';
    
    -- Clear any other user-related tables if they exist
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            'profiles', 'food_experiences', 'restaurants', 
            'restaurant_reviews', 'friendships'
        )
        AND tablename NOT LIKE '%_backup'
    LOOP
        EXECUTE 'DELETE FROM public.' || quote_ident(r.tablename);
        RAISE NOTICE 'Cleared table: %', r.tablename;
    END LOOP;
END $$;

-- STEP 3: Clear auth.users (Supabase authentication)
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Count existing users
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE 'Found % users to delete', user_count;
    
    -- Delete all auth users
    DELETE FROM auth.users;
    RAISE NOTICE 'Cleared all auth.users';
    
    -- Clear related auth tables
    DELETE FROM auth.identities;
    DELETE FROM auth.sessions;
    DELETE FROM auth.refresh_tokens;
    DELETE FROM auth.mfa_factors;
    DELETE FROM auth.mfa_challenges;
    DELETE FROM auth.mfa_amr_claims;
    
    RAISE NOTICE 'Cleared all auth-related tables';
END $$;

-- STEP 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- STEP 5: Reset sequences if needed
ALTER SEQUENCE IF EXISTS public.profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.food_experiences_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.restaurants_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.restaurant_reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.friendships_id_seq RESTART WITH 1;

-- STEP 6: Verify reset
DO $$
DECLARE
    profile_count INTEGER;
    auth_count INTEGER;
    experience_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO experience_count FROM public.food_experiences;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESET VERIFICATION:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Profiles remaining: %', profile_count;
    RAISE NOTICE 'Auth users remaining: %', auth_count;
    RAISE NOTICE 'Food experiences remaining: %', experience_count;
    
    IF profile_count = 0 AND auth_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: Database completely reset!';
        RAISE NOTICE 'Ready for fresh OAuth testing';
    ELSE
        RAISE WARNING '⚠️ WARNING: Some data may remain';
    END IF;
    RAISE NOTICE '========================================';
END $$;

-- STEP 7: Ensure service role bypass policies exist for OAuth
-- (These allow the OAuth callback to create profiles)
DO $$
BEGIN
    -- Check if service role policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Service role can bypass RLS'
    ) THEN
        CREATE POLICY "Service role can bypass RLS" ON public.profiles
            FOR ALL 
            TO service_role
            USING (true)
            WITH CHECK (true);
        RAISE NOTICE 'Created service role bypass policy for profiles';
    END IF;
END $$;

-- STEP 8: Show final status
SELECT 
    'Database Reset Complete' as status,
    NOW() as reset_time,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.profiles) as profiles,
    (SELECT COUNT(*) FROM public.food_experiences) as experiences,
    (SELECT COUNT(*) FROM public.friendships) as friendships;

-- ========================================
-- RESET COMPLETE - DATABASE IS CLEAN
-- ========================================
-- You can now test OAuth from scratch with:
-- 1. No existing users
-- 2. No existing profiles
-- 3. Clean authentication state
-- 4. All schema and policies intact
-- ========================================