# Database Setup Guide for Kuchisabishii

## Overview

The Kuchisabishii app has a comprehensive Supabase database architecture ready for custom food reviews with imaging capabilities. Here's how to get it running.

## Current Status ✅

**Already Configured:**
- ✅ Complete database schema with emotional food experiences
- ✅ Storage buckets for food images, videos, and profile images
- ✅ Row-level security policies
- ✅ AI recommendation engine functions
- ✅ Migration files ready to deploy
- ✅ Supabase config.toml optimized
- ✅ Environment variables template created

## Database Features

### 🍽️ Food Experiences Table
- Rich emotional and sensory data capture
- Photo/video attachment support
- Detailed taste profiling (sweet, savory, spicy, etc.)
- Mood tracking (before/after eating)
- Cost and value assessment
- Social sharing capabilities

### 📸 Image Storage
- **food-images**: Up to 10MB per image (JPEG, PNG, WebP, HEIC)
- **food-videos**: Up to 50MB per video (MP4, QuickTime, WebM)  
- **profile-images**: Up to 5MB per avatar (JPEG, PNG, WebP)

### 🤖 AI Recommendations
- Taste similarity matching
- Social recommendations from friends
- Location-based suggestions
- Learning from user interactions

## Setup Options

### Option 1: Local Development (Recommended)

**Prerequisites:**
- Docker Desktop installed and running
- Node.js 18+ installed

**Steps:**
```bash
# 1. Start Docker Desktop first

# 2. Initialize Supabase locally
npx supabase start

# 3. Apply all migrations
npx supabase db reset

# 4. Access Supabase Studio
# Open http://localhost:54323
```

**Local URLs:**
- Supabase Studio: http://localhost:54323
- Database URL: postgresql://postgres:postgres@localhost:54322/postgres
- API URL: http://localhost:54321

### Option 2: Supabase Cloud (Production Ready)

1. Create new project at https://supabase.com
2. Copy your project URL and anon key
3. Update `.env.local` with your credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
4. Run migrations in Supabase Studio SQL editor

## Testing Custom Food Reviews

### Sample Food Experience Entry
```json
{
  "name": "Korean Fried Chicken",
  "location": "Seoul House",
  "cuisineType": "Korean",
  "foodType": "Main Dish",
  "kuchisabishiRating": 5,
  "basicTastes": {
    "sweet": 3,
    "savoury": 5,
    "sour": 1,
    "spicy": 4,
    "umami": 5,
    "bitter": 0
  },
  "mouthfeel": ["Crispy", "Juicy", "Hot"],
  "smell": ["Savory", "Garlicky"],
  "emotions": ["satisfied", "nostalgic", "happy"],
  "mood_before": "tired",
  "mood_after": "energized",
  "satisfaction_level": 9,
  "cost": 24.99,
  "worth_cost": "definitely",
  "experience": "Absolutely incredible! The perfect crunch gave way to tender, juicy meat. The glaze was the perfect balance of sweet, salty, and spicy. This is exactly what I crave when my mouth is lonely!"
}
```

### Image Upload Flow
1. Take photo of food
2. Upload to `food-images` bucket
3. Store image URL in `food_experiences.image_url`
4. Images automatically optimized and served via CDN

## Database Schema Highlights

### Core Tables
- `user_profiles` - User info and preferences
- `food_experiences` - Main food logging table
- `taste_experiences` - Detailed sensory analysis  
- `restaurants` - Restaurant database
- `friendships` - Social connections
- `recommendation_interactions` - ML training data

### Key Features
- **Emotional Context**: Track mood before/after eating
- **Sensory Analysis**: 6 basic tastes + texture + aroma
- **Social Sharing**: Share with friends, get recommendations
- **Privacy Controls**: Public/private/friends-only settings
- **AI Learning**: System learns from your preferences

## Next Steps

1. **Start Docker Desktop**
2. **Run `npx supabase start`** to initialize local database
3. **Test food review creation** in the app
4. **Upload sample images** to test storage
5. **Explore Supabase Studio** to see your data

## Support

The database architecture supports:
- ✅ Custom food reviews with rich metadata
- ✅ Image and video uploads  
- ✅ Emotional food journaling
- ✅ AI-powered recommendations
- ✅ Social food sharing
- ✅ Privacy controls
- ✅ Real-time updates

Ready to capture your food experiences with full emotional context and beautiful imagery! 🍽️📸