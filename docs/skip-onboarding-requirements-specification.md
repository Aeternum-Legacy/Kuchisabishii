# Skip Onboarding Requirements Specification
## SPARC Specification Agent - Functional Requirements Analysis

### EXECUTIVE SUMMARY

**VIOLATION TYPE**: Critical User Journey Failure  
**IMPACT**: Primary onboarding flow completely broken - users trapped in infinite redirect loop  
**ROOT CAUSE**: Database table inconsistency + missing database state management  
**SEVERITY**: Production-blocking (P0)

---

## FUNCTIONAL REQUIREMENT ANALYSIS

### 1. USER STORY SPECIFICATION

**Primary User Story:**
```
As a new user who has completed OAuth authentication,
I want to skip the taste profiling questionnaire,
So that I can immediately access the main application dashboard
Without being forced to complete onboarding steps.
```

**Acceptance Criteria:**
- ✅ User clicks "Skip for now" button
- ❌ Database `onboarding_completed` field updated to `true`
- ❌ User redirected to `/app` (home dashboard)
- ❌ User can access full application features
- ❌ User is not redirected back to onboarding

### 2. CURRENT IMPLEMENTATION ANALYSIS

**Broken Flow Pattern:**
```mermaid
graph TD
    A[OAuth Success] --> B[User lands on /onboarding]
    B --> C[User clicks 'Skip for now']
    C --> D[handleSkipOnboarding function called]
    D --> E[API call to /api/onboarding/complete]
    E --> F[Database update to 'profiles' table]
    F --> G[router.push('/app')]
    G --> H[AuthWrapper checks onboarding status]
    H --> I[Queries WRONG TABLE user_profiles]
    I --> J[No record found OR onboarding_completed = false]
    J --> K[Redirects BACK to /onboarding]
    K --> B
    
    style B fill:#ff9999
    style K fill:#ff9999
    style I fill:#ffcccc
```

### 3. DATABASE ARCHITECTURE INCONSISTENCIES

#### Issue 1: Dual Table Architecture
The system has conflicting table structures:

**Table 1: `public.users` (referenced as `profiles`)**
- Used by: OAuth callback, `/api/auth/me`, `/api/onboarding/complete`
- `onboarding_completed BOOLEAN DEFAULT true NOT NULL`
- Primary authentication table

**Table 2: `public.user_profiles`**
- Used by: Profile API, User dashboard components
- `onboarding_completed BOOLEAN DEFAULT false`
- Extended profile data table

#### Issue 2: API Endpoint Inconsistency
```typescript
// OAuth creates profile in 'profiles' table
'/api/auth/callback/google' → profiles.onboarding_completed = true

// Skip onboarding updates 'profiles' table  
'/api/onboarding/complete' → profiles.onboarding_completed = true

// AuthWrapper checks 'user_profiles' table
'/api/auth/me' → profiles table (correct)
AuthWrapper → checks user.onboardingCompleted from profiles

// BUT dashboard components may check user_profiles
Dashboard components → user_profiles.onboarding_completed = false
```

### 4. REQUIREMENTS SPECIFICATION

#### 4.1 Database State Requirements

**R1: Single Source of Truth**
- MUST use consistent table for onboarding status across all APIs
- MUST NOT have conflicting default values between tables
- MUST ensure atomic updates to onboarding status

**R2: Skip Onboarding Database Transaction**
```sql
-- Required database state change
UPDATE profiles 
SET 
  onboarding_completed = true,
  onboarding_completed_at = NOW(),
  updated_at = NOW()
WHERE id = {user_id}
```

#### 4.2 API Endpoint Requirements

**R3: POST /api/onboarding/complete Behavior**
- MUST update correct database table
- MUST return success confirmation
- MUST handle authentication errors
- MUST be idempotent (safe to call multiple times)

**R4: Authentication State Consistency**
- useAuth hook MUST read from same table as onboarding APIs
- AuthWrapper MUST check consistent onboarding status
- No fallback to localStorage for onboarding state

#### 4.3 User Journey Requirements

**R5: Skip Onboarding User Flow**
```typescript
1. User authenticated via OAuth → profiles.onboarding_completed = true (if new user)
2. User clicks "Skip for now" → API call to /api/onboarding/complete
3. Database update confirmed → router.push('/app') 
4. AuthWrapper loads → checks profiles.onboarding_completed = true
5. User accesses dashboard → No redirect to onboarding
```

