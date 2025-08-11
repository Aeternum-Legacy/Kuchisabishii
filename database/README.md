# Kuchisabishii Database Architecture

## Overview

This directory contains the complete Supabase database architecture for the Kuchisabishii food journaling and recommendation app. The architecture is designed to support emotional food experiences, personalized recommendations, and social food discovery.

## Architecture Highlights

### 🧠 Emotional Data Modeling
- **Taste Experiences**: Detailed sensory analysis (5 basic tastes, textures, temperatures)
- **Emotional Context**: Mood tracking, satisfaction levels, and contextual emotions
- **Memory Enhancement**: Photos, videos, and rich textual descriptions
- **Temporal Patterns**: Time-series analysis of eating habits and preferences

### 🎯 Advanced Recommendation Engine
- **Taste Similarity**: Collaborative filtering based on detailed taste profiles
- **Social Recommendations**: Friend-based suggestions with trust scoring
- **Contextual Matching**: Location, time, weather, and occasion-based recommendations
- **Learning Algorithm**: Continuous improvement based on user interactions

### 🔒 Privacy & Security
- **Row-Level Security**: Comprehensive RLS policies for all tables
- **Granular Permissions**: Fine-tuned access control for different data types
- **Privacy Settings**: User-controlled visibility for profiles and experiences
- **Data Portability**: Built-in support for user data export

## Directory Structure

```
database/
├── schemas/
│   └── core-schema.sql          # Complete database schema
├── policies/
│   └── row-level-security.sql   # RLS policies for all tables
├── functions/
│   ├── recommendation-engine.sql # AI recommendation algorithms
│   ├── search-functions.sql     # Advanced search capabilities
│   ├── api-functions.sql        # API helper functions
│   └── storage-functions.sql    # Media management functions
├── migrations/
│   └── 001_initial_schema.sql   # Complete setup migration
└── README.md                    # This file
```

## Core Tables

### User Management
- `user_profiles` - Extended user information and preferences
- `taste_profiles` - Detailed taste preference modeling
- `recommendation_preferences` - AI recommendation settings

### Food Data
- `restaurants` - Restaurant database with location and features
- `menu_items` - Detailed menu items with nutritional information
- `food_experiences` - Core food journaling with emotional context
- `taste_experiences` - Detailed sensory analysis data

### Social Features
- `friendships` - Friend relationships and connection management
- `shared_experiences` - Social sharing and recommendations
- `restaurant_reviews` - Separate restaurant service/atmosphere reviews

### Analytics & Intelligence
- `user_analytics` - Usage patterns and engagement metrics
- `recommendation_interactions` - ML training data from user interactions
- `search_history` - Search behavior for optimization

## Key Features

### 1. Emotional Food Experiences
```sql
-- Rich emotional and sensory data capture
CREATE TABLE food_experiences (
  emotions TEXT[],                    -- Array of emotional responses
  mood_before TEXT,                   -- Pre-meal emotional state
  mood_after TEXT,                    -- Post-meal emotional state
  satisfaction_level INTEGER,         -- 1-10 satisfaction scale
  mouthfeel JSONB,                   -- Texture descriptions
  aroma_notes TEXT[],                -- Scent descriptors
  -- ... extensive sensory data
);
```

### 2. Advanced Taste Profiling
```sql
-- Detailed taste preference modeling
CREATE TABLE taste_profiles (
  salty_preference INTEGER,           -- 1-10 preference scales
  sweet_preference INTEGER,
  umami_preference INTEGER,
  crunchy_preference INTEGER,
  culinary_adventurousness INTEGER,   -- Willingness to try new things
  cuisine_preferences JSONB,          -- Dynamic cuisine scoring
  -- ... comprehensive taste modeling
);
```

### 3. Intelligent Recommendations
```sql
-- Multi-factor recommendation engine
CREATE FUNCTION get_restaurant_recommendations(
  target_user_id UUID,
  max_distance_km INTEGER DEFAULT 25,
  limit_results INTEGER DEFAULT 10
) RETURNS TABLE(...);

-- Considers:
-- - Taste similarity between users
-- - Friend recommendations with trust scoring
-- - Location and convenience factors
-- - Trending and seasonal preferences
```

