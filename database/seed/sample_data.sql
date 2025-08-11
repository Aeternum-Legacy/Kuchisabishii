-- Sample data for Kuchisabishii development and testing
-- This file contains realistic sample data for development purposes

-- Insert sample restaurants
INSERT INTO public.restaurants (id, name, description, address, city, state, country, postal_code, latitude, longitude, phone, email, website, cuisine_types, price_range, rating, review_count, opening_hours, delivery_available, takeout_available, photos, amenities, is_verified) VALUES

-- Japanese Restaurants
('550e8400-e29b-41d4-a716-446655440001', 'Sakura Sushi Bar', 'Authentic Japanese sushi and sashimi with fresh ingredients flown in daily', '123 Main St', 'San Francisco', 'CA', 'United States', '94102', 37.7749, -122.4194, '+1-415-555-0123', 'info@sakurasushi.com', 'https://sakurasushi.com', ARRAY['japanese', 'sushi'], 3, 4.5, 127, '{"monday": {"open": "17:00", "close": "22:00"}, "tuesday": {"open": "17:00", "close": "22:00"}, "wednesday": {"open": "17:00", "close": "22:00"}, "thursday": {"open": "17:00", "close": "22:00"}, "friday": {"open": "17:00", "close": "23:00"}, "saturday": {"open": "17:00", "close": "23:00"}, "sunday": {"closed": true}}'::jsonb, false, true, ARRAY['https://example.com/sakura1.jpg', 'https://example.com/sakura2.jpg'], ARRAY['wifi', 'wheelchair_accessible'], true),

('550e8400-e29b-41d4-a716-446655440002', 'Ramen Yokocho', 'Traditional ramen house serving authentic tonkotsu and miso ramen', '456 Castro St', 'San Francisco', 'CA', 'United States', '94114', 37.7619, -122.4350, '+1-415-555-0124', 'hello@ramenyokocho.com', 'https://ramenyokocho.com', ARRAY['japanese', 'ramen'], 2, 4.3, 89, '{"monday": {"open": "11:30", "close": "21:00"}, "tuesday": {"open": "11:30", "close": "21:00"}, "wednesday": {"open": "11:30", "close": "21:00"}, "thursday": {"open": "11:30", "close": "21:00"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"open": "12:00", "close": "21:00"}}'::jsonb, true, true, ARRAY['https://example.com/ramen1.jpg'], ARRAY['wifi'], true),

-- Italian Restaurants
('550e8400-e29b-41d4-a716-446655440003', 'Nonna''s Kitchen', 'Family-owned Italian restaurant serving homemade pasta and traditional recipes', '789 Union St', 'San Francisco', 'CA', 'United States', '94133', 37.8008, -122.4104, '+1-415-555-0125', 'ciao@nonnaskitchen.com', 'https://nonnaskitchen.com', ARRAY['italian', 'pasta'], 2, 4.4, 156, '{"monday": {"open": "17:00", "close": "22:00"}, "tuesday": {"open": "17:00", "close": "22:00"}, "wednesday": {"open": "17:00", "close": "22:00"}, "thursday": {"open": "17:00", "close": "22:00"}, "friday": {"open": "17:00", "close": "23:00"}, "saturday": {"open": "16:00", "close": "23:00"}, "sunday": {"open": "16:00", "close": "22:00"}}'::jsonb, true, true, ARRAY['https://example.com/nonna1.jpg', 'https://example.com/nonna2.jpg'], ARRAY['wifi', 'outdoor_seating'], true),

('550e8400-e29b-41d4-a716-446655440004', 'Pizza Napoletana', 'Wood-fired Neapolitan pizza with imported Italian ingredients', '321 Columbus Ave', 'San Francisco', 'CA', 'United States', '94133', 37.8017, -122.4077, '+1-415-555-0126', 'info@pizzanapoletana.com', 'https://pizzanapoletana.com', ARRAY['italian', 'pizza'], 2, 4.6, 203, '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "12:00", "close": "22:00"}}'::jsonb, true, true, ARRAY['https://example.com/pizza1.jpg'], ARRAY['wifi', 'wheelchair_accessible', 'outdoor_seating'], true),

