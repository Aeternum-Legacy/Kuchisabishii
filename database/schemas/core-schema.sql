-- Kuchisabishii Database Schema
-- Core tables for emotional food journaling and recommendations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- User authentication and profiles
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'authenticated'
);

-- User profiles with detailed preferences
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic info
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  
  -- Preferences and restrictions
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  spice_tolerance INTEGER CHECK (spice_tolerance >= 1 AND spice_tolerance <= 10) DEFAULT 5,
  sweetness_preference INTEGER CHECK (sweetness_preference >= 1 AND sweetness_preference <= 10) DEFAULT 5,
  
  -- Privacy settings
  profile_visibility TEXT DEFAULT 'friends' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  allow_recommendations BOOLEAN DEFAULT TRUE,
  share_analytics BOOLEAN DEFAULT TRUE,
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  taste_profile_setup BOOLEAN DEFAULT FALSE
);

-- Emotional taste profile for personalization
CREATE TABLE public.taste_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Taste preferences (1-10 scale)
  salty_preference INTEGER CHECK (salty_preference >= 1 AND salty_preference <= 10),
  sweet_preference INTEGER CHECK (sweet_preference >= 1 AND sweet_preference <= 10),
  sour_preference INTEGER CHECK (sour_preference >= 1 AND sour_preference <= 10),
  bitter_preference INTEGER CHECK (bitter_preference >= 1 AND bitter_preference <= 10),
  umami_preference INTEGER CHECK (umami_preference >= 1 AND umami_preference <= 10),
  
  -- Texture preferences
  crunchy_preference INTEGER CHECK (crunchy_preference >= 1 AND crunchy_preference <= 10),
  creamy_preference INTEGER CHECK (creamy_preference >= 1 AND creamy_preference <= 10),
  chewy_preference INTEGER CHECK (chewy_preference >= 1 AND chewy_preference <= 10),
  
  -- Temperature preferences
  hot_food_preference INTEGER CHECK (hot_food_preference >= 1 AND hot_food_preference <= 10),
  cold_food_preference INTEGER CHECK (cold_food_preference >= 1 AND cold_food_preference <= 10),
  
  -- Cuisine preferences (JSON for flexibility)
  cuisine_preferences JSONB DEFAULT '{}',
  
  -- Adventure level
  culinary_adventurousness INTEGER CHECK (culinary_adventurousness >= 1 AND culinary_adventurousness <= 10) DEFAULT 5,
  
  UNIQUE(user_id)
);

-- Restaurant database
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'US',
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Restaurant details
  cuisine_types TEXT[] DEFAULT '{}',
  price_range INTEGER CHECK (price_range >= 1 AND price_range <= 4) DEFAULT 2,
  hours JSONB, -- Operating hours structure
  
  -- Features
  features TEXT[] DEFAULT '{}', -- parking, wifi, outdoor_seating, etc.
  dietary_options TEXT[] DEFAULT '{}', -- vegan, gluten_free, etc.
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES public.user_profiles(id),
  
  -- Search optimization
  search_vector TSVECTOR
);

-- Menu items for restaurants
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category TEXT, -- appetizer, main, dessert, etc.
  
  -- Nutritional info (optional)
  calories INTEGER,
  ingredients TEXT[],
  allergens TEXT[],
  
  -- Metadata
  spice_level INTEGER CHECK (spice_level >= 1 AND spice_level <= 5),
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  
  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  seasonal BOOLEAN DEFAULT FALSE,
  
  -- Images
  image_urls TEXT[] DEFAULT '{}'
);

