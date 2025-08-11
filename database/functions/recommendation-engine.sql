-- Recommendation Engine Functions for Kuchisabishii
-- Advanced algorithms for personalized food and restaurant recommendations

-- Function to calculate taste similarity between users
CREATE OR REPLACE FUNCTION calculate_taste_similarity(user1_id UUID, user2_id UUID)
RETURNS DECIMAL(5,4) AS $$
DECLARE
  user1_profile public.taste_profiles%ROWTYPE;
  user2_profile public.taste_profiles%ROWTYPE;
  similarity_score DECIMAL(5,4) := 0.0;
  total_comparisons INTEGER := 0;
BEGIN
  -- Get taste profiles for both users
  SELECT * INTO user1_profile FROM public.taste_profiles WHERE user_id = user1_id;
  SELECT * INTO user2_profile FROM public.taste_profiles WHERE user_id = user2_id;
  
  IF user1_profile IS NULL OR user2_profile IS NULL THEN
    RETURN 0.0;
  END IF;
  
  -- Calculate similarity across taste preferences (1 - normalized absolute difference)
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.salty_preference - user2_profile.salty_preference) / 9.0);
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.sweet_preference - user2_profile.sweet_preference) / 9.0);
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.sour_preference - user2_profile.sour_preference) / 9.0);
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.bitter_preference - user2_profile.bitter_preference) / 9.0);
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.umami_preference - user2_profile.umami_preference) / 9.0);
  
  -- Add texture preferences
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.crunchy_preference - user2_profile.crunchy_preference) / 9.0);
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.creamy_preference - user2_profile.creamy_preference) / 9.0);
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.chewy_preference - user2_profile.chewy_preference) / 9.0);
  
  -- Add temperature preferences
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.hot_food_preference - user2_profile.hot_food_preference) / 9.0);
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.cold_food_preference - user2_profile.cold_food_preference) / 9.0);
  
  -- Add adventurousness
  similarity_score := similarity_score + (1.0 - ABS(user1_profile.culinary_adventurousness - user2_profile.culinary_adventurousness) / 9.0);
  
  total_comparisons := 11;
  
  -- Return average similarity
  RETURN similarity_score / total_comparisons;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized restaurant recommendations
