-- ROLLBACK SCRIPT: Remove onboarding_completed column
-- Created: 2025-08-17
-- Purpose: Rollback the onboarding_completed column addition if needed

BEGIN;

-- Remove indexes first
DROP INDEX CONCURRENTLY IF EXISTS idx_users_onboarding_completed;
DROP INDEX CONCURRENTLY IF EXISTS idx_user_profiles_onboarding_completed;

-- Remove column from public.users table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.users DROP COLUMN onboarding_completed;
        RAISE NOTICE 'Removed onboarding_completed column from public.users table';
    ELSE
        RAISE NOTICE 'onboarding_completed column does not exist in public.users table';
    END IF;
END $$;

-- Remove column from public.user_profiles table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.user_profiles DROP COLUMN onboarding_completed;
        RAISE NOTICE 'Removed onboarding_completed column from public.user_profiles table';
    ELSE
        RAISE NOTICE 'onboarding_completed column does not exist in public.user_profiles table';
    END IF;
END $$;

COMMIT;

-- Verification
SELECT 
    'Rollback completed' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'onboarding_completed')
        THEN 'onboarding_completed still exists in users table'
        ELSE 'onboarding_completed removed from users table'
    END as users_table_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'onboarding_completed')
        THEN 'onboarding_completed still exists in user_profiles table'
        ELSE 'onboarding_completed removed from user_profiles table'
    END as user_profiles_table_status;