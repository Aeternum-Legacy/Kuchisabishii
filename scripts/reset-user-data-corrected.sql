-- CORRECTED User Data Reset Script
-- Based on actual table names in the database schema
-- Execute these statements one by one in Supabase SQL editor

-- Step 1: Clear ML and AI data (using correct table names)
DELETE FROM public.ml_training_data WHERE 1=1;
DELETE FROM public.ml_feedback WHERE 1=1;
DELETE FROM public.ab_test_assignments WHERE 1=1;
DELETE FROM public.ab_test_results WHERE 1=1;
DELETE FROM public.model_metrics WHERE 1=1;
DELETE FROM public.user_embeddings WHERE 1=1;
DELETE FROM public.item_embeddings WHERE 1=1;
DELETE FROM public.recommendation_cache WHERE 1=1;

-- Step 2: Clear social features (if these tables exist)
DELETE FROM public.qr_friend_tokens WHERE 1=1;
DELETE FROM public.friend_requests WHERE 1=1;
DELETE FROM public.friendships WHERE 1=1;
DELETE FROM public.social_activities WHERE 1=1;

-- Step 3: Clear user profiles and preferences
-- Note: Check if you're using 'profiles' or 'user_profiles' table
DELETE FROM public.taste_profiles WHERE 1=1;
DELETE FROM public.user_profiles WHERE 1=1;
-- Alternative if using 'profiles' table:
-- DELETE FROM public.profiles WHERE 1=1;

-- Step 4: Clear food experiences and reviews
DELETE FROM public.restaurant_reviews WHERE 1=1;
DELETE FROM public.food_experiences_detailed WHERE 1=1;
DELETE FROM public.food_experiences WHERE 1=1;

-- Step 5: Clear other user data
DELETE FROM public.notifications WHERE 1=1;

-- Step 6: Clear user-created restaurants only (preserve seed data)
DELETE FROM public.restaurants WHERE created_by IS NOT NULL;

-- Step 7: Clear any remaining user-specific data
DELETE FROM public.seasonal_patterns WHERE 1=1; -- These might be user-specific

-- Verification: Check what's left
SELECT 'Reset completed. Checking remaining data:' as status;

-- Count remaining records in key tables
SELECT 
    'auth.users' as table_name, 
    COUNT(*) as count,
    'Authentication accounts (preserved)' as description
FROM auth.users
UNION ALL
SELECT 
    'profiles/user_profiles', 
    COALESCE(
        (SELECT COUNT(*) FROM public.user_profiles),
        (SELECT COUNT(*) FROM public.profiles)
    ),
    'User profile data'
UNION ALL
SELECT 
    'food_experiences', 
    COUNT(*),
    'Food logging entries'
FROM public.food_experiences
UNION ALL
SELECT 
    'restaurants', 
    COUNT(*),
    'Restaurant entries'
FROM public.restaurants
UNION ALL
SELECT 
    'recommendation_cache', 
    COUNT(*),
    'Cached recommendations'
FROM public.recommendation_cache;