CREATE OR REPLACE FUNCTION get_restaurant_recommendations(
  target_user_id UUID,
  max_distance_km INTEGER DEFAULT 25,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE(
  restaurant_id UUID,
  restaurant_name TEXT,
  cuisine_types TEXT[],
  distance_km DECIMAL,
  recommendation_score DECIMAL,
  recommendation_reason TEXT
) AS $$
DECLARE
  user_lat DECIMAL(10,8);
  user_lon DECIMAL(11,8);
  user_preferences public.recommendation_preferences%ROWTYPE;
BEGIN
  -- Get user's location and preferences
  SELECT latitude, longitude INTO user_lat, user_lon 
  FROM public.user_profiles up
  WHERE up.id = target_user_id;
  
  SELECT * INTO user_preferences 
  FROM public.recommendation_preferences 
  WHERE user_id = target_user_id;
  
  -- If no preferences found, use defaults
  IF user_preferences IS NULL THEN
    INSERT INTO public.recommendation_preferences (user_id) VALUES (target_user_id);
    SELECT * INTO user_preferences FROM public.recommendation_preferences WHERE user_id = target_user_id;
  END IF;
  
  RETURN QUERY
  WITH similar_users AS (
    -- Find users with similar taste profiles
    SELECT 
      tp.user_id,
      calculate_taste_similarity(target_user_id, tp.user_id) as similarity
    FROM public.taste_profiles tp
    WHERE tp.user_id != target_user_id
      AND calculate_taste_similarity(target_user_id, tp.user_id) > 0.6
    ORDER BY similarity DESC
    LIMIT 50
  ),
  friend_recommendations AS (
    -- Get restaurants highly rated by friends
    SELECT 
      fe.restaurant_id,
      AVG(fe.overall_rating)::DECIMAL as avg_rating,
      COUNT(*) as experience_count,
      'friend_recommendation' as reason
    FROM public.food_experiences fe
    JOIN public.friendships f ON (
      (f.requester_id = target_user_id AND f.addressee_id = fe.user_id) OR
      (f.addressee_id = target_user_id AND f.requester_id = fe.user_id)
    )
    WHERE f.status = 'accepted'
      AND fe.overall_rating >= 4
      AND fe.restaurant_id IS NOT NULL
      AND NOT EXISTS (
        -- Exclude restaurants user has already visited
        SELECT 1 FROM public.food_experiences fe2 
        WHERE fe2.user_id = target_user_id AND fe2.restaurant_id = fe.restaurant_id
      )
    GROUP BY fe.restaurant_id
    HAVING COUNT(*) >= 2
  ),
  similar_taste_recommendations AS (
    -- Get restaurants from users with similar tastes
    SELECT 
      fe.restaurant_id,
      AVG(fe.overall_rating)::DECIMAL as avg_rating,
      COUNT(*) as experience_count,
      'similar_taste' as reason
    FROM public.food_experiences fe
    JOIN similar_users su ON fe.user_id = su.user_id
    WHERE fe.overall_rating >= 4
      AND fe.restaurant_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.food_experiences fe2 
        WHERE fe2.user_id = target_user_id AND fe2.restaurant_id = fe.restaurant_id
      )
    GROUP BY fe.restaurant_id
    HAVING COUNT(*) >= 2
  ),
  trending_restaurants AS (
    -- Get currently trending restaurants
    SELECT 
      fe.restaurant_id,
      AVG(fe.overall_rating)::DECIMAL as avg_rating,
      COUNT(*) as experience_count,
      'trending' as reason
    FROM public.food_experiences fe
    WHERE fe.experienced_at >= NOW() - INTERVAL '30 days'
      AND fe.overall_rating >= 4
      AND fe.restaurant_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.food_experiences fe2 
        WHERE fe2.user_id = target_user_id AND fe2.restaurant_id = fe.restaurant_id
      )
    GROUP BY fe.restaurant_id
    HAVING COUNT(*) >= 5
  ),
  all_recommendations AS (
    SELECT restaurant_id, avg_rating, experience_count, reason FROM friend_recommendations
    UNION ALL
    SELECT restaurant_id, avg_rating, experience_count, reason FROM similar_taste_recommendations
    UNION ALL
    SELECT restaurant_id, avg_rating, experience_count, reason FROM trending_restaurants
  )
  SELECT 
    r.id,
    r.name,
    r.cuisine_types,
    CASE 
      WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL
      THEN earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(r.latitude, r.longitude)) / 1000
      ELSE NULL
    END as distance_km,
    (
      (ar.avg_rating / 5.0) * 0.4 +  -- Rating weight
      (LEAST(ar.experience_count, 10) / 10.0) * 0.3 +  -- Experience count weight
      CASE ar.reason
        WHEN 'friend_recommendation' THEN user_preferences.friend_influence_weight
        WHEN 'similar_taste' THEN user_preferences.taste_similarity_weight
        WHEN 'trending' THEN user_preferences.trending_factor_weight
        ELSE 0.1
      END
    )::DECIMAL as recommendation_score,
    ar.reason as recommendation_reason
  FROM all_recommendations ar
  JOIN public.restaurants r ON r.id = ar.restaurant_id
  WHERE (user_lat IS NULL OR user_lon IS NULL OR r.latitude IS NULL OR r.longitude IS NULL OR
         earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(r.latitude, r.longitude)) / 1000 <= max_distance_km)
    AND r.price_range = ANY(user_preferences.price_range_filter)
    AND (array_length(user_preferences.exclude_cuisines, 1) IS NULL OR 
         NOT (r.cuisine_types && user_preferences.exclude_cuisines))
    AND (NOT user_preferences.only_verified_restaurants OR r.verified = true)
  ORDER BY recommendation_score DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized menu item recommendations
