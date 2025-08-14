-- CURRENT DATABASE STATE CHECK
-- Run this to understand what data currently exists before cleanup

-- =============================================================================
-- 1. CHECK CURRENT USER DATA
-- =============================================================================

SELECT 'CURRENT DATABASE STATE' as section, 'User Analysis' as subsection;

-- Count users and show sample emails
SELECT 
    'Users Total' as metric,
    count(*) as count,
    string_agg(email, ', ' ORDER BY created_at LIMIT 5) as sample_emails
FROM public.users;

-- Identify demo/test users
SELECT 
    'Demo Users Detected' as metric,
    count(*) as count,
    string_agg(email, ', ' ORDER BY created_at) as demo_emails
FROM public.users 
WHERE email LIKE '%example.com' 
   OR email LIKE '%test%' 
   OR email LIKE '%demo%'
   OR id IN (
       '550e8400-e29b-41d4-a716-446655440000',
       '00000000-0000-0000-0000-000000000001',
       '00000000-0000-0000-0000-000000000002'
   );

-- =============================================================================
-- 2. CHECK RESTAURANT DATA
-- =============================================================================

SELECT 'Restaurant Analysis' as subsection;

-- Count restaurants and show samples
SELECT 
    'Restaurants Total' as metric,
    count(*) as count,
    string_agg(name, ', ' ORDER BY created_at LIMIT 5) as sample_names
FROM public.restaurants;

-- Identify demo restaurants
SELECT 
    'Demo Restaurants Detected' as metric,
    count(*) as count,
    string_agg(name, ', ' ORDER BY created_at) as demo_restaurants
FROM public.restaurants 
WHERE name LIKE 'Dev %' 
   OR name LIKE 'Mock %' 
   OR name LIKE 'Test %' 
   OR name LIKE 'Sample %' 
   OR name LIKE 'Demo %'
   OR name LIKE '%Test%'
   OR description LIKE '%test%'
   OR description LIKE '%demo%'
   OR id LIKE 'rest-%'
   OR id LIKE 'truck-%';

-- =============================================================================
-- 3. CHECK FOOD ENTRIES AND REVIEWS
-- =============================================================================

SELECT 'Food Entries & Reviews Analysis' as subsection;

-- Food entries by demo users
SELECT 
    'Food Entries by Demo Users' as metric,
    count(*) as count
FROM public.food_entries fe
JOIN public.users u ON fe.user_id = u.id
WHERE u.email LIKE '%example.com' 
   OR u.email LIKE '%test%' 
   OR u.email LIKE '%demo%'
   OR u.id IN (
       '550e8400-e29b-41d4-a716-446655440000',
       '00000000-0000-0000-0000-000000000001', 
       '00000000-0000-0000-0000-000000000002'
   );

-- Reviews by demo users
SELECT 
    'Reviews by Demo Users' as metric,
    count(*) as count
FROM public.reviews r
JOIN public.users u ON r.user_id = u.id  
WHERE u.email LIKE '%example.com'
   OR u.email LIKE '%test%'
   OR u.email LIKE '%demo%'
   OR u.id IN (
       '550e8400-e29b-41d4-a716-446655440000',
       '00000000-0000-0000-0000-000000000001',
       '00000000-0000-0000-0000-000000000002'
   );

-- =============================================================================  
-- 4. CHECK AUTH STATE
-- =============================================================================

SELECT 'Authentication State Analysis' as subsection;

-- Check auth.flow_state
SELECT 
    'Auth Flow State Records' as metric,
    count(*) as count
FROM auth.flow_state;

-- Check for any users in auth.users vs public.users sync
SELECT 
    'Auth Users vs Public Users' as metric,
    (SELECT count(*) FROM auth.users) as auth_count,
    (SELECT count(*) FROM public.users) as public_count,
    (SELECT count(*) FROM auth.users) - (SELECT count(*) FROM public.users) as difference;

-- =============================================================================
-- 5. CHECK SOCIAL FEATURES DATA  
-- =============================================================================

SELECT 'Social Features Analysis' as subsection;

-- Friendships involving demo users
SELECT 
    'Friendships with Demo Users' as metric,
    count(*) as count
