# Onboarding Skip Workflow - SPARC Specification

## Executive Summary

This specification defines the complete requirements and implementation details for fixing the broken onboarding skip workflow in Kuchisabishii. The current implementation has multiple failure points that result in infinite redirect loops and prevent users from accessing the application.

## Current Problem Analysis

### 🚨 Critical Issues Identified

1. **Database Table Inconsistency**
   - API calls use `'profiles'` table
   - Schema shows both `users` and `user_profiles` tables exist
   - Unclear which table is the source of truth

2. **Authentication Flow Failure**
   - `/api/onboarding/complete` returns 401 Unauthorized
   - Server-side Supabase client not reading session cookies properly
   - User profile doesn't exist in expected table

3. **Redirect Loop**
   - Skip button calls API → API fails → Database not updated → User redirected back to onboarding

4. **Session State Mismatch**
   - Client-side auth state shows user as authenticated
   - Server-side API cannot read session from cookies

## User Story Requirements

### Primary User Story
```
As an authenticated user who wants to skip onboarding
I want to click "Skip for now" and go directly to the dashboard
So that I can access the app without completing the questionnaire

Acceptance Criteria:
✅ Skip button calls API to mark onboarding as complete
✅ Database records onboarding_completed = true  
✅ User is redirected to /app (dashboard)
✅ No further onboarding redirects occur
✅ Skip state persists across sessions
✅ API call succeeds with proper authentication
✅ Works for both OAuth and email/password users
```

### Secondary User Stories

**OAuth User Story**
```
As a Google OAuth user who has just completed authentication
I want to be able to skip onboarding immediately
So that I can access the app without additional setup

Acceptance Criteria:
✅ OAuth callback creates profile record with proper onboarding fields
✅ Skip API works immediately after OAuth completion
✅ No additional authentication steps required
```

**Returning User Story**
```
As a user who previously skipped onboarding
I want to never see the onboarding flow again
So that I can access the app directly

Acceptance Criteria:
✅ onboarding_completed = true persists in database
✅ AuthWrapper checks database state, not localStorage
✅ Direct navigation to /app works without redirects
```

## Technical Requirements

### 1. Database Schema Requirements

#### Table Structure Resolution
```sql
-- DECISION: Use 'profiles' as the single source of truth
-- Migrate all user profile data to 'profiles' table
-- Deprecate 'users' and 'user_profiles' tables

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    location TEXT,
    dietary_restrictions TEXT[],
    allergies TEXT[],
    
    -- Onboarding tracking fields
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    taste_profile_setup BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

#### Data Migration Requirements
```sql
-- 1. Migrate existing user data to profiles table
-- 2. Set onboarding_completed = TRUE for active users
-- 3. Create profiles for OAuth users missing records
-- 4. Add proper indexes for performance
```

### 2. API Endpoint Requirements

#### `/api/onboarding/complete` Specifications

**Request Requirements**
```typescript
// Method: POST
// Headers: 
//   - Content-Type: application/json
//   - Cookie: sb-access-token, sb-refresh-token (from Supabase)
// Body: {} (empty JSON object)
// Authentication: Required (session-based)
```

**Response Requirements**
```typescript
// Success Response (200)
{
  "success": true,
  "message": "Onboarding completed successfully",
  "user": {
    "id": "uuid",
    "onboarding_completed": true,
    "onboarding_completed_at": "2025-08-18T10:30:00Z"
  }
}

// Error Response (401)
{
  "success": false,
  "error": "Not authenticated",
  "code": "UNAUTHORIZED"
}

// Error Response (500)
{
  "success": false,
  "error": "Failed to update onboarding status",
  "code": "DATABASE_ERROR"
}
```

**Implementation Requirements**
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Initialize Supabase server client with proper cookie handling
    const supabase = await createClient()
    
    // 2. Get authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        code: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    // 3. Ensure user profile exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist (OAuth user case)
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.display_name || user.user_metadata?.full_name,
          first_name: user.user_metadata?.first_name || user.user_metadata?.given_name,
          last_name: user.user_metadata?.last_name || user.user_metadata?.family_name,
          profile_image_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })

      if (createError) {
        console.error('Failed to create profile:', createError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create user profile'
        }, { status: 500 })
      }
    } else {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to update onboarding status:', updateError)
        return NextResponse.json({
          success: false,
          error: 'Failed to update onboarding status'
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
```

