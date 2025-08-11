-- Kuchisabishii Database Seed Data
-- Sample data for development and testing

-- Insert sample users (these would normally be created through auth.users)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', '$2a$10$example_hash', NOW(), NOW(), NOW(), '{"display_name": "Alice Johnson"}'),
('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', '$2a$10$example_hash', NOW(), NOW(), NOW(), '{"display_name": "Bob Smith"}'),
('550e8400-e29b-41d4-a716-446655440003', 'charlie@example.com', '$2a$10$example_hash', NOW(), NOW(), NOW(), '{"display_name": "Charlie Brown"}'),
('550e8400-e29b-41d4-a716-446655440004', 'diana@example.com', '$2a$10$example_hash', NOW(), NOW(), NOW(), '{"display_name": "Diana Prince"}'),
('550e8400-e29b-41d4-a716-446655440005', 'eve@example.com', '$2a$10$example_hash', NOW(), NOW(), NOW(), '{"display_name": "Eve Wilson"}');

-- Insert user profiles
INSERT INTO public.user_profiles (id, username, display_name, bio, location, dietary_restrictions, allergies, spice_tolerance, sweetness_preference, profile_visibility, onboarding_completed, taste_profile_setup) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice_foodie', 'Alice Johnson', 'Food enthusiast and amateur chef who loves trying new cuisines!', 'San Francisco, CA', '{"vegetarian"}', '{"shellfish"}', 8, 6, 'public', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'bob_eats', 'Bob Smith', 'Always hunting for the best burger in town.', 'New York, NY', '{}', '{}', 5, 7, 'friends', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'charlie_chef', 'Charlie Brown', 'Professional chef exploring street food around the world.', 'Austin, TX', '{}', '{"nuts"}', 9, 4, 'public', true, true),
('550e8400-e29b-41d4-a716-446655440004', 'diana_dishes', 'Diana Prince', 'Healthy eating advocate with a sweet tooth.', 'Los Angeles, CA', '{"vegan"}', '{}', 3, 8, 'friends', true, true),
('550e8400-e29b-41d4-a716-446655440005', 'eve_explorer', 'Eve Wilson', 'Food blogger documenting every meal.', 'Seattle, WA', '{"gluten_free"}', '{"gluten"}', 6, 5, 'public', true, true);

-- Insert taste profiles
INSERT INTO public.taste_profiles (user_id, salty_preference, sweet_preference, sour_preference, bitter_preference, umami_preference, crunchy_preference, creamy_preference, chewy_preference, hot_food_preference, cold_food_preference, culinary_adventurousness, cuisine_preferences) VALUES
('550e8400-e29b-41d4-a716-446655440001', 7, 6, 8, 4, 9, 8, 7, 5, 9, 6, 9, '{"italian": 9, "thai": 8, "indian": 7, "mexican": 8}'),
('550e8400-e29b-41d4-a716-446655440002', 8, 7, 5, 3, 6, 9, 5, 7, 8, 4, 6, '{"american": 9, "italian": 7, "bbq": 9, "burgers": 10}'),
('550e8400-e29b-41d4-a716-446655440003', 9, 4, 7, 6, 8, 7, 6, 8, 9, 5, 10, '{"mexican": 10, "korean": 9, "vietnamese": 8, "thai": 9}'),
('550e8400-e29b-41d4-a716-446655440004', 4, 8, 6, 5, 7, 6, 8, 6, 7, 8, 5, '{"mediterranean": 9, "japanese": 8, "healthy": 10, "vegan": 10}'),
('550e8400-e29b-41d4-a716-446655440005', 6, 5, 7, 4, 8, 7, 7, 6, 8, 7, 8, '{"japanese": 9, "french": 8, "bakery": 7, "fusion": 8}');

