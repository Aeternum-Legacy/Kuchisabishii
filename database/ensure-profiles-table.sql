-- Database Migration: Ensure profiles table has required columns for OAuth callback
-- Run this to fix OAuth profile creation issues

DO $$
DECLARE
    onboarding_column_exists BOOLEAN;
    email_verified_column_exists BOOLEAN;
BEGIN
    -- Check if onboarding_completed column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'onboarding_completed'
    ) INTO onboarding_column_exists;
    
    -- Check if email_verified column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'email_verified'
    ) INTO email_verified_column_exists;
    
    RAISE NOTICE 'Profile table column status:';
    RAISE NOTICE '  onboarding_completed exists: %', onboarding_column_exists;
    RAISE NOTICE '  email_verified exists: %', email_verified_column_exists;
    
    -- Add onboarding_completed column if missing
    IF NOT onboarding_column_exists THEN
        ALTER TABLE public.profiles 
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT false NOT NULL;
        
        RAISE NOTICE 'Added onboarding_completed column to profiles table';
    END IF;
    
    -- Add email_verified column if missing
    IF NOT email_verified_column_exists THEN
        ALTER TABLE public.profiles 
        ADD COLUMN email_verified BOOLEAN DEFAULT false NOT NULL;
        
        RAISE NOTICE 'Added email_verified column to profiles table';
    END IF;
    
    -- Create index on onboarding_completed for performance
    CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
    ON public.profiles(onboarding_completed);
    
    RAISE NOTICE 'Profile table setup complete for OAuth callback';
END $$;

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;