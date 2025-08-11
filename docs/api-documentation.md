# Kuchisabishii Backend API Documentation

## Overview
The Kuchisabishii backend provides a comprehensive set of APIs for emotional food journaling, personalized recommendations, social features, and advanced analytics. Built on Supabase with custom Edge Functions for AI/ML capabilities.

## Table of Contents
- [Authentication](#authentication)
- [Core APIs](#core-apis)
- [Edge Functions](#edge-functions)
- [Real-time Features](#real-time-features)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Data Models](#data-models)

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "data": {
    "display_name": "John Doe",
    "username": "johndoe"
  }
}
```

#### Sign In
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Social Authentication
```http
POST /auth/v1/authorize?provider=google
```

Supported providers: `google`, `apple`, `facebook`

## Core APIs

### User Management

#### Get User Profile
```http
GET /rest/v1/users?id=eq.{user_id}
Authorization: Bearer <token>
```

#### Update User Profile
```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "display_name": "Updated Name",
  "bio": "Food enthusiast from NYC",
  "dietary_restrictions": ["vegetarian", "gluten_free"],
  "favorite_cuisines": ["italian", "japanese"]
}
```

#### Get User Taste Profile
```http
GET /rest/v1/user_preferences?user_id=eq.{user_id}
Authorization: Bearer <token>
```

### Food Experiences

#### Create Food Experience
```http
POST /rest/v1/food_entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Amazing Ramen Bowl",
  "description": "Best tonkotsu ramen I've ever had",
  "restaurant_id": "uuid-here",
  "category": "dinner",
  "rating": 4.8,
  "price": 14.99,
  "currency": "USD",
  "tags": ["ramen", "comfort_food", "japanese"],
  "ingredients": ["pork_broth", "wheat_noodles", "green_onions"],
  "spice_level": 3,
  "images": ["https://example.com/image1.jpg"],
  "consumed_at": "2024-01-15T19:30:00Z",
  "notes": "Perfect temperature and texture"
}
```

#### Create Emotional Experience
```http
POST /rest/v1/emotional_experiences
Authorization: Bearer <token>
Content-Type: application/json

{
  "food_experience_id": "uuid-here",
  "pre_meal_emotions": ["hungry", "tired"],
  "pre_meal_mood_level": 6,
  "post_meal_emotions": ["satisfied", "happy", "content"],
  "post_meal_mood_level": 9,
  "mood_impact": "very_positive",
  "comfort_factor": 8,
  "emotional_intensity": 7,
  "emotional_journey_notes": "This meal completely turned my day around"
}
```

#### Get User's Food Journey
```http
GET /rest/v1/food_entries?user_id=eq.{user_id}&order=consumed_at.desc&limit=50
Authorization: Bearer <token>
```

### Restaurant Data

#### Search Restaurants
```http
GET /rest/v1/restaurants?name=ilike.*{query}*&is_active=eq.true
Authorization: Bearer <token>
```

#### Get Restaurant Details
```http
GET /rest/v1/restaurants?id=eq.{restaurant_id}
Authorization: Bearer <token>
```

#### Get Restaurant Menu
```http
GET /rest/v1/menu_items?restaurant_id=eq.{restaurant_id}&is_available=eq.true
Authorization: Bearer <token>
```

### Reviews

#### Create Restaurant Review
```http
POST /rest/v1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurant_id": "uuid-here",
  "title": "Great Experience",
  "content": "Excellent food and service...",
  "rating": 4.5,
  "food_rating": 4.8,
  "service_rating": 4.2,
  "atmosphere_rating": 4.3,
  "visit_date": "2024-01-15",
  "party_size": 2,
  "total_cost": 85.50,
  "recommended_dishes": ["tonkotsu_ramen", "gyoza"]
}
```

### Social Features

#### Send Friend Request
```http
POST /rest/v1/friendships
Authorization: Bearer <token>
Content-Type: application/json