-- Mexican Restaurants
('550e8400-e29b-41d4-a716-446655440005', 'La Taqueria Auténtica', 'Authentic Mexican tacos and street food with fresh salsas made daily', '654 Mission St', 'San Francisco', 'CA', 'United States', '94105', 37.7879, -122.4074, '+1-415-555-0127', 'hola@lataqueria.com', 'https://lataqueria.com', ARRAY['mexican', 'tacos'], 1, 4.7, 342, '{"monday": {"open": "10:00", "close": "22:00"}, "tuesday": {"open": "10:00", "close": "22:00"}, "wednesday": {"open": "10:00", "close": "22:00"}, "thursday": {"open": "10:00", "close": "22:00"}, "friday": {"open": "10:00", "close": "23:00"}, "saturday": {"open": "9:00", "close": "23:00"}, "sunday": {"open": "9:00", "close": "22:00"}}'::jsonb, true, true, ARRAY['https://example.com/taqueria1.jpg'], ARRAY['wifi'], true),

-- Thai Restaurant
('550e8400-e29b-41d4-a716-446655440006', 'Bangkok Garden', 'Traditional Thai cuisine with authentic spices and fresh ingredients', '987 Geary Blvd', 'San Francisco', 'CA', 'United States', '94109', 37.7866, -122.4263, '+1-415-555-0128', 'info@bangkokgarden.com', 'https://bangkokgarden.com', ARRAY['thai', 'asian'], 2, 4.2, 78, '{"monday": {"open": "11:00", "close": "21:30"}, "tuesday": {"open": "11:00", "close": "21:30"}, "wednesday": {"open": "11:00", "close": "21:30"}, "thursday": {"open": "11:00", "close": "21:30"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"open": "12:00", "close": "21:30"}}'::jsonb, true, true, ARRAY['https://example.com/thai1.jpg'], ARRAY['wifi', 'wheelchair_accessible'], true),

-- American Restaurant
('550e8400-e29b-41d4-a716-446655440007', 'The Burger Joint', 'Gourmet burgers with locally sourced ingredients and craft beer', '147 Valencia St', 'San Francisco', 'CA', 'United States', '94103', 37.7670, -122.4210, '+1-415-555-0129', 'info@burgerjoint.com', 'https://burgerjoint.com', ARRAY['american', 'burgers'], 2, 4.1, 167, '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "10:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "22:00"}}'::jsonb, true, true, ARRAY['https://example.com/burger1.jpg'], ARRAY['wifi', 'outdoor_seating', 'parking'], true),

-- French Restaurant
('550e8400-e29b-41d4-a716-446655440008', 'Bistro Lumière', 'Classic French bistro with seasonal menu and extensive wine selection', '258 Fillmore St', 'San Francisco', 'CA', 'United States', '94117', 37.7749, -122.4312, '+1-415-555-0130', 'bonjour@bistrolumiere.com', 'https://bistrolumiere.com', ARRAY['french', 'bistro'], 3, 4.5, 94, '{"monday": {"closed": true}, "tuesday": {"open": "17:30", "close": "22:00"}, "wednesday": {"open": "17:30", "close": "22:00"}, "thursday": {"open": "17:30", "close": "22:00"}, "friday": {"open": "17:30", "close": "23:00"}, "saturday": {"open": "17:30", "close": "23:00"}, "sunday": {"open": "17:30", "close": "22:00"}}'::jsonb, false, false, ARRAY['https://example.com/bistro1.jpg', 'https://example.com/bistro2.jpg'], ARRAY['wifi', 'wheelchair_accessible', 'outdoor_seating'], true);

-- Insert sample food pairings
INSERT INTO public.food_pairings (food_item_1, food_item_2, pairing_score, pairing_type, cuisine_context, user_votes) VALUES
('salmon', 'avocado', 0.9, 'complementary', ARRAY['japanese', 'sushi'], 45),
('tomato', 'basil', 0.95, 'traditional', ARRAY['italian', 'mediterranean'], 67),
('chocolate', 'coffee', 0.88, 'complementary', ARRAY['dessert', 'american'], 89),
('lime', 'cilantro', 0.87, 'traditional', ARRAY['mexican', 'thai'], 34),
('garlic', 'butter', 0.92, 'traditional', ARRAY['french', 'italian'], 78),
('ginger', 'soy sauce', 0.85, 'complementary', ARRAY['japanese', 'chinese'], 23),
('lemon', 'thyme', 0.83, 'complementary', ARRAY['french', 'mediterranean'], 19),
('chili', 'lime', 0.86, 'traditional', ARRAY['mexican', 'thai'], 41),
('parmesan', 'truffle', 0.91, 'complementary', ARRAY['italian', 'french'], 56),
('mango', 'chili', 0.79, 'contrasting', ARRAY['thai', 'indian'], 12);

