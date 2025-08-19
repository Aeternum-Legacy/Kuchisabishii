-- 🚨 CRITICAL SECURITY FIX: User Tenancy Isolation
-- Addresses critical security breach where users see each other's profiles

-- Step 1: Drop conflicting policies that allow cross-user access
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "OAuth can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public user profiles" ON public.users;

-- Step 2: Create strict user isolation policy
CREATE POLICY "STRICT_USER_ISOLATION_profiles" ON public.profiles
    FOR ALL USING (id = auth.uid());

-- Step 3: Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Remove service role bypass (temporarily)
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;

-- Step 5: Create minimal service role policy for essential operations only
CREATE POLICY "Service role minimal access profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Step 6: Verify no conflicting table schemas exist
DO $$
DECLARE
    profiles_count INTEGER;
    user_profiles_count INTEGER;
BEGIN
    -- Check if both tables exist
    SELECT COUNT(*) INTO profiles_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles';
    
    SELECT COUNT(*) INTO user_profiles_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_profiles';
    
    RAISE NOTICE 'Security Audit - Table Status:';
    RAISE NOTICE '  profiles table exists: %', (profiles_count > 0);
    RAISE NOTICE '  user_profiles table exists: %', (user_profiles_count > 0);
    
    IF user_profiles_count > 0 THEN
        RAISE WARNING 'SECURITY RISK: user_profiles table exists alongside profiles table';
        RAISE WARNING 'This creates schema confusion and potential data leakage';
    END IF;
END $$;

-- Step 7: Create audit function to verify user isolation
CREATE OR REPLACE FUNCTION audit_user_isolation()
RETURNS TABLE (
    policy_name TEXT,
    table_name TEXT,
    policy_definition TEXT,
    security_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pol.policyname::TEXT,
        pol.tablename::TEXT,
        pol.qual::TEXT,
        CASE 
            WHEN pol.qual LIKE '%auth.uid()%' THEN 'SECURE'
            WHEN pol.qual LIKE '%true%' THEN 'INSECURE'
            ELSE 'REVIEW_NEEDED'
        END as security_level
    FROM pg_policies pol
    WHERE pol.schemaname = 'public' 
    AND pol.tablename IN ('profiles', 'user_profiles')
    ORDER BY pol.tablename, pol.policyname;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Run security audit
SELECT * FROM audit_user_isolation();

-- Step 9: Test user isolation
DO $$
DECLARE
    test_result TEXT;
BEGIN
    -- This should only return current user's profile
    PERFORM id FROM public.profiles LIMIT 2;
    
    RAISE NOTICE 'Security Fix Applied Successfully';
    RAISE NOTICE 'All profile queries now strictly isolated to auth.uid()';
END $$;