# Emotional Rating System API Documentation

## Overview

The Emotional Rating System is the core feature of Kuchisabishii that captures and analyzes users' emotional relationships with food. This API enables the creation, retrieval, and analysis of emotional ratings tied to food experiences.

## Core Concept: "Mouth Loneliness"

The system is built around the Japanese concept of "kuchisabishii" (口寂しい) - "mouth loneliness" - the feeling of wanting to eat not out of hunger, but for emotional fulfillment. Our 5-point emotional scale reflects this philosophy:

1. **Never again** - This didn't speak to my soul
2. **Disappointed** - Left my mouth wanting  
3. **Neutral** - Filled the space but didn't fill the longing
4. **Satisfied** - Hit the spot nicely
5. **When my mouth is lonely** - I'll dream of this

## API Endpoints

### Create Emotional Rating

Creates a new emotional rating for a food experience.

**Endpoint:** `POST /api/emotional-ratings`

**Request Body:**
```json
{
  "food_experience_id": "uuid",
  "dimensions": {
    "satisfaction": 8,
    "craving": 7,
    "comfort": 9,
    "excitement": 6,
    "nostalgia": 8,
    "social": 5
  },
  "context": {
    "mood_before": "sad",
    "mood_after": "happy",
    "energy_level": "low",
    "social_setting": "alone",
    "occasion": "comfort"
  },
  "emotional_notes": "This ramen reminded me of home...",
  "reminds_me_of": "My grandmother's kitchen"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "food_experience_id": "uuid",
  "primary_rating": 5,
  "dimensions": {
    "satisfaction": 8,
    "craving": 7,
    "comfort": 9,
    "excitement": 6,
    "nostalgia": 8,
    "social": 5
  },
  "context": {
    "mood_before": "sad",
    "mood_after": "happy",
    "energy_level": "low",
    "social_setting": "alone",
    "occasion": "comfort"
  },
  "experience_date": "2025-08-08T10:30:00Z",
  "emotional_notes": "This ramen reminded me of home...",
  "mouth_loneliness_level": 9,
  "would_crave_when": ["sad", "lonely", "stressed", "mouth_is_lonely"],
  "reminds_me_of": "My grandmother's kitchen",
  "emotional_memory_trigger": true,
  "rated_at": "2025-08-08T10:30:00Z"
}
```

### Get Emotional Rating

Retrieves a specific emotional rating.

**Endpoint:** `GET /api/emotional-ratings/{id}`

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "food_experience_id": "uuid",
  "primary_rating": 5,
  "dimensions": { /* ... */ },
  "context": { /* ... */ },
  "emotional_notes": "string",
  "mouth_loneliness_level": 9,
  "would_crave_when": ["sad", "lonely"],
  "reminds_me_of": "string",
  "emotional_memory_trigger": true,
  "rated_at": "2025-08-08T10:30:00Z"
}
```

### Update Emotional Rating

Updates an existing emotional rating.

**Endpoint:** `PUT /api/emotional-ratings/{id}`

**Request Body:** Same as create, but all fields are optional.

### Delete Emotional Rating

Deletes an emotional rating.

**Endpoint:** `DELETE /api/emotional-ratings/{id}`

### Get User's Emotional Ratings

Retrieves all emotional ratings for the current user with pagination.

**Endpoint:** `GET /api/emotional-ratings`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sort` (string): Sort field (default: 'rated_at')
- `order` (string): Sort order ('asc' or 'desc', default: 'desc')
- `primary_rating` (number): Filter by primary rating
- `mouth_loneliness_level` (string): Filter by loneliness level ('high', 'medium', 'low')

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "primary_rating": 5,
      "dimensions": { /* ... */ },
      "food_experience": {
        "dish_name": "Tonkotsu Ramen",
        "restaurant_name": "Comfort Ramen Ya"
      },
      "mouth_loneliness_level": 9,
      "rated_at": "2025-08-08T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Emotional Pattern Analysis

### Get User's Emotional Pattern

Retrieves the user's emotional eating patterns.

**Endpoint:** `GET /api/emotional-patterns`

**Response:**
```json
{
  "user_id": "uuid",
  "comfort_food_triggers": ["stressed", "sad", "lonely"],
  "adventure_food_readiness": ["excited", "celebrating"],
  "social_food_preferences": {
    "alone": ["comfort", "simple"],
    "with_friends": ["adventurous", "social"],
    "with_family": ["nostalgic", "traditional"]
  },
  "satisfaction_trend": [7, 8, 6, 9, 8, 7, 8],
  "comfort_seeking_frequency": 15,
  "adventure_seeking_frequency": 8,
  "mouth_loneliness_frequency": 12,
  "preferred_comfort_responses": [4, 5, 5, 4, 5],
  "emotional_food_associations": {
    "stressed": ["ramen", "pizza", "ice_cream"],
    "happy": ["sushi", "tacos", "wine"],
    "lonely": ["comfort_soup", "mac_cheese", "cookies"]
  },
  "last_updated": "2025-08-08T10:30:00Z"
}
```

## Recommendation Endpoints

### Get Mood-Based Recommendations

Get food recommendations based on current emotional state.

**Endpoint:** `GET /api/recommendations/mood`

**Query Parameters:**
- `current_mood` (string): Current emotional state
- `social_setting` (string): Current social context
- `limit` (number): Number of recommendations (default: 10)

