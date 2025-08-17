# 🔧 SIMPLE DATABASE FIX - Step by Step

The error shows the column name is different. Let's fix this step by step.

## Step 1: Check Auth Users Table Structure

First, run this in Supabase SQL Editor to see the correct column names:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY column_name;
```

## Step 2: Use the Corrected Migration Script

Use this fixed version: `database/supabase-web-migration-fixed.sql`

**Key Changes:**
- Changed `au.app_metadata` to `au.raw_app_meta_data`
- This should match Supabase's actual column naming

## Step 3: Alternative Simple Fix

If the above still fails, try this minimal fix instead:

```sql
-- MINIMAL FIX: Just ensure existing profiles are marked as onboarded
-- This will stop the redirect loops for current users

-- Add column if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Mark ALL existing profiles as onboarded (simple approach)
UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;

-- Add timestamp column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Set timestamp for newly onboarded users
UPDATE public.profiles 
SET onboarding_completed_at = NOW()
WHERE onboarding_completed_at IS NULL AND onboarding_completed = TRUE;
```

## Step 4: Test the Fix

After running either script:

1. **Check your profile**: Visit your staging app
2. **Try OAuth**: Sign in with Google  
3. **Test skip**: If sent to onboarding, click "Skip for now"
4. **Expected result**: Should land on dashboard without loops

## 🚨 If Still Having Issues

Run this diagnostic query to see what we're working with:

```sql
-- Check current state
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as onboarded_count,
  COUNT(CASE WHEN onboarding_completed = false THEN 1 END) as not_onboarded_count
FROM public.profiles;
```

**The key goal**: Make sure your user's profile has `onboarding_completed = true` to stop redirect loops.