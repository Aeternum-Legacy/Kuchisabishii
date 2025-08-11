// Core types for the Kuchisabishii application

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodEntry {
  id: string;
  userId: string;
  title: string;
  description?: string;
  images: string[];
  location?: Location;
  rating: number; // 1-5 stars
  emotionalRating: EmotionalRating;
  tags: string[];
  category: FoodCategory;
  price?: number;
  currency?: string;
  tastingNotes?: TastingNotes;
  mouthfeel?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export enum FoodCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  DRINK = 'drink',
  OTHER = 'other'
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: Date;
  foodEntries: FoodEntry[];
  notes?: string;
  mood?: Mood;
  createdAt: Date;
  updatedAt: Date;
}

export enum Mood {
  VERY_HAPPY = 'very_happy',
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
  VERY_SAD = 'very_sad'
}

// Emotional Rating System for Kuchisabishii (Lonely Mouth)
export enum EmotionalRating {
  NEVER_AGAIN = 1, // "Never again" - Deeply disappointing
  MEH = 2,         // "Meh" - Forgettable
  OKAY = 3,        // "It's okay" - Neutral
  CRAVING_WORTHY = 4, // "I'd crave this" - Creates desire
  MOUTH_LONELY = 5    // "When my mouth is lonely" - Perfect soulmate
}

// Detailed tasting notes for emotional memory
export interface TastingNotes {
  taste?: 'sweet' | 'salty' | 'sour' | 'bitter' | 'umami' | 'spicy';
  mouthfeel?: 'creamy' | 'crunchy' | 'tender' | 'chewy' | 'crispy' | 'smooth';
  smell?: string; // Free-form emotional description
  emotionalContext?: string; // "Felt like a warm hug", "Reminded me of home"
  wouldEatWhen?: 'stressed' | 'happy' | 'lonely' | 'celebrating' | 'nostalgic' | 'adventurous';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}