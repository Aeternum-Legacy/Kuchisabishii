-- Comprehensive Seed Data Insertion Script for Kuchisabishii
-- Run this script to populate the database with realistic test data

-- Insert dummy user (this would normally be handled by Supabase Auth)
INSERT INTO public.users (
    id, email, username, display_name, first_name, last_name, bio, profile_image, 
    location, date_of_birth, dietary_restrictions, favorite_cuisines, privacy_level,
    notification_preferences, created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'alex.chen@example.com',
    'alexfoodie', 
    'Alex Chen',
    'Alex',
    'Chen',
    'Food enthusiast exploring Edmonton''s diverse culinary scene. Love trying new cuisines and documenting my taste adventures!',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'Edmonton, Alberta, Canada',
    '1992-03-15',
    ARRAY['gluten-sensitive'],
    ARRAY['Japanese', 'Korean', 'Italian', 'Thai', 'Mexican'],
    'friends',
    '{"food_recommendations": true, "friend_activity": true, "new_followers": true, "review_responses": true, "system_updates": false}',
    '2023-12-01 00:00:00+00',
    '2024-01-15 10:30:00+00'
);

-- Insert user preferences
INSERT INTO public.user_preferences (
    user_id, preferred_cuisines, disliked_cuisines, spice_tolerance, sweetness_preference,
    saltiness_preference, sourness_preference, bitterness_preference, umami_preference,
    dietary_restrictions, allergies, preferred_ingredients, disliked_ingredients,
    preferred_price_range, preferred_atmosphere, preferred_meal_times, max_travel_distance,
    preferred_neighborhoods, prefers_solo_dining, prefers_group_dining, shares_food_often,
    enable_smart_recommendations, recommendation_frequency, include_friend_recommendations,
    include_trending_recommendations, created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '{"Japanese": 9, "Korean": 8, "Italian": 8, "Thai": 7, "Mexican": 7, "Vietnamese": 6, "Indian": 5, "Chinese": 6}',
    ARRAY['overly-spicy-foods'],
    6, 7, 8, 6, 4, 9,
    ARRAY['gluten-sensitive'],
    ARRAY['shellfish'],
    ARRAY['garlic', 'ginger', 'basil', 'cheese', 'avocado'],
    ARRAY['cilantro', 'blue-cheese'],
    ARRAY[2, 3],
    ARRAY['casual', 'cozy', 'trendy'],
    '{"breakfast": "8:00-10:00", "lunch": "12:00-14:00", "dinner": "18:00-21:00"}',
    25,
    ARRAY['Downtown', 'Whyte Avenue', 'Kensington', 'Garneau'],
    false, true, true, true, 'daily', true, true,
    '2023-12-01 00:30:00+00',
    '2024-01-15 11:00:00+00'
);

-- Insert restaurants
INSERT INTO public.restaurants (
    id, name, description, address, city, state, country, postal_code, latitude, longitude,
    phone, email, website, cuisine_types, price_range, rating, review_count, opening_hours,
    delivery_available, takeout_available, reservation_required, photos, amenities,
    is_verified, is_active, created_at, updated_at
) VALUES 
-- Mikado Sushi
('rest-0001-japanese-sushi', 'Mikado Sushi', 
 'Authentic Japanese sushi restaurant with fresh daily catches and traditional preparations',
 '10126 100 Street NW', 'Edmonton', 'Alberta', 'Canada', 'T5J 0P6', 53.5461, -113.4937,
 '+1-780-555-0101', 'info@mikadosushi.ca', 'https://mikadosushi.ca',
 ARRAY['Japanese', 'Sushi', 'Seafood'], 3, 4.6, 127,
 '{"monday": "11:30-21:30", "tuesday": "11:30-21:30", "wednesday": "11:30-21:30", "thursday": "11:30-21:30", "friday": "11:30-22:00", "saturday": "12:00-22:00", "sunday": "12:00-21:00"}',
 true, true, false,
 ARRAY['https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600'],
 ARRAY['wifi', 'parking', 'wheelchair_accessible'], true, true,
 '2023-06-15 00:00:00+00', '2024-01-10 00:00:00+00'),

