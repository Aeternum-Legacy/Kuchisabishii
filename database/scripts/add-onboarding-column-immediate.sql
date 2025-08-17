-- IMMEDIATE EXECUTION SCRIPT: Add onboarding_completed column
-- Run this directly in Supabase SQL Editor or PostgreSQL client
-- This script is safe to run multiple times

-- Step 1: Add the column to the appropriate table
-- (This will detect which table structure you're using)

DO $$ 
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Check if public.users table exists and add column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO table_exists;
    
    IF table_exists THEN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'onboarding_completed'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added onboarding_completed column to public.users';
        ELSE
            RAISE NOTICE 'Column onboarding_completed already exists in public.users';
        END IF;
    END IF;
    
    -- Check if public.user_profiles table exists and add column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'onboarding_completed'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            ALTER TABLE public.user_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added onboarding_completed column to public.user_profiles';
        ELSE
            RAISE NOTICE 'Column onboarding_completed already exists in public.user_profiles';
        END IF;
    END IF;
END $$;

-- Step 2: Update existing active users to TRUE
-- Mark users as completed if they have food experiences
UPDATE public.users 
SET onboarding_completed = TRUE 
WHERE EXISTS (
    SELECT 1 FROM public.food_experiences 
    WHERE food_experiences.user_id = users.id
) 
AND onboarding_completed = FALSE
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');

UPDATE public.user_profiles 
SET onboarding_completed = TRUE 
WHERE EXISTS (
    SELECT 1 FROM public.food_experiences 
    WHERE food_experiences.user_id = user_profiles.id
) 
AND onboarding_completed = FALSE
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles');

-- Mark users as completed if they have complete profiles
UPDATE public.users 
SET onboarding_completed = TRUE 
WHERE (
    (display_name IS NOT NULL AND display_name != '') OR
    (bio IS NOT NULL AND bio != '') OR
    (dietary_restrictions IS NOT NULL AND array_length(dietary_restrictions, 1) > 0)
) 
AND onboarding_completed = FALSE
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');

UPDATE public.user_profiles 
SET onboarding_completed = TRUE 
WHERE (
    (display_name IS NOT NULL AND display_name != '') OR
    (bio IS NOT NULL AND bio != '') OR
    (dietary_restrictions IS NOT NULL AND array_length(dietary_restrictions, 1) > 0) OR
    taste_profile_setup = TRUE
) 
AND onboarding_completed = FALSE
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles');

-- Step 3: Create indexes for performance (runs in background)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_onboarding_completed 
ON public.users(onboarding_completed) 
WHERE onboarding_completed = FALSE
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_onboarding_completed 
ON public.user_profiles(onboarding_completed) 
WHERE onboarding_completed = FALSE
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles');

-- Step 4: Verification - Check the results
SELECT 
    'Current database state' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
        THEN 'public.users table exists'
        ELSE 'public.users table does not exist'
    END as users_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
        THEN 'public.user_profiles table exists'
        ELSE 'public.user_profiles table does not exist'
    END as user_profiles_table;

-- Show onboarding status counts (if tables exist)
SELECT 
    'users' as table_name,
    onboarding_completed,
    COUNT(*) as count
FROM public.users 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
GROUP BY onboarding_completed

UNION ALL

SELECT 
    'user_profiles' as table_name,
    onboarding_completed,
    COUNT(*) as count
FROM public.user_profiles 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
GROUP BY onboarding_completed

ORDER BY table_name, onboarding_completed;