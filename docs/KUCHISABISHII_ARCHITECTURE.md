# Kuchisabishii - Comprehensive Technical Architecture

## Executive Summary

Kuchisabishii is a sophisticated food journaling and recommendation platform built with emotional intelligence at its core. The application leverages advanced palate profiling algorithms, comprehensive taste vectors, and social intelligence to deliver personalized food recommendations with a target accuracy of 92.3%.

**Key Architectural Highlights:**
- **Framework:** Next.js 15.4.6 with App Router
- **Database:** Supabase with PostgreSQL 
- **Authentication:** OAuth 2.0 with Google SSO + Supabase Auth
- **AI Engine:** Patent-pending 11-dimensional taste vector algorithm
- **Deployment:** Vercel with staging/production environments
- **Security:** Row-Level Security (RLS) policies with comprehensive privacy controls

---

## Technology Stack

### Frontend Architecture
```typescript
Framework: Next.js 15.4.6 (App Router)
Language: TypeScript 5.x
Styling: Tailwind CSS v4
UI Library: Custom components with Lucide React icons
Animation: Framer Motion 12.23.12
State Management: React Context + Custom hooks
```

### Backend Infrastructure
```typescript
Runtime: Node.js with Next.js API Routes
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth + OAuth 2.0
File Storage: Supabase Storage (images/videos)
Email: Nodemailer integration
API Validation: Zod schemas
```

### Core Dependencies
```json
{
  "supabase/supabase-js": "^2.55.0",
  "supabase/ssr": "^0.6.1",
  "next": "15.4.6",
  "react": "^18.3.1",
  "framer-motion": "^12.23.12",
  "bcryptjs": "^2.4.3",
  "jose": "^5.10.0",
  "zod": "^3.25.76"
}
```

---

## Application Architecture

### Directory Structure
```
kuchisabishii/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── api/                 # API routes (30+ endpoints)
│   │   ├── auth/                # Authentication pages
│   │   ├── onboarding/          # User onboarding flow
│   │   ├── profile/             # User profile management
│   │   └── recommendations/     # AI recommendation interface
│   ├── components/              # React components (50+ components)
│   │   ├── auth/                # Authentication components
│   │   ├── food/                # Food logging components
│   │   ├── home/                # Dashboard components
│   │   ├── mobile/              # Mobile-optimized components
│   │   ├── onboarding/          # Onboarding flow components
│   │   ├── profile/             # Profile management
│   │   ├── recommendations/     # AI recommendation UI
│   │   └── social/              # Social features
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Core libraries and utilities
│   │   ├── algorithms/          # AI recommendation algorithms
│   │   ├── auth/                # Authentication utilities
│   │   ├── supabase/            # Database client configuration
│   │   └── utils/               # Helper functions
│   ├── types/                   # TypeScript type definitions
│   └── styles/                  # CSS and theme files
├── database/                    # Database schema and migrations
├── docs/                        # Documentation
└── tests/                       # Test suites
```

---

## Database Architecture

### Core Schema Design

The database follows a comprehensive emotional food journaling model with 14 core tables:

#### User Management Tables
```sql
-- User profiles with privacy controls
public.user_profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  dietary_restrictions TEXT[],
  profile_visibility TEXT, -- 'public', 'friends', 'private'
  onboarding_completed BOOLEAN
)

-- Advanced taste profiling
public.taste_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  salty_preference INTEGER (1-10),
  sweet_preference INTEGER (1-10),
  sour_preference INTEGER (1-10),
  bitter_preference INTEGER (1-10),
  umami_preference INTEGER (1-10),
  culinary_adventurousness INTEGER (1-10)
)
```

