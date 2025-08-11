// API-specific types that extend database types
import type { Database } from './database';

// Helper types for cleaner API interfaces
export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];
export type DbFoodEntry = Database['public']['Tables']['food_entries']['Row'];
export type DbReview = Database['public']['Tables']['reviews']['Row'];
export type DbFriendship = Database['public']['Tables']['friendships']['Row'];
export type DbUserPreferences = Database['public']['Tables']['user_preferences']['Row'];

// Insert types
export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type InsertRestaurant = Database['public']['Tables']['restaurants']['Insert'];
export type InsertFoodEntry = Database['public']['Tables']['food_entries']['Insert'];
export type InsertReview = Database['public']['Tables']['reviews']['Insert'];
export type InsertFriendship = Database['public']['Tables']['friendships']['Insert'];

// Update types
export type UpdateUser = Database['public']['Tables']['users']['Update'];
export type UpdateRestaurant = Database['public']['Tables']['restaurants']['Update'];
export type UpdateFoodEntry = Database['public']['Tables']['food_entries']['Update'];
export type UpdateReview = Database['public']['Tables']['reviews']['Update'];
export type UpdateFriendship = Database['public']['Tables']['friendships']['Update'];

// Enum types
export type FoodCategory = Database['public']['Enums']['food_category'];
export type MealOccasion = Database['public']['Enums']['meal_occasion'];
export type FriendshipStatus = Database['public']['Enums']['friendship_status'];
export type ActivityType = Database['public']['Enums']['activity_type'];
export type CollectionItemType = Database['public']['Enums']['collection_item_type'];

// Extended API types with joined relations
export interface UserProfile extends DbUser {
  friends_count?: number;
  followers_count?: number;
  following_count?: number;
  food_entries_count?: number;
  reviews_count?: number;
  is_friend?: boolean;
  is_following?: boolean;
  mutual_friends?: Array<{
    id: string;
    display_name: string;
    profile_image?: string;
  }>;
}

export interface RestaurantWithDetails extends DbRestaurant {
  recent_reviews?: Array<ReviewWithUser>;
  user_review?: DbReview;
  distance_km?: number;
  is_favorited?: boolean;
  visit_count?: number;
}

export interface FoodEntryWithDetails extends DbFoodEntry {
  user: Pick<DbUser, 'id' | 'username' | 'display_name' | 'profile_image'>;
  restaurant?: Pick<DbRestaurant, 'id' | 'name' | 'address' | 'city'>;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface ReviewWithUser extends DbReview {
  user: Pick<DbUser, 'id' | 'username' | 'display_name' | 'profile_image'>;
  restaurant: Pick<DbRestaurant, 'id' | 'name' | 'address' | 'city'>;
  food_entry?: Pick<DbFoodEntry, 'id' | 'title' | 'images'>;
  helpful_votes?: number;
  user_vote?: boolean; // true if helpful, false if not helpful, null if no vote
  responses_count?: number;
}

export interface FriendshipWithUser extends DbFriendship {
  requester: Pick<DbUser, 'id' | 'username' | 'display_name' | 'profile_image'>;
  addressee: Pick<DbUser, 'id' | 'username' | 'display_name' | 'profile_image'>;
}

export interface UserActivity extends Database['public']['Tables']['user_activities']['Row'] {
  user: Pick<DbUser, 'id' | 'username' | 'display_name' | 'profile_image'>;
}

export interface CollectionWithItems extends Database['public']['Tables']['user_collections']['Row'] {
  items_count?: number;
  preview_items?: Array<{
    id: string;
    item_type: CollectionItemType;
    item_id: string;
    preview_image?: string;
    title: string;
  }>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: FoodCategory[];
  cuisine?: string[];
  price_range?: number[];
  rating_min?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius_km?: number;
  };
  date_from?: string;
  date_to?: string;
}

// Search and filter interfaces
export interface RestaurantSearchParams extends PaginationParams, SortParams, FilterParams {
  city?: string;
  delivery_available?: boolean;
  takeout_available?: boolean;
  open_now?: boolean;
}

export interface FoodEntrySearchParams extends PaginationParams, SortParams, FilterParams {
  user_id?: string;
  restaurant_id?: string;
  is_public?: boolean;
  tags?: string[];
  ingredients?: string[];
}

export interface UserSearchParams extends PaginationParams {
  search?: string;
  location?: string;
  cuisine_preferences?: string[];
}

// Real-time subscription types
export interface RealtimeSubscription<T = any> {
  channel: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: T;
  old?: T;
  errors?: any[];
}

export interface NotificationPreferences {
  food_recommendations: boolean;
  friend_activity: boolean;
  new_followers: boolean;
  review_responses: boolean;
  system_updates: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

// File upload types
export interface FileUploadResult {
  path: string;
  public_url: string;
  size: number;
  mime_type: string;
}

export interface ImageUploadOptions {
  bucket: string;
  folder?: string;
  max_width?: number;
  max_height?: number;
  quality?: number;
  generate_thumbnail?: boolean;
}

// Location types
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  address: string;
  location: LocationData;
  phone?: string;
  website?: string;
  rating?: number;
  price_level?: number;
  types: string[];
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  };
}

// Analytics and metrics types
export interface UserEngagementMetrics {
  total_food_entries: number;
  total_reviews: number;
  average_rating: number;
  favorite_cuisines: Array<{ cuisine: string; count: number }>;
  monthly_activity: Array<{ month: string; entries: number }>;
  social_stats: {
    friends_count: number;
    followers_count: number;
    following_count: number;
  };
}

export interface RestaurantMetrics {
  total_visits: number;
  average_rating: number;
  rating_distribution: { [rating: number]: number };
  popular_dishes: Array<{ dish: string; mentions: number }>;
  peak_hours: Array<{ hour: number; visits: number }>;
  seasonal_trends: Array<{ month: string; visits: number }>;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  validation_errors?: ValidationError[];
}