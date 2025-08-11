-- Initial database schema migration for Kuchisabishii
-- This migration creates all tables, enums, functions, and RLS policies

-- Create custom types/enums
CREATE TYPE food_category AS ENUM (
    'breakfast',
    'lunch', 
    'dinner',
    'snack',
    'dessert',
    'drink',
    'other'
);

CREATE TYPE meal_occasion AS ENUM (
    'casual',
    'date',
    'business',
    'celebration',
    'family',
    'friends',
    'solo',
    'other'
);

CREATE TYPE friendship_status AS ENUM (
    'pending',
    'accepted',
    'blocked',
    'declined'
);

CREATE TYPE activity_type AS ENUM (
    'food_entry',
    'review',
    'friendship',
    'follow',
    'recommendation',
    'achievement'
);

CREATE TYPE collection_item_type AS ENUM (
    'restaurant',
    'food_entry',
    'review'
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table with profile data
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    bio TEXT,
    profile_image TEXT,
    location TEXT,
    date_of_birth DATE,
    dietary_restrictions TEXT[],
    favorite_cuisines TEXT[],
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
    notification_preferences JSONB DEFAULT '{
        "food_recommendations": true,
        "friend_activity": true,
        "new_followers": true,
        "review_responses": true,
        "system_updates": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes and triggers for users
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website TEXT,
    cuisine_types TEXT[] NOT NULL DEFAULT '{}',
    price_range INTEGER CHECK (price_range >= 1 AND price_range <= 4),
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 0,
    opening_hours JSONB DEFAULT '{}'::jsonb,
    menu_url TEXT,
    delivery_available BOOLEAN DEFAULT false,
    takeout_available BOOLEAN DEFAULT true,
    reservation_required BOOLEAN DEFAULT false,
    photos TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes and triggers for restaurants
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON public.restaurants(name);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON public.restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_types ON public.restaurants USING GIN(cuisine_types);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON public.restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range ON public.restaurants(price_range);
CREATE INDEX IF NOT EXISTS idx_restaurants_created_at ON public.restaurants(created_at);
CREATE INDEX IF NOT EXISTS idx_restaurants_search ON public.restaurants 
    USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(cuisine_types, ' ')));

CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON public.restaurants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Food entries table
CREATE TABLE IF NOT EXISTS public.food_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    images TEXT[] DEFAULT '{}',
    category food_category NOT NULL DEFAULT 'other',
    occasion meal_occasion DEFAULT 'casual',
    rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0) NOT NULL,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    tags TEXT[] DEFAULT '{}',
    ingredients TEXT[] DEFAULT '{}',
    cooking_method TEXT,
    spice_level INTEGER CHECK (spice_level >= 1 AND spice_level <= 5),
    location_name TEXT,
    location_address TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    is_public BOOLEAN DEFAULT true,
    allow_comments BOOLEAN DEFAULT true,
    calories INTEGER,
    protein_grams DECIMAL(5,2),
    carbs_grams DECIMAL(5,2),
    fat_grams DECIMAL(5,2),
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes and triggers for food entries
CREATE INDEX IF NOT EXISTS idx_food_entries_user_id ON public.food_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_food_entries_restaurant_id ON public.food_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_entries_category ON public.food_entries(category);
CREATE INDEX IF NOT EXISTS idx_food_entries_rating ON public.food_entries(rating DESC);
CREATE INDEX IF NOT EXISTS idx_food_entries_consumed_at ON public.food_entries(consumed_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_entries_created_at ON public.food_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_entries_tags ON public.food_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_food_entries_ingredients ON public.food_entries USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS idx_food_entries_public ON public.food_entries(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_food_entries_search ON public.food_entries 
    USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(notes, '') || ' ' || array_to_string(tags, ' ')));

CREATE TRIGGER update_food_entries_updated_at 
    BEFORE UPDATE ON public.food_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    food_entry_id UUID REFERENCES public.food_entries(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0) NOT NULL,
    food_rating DECIMAL(2,1) CHECK (food_rating >= 1.0 AND food_rating <= 5.0),
    service_rating DECIMAL(2,1) CHECK (service_rating >= 1.0 AND service_rating <= 5.0),
    atmosphere_rating DECIMAL(2,1) CHECK (atmosphere_rating >= 1.0 AND atmosphere_rating <= 5.0),
    value_rating DECIMAL(2,1) CHECK (value_rating >= 1.0 AND value_rating <= 5.0),
    photos TEXT[] DEFAULT '{}',
    visit_date DATE,
    party_size INTEGER DEFAULT 1,
    wait_time_minutes INTEGER,
    total_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    recommended_dishes TEXT[] DEFAULT '{}',
    pros TEXT[] DEFAULT '{}',
    cons TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    allow_responses BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, restaurant_id)
);

-- Review responses table
CREATE TABLE IF NOT EXISTS public.review_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_owner_response BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Review votes table
CREATE TABLE IF NOT EXISTS public.review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(review_id, user_id)
);

-- Indexes and triggers for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_food_entry_id ON public.reviews(food_entry_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_visit_date ON public.reviews(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_public ON public.reviews(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON public.reviews(is_featured, created_at DESC) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_reviews_search ON public.reviews 
    USING GIN(to_tsvector('english', title || ' ' || content));

CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON public.review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_user_id ON public.review_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_created_at ON public.review_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes(user_id);

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_responses_updated_at 
    BEFORE UPDATE ON public.review_responses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update restaurant rating
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.restaurants 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM public.reviews 
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
            AND is_public = true
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
            AND is_public = true
        )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update restaurant ratings
CREATE TRIGGER update_restaurant_rating_on_review_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_rating();

CREATE TRIGGER update_restaurant_rating_on_review_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_rating();

CREATE TRIGGER update_restaurant_rating_on_review_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_rating();

-- Continue with the rest of the schema in the next part...

-- This migration is continued in part 2 due to size limits