-- Insert sample restaurants
INSERT INTO public.restaurants (id, name, description, address, city, state, country, cuisine_types, price_range, latitude, longitude, features, verified) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Mama Mia''s Trattoria', 'Authentic Italian cuisine in the heart of North Beach', '123 Columbus Ave', 'San Francisco', 'CA', 'US', '{"italian"}', 2, 37.7749, -122.4194, '{"outdoor_seating", "wine_bar", "romantic"}', true),
('660e8400-e29b-41d4-a716-446655440002', 'The Burger Joint', 'Classic American burgers with a modern twist', '456 5th Ave', 'New York', 'NY', 'US', '{"american", "burgers"}', 2, 40.7589, -73.9851, '{"casual_dining", "takeout", "delivery"}', true),
('660e8400-e29b-41d4-a716-446655440003', 'Spice Kingdom', 'Fiery Thai street food that will awaken your senses', '789 Rainey St', 'Austin', 'TX', 'US', '{"thai", "asian"}', 2, 30.2672, -97.7431, '{"spicy", "vegetarian_options", "outdoor_seating"}', true),
('660e8400-e29b-41d4-a716-446655440004', 'Green Garden Cafe', 'Farm-to-table vegan cuisine with local ingredients', '321 Sunset Blvd', 'Los Angeles', 'CA', 'US', '{"vegan", "healthy", "american"}', 3, 34.0522, -118.2437, '{"vegan", "organic", "wifi", "quiet"}', true),
('660e8400-e29b-41d4-a716-446655440005', 'Sakura Sushi', 'Traditional Japanese sushi and contemporary rolls', '654 Pine St', 'Seattle', 'WA', 'US', '{"japanese", "sushi"}', 3, 47.6062, -122.3321, '{"sushi_bar", "sake", "minimalist", "authentic"}', true),
('660e8400-e29b-41d4-a716-446655440006', 'Taco Libre', 'Mexican street tacos and craft cocktails', '987 Mission St', 'San Francisco', 'CA', 'US', '{"mexican", "street_food"}', 2, 37.7849, -122.4094, '{"happy_hour", "craft_cocktails", "lively"}', false),
('660e8400-e29b-41d4-a716-446655440007', 'Le Petit Bistro', 'Cozy French bistro with seasonal menu', '147 Madison Ave', 'New York', 'NY', 'US', '{"french", "european"}', 4, 40.7505, -73.9934, '{"romantic", "wine_list", "upscale", "intimate"}', true);

-- Insert sample menu items
INSERT INTO public.menu_items (id, restaurant_id, name, description, price, category, spice_level, is_vegetarian, is_vegan, is_gluten_free, ingredients, allergens, calories) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Spaghetti Carbonara', 'Classic Roman pasta with eggs, cheese, pancetta, and black pepper', 18.50, 'main', 1, false, false, false, '{"spaghetti", "eggs", "parmigiano", "pancetta", "black_pepper"}', '{"eggs", "dairy"}', 650),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Margherita Pizza', 'San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil', 16.00, 'main', 1, true, false, false, '{"pizza_dough", "tomatoes", "mozzarella", "basil", "olive_oil"}', '{"dairy", "gluten"}', 520),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'The Classic Burger', 'Angus beef patty, lettuce, tomato, onion, pickles, and secret sauce', 14.00, 'main', 2, false, false, false, '{"beef_patty", "lettuce", "tomato", "onion", "pickles", "bun"}', '{"gluten"}', 720),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Sweet Potato Fries', 'Crispy sweet potato fries with chipotle aioli', 8.50, 'sides', 2, true, false, true, '{"sweet_potato", "chipotle", "mayo"}', '{"eggs"}', 280),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'Pad Thai', 'Stir-fried rice noodles with tofu, bean sprouts, and tamarind sauce', 13.00, 'main', 4, true, true, true, '{"rice_noodles", "tofu", "bean_sprouts", "tamarind", "peanuts"}', '{"peanuts"}', 480),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 'Buddha Bowl', 'Quinoa, roasted vegetables, avocado, and tahini dressing', 15.50, 'main', 1, true, true, true, '{"quinoa", "broccoli", "sweet_potato", "avocado", "tahini"}', '{"sesame"}', 520),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440005', 'Salmon Nigiri', 'Fresh Atlantic salmon over seasoned sushi rice', 6.00, 'sushi', 1, false, false, true, '{"salmon", "sushi_rice", "wasabi", "ginger"}', '{"fish"}', 180),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440006', 'Carnitas Tacos', 'Slow-braised pork shoulder with onions, cilantro, and salsa verde', 3.50, 'main', 3, false, false, true, '{"pork", "onions", "cilantro", "corn_tortilla", "salsa_verde"}', '{}', 250),
('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440007', 'Coq au Vin', 'Braised chicken in red wine with mushrooms and pearl onions', 28.00, 'main', 1, false, false, false, '{"chicken", "red_wine", "mushrooms", "pearl_onions", "herbs"}', '{"sulfites"}', 680);

