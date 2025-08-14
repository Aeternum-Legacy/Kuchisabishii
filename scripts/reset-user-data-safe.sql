-- SAFE User Data Reset Script
-- This script preserves authentication but clears user-generated content
-- Execute these statements one by one in Supabase SQL editor

-- Step 1: Clear ML and recommendation data
DELETE FROM public.ml_training_data;
DELETE FROM public.algorithm_performance_metrics;
DELETE FROM public.recommendation_interactions;
DELETE FROM public.recommendation_cache;
DELETE FROM public.user_similarity_cache;

-- Step 2: Clear social features
DELETE FROM public.qr_friend_tokens;
DELETE FROM public.friend_requests;
DELETE FROM public.friendships;
DELETE FROM public.social_activities;

-- Step 3: Clear user profiles and preferences (keeps auth.users intact)
DELETE FROM public.palate_evolution_tracking;
DELETE FROM public.taste_learning_data;
DELETE FROM public.ai_onboarding_responses;
DELETE FROM public.taste_profiles;
DELETE FROM public.user_profiles;

-- Step 4: Clear food experiences and reviews
DELETE FROM public.restaurant_reviews;
DELETE FROM public.food_experiences_detailed;
DELETE FROM public.food_experiences;

-- Step 5: Clear notifications and analytics
DELETE FROM public.notifications;
DELETE FROM public.user_analytics;

-- Step 6: Clear user-created restaurants (preserve seed data)
DELETE FROM public.restaurants WHERE created_by IS NOT NULL;

-- Verification: Check what's left
SELECT 'Reset completed. Remaining data:' as status;

SELECT 
    'auth.users' as table_name, 
    COUNT(*) as count,
    'Authentication accounts (preserved)' as description
FROM auth.users
UNION ALL
SELECT 
    'user_profiles', 
    COUNT(*),
    'User profile data'
FROM public.user_profiles
UNION ALL
SELECT 
    'food_experiences', 
    COUNT(*),
    'Food logging entries'
FROM public.food_experiences
UNION ALL
SELECT 
    'friendships', 
    COUNT(*),
    'Friend connections'
FROM public.friendships
UNION ALL
SELECT 
    'restaurants', 
    COUNT(*),
    'Restaurant entries (seed data preserved)'
FROM public.restaurants;