CREATE OR REPLACE FUNCTION get_menu_item_recommendations(
  target_user_id UUID,
  restaurant_id UUID DEFAULT NULL,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE(
  menu_item_id UUID,
  menu_item_name TEXT,
  restaurant_name TEXT,
  predicted_rating DECIMAL,
  recommendation_reason TEXT
) AS $$
DECLARE
  user_taste_profile public.taste_profiles%ROWTYPE;
BEGIN
  -- Get user's taste profile
  SELECT * INTO user_taste_profile 
  FROM public.taste_profiles 
  WHERE user_id = target_user_id;
  
  RETURN QUERY
  WITH user_experience_patterns AS (
    -- Analyze user's past experiences to predict preferences
    SELECT 
      fe.dish_name,
      AVG(fe.overall_rating) as avg_rating,
      AVG(te.saltiness) as avg_saltiness,
      AVG(te.sweetness) as avg_sweetness,
      AVG(te.sourness) as avg_sourness,
      AVG(te.bitterness) as avg_bitterness,
      AVG(te.umami) as avg_umami,
      AVG(te.spice_heat) as avg_spice_heat
    FROM public.food_experiences fe
    LEFT JOIN public.taste_experiences te ON fe.id = te.food_experience_id
    WHERE fe.user_id = target_user_id
      AND fe.overall_rating IS NOT NULL
    GROUP BY fe.dish_name
  ),
  similar_dishes AS (
    -- Find dishes similar to what user has enjoyed
    SELECT DISTINCT
      mi.id as menu_item_id,
      mi.name as menu_item_name,
      r.name as restaurant_name,
      -- Predict rating based on similarity to liked dishes
      (
        CASE WHEN user_taste_profile IS NOT NULL THEN
          (
            -- Match spice preference
            (1.0 - ABS(COALESCE(mi.spice_level, 3) - (user_taste_profile.salty_preference / 2.0)) / 3.0) * 0.3 +
            -- Dietary compatibility
            CASE 
              WHEN mi.is_vegetarian AND 'vegetarian' = ANY(SELECT unnest(up.dietary_restrictions) FROM public.user_profiles up WHERE up.id = target_user_id) THEN 0.3
              WHEN mi.is_vegan AND 'vegan' = ANY(SELECT unnest(up.dietary_restrictions) FROM public.user_profiles up WHERE up.id = target_user_id) THEN 0.3
              WHEN mi.is_gluten_free AND 'gluten_free' = ANY(SELECT unnest(up.dietary_restrictions) FROM public.user_profiles up WHERE up.id = target_user_id) THEN 0.3
              ELSE 0.1
            END +
            -- Base preference match
            0.4
          )
        ELSE 3.5
        END
      )::DECIMAL as predicted_rating,
      'taste_profile_match' as recommendation_reason
    FROM public.menu_items mi
    JOIN public.restaurants r ON mi.restaurant_id = r.id
    WHERE mi.is_available = true
      AND (restaurant_id IS NULL OR mi.restaurant_id = restaurant_id)
      AND NOT EXISTS (
        -- Exclude items user has already tried
        SELECT 1 FROM public.food_experiences fe 
        WHERE fe.user_id = target_user_id 
        AND (fe.menu_item_id = mi.id OR similarity(fe.dish_name, mi.name) > 0.8)
      )
      -- Check dietary restrictions
      AND (
        NOT ('vegetarian' = ANY(SELECT unnest(up.dietary_restrictions) FROM public.user_profiles up WHERE up.id = target_user_id)) OR mi.is_vegetarian = true
      )
      AND (
        NOT ('vegan' = ANY(SELECT unnest(up.dietary_restrictions) FROM public.user_profiles up WHERE up.id = target_user_id)) OR mi.is_vegan = true
      )
      AND (
        NOT ('gluten_free' = ANY(SELECT unnest(up.dietary_restrictions) FROM public.user_profiles up WHERE up.id = target_user_id)) OR mi.is_gluten_free = true
      )
      -- Check allergies
      AND NOT EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = target_user_id
        AND mi.allergens && up.allergies
      )
  ),
  friend_loved_items AS (
    -- Items highly rated by friends
    SELECT 
      mi.id as menu_item_id,
      mi.name as menu_item_name,
      r.name as restaurant_name,
      AVG(fe.overall_rating)::DECIMAL as predicted_rating,
      'friend_favorite' as recommendation_reason
    FROM public.food_experiences fe
    JOIN public.friendships f ON (
      (f.requester_id = target_user_id AND f.addressee_id = fe.user_id) OR
      (f.addressee_id = target_user_id AND f.requester_id = fe.user_id)
    )
    JOIN public.menu_items mi ON fe.menu_item_id = mi.id
    JOIN public.restaurants r ON mi.restaurant_id = r.id
    WHERE f.status = 'accepted'
      AND fe.overall_rating >= 4
      AND mi.is_available = true
      AND (restaurant_id IS NULL OR mi.restaurant_id = restaurant_id)
      AND NOT EXISTS (
        SELECT 1 FROM public.food_experiences fe2 
        WHERE fe2.user_id = target_user_id AND fe2.menu_item_id = mi.id
      )
    GROUP BY mi.id, mi.name, r.name
    HAVING COUNT(*) >= 2
  )
  SELECT 
    coalesce(sd.menu_item_id, fli.menu_item_id),
    coalesce(sd.menu_item_name, fli.menu_item_name),
    coalesce(sd.restaurant_name, fli.restaurant_name),
    coalesce(sd.predicted_rating, fli.predicted_rating),
    coalesce(sd.recommendation_reason, fli.recommendation_reason)
  FROM similar_dishes sd
  FULL OUTER JOIN friend_loved_items fli ON sd.menu_item_id = fli.menu_item_id
  ORDER BY coalesce(sd.predicted_rating, fli.predicted_rating) DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to update user taste profile based on experiences
