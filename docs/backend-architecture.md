# Kuchisabishii Backend Architecture

## Executive Summary

This document outlines the comprehensive Supabase backend architecture for Kuchisabishii, a food journaling and recommendation app focused on emotional food experiences. The architecture supports advanced features including emotional data modeling, AI-powered recommendations, social food discovery, and real-time synchronization across platforms.

## 🎯 Core Objectives

### Primary Goals
1. **Emotional Food Journaling**: Capture and analyze rich sensory and emotional food experiences
2. **Personalized Recommendations**: AI-driven suggestions based on taste profiles and social connections
3. **Social Food Discovery**: Friend-based sharing and collaborative food exploration
4. **Cross-Platform Consistency**: Real-time sync between mobile and web applications
5. **Privacy-First Design**: Granular user control over data sharing and visibility

### Technical Priorities
- **Scalability**: Support growing user base with efficient query patterns
- **Performance**: Sub-200ms API responses for core operations
- **Security**: Comprehensive RLS policies and data protection
- **Extensibility**: Modular architecture for future feature additions

## 🏗️ Architecture Overview

### Technology Stack
- **Database**: PostgreSQL 15+ with Supabase extensions
- **Storage**: Supabase Storage with automatic CDN distribution
- **Real-time**: WebSocket subscriptions for live updates
- **Authentication**: Supabase Auth with OAuth providers
- **API**: Auto-generated REST API with custom RPC functions

### High-Level Data Flow
```
Mobile/Web Client → Supabase API Gateway → PostgreSQL Database
                                        → Storage Buckets
                                        → Real-time Engine
```

## 📊 Database Design

### Emotional Data Modeling Philosophy

The core innovation of Kuchisabishii is its **emotional-first approach** to food data. Rather than treating food as mere nutrition or transactions, the system captures the complete sensory and emotional experience:

#### 1. Multi-Dimensional Taste Analysis
```sql
taste_experiences:
- 5 Basic Tastes (salt, sweet, sour, bitter, umami) [1-10 scale]
- 4 Texture Categories (crunch, cream, chew, juice) [1-10 scale]  
- Temperature & Spice Heat [1-10 scale]
- Aroma Intensity & Descriptors
- Visual Appeal & Color Vibrancy
```

#### 2. Emotional Context Capture
```sql
food_experiences:
- emotions[] - Array of emotional responses
- mood_before/mood_after - Pre/post meal emotional states  
- satisfaction_level - 1-10 subjective satisfaction
- special_occasion - Context and meaning
- dining_companions - Social context
- weather - Environmental factors
```

#### 3. Memory Enhancement
```sql
Rich Media Support:
- photos[] - Multiple food images with automatic optimization
- videos[] - Short food videos and time-lapses
- custom_notes - Detailed personal reflections
- aroma_notes[] - Scent memory descriptors
```

### Core Table Architecture

#### User Management Layer
```sql
user_profiles
├── Basic Info (username, display_name, bio, location)
├── Dietary Data (restrictions[], allergies[], preferences)
├── Privacy Controls (visibility, sharing settings)
└── Onboarding Status (completion flags)

taste_profiles  
├── Taste Preferences (5 basic tastes + textures)
├── Temperature Preferences (hot/cold food ratings)
├── Cuisine Preferences (dynamic JSON scoring)
└── Adventurousness Level (willingness to try new foods)
```

#### Food Experience Layer
```sql
food_experiences (Core Journaling Table)
├── Dish Information (name, restaurant, menu_item_id)
├── Experience Context (meal_time, dining_method, date/time)
├── Emotional Data (emotions[], moods, satisfaction)
├── Sensory Notes (mouthfeel, aroma, temperature)
├── Social Context (companions, occasion, weather)
├── Media Assets (photos[], videos[])
└── Privacy Controls (is_private, shared_with_friends)

taste_experiences (Detailed Sensory Analysis)
├── 5 Basic Tastes (1-10 intensity scales)
├── 4 Texture Categories (crunch, cream, chew, juice)
├── Environmental Factors (temp, spice, aroma)
└── Visual Assessment (appeal, color vibrancy)
```