-- Seoul Kitchen
('rest-0002-korean-bbq', 'Seoul Kitchen',
 'Traditional Korean BBQ and authentic home-style dishes in a warm atmosphere',
 '8215 112 Street NW', 'Edmonton', 'Alberta', 'Canada', 'T6G 1K6', 53.5128, -113.5098,
 '+1-780-555-0102', 'hello@seoulkitchen.ca', 'https://seoulkitchen.ca',
 ARRAY['Korean', 'BBQ', 'Asian'], 2, 4.4, 89,
 '{"monday": "16:00-22:00", "tuesday": "16:00-22:00", "wednesday": "16:00-22:00", "thursday": "16:00-22:00", "friday": "16:00-23:00", "saturday": "15:00-23:00", "sunday": "15:00-21:30"}',
 false, true, true,
 ARRAY['https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600'],
 ARRAY['parking', 'groups_welcome', 'grill_tables'], true, true,
 '2023-08-20 00:00:00+00', '2024-01-05 00:00:00+00'),

-- Nonna's Table
('rest-0003-italian-restaurant', 'Nonna''s Table',
 'Family-owned Italian restaurant serving homemade pasta and traditional recipes passed down through generations',
 '10162 102 Street NW', 'Edmonton', 'Alberta', 'Canada', 'T5J 1L5', 53.5444, -113.4969,
 '+1-780-555-0103', 'reservations@nonnastable.ca', 'https://nonnastable.ca',
 ARRAY['Italian', 'Mediterranean', 'Pasta'], 3, 4.7, 156,
 '{"monday": "17:00-22:00", "tuesday": "17:00-22:00", "wednesday": "17:00-22:00", "thursday": "17:00-22:00", "friday": "17:00-23:00", "saturday": "16:30-23:00", "sunday": "16:30-21:30"}',
 true, true, true,
 ARRAY['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600'],
 ARRAY['romantic_atmosphere', 'wine_list', 'private_dining'], true, true,
 '2023-05-10 00:00:00+00', '2024-01-08 00:00:00+00'),

-- Bangkok Street Food Co.
('truck-0009-thai-street', 'Bangkok Street Food Co.',
 'Authentic Thai street food truck serving pad thai, curries, and fresh spring rolls',
 'Mobile - Various locations', 'Edmonton', 'Alberta', 'Canada', NULL, 53.5444, -113.4909,
 '+1-780-555-0109', 'bangkokstreet@gmail.com', 'https://instagram.com/bangkokstreetyyc',
 ARRAY['Thai', 'Street_Food', 'Mobile'], 2, 4.8, 167,
 '{"monday": "11:00-19:00", "tuesday": "11:00-19:00", "wednesday": "11:00-19:00", "thursday": "11:00-19:00", "friday": "11:00-21:00", "saturday": "12:00-21:00", "sunday": "closed"}',
 false, true, false,
 ARRAY['https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&h=600'],
 ARRAY['outdoor_dining', 'authentic_recipes'], false, true,
 '2023-12-02 00:00:00+00', '2024-01-14 00:00:00+00');

-- Insert food entries
INSERT INTO public.food_entries (
    id, user_id, restaurant_id, title, description, notes, images, category, occasion,
    rating, price, currency, tags, ingredients, cooking_method, spice_level,
    location_name, location_address, location_latitude, location_longitude,
    is_public, allow_comments, calories, protein_grams, carbs_grams, fat_grams,
    consumed_at, created_at, updated_at
) VALUES 
-- Chirashi Bowl
('food-0001-chirashi-bowl', '550e8400-e29b-41d4-a716-446655440000', 'rest-0001-japanese-sushi',
 'Chirashi Bowl - Premium Selection', 
 'Beautiful presentation of fresh sashimi over seasoned sushi rice. The fish quality was exceptional.',
 'The salmon was buttery, tuna had perfect texture, and the tamago added a nice sweet contrast. Definitely coming back for this!',
 ARRAY['https://images.unsplash.com/photo-1563612142-b5906a8dc1de?w=800&h=600', 'https://images.unsplash.com/photo-1559058922-aec55395d41e?w=800&h=600'],
 'lunch', 'casual', 4.8, 28.50, 'CAD',
 ARRAY['fresh', 'sashimi', 'rice', 'authentic', 'high-quality'],
 ARRAY['salmon', 'tuna', 'tamago', 'sushi-rice', 'nori', 'wasabi', 'pickled-ginger'],
 'raw', 1, 'Mikado Sushi', '10126 100 Street NW, Edmonton, AB', 53.5461, -113.4937,
 true, true, 520, 35.2, 48.1, 18.7,
 '2024-01-15 12:30:00+00', '2024-01-15 13:15:00+00', '2024-01-15 13:15:00+00'),

