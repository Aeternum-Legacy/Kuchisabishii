# Kuchisabishii - Architecture Overview

## Project Structure

Kuchisabishii is a monorepo containing multiple applications and shared code:

```
kuchisabishii/
├── web/                    # Next.js web application
├── mobile/                 # React Native/Expo mobile app
├── shared/                 # Shared TypeScript types and utilities
├── docs/                   # Documentation
├── tsconfig.json          # Root TypeScript configuration
└── .eslintrc.js          # Root ESLint configuration
```

## Applications

### Web Application (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Features**:
  - Server-side rendering
  - Responsive design
  - Progressive Web App capabilities
  - Food journal management
  - User authentication
  - Photo upload and management

### Mobile Application (React Native/Expo)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **Language**: TypeScript
- **Features**:
  - Native mobile experience
  - Camera integration
  - Location services
  - Offline capabilities
  - Push notifications
  - Cross-platform (iOS/Android)

### Shared Package
- **Purpose**: Common types, utilities, and business logic
- **Language**: TypeScript
- **Exports**:
  - Type definitions for all data models
  - Utility functions for data manipulation
  - Validation helpers
  - Common constants

## Technology Stack

### Frontend
- **Web**: Next.js 14, React, Tailwind CSS
- **Mobile**: React Native, Expo
- **State Management**: React Context API / Redux Toolkit (TBD)
- **UI Components**: Custom components with Tailwind

### Backend (Future)
- **API**: Node.js with Express or Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js or Firebase Auth
- **File Storage**: AWS S3 or Cloudinary
- **Deployment**: Vercel (web) + Expo Application Services (mobile)

## Data Models

### Core Entities
- **User**: User profile and authentication data
- **FoodEntry**: Individual food items with photos and details
- **JournalEntry**: Daily journal entries containing multiple food entries
- **Location**: Restaurant/location information with geolocation

### Key Features
- Photo-centric food logging
- Rating system (1-5 stars)
- Categorization (breakfast, lunch, dinner, etc.)
- Mood tracking
- Location-based entries
- Search and filtering
- Social sharing capabilities

## Development Workflow

### Shared Development
1. Update shared types/utilities in `shared/`
2. Build shared package: `npm run build`
3. Use updated types in web/mobile apps

### Cross-Platform Features
- Shared business logic and type safety
- Consistent data models across platforms
- Unified API interfaces
- Common utility functions

## Future Enhancements
- Real-time synchronization
- Social features (following, sharing)
- Recipe recommendations
- Nutritional tracking
- Export capabilities
- Integration with health apps