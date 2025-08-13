# Phase 5 Integration Action Plan - Kuchisabishii

## Overview
This document outlines a comprehensive step-by-step implementation plan for integrating Phase 5 features with data integration, user discovery, mobile-first UI redesign, and enhanced authentication.

## Real Data Integration from LinkedIn Profile

### Current Profile Data Extracted:
```json
{
    "name": "Aaron Tong",
    "professionalDesignations": ["P.Eng", "PMP"],
    "location": "Alberta, Canada",
    "currentCompany": "Aeternum",
    "summary": "My goal in life is to challenge stagnation. I constantly strive to gain new experiences…",
    "languages": [
        {"language": "Cantonese", "proficiency": "Limited working"},
        {"language": "English", "proficiency": "Full professional"}
    ],
    "keySkills": [
        "Project Management", "Heavy Lift Engineering", "Construction Planning",
        "Transport Logistics", "Module Installation"
    ],
    "education": {
        "university": "University of Alberta",
        "graduationYear": 2011
    },
    "professionalMemberships": ["APEGA"]
}
```

## 1. Data Integration Implementation

### 1.1 LinkedIn Data Service
**Files to Create:**
- `src/lib/services/linkedin-data.ts` - LinkedIn profile parsing service
- `src/app/api/profile/linkedin-import/route.ts` - API endpoint for LinkedIn data import
- `src/types/profile.ts` - Enhanced profile type definitions

**Implementation Steps:**
```typescript
// src/lib/services/linkedin-data.ts
export interface LinkedInProfile {
  name: string;
  title?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  education?: EducationInfo[];
  languages?: LanguageInfo[];
}

export class LinkedInDataService {
  static parseProfileUrl(url: string): Promise<LinkedInProfile>
  static mapToUserProfile(linkedinData: LinkedInProfile): Partial<UserProfile>
  static validateProfileData(data: LinkedInProfile): boolean
}
```

### 1.2 Profile Update Integration
**Files to Modify:**
- `src/components/profile/EnhancedUserProfilePage.tsx`
- `src/components/onboarding/AIOnboardingFlow.tsx` 
- `src/app/api/profile/route.ts`

**Key Changes:**
- Add LinkedIn import button in profile settings
- Replace mock data with real profile information
- Enhance onboarding to use professional background for food preferences

## 2. User Discovery & Social Features Enhancement

### 2.1 Advanced User Search
**Files to Enhance:**
- `src/app/api/users/search/route.ts` ✓ (Already exists)
- `src/components/social/UserSearch.tsx` (New)
- `src/components/social/UserDiscovery.tsx` (New)

**Enhanced Search Features:**
```typescript
// Enhanced search parameters
interface UserSearchParams {
  query: string;
  location?: string;
  skills?: string[];
  dietaryRestrictions?: string[];
  radius?: number; // km
  sortBy: 'relevance' | 'distance' | 'activity' | 'mutual_friends';
}
```

### 2.2 QR Code Improvements
**Files to Enhance:**
- `src/components/social/QRCodeGenerator.tsx` ✓ (Already exists)
- `src/components/social/QRScanner.tsx` ✓ (Already exists)
- `src/components/social/QRCodeManager.tsx` (New - Combined interface)

**New Features:**
- Batch QR code scanning for events
- Custom QR codes with profile themes
- Expiring QR codes for privacy
- QR code analytics

### 2.3 Friend Discovery System
**Files to Create:**
- `src/lib/algorithms/friend-suggestion.ts` - ML-based friend suggestions
- `src/components/social/FriendSuggestions.tsx` - UI component
- `src/app/api/friends/suggestions/route.ts` - API endpoint

**Algorithm Features:**
- Taste profile similarity matching
- Location-based suggestions
- Mutual friend recommendations
- Activity-based matching

## 3. Mobile-First UI Redesign

### 3.1 Uber Eats Inspired Navigation
**Files to Create:**
- `src/components/ui/mobile/BottomTabBar.tsx` (Enhanced version)
- `src/components/ui/mobile/CardLayout.tsx`
- `src/components/ui/mobile/SwipeableCard.tsx`

**Design Specifications:**
```css
/* Touch target standards */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card-based layout */
.food-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: white;
  overflow: hidden;
  margin: 8px;
}
```

**Files to Modify:**
- `src/components/MainApp.tsx` ✓ (Update bottom navigation)
- `src/app/globals.css` ✓ (Add mobile-first styles)

### 3.2 Facebook-Style Social Elements
**Files to Create:**
- `src/components/social/ActivityFeed.tsx` ✓ (Already exists - enhance)
- `src/components/social/FriendStory.tsx` (New)
- `src/components/social/SocialInteractions.tsx` (New)