-- Bulgogi BBQ
('food-0002-bulgogi-bbq', '550e8400-e29b-41d4-a716-446655440000', 'rest-0002-korean-bbq',
 'Korean Bulgogi BBQ Set',
 'Traditional marinated beef bulgogi grilled tableside with all the classic banchan sides',
 'The meat was incredibly tender and the marinade had that perfect sweet-savory balance. The kimchi was perfectly fermented - not too sour. Cooking it ourselves at the table made it so much more fun!',
 ARRAY['https://images.unsplash.com/photo-1552909114-f6e3e6d8af41?w=800&h=600'],
 'dinner', 'friends', 4.5, 32.00, 'CAD',
 ARRAY['grilled', 'marinated', 'interactive', 'sharing', 'authentic'],
 ARRAY['beef', 'soy-sauce', 'garlic', 'pear', 'sesame-oil', 'kimchi', 'rice'],
 'grilled', 2, 'Seoul Kitchen', '8215 112 Street NW, Edmonton, AB', 53.5128, -113.5098,
 true, true, 680, 42.8, 35.2, 28.5,
 '2024-01-12 19:15:00+00', '2024-01-12 21:45:00+00', '2024-01-12 21:45:00+00'),

-- Pad Thai
('food-0009-pad-thai', '550e8400-e29b-41d4-a716-446655440000', 'truck-0009-thai-street',
 'Authentic Pad Thai with Shrimp',
 'Classic Thai stir-fried rice noodles with shrimp, egg, bean sprouts, and traditional garnishes',
 'This food truck is a hidden gem! The pad thai tasted exactly like what I had in Bangkok. Perfect balance of sweet, sour, and salty. Shrimp were plump and fresh. The lime and peanuts on the side made it customizable to your taste.',
 ARRAY['https://images.unsplash.com/photo-1559314809-0f31657def5e?w=800&h=600'],
 'lunch', 'casual', 4.7, 14.00, 'CAD',
 ARRAY['authentic', 'sweet-and-sour', 'street-food', 'fresh-shrimp', 'customizable'],
 ARRAY['rice-noodles', 'shrimp', 'egg', 'bean-sprouts', 'tamarind', 'fish-sauce', 'peanuts', 'lime'],
 'stir-fried', 2, 'Bangkok Street Food Co.', 'Mobile - Various locations, Edmonton, AB', 53.5444, -113.4909,
 true, true, 520, 24.6, 68.3, 16.8,
 '2024-01-02 12:45:00+00', '2024-01-02 13:30:00+00', '2024-01-02 13:30:00+00');

-- Insert restaurant reviews
INSERT INTO public.reviews (
    id, user_id, restaurant_id, food_entry_id, title, content, rating,
    food_rating, service_rating, atmosphere_rating, value_rating, photos,
    visit_date, party_size, wait_time_minutes, total_cost, currency,
    recommended_dishes, pros, cons, is_public, allow_responses,
    helpful_count, is_verified, is_featured, is_flagged,
    created_at, updated_at
) VALUES 
-- Mikado Sushi Review
('review-0001-mikado-sushi', '550e8400-e29b-41d4-a716-446655440000', 'rest-0001-japanese-sushi', 'food-0001-chirashi-bowl',
 'Exceptional sushi quality in downtown Edmonton',
 'Mikado consistently delivers restaurant-quality sushi that rivals what you''d find in Vancouver or Toronto. The fish is clearly fresh, rice is properly seasoned, and presentation is beautiful. While pricey, it''s justified by the quality. The atmosphere is calm and authentic without being pretentious. Service was attentive without being intrusive. This is my go-to for special occasions or when I want to treat myself to premium sushi.',
 4.6, 4.8, 4.5, 4.4, 4.2,
 ARRAY['https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600'],
 '2024-01-15', 1, 15, 45.50, 'CAD',
 ARRAY['Chirashi Bowl', 'Salmon Sashimi', 'Spicy Tuna Roll'],
 ARRAY['Fresh fish quality', 'Authentic preparation', 'Beautiful presentation', 'Knowledgeable staff'],
 ARRAY['Premium pricing', 'Limited parking', 'Can get busy during lunch rush'],
 true, true, 0, false, false, false,
 '2024-01-15 14:00:00+00', '2024-01-15 14:00:00+00'),

