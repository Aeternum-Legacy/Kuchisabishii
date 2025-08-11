-- Search and Discovery Functions for Kuchisabishii
-- Advanced search capabilities for restaurants, dishes, and experiences

-- Function for intelligent restaurant search
CREATE OR REPLACE FUNCTION search_restaurants(
  search_query TEXT,
  user_id UUID DEFAULT NULL,
  user_lat DECIMAL DEFAULT NULL,
  user_lon DECIMAL DEFAULT NULL,
  max_distance_km INTEGER DEFAULT 50,
  cuisine_filter TEXT[] DEFAULT NULL,
  price_filter INTEGER[] DEFAULT NULL,
  feature_filter TEXT[] DEFAULT NULL,
  min_rating DECIMAL DEFAULT 0,
  limit_results INTEGER DEFAULT 20,
  offset_results INTEGER DEFAULT 0
)
RETURNS TABLE(
  restaurant_id UUID,
  name TEXT,
  description TEXT,
  cuisine_types TEXT[],
  price_range INTEGER,
  address TEXT,
  city TEXT,
  distance_km DECIMAL,
  avg_rating DECIMAL,
  review_count INTEGER,
  features TEXT[],
  match_score DECIMAL,
  is_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH restaurant_ratings AS (
    SELECT 
      rr.restaurant_id,
      AVG(rr.overall_restaurant_rating) as avg_rating,
      COUNT(*) as review_count
    FROM public.restaurant_reviews rr
    WHERE NOT rr.is_private
    GROUP BY rr.restaurant_id
  ),
  restaurant_search AS (
    SELECT 
      r.id,
      r.name,
      r.description,
      r.cuisine_types,
      r.price_range,
      r.address,
      r.city,
      r.features,
      r.verified,
      
      -- Calculate distance if coordinates provided
      CASE 
        WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL
        THEN earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(r.latitude, r.longitude)) / 1000
        ELSE NULL
      END as distance_km,
      
      -- Calculate search relevance score
      CASE 
        WHEN search_query IS NOT NULL AND search_query != '' THEN
          ts_rank_cd(r.search_vector, plainto_tsquery('english', search_query)) +
          -- Boost exact name matches
          (CASE WHEN r.name ILIKE '%' || search_query || '%' THEN 0.5 ELSE 0 END) +
          -- Boost cuisine matches
          (CASE WHEN search_query = ANY(r.cuisine_types) THEN 0.3 ELSE 0 END) +
          -- Boost city matches
          (CASE WHEN r.city ILIKE '%' || search_query || '%' THEN 0.2 ELSE 0 END)
        ELSE 1.0
      END as text_match_score,
      
      COALESCE(rr.avg_rating, 3.0) as avg_rating,
      COALESCE(rr.review_count, 0) as review_count
      
    FROM public.restaurants r
    LEFT JOIN restaurant_ratings rr ON r.id = rr.restaurant_id
    WHERE 
      -- Text search filter
      (search_query IS NULL OR search_query = '' OR 
       r.search_vector @@ plainto_tsquery('english', search_query) OR
       r.name ILIKE '%' || search_query || '%' OR
       r.city ILIKE '%' || search_query || '%' OR
       search_query = ANY(r.cuisine_types))
      
      -- Distance filter
      AND (user_lat IS NULL OR user_lon IS NULL OR r.latitude IS NULL OR r.longitude IS NULL OR
           earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(r.latitude, r.longitude)) / 1000 <= max_distance_km)
      
      -- Cuisine filter
      AND (cuisine_filter IS NULL OR r.cuisine_types && cuisine_filter)
      
      -- Price filter
      AND (price_filter IS NULL OR r.price_range = ANY(price_filter))
      
      -- Feature filter
      AND (feature_filter IS NULL OR r.features && feature_filter)
      
      -- Minimum rating filter
      AND COALESCE(rr.avg_rating, 3.0) >= min_rating
  )
  SELECT 
    rs.id,
    rs.name,
    rs.description,
    rs.cuisine_types,
    rs.price_range,
    rs.address,
    rs.city,
    rs.distance_km,
    rs.avg_rating,
    rs.review_count,
    rs.features,
    -- Final match score combining text relevance, rating, and proximity
    (
      rs.text_match_score * 0.4 +
      (rs.avg_rating / 5.0) * 0.3 +
      CASE WHEN rs.distance_km IS NOT NULL 
           THEN (1.0 - LEAST(rs.distance_km / GREATEST(max_distance_km, 1), 1.0)) * 0.2
           ELSE 0.1 END +
      (LEAST(rs.review_count, 100) / 100.0) * 0.1
    )::DECIMAL as match_score,
    rs.verified
  FROM restaurant_search rs
  ORDER BY match_score DESC, rs.avg_rating DESC, rs.review_count DESC
  LIMIT limit_results OFFSET offset_results;