#### Restaurant & Menu Layer
```sql
restaurants
├── Basic Info (name, description, contact details)
├── Location Data (address, coordinates for geo-queries)
├── Classification (cuisine_types[], price_range)
├── Features (parking, wifi, kid_friendly, etc.)
└── Verification Status (claimed ownership, verified)

menu_items
├── Item Details (name, description, price, category)
├── Dietary Info (vegetarian, vegan, gluten_free flags)
├── Nutritional Data (calories, ingredients[], allergens[])
├── Sensory Hints (spice_level, texture expectations)
└── Availability (seasonal, current status)
```

#### Social Layer
```sql
friendships
├── Relationship Management (requester, addressee, status)
├── Connection History (created, accepted dates)
└── Status Tracking (pending, accepted, declined, blocked)

shared_experiences  
├── Experience Sharing (food_experience_id, participants)
├── Recommendation Context (message, strength rating)
└── Social Engagement (creation time, interaction tracking)

restaurant_reviews (Separate from Food Reviews)
├── Service Assessment (15-point rating system)
├── Atmosphere Evaluation (ambiance, noise, comfort)
├── Facility Ratings (cleanliness, parking, bathrooms)
└── Overall Experience (would return/recommend flags)
```

#### Analytics & Intelligence Layer
```sql
user_analytics (Behavioral Patterns)
├── Daily Metrics (experiences_logged, photos_uploaded)
├── Engagement Data (app_opens, session_duration)
├── Discovery Patterns (restaurants_visited, cuisines_tried)
└── Social Activity (friends_shared_with)

recommendation_interactions (ML Training Data)
├── Recommendation Context (type, algorithm used)
├── User Response (shown, clicked, visited, rated)
├── Outcome Tracking (conversion rates, satisfaction)
└── Learning Loop (feedback for algorithm improvement)

search_history (Usage Optimization)
├── Query Analysis (search_query, type, results_count)
├── Interaction Tracking (clicked results, conversion)
└── Pattern Recognition (popular terms, success rates)
```

## 🤖 AI Recommendation Engine

### Multi-Factor Algorithm Architecture

The recommendation system combines multiple signals to provide personalized suggestions:

#### 1. Taste Similarity Scoring
```sql
calculate_taste_similarity(user1_id, user2_id) → similarity_score
```
- Compares 11 taste dimensions between users
- Weights basic tastes, textures, and adventurousness
- Returns normalized similarity score (0.0-1.0)
- Used for collaborative filtering

#### 2. Friend-Based Recommendations
```sql
get_restaurant_recommendations(user_id, distance_km, limit)
```
- Prioritizes restaurants loved by similar-taste friends
- Applies trust weighting based on friendship strength
- Filters by user's dietary restrictions and preferences
- Considers location proximity and convenience

#### 3. Contextual Matching
```sql
Recommendation Factors:
- Time of Day (breakfast/lunch/dinner patterns)
- Weather Conditions (comfort food vs. fresh options)
- Social Context (solo dining vs. group experiences)
- Recent Experiences (variety vs. consistency preferences)
- Seasonal Trends (ingredients, holiday foods)
```

#### 4. Learning & Adaptation
```sql
track_recommendation_interaction()
- Records user responses to recommendations
- Feeds back into algorithm weights
- Identifies successful recommendation patterns  
- Continuously improves personalization accuracy
```

### Recommendation Types

1. **Similar Taste Users**: "Users with similar preferences also loved..."
2. **Friend Recommendations**: "Your friend Alice highly recommends..."
3. **Trending Discoveries**: "Popular this week in your area..."
4. **Location-Based**: "Highly rated nearby restaurants..."
5. **Mood-Based**: "Great comfort food for rainy days..."

## 🔍 Advanced Search Architecture

### Full-Text Search Implementation
```sql
search_restaurants(query, filters, location, distance)
- PostgreSQL tsvector for text matching
- GiST indexes for location-based queries
- Composite scoring (relevance + rating + proximity)
- Real-time result ranking
```

### Search Categories
1. **Restaurant Search**: Name, cuisine, location-based discovery
2. **Menu Item Search**: Dish names, ingredients, dietary filters
3. **Experience Search**: Friend's experiences, emotion-based discovery
4. **Trending Search**: Popular dishes, emerging restaurants

