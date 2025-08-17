# Supabase Database Setup Guide

Complete database configuration guide for Kuchisabishii OAuth implementation with native Supabase authentication.

## 📋 Database Schema Overview

The Kuchisabishii app requires specific database tables and configurations to support:
- User profiles with OAuth metadata
- Row Level Security (RLS) policies  
- Authentication triggers
- Storage configuration

## 🗄️ Core Schema Setup

### 1. Profiles Table

The `profiles` table stores user data from OAuth providers and extends Supabase's `auth.users` table:

```sql
-- Drop existing table if rebuilding
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    location TEXT,
    dietary_restrictions TEXT[],
    privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'private')),
    onboarding_completed BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_level ON public.profiles(privacy_level);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Updated Timestamp Trigger

```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 🔐 Row Level Security Policies

### Profiles Table Policies

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

-- Users can view public profiles and friend profiles
CREATE POLICY "Users can view public profiles" ON public.profiles
    FOR SELECT USING (
        id = auth.uid() OR 
        privacy_level = 'public' OR
        (privacy_level = 'friends' AND EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE (f.requester_id = auth.uid() AND f.addressee_id = profiles.id)
               OR (f.addressee_id = auth.uid() AND f.requester_id = profiles.id)
            AND f.status = 'accepted'
        ))
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile (for auth trigger)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Service role can manage all profiles (for admin operations)
CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');
```

## 🔄 Authentication Triggers

### New User Profile Creation

```sql
-- Function to handle new user registration from OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        first_name,
        last_name,
        profile_image_url,
        email_verified,
        privacy_level,
        onboarding_completed
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'profile_image_url',
        COALESCE((NEW.raw_user_meta_data->>'email_verified')::boolean, true), -- OAuth emails are verified
        'friends', -- Default privacy level
        false -- Require onboarding completion
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, update it instead
        UPDATE public.profiles SET
            email = NEW.email,
            display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', display_name),
            first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
            last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
            profile_image_url = COALESCE(NEW.raw_user_meta_data->>'profile_image_url', profile_image_url),
            email_verified = COALESCE((NEW.raw_user_meta_data->>'email_verified')::boolean, email_verified),
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Failed to create/update profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Profile Update Trigger

```sql
-- Function to sync auth.users changes with profiles
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile when auth.users is updated
    UPDATE public.profiles SET
        email = NEW.email,
        display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', display_name),
        first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
        last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
        profile_image_url = COALESCE(NEW.raw_user_meta_data->>'profile_image_url', profile_image_url),
        email_verified = COALESCE((NEW.raw_user_meta_data->>'email_verified')::boolean, email_verified),
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to update profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth.users updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
```

## 📁 Storage Configuration

### Storage Buckets Setup

```sql
-- Create storage bucket for user uploads (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for public content (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-content', 'public-content', true)
ON CONFLICT (id) DO NOTHING;
```

### Storage Policies

```sql
-- User uploads bucket policies
CREATE POLICY "Users can upload own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Public content bucket policies
CREATE POLICY "Anyone can view public content" ON storage.objects
    FOR SELECT USING (bucket_id = 'public-content');

CREATE POLICY "Service role can manage public content" ON storage.objects
    FOR ALL USING (
        bucket_id = 'public-content' AND
        auth.role() = 'service_role'
    );
```

## 🔧 Utility Functions

### Profile Management Functions

```sql
-- Function to get user profile by ID
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS JSON AS $$
DECLARE
    profile_data JSON;
BEGIN
    SELECT row_to_json(p.*) INTO profile_data
    FROM public.profiles p
    WHERE p.id = user_id;
    
    RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if onboarding is completed
CREATE OR REPLACE FUNCTION public.is_onboarding_completed(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    completed BOOLEAN;
BEGIN
    SELECT onboarding_completed INTO completed
    FROM public.profiles
    WHERE id = user_id;
    
    RETURN COALESCE(completed, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(
    user_id UUID,
    dietary_restrictions TEXT[] DEFAULT NULL,
    location_data TEXT DEFAULT NULL,
    bio_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.profiles SET
        onboarding_completed = true,
        dietary_restrictions = COALESCE(complete_onboarding.dietary_restrictions, profiles.dietary_restrictions),
        location = COALESCE(location_data, location),
        bio = COALESCE(bio_text, bio),
        updated_at = timezone('utc'::text, now())
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 Performance Optimizations

### Additional Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_privacy 
    ON public.profiles(onboarding_completed, privacy_level);

CREATE INDEX IF NOT EXISTS idx_profiles_email_verified 
    ON public.profiles(email_verified) WHERE email_verified = true;

-- Partial indexes for active users
CREATE INDEX IF NOT EXISTS idx_profiles_active_users 
    ON public.profiles(id, created_at) 
    WHERE onboarding_completed = true;
```

### Performance Functions

```sql
-- Function to efficiently check user existence
CREATE OR REPLACE FUNCTION public.user_exists(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM public.profiles WHERE email = user_email);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get profile with caching considerations
CREATE OR REPLACE FUNCTION public.get_profile_for_auth(user_id UUID)
RETURNS TABLE(
    id UUID,
    email TEXT,
    display_name TEXT,
    profile_image_url TEXT,
    onboarding_completed BOOLEAN,
    privacy_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.display_name, p.profile_image_url, 
           p.onboarding_completed, p.privacy_level
    FROM public.profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

## 🔍 Testing & Verification

### Verification Queries

```sql
-- 1. Check if profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 3. Check policies
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 4. Check triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'profiles';

-- 5. Check storage buckets
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets;

-- 6. Test profile creation (run as authenticated user)
SELECT public.handle_new_user();
```

### Test Data Cleanup

```sql
-- Clean up test data (BE CAREFUL!)
-- DELETE FROM auth.users WHERE email LIKE '%test%';
-- DELETE FROM public.profiles WHERE email LIKE '%test%';
```

## 🚨 Security Considerations

### Important Security Notes

1. **RLS Enforcement**: Always ensure RLS is enabled on all user data tables
2. **Service Role Usage**: Only use service role key for admin operations
3. **Data Validation**: Implement client-side and server-side validation
4. **Privacy Levels**: Respect user privacy settings in all queries
5. **Sensitive Data**: Never store passwords or tokens in profiles table

### Security Verification Checklist

- [ ] RLS enabled on all user tables
- [ ] Policies prevent unauthorized data access
- [ ] Triggers handle edge cases gracefully
- [ ] Storage policies restrict file access appropriately
- [ ] Functions use SECURITY DEFINER appropriately
- [ ] No sensitive data in client-accessible fields
- [ ] Email verification properly tracked

This database setup provides a robust foundation for OAuth authentication with proper security, performance, and data integrity considerations.