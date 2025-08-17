-- Database User Data Flow Verification Script
-- Kuchisabishii Queen-Led Hive - Database Architect Analysis

-- ========================================
-- SECTION 1: VERIFY TABLE EXISTENCE
-- ========================================

\echo '=== TABLE EXISTENCE VERIFICATION ==='
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'users', 'user_profiles')
ORDER BY tablename;

-- Check auth.users table
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'auth' 
  AND tablename = 'users'
ORDER BY tablename;

-- ========================================
-- SECTION 2: VERIFY PROFILE TABLE SCHEMA
-- ========================================

\echo '=== PROFILE TABLE SCHEMA VERIFICATION ==='
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if user_profiles table exists instead
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ========================================
-- SECTION 3: VERIFY ONBOARDING_COMPLETED COLUMN
-- ========================================

\echo '=== ONBOARDING_COMPLETED COLUMN VERIFICATION ==='
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'onboarding_completed'
  AND table_name IN ('profiles', 'users', 'user_profiles');

-- ========================================
-- SECTION 4: CHECK FOREIGN KEY CONSTRAINTS
-- ========================================

\echo '=== FOREIGN KEY CONSTRAINTS ==='
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'users', 'user_profiles');

-- ========================================
-- SECTION 5: VERIFY DATA FLOW INTEGRITY
-- ========================================

\echo '=== AUTH.USERS DATA SAMPLE ==='
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data->'display_name' as display_name,
    raw_user_meta_data->'provider' as provider
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

\echo '=== PROFILE DATA SAMPLE (if profiles table exists) ==='
SELECT 
    id,
    email,
    display_name,
    onboarding_completed,
    created_at,
    updated_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

\echo '=== USER_PROFILES DATA SAMPLE (if user_profiles table exists) ==='
SELECT 
    id,
    username,
    display_name,
    onboarding_completed,
    created_at,
    updated_at
FROM public.user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- SECTION 6: VERIFY DATA LINKING
-- ========================================

\echo '=== AUTH.USERS TO PROFILES LINKING ==='
-- Check if auth.users have corresponding profiles
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    p.id as profile_id,
    p.email as profile_email,
    p.onboarding_completed,
    CASE 
        WHEN p.id IS NULL THEN 'MISSING_PROFILE'
        WHEN au.email != p.email THEN 'EMAIL_MISMATCH'
        ELSE 'LINKED_OK'
    END as link_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

\echo '=== AUTH.USERS TO USER_PROFILES LINKING ==='
-- Check if auth.users have corresponding user_profiles
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    up.id as user_profile_id,
    up.username,
    up.onboarding_completed,
    CASE 
        WHEN up.id IS NULL THEN 'MISSING_USER_PROFILE'
        ELSE 'LINKED_OK'
    END as link_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC
LIMIT 10;

-- ========================================
-- SECTION 7: IDENTIFY ORPHANED DATA
-- ========================================

\echo '=== ORPHANED PROFILES (no auth.users) ==='
SELECT 
    p.id,
    p.email,
    p.display_name,
    p.onboarding_completed,
    p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL
LIMIT 5;

\echo '=== ORPHANED USER_PROFILES (no auth.users) ==='
SELECT 
    up.id,
    up.username,
    up.display_name,
    up.onboarding_completed,
    up.created_at
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL
LIMIT 5;

-- ========================================
-- SECTION 8: VERIFY ONBOARDING STATUS DISTRIBUTION
-- ========================================

\echo '=== ONBOARDING STATUS DISTRIBUTION ==='
-- Check profiles table
SELECT 
    'profiles' as table_name,
    onboarding_completed,
    COUNT(*) as count
FROM public.profiles
GROUP BY onboarding_completed
ORDER BY onboarding_completed;

-- Check user_profiles table
SELECT 
    'user_profiles' as table_name,
    onboarding_completed,
    COUNT(*) as count
FROM public.user_profiles
GROUP BY onboarding_completed
ORDER BY onboarding_completed;

-- ========================================
-- SECTION 9: VERIFY RLS POLICIES
-- ========================================

\echo '=== ROW LEVEL SECURITY POLICIES ==='
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'users', 'user_profiles')
ORDER BY tablename, policyname;

-- ========================================
-- SECTION 10: VERIFY INDEXES
-- ========================================

\echo '=== TABLE INDEXES ==='
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'users', 'user_profiles')
ORDER BY tablename, indexname;

-- ========================================
-- SECTION 11: RECENT AUTH ACTIVITY
-- ========================================

\echo '=== RECENT AUTH ACTIVITY ==='
SELECT 
    au.id,
    au.email,
    au.created_at as user_created,
    au.last_sign_in_at,
    au.email_confirmed_at,
    p.onboarding_completed as profile_onboarding,
    up.onboarding_completed as user_profile_onboarding,
    CASE 
        WHEN p.id IS NOT NULL AND up.id IS NOT NULL THEN 'BOTH_TABLES'
        WHEN p.id IS NOT NULL THEN 'PROFILES_ONLY'
        WHEN up.id IS NOT NULL THEN 'USER_PROFILES_ONLY'
        ELSE 'NO_PROFILE'
    END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.created_at >= NOW() - INTERVAL '7 days'
ORDER BY au.created_at DESC;

-- ========================================
-- SECTION 12: SUMMARY DIAGNOSTICS
-- ========================================

\echo '=== SUMMARY DIAGNOSTICS ==='
SELECT 
    'auth.users' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM auth.users

UNION ALL

SELECT 
    'public.profiles' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM public.profiles

UNION ALL

SELECT 
    'public.user_profiles' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM public.user_profiles;

\echo '=== DATA FLOW DIAGNOSIS COMPLETE ==='