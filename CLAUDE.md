# Kuchisabishii - Food Journaling & Recommendation App

## Objective
Design and develop "Kuchisabishii"  a cross-platform food journaling and recommendation app. It must function as a native mobile app (iOS & Android) and be operable via desktop browser with responsive design.

## Problem
- Users often forget what they ate and how they felt about it
- Deciding what to eat is difficult due to generic restaurant apps
- Current food and restaurant review platforms are impersonal, generic, and not food-centric

## Solution Overview
- A food-first, personalized review app for remembering, journaling, and recommending dishes and restaurants
- Fast onboarding, easy to use, and intuitive UX
- Personalized food experience logging and discovery powered by individual taste history and metadata
- Food-centric social sharing and recommendations
- Separate restaurant reviews for service and atmosphere

## Feature Requirements

### 1. Onboarding & User Profiles
- Quick account setup
- Taste preferences
- Dietary restrictions
- Location settings

### 2. Food Log
- Name, date, photo/video
- Tasting notes: basic taste, mouthfeel, smell
- Meal time: breakfast, lunch, etc.
- Dining method: dine-in, takeout, delivery
- Spending
- Experience (5-tier scale)

### 3. Restaurant Review
- Cleanliness, parking, bathrooms, kid-friendliness, dietary options, seating
- Service: 15 stars
- Atmosphere: 15 stars

### 4. Restaurant Database
- Preloaded menus
- Add new restaurants if not found
- Claim/verify restaurant ownership

### 5. Friend System
- Add/share food and reviews with friends
- View friends' recommendations

### 6. Intelligent Recommendations
- Based on user's taste history
- Based on similar users' preferences

### 7. Categorized Search
- By food, restaurant, cuisine, category

## Technical Stack
- **Mobile**: React Native with Expo
- **Web**: Next.js with Tailwind CSS v4
- **Backend**: Supabase
- **Language**: TypeScript
- **CI/CD**: GitHub Actions

## Architecture Priorities
- UX consistency across platforms
- Offline-first capability
- Privacy-focused data model
- Data portability for users

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run linting
- `npm run type-check` - TypeScript type checking