**Response:**
```json
{
  "recommendations": [
    {
      "food_experience_id": "uuid",
      "dish_name": "Tonkotsu Ramen",
      "restaurant_name": "Comfort Ramen Ya",
      "confidence_score": 0.92,
      "reasoning": "Based on your pattern, you crave comfort foods when sad and eating alone",
      "expected_satisfaction": 9,
      "expected_comfort": 10,
      "mouth_loneliness_match": 9,
      "previous_rating": {
        "primary_rating": 5,
        "mouth_loneliness_level": 9
      }
    }
  ],
  "mood_context": {
    "detected_pattern": "comfort_seeking",
    "confidence": 0.87,
    "similar_occasions": 12
  }
}
```

### Get Craving Predictions

Predict what the user might crave based on emotional triggers.

**Endpoint:** `GET /api/recommendations/cravings`

**Query Parameters:**
- `trigger` (string): Emotional trigger or situation
- `limit` (number): Number of predictions (default: 5)

**Response:**
```json
{
  "predictions": [
    {
      "food_category": "comfort_soup",
      "probability": 0.85,
      "typical_dishes": ["ramen", "pho", "chicken_soup"],
      "emotional_reasoning": "You consistently seek warm, comforting liquids when stressed"
    }
  ],
  "trigger_analysis": {
    "frequency": 15,
    "success_rate": 0.78,
    "typical_satisfaction": 8.2
  }
}
```

## Data Models

### EmotionalDimensions

```typescript
interface EmotionalDimensions {
  satisfaction: number;    // 1-10: Overall satisfaction
  craving: number;        // 1-10: How much you'd crave this again
  comfort: number;        // 1-10: Emotional comfort provided
  excitement: number;     // 1-10: Adventure/novelty factor
  nostalgia: number;      // 0-10: Memory/nostalgia trigger
  social: number;         // 0-10: Social bonding factor
}
```

### EmotionalContext

```typescript
interface EmotionalContext {
  mood_before: 'happy' | 'sad' | 'neutral' | 'excited' | 'stressed' | 'lonely' | 'angry' | 'anxious';
  mood_after: 'happy' | 'sad' | 'neutral' | 'excited' | 'satisfied' | 'disappointed' | 'comforted' | 'thrilled';
  energy_level: 'low' | 'medium' | 'high' | 'excited';
  social_setting: 'alone' | 'with_friends' | 'with_family' | 'on_date' | 'with_colleagues';
  occasion: 'regular' | 'comfort' | 'celebration' | 'special' | 'business' | 'romantic';
}
```

### EmotionalScale

```typescript
enum EmotionalScale {
  NEVER_AGAIN = 1,           // "Never again - this didn't speak to my soul"
  DISAPPOINTED = 2,          // "Disappointed - left my mouth wanting"
  NEUTRAL = 3,               // "Neutral - filled the space but didn't fill the longing"
  SATISFIED = 4,             // "Satisfied - hit the spot nicely"
  WHEN_MOUTH_IS_LONELY = 5   // "When my mouth is lonely - I'll dream of this"
}
```

## Error Responses

All endpoints return standard HTTP status codes with JSON error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid emotional dimensions",
    "details": {
      "satisfaction": "Must be between 1 and 10",
      "comfort": "Must be between 1 and 10"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Access denied
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limits

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **Recommendation endpoints**: 60 requests per minute per user

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Webhooks

### Emotional Pattern Updated

Triggered when a user's emotional pattern is updated with new data.

```json
{
  "event": "emotional_pattern.updated",
  "user_id": "uuid",
  "pattern_changes": {
    "comfort_seeking_frequency": {
      "old": 12,
      "new": 15
    },
    "new_triggers": ["homesick"]
  },
  "timestamp": "2025-08-08T10:30:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { EmotionalRatingService } from '@kuchisabishii/shared';

// Create emotional rating
const rating = EmotionalRatingService.createEmotionalRating(
  userId,
  foodExperienceId,
  {
    satisfaction: 9,
    craving: 8,
    comfort: 10,
    excitement: 6,
    nostalgia: 9,
    social: 4
  },
  {
    mood_before: 'sad',
    mood_after: 'happy',
    energy_level: 'low',
    social_setting: 'alone',
    occasion: 'comfort'
  },
  'This ramen filled the void in my heart',
  'Sunday dinners at home'
);

// Calculate mouth loneliness level
const loneliness = EmotionalRatingService.calculateMouthLonelinessLevel(
  dimensions,
  context
);
```

### React Hook Example

```typescript
import { useEmotionalRating } from '@kuchisabishii/shared';

function EmotionalRatingForm() {
  const { createRating, loading, error } = useEmotionalRating();
  
  const handleSubmit = async (data) => {
    const rating = await createRating({
      food_experience_id: foodId,
      dimensions: data.dimensions,
      context: data.context,
      emotional_notes: data.notes
    });
    
    // Rating created with automatic mouth loneliness calculation
    console.log(`Mouth loneliness level: ${rating.mouth_loneliness_level}`);
  };
  
  // ... rest of component
}
```

## Best Practices

1. **Always validate input** - Use the provided schemas for client-side validation
2. **Handle emotional memory triggers** - Check for `emotional_memory_trigger` to provide enhanced UX
3. **Respect mouth loneliness concept** - Present ratings in the context of emotional fulfillment, not just taste
4. **Use batch operations** - When updating multiple ratings, use batch endpoints
5. **Cache emotional patterns** - Pattern data changes infrequently, cache aggressively
6. **Monitor recommendation accuracy** - Track click-through and satisfaction rates

## Changelog

### v1.0.0 (Current)
- Initial release with core emotional rating functionality
- Mouth loneliness calculation algorithm
- Basic recommendation engine
- Real-time emotional pattern updates

### Upcoming Features
- Advanced ML-based pattern recognition
- Social emotional sharing
- Temporal emotion analysis
- Cross-cultural emotional mapping