END;
$$ LANGUAGE plpgsql;

-- Function for menu item search
CREATE OR REPLACE FUNCTION search_menu_items(
  search_query TEXT,
  user_id UUID DEFAULT NULL,
  restaurant_id UUID DEFAULT NULL,
  cuisine_filter TEXT[] DEFAULT NULL,
  dietary_filter TEXT[] DEFAULT NULL, -- vegetarian, vegan, gluten_free
  allergen_exclusions TEXT[] DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  spice_level_max INTEGER DEFAULT NULL,
  limit_results INTEGER DEFAULT 20,
  offset_results INTEGER DEFAULT 0
)
RETURNS TABLE(
  menu_item_id UUID,
  item_name TEXT,
  description TEXT,
  price DECIMAL,
  category TEXT,
  restaurant_id UUID,
  restaurant_name TEXT,
  cuisine_types TEXT[],
  spice_level INTEGER,
  is_vegetarian BOOLEAN,
  is_vegan BOOLEAN,
  is_gluten_free BOOLEAN,
  ingredients TEXT[],
  allergens TEXT[],
  match_score DECIMAL,
  avg_user_rating DECIMAL,
  experience_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH menu_item_ratings AS (
    SELECT 
      fe.menu_item_id,
      AVG(fe.overall_rating) as avg_rating,
      COUNT(*) as experience_count
    FROM public.food_experiences fe
    WHERE fe.menu_item_id IS NOT NULL
      AND NOT fe.is_private
    GROUP BY fe.menu_item_id
  ),
  user_dietary_restrictions AS (
    SELECT dietary_restrictions, allergies
    FROM public.user_profiles
    WHERE user_id IS NOT NULL AND id = user_id
  )
  SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.category,
    mi.restaurant_id,
    r.name as restaurant_name,
    r.cuisine_types,
    mi.spice_level,
    mi.is_vegetarian,
    mi.is_vegan,
    mi.is_gluten_free,
    mi.ingredients,
    mi.allergens,
    
    -- Calculate match score
    (
      CASE 
        WHEN search_query IS NOT NULL AND search_query != '' THEN
          -- Name similarity
          (CASE WHEN mi.name ILIKE '%' || search_query || '%' THEN 0.5 ELSE 0 END) +
          -- Description similarity
          (CASE WHEN mi.description ILIKE '%' || search_query || '%' THEN 0.3 ELSE 0 END) +
          -- Ingredient match
          (CASE WHEN search_query = ANY(mi.ingredients) THEN 0.4 ELSE 0 END) +
          -- Category match
          (CASE WHEN mi.category ILIKE '%' || search_query || '%' THEN 0.2 ELSE 0 END)
        ELSE 1.0
      END +
      -- Rating boost
      (COALESCE(mir.avg_rating, 3.0) / 5.0) * 0.3 +
      -- Experience count boost (normalized)
      (LEAST(COALESCE(mir.experience_count, 0), 20) / 20.0) * 0.2
    )::DECIMAL as match_score,
    
    COALESCE(mir.avg_rating, 0)::DECIMAL as avg_user_rating,
    COALESCE(mir.experience_count, 0)::INTEGER as experience_count
    
  FROM public.menu_items mi
  JOIN public.restaurants r ON mi.restaurant_id = r.id
  LEFT JOIN menu_item_ratings mir ON mi.id = mir.menu_item_id
  LEFT JOIN user_dietary_restrictions udr ON user_id IS NOT NULL
  WHERE 
    mi.is_available = true
    
    -- Restaurant filter
    AND (search_menu_items.restaurant_id IS NULL OR mi.restaurant_id = search_menu_items.restaurant_id)
    
    -- Text search
    AND (search_query IS NULL OR search_query = '' OR
         mi.name ILIKE '%' || search_query || '%' OR
         mi.description ILIKE '%' || search_query || '%' OR
         mi.category ILIKE '%' || search_query || '%' OR
         search_query = ANY(mi.ingredients))
    
    -- Cuisine filter
    AND (cuisine_filter IS NULL OR r.cuisine_types && cuisine_filter)
    
    -- Price filter
    AND (max_price IS NULL OR mi.price <= max_price)
    
    -- Spice level filter
    AND (spice_level_max IS NULL OR mi.spice_level <= spice_level_max)
    
    -- Dietary restrictions filter
    AND (dietary_filter IS NULL OR
         ('vegetarian' = ANY(dietary_filter) AND mi.is_vegetarian = true) OR
         ('vegan' = ANY(dietary_filter) AND mi.is_vegan = true) OR
         ('gluten_free' = ANY(dietary_filter) AND mi.is_gluten_free = true))
    
    -- User dietary restrictions compliance
    AND (udr.dietary_restrictions IS NULL OR
         (NOT ('vegetarian' = ANY(udr.dietary_restrictions)) OR mi.is_vegetarian = true) AND
         (NOT ('vegan' = ANY(udr.dietary_restrictions)) OR mi.is_vegan = true) AND
         (NOT ('gluten_free' = ANY(udr.dietary_restrictions)) OR mi.is_gluten_free = true))
    
    -- Allergen exclusions
    AND (allergen_exclusions IS NULL OR NOT (mi.allergens && allergen_exclusions))
    AND (udr.allergies IS NULL OR NOT (mi.allergens && udr.allergies))
    
  ORDER BY match_score DESC, avg_user_rating DESC, experience_count DESC
  LIMIT limit_results OFFSET offset_results;
END;
$$ LANGUAGE plpgsql;

-- Function for searching food experiences (for discovery and inspiration)
CREATE OR REPLACE FUNCTION search_food_experiences(
  search_query TEXT,
  user_id UUID DEFAULT NULL,
  include_friends_only BOOLEAN DEFAULT FALSE,
  cuisine_filter TEXT[] DEFAULT NULL,
  emotion_filter TEXT[] DEFAULT NULL,
  min_rating INTEGER DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  limit_results INTEGER DEFAULT 20,
  offset_results INTEGER DEFAULT 0
)
RETURNS TABLE(
  experience_id UUID,
  dish_name TEXT,
  custom_notes TEXT,
  overall_rating INTEGER,
  user_name TEXT,
  restaurant_name TEXT,
  experienced_at TIMESTAMP WITH TIME ZONE,
  emotions TEXT[],
  photos TEXT[],
  meal_time TEXT,
  dining_method TEXT,
  satisfaction_level INTEGER,
  match_score DECIMAL,
  is_friend BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH user_friends AS (
    SELECT DISTINCT
      CASE 
        WHEN f.requester_id = search_food_experiences.user_id THEN f.addressee_id
        ELSE f.requester_id
      END as friend_id
    FROM public.friendships f
    WHERE (f.requester_id = search_food_experiences.user_id OR f.addressee_id = search_food_experiences.user_id)
      AND f.status = 'accepted'
      AND search_food_experiences.user_id IS NOT NULL
  )
  SELECT 
    fe.id,
    fe.dish_name,
    fe.custom_notes,
    fe.overall_rating,
    up.display_name,
    r.name as restaurant_name,
    fe.experienced_at,
    fe.emotions,
    fe.photos,
    fe.meal_time,
    fe.dining_method,
    fe.satisfaction_level,
    
    -- Calculate relevance score
    (
      CASE 
        WHEN search_query IS NOT NULL AND search_query != '' THEN
          ts_rank_cd(fe.search_vector, plainto_tsquery('english', search_query)) +
          -- Boost exact dish name matches
          (CASE WHEN fe.dish_name ILIKE '%' || search_query || '%' THEN 0.5 ELSE 0 END) +
          -- Boost emotion matches
          (CASE WHEN search_query = ANY(fe.emotions) THEN 0.3 ELSE 0 END) +
          -- Boost notes matches
          (CASE WHEN fe.custom_notes ILIKE '%' || search_query || '%' THEN 0.2 ELSE 0 END)
        ELSE 1.0
      END +
      -- Rating boost
      (fe.overall_rating / 5.0) * 0.3 +
      -- Recent experiences boost
      (CASE WHEN fe.experienced_at >= NOW() - INTERVAL '30 days' THEN 0.2 ELSE 0 END) +
      -- Friend boost
      (CASE WHEN uf.friend_id IS NOT NULL THEN 0.3 ELSE 0 END) +
      -- Photo boost (visual experiences are more engaging)
      (CASE WHEN array_length(fe.photos, 1) > 0 THEN 0.1 ELSE 0 END)
    )::DECIMAL as match_score,
    
    (uf.friend_id IS NOT NULL) as is_friend
    
  FROM public.food_experiences fe
  JOIN public.user_profiles up ON fe.user_id = up.id
  LEFT JOIN public.restaurants r ON fe.restaurant_id = r.id
  LEFT JOIN user_friends uf ON fe.user_id = uf.friend_id
  WHERE 
    -- Privacy filters
    (NOT fe.is_private OR fe.user_id = search_food_experiences.user_id) AND
    (fe.shared_with_friends OR fe.user_id = search_food_experiences.user_id OR uf.friend_id IS NOT NULL)
    
    -- Friends only filter
    AND (NOT include_friends_only OR uf.friend_id IS NOT NULL OR fe.user_id = search_food_experiences.user_id)
    
    -- Text search
    AND (search_query IS NULL OR search_query = '' OR
         fe.search_vector @@ plainto_tsquery('english', search_query) OR
         fe.dish_name ILIKE '%' || search_query || '%' OR
         fe.custom_notes ILIKE '%' || search_query || '%' OR
         search_query = ANY(fe.emotions))
    
    -- Cuisine filter (via restaurant)
    AND (cuisine_filter IS NULL OR r.cuisine_types && cuisine_filter)
    
    -- Emotion filter
    AND (emotion_filter IS NULL OR fe.emotions && emotion_filter)
    
    -- Rating filter
    AND (min_rating IS NULL OR fe.overall_rating >= min_rating)
    
    -- Date range filter
    AND (date_from IS NULL OR fe.experienced_at::date >= date_from)
    AND (date_to IS NULL OR fe.experienced_at::date <= date_to)
    
  ORDER BY match_score DESC, fe.experienced_at DESC
  LIMIT limit_results OFFSET offset_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending dishes and restaurants
CREATE OR REPLACE FUNCTION get_trending_content(
  content_type TEXT DEFAULT 'both', -- 'restaurants', 'dishes', 'both'
  time_period INTEGER DEFAULT 7, -- days
  user_id UUID DEFAULT NULL,
  user_lat DECIMAL DEFAULT NULL,
  user_lon DECIMAL DEFAULT NULL,
  max_distance_km INTEGER DEFAULT 50,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE(
  item_type TEXT,
  item_id UUID,
  item_name TEXT,
  restaurant_name TEXT,
  trend_score DECIMAL,
  recent_experiences INTEGER,
  avg_rating DECIMAL,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH trending_restaurants AS (
    SELECT 
      'restaurant' as item_type,
      r.id as item_id,
      r.name as item_name,
      r.name as restaurant_name,
      
      -- Calculate trend score based on recent activity and ratings
      (
        COUNT(fe.id)::DECIMAL * 0.4 +  -- Recent experience count
        AVG(fe.overall_rating) * 0.3 +  -- Average rating
        (COUNT(DISTINCT fe.user_id)::DECIMAL / GREATEST(time_period, 1)) * 0.3  -- Unique users per day
      ) as trend_score,
      
      COUNT(fe.id)::INTEGER as recent_experiences,
      AVG(fe.overall_rating)::DECIMAL as avg_rating,
      
      CASE 
        WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL
        THEN earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(r.latitude, r.longitude)) / 1000
        ELSE NULL
      END as distance_km
      
    FROM public.restaurants r
    JOIN public.food_experiences fe ON r.id = fe.restaurant_id
    WHERE 
      fe.experienced_at >= NOW() - (time_period || ' days')::INTERVAL
      AND NOT fe.is_private
      AND fe.overall_rating >= 3
      -- Distance filter
      AND (user_lat IS NULL OR user_lon IS NULL OR r.latitude IS NULL OR r.longitude IS NULL OR
           earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(r.latitude, r.longitude)) / 1000 <= max_distance_km)
    GROUP BY r.id, r.name, r.latitude, r.longitude
    HAVING COUNT(fe.id) >= 3 AND COUNT(DISTINCT fe.user_id) >= 2
  ),
  trending_dishes AS (
    SELECT 
      'dish' as item_type,
      fe.id as item_id,
      fe.dish_name as item_name,
      COALESCE(r.name, 'Various') as restaurant_name,
      
      -- Calculate trend score for dishes
      (
        COUNT(*)::DECIMAL * 0.5 +  -- Frequency
        AVG(fe.overall_rating) * 0.3 +  -- Average rating
        AVG(fe.satisfaction_level) * 0.1 +  -- Satisfaction
        (COUNT(DISTINCT fe.user_id)::DECIMAL / GREATEST(time_period, 1)) * 0.1  -- User diversity
      ) as trend_score,
      
      COUNT(*)::INTEGER as recent_experiences,
      AVG(fe.overall_rating)::DECIMAL as avg_rating,
      
      -- For dishes, use average distance of restaurants serving them
      AVG(
        CASE 
          WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL
          THEN earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(r.latitude, r.longitude)) / 1000
          ELSE NULL
        END
      )::DECIMAL as distance_km
      
    FROM public.food_experiences fe
    LEFT JOIN public.restaurants r ON fe.restaurant_id = r.id
    WHERE 
      fe.experienced_at >= NOW() - (time_period || ' days')::INTERVAL
      AND NOT fe.is_private
      AND fe.overall_rating >= 3
      AND fe.dish_name IS NOT NULL
    GROUP BY fe.dish_name, r.name
    HAVING COUNT(*) >= 2 AND COUNT(DISTINCT fe.user_id) >= 2
  )
  SELECT 
    t.item_type,
    t.item_id,
    t.item_name,
    t.restaurant_name,
    t.trend_score,
    t.recent_experiences,
    t.avg_rating,
    t.distance_km
  FROM (
    SELECT * FROM trending_restaurants WHERE content_type IN ('restaurants', 'both')
    UNION ALL
    SELECT * FROM trending_dishes WHERE content_type IN ('dishes', 'both')
  ) t
  ORDER BY t.trend_score DESC, t.avg_rating DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to track and store user searches for analytics
CREATE OR REPLACE FUNCTION track_search(
  p_user_id UUID,
  p_search_query TEXT,
  p_search_type TEXT,
  p_results_count INTEGER DEFAULT 0,
  p_clicked_result_id UUID DEFAULT NULL,
  p_clicked_result_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  search_id UUID;
BEGIN
  INSERT INTO public.search_history (
    user_id, search_query, search_type, results_count, 
    clicked_result_id, clicked_result_type
  ) VALUES (
    p_user_id, p_search_query, p_search_type, p_results_count,
    p_clicked_result_id, p_clicked_result_type
  ) RETURNING id INTO search_id;
  
  RETURN search_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular search terms for suggestions
CREATE OR REPLACE FUNCTION get_popular_search_terms(
  search_type TEXT DEFAULT NULL,
  days_back INTEGER DEFAULT 30,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE(
  search_term TEXT,
  search_count INTEGER,
  avg_results INTEGER,
  click_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sh.search_query,
    COUNT(*)::INTEGER as search_count,
    AVG(sh.results_count)::INTEGER as avg_results,
    (
      CASE WHEN COUNT(*) > 0 
      THEN (COUNT(CASE WHEN sh.clicked_result_id IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0 END
    )::DECIMAL as click_rate
  FROM public.search_history sh
  WHERE 
    sh.created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND (search_type IS NULL OR sh.search_type = get_popular_search_terms.search_type)
    AND LENGTH(sh.search_query) >= 3
    AND sh.results_count > 0
  GROUP BY sh.search_query
  HAVING COUNT(*) >= 2
  ORDER BY search_count DESC, click_rate DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;