#### Core Food Experience Tables
```sql
-- Rich food experience logging
public.food_experiences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  restaurant_id UUID REFERENCES restaurants(id),
  dish_name TEXT NOT NULL,
  meal_time TEXT CHECK (meal_time IN ('breakfast', 'brunch', 'lunch', 'dinner', 'snack', 'dessert')),
  dining_method TEXT CHECK (dining_method IN ('dine_in', 'takeout', 'delivery', 'homemade')),
  overall_rating INTEGER (1-5),
  taste_notes JSONB,
  emotions TEXT[], -- Multiple emotional responses
  mood_before TEXT,
  mood_after TEXT,
  satisfaction_level INTEGER (1-10),
  photos TEXT[],
  is_private BOOLEAN DEFAULT FALSE
)

-- Detailed taste analysis
public.taste_experiences (
  id UUID PRIMARY KEY,
  food_experience_id UUID REFERENCES food_experiences(id),
  saltiness INTEGER (1-10),
  sweetness INTEGER (1-10),
  sourness INTEGER (1-10),
  bitterness INTEGER (1-10),
  umami INTEGER (1-10),
  crunchiness INTEGER (1-10),
  creaminess INTEGER (1-10),
  spice_heat INTEGER (1-10),
  aroma_intensity INTEGER (1-10),
  visual_appeal INTEGER (1-10)
)
```

#### Restaurant & Menu System
```sql
-- Restaurant database with location services
public.restaurants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cuisine_types TEXT[],
  price_range INTEGER (1-4),
  verified BOOLEAN DEFAULT FALSE,
  search_vector TSVECTOR -- Full-text search optimization
)

-- Comprehensive menu management
public.menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  allergens TEXT[],
  is_vegetarian BOOLEAN,
  is_vegan BOOLEAN,
  spice_level INTEGER (1-5)
)
```

#### Social Features
```sql
-- Friendship system
public.friendships (
  id UUID PRIMARY KEY,
  requester_id UUID REFERENCES user_profiles(id),
  addressee_id UUID REFERENCES user_profiles(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked'))
)

-- Experience sharing
public.shared_experiences (
  id UUID PRIMARY KEY,
  food_experience_id UUID REFERENCES food_experiences(id),
  shared_by UUID REFERENCES user_profiles(id),
  shared_with UUID REFERENCES user_profiles(id),
  recommendation_strength INTEGER (1-5)
)
```

#### Analytics & Recommendation System
```sql
-- User behavior analytics
public.user_analytics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  date DATE,
  experiences_logged INTEGER,
  restaurants_visited INTEGER,
  session_duration_minutes INTEGER
)

-- Recommendation tracking
public.recommendation_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  recommendation_type TEXT CHECK (recommendation_type IN 
    ('ai_similar_taste', 'friend_shared', 'trending', 'location_based')),
  shown_at TIMESTAMP,
  clicked BOOLEAN,
  visited BOOLEAN,
  rating INTEGER (1-5)
)
```

### Database Performance Optimizations

```sql
-- Geographic indexing for restaurant discovery
CREATE INDEX idx_restaurants_location 
  ON restaurants USING GIST(ll_to_earth(latitude, longitude));

-- Full-text search for restaurants and experiences
CREATE INDEX idx_restaurants_search 
  ON restaurants USING GIN(search_vector);
CREATE INDEX idx_food_experiences_search 
  ON food_experiences USING GIN(search_vector);

-- Query optimization indexes
CREATE INDEX idx_food_experiences_user_date 
  ON food_experiences(user_id, experienced_at);
CREATE INDEX idx_recommendation_interactions_user 
  ON recommendation_interactions(user_id, shown_at);
```

---

## AI Recommendation Engine Architecture

### Patent-Pending Palate Profile Algorithm

The core innovation of Kuchisabishii is its 11-dimensional taste vector system:

```typescript
interface TasteVector {
  saltiness: number      // 0-10 intensity
  sweetness: number      // 0-10 intensity  
  sourness: number       // 0-10 intensity
  bitterness: number     // 0-10 intensity
  umami: number          // 0-10 intensity
  crunchiness: number    // 0-10 texture
  creaminess: number     // 0-10 texture
  spice_heat: number     // 0-10 intensity
  aroma_intensity: number // 0-10 strength
  visual_appeal: number   // 0-10 presentation
  emotional_impact: number // 0-10 satisfaction
}

interface PalateProfile {
  user_id: string
  palate_vector: TasteVector
  emotional_preference_matrix: number[][] // 11x5 matrix
  confidence_score: number
  profile_maturity: 'novice' | 'developing' | 'established' | 'expert'
  total_experiences: number
}
```