**R6: Redirect Logic**
- IF `onboarding_completed = true` → Allow access to `/app`
- IF `onboarding_completed = false` → Redirect to `/onboarding`
- IF `onboarding_completed = null` → Redirect to `/onboarding`

### 5. ACCEPTANCE CRITERIA

#### 5.1 Happy Path Test Cases

**Test Case 1: Skip Onboarding - New User**
```typescript
Given: New user completes OAuth authentication
When: User lands on /onboarding page
And: User clicks "Skip for now" button
Then: User is redirected to /app dashboard
And: Database shows onboarding_completed = true
And: User can access all application features
```

**Test Case 2: Skip Onboarding - Existing User**
```typescript
Given: Existing user with onboarding_completed = false
When: User lands on /onboarding page  
And: User clicks "Skip for now" button
Then: User is redirected to /app dashboard
And: Database shows onboarding_completed = true
And: No subsequent redirects to onboarding
```

#### 5.2 Error Handling Test Cases

**Test Case 3: Database Update Failure**
```typescript
Given: User clicks "Skip for now"
When: Database update fails
Then: User sees error message
And: User remains on onboarding page
And: User can retry the skip action
```

**Test Case 4: Authentication Failure**
```typescript
Given: User session expires during skip action
When: User clicks "Skip for now"
Then: User is redirected to login
And: After re-authentication, user can retry skip
```

### 6. TECHNICAL IMPLEMENTATION REQUIREMENTS

#### 6.1 Database Schema Fix
```sql
-- Ensure consistent table usage
-- Option A: Migrate all APIs to use 'profiles' table
-- Option B: Create sync triggers between tables
-- Option C: Consolidate to single profiles table
```

#### 6.2 API Endpoint Updates
```typescript
// /api/onboarding/complete/route.ts
// MUST update correct table
const { error } = await supabase
  .from('profiles') // Ensure correct table
  .update({
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  .eq('id', user.id)
```

#### 6.3 Frontend State Management
```typescript
// handleSkipOnboarding - MUST NOT rely on localStorage
const handleSkipOnboarding = async () => {
  try {
    const response = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.ok) {
      // Force auth state refresh to get updated onboarding status
      await refreshAuthState()
      router.push('/app')
    } else {
      throw new Error('Failed to skip onboarding')
    }
  } catch (error) {
    // Show user-friendly error message
    setError('Unable to skip onboarding. Please try again.')
  }
}
```

### 7. VALIDATION CRITERIA

#### 7.1 Success Metrics
- ✅ User can skip onboarding without infinite redirects
- ✅ Database state consistent across all endpoints
- ✅ No reliance on localStorage for onboarding state
- ✅ Error handling provides clear feedback to users

#### 7.2 Performance Requirements
- Skip onboarding action completes within 2 seconds
- Database update transaction is atomic
- No unnecessary API calls during skip process

### 8. STAKEHOLDER IMPACT ANALYSIS

**Primary Users**: All new users attempting to access the application
**Secondary Users**: Existing users with incomplete onboarding
**Business Impact**: Complete failure of user acquisition funnel
**Technical Debt**: Database architecture inconsistency affects multiple features

### 9. RECOMMENDED IMPLEMENTATION PRIORITY

**Phase 1: Immediate Fix (P0)**
1. Fix database table inconsistency in onboarding APIs
2. Ensure `/api/onboarding/complete` updates correct table
3. Test skip onboarding flow end-to-end

**Phase 2: Architecture Cleanup (P1)**  
1. Consolidate to single profiles table
2. Add database constraints and triggers
3. Update all API endpoints for consistency

**Phase 3: Enhanced Error Handling (P2)**
1. Add comprehensive error states
2. Implement retry mechanisms
3. Add monitoring and alerting

### 10. DEFINITION OF DONE

**Skip Onboarding Requirements are COMPLETE when:**
- ✅ User can click "Skip for now" and access main application
- ✅ Database `onboarding_completed` field accurately reflects skip action
- ✅ No infinite redirect loops between /onboarding and /app
- ✅ Error handling provides clear feedback for failure cases
- ✅ All acceptance criteria pass automated testing
- ✅ Database architecture is consistent across all API endpoints

---

**Document Status**: COMPLETE  
**Specification Agent**: Requirements analysis and acceptance criteria defined  
**Next Phase**: Pseudocode Agent → Algorithm design for fix implementation