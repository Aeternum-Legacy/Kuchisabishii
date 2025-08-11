-- Reviews table for restaurant reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    food_entry_id UUID REFERENCES public.food_entries(id) ON DELETE SET NULL,
    
    -- Review content
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0) NOT NULL,
    
    -- Detailed ratings
    food_rating DECIMAL(2,1) CHECK (food_rating >= 1.0 AND food_rating <= 5.0),
    service_rating DECIMAL(2,1) CHECK (service_rating >= 1.0 AND service_rating <= 5.0),
    atmosphere_rating DECIMAL(2,1) CHECK (atmosphere_rating >= 1.0 AND atmosphere_rating <= 5.0),
    value_rating DECIMAL(2,1) CHECK (value_rating >= 1.0 AND value_rating <= 5.0),
    
    -- Additional details
    photos TEXT[] DEFAULT '{}',
    visit_date DATE,
    party_size INTEGER DEFAULT 1,
    wait_time_minutes INTEGER,
    total_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    
    -- Recommendations
    recommended_dishes TEXT[] DEFAULT '{}',
    pros TEXT[] DEFAULT '{}',
    cons TEXT[] DEFAULT '{}',
    
    -- Social features
    is_public BOOLEAN DEFAULT true,
    allow_responses BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT false, -- For verified visits
    is_featured BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure user can only review a restaurant once
    UNIQUE(user_id, restaurant_id)
);

-- Review responses/comments table
CREATE TABLE IF NOT EXISTS public.review_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_owner_response BOOLEAN DEFAULT false, -- If restaurant owner responds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Review helpfulness votes
CREATE TABLE IF NOT EXISTS public.review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure user can only vote once per review
    UNIQUE(review_id, user_id)
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_food_entry_id ON public.reviews(food_entry_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_visit_date ON public.reviews(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_public ON public.reviews(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON public.reviews(is_featured, created_at DESC) WHERE is_featured = true;

-- Indexes for review responses
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON public.review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_user_id ON public.review_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_created_at ON public.review_responses(created_at DESC);

-- Indexes for review votes
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes(user_id);

-- Full text search for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_search ON public.reviews 
    USING GIN(to_tsvector('english', title || ' ' || content));

-- Triggers for updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_responses_updated_at 
    BEFORE UPDATE ON public.review_responses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update restaurant rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update restaurant rating and review count
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