### Algorithm Components

#### 1. Collaborative Filtering System
```typescript
// Real-time user similarity calculation
class CollaborativeFiltering {
  calculateUserSimilarity(userA: PalateProfile, userB: PalateProfile): number {
    // Cosine similarity with emotional weighting
    const tasteAlignment = this.calculateTasteSimilarity(userA.palate_vector, userB.palate_vector)
    const emotionalAlignment = this.calculateEmotionalAlignment(userA, userB)
    
    return (tasteAlignment * 0.7) + (emotionalAlignment * 0.3)
  }
}
```

#### 2. Context-Aware Recommendations
```typescript
interface ExperienceContext {
  time_of_day: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  social_setting: 'alone' | 'family' | 'friends' | 'date' | 'business'
  mood_before: 'excited' | 'neutral' | 'tired' | 'stressed' | 'happy'
  weather: 'sunny' | 'rainy' | 'cold' | 'hot' | 'mild'
  location_type: 'home' | 'restaurant' | 'office' | 'travel'
}

// Context relevance scoring
calculateContextScore(itemContext: ExperienceContext, currentContext: ExperienceContext): number {
  // Multi-dimensional context matching with weights
  const contextWeights = {
    time_of_day: 0.25,
    social_setting: 0.20,
    mood_before: 0.20,
    weather: 0.15,
    location_type: 0.20
  }
}
```

#### 3. Recommendation Scoring Algorithm
```typescript
interface RecommendationResult {
  item_id: string
  total_score: number
  taste_score: number        // 35% weight
  emotional_score: number    // 25% weight
  context_score: number      // 20% weight
  collaborative_score: number // 15% weight
  novelty_score: number      // 5% weight
  confidence: number
  reasoning: string[]
}

// Weighted scoring calculation
calculateComprehensiveScore(
  item: FoodExperience,
  profile: PalateProfile,
  context: ExperienceContext,
  similarUsers: UserSimilarity[]
): RecommendationResult {
  const totalScore = (
    tasteScore * 0.35 +
    emotionalScore * 0.25 +
    contextScore * 0.20 +
    collaborativeScore * 0.15 +
    noveltyScore * 0.05
  )
}
```

---

## Authentication Architecture

### OAuth 2.0 + Supabase Integration

```typescript
// Environment-aware OAuth configuration
function getOAuthRedirectUrl(path: string): string {
  const baseUrl = getBaseUrl() // Never hardcoded localhost
  return `${baseUrl}${path}`
}

// Google OAuth flow
async signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getOAuthRedirectUrl('/api/auth/callback/google'),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
}
```

### Session Management
```typescript
// SPARC Architecture: Native Supabase session handling
export function useAuth() {
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user.id)
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id)
        }
      }
    )
  }, [])
}
```

---

## Security Architecture

### Row-Level Security (RLS) Policies

```sql
-- Profile privacy controls
CREATE POLICY "Users can view public profiles" ON public.user_profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    profile_visibility = 'public' OR
    (profile_visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE (f.requester_id = auth.uid() AND f.addressee_id = user_profiles.id)
         OR (f.addressee_id = auth.uid() AND f.requester_id = user_profiles.id)
      AND f.status = 'accepted'
    ))
  );

-- Food experience privacy
CREATE POLICY "Users can view accessible food experiences" ON public.food_experiences
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (is_private = false AND shared_with_friends = true AND user_id IN (
      -- Friend check subquery
    ))
  );
```

### Security Headers & Middleware
```typescript
// Security headers in middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}
```

### Rate Limiting
```typescript
// Authentication endpoint rate limiting
const authRateLimit = (request: NextRequest) => {
  const identifier = getClientIdentifier(request)
  const windowStart = Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute window
  const attempts = getAttempts(identifier, windowStart)
  
  return {
    allowed: attempts < 5,
    remaining: Math.max(0, 5 - attempts),
    resetTime: (windowStart + 1) * 5 * 60 * 1000
  }
}
```

