-- SAFE User Data Reset Script v2
-- This version checks if tables exist before attempting to delete
-- Execute in Supabase SQL editor

-- Function to safely delete from table if it exists
CREATE OR REPLACE FUNCTION safe_delete_all(table_name text)
RETURNS text AS $$
DECLARE
    sql_statement text;
    result_message text;
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = safe_delete_all.table_name
    ) THEN
        -- Table exists, perform delete
        sql_statement := format('DELETE FROM public.%I', table_name);
        EXECUTE sql_statement;
        
        GET DIAGNOSTICS result_message = ROW_COUNT;
        RETURN format('✅ Cleared %s records from %s', result_message, table_name);
    ELSE
        -- Table doesn't exist
        RETURN format('⚠️ Table %s does not exist, skipping', table_name);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN format('❌ Error clearing %s: %s', table_name, SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Now safely clear all tables
SELECT 'Starting safe database reset...' as status;

-- AI/ML Tables
SELECT safe_delete_all('ml_training_data');
SELECT safe_delete_all('ml_feedback'); 
SELECT safe_delete_all('ab_test_assignments');
SELECT safe_delete_all('ab_test_results');
SELECT safe_delete_all('model_metrics');
SELECT safe_delete_all('user_embeddings');
SELECT safe_delete_all('item_embeddings');
SELECT safe_delete_all('recommendation_cache');

-- Social Tables
SELECT safe_delete_all('qr_friend_tokens');
SELECT safe_delete_all('friend_requests');
SELECT safe_delete_all('friendships');
SELECT safe_delete_all('social_activities');

-- User Profile Tables
SELECT safe_delete_all('taste_profiles');
SELECT safe_delete_all('user_profiles');
SELECT safe_delete_all('profiles'); -- Alternative table name

-- Food and Restaurant Tables
SELECT safe_delete_all('restaurant_reviews');
SELECT safe_delete_all('food_experiences_detailed');
SELECT safe_delete_all('food_experiences');

-- Other Tables
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
        RAISE NOTICE '⚠️ No created_by column in restaurants table, skipping selective delete';
    END IF;
END
$$;

-- Final verification
SELECT 'Database reset completed! Summary:' as status;

-- Show remaining data
SELECT 
    'auth.users' as table_name, 
    COUNT(*) as remaining_records,
    'Login accounts (preserved)' as note
FROM auth.users

UNION ALL

SELECT 
    'public.' || table_name,
    (
        SELECT COUNT(*) 
        FROM information_schema.tables t2 
        WHERE t2.table_schema = 'public' 
        AND t2.table_name = t.table_name
    ),
    CASE 
        WHEN table_name IN ('restaurants') THEN 'Core data (preserved)'
        ELSE 'Should be empty'
    END
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles', 'profiles', 'food_experiences', 
    'friendships', 'recommendation_cache', 'restaurants'
)
ORDER BY table_name;

-- Clean up the helper function
DROP FUNCTION safe_delete_all(text);