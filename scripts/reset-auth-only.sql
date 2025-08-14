-- AUTHENTICATION ONLY Reset Script
-- This clears ONLY the auth.users data for fresh registration
-- Preserves all other data structures
-- ⚠️ WARNING: You will need to re-register accounts

SELECT '🔐 Clearing authentication data only...' as status;

-- Method 1: Clear ALL authentication accounts
-- Uncomment this for complete auth reset:
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions; 
DELETE FROM auth.identities;
DELETE FROM auth.users; -- This will cascade and clear related profile data too

-- Method 2: Clear only non-admin accounts (SAFER)
-- Comment out Method 1 and uncomment this for safer reset:
/*
DELETE FROM auth.refresh_tokens 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email NOT LIKE '%@supabase.io' 
    AND email NOT LIKE '%@admin.%'
);

DELETE FROM auth.sessions 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email NOT LIKE '%@supabase.io' 
    AND email NOT LIKE '%@admin.%'
);

DELETE FROM auth.identities 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email NOT LIKE '%@supabase.io' 
    AND email NOT LIKE '%@admin.%'
);

DELETE FROM auth.users 
WHERE email NOT LIKE '%@supabase.io' 
AND email NOT LIKE '%@admin.%';
*/

-- Verification
SELECT 'Authentication reset completed!' as result;
SELECT COUNT(*) as remaining_auth_users FROM auth.users;
SELECT '🎯 Ready for fresh user registration!' as next_step;