### 4. Privacy-First Design
```sql
-- Granular privacy controls
CREATE POLICY "Friends can view friends' public food experiences" 
ON food_experiences FOR SELECT USING (
  NOT is_private AND shared_with_friends AND
  EXISTS (SELECT 1 FROM friendships WHERE status = 'accepted' AND ...)
);
```

## Storage Architecture

### Media Storage Buckets
- **food-images**: Food photos with automatic optimization
- **food-videos**: Short food videos and time-lapses  
- **profile-images**: User avatars and profile media

### Storage Policies
- User-owned content isolation
- Public read access for shared content
- Automatic cleanup of unused media
- Multi-resolution image generation

## API Functions

### Core Operations
- `upsert_user_profile()` - User profile management
- `create_food_experience()` - Rich food logging
- `manage_friendship()` - Social connection management
- `share_food_experience()` - Social recommendation sharing

### Analytics Functions
- `get_user_statistics()` - Comprehensive user insights
- `track_recommendation_interaction()` - ML training data
- `get_recommendation_analytics()` - System performance metrics

## Real-time Features

### WebSocket Subscriptions
- Friend activity notifications
- New recommendation alerts  
- Social sharing updates
- Real-time taste profile updates

### Triggers
- Automatic taste profile learning
- Friend activity notifications
- Search indexing updates
- Analytics data collection

## Performance Optimizations

### Indexing Strategy
- Composite indexes for complex queries
- GiST indexes for location-based searches
- GIN indexes for array and JSON data
- Partial indexes for filtered queries

### Query Optimization
- Materialized views for common aggregations
- Function-based indexes for computed values
- Connection pooling configuration
- Query result caching strategies

## Setup Instructions

### 1. Initialize Database
```bash
# Apply the complete schema
psql -f database/migrations/001_initial_schema.sql

# Load sample data (development only)
psql -f supabase/seed.sql
```

### 2. Configure Storage
```bash
# Storage buckets are created automatically via migration
# Ensure proper CORS settings in Supabase Dashboard
```

### 3. Set Environment Variables
```bash
# Required for OAuth providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id  
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4. Enable Extensions
All necessary PostgreSQL extensions are automatically enabled via migration.

## Security Considerations

### Data Protection
- All PII is encrypted at rest
- Row-level security on all tables
- API key rotation policies
- Audit logging for sensitive operations

### Privacy Controls
- User-controlled data visibility
- Friend-only sharing options
- Private journaling capabilities
- Data export/deletion tools

### Access Control
- Role-based permissions
- Service-level authentication
- API rate limiting
- Geographic access restrictions

## Analytics & Insights

### User Behavior Tracking
- Food logging patterns
- Recommendation interaction rates
- Social sharing behavior
- Taste preference evolution

### System Performance
- Query performance metrics
- Storage usage patterns
- API response times
- Real-time connection health

## Scalability Design

### Horizontal Scaling
- Read replicas for analytical queries
- Connection pooling for high concurrency
- CDN integration for media files
- Background job processing

### Data Archiving
- Automatic old data archiving
- Compressed historical storage
- Selective data retention policies
- User data lifecycle management

## Development Workflow

### Schema Changes
1. Create migration files in `migrations/`
2. Test on development environment
3. Review with team for breaking changes
4. Apply to staging environment
5. Deploy to production with rollback plan

### Function Updates
1. Update function files in `functions/`
2. Run comprehensive test suite
3. Performance impact assessment
4. Staged deployment approach

## Monitoring & Maintenance

### Health Checks
- Database connection monitoring
- Query performance alerts
- Storage usage warnings
- Real-time subscription health

### Backup Strategy
- Automated daily backups
- Point-in-time recovery capability
- Cross-region backup replication
- Regular restore testing

---

This database architecture provides a robust foundation for the Kuchisabishii app, supporting both current requirements and future scale. The emotional-first approach to food data creates unique opportunities for personalized experiences and meaningful social connections around food.