-- Insert sample food experiences
INSERT INTO public.food_experiences (id, user_id, restaurant_id, menu_item_id, dish_name, custom_notes, meal_time, dining_method, experienced_at, amount_spent, overall_rating, emotions, mood_before, mood_after, satisfaction_level, mouthfeel, aroma_notes, temperature_rating, portion_size, dining_companions, photos, is_private, shared_with_friends) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Spaghetti Carbonara', 'Perfectly creamy and not too salty. The pancetta had great texture!', 'dinner', 'dine_in', NOW() - INTERVAL '3 days', 18.50, 5, '{"satisfied", "happy", "impressed"}', 'hungry', 'content', 9, '{"creamy", "smooth", "rich"}', '{"garlic", "cheese", "pepper"}', 5, 'just_right', 1, '{}', false, true),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'The Classic Burger', 'Juicy patty, fresh ingredients. Secret sauce is really good!', 'lunch', 'dine_in', NOW() - INTERVAL '1 day', 14.00, 4, '{"satisfied", "happy"}', 'hungry', 'full', 8, '{"juicy", "meaty", "crunchy"}', '{"grilled_meat", "fresh_vegetables"}', 4, 'just_right', 2, '{}', false, true),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 'Pad Thai', 'Amazing balance of sweet, sour, and spicy. Perfect texture on the noodles.', 'lunch', 'dine_in', NOW() - INTERVAL '2 days', 13.00, 5, '{"excited", "satisfied", "impressed"}', 'curious', 'elated', 10, '{"chewy", "tender", "crunchy"}', '{"tamarind", "fish_sauce", "lime"}', 4, 'just_right', 0, '{}', false, true),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440006', 'Buddha Bowl', 'Fresh, colorful, and nutritious. The tahini dressing ties everything together.', 'lunch', 'dine_in', NOW() - INTERVAL '1 day', 15.50, 4, '{"energized", "satisfied", "healthy"}', 'sluggish', 'energized', 8, '{"crunchy", "creamy", "fresh"}', '{"sesame", "roasted_vegetables"}', 3, 'just_right', 1, '{}', false, true),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440007', 'Salmon Nigiri', 'Buttery salmon, perfectly seasoned rice. Fresh and delicate.', 'dinner', 'dine_in', NOW() - INTERVAL '4 hours', 24.00, 5, '{"delighted", "sophisticated", "satisfied"}', 'excited', 'content', 9, '{"buttery", "soft", "delicate"}', '{"ocean", "rice_vinegar"}', 2, 'just_right', 1, '{}', false, true);

-- Insert detailed taste experiences
INSERT INTO public.taste_experiences (food_experience_id, saltiness, sweetness, sourness, bitterness, umami, crunchiness, creaminess, chewiness, juiciness, temperature, spice_heat, aroma_intensity, aroma_descriptors, visual_appeal, color_vibrancy) VALUES
('880e8400-e29b-41d4-a716-446655440001', 6, 2, 1, 2, 8, 2, 9, 7, 3, 8, 2, 8, '{"cheese", "garlic", "pepper"}', 7, 6),
('880e8400-e29b-41d4-a716-446655440002', 5, 4, 2, 1, 7, 8, 3, 6, 8, 7, 3, 7, '{"grilled_beef", "vegetables"}', 8, 7),
('880e8400-e29b-41d4-a716-446655440003', 4, 6, 7, 1, 6, 6, 2, 7, 4, 6, 8, 9, '{"tamarind", "lime", "fish_sauce"}', 9, 8),
('880e8400-e29b-41d4-a716-446655440004', 3, 3, 5, 2, 5, 7, 6, 5, 6, 4, 1, 6, '{"tahini", "roasted_vegetables"}', 9, 9),
('880e8400-e29b-41d4-a716-446655440005', 2, 1, 1, 1, 9, 1, 1, 3, 7, 2, 1, 7, '{"ocean", "clean", "rice"}', 10, 5);

-- Insert restaurant reviews
INSERT INTO public.restaurant_reviews (user_id, restaurant_id, service_rating, atmosphere_rating, cleanliness_rating, noise_level, parking_availability, kid_friendliness, bathroom_cleanliness, overall_restaurant_rating, would_return, would_recommend, visit_date, party_size, wait_time, reservation_made) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 5, 4, 5, 2, 3, 3, 4, 5, true, true, NOW() - INTERVAL '3 days', 2, 15, false),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 4, 3, 4, 3, 4, 4, 4, 4, true, true, NOW() - INTERVAL '1 day', 3, 10, false),
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 5, 5, 4, 4, 2, 2, 3, 5, true, true, NOW() - INTERVAL '2 days', 1, 20, false),
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 4, 5, 5, 1, 4, 5, 5, 4, true, true, NOW() - INTERVAL '1 day', 2, 5, true),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', 5, 5, 5, 2, 3, 2, 4, 5, true, true, NOW() - INTERVAL '4 hours', 2, 25, true);