-- Bangkok Street Food Review  
('review-0005-bangkok-street-food', '550e8400-e29b-41d4-a716-446655440000', 'truck-0009-thai-street', 'food-0009-pad-thai',
 'Authentic Thai street food that rivals Bangkok',
 'This food truck is a hidden gem! The owners clearly know authentic Thai cooking - every dish I''ve tried tastes like what I had traveling in Thailand. The pad thai has that perfect balance of sweet, sour, and salty that''s so hard to find. Shrimp are always fresh and the portions are generous. They move around the city but post their location on Instagram. Worth tracking down for authentic Thai flavors at great prices. Cash only, but there''s usually an ATM nearby.',
 4.8, 4.9, 4.6, 4.2, 4.9,
 ARRAY['https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&h=600'],
 '2024-01-02', 1, 12, 14.00, 'CAD',
 ARRAY['Pad Thai', 'Green Curry', 'Mango Sticky Rice'],
 ARRAY['Authentic flavors', 'Generous portions', 'Great value', 'Fresh ingredients'],
 ARRAY['Mobile location', 'Weather dependent', 'Cash only', 'Limited seating'],
 true, true, 8, false, true, false,
 '2024-01-02 14:00:00+00', '2024-01-02 14:00:00+00');

-- Insert user collections
INSERT INTO public.user_collections (
    id, user_id, name, description, is_public, color, icon, created_at, updated_at
) VALUES 
('collection-0001-date-night', '550e8400-e29b-41d4-a716-446655440000',
 'Perfect Date Night Spots', 'Romantic restaurants for special occasions',
 false, '#FF6B6B', 'heart', '2024-01-01 00:00:00+00', '2024-01-15 00:00:00+00'),
 
('collection-0002-comfort-food', '550e8400-e29b-41d4-a716-446655440000',
 'Ultimate Comfort Foods', 'Foods that make my soul happy',
 true, '#4ECDC4', 'coffee', '2024-01-01 00:00:00+00', '2024-01-15 00:00:00+00'),
 
('collection-0003-hidden-gems', '550e8400-e29b-41d4-a716-446655440000',
 'Hidden Edmonton Gems', 'Lesser-known spots with amazing food',
 true, '#45B7D1', 'star', '2024-01-01 00:00:00+00', '2024-01-15 00:00:00+00');

-- Insert collection items
INSERT INTO public.collection_items (
    id, collection_id, item_type, item_id, notes, created_at
) VALUES 
('collection-item-0001', 'collection-0001-date-night', 'restaurant', 'rest-0003-italian-restaurant',
 'Perfect romantic atmosphere, amazing truffle pasta', '2024-01-10 23:30:00+00'),
 
('collection-item-0002', 'collection-0002-comfort-food', 'food_entry', 'food-0009-pad-thai',
 'Authentic Thai flavors that comfort the soul', '2024-01-02 14:30:00+00'),
 
('collection-item-0003', 'collection-0003-hidden-gems', 'restaurant', 'truck-0009-thai-street',
 'Mobile Thai street food that rivals Bangkok', '2024-01-02 14:30:00+00');

-- Insert user activities
INSERT INTO public.user_activities (
    id, user_id, activity_type, title, description, metadata, is_public, created_at
) VALUES 
('activity-0001-food-entry', '550e8400-e29b-41d4-a716-446655440000', 'food_entry',
 'Tried amazing chirashi bowl', 'Discovered exceptional sushi quality at Mikado Sushi downtown',
 '{"food_entry_id": "food-0001-chirashi-bowl", "restaurant_name": "Mikado Sushi", "rating": 4.8, "cuisine": "Japanese"}',
 true, '2024-01-15 13:15:00+00'),
 
