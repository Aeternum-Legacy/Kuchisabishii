-- Clear Authentication Users Script (FIXED)
-- This specifically targets the auth.users table and related auth data
-- ⚠️ WARNING: This will require fresh user registration

DO $$
DECLARE
    deleted_count integer;
BEGIN
    -- Step 1: Clear auth-related tables in correct order
    RAISE NOTICE 'Starting authentication data clearing...';

    -- Clear refresh tokens first
    DELETE FROM auth.refresh_tokens;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleared refresh tokens: %', deleted_count;

    -- Clear user sessions
    DELETE FROM auth.sessions;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleared sessions: %', deleted_count;

    -- Clear identity links (OAuth connections)
    DELETE FROM auth.identities;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleared identities: %', deleted_count;

    -- Clear audit log entries (if exists)
    BEGIN
        DELETE FROM auth.audit_log_entries;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Cleared audit log entries: %', deleted_count;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Audit log table does not exist, skipping';
    END;

    -- Finally clear the users table (this will cascade to public schema foreign keys)
    DELETE FROM auth.users;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleared users: %', deleted_count;

    RAISE NOTICE 'Authentication clearing completed!';
END
$$;

-- Verification: Show what's left in auth schema
SELECT 'Verification - Remaining records:' as status;

SELECT 
    'auth.users' as table_name,
    COUNT(*) as remaining_records
FROM auth.users
UNION ALL
SELECT 
    'auth.sessions',
    COUNT(*)
FROM auth.sessions
UNION ALL
SELECT 
    'auth.refresh_tokens',
    COUNT(*)
FROM auth.refresh_tokens
UNION ALL
SELECT 
    'auth.identities',
    COUNT(*)
FROM auth.identities
ORDER BY table_name;

SELECT '🎯 Authentication data cleared! Ready for fresh registration.' as final_result;