-- Insert friendships
INSERT INTO public.friendships (requester_id, addressee_id, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'accepted', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'accepted', NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'accepted', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'accepted', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'accepted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Insert shared experiences
INSERT INTO public.shared_experiences (food_experience_id, shared_by, shared_with, message, recommendation_strength, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'You have to try this carbonara! It''s incredible!', 5, NOW() - INTERVAL '2 days'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Best Pad Thai in the city. Perfect spice level!', 5, NOW() - INTERVAL '1 day'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Great healthy option, you''ll love the tahini dressing!', 4, NOW() - INTERVAL '12 hours');

-- Insert recommendation preferences
INSERT INTO public.recommendation_preferences (user_id, enable_ai_recommendations, enable_friend_recommendations, enable_location_based, taste_similarity_weight, friend_influence_weight, location_proximity_weight, trending_factor_weight, max_distance_km, price_range_filter) VALUES
('550e8400-e29b-41d4-a716-446655440001', true, true, true, 0.40, 0.30, 0.20, 0.10, 25, '{1,2,3}'),
('550e8400-e29b-41d4-a716-446655440002', true, true, true, 0.35, 0.35, 0.20, 0.10, 30, '{1,2,3,4}'),
('550e8400-e29b-41d4-a716-446655440003', true, true, false, 0.50, 0.30, 0.05, 0.15, 100, '{1,2,3,4}'),
('550e8400-e29b-41d4-a716-446655440004', true, true, true, 0.30, 0.40, 0.20, 0.10, 20, '{1,2,3}'),
('550e8400-e29b-41d4-a716-446655440005', true, true, true, 0.45, 0.25, 0.15, 0.15, 35, '{2,3,4}');

-- Insert user analytics
INSERT INTO public.user_analytics (user_id, date, experiences_logged, photos_uploaded, restaurants_visited, friends_shared_with, app_opens, session_duration_minutes, new_cuisines_tried) VALUES
('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 1, 0, 1, 1, 3, 45, 0),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 1, 0, 1, 0, 2, 30, 0),
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, 1, 0, 1, 1, 4, 60, 0),
('550e8400-e29b-41d4-a716-446655440004', CURRENT_DATE, 1, 0, 1, 1, 2, 25, 0),
('550e8400-e29b-41d4-a716-446655440005', CURRENT_DATE, 1, 0, 1, 0, 5, 75, 0),
('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - 1, 0, 0, 0, 0, 2, 20, 0),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - 1, 1, 0, 1, 0, 1, 15, 0),
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - 1, 0, 0, 0, 0, 3, 40, 0);

-- Insert some search history
INSERT INTO public.search_history (user_id, search_query, search_type, results_count, clicked_result_id, clicked_result_type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'italian restaurant', 'restaurant', 5, '660e8400-e29b-41d4-a716-446655440001', 'restaurant', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440002', 'burger', 'food', 12, '770e8400-e29b-41d4-a716-446655440003', 'menu_item', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440003', 'thai food', 'cuisine', 8, '660e8400-e29b-41d4-a716-446655440003', 'restaurant', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440004', 'vegan', 'general', 15, '660e8400-e29b-41d4-a716-446655440004', 'restaurant', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440005', 'sushi near me', 'restaurant', 6, '660e8400-e29b-41d4-a716-446655440005', 'restaurant', NOW() - INTERVAL '4 hours');

-- Insert some recommendation interactions (showing recommendations were served and some were clicked)
INSERT INTO public.recommendation_interactions (user_id, restaurant_id, recommendation_type, shown_at, clicked, clicked_at, visited, visited_at, recommendation_context) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'friend_shared', NOW() - INTERVAL '1 day', true, NOW() - INTERVAL '23 hours', false, null, '{"shared_by": "Charlie Brown", "recommendation_strength": 5}'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'ai_similar_taste', NOW() - INTERVAL '2 days', false, null, false, null, '{"similarity_score": 0.85}'),
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440007', 'trending', NOW() - INTERVAL '1 day', true, NOW() - INTERVAL '20 hours', true, NOW() - INTERVAL '18 hours', '{"trend_score": 8.7}'),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'location_based', NOW() - INTERVAL '3 hours', false, null, false, null, '{"distance_km": 2.3}');