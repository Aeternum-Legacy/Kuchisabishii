-- Database Reset Script for User Accounts and Related Data
-- This script will reset all user data while preserving core schema structure
-- Run this in your Supabase SQL editor

-- Disable triggers temporarily to avoid cascading issues
SET session_replication_role = replica;

-- 1. Clear all user-generated content (in dependency order)
-- Start with dependent tables first

-- Clear ML and AI data
DELETE FROM public.ml_training_data;
DELETE FROM public.algorithm_performance_metrics;
DELETE FROM public.recommendation_interactions;
DELETE FROM public.recommendation_cache;
DELETE FROM public.user_similarity_cache;

-- Clear social and friendship data
DELETE FROM public.qr_friend_tokens;
DELETE FROM public.friend_requests;
DELETE FROM public.friendships;
DELETE FROM public.social_activities;

-- Clear user preferences and profiles
DELETE FROM public.palate_evolution_tracking;
DELETE FROM public.taste_learning_data;
DELETE FROM public.ai_onboarding_responses;
DELETE FROM public.taste_profiles;
DELETE FROM public.user_profiles;

-- Clear food and restaurant data
DELETE FROM public.restaurant_reviews;
DELETE FROM public.food_experiences_detailed;
DELETE FROM public.food_experiences;
DELETE FROM public.user_cuisines;
DELETE FROM public.restaurants WHERE created_by IS NOT NULL; -- Only user-created restaurants

-- Clear notifications and activity
DELETE FROM public.notifications;
DELETE FROM public.user_analytics;

-- 2. Clear authentication data (be very careful here)
-- Note: This will delete from auth.users which will cascade to all related tables
-- Uncomment the next line ONLY if you want to completely reset authentication
-- DELETE FROM auth.users WHERE email NOT LIKE '%@supabase.io'; -- Preserve admin users

-- 3. Reset sequences (if any)
-- ALTER SEQUENCE IF EXISTS public.restaurants_id_seq RESTART WITH 1000; -- Start after seed data

-- 4. Re-enable triggers
SET session_replication_role = DEFAULT;

-- 5. Insert fresh seed data (optional)
-- You can uncomment these to repopulate with sample data

-- Insert sample restaurants (preserving existing seed data)
/*
INSERT INTO public.restaurants (name, address, city, state, country, postal_code, phone, website, cuisine_types, price_range) VALUES
('Test Restaurant 1', '123 Test St', 'Test City', 'Test State', 'US', '12345', '+1234567890', 'https://test1.com', ARRAY['American'], 2),
('Test Restaurant 2', '456 Demo Ave', 'Demo City', 'Demo State', 'US', '67890', '+0987654321', 'https://test2.com', ARRAY['Italian'], 3);
*/

-- Success message
SELECT 'Database reset completed successfully. All user data has been cleared.' as status;

-- Show remaining data counts
SELECT 
    'auth.users' as table_name, 
    COUNT(*) as remaining_records 
FROM auth.users
UNION ALL
SELECT 
    'public.user_profiles', 
    COUNT(*) 
FROM public.user_profiles
UNION ALL
SELECT 
    'public.food_experiences', 
    COUNT(*) 
FROM public.food_experiences
UNION ALL
SELECT 
    'public.restaurants', 
    COUNT(*) 
FROM public.restaurants
UNION ALL
SELECT 
    'public.friendships', 
    COUNT(*) 
FROM public.friendships;