('activity-0002-review', '550e8400-e29b-41d4-a716-446655440000', 'review',
 'Reviewed Bangkok Street Food Co.', 'Shared authentic Thai food truck experience',
 '{"review_id": "review-0005-bangkok-street-food", "restaurant_name": "Bangkok Street Food Co.", "rating": 4.8, "helpful_votes": 8}',
 true, '2024-01-02 14:00:00+00');

-- Insert taste profile history for learning
INSERT INTO public.taste_profile_history (
    id, user_id, food_entry_id, review_id, learned_cuisines, learned_ingredients, learned_flavors,
    interaction_type, confidence_score, created_at
) VALUES 
('taste-history-0001', '550e8400-e29b-41d4-a716-446655440000', 'food-0001-chirashi-bowl', NULL,
 '{"Japanese": {"preference_increase": 0.2, "confidence": 0.85, "specific_items": ["sashimi", "sushi_rice"]}}',
 '{"salmon": {"preference": 9.2, "confidence": 0.9}, "tuna": {"preference": 8.8, "confidence": 0.85}}',
 '{"umami": {"preference": 9.1, "tolerance_increase": 0.1}, "oceanic": {"preference": 8.5, "new_discovery": true}}',
 'positive_rating', 0.87, '2024-01-15 13:15:00+00'),
 
('taste-history-0002', '550e8400-e29b-41d4-a716-446655440000', 'food-0009-pad-thai', NULL,
 '{"Thai": {"preference_increase": 0.3, "confidence": 0.92, "specific_items": ["pad_thai", "tamarind", "fish_sauce"]}}',
 '{"tamarind": {"preference": 8.9, "new_discovery": true}, "fish_sauce": {"preference": 8.2, "confidence": 0.88}}',
 '{"sweet_and_sour": {"preference": 9.0, "tolerance_increase": 0.2}, "authentic_street": {"preference": 9.2, "new_discovery": true}}',
 'very_positive_rating', 0.92, '2024-01-02 13:30:00+00');

-- Insert food pairings for recommendations
INSERT INTO public.food_pairings (
    id, food_item_1, food_item_2, pairing_score, pairing_type, cuisine_context, user_votes, created_at
) VALUES 
('pairing-0001-sushi-sake', 'sashimi', 'sake', 9.2, 'traditional', ARRAY['Japanese'], 145, '2023-12-01 00:00:00+00'),
('pairing-0002-pasta-wine', 'truffle_pasta', 'red_wine', 8.8, 'classic', ARRAY['Italian'], 98, '2023-12-01 00:00:00+00'),
('pairing-0003-tacos-lime', 'carnitas_tacos', 'lime_juice', 9.5, 'essential', ARRAY['Mexican'], 234, '2023-12-01 00:00:00+00'),
('pairing-0004-pad-thai-lime', 'pad_thai', 'lime_wedge', 9.1, 'traditional', ARRAY['Thai'], 187, '2023-12-01 00:00:00+00');

-- Insert restaurant recommendations
INSERT INTO public.restaurant_recommendations (
    id, user_id, restaurant_id, recommendation_type, confidence_score, reasoning,
    was_viewed, was_visited, was_liked, was_dismissed, generated_at, expires_at, created_at
) VALUES 
('rec-0001-ramen-shop', '550e8400-e29b-41d4-a716-446655440000', 'rest-0001-japanese-sushi',
 'similar_cuisine_high_rating', 0.92,
 'Based on your love for authentic Japanese food like the chirashi bowl, you''d enjoy their omakase experience',
 false, false, NULL, false, '2024-01-16 10:00:00+00', '2024-01-23 10:00:00+00', '2024-01-16 10:00:00+00'),
 
('rec-0002-vietnamese-pho', '550e8400-e29b-41d4-a716-446655440000', 'truck-0009-thai-street',
 'flavor_profile_match', 0.78,
 'Your preference for umami-rich broths and your 4.7 rating of Bangkok Street Food suggests you''d enjoy more authentic Asian street food',
 true, false, NULL, false, '2024-01-15 15:00:00+00', '2024-01-22 15:00:00+00', '2024-01-15 15:00:00+00');

COMMIT;