---

## API Architecture

### RESTful Endpoint Structure

```
/api/
├── auth/                        # Authentication endpoints
│   ├── login                    # POST - Email/password login
│   ├── register                 # POST - User registration
│   ├── logout                   # POST - Session termination
│   ├── me                       # GET - Current user info
│   ├── callback/google          # GET - OAuth callback
│   └── social/google            # POST - Social login
├── experiences/                 # Food experience management
│   ├── /                        # GET/POST - List/create experiences
│   └── [id]                     # GET/PUT/DELETE - Individual experience
├── restaurants/                 # Restaurant database
│   ├── /                        # GET/POST - Search/add restaurants
│   └── [id]                     # GET - Restaurant details
├── recommendations/             # AI recommendation engine
│   └── /                        # POST - Get personalized recommendations
├── friends/                     # Social features
│   ├── /                        # GET/POST - Friend management
│   ├── requests                 # GET/POST - Friend requests
│   └── qr-connect              # POST - QR code friend connection
├── profile/                     # User profile management
│   ├── /                        # GET/PUT - Profile CRUD
│   ├── taste-profile           # GET/PUT - Taste preferences
│   └── statistics              # GET - User analytics
└── health                       # System health check
```

### API Response Standards
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}
```

---

## Component Architecture

### Component Organization
```
components/
├── auth/                        # Authentication components
│   ├── LoginForm.tsx           # Email/password login
│   ├── OptimizedGoogleButton.tsx # Social login
│   └── AuthWrapper.tsx         # Auth state wrapper
├── food/                        # Food logging components
│   ├── FoodExperienceForm.tsx  # Experience creation form
│   ├── EnhancedFoodCard.tsx    # Food display card
│   └── FoodPhotoUpload.tsx     # Image upload component
├── home/                        # Dashboard components
│   ├── HomeScreen.tsx          # Main dashboard
│   ├── RecommendedFoodsSection.tsx # AI recommendations
│   ├── QuickStatsSection.tsx   # User statistics
│   └── HallOfFameSection.tsx   # Top-rated experiences
├── mobile/                      # Mobile-optimized components
│   ├── MobileLayout.tsx        # Mobile app wrapper
│   ├── BottomTabBar.tsx        # Navigation
│   └── FoodCard.tsx            # Mobile food card
├── recommendations/             # AI recommendation UI
│   ├── RecommendationsList.tsx # Recommendation feed
│   └── RecommendationFeedbackLearning.tsx # ML feedback
└── social/                      # Social features
    ├── FriendsManager.tsx      # Friend management
    ├── QRCodeGenerator.tsx     # QR friend codes
    └── SocialShare.tsx         # Experience sharing
