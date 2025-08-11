-- Food entries table for user food logs
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
    spice_level INTEGER CHECK (spice_level >= 1 AND spice_level <= 5), -- 1-5 scale
    
    -- Location data (can be different from restaurant if homemade/delivery)
    location_name TEXT,
    location_address TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    
    -- Social features
    is_public BOOLEAN DEFAULT true,
    allow_comments BOOLEAN DEFAULT true,
    
    -- Nutrition tracking (optional)
    calories INTEGER,
    protein_grams DECIMAL(5,2),
    carbs_grams DECIMAL(5,2),
    fat_grams DECIMAL(5,2),
    
    -- Timing
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_entries_user_id ON public.food_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_food_entries_restaurant_id ON public.food_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_entries_category ON public.food_entries(category);
CREATE INDEX IF NOT EXISTS idx_food_entries_rating ON public.food_entries(rating DESC);
CREATE INDEX IF NOT EXISTS idx_food_entries_consumed_at ON public.food_entries(consumed_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_entries_created_at ON public.food_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_entries_tags ON public.food_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_food_entries_ingredients ON public.food_entries USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS idx_food_entries_public ON public.food_entries(is_public, created_at DESC) WHERE is_public = true;

-- Full text search index for food entries
CREATE INDEX IF NOT EXISTS idx_food_entries_search ON public.food_entries 
    USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(notes, '') || ' ' || array_to_string(tags, ' ')));

-- Trigger for updated_at
CREATE TRIGGER update_food_entries_updated_at 
    BEFORE UPDATE ON public.food_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();