CREATE OR REPLACE FUNCTION update_taste_profile_from_experiences(target_user_id UUID)
RETURNS void AS $$
DECLARE
  taste_record public.taste_profiles%ROWTYPE;
BEGIN
  -- Get current taste profile
  SELECT * INTO taste_record FROM public.taste_profiles WHERE user_id = target_user_id;
  
  -- If no profile exists, create one
  IF taste_record IS NULL THEN
    INSERT INTO public.taste_profiles (user_id) VALUES (target_user_id);
    SELECT * INTO taste_record FROM public.taste_profiles WHERE user_id = target_user_id;
  END IF;
  
  -- Update preferences based on weighted average of positive experiences
  UPDATE public.taste_profiles SET
    salty_preference = COALESCE((
      SELECT ROUND(AVG(te.saltiness * (fe.overall_rating / 5.0)))
      FROM public.food_experiences fe
      JOIN public.taste_experiences te ON fe.id = te.food_experience_id
      WHERE fe.user_id = target_user_id AND fe.overall_rating >= 4
    ), salty_preference),
    
    sweet_preference = COALESCE((
      SELECT ROUND(AVG(te.sweetness * (fe.overall_rating / 5.0)))
      FROM public.food_experiences fe
      JOIN public.taste_experiences te ON fe.id = te.food_experience_id
      WHERE fe.user_id = target_user_id AND fe.overall_rating >= 4
    ), sweet_preference),
    
    sour_preference = COALESCE((
      SELECT ROUND(AVG(te.sourness * (fe.overall_rating / 5.0)))
      FROM public.food_experiences fe
      JOIN public.taste_experiences te ON fe.id = te.food_experience_id
      WHERE fe.user_id = target_user_id AND fe.overall_rating >= 4
    ), sour_preference),
    
    bitter_preference = COALESCE((
      SELECT ROUND(AVG(te.bitterness * (fe.overall_rating / 5.0)))
      FROM public.food_experiences fe
      JOIN public.taste_experiences te ON fe.id = te.food_experience_id
      WHERE fe.user_id = target_user_id AND fe.overall_rating >= 4
    ), bitter_preference),
    
    umami_preference = COALESCE((
      SELECT ROUND(AVG(te.umami * (fe.overall_rating / 5.0)))
      FROM public.food_experiences fe
      JOIN public.taste_experiences te ON fe.id = te.food_experience_id
      WHERE fe.user_id = target_user_id AND fe.overall_rating >= 4
    ), umami_preference),
    
    updated_at = NOW()
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track recommendation interactions
CREATE OR REPLACE FUNCTION track_recommendation_interaction(
  p_user_id UUID,
  p_restaurant_id UUID DEFAULT NULL,
  p_menu_item_id UUID DEFAULT NULL,
  p_recommendation_type TEXT,
  p_interaction_type TEXT, -- 'shown', 'clicked', 'visited', 'rated'
  p_rating INTEGER DEFAULT NULL,
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  interaction_id UUID;
BEGIN
  -- Insert or update recommendation interaction
  INSERT INTO public.recommendation_interactions (
    user_id, restaurant_id, menu_item_id, recommendation_type, 
    recommendation_context, shown_at
  ) VALUES (
    p_user_id, p_restaurant_id, p_menu_item_id, p_recommendation_type, 
    p_context, NOW()
  ) 
  ON CONFLICT (user_id, restaurant_id, menu_item_id, recommendation_type, shown_at)
  DO UPDATE SET
    clicked = CASE WHEN p_interaction_type = 'clicked' THEN true ELSE recommendation_interactions.clicked END,
    clicked_at = CASE WHEN p_interaction_type = 'clicked' THEN NOW() ELSE recommendation_interactions.clicked_at END,
    visited = CASE WHEN p_interaction_type = 'visited' THEN true ELSE recommendation_interactions.visited END,
    visited_at = CASE WHEN p_interaction_type = 'visited' THEN NOW() ELSE recommendation_interactions.visited_at END,
    rated = CASE WHEN p_interaction_type = 'rated' THEN true ELSE recommendation_interactions.rated END,
    rating = CASE WHEN p_interaction_type = 'rated' THEN p_rating ELSE recommendation_interactions.rating END
  RETURNING id INTO interaction_id;
  
  RETURN interaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommendation analytics
CREATE OR REPLACE FUNCTION get_recommendation_analytics(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  recommendation_type TEXT,
  total_shown INTEGER,
  total_clicked INTEGER,
  total_visited INTEGER,
  click_through_rate DECIMAL,
  conversion_rate DECIMAL,
  avg_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ri.recommendation_type,
    COUNT(*)::INTEGER as total_shown,
    SUM(CASE WHEN ri.clicked THEN 1 ELSE 0 END)::INTEGER as total_clicked,
    SUM(CASE WHEN ri.visited THEN 1 ELSE 0 END)::INTEGER as total_visited,
    CASE WHEN COUNT(*) > 0 
      THEN (SUM(CASE WHEN ri.clicked THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0 
    END as click_through_rate,
    CASE WHEN SUM(CASE WHEN ri.clicked THEN 1 ELSE 0 END) > 0 
      THEN (SUM(CASE WHEN ri.visited THEN 1 ELSE 0 END)::DECIMAL / SUM(CASE WHEN ri.clicked THEN 1 ELSE 0 END)::DECIMAL) * 100
      ELSE 0 
    END as conversion_rate,
    AVG(ri.rating)::DECIMAL as avg_rating
  FROM public.recommendation_interactions ri
  WHERE ri.shown_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY ri.recommendation_type
  ORDER BY total_shown DESC;
END;
$$ LANGUAGE plpgsql;