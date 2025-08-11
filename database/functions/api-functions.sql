-- API Functions for Kuchisabishii
-- Database functions to support REST API endpoints and client operations

-- Function to create or update user profile with onboarding data
CREATE OR REPLACE FUNCTION upsert_user_profile(
  p_user_id UUID,
  p_username TEXT DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_dietary_restrictions TEXT[] DEFAULT NULL,
  p_allergies TEXT[] DEFAULT NULL,
  p_spice_tolerance INTEGER DEFAULT NULL,
  p_sweetness_preference INTEGER DEFAULT NULL,
  p_profile_visibility TEXT DEFAULT NULL,
  p_allow_recommendations BOOLEAN DEFAULT NULL,
  p_share_analytics BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  profile_record public.user_profiles%ROWTYPE;
BEGIN
  INSERT INTO public.user_profiles (
    id, username, display_name, bio, location, dietary_restrictions, 
    allergies, spice_tolerance, sweetness_preference, profile_visibility,
    allow_recommendations, share_analytics, updated_at
  ) VALUES (
    p_user_id, p_username, p_display_name, p_bio, p_location, 
    COALESCE(p_dietary_restrictions, '{}'), COALESCE(p_allergies, '{}'), 
    p_spice_tolerance, p_sweetness_preference, p_profile_visibility,
    COALESCE(p_allow_recommendations, true), COALESCE(p_share_analytics, true), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(p_username, user_profiles.username),
    display_name = COALESCE(p_display_name, user_profiles.display_name),
    bio = COALESCE(p_bio, user_profiles.bio),
    location = COALESCE(p_location, user_profiles.location),
    dietary_restrictions = COALESCE(p_dietary_restrictions, user_profiles.dietary_restrictions),
    allergies = COALESCE(p_allergies, user_profiles.allergies),
    spice_tolerance = COALESCE(p_spice_tolerance, user_profiles.spice_tolerance),
    sweetness_preference = COALESCE(p_sweetness_preference, user_profiles.sweetness_preference),
    profile_visibility = COALESCE(p_profile_visibility, user_profiles.profile_visibility),
    allow_recommendations = COALESCE(p_allow_recommendations, user_profiles.allow_recommendations),
    share_analytics = COALESCE(p_share_analytics, user_profiles.share_analytics),
    updated_at = NOW()
  RETURNING * INTO profile_record;
  
  RETURN row_to_json(profile_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete onboarding process
CREATE OR REPLACE FUNCTION complete_onboarding(
  p_user_id UUID,
  p_taste_preferences JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update profile onboarding status
  UPDATE public.user_profiles SET
    onboarding_completed = true,
    taste_profile_setup = true,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Create or update taste profile
  INSERT INTO public.taste_profiles (
    user_id,
    salty_preference,
    sweet_preference,
    sour_preference,
    bitter_preference,
    umami_preference,
    crunchy_preference,
    creamy_preference,
    chewy_preference,
    hot_food_preference,
    cold_food_preference,
    cuisine_preferences,
    culinary_adventurousness
  ) VALUES (
    p_user_id,
    (p_taste_preferences->>'salty_preference')::INTEGER,
    (p_taste_preferences->>'sweet_preference')::INTEGER,
    (p_taste_preferences->>'sour_preference')::INTEGER,
    (p_taste_preferences->>'bitter_preference')::INTEGER,
    (p_taste_preferences->>'umami_preference')::INTEGER,
    (p_taste_preferences->>'crunchy_preference')::INTEGER,
    (p_taste_preferences->>'creamy_preference')::INTEGER,
    (p_taste_preferences->>'chewy_preference')::INTEGER,
    (p_taste_preferences->>'hot_food_preference')::INTEGER,
    (p_taste_preferences->>'cold_food_preference')::INTEGER,
    COALESCE(p_taste_preferences->'cuisine_preferences', '{}'),
    (p_taste_preferences->>'culinary_adventurousness')::INTEGER
  )
  ON CONFLICT (user_id) DO UPDATE SET
    salty_preference = COALESCE((p_taste_preferences->>'salty_preference')::INTEGER, taste_profiles.salty_preference),
    sweet_preference = COALESCE((p_taste_preferences->>'sweet_preference')::INTEGER, taste_profiles.sweet_preference),
    sour_preference = COALESCE((p_taste_preferences->>'sour_preference')::INTEGER, taste_profiles.sour_preference),
    bitter_preference = COALESCE((p_taste_preferences->>'bitter_preference')::INTEGER, taste_profiles.bitter_preference),
    umami_preference = COALESCE((p_taste_preferences->>'umami_preference')::INTEGER, taste_profiles.umami_preference),
    crunchy_preference = COALESCE((p_taste_preferences->>'crunchy_preference')::INTEGER, taste_profiles.crunchy_preference),
    creamy_preference = COALESCE((p_taste_preferences->>'creamy_preference')::INTEGER, taste_profiles.creamy_preference),
    chewy_preference = COALESCE((p_taste_preferences->>'chewy_preference')::INTEGER, taste_profiles.chewy_preference),
    hot_food_preference = COALESCE((p_taste_preferences->>'hot_food_preference')::INTEGER, taste_profiles.hot_food_preference),
    cold_food_preference = COALESCE((p_taste_preferences->>'cold_food_preference')::INTEGER, taste_profiles.cold_food_preference),
    cuisine_preferences = COALESCE(p_taste_preferences->'cuisine_preferences', taste_profiles.cuisine_preferences),
    culinary_adventurousness = COALESCE((p_taste_preferences->>'culinary_adventurousness')::INTEGER, taste_profiles.culinary_adventurousness),
    updated_at = NOW();
  
  -- Create default recommendation preferences
  INSERT INTO public.recommendation_preferences (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT json_build_object(
    'success', true,
    'message', 'Onboarding completed successfully',
    'onboarding_completed', true,
    'taste_profile_setup', true
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a food experience with taste data
CREATE OR REPLACE FUNCTION create_food_experience(
  p_user_id UUID,
  p_restaurant_id UUID DEFAULT NULL,
  p_menu_item_id UUID DEFAULT NULL,
  p_dish_name TEXT,
  p_custom_notes TEXT DEFAULT NULL,
  p_meal_time TEXT DEFAULT NULL,
  p_dining_method TEXT DEFAULT 'dine_in',
  p_experienced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_amount_spent DECIMAL DEFAULT NULL,
  p_overall_rating INTEGER,
  p_emotions TEXT[] DEFAULT '{}',
  p_mood_before TEXT DEFAULT NULL,
  p_mood_after TEXT DEFAULT NULL,
  p_satisfaction_level INTEGER DEFAULT NULL,
  p_mouthfeel JSONB DEFAULT '{}',
  p_aroma_notes TEXT[] DEFAULT '{}',
  p_temperature_rating INTEGER DEFAULT NULL,
  p_portion_size TEXT DEFAULT NULL,
  p_dining_companions INTEGER DEFAULT 0,
  p_special_occasion TEXT DEFAULT NULL,
  p_weather TEXT DEFAULT NULL,
  p_photos TEXT[] DEFAULT '{}',
  p_videos TEXT[] DEFAULT '{}',
  p_is_private BOOLEAN DEFAULT FALSE,
  p_shared_with_friends BOOLEAN DEFAULT TRUE,
  p_taste_experience JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  experience_id UUID;
  taste_experience_id UUID;
  result JSON;
BEGIN
  -- Insert food experience
  INSERT INTO public.food_experiences (
    user_id, restaurant_id, menu_item_id, dish_name, custom_notes,
    meal_time, dining_method, experienced_at, amount_spent, overall_rating,
    emotions, mood_before, mood_after, satisfaction_level, mouthfeel,
    aroma_notes, temperature_rating, portion_size, dining_companions,
    special_occasion, weather, photos, videos, is_private, shared_with_friends
  ) VALUES (
    p_user_id, p_restaurant_id, p_menu_item_id, p_dish_name, p_custom_notes,
    p_meal_time, p_dining_method, p_experienced_at, p_amount_spent, p_overall_rating,
    p_emotions, p_mood_before, p_mood_after, p_satisfaction_level, p_mouthfeel,
    p_aroma_notes, p_temperature_rating, p_portion_size, p_dining_companions,
    p_special_occasion, p_weather, p_photos, p_videos, p_is_private, p_shared_with_friends
  ) RETURNING id INTO experience_id;
  
  -- Insert detailed taste experience if provided
  IF p_taste_experience != '{}' THEN
    INSERT INTO public.taste_experiences (
      food_experience_id, saltiness, sweetness, sourness, bitterness, umami,
      crunchiness, creaminess, chewiness, juiciness, temperature, spice_heat,
      aroma_intensity, aroma_descriptors, visual_appeal, color_vibrancy
    ) VALUES (
      experience_id,
      (p_taste_experience->>'saltiness')::INTEGER,
      (p_taste_experience->>'sweetness')::INTEGER,
      (p_taste_experience->>'sourness')::INTEGER,
      (p_taste_experience->>'bitterness')::INTEGER,
      (p_taste_experience->>'umami')::INTEGER,
      (p_taste_experience->>'crunchiness')::INTEGER,
      (p_taste_experience->>'creaminess')::INTEGER,
      (p_taste_experience->>'chewiness')::INTEGER,
      (p_taste_experience->>'juiciness')::INTEGER,
      (p_taste_experience->>'temperature')::INTEGER,
      (p_taste_experience->>'spice_heat')::INTEGER,
      (p_taste_experience->>'aroma_intensity')::INTEGER,
      CASE 
        WHEN p_taste_experience->'aroma_descriptors' IS NOT NULL 
        THEN array(SELECT jsonb_array_elements_text(p_taste_experience->'aroma_descriptors'))
        ELSE '{}'
      END,
      (p_taste_experience->>'visual_appeal')::INTEGER,
      (p_taste_experience->>'color_vibrancy')::INTEGER
    ) RETURNING id INTO taste_experience_id;
  END IF;
  
  -- Update user analytics
  INSERT INTO public.user_analytics (user_id, date, experiences_logged, photos_uploaded)
  VALUES (
    p_user_id, 
    CURRENT_DATE, 
    1, 
    array_length(p_photos, 1) + array_length(p_videos, 1)
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    experiences_logged = user_analytics.experiences_logged + 1,
    photos_uploaded = user_analytics.photos_uploaded + array_length(p_photos, 1) + array_length(p_videos, 1);
  
  -- Update taste profile based on this experience
  PERFORM update_taste_profile_from_experiences(p_user_id);
  
  SELECT json_build_object(
    'success', true,
    'experience_id', experience_id,
    'taste_experience_id', taste_experience_id,
    'message', 'Food experience created successfully'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manage friendships
CREATE OR REPLACE FUNCTION manage_friendship(
  p_requester_id UUID,
  p_addressee_id UUID,
  p_action TEXT -- 'request', 'accept', 'decline', 'block', 'remove'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  existing_friendship public.friendships%ROWTYPE;
BEGIN
  -- Check for existing friendship
  SELECT * INTO existing_friendship
  FROM public.friendships
  WHERE (requester_id = p_requester_id AND addressee_id = p_addressee_id)
     OR (requester_id = p_addressee_id AND addressee_id = p_requester_id);
  
  IF p_action = 'request' THEN
    IF existing_friendship.id IS NOT NULL THEN
      SELECT json_build_object(
        'success', false,
        'message', 'Friendship already exists or pending'
      ) INTO result;
    ELSE
      INSERT INTO public.friendships (requester_id, addressee_id, status)
      VALUES (p_requester_id, p_addressee_id, 'pending');
      
      SELECT json_build_object(
        'success', true,
        'message', 'Friend request sent'
      ) INTO result;
    END IF;
    
  ELSIF p_action = 'accept' THEN
    IF existing_friendship.id IS NOT NULL AND existing_friendship.status = 'pending' THEN
      UPDATE public.friendships
      SET status = 'accepted', updated_at = NOW()
      WHERE id = existing_friendship.id;
      
      SELECT json_build_object(
        'success', true,
        'message', 'Friend request accepted'
      ) INTO result;
    ELSE
      SELECT json_build_object(
        'success', false,
        'message', 'No pending friend request found'
      ) INTO result;
    END IF;
    
  ELSIF p_action = 'decline' THEN
    IF existing_friendship.id IS NOT NULL AND existing_friendship.status = 'pending' THEN
      UPDATE public.friendships
      SET status = 'declined', updated_at = NOW()
      WHERE id = existing_friendship.id;
      
      SELECT json_build_object(
        'success', true,
        'message', 'Friend request declined'
      ) INTO result;
    ELSE
      SELECT json_build_object(
        'success', false,
        'message', 'No pending friend request found'
      ) INTO result;
    END IF;
    
  ELSIF p_action = 'block' THEN
    INSERT INTO public.friendships (requester_id, addressee_id, status)
    VALUES (p_requester_id, p_addressee_id, 'blocked')
    ON CONFLICT (requester_id, addressee_id) DO UPDATE SET
      status = 'blocked', updated_at = NOW();
    
    SELECT json_build_object(
      'success', true,
      'message', 'User blocked'
    ) INTO result;
    
  ELSIF p_action = 'remove' THEN
    IF existing_friendship.id IS NOT NULL THEN
      DELETE FROM public.friendships WHERE id = existing_friendship.id;
      
      SELECT json_build_object(
        'success', true,
        'message', 'Friendship removed'
      ) INTO result;
    ELSE
      SELECT json_build_object(
        'success', false,
        'message', 'No friendship found'
      ) INTO result;
    END IF;
    
  ELSE
    SELECT json_build_object(
      'success', false,
      'message', 'Invalid action'
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to share food experience with friends
CREATE OR REPLACE FUNCTION share_food_experience(
  p_user_id UUID,
  p_experience_id UUID,
  p_friend_ids UUID[],
  p_message TEXT DEFAULT NULL,
  p_recommendation_strength INTEGER DEFAULT 3
)
RETURNS JSON AS $$
DECLARE
  shared_count INTEGER := 0;
  friend_id UUID;
  result JSON;
BEGIN
  -- Verify the user owns this experience
  IF NOT EXISTS (
    SELECT 1 FROM public.food_experiences 
    WHERE id = p_experience_id AND user_id = p_user_id
  ) THEN
    SELECT json_build_object(
      'success', false,
      'message', 'Experience not found or access denied'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Share with each friend
  FOREACH friend_id IN ARRAY p_friend_ids
  LOOP
    -- Verify friendship exists
    IF EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
        AND ((requester_id = p_user_id AND addressee_id = friend_id)
             OR (addressee_id = p_user_id AND requester_id = friend_id))
    ) THEN
      INSERT INTO public.shared_experiences (
        food_experience_id, shared_by, shared_with, message, recommendation_strength
      ) VALUES (
        p_experience_id, p_user_id, friend_id, p_message, p_recommendation_strength
      )
      ON CONFLICT (food_experience_id, shared_by, shared_with) 
      DO UPDATE SET
        message = p_message,
        recommendation_strength = p_recommendation_strength,
        created_at = NOW();
      
      shared_count := shared_count + 1;
    END IF;
  END LOOP;
  
  -- Update analytics
  INSERT INTO public.user_analytics (user_id, date, friends_shared_with)
  VALUES (p_user_id, CURRENT_DATE, shared_count)
  ON CONFLICT (user_id, date) DO UPDATE SET
    friends_shared_with = user_analytics.friends_shared_with + shared_count;
  
  SELECT json_build_object(
    'success', true,
    'shared_count', shared_count,
    'message', 'Experience shared successfully'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or update restaurant review
CREATE OR REPLACE FUNCTION upsert_restaurant_review(
  p_user_id UUID,
  p_restaurant_id UUID,
  p_service_rating INTEGER DEFAULT NULL,
  p_service_notes TEXT DEFAULT NULL,
  p_atmosphere_rating INTEGER DEFAULT NULL,
  p_atmosphere_notes TEXT DEFAULT NULL,
  p_cleanliness_rating INTEGER DEFAULT NULL,
  p_noise_level INTEGER DEFAULT NULL,
  p_parking_availability INTEGER DEFAULT NULL,
  p_kid_friendliness INTEGER DEFAULT NULL,
  p_bathroom_cleanliness INTEGER DEFAULT NULL,
  p_wifi_quality INTEGER DEFAULT NULL,
  p_seating_comfort INTEGER DEFAULT NULL,
  p_overall_restaurant_rating INTEGER DEFAULT NULL,
  p_would_return BOOLEAN DEFAULT NULL,
  p_would_recommend BOOLEAN DEFAULT NULL,
  p_visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_party_size INTEGER DEFAULT 1,
  p_wait_time INTEGER DEFAULT NULL,
  p_reservation_made BOOLEAN DEFAULT FALSE,
  p_is_private BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
  review_id UUID;
  result JSON;
BEGIN
  INSERT INTO public.restaurant_reviews (
    user_id, restaurant_id, service_rating, service_notes, atmosphere_rating,
    atmosphere_notes, cleanliness_rating, noise_level, parking_availability,
    kid_friendliness, bathroom_cleanliness, wifi_quality, seating_comfort,
    overall_restaurant_rating, would_return, would_recommend, visit_date,
    party_size, wait_time, reservation_made, is_private
  ) VALUES (
    p_user_id, p_restaurant_id, p_service_rating, p_service_notes, p_atmosphere_rating,
    p_atmosphere_notes, p_cleanliness_rating, p_noise_level, p_parking_availability,
    p_kid_friendliness, p_bathroom_cleanliness, p_wifi_quality, p_seating_comfort,
    p_overall_restaurant_rating, p_would_return, p_would_recommend, p_visit_date,
    p_party_size, p_wait_time, p_reservation_made, p_is_private
  )
  ON CONFLICT (user_id, restaurant_id) DO UPDATE SET
    service_rating = COALESCE(p_service_rating, restaurant_reviews.service_rating),
    service_notes = COALESCE(p_service_notes, restaurant_reviews.service_notes),
    atmosphere_rating = COALESCE(p_atmosphere_rating, restaurant_reviews.atmosphere_rating),
    atmosphere_notes = COALESCE(p_atmosphere_notes, restaurant_reviews.atmosphere_notes),
    cleanliness_rating = COALESCE(p_cleanliness_rating, restaurant_reviews.cleanliness_rating),
    noise_level = COALESCE(p_noise_level, restaurant_reviews.noise_level),
    parking_availability = COALESCE(p_parking_availability, restaurant_reviews.parking_availability),
    kid_friendliness = COALESCE(p_kid_friendliness, restaurant_reviews.kid_friendliness),
    bathroom_cleanliness = COALESCE(p_bathroom_cleanliness, restaurant_reviews.bathroom_cleanliness),
    wifi_quality = COALESCE(p_wifi_quality, restaurant_reviews.wifi_quality),
    seating_comfort = COALESCE(p_seating_comfort, restaurant_reviews.seating_comfort),
    overall_restaurant_rating = COALESCE(p_overall_restaurant_rating, restaurant_reviews.overall_restaurant_rating),
    would_return = COALESCE(p_would_return, restaurant_reviews.would_return),
    would_recommend = COALESCE(p_would_recommend, restaurant_reviews.would_recommend),
    visit_date = COALESCE(p_visit_date, restaurant_reviews.visit_date),
    party_size = COALESCE(p_party_size, restaurant_reviews.party_size),
    wait_time = COALESCE(p_wait_time, restaurant_reviews.wait_time),
    reservation_made = COALESCE(p_reservation_made, restaurant_reviews.reservation_made),
    is_private = COALESCE(p_is_private, restaurant_reviews.is_private),
    updated_at = NOW()
  RETURNING id INTO review_id;
  
  SELECT json_build_object(
    'success', true,
    'review_id', review_id,
    'message', 'Restaurant review saved successfully'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's feed with friends' activities
CREATE OR REPLACE FUNCTION get_user_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_include_own BOOLEAN DEFAULT TRUE
)
RETURNS JSON AS $$
DECLARE
  feed_items JSON;
BEGIN
  WITH user_friends AS (
    SELECT DISTINCT
      CASE 
        WHEN f.requester_id = p_user_id THEN f.addressee_id
        ELSE f.requester_id
      END as friend_id
    FROM public.friendships f
    WHERE (f.requester_id = p_user_id OR f.addressee_id = p_user_id)
      AND f.status = 'accepted'
  ),
  feed_experiences AS (
    SELECT 
      fe.id as experience_id,
      fe.dish_name,
      fe.custom_notes,
      fe.overall_rating,
      fe.experienced_at,
      fe.photos,
      fe.emotions,
      fe.meal_time,
      up.display_name as user_name,
      up.avatar_url,
      r.name as restaurant_name,
      'food_experience' as item_type,
      fe.created_at as activity_time
    FROM public.food_experiences fe
    JOIN public.user_profiles up ON fe.user_id = up.id
    LEFT JOIN public.restaurants r ON fe.restaurant_id = r.id
    WHERE 
      (fe.user_id IN (SELECT friend_id FROM user_friends) OR 
       (p_include_own AND fe.user_id = p_user_id))
      AND NOT fe.is_private
      AND fe.shared_with_friends
    
    UNION ALL
    
    SELECT 
      se.id::TEXT as experience_id,
      fe.dish_name,
      se.message as custom_notes,
      fe.overall_rating,
      fe.experienced_at,
      fe.photos,
      fe.emotions,
      fe.meal_time,
      up.display_name as user_name,
      up.avatar_url,
      r.name as restaurant_name,
      'shared_experience' as item_type,
      se.created_at as activity_time
    FROM public.shared_experiences se
    JOIN public.food_experiences fe ON se.food_experience_id = fe.id
    JOIN public.user_profiles up ON se.shared_by = up.id
    LEFT JOIN public.restaurants r ON fe.restaurant_id = r.id
    WHERE se.shared_with = p_user_id
  )
  SELECT json_agg(
    json_build_object(
      'experience_id', experience_id,
      'dish_name', dish_name,
      'custom_notes', custom_notes,
      'overall_rating', overall_rating,
      'experienced_at', experienced_at,
      'photos', photos,
      'emotions', emotions,
      'meal_time', meal_time,
      'user_name', user_name,
      'avatar_url', avatar_url,
      'restaurant_name', restaurant_name,
      'item_type', item_type,
      'activity_time', activity_time
    ) ORDER BY activity_time DESC
  ) INTO feed_items
  FROM (
    SELECT * FROM feed_experiences
    ORDER BY activity_time DESC
    LIMIT p_limit OFFSET p_offset
  ) ordered_feed;
  
  RETURN COALESCE(feed_items, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comprehensive user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  WITH user_stats AS (
    SELECT 
      COUNT(DISTINCT fe.id) as total_experiences,
      COUNT(DISTINCT fe.restaurant_id) as restaurants_visited,
      COUNT(DISTINCT DATE(fe.experienced_at)) as days_active,
      AVG(fe.overall_rating) as avg_rating,
      COUNT(CASE WHEN fe.overall_rating >= 4 THEN 1 END) as positive_experiences,
      array_agg(DISTINCT unnest(fe.emotions)) FILTER (WHERE array_length(fe.emotions, 1) > 0) as all_emotions,
      COUNT(CASE WHEN array_length(fe.photos, 1) > 0 THEN 1 END) as experiences_with_photos,
      SUM(array_length(fe.photos, 1)) as total_photos,
      COUNT(DISTINCT extract(month from fe.experienced_at)) as active_months
    FROM public.food_experiences fe
    WHERE fe.user_id = p_user_id
  ),
  friend_stats AS (
    SELECT 
      COUNT(*) as total_friends
    FROM public.friendships f
    WHERE (f.requester_id = p_user_id OR f.addressee_id = p_user_id)
      AND f.status = 'accepted'
  ),
  recent_activity AS (
    SELECT 
      COUNT(*) as experiences_this_week,
      COUNT(DISTINCT fe.restaurant_id) as new_restaurants_this_week
    FROM public.food_experiences fe
    WHERE fe.user_id = p_user_id
      AND fe.experienced_at >= NOW() - INTERVAL '7 days'
  ),
  taste_evolution AS (
    SELECT 
      tp.culinary_adventurousness,
      tp.updated_at as taste_profile_last_updated
    FROM public.taste_profiles tp
    WHERE tp.user_id = p_user_id
  )
  SELECT json_build_object(
    'total_experiences', us.total_experiences,
    'restaurants_visited', us.restaurants_visited,
    'days_active', us.days_active,
    'average_rating', ROUND(us.avg_rating, 2),
    'positive_experience_rate', 
      CASE WHEN us.total_experiences > 0 
           THEN ROUND((us.positive_experiences::DECIMAL / us.total_experiences::DECIMAL) * 100, 1)
           ELSE 0 END,
    'most_common_emotions', 
      (SELECT array_agg(emotion ORDER BY emotion_count DESC)
       FROM (
         SELECT emotion, COUNT(*) as emotion_count
         FROM unnest(us.all_emotions) as emotion
         GROUP BY emotion
         ORDER BY emotion_count DESC
         LIMIT 5
       ) top_emotions),
    'photography_engagement', 
      CASE WHEN us.total_experiences > 0
           THEN ROUND((us.experiences_with_photos::DECIMAL / us.total_experiences::DECIMAL) * 100, 1)
           ELSE 0 END,
    'total_photos', us.total_photos,
    'active_months', us.active_months,
    'total_friends', fs.total_friends,
    'weekly_activity', json_build_object(
      'experiences_this_week', ra.experiences_this_week,
      'new_restaurants_this_week', ra.new_restaurants_this_week
    ),
    'taste_profile', json_build_object(
      'adventurousness_level', te.culinary_adventurousness,
      'last_updated', te.taste_profile_last_updated
    )
  ) INTO stats
  FROM user_stats us
  CROSS JOIN friend_stats fs
  CROSS JOIN recent_activity ra
  LEFT JOIN taste_evolution te ON true;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;