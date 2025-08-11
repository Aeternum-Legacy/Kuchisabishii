-- User preferences table for taste history and recommendations
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Cuisine preferences (learned from ratings/reviews)
    preferred_cuisines JSONB DEFAULT '{}'::jsonb, -- {"italian": 4.5, "japanese": 4.8, ...}
    disliked_cuisines TEXT[] DEFAULT '{}',
    
    -- Flavor profiles
    spice_tolerance INTEGER DEFAULT 3 CHECK (spice_tolerance >= 1 AND spice_tolerance <= 5),
    sweetness_preference INTEGER DEFAULT 3 CHECK (sweetness_preference >= 1 AND sweetness_preference <= 5),
    saltiness_preference INTEGER DEFAULT 3 CHECK (saltiness_preference >= 1 AND saltiness_preference <= 5),
    sourness_preference INTEGER DEFAULT 3 CHECK (sourness_preference >= 1 AND sourness_preference <= 5),
    bitterness_preference INTEGER DEFAULT 3 CHECK (bitterness_preference >= 1 AND bitterness_preference <= 5),
    umami_preference INTEGER DEFAULT 3 CHECK (umami_preference >= 1 AND umami_preference <= 5),
    
    -- Dietary preferences and restrictions
    dietary_restrictions TEXT[] DEFAULT '{}', -- vegetarian, vegan, gluten-free, etc.
    allergies TEXT[] DEFAULT '{}',
    preferred_ingredients TEXT[] DEFAULT '{}',
    disliked_ingredients TEXT[] DEFAULT '{}',
    
    -- Dining preferences
    preferred_price_range INTEGER[] DEFAULT '{1,2,3,4}', -- Array of acceptable price ranges
    preferred_atmosphere TEXT[] DEFAULT '{}', -- casual, upscale, family-friendly, romantic, etc.
    preferred_meal_times JSONB DEFAULT '{
        "breakfast": {"start": "07:00", "end": "10:00"},
        "lunch": {"start": "11:30", "end": "14:00"}, 
        "dinner": {"start": "18:00", "end": "21:00"}
    }'::jsonb,
    
    -- Location preferences
    max_travel_distance INTEGER DEFAULT 10, -- in kilometers
    preferred_neighborhoods TEXT[] DEFAULT '{}',
    
    -- Social preferences
    prefers_solo_dining BOOLEAN DEFAULT false,
    prefers_group_dining BOOLEAN DEFAULT true,
    shares_food_often BOOLEAN DEFAULT true,
    
    -- Recommendation settings
    enable_smart_recommendations BOOLEAN DEFAULT true,
    recommendation_frequency TEXT DEFAULT 'weekly' CHECK (recommendation_frequency IN ('daily', 'weekly', 'monthly', 'never')),
    include_friend_recommendations BOOLEAN DEFAULT true,
    include_trending_recommendations BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- One preference record per user
    UNIQUE(user_id)
);

-- Taste profile history table (tracks how preferences evolve)
CREATE TABLE IF NOT EXISTS public.taste_profile_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    food_entry_id UUID REFERENCES public.food_entries(id) ON DELETE CASCADE,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    
    -- What was learned from this interaction
    learned_cuisines JSONB DEFAULT '{}'::jsonb,
    learned_ingredients JSONB DEFAULT '{}'::jsonb, -- ingredient -> preference score
    learned_flavors JSONB DEFAULT '{}'::jsonb,
    
    -- Context of the learning
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('rating', 'review', 'favorite', 'dislike', 'order')),
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Restaurant recommendations table
CREATE TABLE IF NOT EXISTS public.restaurant_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    
    -- Recommendation details
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('taste_match', 'trending', 'friend_activity', 'location_based', 'cuisine_exploration')),
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    reasoning TEXT, -- Why this was recommended
    
    -- User interaction with recommendation
    was_viewed BOOLEAN DEFAULT false,
    was_visited BOOLEAN DEFAULT false,
    was_liked BOOLEAN DEFAULT NULL, -- NULL if no action, true/false for explicit feedback
    was_dismissed BOOLEAN DEFAULT false,
    
    -- Recommendation metadata
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate active recommendations
    UNIQUE(user_id, restaurant_id)
);

