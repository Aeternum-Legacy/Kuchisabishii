-- PRODUCTION SETUP VERIFICATION SCRIPT
-- Run this script to verify database is properly configured for production

-- =============================================================================
-- 1. VERIFY ROW LEVEL SECURITY (RLS) IS ENABLED
-- =============================================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'restaurants', 'food_entries', 'reviews', 'review_responses', 
    'review_votes', 'friendships', 'user_follows', 'user_activities', 
    'user_collections', 'collection_items', 'user_preferences', 
    'taste_profile_history', 'restaurant_recommendations', 'food_pairings'
)
ORDER BY tablename;

-- =============================================================================
-- 2. VERIFY DATABASE IS CLEAN (NO DEMO DATA)
-- =============================================================================

-- Check for any remaining demo/test data
SELECT 'DEMO DATA CHECK' as category, 'Users with test emails' as description, count(*) as count
FROM public.users 
WHERE email LIKE '%example.com' OR email LIKE '%test%' OR email LIKE '%demo%'

UNION ALL

SELECT 'DEMO DATA CHECK', 'Restaurants with test names', count(*)
FROM public.restaurants 
WHERE name LIKE '%Test%' OR name LIKE '%Demo%' OR name LIKE '%Sample%' OR name LIKE '%Mock%'

UNION ALL

SELECT 'DEMO DATA CHECK', 'Food entries by demo users', count(*)
FROM public.food_entries 
WHERE user_id IN (
    SELECT id FROM public.users 
    WHERE email LIKE '%example.com' OR email LIKE '%test%' OR email LIKE '%demo%'
)

UNION ALL

SELECT 'DEMO DATA CHECK', 'Auth flow state records', count(*)
FROM auth.flow_state

ORDER BY category, description;

-- =============================================================================
-- 3. VERIFY PROPER INDEXES EXIST FOR PERFORMANCE
-- =============================================================================

SELECT 
    'INDEX CHECK' as category,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'restaurants', 'food_entries', 'reviews', 'friendships',
    'user_activities', 'user_preferences', 'taste_profile_history',
    'restaurant_recommendations'
)
ORDER BY tablename, indexname;

-- =============================================================================
-- 4. VERIFY FOREIGN KEY CONSTRAINTS
-- =============================================================================

SELECT 
    'CONSTRAINT CHECK' as category,
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- =============================================================================
-- 5. VERIFY ESSENTIAL FUNCTIONS EXIST
-- =============================================================================

SELECT 
    'FUNCTION CHECK' as category,
    routine_name as function_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'update_user_preferences_from_activity',
    'cleanup_expired_recommendations',
    'get_personalized_recommendations',
    'create_friendship_activity',
    'get_mutual_friends',
    'is_friends_with',
    'can_view_user_profile'
)
ORDER BY routine_name;

-- =============================================================================
-- 6. VERIFY TRIGGERS ARE ACTIVE
-- =============================================================================

SELECT 
    'TRIGGER CHECK' as category,
    event_object_table as table_name,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN (
    'users', 'food_entries', 'friendships', 'user_collections', 'user_preferences'
)
ORDER BY event_object_table, trigger_name;

-- =============================================================================
-- 7. VERIFY DATA TYPE CONSISTENCY
-- =============================================================================

SELECT 
    'DATA TYPE CHECK' as category,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN ('users', 'restaurants', 'food_entries', 'reviews')
AND column_name IN ('id', 'user_id', 'restaurant_id', 'created_at', 'updated_at')
ORDER BY table_name, column_name;

-- =============================================================================
-- 8. CHECK FOR PROPER ENUM TYPES
-- =============================================================================

SELECT 
    'ENUM CHECK' as category,
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e on t.oid = e.enumtypid  
WHERE t.typname IN ('friendship_status', 'activity_type', 'collection_item_type')
ORDER BY t.typname, e.enumsortorder;

-- =============================================================================
-- 9. VERIFY PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Check table sizes to ensure no bloat from deleted demo data
SELECT 
    'SIZE CHECK' as category,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================================================
-- 10. SECURITY VERIFICATION
-- =============================================================================

-- Verify RLS policies exist for critical tables
SELECT 
    'POLICY CHECK' as category,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- 11. FINAL PRODUCTION READINESS SUMMARY
-- =============================================================================

SELECT 
    'PRODUCTION READINESS SUMMARY' as category,
    'Tables with RLS enabled' as metric,
    count(*) as value
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true

UNION ALL

SELECT 
    'PRODUCTION READINESS SUMMARY',
    'Active RLS policies',
    count(*)
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'PRODUCTION READINESS SUMMARY',
    'Performance indexes',
    count(*)
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'PRODUCTION READINESS SUMMARY',
    'Foreign key constraints',
    count(*)
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_schema = 'public'

UNION ALL

SELECT 
    'PRODUCTION READINESS SUMMARY',
    'Essential functions',
    count(*)
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'update_user_preferences_from_activity', 
    'cleanup_expired_recommendations',
    'get_personalized_recommendations'
)

ORDER BY category, metric;

-- =============================================================================
-- FINAL CHECKS - THESE SHOULD ALL RETURN 0 FOR PRODUCTION
-- =============================================================================

SELECT 
    '⚠️  PRODUCTION WARNINGS' as category,
    'Demo users remaining' as warning,
    count(*) as count
FROM public.users 
WHERE email LIKE '%example.com' OR email LIKE '%test%' OR email LIKE '%demo%'

UNION ALL

SELECT 
    '⚠️  PRODUCTION WARNINGS',
    'Demo restaurants remaining', 
    count(*)
FROM public.restaurants 
WHERE name LIKE '%Test%' OR name LIKE '%Demo%' OR description LIKE '%test%'

UNION ALL

SELECT 
    '⚠️  PRODUCTION WARNINGS',
    'Auth flow state records',
    count(*)
FROM auth.flow_state

UNION ALL

SELECT 
    '⚠️  PRODUCTION WARNINGS',
    'Tables WITHOUT RLS',
    count(*)
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false
AND tablename IN (
    'users', 'restaurants', 'food_entries', 'reviews', 'friendships',
    'user_activities', 'user_preferences', 'restaurant_recommendations'
)

ORDER BY category, warning;