{
  "addressee_id": "uuid-here"
}
```

#### Accept Friend Request
```http
PATCH /rest/v1/friendships?id=eq.{friendship_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

#### Get Friends Activity Feed
```http
GET /rest/v1/user_activities?user_id=in.({friend_ids})&is_public=eq.true&order=created_at.desc
Authorization: Bearer <token>
```

## Edge Functions

### AI-Powered Recommendations

#### Get Personalized Recommendations
```http
POST /functions/v1/ai-recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid-here",
  "type": "restaurants",
  "preferences": {
    "cuisines": ["japanese", "italian"],
    "priceRange": [2, 3],
    "maxDistance": 25,
    "moodContext": "comfort_seeking"
  },
  "context": {
    "currentLocation": {"lat": 40.7128, "lng": -74.0060},
    "timeOfDay": "dinner",
    "mood": "tired",
    "socialContext": "solo"
  },
  "limit": 10
}
```

Response:
```json
{
  "recommendations": [
    {
      "id": "restaurant-uuid",
      "type": "restaurant",
      "title": "Authentic Ramen House",
      "description": "Cozy Japanese restaurant perfect for solo dining",
      "rating": 4.6,
      "confidenceScore": 0.89,
      "reasoning": ["Matches your taste profile", "Great for comfort food"],
      "emotionalMatch": 0.92,
      "actions": {
        "viewDetails": "/restaurants/uuid",
        "addToWishlist": true
      }
    }
  ],
  "metadata": {
    "generatedAt": "2024-01-15T20:30:00Z",
    "userProfile": {
      "tasteProfileCompleteness": 0.85,
      "experienceCount": 127
    }
  }
}
```

### Emotional Analytics

#### Get Emotional Insights
```http
POST /functions/v1/emotional-analytics
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid-here",
  "timeRange": "month",
  "analysisType": "mood_trends"
}
```

Response:
```json
{
  "insights": [
    {
      "type": "mood_trends",
      "title": "Emotional Food Journey",
      "description": "Your food experiences show an improving emotional trend with 78.5% positive emotions.",
      "score": 78.5,
      "trend": "improving",
      "recommendations": [
        "Continue exploring new dining experiences",
        "Consider keeping a gratitude journal for meals"
      ],
      "data": {
        "moodProgression": [...],
        "emotionalBalance": 78.5,
        "averageSatisfaction": 7.2
      }
    }
  ]
}
```

### Advanced Search

#### Intelligent Search
```http
POST /functions/v1/advanced-search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "spicy ramen near me",
  "type": "global",
  "filters": {
    "cuisine": ["japanese"],
    "distance": {"lat": 40.7128, "lng": -74.0060, "radius": 10},
    "rating": {"min": 4.0}
  },
  "personalization": {
    "useHistory": true,
    "useTasteProfile": true
  },
  "ranking": {
    "algorithm": "ml_enhanced",
    "weights": {
      "textMatch": 0.3,
      "personalRelevance": 0.4,
      "quality": 0.3
    }
  },
  "aggregations": {
    "facets": true,
    "suggestions": true
  }
}
```

Response:
```json
{
  "results": [
    {
      "id": "restaurant-uuid",
      "type": "restaurant",
      "title": "Tokyo Ramen Bar",
      "description": "Authentic spicy ramen with rich tonkotsu broth",
      "rating": 4.7,
      "score": {
        "relevance": 0.95,
        "personalization": 0.88,
        "final": 0.91
      },
      "highlights": ["<mark>spicy</mark> <mark>ramen</mark>"],
      "context": {
        "distance": 2.3,
        "matchingTags": ["spicy", "ramen", "authentic"]
      }
    }
  ],
  "facets": {
    "cuisines": [{"name": "Japanese", "count": 15}],
    "priceRanges": [{"range": "$$", "count": 8}]
  },
  "suggestions": ["spicy miso ramen", "tonkotsu ramen nyc"]
}
```

### Media Processing

#### Upload and Analyze Food Image
```http
POST /functions/v1/media-processing
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "upload",
  "mediaType": "image",
  "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "fileName": "ramen_bowl.jpg",
  "contentType": "image/jpeg",
  "analysisOptions": {
    "foodRecognition": true,
    "nutritionAnalysis": true,
    "aestheticScoring": true,
    "colorAnalysis": true
  },
  "metadata": {
    "experienceId": "uuid-here",
    "dishName": "Tonkotsu Ramen"
  }
}
```

Response:
```json
{
  "success": true,
  "mediaUrl": "https://storage.supabase.co/...",
  "thumbnailUrl": "https://storage.supabase.co/.../thumb",
  "analysis": {
    "foodRecognition": {
      "detectedFoods": [
        {
          "name": "Ramen",
          "confidence": 0.92,
          "category": "Main Course",
          "cuisine": "Japanese"
        }
      ],
      "confidence": 0.89
    },
    "nutritionEstimate": {
      "estimatedCalories": 450,
      "macronutrients": {
        "protein": 20,
        "carbohydrates": 55,
        "fat": 15
      }
    },
    "aestheticScore": {
      "overallScore": 8.2,
      "composition": 8.5,
      "lighting": 7.8,
      "suggestions": ["Consider adjusting lighting to reduce shadows"]
    }
  }
}
```

## Real-time Features

### Supabase Realtime Subscriptions

#### Subscribe to Friend Activity
```javascript
supabase
  .from('user_activities')
  .on('INSERT', payload => {
    // Handle new friend activity
  })
  .subscribe()
```

#### Subscribe to New Recommendations
```javascript
supabase
  .from('restaurant_recommendations')
  .on('INSERT', payload => {
    // Handle new recommendation
  })
  .subscribe()
```

#### Real-time Chat (Coming Soon)
```javascript
supabase
  .from('messages')
  .on('*', payload => {
    // Handle chat messages
  })
  .subscribe()
```

## Error Handling

### Standard HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2024-01-15T20:30:00Z",
    "requestId": "req_123456"
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` - Missing or invalid token
- `PERMISSION_DENIED` - Insufficient permissions
- `VALIDATION_ERROR` - Request validation failed
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `PROCESSING_ERROR` - Error during AI/ML processing

## Rate Limiting

### Default Limits
- Authenticated users: 1000 requests/hour
- Anonymous users: 100 requests/hour
- Search API: 200 requests/hour per user
- Media processing: 50 uploads/hour per user
- AI recommendations: 100 requests/hour per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1642291200
```

## Data Models

### Core Entities

#### User
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio?: string;
  profile_image?: string;
  location?: string;
  dietary_restrictions: string[];
  favorite_cuisines: string[];
  privacy_level: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
}
```

#### Food Experience
```typescript
interface FoodExperience {
  id: string;
  user_id: string;
  restaurant_id?: string;
  title: string;
  description?: string;
  notes?: string;
  images: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';
  occasion: 'casual' | 'date' | 'business' | 'celebration' | 'family' | 'friends' | 'solo';
  rating: number; // 1-5
  price?: number;
  currency: string;
  tags: string[];
  ingredients: string[];
  spice_level?: number; // 1-5
  consumed_at: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Emotional Experience
```typescript
interface EmotionalExperience {
  id: string;
  food_experience_id: string;
  user_id: string;
  pre_meal_emotions: EmotionalState[];
  pre_meal_mood_level: number; // 1-10
  post_meal_emotions: EmotionalState[];
  post_meal_mood_level: number; // 1-10
  mood_impact: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  comfort_factor: number; // 1-10
  emotional_intensity: number; // 1-10
  emotional_journey_notes?: string;
  created_at: string;
}
```

#### Restaurant
```typescript
interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  cuisine_types: string[];
  price_range: number; // 1-4
  rating: number;
  review_count: number;
  amenities: string[];
  is_verified: boolean;
  photos: string[];
  created_at: string;
  updated_at: string;
}
```

## SDK Usage Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseKey)

// Create food experience
const { data, error } = await supabase
  .from('food_entries')
  .insert({
    title: 'Amazing Pasta',
    rating: 4.5,
    category: 'dinner',
    restaurant_id: 'uuid-here'
  })

// Get AI recommendations
const { data: recommendations } = await supabase.functions.invoke(
  'ai-recommendations',
  {
    body: {
      userId: user.id,
      type: 'restaurants',
      limit: 10
    }
  }
)
```

### React Native
```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Upload image with analysis
const uploadFoodImage = async (uri: string) => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64
  })
  
  const { data } = await supabase.functions.invoke('media-processing', {
    body: {
      type: 'upload',
      mediaType: 'image',
      base64Data: `data:image/jpeg;base64,${base64}`,
      analysisOptions: {
        foodRecognition: true,
        nutritionAnalysis: true
      }
    }
  })
  
  return data
}
```

## Testing

### API Testing with Postman
Import our Postman collection: [Kuchisabishii API Collection](./postman/kuchisabishii.json)

### Integration Testing
```bash
# Run API tests
npm test

# Run specific test suite
npm test -- --grep "Food Experiences"

# Run with coverage
npm run test:coverage
```

## Support

- **Documentation**: [https://docs.kuchisabishii.com](https://docs.kuchisabishii.com)
- **API Status**: [https://status.kuchisabishii.com](https://status.kuchisabishii.com)
- **Support**: [support@kuchisabishii.com](mailto:support@kuchisabishii.com)
- **GitHub**: [https://github.com/kuchisabishii/api](https://github.com/kuchisabishii/api)

## Changelog

### Version 2.0.0 (Current)
- Added emotional analytics engine
- Implemented AI-powered recommendations  
- Enhanced search with ML ranking
- Added media processing with food recognition
- Introduced real-time features
- Improved personalization algorithms

### Version 1.5.0
- Added social features
- Implemented restaurant reviews
- Enhanced user profiles
- Added basic recommendations

### Version 1.0.0
- Initial API release
- Basic food journaling
- User authentication
- Restaurant database