-- Clear Authentication Users (Preserve Admin Accounts)
-- This clears regular users but preserves admin/system accounts
-- Safer option if you have admin accounts you want to keep

SELECT 'Clearing user authentication data (preserving admin accounts)...' as status;

-- Step 1: Identify admin accounts to preserve
-- You can modify this list to include accounts you want to keep
WITH admin_emails AS (
    SELECT unnest(ARRAY[
        'admin@kuchisabishii.com',
        'test@supabase.io',
        'demo@admin.com'
        -- Add any other admin emails here
    ]) as email
),
admin_users AS (
    SELECT u.id 
    FROM auth.users u
    JOIN admin_emails a ON u.email = a.email
)

-- Step 2: Clear non-admin refresh tokens
, non_admin_refresh_tokens AS (
    DELETE FROM auth.refresh_tokens 
    WHERE user_id NOT IN (SELECT id FROM admin_users)
    RETURNING user_id
)

-- Step 3: Clear non-admin sessions  
, non_admin_sessions AS (
    DELETE FROM auth.sessions 
    WHERE user_id NOT IN (SELECT id FROM admin_users)
    RETURNING user_id
)

-- Step 4: Clear non-admin identities
, non_admin_identities AS (
    DELETE FROM auth.identities 
    WHERE user_id NOT IN (SELECT id FROM admin_users)
    RETURNING user_id
)

-- Step 5: Clear non-admin users (this will cascade to public schema)
, deleted_users AS (
    DELETE FROM auth.users 
    WHERE id NOT IN (SELECT id FROM admin_users)
    RETURNING id, email
)

-- Return summary
SELECT 
    COUNT(*) as deleted_users_count,
    string_agg(email, ', ') as deleted_emails
FROM deleted_users;

-- Verification: Show remaining users
SELECT 'Remaining authenticated users:' as status;
SELECT email, created_at, confirmed_at 
FROM auth.users 
ORDER BY created_at;

SELECT '✅ Non-admin users cleared! Admin accounts preserved.' as result;