-- Note: Sample users, food entries, and reviews would typically be inserted through the application
-- since they require actual authentication and proper user IDs from Supabase Auth.
-- The following are example structures that could be used for seeding with test accounts:

-- Sample user preferences (these would be created after users sign up)
-- INSERT INTO public.user_preferences (user_id, preferred_cuisines, spice_tolerance, dietary_restrictions, preferred_price_range) VALUES
-- ('user-uuid-1', '{"japanese": 4.5, "italian": 4.2, "mexican": 3.8}'::jsonb, 4, ARRAY['vegetarian'], ARRAY[2, 3]),
-- ('user-uuid-2', '{"thai": 4.8, "indian": 4.3, "french": 3.9}'::jsonb, 5, ARRAY[], ARRAY[1, 2, 3, 4]);

-- Sample food entries (these would be created by authenticated users)
-- INSERT INTO public.food_entries (user_id, restaurant_id, title, description, rating, category, tags, ingredients, images) VALUES
-- ('user-uuid-1', '550e8400-e29b-41d4-a716-446655440001', 'Amazing Chirashi Bowl', 'Fresh assorted sashimi over sushi rice', 4.5, 'lunch', ARRAY['fresh', 'sashimi', 'rice'], ARRAY['tuna', 'salmon', 'rice', 'wasabi'], ARRAY['https://example.com/chirashi.jpg']),
-- ('user-uuid-2', '550e8400-e29b-41d4-a716-446655440003', 'Perfect Carbonara', 'Creamy pasta with pancetta and egg', 5.0, 'dinner', ARRAY['pasta', 'creamy', 'authentic'], ARRAY['spaghetti', 'pancetta', 'egg', 'parmesan'], ARRAY['https://example.com/carbonara.jpg']);

-- Sample reviews (these would be created by authenticated users)
-- INSERT INTO public.reviews (user_id, restaurant_id, title, content, rating, food_rating, service_rating, atmosphere_rating, visit_date) VALUES
-- ('user-uuid-1', '550e8400-e29b-41d4-a716-446655440001', 'Exceptional Sushi Experience', 'The fish was incredibly fresh and the chef was very skilled. Will definitely come back!', 4.5, 5.0, 4.5, 4.0, '2024-01-15'),
-- ('user-uuid-2', '550e8400-e29b-41d4-a716-446655440003', 'Like Being in Italy', 'Nonna''s pasta is absolutely incredible. The atmosphere reminds me of my trip to Rome.', 4.8, 5.0, 4.5, 5.0, '2024-01-10');

-- Create some sample activities (these would typically be generated by triggers)
-- INSERT INTO public.user_activities (user_id, activity_type, title, description, metadata) VALUES
-- ('user-uuid-1', 'food_entry', 'Tried Amazing Sushi', 'Just had an incredible chirashi bowl!', '{"restaurant_id": "550e8400-e29b-41d4-a716-446655440001", "rating": 4.5}'::jsonb),
-- ('user-uuid-2', 'review', 'Reviewed Italian Restaurant', 'Left a great review for Nonna''s Kitchen', '{"restaurant_id": "550e8400-e29b-41d4-a716-446655440003", "rating": 4.8}'::jsonb);

-- Insert some sample taste profile learning data
-- This would normally be generated by the application when users interact with food
INSERT INTO public.taste_profile_history (user_id, interaction_type, learned_cuisines, confidence_score) VALUES
-- Sample data that would be created when real users interact with the system
('00000000-0000-0000-0000-000000000001', 'rating', '{"cuisines": ["japanese"], "rating": 4.5}'::jsonb, 0.8),
('00000000-0000-0000-0000-000000000002', 'rating', '{"cuisines": ["italian"], "rating": 4.8}'::jsonb, 0.9);

-- Create a sample cleanup job for expired recommendations
-- This would typically be run as a cron job
-- SELECT cleanup_expired_recommendations();