### 3. Authentication Requirements

#### Session Cookie Handling
```typescript
// Server-side Supabase client MUST read session from cookies
// cookies() function MUST be available in server environment
// Session validation MUST work for both OAuth and email/password users

import { createClient } from '@/lib/supabase/server'

// This function MUST properly read sb-access-token and sb-refresh-token
const supabase = await createClient()
```

#### OAuth Profile Creation
```typescript
// OAuth callback MUST create profile record immediately
// Profile MUST include onboarding_completed field
// Default value MUST allow skipping (true or false based on business logic)

// In /api/auth/callback/google/route.ts
const profileData = {
  id: user.id,
  email: user.email,
  display_name: user.user_metadata?.display_name,
  onboarding_completed: false, // Allow user to choose
  created_at: new Date().toISOString()
}
```

### 4. Client-Side Requirements

#### Skip Button Implementation
```typescript
const handleSkipOnboarding = async () => {
  try {
    // 1. Show confirmation dialog
    const shouldSkip = window.confirm(
      "You can restart the AI Taste Profiling anytime through the Settings menu in your profile.\n\nContinue to skip?"
    )
    
    if (!shouldSkip) return
    
    // 2. Call API to mark onboarding complete
    const response = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()

    if (response.ok && data.success) {
      console.log('Onboarding skipped successfully')
      
      // 3. Redirect to main app
      router.push('/app')
    } else {
      console.error('Failed to skip onboarding:', data.error)
      
      // 4. Show user-friendly error message
      alert('Unable to skip onboarding. Please try again or contact support.')
    }
  } catch (error) {
    console.error('Error skipping onboarding:', error)
    alert('Unable to skip onboarding. Please try again or contact support.')
  }
}
```

#### AuthWrapper Logic Updates
```typescript
// Remove localStorage onboarding tracking
// Use ONLY database state for onboarding decisions
// Fix onboarding check logic

useEffect(() => {
  if (user && !loading) {
    const requiresOnboarding = pathname === '/app' || pathname?.startsWith('/app/')
    
    // Check database state, not localStorage
    if (requiresOnboarding && user.onboardingCompleted !== true) {
      console.log('🔄 User needs onboarding, redirecting to /onboarding')
      router.push('/onboarding')
      return
    }
    
    setOnboardingCheckDone(true)
  }
}, [user, loading, pathname, router])
```

### 5. Database Migration Requirements

#### Immediate Migration Script
```sql
-- File: database/migrations/003_fix_onboarding_skip.sql

BEGIN;

-- 1. Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    location TEXT,
    dietary_restrictions TEXT[],
    allergies TEXT[],
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    taste_profile_setup BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Migrate existing users to profiles table
INSERT INTO public.profiles (
    id, email, display_name, first_name, last_name, 
    profile_image_url, bio, location, dietary_restrictions,
    onboarding_completed, created_at, updated_at
)
SELECT 
    au.id,
    au.email,
    au.user_metadata->>'display_name' as display_name,
    au.user_metadata->>'first_name' as first_name,
    au.user_metadata->>'last_name' as last_name,
    au.user_metadata->>'avatar_url' as profile_image_url,
    NULL as bio,
    NULL as location,
    ARRAY[]::TEXT[] as dietary_restrictions,
    TRUE as onboarding_completed, -- Set existing users as onboarded
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON public.profiles(onboarding_completed) 
WHERE onboarding_completed = FALSE;

-- 4. Add RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

COMMIT;
```

## Testing Requirements

### 1. Unit Tests
```typescript
// Test file: __tests__/api/onboarding/complete.test.ts

describe('/api/onboarding/complete', () => {
  it('should mark onboarding as complete for authenticated user', async () => {
    // Mock authenticated user
    // Call API endpoint
    // Assert database is updated
    // Assert response is correct
  })

  it('should return 401 for unauthenticated user', async () => {
    // Mock unauthenticated request
    // Call API endpoint  
    // Assert 401 response
  })

  it('should create profile for OAuth user if missing', async () => {
    // Mock OAuth user without profile
    // Call API endpoint
    // Assert profile is created
    // Assert onboarding_completed = true
  })
})
```