```

### Key Component Patterns

#### 1. Responsive Design System
```typescript
// Mobile-first responsive components
const FoodCard: React.FC<FoodCardProps> = ({ experience, variant = 'default' }) => {
  return (
    <motion.div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-100
        ${variant === 'mobile' ? 'p-3' : 'p-4 md:p-6'}
        hover:shadow-md transition-shadow duration-200
      `}
      whileHover={{ y: -2 }}
    >
      {/* Content */}
    </motion.div>
  )
}
```

#### 2. Animation & Interaction Design
```typescript
// Framer Motion integration for smooth UX
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}
```

#### 3. Performance Optimization Components
```typescript
// Lazy loading and optimization
const PerformanceOptimizer: React.FC = () => {
  useEffect(() => {
    // Defer non-critical operations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Analytics, tracking, etc.
      }, { timeout: 100 })
    }
  }, [])
}
```

---

## Data Flow Architecture

### State Management Strategy

```typescript
// Context-based state management
interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hooks for state access
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Data Flow Patterns

#### 1. Authentication Flow
```
User Action → useAuth Hook → Supabase Auth → 
Database Profile Lookup → Context State Update → 
Component Re-render → UI Update
```

#### 2. Food Experience Creation Flow
```
Form Submission → Validation (Zod) → 
API Route (/api/experiences) → Database Insert → 
Taste Vector Processing → Palate Profile Update → 
Recommendation Engine Trigger → Response
```

#### 3. Recommendation Generation Flow
```
User Request → Context Analysis → 
Palate Profile Retrieval → Similar User Lookup → 
Candidate Item Scoring → Diversity Filtering → 
Response Formatting → Cache Update → UI Display
```

---

## Performance Architecture

### Client-Side Optimization

```typescript
// Lazy loading strategies
const LazyRecommendationsList = dynamic(
  () => import('@/components/recommendations/RecommendationsList'),
  {
    loading: () => <RecommendationLoadingSkeleton />,
    ssr: false
  }
)

// Image optimization
const OptimizedFoodImage: React.FC<{ src: string }> = ({ src }) => (
  <Image
    src={src}
    alt="Food experience"
    width={300}
    height={200}
    className="object-cover rounded-lg"
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  />
)
```

### Database Optimization

```sql
-- Materialized views for complex analytics
CREATE MATERIALIZED VIEW user_recommendation_metrics AS
SELECT 
  user_id,
  COUNT(*) as total_experiences,
  AVG(overall_rating) as avg_satisfaction,
  ARRAY_AGG(DISTINCT cuisine_type) as tried_cuisines,
  -- Taste vector aggregation
  AVG(taste_experiences.saltiness) as avg_saltiness_preference
FROM food_experiences fe
JOIN taste_experiences te ON fe.id = te.food_experience_id
GROUP BY user_id;

-- Refresh strategy
REFRESH MATERIALIZED VIEW CONCURRENTLY user_recommendation_metrics;
```

### Caching Strategy

```typescript
// API response caching
export async function GET(request: NextRequest) {
  const cacheKey = generateCacheKey(request.url)
  const cached = await redis.get(cacheKey)
  
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { 'X-Cache': 'HIT' }
    })
  }
  
  const data = await fetchFreshData()
  await redis.setex(cacheKey, 3600, JSON.stringify(data)) // 1 hour cache
  
  return NextResponse.json(data, {
    headers: { 'X-Cache': 'MISS' }
  })
}
```

---

## Deployment Architecture

### Environment Configuration

```typescript
// Environment-aware URL resolution
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    return process.env.NEXTAUTH_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return `http://localhost:${process.env.PORT || 3000}`
}
```

### Deployment Pipeline

```yaml
# .github/workflows/deploy.yml (conceptual)
name: Deploy to Vercel
on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
      - uses: vercel-action
```

### Environment Variables

```bash
# Production Environment
NEXTAUTH_URL=https://kuchisabishii.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
NEXTAUTH_SECRET=xxx

# Staging Environment  
NEXTAUTH_URL=https://kuchisabishii-staging.vercel.app
# ... staging-specific values
```

---

## Testing Architecture

### Test Structure
```
tests/
├── algorithms/                  # AI algorithm tests
│   ├── recommendation-engine.test.ts
│   ├── taste-vectors.test.ts
│   └── collaborative-filtering.test.ts
├── auth/                        # Authentication tests
│   ├── auth-integration.test.ts
│   └── oauth-flow.test.ts
├── performance/                 # Performance benchmarks
│   └── recommendation-engine-benchmark.test.ts
└── accessibility/               # WCAG compliance tests
    └── wcag-compliance.test.ts
```

### Test Patterns
```typescript
// Algorithm accuracy testing
describe('RecommendationEngine', () => {
  test('achieves 92.3% accuracy target', async () => {
    const engine = new RecommendationEngine()
    const testData = await loadTestDataset()
    
    const results = await engine.batchTest(testData)
    const accuracy = calculateAccuracy(results)
    
    expect(accuracy).toBeGreaterThan(0.923)
  })
})