-- Food pairing suggestions (what goes well together)
CREATE TABLE IF NOT EXISTS public.food_pairings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_item_1 TEXT NOT NULL,
    food_item_2 TEXT NOT NULL,
    pairing_score DECIMAL(3,2) NOT NULL CHECK (pairing_score >= 0.0 AND pairing_score <= 1.0),
    pairing_type TEXT DEFAULT 'complementary' CHECK (pairing_type IN ('complementary', 'contrasting', 'traditional', 'innovative')),
    cuisine_context TEXT[],
    user_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate pairings (order independent)
    UNIQUE(LEAST(food_item_1, food_item_2), GREATEST(food_item_1, food_item_2))
);

-- Indexes for user preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON public.user_preferences(updated_at DESC);

-- Indexes for taste profile history
CREATE INDEX IF NOT EXISTS idx_taste_profile_history_user_id ON public.taste_profile_history(user_id);
CREATE INDEX IF NOT EXISTS idx_taste_profile_history_food_entry_id ON public.taste_profile_history(food_entry_id);
CREATE INDEX IF NOT EXISTS idx_taste_profile_history_review_id ON public.taste_profile_history(review_id);
CREATE INDEX IF NOT EXISTS idx_taste_profile_history_created_at ON public.taste_profile_history(created_at DESC);

-- Indexes for recommendations
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_user_id ON public.restaurant_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_restaurant_id ON public.restaurant_recommendations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_type ON public.restaurant_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_confidence ON public.restaurant_recommendations(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_generated_at ON public.restaurant_recommendations(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_active ON public.restaurant_recommendations(user_id, expires_at) WHERE expires_at > NOW();

-- Indexes for food pairings
CREATE INDEX IF NOT EXISTS idx_food_pairings_items ON public.food_pairings(food_item_1, food_item_2);
CREATE INDEX IF NOT EXISTS idx_food_pairings_score ON public.food_pairings(pairing_score DESC);

-- Triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update user preferences based on food entries and reviews
CREATE OR REPLACE FUNCTION update_user_preferences_from_activity()
RETURNS TRIGGER AS $$
DECLARE
    cuisine_scores JSONB;
    current_prefs RECORD;
BEGIN
    -- Get current preferences
    SELECT * INTO current_prefs 
    FROM public.user_preferences 
    WHERE user_id = NEW.user_id;
    
    -- If no preferences exist, create default ones
    IF NOT FOUND THEN
        INSERT INTO public.user_preferences (user_id) VALUES (NEW.user_id);
        SELECT * INTO current_prefs 
        FROM public.user_preferences 
        WHERE user_id = NEW.user_id;
    END IF;
    
    -- Update cuisine preferences based on rating
    IF TG_TABLE_NAME = 'food_entries' AND NEW.rating IS NOT NULL THEN
        -- Get restaurant cuisine types if restaurant is linked
        SELECT cuisine_types INTO cuisine_scores
        FROM public.restaurants r
        WHERE r.id = NEW.restaurant_id;
        
        -- Record taste profile learning
        INSERT INTO public.taste_profile_history 
        (user_id, food_entry_id, interaction_type, learned_cuisines, confidence_score)
        VALUES (
            NEW.user_id,
            NEW.id,
            'rating',
            jsonb_build_object('cuisines', cuisine_scores, 'rating', NEW.rating),
            CASE WHEN NEW.rating >= 4.0 THEN 0.8 ELSE 0.6 END
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update preferences when food entries are created
CREATE TRIGGER update_preferences_from_food_entry
    AFTER INSERT ON public.food_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_from_activity();

-- Function to clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.restaurant_recommendations 
    WHERE expires_at < timezone('utc'::text, now());
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to get personalized restaurant recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
    target_user_id UUID,
    recommendation_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    restaurant_id UUID,
    restaurant_name TEXT,
    recommendation_type TEXT,
    confidence_score DECIMAL,
    reasoning TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rr.restaurant_id,
        r.name,
        rr.recommendation_type,
        rr.confidence_score,
        rr.reasoning
    FROM public.restaurant_recommendations rr
    JOIN public.restaurants r ON r.id = rr.restaurant_id
    WHERE rr.user_id = target_user_id
    AND rr.expires_at > timezone('utc'::text, now())
    AND NOT rr.was_dismissed
    AND r.is_active = true
    ORDER BY rr.confidence_score DESC, rr.generated_at DESC
    LIMIT recommendation_limit;
END;
$$ language 'plpgsql';