**Social Features:**
- Activity feed with real-time updates
- Food story highlights
- Like, comment, share functionality
- Friend activity notifications

### 3.3 Mobile Gestures & Interactions
**Files to Create:**
- `src/hooks/useSwipeGestures.ts` - Custom swipe hook
- `src/components/ui/mobile/SwipeNavigation.tsx`
- `src/components/ui/mobile/BottomSheet.tsx`
- `src/components/ui/mobile/PullToRefresh.tsx`

**Gesture Implementation:**
```typescript
// useSwipeGestures hook
export function useSwipeGestures() {
  const handleSwipeLeft = () => { /* Next tab */ };
  const handleSwipeRight = () => { /* Previous tab */ };
  const handleSwipeUp = () => { /* Pull to refresh */ };
  
  return { handleSwipeLeft, handleSwipeRight, handleSwipeUp };
}
```

### 3.4 Haptic Feedback Integration
**Files to Create:**
- `src/lib/utils/haptics.ts` - Web Vibration API wrapper
- `src/hooks/useHaptics.ts` - React hook for haptic feedback

```typescript
// Haptic feedback patterns
export enum HapticPattern {
  LIGHT = [10],
  MEDIUM = [20],
  HEAVY = [30],
  SUCCESS = [10, 50, 10],
  ERROR = [50, 50, 50]
}
```

## 4. Authentication Setup & Enhancement

### 4.1 Google OAuth Configuration
**Files to Modify:**
- `src/app/api/auth/social/google/route.ts` ✓ (Already exists)
- `.env.example` ✓ (Add Google OAuth config)

**Environment Variables Needed:**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

**Required Google Cloud Console Setup:**
1. Enable Google+ API
2. Configure OAuth consent screen
3. Add authorized redirect URIs
4. Set up domain verification

### 4.2 Apple Sign In Research & Implementation
**Research Tasks:**
- Investigate Apple Developer Program requirements
- Check free tier limitations
- Alternative: "Continue with Apple" web flow

**Files to Create (if feasible):**
- `src/app/api/auth/social/apple/route.ts` ✓ (Exists, needs enhancement)
- `src/lib/auth/apple-signin.ts`

### 4.3 Enhanced Email/Password Flow
**Files to Modify:**
- `src/components/auth/RegisterForm.tsx` ✓ (Already exists)
- `src/components/auth/LoginForm.tsx` ✓ (Already exists)
- `src/app/api/auth/register/route.ts` ✓ (Already exists)

**Enhancements:**
- Real-time password strength validation
- Email domain validation
- Better error handling and user feedback
- Progressive form disclosure

## 5. Integration Requirements

### 5.1 Phase 5 Feature Merge
**Components to Integrate:**

**AI Onboarding Integration:**
- `src/components/onboarding/AIOnboardingFlow.tsx` ✓ (Already exists)
- Enhanced with professional background analysis
- LinkedIn skill mapping to food preferences

**Enhanced Profiles Integration:**
- `src/components/profile/EnhancedUserProfilePage.tsx` ✓ (Already exists)
- Real data population from LinkedIn import
- Professional context in food reviews

**Recommendations Integration:**
- `src/components/recommendations/GroupRecommendationSystem.tsx` ✓ (Already exists)
- Social context from friend network
- Professional dining preferences

**Group Voting Integration:**
- `src/components/recommendations/GroupVotingSystem.tsx` (New)
- Real-time collaborative decision making
- Integration with friend system

### 5.2 Navigation Flow Integration
**Files to Modify:**
- `src/components/MainApp.tsx` ✓ (Update for seamless navigation)
- `src/app/layout.tsx` ✓ (Add mobile-first meta tags)

**Navigation Enhancements:**
```typescript
// Enhanced tab system
interface TabConfig {
  id: string;
  icon: ComponentType;
  label: string;
  badge?: number; // For notifications
  disabled?: boolean;
  subTabs?: TabConfig[];
}
```

### 5.3 Data Consistency & Performance
**Files to Create:**
- `src/lib/hooks/useDataSync.ts` - Real-time data synchronization
- `src/lib/cache/mobile-cache.ts` - Mobile-optimized caching
- `src/lib/utils/performance-monitor.ts` - Performance tracking

**Optimization Strategies:**
- Implement service workers for offline functionality
- Use React.memo for expensive components
- Implement lazy loading for images and routes
- Add connection-aware features

## 6. API Endpoints Structure