### Search Optimization Features
- **Auto-complete**: Popular search term suggestions
- **Typo Tolerance**: Fuzzy matching for misspelled queries  
- **Semantic Search**: Context-aware result interpretation
- **Visual Search**: Future image-based dish recognition

## 🔐 Security & Privacy Architecture

### Row-Level Security (RLS) Implementation

Every table implements comprehensive RLS policies:

```sql
Example Policy Structure:
- Users can manage their own data
- Friends can view shared/public content
- Service roles can perform system operations
- Anonymous users have read-only access to public data
```

### Privacy Control Hierarchy
1. **Private**: Only user can view
2. **Friends**: Visible to accepted friends
3. **Public**: Visible to all users
4. **System**: Available for anonymous browsing

### Data Protection Measures
- **Encryption at Rest**: All PII encrypted in database
- **API Authentication**: JWT-based user verification
- **Rate Limiting**: Prevents abuse and scraping
- **Audit Logging**: Track sensitive data operations

## 📱 Real-Time Architecture

### WebSocket Subscriptions
```sql
Subscription Channels:
- friend_activity: New experiences from friends
- recommendation_updates: Shared experiences and suggestions
- social_interactions: Comments, likes, friend requests  
- taste_profile_changes: Updated preferences and recommendations
```

### Real-Time Triggers
```sql
Database Triggers:
- notify_friend_activity(): Broadcasts new food experiences
- notify_recommendation_update(): Alerts for shared experiences
- update_taste_profile(): Automatic preference learning
- search_index_update(): Maintains search performance
```

### Cross-Platform Sync
- **Optimistic Updates**: Immediate UI feedback with server reconciliation
- **Conflict Resolution**: Last-write-wins with user notification
- **Offline Support**: Local storage with sync queue
- **Delta Sync**: Only transfer changed data

## 💾 Storage Architecture

### Media Management Strategy

#### Storage Buckets Organization
```
food-images/     (10MB limit per file)
├── user_id/
│   └── experiences/
│       └── timestamp/
│           ├── original.jpg
│           ├── large.jpg (1200px)
│           ├── medium.jpg (800px)
│           └── thumbnail.jpg (150px)

food-videos/     (50MB limit per file)
├── user_id/
│   └── experiences/
│       └── timestamp/
│           └── video.mp4

profile-images/  (5MB limit per file)
├── user_id/
│   └── avatar.jpg
```

#### Image Processing Pipeline
1. **Upload Validation**: File type, size, content checks
2. **Automatic Optimization**: Compression and format conversion
3. **Multi-Resolution Generation**: 4 sizes for responsive loading
4. **CDN Distribution**: Global edge caching
5. **Metadata Extraction**: EXIF data, dominant colors

#### Storage Optimization
- **Lifecycle Policies**: Automatic archiving of old media
- **Duplicate Detection**: Prevent redundant storage
- **Usage Analytics**: Track storage patterns and costs
- **Cleanup Automation**: Remove orphaned files

## ⚡ Performance Optimization

### Indexing Strategy
```sql
Critical Indexes:
- Composite: (user_id, overall_rating DESC) for user experiences
- GiST: Location-based restaurant queries
- GIN: Cuisine types, dietary restrictions arrays
- Partial: Active menu items, accepted friendships
- Text Search: tsvector indexes for full-text queries
```

### Query Optimization Techniques
1. **Connection Pooling**: Efficient database connection management
2. **Query Caching**: Redis layer for frequently accessed data
3. **Materialized Views**: Pre-computed aggregations
4. **Pagination**: Cursor-based for consistent results
5. **Background Jobs**: Async processing for heavy operations

### API Performance Targets
- **Core Operations**: <200ms response time
- **Search Queries**: <500ms with full-text search
- **Image Upload**: <2s including processing
- **Real-time Updates**: <100ms propagation

## 📈 Analytics & Business Intelligence

### User Behavior Tracking
```sql
Analytics Tables:
- Daily user activity patterns
- Feature usage statistics  
- Recommendation effectiveness metrics
- Search behavior analysis
- Social engagement patterns
```

