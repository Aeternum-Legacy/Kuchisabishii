-- IMMEDIATE ONBOARDING SKIP FIX
-- Run this in Supabase SQL Editor to fix the onboarding skip issue

-- Step 1: Ensure the user has a profile record
-- Replace 'YOUR_USER_ID' with the actual user ID: 4c46d741-f309-4730-85bc-08819c92847b
INSERT INTO public.profiles (
  id, 
  email, 
  onboarding_completed, 
  onboarding_completed_at,
  created_at, 
  updated_at
)
SELECT 
  au.id,
  au.email,
  TRUE, -- Mark as onboarded since they want to skip
  NOW(),
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.id = '4c46d741-f309-4730-85bc-08819c92847b'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );

-- Step 2: Update existing profile if it exists
UPDATE public.profiles 
SET 
  onboarding_completed = TRUE,
  onboarding_completed_at = COALESCE(onboarding_completed_at, NOW()),
  updated_at = NOW()
WHERE id = '4c46d741-f309-4730-85bc-08819c92847b';

-- Step 3: Verify the fix
SELECT 
  au.id,
  au.email,
  au.created_at,
  p.onboarding_completed,
  p.onboarding_completed_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.id = '4c46d741-f309-4730-85bc-08819c92847b';