-- Food experiences (core journaling feature)
CREATE TABLE public.food_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id),
  menu_item_id UUID REFERENCES public.menu_items(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Experience details
  dish_name TEXT NOT NULL,
  custom_notes TEXT,
  meal_time TEXT CHECK (meal_time IN ('breakfast', 'brunch', 'lunch', 'dinner', 'snack', 'dessert')),
  dining_method TEXT CHECK (dining_method IN ('dine_in', 'takeout', 'delivery', 'homemade')),
  
  -- Date and time
  experienced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Financial
  amount_spent DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Overall experience rating (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Detailed taste experience
  taste_notes JSONB DEFAULT '{}', -- structured taste data
  
  -- Emotional response
  emotions TEXT[] DEFAULT '{}', -- happy, satisfied, disappointed, etc.
  mood_before TEXT,
  mood_after TEXT,
  satisfaction_level INTEGER CHECK (satisfaction_level >= 1 AND satisfaction_level <= 10),
  
  -- Physical sensations
  mouthfeel JSONB DEFAULT '{}', -- texture descriptions
  aroma_notes TEXT[],
  temperature_rating INTEGER CHECK (temperature_rating >= 1 AND temperature_rating <= 5),
  portion_size TEXT CHECK (portion_size IN ('too_small', 'just_right', 'too_large')),
  
  -- Context
  dining_companions INTEGER DEFAULT 0,
  special_occasion TEXT,
  weather TEXT,
  
  -- Media
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  
  -- Privacy
  is_private BOOLEAN DEFAULT FALSE,
  shared_with_friends BOOLEAN DEFAULT TRUE,
  
  -- Search optimization
  search_vector TSVECTOR
);

-- Detailed taste experiences for analytics
CREATE TABLE public.taste_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_experience_id UUID REFERENCES public.food_experiences(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Five basic tastes (1-10 intensity scale)
  saltiness INTEGER CHECK (saltiness >= 1 AND saltiness <= 10),
  sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 10),
  sourness INTEGER CHECK (sourness >= 1 AND sourness <= 10),
  bitterness INTEGER CHECK (bitterness >= 1 AND bitterness <= 10),
  umami INTEGER CHECK (umami >= 1 AND umami <= 10),
  
  -- Texture analysis
  crunchiness INTEGER CHECK (crunchiness >= 1 AND crunchiness <= 10),
  creaminess INTEGER CHECK (creaminess >= 1 AND creaminess <= 10),
  chewiness INTEGER CHECK (chewiness >= 1 AND chewiness <= 10),
  juiciness INTEGER CHECK (juiciness >= 1 AND juiciness <= 10),
  
  -- Temperature and spice
  temperature INTEGER CHECK (temperature >= 1 AND temperature <= 10),
  spice_heat INTEGER CHECK (spice_heat >= 1 AND spice_heat <= 10),
  
  -- Aroma profile
  aroma_intensity INTEGER CHECK (aroma_intensity >= 1 AND aroma_intensity <= 10),
  aroma_descriptors TEXT[],
  
  -- Visual appeal
  visual_appeal INTEGER CHECK (visual_appeal >= 1 AND visual_appeal <= 10),
  color_vibrancy INTEGER CHECK (color_vibrancy >= 1 AND color_vibrancy <= 10)
);

-- Restaurant reviews (separate from food experiences)
CREATE TABLE public.restaurant_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Service rating (1-5 scale)
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  service_notes TEXT,
  
  -- Atmosphere rating (1-5 scale)
  atmosphere_rating INTEGER CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
  atmosphere_notes TEXT,
  
  -- Specific aspects (1-5 scale each)
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  noise_level INTEGER CHECK (noise_level >= 1 AND noise_level <= 5), -- 1=quiet, 5=very_loud
  parking_availability INTEGER CHECK (parking_availability >= 1 AND parking_availability <= 5),
  kid_friendliness INTEGER CHECK (kid_friendliness >= 1 AND kid_friendliness <= 5),
  
  -- Facilities
  bathroom_cleanliness INTEGER CHECK (bathroom_cleanliness >= 1 AND bathroom_cleanliness <= 5),
  wifi_quality INTEGER CHECK (wifi_quality >= 1 AND wifi_quality <= 5),
  seating_comfort INTEGER CHECK (seating_comfort >= 1 AND seating_comfort <= 5),
  
  -- Overall restaurant experience
  overall_restaurant_rating INTEGER CHECK (overall_restaurant_rating >= 1 AND overall_restaurant_rating <= 5),
  would_return BOOLEAN,
  would_recommend BOOLEAN DEFAULT TRUE,
  
  -- Visit details
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  party_size INTEGER DEFAULT 1,
  wait_time INTEGER, -- minutes
  reservation_made BOOLEAN DEFAULT FALSE,
  
  -- Privacy
  is_private BOOLEAN DEFAULT FALSE,
  
  UNIQUE(user_id, restaurant_id) -- One review per user per restaurant
);

-- Friend system
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Shared experiences and recommendations
CREATE TABLE public.shared_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_experience_id UUID REFERENCES public.food_experiences(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  message TEXT,
  recommendation_strength INTEGER CHECK (recommendation_strength >= 1 AND recommendation_strength <= 5) DEFAULT 3,
  
  UNIQUE(food_experience_id, shared_by, shared_with)
);

