-- Initial Schema Migration for Kuchisabishii
-- This file contains the complete database setup including tables, functions, policies, and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Include the core schema
\ir ../schemas/core-schema.sql

-- Include the security policies
\ir ../policies/row-level-security.sql

-- Include the database functions
\ir ../functions/recommendation-engine.sql
\ir ../functions/search-functions.sql
\ir ../functions/api-functions.sql
\ir ../functions/storage-functions.sql

-- Create storage buckets (to be executed in Supabase Dashboard)
-- food-images bucket for food experience photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'food-images', 
  'food-images', 
  true, 
  10485760, -- 10MB
  '{"image/jpeg","image/png","image/webp","image/heic"}'
) ON CONFLICT (id) DO NOTHING;

-- food-videos bucket for food experience videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'food-videos', 
  'food-videos', 
  true, 
  52428800, -- 50MB
  '{"video/mp4","video/quicktime","video/webm"}'
) ON CONFLICT (id) DO NOTHING;

-- profile-images bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profile-images', 
  'profile-images', 
  true, 
  5242880, -- 5MB
  '{"image/jpeg","image/png","image/webp"}'
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for food-images bucket
CREATE POLICY "Users can upload their own food images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'food-images' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own food images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'food-images' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own food images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'food-images' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view food images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'food-images');

-- Storage policies for food-videos bucket
CREATE POLICY "Users can upload their own food videos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'food-videos' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own food videos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'food-videos' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own food videos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'food-videos' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view food videos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'food-videos');

-- Storage policies for profile-images bucket
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'profile-images');

-- Create indexes for optimal performance on common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_experiences_user_rating ON public.food_experiences(user_id, overall_rating DESC) WHERE overall_rating IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_experiences_restaurant_rating ON public.food_experiences(restaurant_id, overall_rating DESC) WHERE overall_rating IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_location_cuisine ON public.restaurants USING GIST(ll_to_earth(latitude, longitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_price_cuisine ON public.restaurants USING GIN(cuisine_types, price_range);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_restaurant_available ON public.menu_items(restaurant_id) WHERE is_available = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_status ON public.friendships(status) WHERE status = 'accepted';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shared_experiences_recipient ON public.shared_experiences(shared_with, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_interactions_user_type ON public.recommendation_interactions(user_id, recommendation_type, shown_at DESC);

-- Create database functions for real-time subscriptions
CREATE OR REPLACE FUNCTION notify_friend_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify friends when a user creates a new food experience
  PERFORM pg_notify('friend_activity', 
    json_build_object(
      'type', 'food_experience',
      'user_id', NEW.user_id,
      'experience_id', NEW.id,
      'dish_name', NEW.dish_name,
      'restaurant_id', NEW.restaurant_id
    )::TEXT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friend_activity_trigger
  AFTER INSERT ON public.food_experiences
  FOR EACH ROW 
  WHEN (NOT NEW.is_private AND NEW.shared_with_friends)
  EXECUTE FUNCTION notify_friend_activity();

-- Create function for real-time recommendation updates
CREATE OR REPLACE FUNCTION notify_recommendation_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify user when they receive a new shared experience
  PERFORM pg_notify('recommendation_update', 
    json_build_object(
      'type', 'shared_experience',
      'recipient_id', NEW.shared_with,
      'sharer_id', NEW.shared_by,
      'experience_id', NEW.food_experience_id,
      'message', NEW.message,
      'recommendation_strength', NEW.recommendation_strength
    )::TEXT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recommendation_update_trigger
  AFTER INSERT ON public.shared_experiences
  FOR EACH ROW 
  EXECUTE FUNCTION notify_recommendation_update();