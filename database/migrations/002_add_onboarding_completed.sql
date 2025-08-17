-- Migration: Add onboarding_completed column to user_profiles table
-- Created: 2025-08-17
-- Purpose: Ensure onboarding_completed column exists and is properly configured

BEGIN;

-- Add onboarding_completed column if it doesn't exist
-- This handles both the old 'users' table and new 'user_profiles' table structure
DO $$ 
BEGIN
    -- Check if we're using the old 'users' table structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Add column to public.users table if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'onboarding_completed') THEN
            ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added onboarding_completed column to public.users table';
        ELSE
            RAISE NOTICE 'onboarding_completed column already exists in public.users table';
        END IF;
    END IF;

    -- Check if we're using the new 'user_profiles' table structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        -- Add column to public.user_profiles table if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'onboarding_completed') THEN
            ALTER TABLE public.user_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added onboarding_completed column to public.user_profiles table';
        ELSE
            RAISE NOTICE 'onboarding_completed column already exists in public.user_profiles table';
        END IF;
    END IF;
END $$;

-- Update existing users to TRUE if they have been active
-- Define "active" as users who have:
-- 1. Created food experiences, OR
-- 2. Have a complete profile (display_name, bio, or dietary preferences set), OR
-- 3. Have logged in more than once (if last_sign_in_at data is available)

-- Update for public.users table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Mark users as onboarded if they have food experiences
        UPDATE public.users 
        SET onboarding_completed = TRUE 
        WHERE id IN (
            SELECT DISTINCT user_id 
            FROM public.food_experiences 
            WHERE user_id IS NOT NULL
        ) AND onboarding_completed = FALSE;

        -- Mark users as onboarded if they have a complete profile
        UPDATE public.users 
        SET onboarding_completed = TRUE 
        WHERE (
            (display_name IS NOT NULL AND display_name != '') OR
            (bio IS NOT NULL AND bio != '') OR
            (dietary_restrictions IS NOT NULL AND array_length(dietary_restrictions, 1) > 0) OR
            (favorite_cuisines IS NOT NULL AND array_length(favorite_cuisines, 1) > 0)
        ) AND onboarding_completed = FALSE;

        -- Mark users as onboarded if they have been active for more than 24 hours
        UPDATE public.users 
        SET onboarding_completed = TRUE 
        WHERE created_at < NOW() - INTERVAL '24 hours'
        AND updated_at > created_at + INTERVAL '1 hour'
        AND onboarding_completed = FALSE;

        RAISE NOTICE 'Updated existing users in public.users table based on activity';
    END IF;
END $$;

-- Update for public.user_profiles table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        -- Mark users as onboarded if they have food experiences
        UPDATE public.user_profiles 
        SET onboarding_completed = TRUE 
        WHERE id IN (
            SELECT DISTINCT user_id 
            FROM public.food_experiences 
            WHERE user_id IS NOT NULL
        ) AND onboarding_completed = FALSE;

        -- Mark users as onboarded if they have a complete profile
        UPDATE public.user_profiles 
        SET onboarding_completed = TRUE 
        WHERE (
            (display_name IS NOT NULL AND display_name != '') OR
            (bio IS NOT NULL AND bio != '') OR
            (dietary_restrictions IS NOT NULL AND array_length(dietary_restrictions, 1) > 0) OR
            (allergies IS NOT NULL AND array_length(allergies, 1) > 0) OR
            taste_profile_setup = TRUE
        ) AND onboarding_completed = FALSE;

        -- Mark users as onboarded if they have been active for more than 24 hours
        UPDATE public.user_profiles 
        SET onboarding_completed = TRUE 
        WHERE created_at < NOW() - INTERVAL '24 hours'
        AND updated_at > created_at + INTERVAL '1 hour'
        AND onboarding_completed = FALSE;

        RAISE NOTICE 'Updated existing users in public.user_profiles table based on activity';
    END IF;
END $$;

-- Create index for better performance on onboarding_completed queries
-- For public.users table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_onboarding_completed 
        ON public.users(onboarding_completed) 
        WHERE onboarding_completed = FALSE;
        RAISE NOTICE 'Created index on public.users.onboarding_completed';
    END IF;
END $$;

-- For public.user_profiles table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_onboarding_completed 
        ON public.user_profiles(onboarding_completed) 
        WHERE onboarding_completed = FALSE;
        RAISE NOTICE 'Created index on public.user_profiles.onboarding_completed';
    END IF;
END $$;

-- Add a comment to document the column purpose
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        COMMENT ON COLUMN public.users.onboarding_completed IS 'Indicates whether the user has completed the initial onboarding process';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Indicates whether the user has completed the initial onboarding process';
    END IF;
END $$;

COMMIT;

-- Verification queries (uncomment to run after migration)
-- SELECT 'users' as table_name, onboarding_completed, COUNT(*) as count FROM public.users GROUP BY onboarding_completed
-- UNION ALL
-- SELECT 'user_profiles' as table_name, onboarding_completed, COUNT(*) as count FROM public.user_profiles GROUP BY onboarding_completed;