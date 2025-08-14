-- Simple Authentication Clear (No Functions)
-- Straightforward DELETE statements without function calls

-- Clear auth data in dependency order
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;
DELETE FROM auth.identities;

-- Clear audit log if it exists (some Supabase projects have this)
DELETE FROM auth.audit_log_entries WHERE TRUE;

-- Clear all users (this will cascade to related tables)
DELETE FROM auth.users;

-- Simple verification
SELECT 'Authentication tables cleared!' as status;

-- Show remaining counts
SELECT 
    (SELECT COUNT(*) FROM auth.users) as remaining_users,
    (SELECT COUNT(*) FROM auth.sessions) as remaining_sessions,
    (SELECT COUNT(*) FROM auth.refresh_tokens) as remaining_tokens,
    (SELECT COUNT(*) FROM auth.identities) as remaining_identities;

-- Final message
SELECT '✅ Ready for fresh user registration!' as result;