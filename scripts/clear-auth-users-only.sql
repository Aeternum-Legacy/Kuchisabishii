-- Clear Authentication Users Script
-- This specifically targets the auth.users table and related auth data
-- ⚠️ WARNING: This will require fresh user registration

-- Step 1: Clear auth-related tables in correct order (to avoid foreign key issues)
SELECT 'Clearing authentication data...' as status;

-- Clear refresh tokens first
DELETE FROM auth.refresh_tokens;
SELECT 'Cleared refresh tokens: ' || ROW_COUNT() as result;

-- Clear user sessions
DELETE FROM auth.sessions;
SELECT 'Cleared sessions: ' || ROW_COUNT() as result;

-- Clear identity links (OAuth connections)
DELETE FROM auth.identities;
SELECT 'Cleared identities: ' || ROW_COUNT() as result;

-- Clear audit log entries (if exists)
DELETE FROM auth.audit_log_entries WHERE TRUE;

-- Finally clear the users table (this will cascade to public schema foreign keys)
DELETE FROM auth.users;
SELECT 'Cleared users: ' || ROW_COUNT() as result;

-- Step 2: Reset any user-related sequences (optional)
-- Uncomment if you want to reset auto-incrementing values
-- ALTER SEQUENCE IF EXISTS auth.refresh_tokens_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS auth.audit_log_entries_id_seq RESTART WITH 1;

-- Step 3: Verification
SELECT 'Authentication clearing completed!' as status;

-- Show what's left in auth schema
SELECT 
    table_name,
    (
        CASE table_name
            WHEN 'users' THEN (SELECT COUNT(*) FROM auth.users)::text
            WHEN 'sessions' THEN (SELECT COUNT(*) FROM auth.sessions)::text
            WHEN 'refresh_tokens' THEN (SELECT COUNT(*) FROM auth.refresh_tokens)::text
            WHEN 'identities' THEN (SELECT COUNT(*) FROM auth.identities)::text
            ELSE 'N/A'
        END
    ) as remaining_records
FROM information_schema.tables 
WHERE table_schema = 'auth' 
AND table_name IN ('users', 'sessions', 'refresh_tokens', 'identities')
ORDER BY table_name;

SELECT '🎯 Authentication data cleared! Ready for fresh registration.' as final_result;