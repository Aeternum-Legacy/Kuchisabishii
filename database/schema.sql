-- Kuchisabishii Database Schema
-- This file contains the initial database setup for Supabase

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    location TEXT,
    dietary_restrictions TEXT[],
    date_of_birth DATE,
    privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('private', 'friends', 'public')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create food_experiences table (core food journaling)
CREATE TABLE IF NOT EXISTS public.food_experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    food_name TEXT NOT NULL,
    restaurant_name TEXT,
    location TEXT,
    cuisine_type TEXT,
    food_type TEXT,
    meal_time TEXT CHECK (meal_time IN ('breakfast', 'brunch', 'lunch', 'dinner', 'dessert', 'snack')),
    dining_method TEXT CHECK (dining_method IN ('homemade', 'dine-in', 'takeout', 'delivery')),
    date_eaten DATE NOT NULL,
    cost DECIMAL(10,2),
    experience_text TEXT,
    
    -- Taste ratings (1-10 scale)
    sweet INTEGER CHECK (sweet >= 0 AND sweet <= 10),
    savory INTEGER CHECK (savory >= 0 AND savory <= 10),
    sour INTEGER CHECK (sour >= 0 AND sour <= 10),
    spicy INTEGER CHECK (spicy >= 0 AND spicy <= 10),
    umami INTEGER CHECK (umami >= 0 AND umami <= 10),
    bitter INTEGER CHECK (bitter >= 0 AND bitter <= 10),
    
    -- Experience rating
    experience_rating TEXT CHECK (experience_rating IN ('never-again', 'occasionally', 'frequently', 'kuchisabishii')),
    
    -- Media
    images TEXT[],
    videos TEXT[],
    
    -- Privacy
    privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('private', 'friends', 'public')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    phone TEXT,
    website TEXT,
    cuisine_type TEXT,
    price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    restaurant_type TEXT,
    
    -- Location coordinates
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Google Places API data
    google_place_id TEXT UNIQUE,
    google_rating DECIMAL(2,1),
    google_reviews_count INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create restaurant_reviews table
CREATE TABLE IF NOT EXISTS public.restaurant_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    
    -- Restaurant experience rating
    experience_rating TEXT CHECK (experience_rating IN ('never-again', 'occasionally', 'frequently', 'kuchisabishii')),
    
    -- Service and atmosphere ratings (0-5 stars)
    service_rating INTEGER CHECK (service_rating >= 0 AND service_rating <= 5),
    atmosphere_rating INTEGER CHECK (atmosphere_rating >= 0 AND atmosphere_rating <= 5),
    
    -- Review text
    experience_text TEXT,
    
    -- Additional factors
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    dietary_options_rating INTEGER CHECK (dietary_options_rating >= 1 AND dietary_options_rating <= 5),
    parking_rating INTEGER CHECK (parking_rating >= 1 AND parking_rating <= 5),
    kid_friendly_rating INTEGER CHECK (kid_friendly_rating >= 1 AND kid_friendly_rating <= 5),
    seating_rating INTEGER CHECK (seating_rating >= 1 AND seating_rating <= 5),
    accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
    bathroom_rating INTEGER CHECK (bathroom_rating >= 1 AND bathroom_rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for food_experiences
CREATE POLICY "Users can view their own food experiences" ON public.food_experiences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public food experiences" ON public.food_experiences
    FOR SELECT USING (privacy_level = 'public');

CREATE POLICY "Users can insert their own food experiences" ON public.food_experiences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food experiences" ON public.food_experiences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food experiences" ON public.food_experiences
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for restaurants (public read, authenticated write)
CREATE POLICY "Anyone can view restaurants" ON public.restaurants
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert restaurants" ON public.restaurants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for restaurant_reviews
CREATE POLICY "Users can view their own restaurant reviews" ON public.restaurant_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own restaurant reviews" ON public.restaurant_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurant reviews" ON public.restaurant_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own restaurant reviews" ON public.restaurant_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for friendships
CREATE POLICY "Users can view their own friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of" ON public.friendships
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_food_experiences_user_id ON public.food_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_food_experiences_date_eaten ON public.food_experiences(date_eaten);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_restaurants_google_place_id ON public.restaurants(google_place_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_user_id ON public.restaurant_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_restaurant_id ON public.restaurant_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_experiences_updated_at BEFORE UPDATE ON public.food_experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_reviews_updated_at BEFORE UPDATE ON public.restaurant_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();