### 2. Integration Tests
```typescript
// Test file: __tests__/integration/onboarding-skip.test.ts

describe('Onboarding Skip Flow', () => {
  it('should complete full skip workflow', async () => {
    // 1. Authenticate user
    // 2. Navigate to onboarding
    // 3. Click skip button
    // 4. Assert API call succeeds
    // 5. Assert redirect to /app
    // 6. Assert no further onboarding prompts
  })

  it('should persist skip state across sessions', async () => {
    // 1. Complete skip workflow
    // 2. Sign out
    // 3. Sign in again
    // 4. Assert direct access to /app
  })
})
```

### 3. Manual Testing Checklist

#### Test Cases
- [ ] **New OAuth User**: Google sign-in → Skip onboarding → Access /app
- [ ] **New Email User**: Email registration → Skip onboarding → Access /app  
- [ ] **Existing User**: Sign in → No onboarding prompt → Direct /app access
- [ ] **Session Persistence**: Skip onboarding → Sign out → Sign in → Direct /app access
- [ ] **API Error Handling**: Mock API failure → User sees error message → Can retry
- [ ] **Network Failure**: Disconnect internet → Skip fails gracefully → Shows retry option

## Performance Requirements

### 1. API Response Time
- `/api/onboarding/complete` MUST respond within 2 seconds
- Database update MUST be atomic and immediate
- No race conditions between multiple skip attempts

### 2. Database Performance
- Onboarding status queries MUST use proper indexes
- Profile lookup MUST be optimized for frequent access
- Migration MUST complete without downtime

## Security Requirements

### 1. Authentication Security
- NEVER bypass authentication for skip functionality
- ALWAYS validate session before updating onboarding status
- NEVER trust client-side onboarding state only

### 2. Authorization Security
- Users can ONLY update their own onboarding status
- API MUST validate user owns the profile being updated
- No privilege escalation through onboarding skip

### 3. Data Security
- Onboarding completion MUST be logged with timestamp
- Profile creation MUST be auditable
- No sensitive data in skip API responses

## Error Handling Requirements

### 1. Client-Side Error Handling
```typescript
// User-friendly error messages
// Retry mechanisms for transient failures
// Fallback options when API is unavailable
// Clear feedback on skip success/failure
```

### 2. Server-Side Error Handling
```typescript
// Comprehensive error logging
// Graceful degradation for database failures
// Proper HTTP status codes
// Detailed error context for debugging
```

## Rollback Plan

### 1. Database Rollback
```sql
-- Rollback script: database/migrations/003_fix_onboarding_skip_rollback.sql
-- Revert profiles table changes
-- Restore previous user table structure  
-- Reset onboarding_completed values
```

### 2. Code Rollback
- Revert API endpoint changes
- Restore previous skip button implementation
- Re-enable localStorage fallback if needed

## Success Metrics

### 1. Functional Metrics
- ✅ 0% onboarding skip failure rate
- ✅ 100% skip state persistence across sessions
- ✅ < 2 second skip API response time
- ✅ 0% infinite redirect loops

### 2. User Experience Metrics
- ✅ Users can access app immediately after OAuth
- ✅ Skip confirmation provides clear expectations
- ✅ Error messages are actionable and user-friendly
- ✅ No confusion about onboarding status

## Implementation Priority

### Phase 1: Critical Fixes (Day 1)
1. Fix database table inconsistency
2. Repair authentication in `/api/onboarding/complete`
3. Ensure profile exists for OAuth users
4. Test skip workflow end-to-end

### Phase 2: Polish & Testing (Day 2)
1. Add comprehensive error handling
2. Implement user-friendly error messages
3. Add automated tests
4. Performance optimization

### Phase 3: Monitoring (Day 3)
1. Add logging and monitoring
2. Set up alerts for skip failures
3. Analytics on skip vs complete rates
4. User feedback collection

## Conclusion

This specification provides a complete roadmap for fixing the onboarding skip workflow. The key insight is that the current system has fundamental authentication and database consistency issues that must be resolved systematically. 

By implementing these requirements, users will have a seamless experience when choosing to skip onboarding, and the system will maintain proper state across sessions and authentication methods.