### New API Endpoints Needed:
```
/api/profile/linkedin-import          POST - Import LinkedIn data
/api/friends/suggestions              GET  - Get friend suggestions  
/api/social/activity-feed            GET  - Get user activity feed
/api/groups/voting                   POST - Group voting functionality
/api/notifications/preferences       PUT  - Update notification settings
/api/analytics/mobile-events         POST - Track mobile interactions
```

### Enhanced Existing Endpoints:
```
/api/users/search                    GET  - ✓ Exists (enhance with filters)
/api/friends/requests                POST - ✓ Exists (add batch operations)
/api/profile/route                   GET  - ✓ Exists (add LinkedIn integration)
```

## 7. Database Schema Updates

### New Tables Needed:
```sql
-- LinkedIn profile imports
CREATE TABLE linkedin_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  raw_data JSONB,
  processed_data JSONB,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend suggestions
CREATE TABLE friend_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  suggested_user_id UUID REFERENCES profiles(id),
  reason TEXT,
  score FLOAT,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group voting
CREATE TABLE group_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES friend_groups(id),
  restaurant_id UUID REFERENCES restaurants(id),
  created_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  status vote_status DEFAULT 'active'
);

CREATE TABLE vote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID REFERENCES group_votes(id),
  user_id UUID REFERENCES profiles(id),
  choice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 8. Component Structure Overview

```
src/components/
├── mobile/
│   ├── BottomTabBar.tsx          # Enhanced navigation
│   ├── CardLayout.tsx            # Uber Eats style cards  
│   ├── SwipeableCard.tsx         # Swipe interactions
│   ├── BottomSheet.tsx           # Modal interactions
│   └── PullToRefresh.tsx         # Refresh functionality
├── social/
│   ├── UserDiscovery.tsx         # Enhanced user search
│   ├── FriendSuggestions.tsx     # ML-based suggestions
│   ├── ActivityFeed.tsx          # ✓ Enhanced existing
│   ├── GroupVoting.tsx           # New voting system  
│   └── QRCodeManager.tsx         # Enhanced QR features
├── profile/
│   ├── LinkedInImport.tsx        # LinkedIn integration
│   ├── EnhancedUserProfile.tsx   # ✓ Enhanced existing
│   └── ProfessionalContext.tsx   # New professional info
├── onboarding/
│   ├── LinkedInOnboarding.tsx    # Professional setup
│   └── AIOnboardingFlow.tsx      # ✓ Enhanced existing
└── recommendations/
    ├── SocialRecommendations.tsx # Friend-based recommendations
    └── GroupVoting.tsx           # Collaborative decisions
```

## 9. Implementation Timeline

### Week 1: Data Integration
- LinkedIn data service implementation
- Profile import functionality  
- Real data population

### Week 2: User Discovery
- Enhanced search functionality
- Friend suggestion algorithms
- QR code improvements

### Week 3: Mobile UI Redesign  
- Bottom tab bar enhancement
- Card-based layouts
- Swipe gestures implementation

### Week 4: Social Features
- Activity feed enhancement
- Group voting system
- Social interactions

### Week 5: Authentication & Testing
- OAuth configuration and testing
- Mobile performance optimization
- Integration testing

### Week 6: Integration & Polish
- Feature integration
- Bug fixes and optimization
- Final testing and deployment

## 10. Testing Requirements

### Mobile Testing:
- Cross-browser compatibility (iOS Safari, Chrome, Firefox)
- Touch interaction testing
- Performance on slower connections
- Offline functionality testing

### Social Feature Testing:
- Multi-user interaction scenarios  
- Real-time updates and notifications
- Privacy and security testing
- Group collaboration workflows

### Data Integration Testing:
- LinkedIn import accuracy
- Data consistency across features
- Error handling and recovery
- Performance with large datasets

## 11. Success Metrics

### User Engagement:
- Friend connection rate increase by 40%
- Profile completion rate increase by 60%
- Daily active users increase by 25%

### Mobile Performance:
- Page load time under 2 seconds
- Touch interaction response under 100ms
- Offline functionality success rate >95%

### Social Features:
- Friend recommendation accuracy >70%
- Group voting participation rate >80%
- QR code scan success rate >90%

---

## Next Steps

1. **Start Implementation**: Begin with data integration and LinkedIn import service
2. **Set up Development Environment**: Configure OAuth providers and testing accounts  
3. **Create Component Library**: Build mobile-optimized UI components
4. **Implement Core Features**: Focus on user discovery and social interactions
5. **Test and Iterate**: Continuous testing with real users and devices

This plan provides a comprehensive roadmap for implementing Phase 5 features with clear technical specifications, file structures, and success metrics.