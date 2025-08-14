-- Create Test User Script
-- Run this after resetting the database to create fresh test accounts

-- This would typically be done through the Supabase Auth API, but here's the profile data structure

-- Example of creating a fresh user profile after auth signup
-- (The actual auth.users entry is created through Supabase Auth API)

-- Insert Aaron Tong's LinkedIn-based profile
INSERT INTO public.user_profiles (
    id, -- This should match the auth.users.id from Supabase Auth
    username,
    display_name,
    avatar_url,
    bio,
    location,
    dietary_restrictions,
    allergies,
    spice_tolerance,
    sweetness_preference,
    profile_visibility,
    allow_recommendations,
    share_analytics,
    onboarding_completed,
    taste_profile_setup,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- Replace with actual auth user ID
    'aaron_tong_eng',
    'Aaron Tong',
    NULL,
    'My goal in life is to challenge stagnation. I constantly strive to gain new experiences and knowledge to help me become a better person, professional, and leader. Passionate about food experiences that challenge conventional thinking.',
    'Alberta, Canada',
    ARRAY[]::text[],
    ARRAY[]::text[],
    4, -- Moderate spice tolerance
    3, -- Balanced sweetness
    'public',
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
);

-- Insert corresponding taste profile
INSERT INTO public.taste_profiles (
    id,
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
    culinary_adventurousness,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    4, -- Balanced, engineering precision
    3, -- Moderate, not excessive
    3, -- Open to variety
    3, -- Appreciates complexity
    4, -- Sophisticated palate
    4, -- Texture appreciation
    3, -- Balanced approach
    3, -- Moderate preference
    4, -- Alberta winters, warm foods
    2, -- Climate preference for warm foods
    jsonb_build_object(
        'Canadian', 5,
        'Chinese', 4,
        'Japanese', 4,
        'Italian', 4,
        'Steakhouse', 4,
        'Thai', 3,
        'Indian', 3,
        'Mexican', 3
    ),
    3.8, -- Professional but open to growth
    NOW(),
    NOW()
);

-- Verification
SELECT 'Test user profile created successfully' as status;
SELECT username, display_name, location FROM public.user_profiles WHERE username = 'aaron_tong_eng';