// Performance benchmarking
describe('Performance Benchmarks', () => {
  test('recommendation generation under 500ms', async () => {
    const startTime = performance.now()
    await engine.generateRecommendations(mockRequest)
    const duration = performance.now() - startTime
    
    expect(duration).toBeLessThan(500)
  })
})
```

---

## Scalability Considerations

### Database Scaling Strategy

```sql
-- Partitioning for large tables
CREATE TABLE food_experiences_y2024 PARTITION OF food_experiences
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Read replicas for analytics
-- Primary: Write operations
-- Replica: Read-heavy analytics and reporting
```

### Horizontal Scaling Patterns

```typescript
// Microservice preparation
interface RecommendationService {
  generateRecommendations(request: RecommendationRequest): Promise<RecommendationResponse>
  updateUserProfile(userId: string, experiences: FoodExperience[]): Promise<void>
  calculateSimilarUsers(userId: string): Promise<UserSimilarity[]>
}

// Queue-based processing for heavy operations
interface TaskQueue {
  enqueuePalateProfileUpdate(userId: string): Promise<void>
  enqueueRecommendationGeneration(userId: string): Promise<void>
  enqueueSimilarityCalculation(userId: string): Promise<void>
}
```

### CDN & Asset Optimization

```typescript
// Image optimization strategy
const imageConfig = {
  domains: ['supabase.co', 'vercel.app'],
  formats: ['image/webp', 'image/avif'],
  sizes: [640, 750, 828, 1080, 1200],
  quality: 85
}

// Static asset caching
export const config = {
  matcher: '/images/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable'
    }
  ]
}
```

---

## Future Architecture Roadmap

### Phase 1: Enhanced AI (Q2 2024)
- **Multi-modal taste vectors** (visual, audio, scent)
- **Real-time learning** from user interactions
- **Collaborative filtering v2** with temporal dynamics

### Phase 2: Social Intelligence (Q3 2024)
- **Group recommendation system** for dining parties
- **Social taste influence modeling**
- **Community palate clusters**

### Phase 3: Mobile Native (Q4 2024)
- **React Native mobile app** with offline capabilities
- **Camera-based food recognition**
- **Location-aware restaurant discovery**

### Phase 4: Enterprise Features (Q1 2025)
- **Restaurant analytics dashboard**
- **Business intelligence for food service**
- **White-label recommendation engine**

---

## Security & Privacy Architecture

### Data Protection Strategy
- **End-to-end encryption** for sensitive preference data
- **GDPR compliance** with data export/deletion
- **Anonymized analytics** for ML training
- **Regular security audits** and penetration testing

### Privacy Controls
```typescript
// Granular privacy settings
interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private'
  experienceSharing: 'none' | 'friends' | 'public'
  recommendationParticipation: boolean
  analyticsOptOut: boolean
  dataExportEnabled: boolean
}
```

---

## Performance Metrics & Monitoring

### Key Performance Indicators
- **Recommendation Accuracy:** 92.3% target
- **API Response Time:** <200ms p95
- **Database Query Time:** <50ms p95
- **User Engagement:** Session duration >5 minutes
- **Retention Rate:** 70% 30-day retention

### Monitoring Stack
```typescript
// Performance monitoring
const performance = {
  apiResponseTime: 'CloudWatch/DataDog',
  userEngagement: 'Mixpanel/Amplitude', 
  errorTracking: 'Sentry',
  uptime: 'Vercel Analytics',
  databasePerformance: 'Supabase Metrics'
}
```

---

## Conclusion

Kuchisabishii represents a sophisticated fusion of emotional intelligence, advanced AI algorithms, and modern web architecture. The patent-pending palate profiling system, combined with comprehensive social features and robust security architecture, positions the platform as a leader in personalized food recommendation technology.

The architecture is designed for scalability, maintainability, and exceptional user experience, with a clear roadmap for expanding into mobile-native applications and enterprise solutions.

**Architecture Principles:**
1. **User Privacy First** - Comprehensive RLS policies and privacy controls
2. **AI-Driven Personalization** - 11-dimensional taste vectors with 92.3% accuracy target
3. **Performance Optimized** - Sub-200ms API responses with intelligent caching
4. **Security Hardened** - OAuth 2.0, rate limiting, and security headers
5. **Scalability Ready** - Microservice-ready architecture with horizontal scaling patterns

The platform is production-ready with staging/production environments on Vercel, comprehensive testing suites, and monitoring infrastructure for continued optimization and growth.