-- User preferences for recommendations
CREATE TABLE public.recommendation_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Recommendation settings
  enable_ai_recommendations BOOLEAN DEFAULT TRUE,
  enable_friend_recommendations BOOLEAN DEFAULT TRUE,
  enable_location_based BOOLEAN DEFAULT TRUE,
  
  -- Preference weights for algorithm
  taste_similarity_weight DECIMAL(3,2) DEFAULT 0.40,
  friend_influence_weight DECIMAL(3,2) DEFAULT 0.30,
  location_proximity_weight DECIMAL(3,2) DEFAULT 0.20,
  trending_factor_weight DECIMAL(3,2) DEFAULT 0.10,
  
  -- Filters
  max_distance_km INTEGER DEFAULT 50,
  price_range_filter INTEGER[] DEFAULT '{1,2,3,4}',
  exclude_cuisines TEXT[] DEFAULT '{}',
  only_verified_restaurants BOOLEAN DEFAULT FALSE,
  
  UNIQUE(user_id)
);

-- Analytics and tracking tables
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Daily metrics
  experiences_logged INTEGER DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  restaurants_visited INTEGER DEFAULT 0,
  friends_shared_with INTEGER DEFAULT 0,
  
  -- Engagement metrics
  app_opens INTEGER DEFAULT 0,
  session_duration_minutes INTEGER DEFAULT 0,
  
  -- Preference evolution
  taste_profile_updates INTEGER DEFAULT 0,
  new_cuisines_tried INTEGER DEFAULT 0,
  
  UNIQUE(user_id, date)
);

-- Recommendation tracking
CREATE TABLE public.recommendation_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id),
  menu_item_id UUID REFERENCES public.menu_items(id),
  recommendation_type TEXT CHECK (recommendation_type IN ('ai_similar_taste', 'friend_shared', 'trending', 'location_based')),
  
  -- Interaction tracking
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  visited BOOLEAN DEFAULT FALSE,
  visited_at TIMESTAMP WITH TIME ZONE,
  rated BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Context
  recommendation_context JSONB DEFAULT '{}'
);

-- Search history for optimization
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  search_query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('food', 'restaurant', 'cuisine', 'general')),
  results_count INTEGER,
  clicked_result_id UUID,
  clicked_result_type TEXT CHECK (clicked_result_type IN ('restaurant', 'menu_item', 'experience'))
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_restaurants_location ON public.restaurants USING GIST(ll_to_earth(latitude, longitude));
CREATE INDEX idx_restaurants_cuisine ON public.restaurants USING GIN(cuisine_types);
CREATE INDEX idx_restaurants_search ON public.restaurants USING GIN(search_vector);
CREATE INDEX idx_food_experiences_user ON public.food_experiences(user_id);
CREATE INDEX idx_food_experiences_restaurant ON public.food_experiences(restaurant_id);
CREATE INDEX idx_food_experiences_date ON public.food_experiences(experienced_at);
CREATE INDEX idx_food_experiences_search ON public.food_experiences USING GIN(search_vector);
CREATE INDEX idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX idx_friendships_users ON public.friendships(requester_id, addressee_id);
CREATE INDEX idx_recommendation_interactions_user ON public.recommendation_interactions(user_id);
CREATE INDEX idx_search_history_user ON public.search_history(user_id);

-- Create search vector triggers
CREATE OR REPLACE FUNCTION update_restaurant_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.cuisine_types, ' '), '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.address, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurant_search_vector_update
  BEFORE INSERT OR UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_search_vector();

CREATE OR REPLACE FUNCTION update_food_experience_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.dish_name, '') || ' ' ||
    COALESCE(NEW.custom_notes, '') || ' ' ||
    COALESCE(array_to_string(NEW.emotions, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.aroma_notes, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER food_experience_search_vector_update
  BEFORE INSERT OR UPDATE ON public.food_experiences
  FOR EACH ROW EXECUTE FUNCTION update_food_experience_search_vector();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taste_profiles_updated_at BEFORE UPDATE ON public.taste_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_experiences_updated_at BEFORE UPDATE ON public.food_experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_reviews_updated_at BEFORE UPDATE ON public.restaurant_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendation_preferences_updated_at BEFORE UPDATE ON public.recommendation_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();