FROM public.friendships f
WHERE f.requester_id IN (
    SELECT id FROM public.users 
    WHERE email LIKE '%example.com' OR email LIKE '%test%' OR email LIKE '%demo%'
) OR f.addressee_id IN (
    SELECT id FROM public.users 
    WHERE email LIKE '%example.com' OR email LIKE '%test%' OR email LIKE '%demo%'  
);

-- User activities by demo users
SELECT 
    'Activities by Demo Users' as metric,
    count(*) as count
FROM public.user_activities ua
JOIN public.users u ON ua.user_id = u.id
WHERE u.email LIKE '%example.com' 
   OR u.email LIKE '%test%' 
   OR u.email LIKE '%demo%';

-- Collections by demo users  
SELECT 
    'Collections by Demo Users' as metric,
    count(*) as count
FROM public.user_collections uc
JOIN public.users u ON uc.user_id = u.id
WHERE u.email LIKE '%example.com'
   OR u.email LIKE '%test%'
   OR u.email LIKE '%demo%';

-- =============================================================================
-- 6. CHECK PREFERENCES AND RECOMMENDATIONS
-- =============================================================================

SELECT 'Preferences & Recommendations Analysis' as subsection;

-- User preferences for demo users
SELECT 
    'Preferences by Demo Users' as metric,
    count(*) as count  
FROM public.user_preferences up
JOIN public.users u ON up.user_id = u.id
WHERE u.email LIKE '%example.com'
   OR u.email LIKE '%test%' 
   OR u.email LIKE '%demo%';

-- Taste profile history for demo users
SELECT 
    'Taste History by Demo Users' as metric,
    count(*) as count
FROM public.taste_profile_history tph  
JOIN public.users u ON tph.user_id = u.id
WHERE u.email LIKE '%example.com'
   OR u.email LIKE '%test%'
   OR u.email LIKE '%demo%';

-- Restaurant recommendations for demo users
SELECT 
    'Recommendations for Demo Users' as metric,
    count(*) as count
FROM public.restaurant_recommendations rr
JOIN public.users u ON rr.user_id = u.id
WHERE u.email LIKE '%example.com'
   OR u.email LIKE '%test%'
   OR u.email LIKE '%demo%';

-- =============================================================================
-- 7. CHECK FOOD PAIRINGS
-- =============================================================================

SELECT 'Food Pairings Analysis' as subsection;

-- Low vote count pairings (likely demo data)
SELECT 
    'Low Vote Pairings (Demo)' as metric,
    count(*) as count
FROM public.food_pairings 
WHERE user_votes < 50;

-- Pairings with demo IDs
SELECT 
    'Demo ID Pairings' as metric,
    count(*) as count  
FROM public.food_pairings
WHERE id LIKE 'pairing-00%';

-- =============================================================================
-- 8. SUMMARY CLEANUP IMPACT
-- =============================================================================

SELECT 'CLEANUP IMPACT SUMMARY' as section, 'Estimated Deletions' as subsection;

-- Total records that would be deleted
SELECT 
    'Demo Users to Delete' as item,
    count(*) as count
FROM public.users 
WHERE email LIKE '%example.com' 
   OR email LIKE '%test%' 
   OR email LIKE '%demo%'
   OR id IN (
       '550e8400-e29b-41d4-a716-446655440000',
       '00000000-0000-0000-0000-000000000001',
       '00000000-0000-0000-0000-000000000002'
   )

UNION ALL

SELECT 
    'Demo Restaurants to Delete',
    count(*)
FROM public.restaurants 
WHERE name LIKE 'Dev %' 
   OR name LIKE 'Mock %' 
   OR name LIKE 'Test %' 
   OR name LIKE 'Sample %' 
   OR name LIKE 'Demo %'
   OR name LIKE '%Test%'
   OR description LIKE '%test%'
   OR description LIKE '%demo%'
   OR id LIKE 'rest-%'
   OR id LIKE 'truck-%'

UNION ALL

SELECT 
    'Auth Flow State Records',
    count(*)
FROM auth.flow_state

UNION ALL

SELECT 
    'Low Vote Food Pairings',
    count(*)
FROM public.food_pairings 
WHERE user_votes < 50

ORDER BY item;

-- =============================================================================
-- 9. CURRENT DATABASE SIZE
-- =============================================================================

SELECT 'DATABASE SIZE' as section, 'Storage Analysis' as subsection;

SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;