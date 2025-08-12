/**
 * Kuchisabishii Database Types
 * Generated TypeScript definitions for the Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          dietary_restrictions: string[]
          allergies: string[]
          spice_tolerance: number
          sweetness_preference: number
          profile_visibility: 'public' | 'friends' | 'private'
          allow_recommendations: boolean
          share_analytics: boolean
          onboarding_completed: boolean
          taste_profile_setup: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          dietary_restrictions?: string[]
          allergies?: string[]
          spice_tolerance?: number
          sweetness_preference?: number
          profile_visibility?: 'public' | 'friends' | 'private'
          allow_recommendations?: boolean
          share_analytics?: boolean
          onboarding_completed?: boolean
          taste_profile_setup?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          dietary_restrictions?: string[]
          allergies?: string[]
          spice_tolerance?: number
          sweetness_preference?: number
          profile_visibility?: 'public' | 'friends' | 'private'
          allow_recommendations?: boolean
          share_analytics?: boolean
          onboarding_completed?: boolean
          taste_profile_setup?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      taste_profiles: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          salty_preference: number | null
          sweet_preference: number | null
          sour_preference: number | null
          bitter_preference: number | null
          umami_preference: number | null
          crunchy_preference: number | null
          creamy_preference: number | null
          chewy_preference: number | null
          hot_food_preference: number | null
          cold_food_preference: number | null
          cuisine_preferences: Json
          culinary_adventurousness: number
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          salty_preference?: number | null
          sweet_preference?: number | null
          sour_preference?: number | null
          bitter_preference?: number | null
          umami_preference?: number | null
          crunchy_preference?: number | null
          creamy_preference?: number | null
          chewy_preference?: number | null
          hot_food_preference?: number | null
          cold_food_preference?: number | null
          cuisine_preferences?: Json
          culinary_adventurousness?: number
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          salty_preference?: number | null
          sweet_preference?: number | null
          sour_preference?: number | null
          bitter_preference?: number | null
          umami_preference?: number | null
          crunchy_preference?: number | null
          creamy_preference?: number | null
          chewy_preference?: number | null
          hot_food_preference?: number | null
          cold_food_preference?: number | null
          cuisine_preferences?: Json
          culinary_adventurousness?: number
        }
        Relationships: [
          {
            foreignKeyName: "taste_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      restaurants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string | null
          description: string | null
          phone: string | null
          email: string | null
          website: string | null
          address: string
          city: string
          state: string | null
          country: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          cuisine_types: string[]
          price_range: number
          hours: Json | null
          features: string[]
          dietary_options: string[]
          verified: boolean
          claimed_by: string | null
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug?: string | null
          description?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address: string
          city: string
          state?: string | null
          country?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          cuisine_types?: string[]
          price_range?: number
          hours?: Json | null
          features?: string[]
          dietary_options?: string[]
          verified?: boolean
          claimed_by?: string | null
          search_vector?: unknown | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string | null
          description?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string
          city?: string
          state?: string | null
          country?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          cuisine_types?: string[]
          price_range?: number
          hours?: Json | null
          features?: string[]
          dietary_options?: string[]
          verified?: boolean
          claimed_by?: string | null
          search_vector?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_claimed_by_fkey"
            columns: ["claimed_by"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number | null
          category: string | null
          calories: number | null
          ingredients: string[]
          allergens: string[]
          spice_level: number | null
          is_vegetarian: boolean
          is_vegan: boolean
          is_gluten_free: boolean
          is_available: boolean
          seasonal: boolean
          image_urls: string[]
        }
        Insert: {
          id?: string
          restaurant_id: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price?: number | null
          category?: string | null
          calories?: number | null
          ingredients?: string[]
          allergens?: string[]
          spice_level?: number | null
          is_vegetarian?: boolean
          is_vegan?: boolean
          is_gluten_free?: boolean
          is_available?: boolean
          seasonal?: boolean
          image_urls?: string[]
        }
        Update: {
          id?: string
          restaurant_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number | null
          category?: string | null
          calories?: number | null
          ingredients?: string[]
          allergens?: string[]
          spice_level?: number | null
          is_vegetarian?: boolean
          is_vegan?: boolean
          is_gluten_free?: boolean
          is_available?: boolean
          seasonal?: boolean
          image_urls?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      food_experiences: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string | null
          menu_item_id: string | null
          created_at: string
          updated_at: string
          dish_name: string
          custom_notes: string | null
          meal_time: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'snack' | 'dessert' | null
          dining_method: 'dine_in' | 'takeout' | 'delivery' | 'homemade' | null
          experienced_at: string
          amount_spent: number | null
          currency: string
          overall_rating: number | null
          taste_notes: Json
          emotions: string[]
          mood_before: string | null
          mood_after: string | null
          satisfaction_level: number | null
          mouthfeel: Json
          aroma_notes: string[]
          temperature_rating: number | null
          portion_size: 'too_small' | 'just_right' | 'too_large' | null
          dining_companions: number
          special_occasion: string | null
          weather: string | null
          photos: string[]
          videos: string[]
          is_private: boolean
          shared_with_friends: boolean
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id?: string | null
          menu_item_id?: string | null
          created_at?: string
          updated_at?: string
          dish_name: string
          custom_notes?: string | null
          meal_time?: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'snack' | 'dessert' | null
          dining_method?: 'dine_in' | 'takeout' | 'delivery' | 'homemade' | null
          experienced_at?: string
          amount_spent?: number | null
          currency?: string
          overall_rating?: number | null
          taste_notes?: Json
          emotions?: string[]
          mood_before?: string | null
          mood_after?: string | null
          satisfaction_level?: number | null
          mouthfeel?: Json
          aroma_notes?: string[]
          temperature_rating?: number | null
          portion_size?: 'too_small' | 'just_right' | 'too_large' | null
          dining_companions?: number
          special_occasion?: string | null
          weather?: string | null
          photos?: string[]
          videos?: string[]
          is_private?: boolean
          shared_with_friends?: boolean
          search_vector?: unknown | null
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string | null
          menu_item_id?: string | null
          created_at?: string
          updated_at?: string
          dish_name?: string
          custom_notes?: string | null
          meal_time?: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'snack' | 'dessert' | null
          dining_method?: 'dine_in' | 'takeout' | 'delivery' | 'homemade' | null
          experienced_at?: string
          amount_spent?: number | null
          currency?: string
          overall_rating?: number | null
          taste_notes?: Json
          emotions?: string[]
          mood_before?: string | null
          mood_after?: string | null
          satisfaction_level?: number | null
          mouthfeel?: Json
          aroma_notes?: string[]
          temperature_rating?: number | null
          portion_size?: 'too_small' | 'just_right' | 'too_large' | null
          dining_companions?: number
          special_occasion?: string | null
          weather?: string | null
          photos?: string[]
          videos?: string[]
          is_private?: boolean
          shared_with_friends?: boolean
          search_vector?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "food_experiences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_experiences_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_experiences_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      taste_experiences: {
        Row: {
          id: string
          food_experience_id: string
          created_at: string
          saltiness: number | null
          sweetness: number | null
          sourness: number | null
          bitterness: number | null
          umami: number | null
          crunchiness: number | null
          creaminess: number | null
          chewiness: number | null
          juiciness: number | null
          temperature: number | null
          spice_heat: number | null
          aroma_intensity: number | null
          aroma_descriptors: string[]
          visual_appeal: number | null
          color_vibrancy: number | null
        }
        Insert: {
          id?: string
          food_experience_id: string
          created_at?: string
          saltiness?: number | null
          sweetness?: number | null
          sourness?: number | null
          bitterness?: number | null
          umami?: number | null
          crunchiness?: number | null
          creaminess?: number | null
          chewiness?: number | null
          juiciness?: number | null
          temperature?: number | null
          spice_heat?: number | null
          aroma_intensity?: number | null
          aroma_descriptors?: string[]
          visual_appeal?: number | null
          color_vibrancy?: number | null
        }
        Update: {
          id?: string
          food_experience_id?: string
          created_at?: string
          saltiness?: number | null
          sweetness?: number | null
          sourness?: number | null
          bitterness?: number | null
          umami?: number | null
          crunchiness?: number | null
          creaminess?: number | null
          chewiness?: number | null
          juiciness?: number | null
          temperature?: number | null
          spice_heat?: number | null
          aroma_intensity?: number | null
          aroma_descriptors?: string[]
          visual_appeal?: number | null
          color_vibrancy?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taste_experiences_food_experience_id_fkey"
            columns: ["food_experience_id"]
            referencedRelation: "food_experiences"
            referencedColumns: ["id"]
          }
        ]
      }
      restaurant_reviews: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          created_at: string
          updated_at: string
          service_rating: number | null
          service_notes: string | null
          atmosphere_rating: number | null
          atmosphere_notes: string | null
          cleanliness_rating: number | null
          noise_level: number | null
          parking_availability: number | null
          kid_friendliness: number | null
          bathroom_cleanliness: number | null
          wifi_quality: number | null
          seating_comfort: number | null
          overall_restaurant_rating: number | null
          would_return: boolean | null
          would_recommend: boolean
          visit_date: string
          party_size: number
          wait_time: number | null
          reservation_made: boolean
          is_private: boolean
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          created_at?: string
          updated_at?: string
          service_rating?: number | null
          service_notes?: string | null
          atmosphere_rating?: number | null
          atmosphere_notes?: string | null
          cleanliness_rating?: number | null
          noise_level?: number | null
          parking_availability?: number | null
          kid_friendliness?: number | null
          bathroom_cleanliness?: number | null
          wifi_quality?: number | null
          seating_comfort?: number | null
          overall_restaurant_rating?: number | null
          would_return?: boolean | null
          would_recommend?: boolean
          visit_date?: string
          party_size?: number
          wait_time?: number | null
          reservation_made?: boolean
          is_private?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          created_at?: string
          updated_at?: string
          service_rating?: number | null
          service_notes?: string | null
          atmosphere_rating?: number | null
          atmosphere_notes?: string | null
          cleanliness_rating?: number | null
          noise_level?: number | null
          parking_availability?: number | null
          kid_friendliness?: number | null
          bathroom_cleanliness?: number | null
          wifi_quality?: number | null
          seating_comfort?: number | null
          overall_restaurant_rating?: number | null
          would_return?: boolean | null
          would_recommend?: boolean
          visit_date?: string
          party_size?: number
          wait_time?: number | null
          reservation_made?: boolean
          is_private?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      shared_experiences: {
        Row: {
          id: string
          food_experience_id: string
          shared_by: string
          shared_with: string
          created_at: string
          message: string | null
          recommendation_strength: number
        }
        Insert: {
          id?: string
          food_experience_id: string
          shared_by: string
          shared_with: string
          created_at?: string
          message?: string | null
          recommendation_strength?: number
        }
        Update: {
          id?: string
          food_experience_id?: string
          shared_by?: string
          shared_with?: string
          created_at?: string
          message?: string | null
          recommendation_strength?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_experiences_food_experience_id_fkey"
            columns: ["food_experience_id"]
            referencedRelation: "food_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_experiences_shared_by_fkey"
            columns: ["shared_by"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_experiences_shared_with_fkey"
            columns: ["shared_with"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      recommendation_preferences: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          enable_ai_recommendations: boolean
          enable_friend_recommendations: boolean
          enable_location_based: boolean
          taste_similarity_weight: number
          friend_influence_weight: number
          location_proximity_weight: number
          trending_factor_weight: number
          max_distance_km: number
          price_range_filter: number[]
          exclude_cuisines: string[]
          only_verified_restaurants: boolean
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          enable_ai_recommendations?: boolean
          enable_friend_recommendations?: boolean
          enable_location_based?: boolean
          taste_similarity_weight?: number
          friend_influence_weight?: number
          location_proximity_weight?: number
          trending_factor_weight?: number
          max_distance_km?: number
          price_range_filter?: number[]
          exclude_cuisines?: string[]
          only_verified_restaurants?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          enable_ai_recommendations?: boolean
          enable_friend_recommendations?: boolean
          enable_location_based?: boolean
          taste_similarity_weight?: number
          friend_influence_weight?: number
          location_proximity_weight?: number
          trending_factor_weight?: number
          max_distance_km?: number
          price_range_filter?: number[]
          exclude_cuisines?: string[]
          only_verified_restaurants?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          date: string
          experiences_logged: number
          photos_uploaded: number
          restaurants_visited: number
          friends_shared_with: number
          app_opens: number
          session_duration_minutes: number
          taste_profile_updates: number
          new_cuisines_tried: number
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          experiences_logged?: number
          photos_uploaded?: number
          restaurants_visited?: number
          friends_shared_with?: number
          app_opens?: number
          session_duration_minutes?: number
          taste_profile_updates?: number
          new_cuisines_tried?: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          experiences_logged?: number
          photos_uploaded?: number
          restaurants_visited?: number
          friends_shared_with?: number
          app_opens?: number
          session_duration_minutes?: number
          taste_profile_updates?: number
          new_cuisines_tried?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      recommendation_interactions: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string | null
          menu_item_id: string | null
          recommendation_type: 'ai_similar_taste' | 'friend_shared' | 'trending' | 'location_based' | null
          shown_at: string
          clicked: boolean
          clicked_at: string | null
          visited: boolean
          visited_at: string | null
          rated: boolean
          rating: number | null
          recommendation_context: Json
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id?: string | null
          menu_item_id?: string | null
          recommendation_type?: 'ai_similar_taste' | 'friend_shared' | 'trending' | 'location_based' | null
          shown_at?: string
          clicked?: boolean
          clicked_at?: string | null
          visited?: boolean
          visited_at?: string | null
          rated?: boolean
          rating?: number | null
          recommendation_context?: Json
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string | null
          menu_item_id?: string | null
          recommendation_type?: 'ai_similar_taste' | 'friend_shared' | 'trending' | 'location_based' | null
          shown_at?: string
          clicked?: boolean
          clicked_at?: string | null
          visited?: boolean
          visited_at?: string | null
          rated?: boolean
          rating?: number | null
          recommendation_context?: Json
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_interactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_interactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_interactions_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          created_at: string
          search_query: string
          search_type: 'food' | 'restaurant' | 'cuisine' | 'general' | null
          results_count: number | null
          clicked_result_id: string | null
          clicked_result_type: 'restaurant' | 'menu_item' | 'experience' | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          search_query: string
          search_type?: 'food' | 'restaurant' | 'cuisine' | 'general' | null
          results_count?: number | null
          clicked_result_id?: string | null
          clicked_result_type?: 'restaurant' | 'menu_item' | 'experience' | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          search_query?: string
          search_type?: 'food' | 'restaurant' | 'cuisine' | 'general' | null
          results_count?: number | null
          clicked_result_id?: string | null
          clicked_result_type?: 'restaurant' | 'menu_item' | 'experience' | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type FoodExperience = Database['public']['Tables']['food_experiences']['Row']
export type FoodExperienceInsert = Database['public']['Tables']['food_experiences']['Insert']
export type FoodExperienceUpdate = Database['public']['Tables']['food_experiences']['Update']

export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']
export type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update']

export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
export type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

export type TasteProfile = Database['public']['Tables']['taste_profiles']['Row']
export type TasteProfileInsert = Database['public']['Tables']['taste_profiles']['Insert']
export type TasteProfileUpdate = Database['public']['Tables']['taste_profiles']['Update']

export type TasteExperience = Database['public']['Tables']['taste_experiences']['Row']
export type TasteExperienceInsert = Database['public']['Tables']['taste_experiences']['Insert']
export type TasteExperienceUpdate = Database['public']['Tables']['taste_experiences']['Update']

export type RestaurantReview = Database['public']['Tables']['restaurant_reviews']['Row']
export type RestaurantReviewInsert = Database['public']['Tables']['restaurant_reviews']['Insert']
export type RestaurantReviewUpdate = Database['public']['Tables']['restaurant_reviews']['Update']

export type Friendship = Database['public']['Tables']['friendships']['Row']
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert']
export type FriendshipUpdate = Database['public']['Tables']['friendships']['Update']

export type SharedExperience = Database['public']['Tables']['shared_experiences']['Row']
export type SharedExperienceInsert = Database['public']['Tables']['shared_experiences']['Insert']
export type SharedExperienceUpdate = Database['public']['Tables']['shared_experiences']['Update']

export type RecommendationPreferences = Database['public']['Tables']['recommendation_preferences']['Row']
export type RecommendationPreferencesInsert = Database['public']['Tables']['recommendation_preferences']['Insert']
export type RecommendationPreferencesUpdate = Database['public']['Tables']['recommendation_preferences']['Update']

// Extended types with relationships
export type FoodExperienceWithDetails = FoodExperience & {
  restaurant?: Restaurant
  menu_item?: MenuItem
  taste_experience?: TasteExperience
  user_profile?: Pick<UserProfile, 'id' | 'display_name' | 'avatar_url'>
}

export type RestaurantWithMenu = Restaurant & {
  menu_items: MenuItem[]
}

export type UserWithTasteProfile = UserProfile & {
  taste_profile?: TasteProfile
  recommendation_preferences?: RecommendationPreferences
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// Search types
export interface SearchFilters {
  query?: string
  cuisine_types?: string[]
  price_range?: number[]
  dietary_options?: string[]
  distance_km?: number
  latitude?: number
  longitude?: number
  rating_min?: number
  verified_only?: boolean
}

export interface RecommendationRequest {
  user_id: string
  latitude?: number
  longitude?: number
  meal_time?: string
  max_distance_km?: number
  limit?: number
  exclude_visited?: boolean
}

// Analytics types
export interface UserAnalyticsData {
  daily_stats: Database['public']['Tables']['user_analytics']['Row'][]
  summary: {
    total_experiences: number
    total_restaurants: number
    total_photos: number
    avg_satisfaction: number
    top_cuisines: Array<{ cuisine: string; count: number }>
    mood_trends: Array<{ mood: string; frequency: number }>
  }
}