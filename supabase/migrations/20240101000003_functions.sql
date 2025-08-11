-- Database functions for Kuchisabishii

-- Function to get mutual friends
CREATE OR REPLACE FUNCTION get_mutual_friends(user1_id UUID, user2_id UUID)
RETURNS TABLE(friend_id UUID, friend_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT u.id, u.display_name
    FROM public.users u
    WHERE u.id IN (
        -- Friends of user1
        SELECT CASE 
            WHEN f1.requester_id = user1_id THEN f1.addressee_id
            ELSE f1.requester_id
        END
        FROM public.friendships f1
        WHERE (f1.requester_id = user1_id OR f1.addressee_id = user1_id)
        AND f1.status = 'accepted'
        
        INTERSECT
        
        -- Friends of user2  
        SELECT CASE 
            WHEN f2.requester_id = user2_id THEN f2.addressee_id
            ELSE f2.requester_id
        END
        FROM public.friendships f2
        WHERE (f2.requester_id = user2_id OR f2.addressee_id = user2_id)
        AND f2.status = 'accepted'
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

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
$$ language 'plpgsql' SECURITY DEFINER;

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
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to calculate user taste compatibility
CREATE OR REPLACE FUNCTION calculate_taste_compatibility(
    user1_id UUID,
    user2_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    compatibility_score DECIMAL := 0.0;
    user1_prefs RECORD;
    user2_prefs RECORD;
    common_cuisines INTEGER := 0;
    total_cuisines INTEGER := 0;
BEGIN
    -- Get user preferences
    SELECT * INTO user1_prefs FROM public.user_preferences WHERE user_id = user1_id;
    SELECT * INTO user2_prefs FROM public.user_preferences WHERE user_id = user2_id;
    
    IF user1_prefs IS NULL OR user2_prefs IS NULL THEN
        RETURN 0.0;
    END IF;
    
    -- Compare spice tolerance (weight: 0.2)
    compatibility_score := compatibility_score + 
        (0.2 * (1.0 - ABS(user1_prefs.spice_tolerance - user2_prefs.spice_tolerance) / 4.0));
    
    -- Compare sweetness preference (weight: 0.1)
    compatibility_score := compatibility_score + 
        (0.1 * (1.0 - ABS(user1_prefs.sweetness_preference - user2_prefs.sweetness_preference) / 4.0));
    
    -- Compare preferred price ranges (weight: 0.3)
    IF user1_prefs.preferred_price_range && user2_prefs.preferred_price_range THEN
        compatibility_score := compatibility_score + 0.3;
    END IF;
    
    -- Compare dietary restrictions (weight: 0.2)
    IF user1_prefs.dietary_restrictions && user2_prefs.dietary_restrictions THEN
        compatibility_score := compatibility_score + 0.2;
    END IF;
    
    -- Compare favorite cuisines (weight: 0.2)
    IF user1_prefs.favorite_cuisines && user2_prefs.favorite_cuisines THEN
        compatibility_score := compatibility_score + 0.2;
    END IF;
    
    RETURN LEAST(1.0, compatibility_score);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to get restaurant recommendations based on friends' activity
CREATE OR REPLACE FUNCTION get_friend_based_recommendations(
    target_user_id UUID,
    recommendation_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    restaurant_id UUID,
    restaurant_name TEXT,
    friend_rating DECIMAL,
    friend_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH friend_ids AS (
        SELECT CASE 
            WHEN f.requester_id = target_user_id THEN f.addressee_id
            ELSE f.requester_id
        END AS friend_id
        FROM public.friendships f
        WHERE (f.requester_id = target_user_id OR f.addressee_id = target_user_id)
        AND f.status = 'accepted'
    ),
    friend_entries AS (
        SELECT 
            fe.restaurant_id,
            AVG(fe.rating) as avg_rating,
            COUNT(*) as entry_count
        FROM public.food_entries fe
        JOIN friend_ids fi ON fe.user_id = fi.friend_id
        WHERE fe.restaurant_id IS NOT NULL
        AND fe.rating >= 4.0  -- Only high-rated entries
        AND fe.created_at >= NOW() - INTERVAL '3 months'  -- Recent entries
        GROUP BY fe.restaurant_id
        HAVING COUNT(*) >= 2  -- Multiple friends visited
    )
    SELECT 
        fe.restaurant_id,
        r.name,
        fe.avg_rating,
        fe.entry_count
    FROM friend_entries fe
    JOIN public.restaurants r ON r.id = fe.restaurant_id
    WHERE NOT EXISTS (
        -- User hasn't visited this restaurant
        SELECT 1 FROM public.food_entries ue 
        WHERE ue.user_id = target_user_id 
        AND ue.restaurant_id = fe.restaurant_id
    )
    AND r.is_active = true
    ORDER BY fe.avg_rating DESC, fe.entry_count DESC
    LIMIT recommendation_limit;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to update taste profile from food entry
CREATE OR REPLACE FUNCTION update_taste_profile_from_entry(
    entry_id UUID
)
RETURNS VOID AS $$
DECLARE
    entry_record RECORD;
    restaurant_record RECORD;
BEGIN
    -- Get food entry details
    SELECT * INTO entry_record FROM public.food_entries WHERE id = entry_id;
    
    IF entry_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Get restaurant details if available
    IF entry_record.restaurant_id IS NOT NULL THEN
        SELECT * INTO restaurant_record FROM public.restaurants WHERE id = entry_record.restaurant_id;
    END IF;
    
    -- Record taste learning
    INSERT INTO public.taste_profile_history (
        user_id,
        food_entry_id,
        interaction_type,
        learned_cuisines,
        learned_ingredients,
        confidence_score
    ) VALUES (
        entry_record.user_id,
        entry_id,
        'rating',
        CASE 
            WHEN restaurant_record IS NOT NULL THEN 
                jsonb_build_object('cuisines', restaurant_record.cuisine_types)
            ELSE '{}'::jsonb
        END,
        jsonb_build_object('ingredients', entry_record.ingredients),
        CASE 
            WHEN entry_record.rating >= 4.0 THEN 0.8
            WHEN entry_record.rating >= 3.0 THEN 0.6
            ELSE 0.4
        END
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to get trending restaurants
CREATE OR REPLACE FUNCTION get_trending_restaurants(
    days_back INTEGER DEFAULT 7,
    min_entries INTEGER DEFAULT 5,
    result_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    restaurant_id UUID,
    restaurant_name TEXT,
    recent_entries INTEGER,
    avg_recent_rating DECIMAL,
    trend_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_activity AS (
        SELECT 
            fe.restaurant_id,
            COUNT(*) as entry_count,
            AVG(fe.rating) as avg_rating,
            COUNT(DISTINCT fe.user_id) as unique_users
        FROM public.food_entries fe
        WHERE fe.restaurant_id IS NOT NULL
        AND fe.created_at >= NOW() - (days_back || ' days')::INTERVAL
        AND fe.is_public = true
        GROUP BY fe.restaurant_id
        HAVING COUNT(*) >= min_entries
    )
    SELECT 
        ra.restaurant_id,
        r.name,
        ra.entry_count,
        ra.avg_rating,
        -- Trend score based on activity, rating, and user diversity
        (ra.entry_count * 0.4 + ra.avg_rating * 0.4 + ra.unique_users * 0.2) as trend_score
    FROM recent_activity ra
    JOIN public.restaurants r ON r.id = ra.restaurant_id
    WHERE r.is_active = true
    ORDER BY trend_score DESC
    LIMIT result_limit;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to search restaurants with full-text search
CREATE OR REPLACE FUNCTION search_restaurants_fulltext(
    search_query TEXT,
    result_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    restaurant_id UUID,
    restaurant_name TEXT,
    description TEXT,
    cuisine_types TEXT[],
    rating DECIMAL,
    search_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.description,
        r.cuisine_types,
        r.rating,
        ts_rank_cd(
            to_tsvector('english', r.name || ' ' || COALESCE(r.description, '') || ' ' || array_to_string(r.cuisine_types, ' ')),
            plainto_tsquery('english', search_query)
        ) AS search_rank
    FROM public.restaurants r
    WHERE r.is_active = true
    AND to_tsvector('english', r.name || ' ' || COALESCE(r.description, '') || ' ' || array_to_string(r.cuisine_types, ' ')) 
        @@ plainto_tsquery('english', search_query)
    ORDER BY search_rank DESC, r.rating DESC
    LIMIT result_limit;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to get user's food journey stats
CREATE OR REPLACE FUNCTION get_user_food_journey(
    target_user_id UUID
)
RETURNS TABLE(
    total_entries INTEGER,
    total_restaurants INTEGER,
    total_cuisines INTEGER,
    avg_rating DECIMAL,
    top_cuisines TEXT[],
    monthly_activity JSONB
) AS $$
DECLARE
    result_record RECORD;
BEGIN
    -- Calculate basic stats
    SELECT 
        COUNT(*) as entries,
        COUNT(DISTINCT restaurant_id) as restaurants,
        AVG(rating) as avg_rating
    INTO result_record
    FROM public.food_entries
    WHERE user_id = target_user_id;
    
    RETURN QUERY
    WITH cuisine_stats AS (
        SELECT DISTINCT UNNEST(r.cuisine_types) as cuisine
        FROM public.food_entries fe
        JOIN public.restaurants r ON r.id = fe.restaurant_id
        WHERE fe.user_id = target_user_id
    ),
    monthly_stats AS (
        SELECT 
            DATE_TRUNC('month', consumed_at) as month,
            COUNT(*) as count
        FROM public.food_entries
        WHERE user_id = target_user_id
        GROUP BY DATE_TRUNC('month', consumed_at)
        ORDER BY month DESC
        LIMIT 12
    )
    SELECT 
        result_record.entries,
        result_record.restaurants,
        (SELECT COUNT(*) FROM cuisine_stats)::INTEGER,
        result_record.avg_rating,
        ARRAY(SELECT cuisine FROM cuisine_stats LIMIT 5),
        jsonb_agg(
            jsonb_build_object(
                'month', to_char(ms.month, 'YYYY-MM'),
                'count', ms.count
            )
        )
    FROM monthly_stats ms;
END;
$$ language 'plpgsql' SECURITY DEFINER;