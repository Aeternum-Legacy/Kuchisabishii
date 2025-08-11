-- Development seeding script for Kuchisabishii
-- This script sets up the database with sample data for development and testing

\echo 'Starting development database seeding...'

-- First, clean up any existing sample data (optional - use with caution)
-- TRUNCATE public.food_pairings, public.restaurants CASCADE;

-- Load sample data
\i sample_data.sql

-- Create some additional development-specific data
\echo 'Creating additional development data...'

-- Insert more restaurants for testing pagination and search
INSERT INTO public.restaurants (name, description, address, city, state, country, cuisine_types, price_range, rating, review_count) VALUES
('Dev Café', 'Development testing café', '100 Test St', 'San Francisco', 'CA', 'United States', ARRAY['cafe', 'american'], 1, 3.5, 25),
('Mock Bistro', 'Mock restaurant for testing', '200 Mock Ave', 'San Francisco', 'CA', 'United States', ARRAY['french', 'european'], 3, 4.0, 12),
('Test Kitchen', 'Test restaurant with various cuisines', '300 Test Blvd', 'San Francisco', 'CA', 'United States', ARRAY['fusion', 'international'], 2, 3.8, 45),
('Sample Sushi', 'Sample sushi restaurant', '400 Sample St', 'San Francisco', 'CA', 'United States', ARRAY['japanese', 'sushi'], 3, 4.3, 67),
('Demo Diner', 'Demo American diner', '500 Demo Dr', 'San Francisco', 'CA', 'United States', ARRAY['american', 'diner'], 1, 3.7, 89);

-- Add more food pairings for testing the recommendation system
INSERT INTO public.food_pairings (food_item_1, food_item_2, pairing_score, pairing_type, cuisine_context) VALUES
('apple', 'cheddar', 0.82, 'complementary', ARRAY['american']),
('fig', 'prosciutto', 0.89, 'traditional', ARRAY['italian']),
('mint', 'lamb', 0.84, 'traditional', ARRAY['mediterranean']),
('pineapple', 'ham', 0.65, 'contrasting', ARRAY['american']),
('strawberry', 'balsamic', 0.78, 'innovative', ARRAY['italian']),
('coconut', 'curry', 0.91, 'traditional', ARRAY['thai', 'indian']),
('blue cheese', 'honey', 0.87, 'contrasting', ARRAY['american']),
('rosemary', 'potato', 0.85, 'traditional', ARRAY['italian', 'french']),
('wasabi', 'ginger', 0.88, 'traditional', ARRAY['japanese']),
('cumin', 'coriander', 0.90, 'traditional', ARRAY['indian', 'middle-eastern']);

-- Create some sample user preference templates
-- These can be used when testing user onboarding flows
CREATE TEMP TABLE sample_preferences AS
SELECT 
    'adventurous_foodie' as profile_type,
    '{"japanese": 4.8, "thai": 4.6, "indian": 4.5, "fusion": 4.3}'::jsonb as preferred_cuisines,
    5 as spice_tolerance,
    4 as sweetness_preference,
    ARRAY[]::text[] as dietary_restrictions,
    ARRAY[2,3,4] as preferred_price_range
UNION ALL
SELECT 
    'comfort_food_lover' as profile_type,
    '{"american": 4.9, "italian": 4.7, "french": 4.2, "mexican": 4.0}'::jsonb as preferred_cuisines,
    2 as spice_tolerance,
    4 as sweetness_preference,
    ARRAY[]::text[] as dietary_restrictions,
    ARRAY[1,2,3] as preferred_price_range
UNION ALL
SELECT 
    'healthy_eater' as profile_type,
    '{"mediterranean": 4.8, "japanese": 4.5, "vegetarian": 4.9, "salads": 4.6}'::jsonb as preferred_cuisines,
    3 as spice_tolerance,
    2 as sweetness_preference,
    ARRAY['vegetarian', 'organic'] as dietary_restrictions,
    ARRAY[2,3,4] as preferred_price_range
UNION ALL
SELECT 
    'budget_conscious' as profile_type,
    '{"mexican": 4.5, "thai": 4.3, "american": 4.0, "chinese": 4.2}'::jsonb as preferred_cuisines,
    3 as spice_tolerance,
    3 as sweetness_preference,
    ARRAY[]::text[] as dietary_restrictions,
    ARRAY[1,2] as preferred_price_range;

-- Display sample preference profiles for reference
\echo 'Sample user preference profiles created:'
SELECT profile_type, preferred_cuisines, spice_tolerance, dietary_restrictions 
FROM sample_preferences;

-- Create some sample collection templates
CREATE TEMP TABLE sample_collections AS
SELECT 
    'date_night_spots' as name,
    'Romantic restaurants perfect for date nights' as description,
    '#e91e63' as color,
    'heart' as icon,
    true as is_public
