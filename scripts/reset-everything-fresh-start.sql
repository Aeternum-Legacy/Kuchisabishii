-- COMPLETE FRESH START Reset Script
-- This will clear ALL user data including authentication accounts
-- ⚠️ WARNING: This will require you to re-register with new accounts
-- Execute in Supabase SQL editor

-- Function to safely delete from table if it exists
CREATE OR REPLACE FUNCTION safe_delete_all(table_name text, schema_name text DEFAULT 'public')
RETURNS text AS $$
DECLARE
    sql_statement text;
    result_message text;
    deleted_count integer;
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = schema_name 
        AND table_name = safe_delete_all.table_name
    ) THEN
        -- Table exists, perform delete
        sql_statement := format('DELETE FROM %I.%I', schema_name, table_name);
        EXECUTE sql_statement;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN format('✅ Cleared %s records from %s.%s', deleted_count, schema_name, table_name);
    ELSE
        -- Table doesn't exist
        RETURN format('⚠️ Table %s.%s does not exist, skipping', schema_name, table_name);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN format('❌ Error clearing %s.%s: %s', schema_name, table_name, SQLERRM);
END;
$$ LANGUAGE plpgsql;

SELECT '🧹 Starting COMPLETE database reset (including auth)...' as status;

-- STEP 1: Clear all user-generated content first (to avoid foreign key issues)
SELECT '📊 Clearing AI/ML data...' as step;
SELECT safe_delete_all('ml_training_data');
SELECT safe_delete_all('ml_feedback'); 
SELECT safe_delete_all('ab_test_assignments');
SELECT safe_delete_all('ab_test_results');
SELECT safe_delete_all('model_metrics');
SELECT safe_delete_all('user_embeddings');
SELECT safe_delete_all('item_embeddings');
SELECT safe_delete_all('recommendation_cache');

SELECT '👥 Clearing social data...' as step;
SELECT safe_delete_all('qr_friend_tokens');
SELECT safe_delete_all('friend_requests');
SELECT safe_delete_all('friendships');
SELECT safe_delete_all('social_activities');

SELECT '👤 Clearing user profiles...' as step;
SELECT safe_delete_all('taste_profiles');
SELECT safe_delete_all('user_profiles');
SELECT safe_delete_all('profiles');

SELECT '🍽️ Clearing food experiences...' as step;
SELECT safe_delete_all('restaurant_reviews');
SELECT safe_delete_all('food_experiences_detailed');
SELECT safe_delete_all('food_experiences');

SELECT '🔔 Clearing notifications and misc data...' as step;
SELECT safe_delete_all('notifications');
SELECT safe_delete_all('seasonal_patterns');

-- Custom delete for user-created restaurants (preserve seed data)
DO $$
DECLARE
    deleted_count integer;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurants' 
        AND column_name = 'created_by'
    ) THEN
        DELETE FROM public.restaurants WHERE created_by IS NOT NULL;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '✅ Cleared % user-created restaurants (preserved seed data)', deleted_count;
    ELSE
        -- If no created_by column, optionally clear all restaurants
        -- Uncomment the next lines if you want to clear ALL restaurants
        -- DELETE FROM public.restaurants;
        -- GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '⚠️ No created_by column in restaurants table, preserved all restaurant data';
    END IF;
END
$$;

-- STEP 2: Clear authentication data (this is the key addition)
SELECT '🔐 Clearing authentication data...' as step;

-- Clear auth schema tables (be very careful here)
SELECT safe_delete_all('refresh_tokens', 'auth');
SELECT safe_delete_all('sessions', 'auth');
SELECT safe_delete_all('identities', 'auth');
SELECT safe_delete_all('users', 'auth'); -- This will cascade to all related tables

-- Alternative safer approach - only clear non-admin users
-- Uncomment this instead of the above if you want to preserve admin accounts:
/*
DO $$
DECLARE
    deleted_count integer;
BEGIN
    -- Clear only non-system users (preserve admin/service accounts)
    DELETE FROM auth.users 
    WHERE email NOT LIKE '%@supabase.io' 
    AND email NOT LIKE '%@admin.%'
    AND email NOT IN ('admin@kuchisabishii.com'); -- Add any admin emails to preserve
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ Cleared % user accounts (preserved admin accounts)', deleted_count;
END
$$;
*/

-- STEP 3: Reset any sequences or auto-incrementing IDs
-- (Add any sequence resets here if needed)

-- STEP 4: Final verification
SELECT '✅ COMPLETE RESET FINISHED!' as status;
SELECT '🔄 You will need to create new accounts to test the app' as note;

-- Show what's left
SELECT 'Remaining data summary:' as summary;

SELECT 
    'auth.users' as table_name, 
    COUNT(*) as remaining_records,
    'Authentication accounts' as note
FROM auth.users

UNION ALL

SELECT 
    'public.restaurants',
    COUNT(*),
    'Restaurant seed data' 
FROM public.restaurants

UNION ALL

SELECT 
    'Total public tables with data',
    (
        SELECT COUNT(*) 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
        AND (
            SELECT COUNT(*) 
            FROM information_schema.columns c 
            WHERE c.table_schema = t.table_schema 
            AND c.table_name = t.table_name
        ) > 0
    ),
    'Non-empty tables'

ORDER BY table_name;

-- Clean up helper function
DROP FUNCTION safe_delete_all(text, text);

SELECT '🎯 Database is now completely reset!' as final_status;
SELECT '📱 Ready for fresh user registration and Phase 5 testing!' as next_step;