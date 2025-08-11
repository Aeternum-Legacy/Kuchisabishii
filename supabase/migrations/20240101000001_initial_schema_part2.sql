-- Initial database schema migration for Kuchisabishii - Part 2
-- Social features and user preferences

-- Friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    addressee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status friendship_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (requester_id != addressee_id),
    UNIQUE(requester_id, addressee_id)
);

-- User follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (follower_id != following_id),
    UNIQUE(follower_id, following_id)
);

-- User activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_type activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User collections table
CREATE TABLE IF NOT EXISTS public.user_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'bookmark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Collection items table
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES public.user_collections(id) ON DELETE CASCADE NOT NULL,
    item_type collection_item_type NOT NULL,
    item_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(collection_id, item_type, item_id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    preferred_cuisines JSONB DEFAULT '{}'::jsonb,
    disliked_cuisines TEXT[] DEFAULT '{}',
    spice_tolerance INTEGER DEFAULT 3 CHECK (spice_tolerance >= 1 AND spice_tolerance <= 5),
    sweetness_preference INTEGER DEFAULT 3 CHECK (sweetness_preference >= 1 AND sweetness_preference <= 5),
    saltiness_preference INTEGER DEFAULT 3 CHECK (saltiness_preference >= 1 AND saltiness_preference <= 5),
    sourness_preference INTEGER DEFAULT 3 CHECK (sourness_preference >= 1 AND sourness_preference <= 5),
    bitterness_preference INTEGER DEFAULT 3 CHECK (bitterness_preference >= 1 AND bitterness_preference <= 5),
    umami_preference INTEGER DEFAULT 3 CHECK (umami_preference >= 1 AND umami_preference <= 5),
    dietary_restrictions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    preferred_ingredients TEXT[] DEFAULT '{}',
    disliked_ingredients TEXT[] DEFAULT '{}',
    preferred_price_range INTEGER[] DEFAULT '{1,2,3,4}',
    preferred_atmosphere TEXT[] DEFAULT '{}',
    preferred_meal_times JSONB DEFAULT '{
        "breakfast": {"start": "07:00", "end": "10:00"},
        "lunch": {"start": "11:30", "end": "14:00"}, 
        "dinner": {"start": "18:00", "end": "21:00"}
    }'::jsonb,
    max_travel_distance INTEGER DEFAULT 10,
    preferred_neighborhoods TEXT[] DEFAULT '{}',
    prefers_solo_dining BOOLEAN DEFAULT false,
    prefers_group_dining BOOLEAN DEFAULT true,
    shares_food_often BOOLEAN DEFAULT true,
    enable_smart_recommendations BOOLEAN DEFAULT true,
    recommendation_frequency TEXT DEFAULT 'weekly' CHECK (recommendation_frequency IN ('daily', 'weekly', 'monthly', 'never')),
    include_friend_recommendations BOOLEAN DEFAULT true,
    include_trending_recommendations BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Taste profile history table
CREATE TABLE IF NOT EXISTS public.taste_profile_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    food_entry_id UUID REFERENCES public.food_entries(id) ON DELETE CASCADE,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    learned_cuisines JSONB DEFAULT '{}'::jsonb,
    learned_ingredients JSONB DEFAULT '{}'::jsonb,
    learned_flavors JSONB DEFAULT '{}'::jsonb,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('rating', 'review', 'favorite', 'dislike', 'order')),
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Restaurant recommendations table
CREATE TABLE IF NOT EXISTS public.restaurant_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('taste_match', 'trending', 'friend_activity', 'location_based', 'cuisine_exploration')),
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    reasoning TEXT,
    was_viewed BOOLEAN DEFAULT false,
    was_visited BOOLEAN DEFAULT false,
    was_liked BOOLEAN DEFAULT NULL,
    was_dismissed BOOLEAN DEFAULT false,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, restaurant_id)
);

-- Food pairings table
CREATE TABLE IF NOT EXISTS public.food_pairings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_item_1 TEXT NOT NULL,
    food_item_2 TEXT NOT NULL,
    pairing_score DECIMAL(3,2) NOT NULL CHECK (pairing_score >= 0.0 AND pairing_score <= 1.0),
    pairing_type TEXT DEFAULT 'complementary' CHECK (pairing_type IN ('complementary', 'contrasting', 'traditional', 'innovative')),
    cuisine_context TEXT[],
    user_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(LEAST(food_item_1, food_item_2), GREATEST(food_item_1, food_item_2))
);

-- Indexes for social features
CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON public.friendships(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON public.friendships(
    LEAST(requester_id, addressee_id),
    GREATEST(requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON public.user_follows(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_public ON public.user_activities(is_public, created_at DESC) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_public ON public.user_collections(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_type_id ON public.collection_items(item_type, item_id);

-- Indexes for preferences and recommendations
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON public.user_preferences(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_taste_profile_history_user_id ON public.taste_profile_history(user_id);
CREATE INDEX IF NOT EXISTS idx_taste_profile_history_food_entry_id ON public.taste_profile_history(food_entry_id);
CREATE INDEX IF NOT EXISTS idx_taste_profile_history_review_id ON public.taste_profile_history(review_id);
CREATE INDEX IF NOT EXISTS idx_taste_profile_history_created_at ON public.taste_profile_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_user_id ON public.restaurant_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_restaurant_id ON public.restaurant_recommendations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_type ON public.restaurant_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_confidence ON public.restaurant_recommendations(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_generated_at ON public.restaurant_recommendations(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_recommendations_active ON public.restaurant_recommendations(user_id, expires_at) WHERE expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_food_pairings_items ON public.food_pairings(food_item_1, food_item_2);
CREATE INDEX IF NOT EXISTS idx_food_pairings_score ON public.food_pairings(pairing_score DESC);

-- Triggers for updated_at
CREATE TRIGGER update_friendships_updated_at 
    BEFORE UPDATE ON public.friendships 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at 
    BEFORE UPDATE ON public.user_collections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create activity when friendship is accepted
CREATE OR REPLACE FUNCTION create_friendship_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        INSERT INTO public.user_activities (user_id, activity_type, title, description, metadata)
        VALUES (
            NEW.requester_id,
            'friendship',
            'New Friend Connection',
            'You are now friends with someone new!',
            jsonb_build_object('friend_id', NEW.addressee_id, 'friendship_id', NEW.id)
        );
        
        INSERT INTO public.user_activities (user_id, activity_type, title, description, metadata)
        VALUES (
            NEW.addressee_id,
            'friendship',
            'New Friend Connection',
            'You are now friends with someone new!',
            jsonb_build_object('friend_id', NEW.requester_id, 'friendship_id', NEW.id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_friendship_activity_trigger
    AFTER UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friendship_activity();

-- Function to update user preferences based on activity
CREATE OR REPLACE FUNCTION update_user_preferences_from_activity()
RETURNS TRIGGER AS $$
DECLARE
    cuisine_scores JSONB;
    current_prefs RECORD;
BEGIN
    SELECT * INTO current_prefs 
    FROM public.user_preferences 
    WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.user_preferences (user_id) VALUES (NEW.user_id);
        SELECT * INTO current_prefs 
        FROM public.user_preferences 
        WHERE user_id = NEW.user_id;
    END IF;
    
    IF TG_TABLE_NAME = 'food_entries' AND NEW.rating IS NOT NULL THEN
        SELECT cuisine_types INTO cuisine_scores
        FROM public.restaurants r
        WHERE r.id = NEW.restaurant_id;
        
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

CREATE TRIGGER update_preferences_from_food_entry
    AFTER INSERT ON public.food_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_from_activity();