### Machine Learning Data Pipeline
1. **Feature Extraction**: User taste profiles, interaction patterns
2. **Training Data**: Recommendation outcomes, user feedback
3. **Model Training**: Collaborative filtering, content-based matching
4. **A/B Testing**: Algorithm performance comparison
5. **Continuous Learning**: Automatic model updates

### Business Metrics Dashboard
- **User Engagement**: Daily/monthly active users, session duration
- **Content Quality**: Experience logging rates, photo upload rates
- **Social Growth**: Friend connections, sharing frequency
- **Recommendation Success**: Click-through rates, conversion metrics

## 🚀 Scalability & Architecture Evolution

### Current Capacity Planning
- **Users**: Designed for 100K+ concurrent users
- **Data**: Optimized for 10M+ food experiences
- **Storage**: Scalable to multi-TB image/video content
- **API**: 10K+ requests/second capability

### Horizontal Scaling Strategy
1. **Read Replicas**: Analytical queries and search operations
2. **Connection Pooling**: Handle high concurrent load
3. **CDN Integration**: Global media distribution
4. **Microservice Migration**: Future service decomposition
5. **Caching Layers**: Redis for hot data, edge caching for media

### Future Architecture Considerations
- **GraphQL API**: More efficient client data fetching
- **Event Sourcing**: Complete user journey tracking
- **Machine Learning Pipeline**: Real-time recommendation serving
- **Multi-Region Deployment**: Global latency optimization
- **Advanced Analytics**: Predictive taste modeling

## 🛠️ Development & Deployment

### Environment Setup
```bash
# Local Development
supabase start
supabase db reset
supabase db seed

# Environment Variables
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Migration Strategy
1. **Schema Migrations**: Version-controlled database changes
2. **Data Migrations**: Backfill and transformation scripts
3. **Zero-Downtime Deployment**: Blue-green deployment pattern
4. **Rollback Procedures**: Automated failure recovery
5. **Testing Pipeline**: Comprehensive integration tests

### Monitoring & Observability
- **Health Checks**: Database, API, and storage monitoring
- **Performance Metrics**: Query times, error rates, throughput
- **User Experience**: Real user monitoring, error tracking
- **Business Metrics**: Daily active users, feature adoption
- **Alert System**: Proactive issue notification

## 🎯 API Design Principles

### RESTful Endpoints
```
GET    /api/experiences        # List user's food experiences
POST   /api/experiences        # Create new experience
GET    /api/restaurants        # Search restaurants
GET    /api/recommendations    # Get personalized recommendations
POST   /api/friends            # Manage friendships
GET    /api/feed              # Social feed with friends' activities
```

### RPC Functions (Complex Operations)
```sql
Functions:
- get_restaurant_recommendations() # AI-powered suggestions
- search_experiences() # Advanced experience discovery
- calculate_taste_similarity() # User compatibility scoring
- get_user_statistics() # Comprehensive user insights
```

### WebSocket Real-Time Events
```javascript
Channels:
- user:{user_id}:recommendations # Personal recommendations
- user:{user_id}:friends # Friend activity updates
- user:{user_id}:feed # Social feed updates
```

## 📋 Implementation Checklist

### Phase 1: Core Infrastructure ✅
- [x] Database schema design with emotional modeling
- [x] User authentication and profile management  
- [x] Row-level security policies implementation
- [x] Storage buckets and media handling
- [x] Basic API functions and endpoints

### Phase 2: Social Features (Next)
- [ ] Friend system implementation
- [ ] Experience sharing mechanisms
- [ ] Social feed generation
- [ ] Real-time notifications
- [ ] Privacy control interfaces

### Phase 3: AI Recommendations (Future)
- [ ] Taste similarity algorithm deployment
- [ ] Recommendation engine optimization
- [ ] A/B testing framework
- [ ] Machine learning pipeline
- [ ] Advanced personalization features

### Phase 4: Advanced Features (Future)
- [ ] Advanced search and discovery
- [ ] Restaurant owner tools
- [ ] Business analytics dashboard
- [ ] Mobile app optimization
- [ ] Global scaling infrastructure

---

This backend architecture provides a solid foundation for the Kuchisabishii application, emphasizing the unique emotional approach to food experiences while maintaining technical excellence in scalability, security, and performance. The modular design allows for iterative development and feature evolution based on user feedback and business requirements.