UNION ALL
SELECT 
    'quick_lunch_spots' as name,
    'Fast and delicious lunch options' as description,
    '#4caf50' as color,
    'clock' as icon,
    true as is_public
UNION ALL
SELECT 
    'weekend_brunch' as name,
    'Perfect spots for weekend brunch' as description,
    '#ff9800' as color,
    'coffee' as icon,
    true as is_public
UNION ALL
SELECT 
    'authentic_ethnic' as name,
    'Authentic ethnic restaurants worth trying' as description,
    '#9c27b0' as color,
    'globe' as icon,
    false as is_public;

\echo 'Sample collection templates created:'
SELECT name, description, color, icon FROM sample_collections;

-- Create some sample activity templates
CREATE TEMP TABLE sample_activities AS
SELECT 
    'food_entry' as activity_type,
    'Tried something amazing!' as title,
    'Just discovered a new favorite dish' as description
UNION ALL
SELECT 
    'review' as activity_type,
    'Left a detailed review' as title,
    'Shared my experience at a great restaurant' as description
UNION ALL
SELECT 
    'friendship' as activity_type,
    'Made a new foodie friend!' as title,
    'Connected with someone who shares my taste in food' as description
UNION ALL
SELECT 
    'recommendation' as activity_type,
    'Got a personalized recommendation' as title,
    'The app suggested a perfect restaurant for me' as description;

-- Add some test data for search functionality
INSERT INTO public.restaurants (name, description, address, city, state, country, cuisine_types, price_range, rating, review_count) VALUES
-- For testing search queries
('Pizza Palace Supreme', 'The ultimate pizza destination with wood-fired ovens', '101 Pizza Lane', 'San Francisco', 'CA', 'United States', ARRAY['italian', 'pizza'], 2, 4.4, 156),
('Sushi Zen Garden', 'Peaceful sushi experience with meditation room', '202 Zen Way', 'San Francisco', 'CA', 'United States', ARRAY['japanese', 'sushi'], 4, 4.7, 89),
('Taco Fiesta Grande', 'Vibrant Mexican cantina with live mariachi', '303 Fiesta Blvd', 'San Francisco', 'CA', 'United States', ARRAY['mexican', 'cantina'], 2, 4.2, 234),
('Burger Heaven Deluxe', 'Gourmet burgers that taste like heaven', '404 Heaven St', 'San Francisco', 'CA', 'United States', ARRAY['american', 'burgers'], 2, 4.1, 178),
('Pasta Perfection Place', 'Perfect pasta every time, guaranteed', '505 Perfect Ave', 'San Francisco', 'CA', 'United States', ARRAY['italian', 'pasta'], 3, 4.5, 123);

-- Create development helper functions
CREATE OR REPLACE FUNCTION dev_create_sample_user_data(sample_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Create sample preferences
    INSERT INTO public.user_preferences (
        user_id, 
        preferred_cuisines, 
        spice_tolerance, 
        dietary_restrictions, 
        preferred_price_range
    ) VALUES (
        sample_user_id,
        '{"japanese": 4.5, "italian": 4.2, "mexican": 3.8}'::jsonb,
        3,
        ARRAY[]::text[],
        ARRAY[1,2,3]
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Create sample collections
    INSERT INTO public.user_collections (user_id, name, description, color, icon, is_public)
    SELECT 
        sample_user_id,
        name,
        description,
        color,
        icon,
        is_public
    FROM sample_collections;
    
    RAISE NOTICE 'Sample data created for user %', sample_user_id;
END;
$$ language 'plpgsql';

-- Create a function to reset development data
CREATE OR REPLACE FUNCTION dev_reset_sample_data()
RETURNS VOID AS $$
BEGIN
    -- Clean up test data (be careful with this in production!)
    DELETE FROM public.food_pairings WHERE user_votes < 100;  -- Remove test pairings
    DELETE FROM public.restaurants WHERE name LIKE 'Dev %' OR name LIKE 'Mock %' OR name LIKE 'Test %' OR name LIKE 'Sample %' OR name LIKE 'Demo %';
    
    -- Re-insert sample data
    PERFORM 1; -- Placeholder for re-inserting data if needed
    
    RAISE NOTICE 'Development data reset completed';
END;
$$ language 'plpgsql';

-- Create indexes for better development performance
CREATE INDEX IF NOT EXISTS idx_restaurants_dev_search 
ON public.restaurants USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')))
WHERE name LIKE '%Test%' OR name LIKE '%Dev%' OR name LIKE '%Sample%';

\echo 'Development seeding completed successfully!'
\echo 'Available helper functions:'
\echo '  - dev_create_sample_user_data(user_id) - Create sample data for a user'
\echo '  - dev_reset_sample_data() - Reset development sample data'
\echo ''
\echo 'Sample restaurants added: ' 
SELECT COUNT(*) FROM public.restaurants;
\echo 'Sample food pairings added: '
SELECT COUNT(*) FROM public.food_pairings;