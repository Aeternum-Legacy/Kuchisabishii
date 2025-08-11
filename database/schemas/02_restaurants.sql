-- Restaurants table with location and menu data
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
    price_range INTEGER CHECK (price_range >= 1 AND price_range <= 4), -- 1-4 dollar signs
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 0,
    opening_hours JSONB DEFAULT '{}'::jsonb, -- Store hours for each day
    menu_url TEXT,
    delivery_available BOOLEAN DEFAULT false,
    takeout_available BOOLEAN DEFAULT true,
    reservation_required BOOLEAN DEFAULT false,
    photos TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}', -- wheelchair accessible, wifi, parking, etc.
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON public.restaurants(name);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON public.restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_types ON public.restaurants USING GIN(cuisine_types);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON public.restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range ON public.restaurants(price_range);
CREATE INDEX IF NOT EXISTS idx_restaurants_created_at ON public.restaurants(created_at);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_restaurants_search ON public.restaurants 
    USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(cuisine_types, ' ')));

-- Trigger for updated_at
CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON public.restaurants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();