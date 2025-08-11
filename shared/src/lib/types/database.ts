// Generated TypeScript types for Supabase database schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string;
          first_name: string | null;
          last_name: string | null;
          bio: string | null;
          profile_image: string | null;
          location: string | null;
          date_of_birth: string | null;
          dietary_restrictions: string[] | null;
          favorite_cuisines: string[] | null;
          privacy_level: 'public' | 'friends' | 'private';
          notification_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          display_name: string;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          profile_image?: string | null;
          location?: string | null;
          date_of_birth?: string | null;
          dietary_restrictions?: string[] | null;
          favorite_cuisines?: string[] | null;
          privacy_level?: 'public' | 'friends' | 'private';
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          profile_image?: string | null;
          location?: string | null;
          date_of_birth?: string | null;
          dietary_restrictions?: string[] | null;
          favorite_cuisines?: string[] | null;
          privacy_level?: 'public' | 'friends' | 'private';
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          city: string;
          state: string | null;
          country: string;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          cuisine_types: string[];
          price_range: number | null;
          rating: number;
          review_count: number;
          opening_hours: Json;
          menu_url: string | null;
          delivery_available: boolean;
          takeout_available: boolean;
          reservation_required: boolean;
          photos: string[];
          amenities: string[];
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          address: string;
          city: string;
          state?: string | null;
          country: string;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          cuisine_types?: string[];
          price_range?: number | null;
          rating?: number;
          review_count?: number;
          opening_hours?: Json;
          menu_url?: string | null;
          delivery_available?: boolean;
          takeout_available?: boolean;
          reservation_required?: boolean;
          photos?: string[];
          amenities?: string[];
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          address?: string;
          city?: string;
          state?: string | null;
          country?: string;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          cuisine_types?: string[];
          price_range?: number | null;
          rating?: number;
          review_count?: number;
          opening_hours?: Json;
          menu_url?: string | null;
          delivery_available?: boolean;
          takeout_available?: boolean;
          reservation_required?: boolean;
          photos?: string[];
          amenities?: string[];
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      food_entries: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string | null;
          title: string;
          description: string | null;
          notes: string | null;
          images: string[];
          category: Database['public']['Enums']['food_category'];
          occasion: Database['public']['Enums']['meal_occasion'];
          rating: number;
          price: number | null;
          currency: string;
          tags: string[];
          ingredients: string[];
          cooking_method: string | null;
          spice_level: number | null;
          location_name: string | null;
          location_address: string | null;
          location_latitude: number | null;
          location_longitude: number | null;
          is_public: boolean;
          allow_comments: boolean;
          calories: number | null;
          protein_grams: number | null;
          carbs_grams: number | null;
          fat_grams: number | null;
          consumed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id?: string | null;
          title: string;
          description?: string | null;
          notes?: string | null;
          images?: string[];
          category?: Database['public']['Enums']['food_category'];
          occasion?: Database['public']['Enums']['meal_occasion'];
          rating: number;
          price?: number | null;
          currency?: string;
          tags?: string[];
          ingredients?: string[];
          cooking_method?: string | null;
          spice_level?: number | null;
          location_name?: string | null;
          location_address?: string | null;
          location_latitude?: number | null;
          location_longitude?: number | null;
          is_public?: boolean;
          allow_comments?: boolean;
          calories?: number | null;
          protein_grams?: number | null;
          carbs_grams?: number | null;
          fat_grams?: number | null;
          consumed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string | null;
          title?: string;
          description?: string | null;
          notes?: string | null;
          images?: string[];
          category?: Database['public']['Enums']['food_category'];
          occasion?: Database['public']['Enums']['meal_occasion'];
          rating?: number;
          price?: number | null;
          currency?: string;
          tags?: string[];
          ingredients?: string[];
          cooking_method?: string | null;
          spice_level?: number | null;
          location_name?: string | null;
          location_address?: string | null;
          location_latitude?: number | null;
          location_longitude?: number | null;
          is_public?: boolean;
          allow_comments?: boolean;
          calories?: number | null;
          protein_grams?: number | null;
          carbs_grams?: number | null;
          fat_grams?: number | null;
          consumed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'food_entries_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'food_entries_restaurant_id_fkey';
            columns: ['restaurant_id'];
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          food_entry_id: string | null;
          title: string;
          content: string;
          rating: number;
          food_rating: number | null;
          service_rating: number | null;
          atmosphere_rating: number | null;
          value_rating: number | null;
          photos: string[];
          visit_date: string | null;
          party_size: number;
          wait_time_minutes: number | null;
          total_cost: number | null;
          currency: string;
          recommended_dishes: string[];
          pros: string[];
          cons: string[];
          is_public: boolean;
          allow_responses: boolean;
          helpful_count: number;
          is_verified: boolean;
          is_featured: boolean;
          is_flagged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          food_entry_id?: string | null;
          title: string;
          content: string;
          rating: number;
          food_rating?: number | null;
          service_rating?: number | null;
          atmosphere_rating?: number | null;
          value_rating?: number | null;
          photos?: string[];
          visit_date?: string | null;
          party_size?: number;
          wait_time_minutes?: number | null;
          total_cost?: number | null;
          currency?: string;
          recommended_dishes?: string[];
          pros?: string[];
          cons?: string[];
          is_public?: boolean;
          allow_responses?: boolean;
          helpful_count?: number;
          is_verified?: boolean;
          is_featured?: boolean;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          food_entry_id?: string | null;
          title?: string;
          content?: string;
          rating?: number;
          food_rating?: number | null;
          service_rating?: number | null;
          atmosphere_rating?: number | null;
          value_rating?: number | null;
          photos?: string[];
          visit_date?: string | null;
          party_size?: number;
          wait_time_minutes?: number | null;
          total_cost?: number | null;
          currency?: string;
          recommended_dishes?: string[];
          pros?: string[];
          cons?: string[];
          is_public?: boolean;
          allow_responses?: boolean;
          helpful_count?: number;
          is_verified?: boolean;
          is_featured?: boolean;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_restaurant_id_fkey';
            columns: ['restaurant_id'];
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_food_entry_id_fkey';
            columns: ['food_entry_id'];
            referencedRelation: 'food_entries';
            referencedColumns: ['id'];
          }
        ];
      };
      review_responses: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          content: string;
          is_owner_response: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          content: string;
          is_owner_response?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          user_id?: string;
          content?: string;
          is_owner_response?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'review_responses_review_id_fkey';
            columns: ['review_id'];
            referencedRelation: 'reviews';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'review_responses_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      review_votes: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          is_helpful: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          is_helpful: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          user_id?: string;
          is_helpful?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'review_votes_review_id_fkey';
            columns: ['review_id'];
            referencedRelation: 'reviews';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'review_votes_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: Database['public']['Enums']['friendship_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: Database['public']['Enums']['friendship_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: Database['public']['Enums']['friendship_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friendships_requester_id_fkey';
            columns: ['requester_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friendships_addressee_id_fkey';
            columns: ['addressee_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_follows_follower_id_fkey';
            columns: ['follower_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_follows_following_id_fkey';
            columns: ['following_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: Database['public']['Enums']['activity_type'];
          title: string;
          description: string | null;
          metadata: Json;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: Database['public']['Enums']['activity_type'];
          title: string;
          description?: string | null;
          metadata?: Json;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: Database['public']['Enums']['activity_type'];
          title?: string;
          description?: string | null;
          metadata?: Json;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_activities_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          color: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          color?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          color?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_collections_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      collection_items: {
        Row: {
          id: string;
          collection_id: string;
          item_type: Database['public']['Enums']['collection_item_type'];
          item_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          item_type: Database['public']['Enums']['collection_item_type'];
          item_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          item_type?: Database['public']['Enums']['collection_item_type'];
          item_id?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'collection_items_collection_id_fkey';
            columns: ['collection_id'];
            referencedRelation: 'user_collections';
            referencedColumns: ['id'];
          }
        ];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_cuisines: Json;
          disliked_cuisines: string[];
          spice_tolerance: number;
          sweetness_preference: number;
          saltiness_preference: number;
          sourness_preference: number;
          bitterness_preference: number;
          umami_preference: number;
          dietary_restrictions: string[];
          allergies: string[];
          preferred_ingredients: string[];
          disliked_ingredients: string[];
          preferred_price_range: number[];
          preferred_atmosphere: string[];
          preferred_meal_times: Json;
          max_travel_distance: number;
          preferred_neighborhoods: string[];
          prefers_solo_dining: boolean;
          prefers_group_dining: boolean;
          shares_food_often: boolean;
          enable_smart_recommendations: boolean;
          recommendation_frequency: string;
          include_friend_recommendations: boolean;
          include_trending_recommendations: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_cuisines?: Json;
          disliked_cuisines?: string[];
          spice_tolerance?: number;
          sweetness_preference?: number;
          saltiness_preference?: number;
          sourness_preference?: number;
          bitterness_preference?: number;
          umami_preference?: number;
          dietary_restrictions?: string[];
          allergies?: string[];
          preferred_ingredients?: string[];
          disliked_ingredients?: string[];
          preferred_price_range?: number[];
          preferred_atmosphere?: string[];
          preferred_meal_times?: Json;
          max_travel_distance?: number;
          preferred_neighborhoods?: string[];
          prefers_solo_dining?: boolean;
          prefers_group_dining?: boolean;
          shares_food_often?: boolean;
          enable_smart_recommendations?: boolean;
          recommendation_frequency?: string;
          include_friend_recommendations?: boolean;
          include_trending_recommendations?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferred_cuisines?: Json;
          disliked_cuisines?: string[];
          spice_tolerance?: number;
          sweetness_preference?: number;
          saltiness_preference?: number;
          sourness_preference?: number;
          bitterness_preference?: number;
          umami_preference?: number;
          dietary_restrictions?: string[];
          allergies?: string[];
          preferred_ingredients?: string[];
          disliked_ingredients?: string[];
          preferred_price_range?: number[];
          preferred_atmosphere?: string[];
          preferred_meal_times?: Json;
          max_travel_distance?: number;
          preferred_neighborhoods?: string[];
          prefers_solo_dining?: boolean;
          prefers_group_dining?: boolean;
          shares_food_often?: boolean;
          enable_smart_recommendations?: boolean;
          recommendation_frequency?: string;
          include_friend_recommendations?: boolean;
          include_trending_recommendations?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      taste_profile_history: {
        Row: {
          id: string;
          user_id: string;
          food_entry_id: string | null;
          review_id: string | null;
          learned_cuisines: Json;
          learned_ingredients: Json;
          learned_flavors: Json;
          interaction_type: string;
          confidence_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_entry_id?: string | null;
          review_id?: string | null;
          learned_cuisines?: Json;
          learned_ingredients?: Json;
          learned_flavors?: Json;
          interaction_type: string;
          confidence_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_entry_id?: string | null;
          review_id?: string | null;
          learned_cuisines?: Json;
          learned_ingredients?: Json;
          learned_flavors?: Json;
          interaction_type?: string;
          confidence_score?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'taste_profile_history_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'taste_profile_history_food_entry_id_fkey';
            columns: ['food_entry_id'];
            referencedRelation: 'food_entries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'taste_profile_history_review_id_fkey';
            columns: ['review_id'];
            referencedRelation: 'reviews';
            referencedColumns: ['id'];
          }
        ];
      };
      restaurant_recommendations: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          recommendation_type: string;
          confidence_score: number;
          reasoning: string | null;
          was_viewed: boolean;
          was_visited: boolean;
          was_liked: boolean | null;
          was_dismissed: boolean;
          generated_at: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          recommendation_type: string;
          confidence_score: number;
          reasoning?: string | null;
          was_viewed?: boolean;
          was_visited?: boolean;
          was_liked?: boolean | null;
          was_dismissed?: boolean;
          generated_at?: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          recommendation_type?: string;
          confidence_score?: number;
          reasoning?: string | null;
          was_viewed?: boolean;
          was_visited?: boolean;
          was_liked?: boolean | null;
          was_dismissed?: boolean;
          generated_at?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_recommendations_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_recommendations_restaurant_id_fkey';
            columns: ['restaurant_id'];
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          }
        ];
      };
      food_pairings: {
        Row: {
          id: string;
          food_item_1: string;
          food_item_2: string;
          pairing_score: number;
          pairing_type: string;
          cuisine_context: string[] | null;
          user_votes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          food_item_1: string;
          food_item_2: string;
          pairing_score: number;
          pairing_type?: string;
          cuisine_context?: string[] | null;
          user_votes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          food_item_1?: string;
          food_item_2?: string;
          pairing_score?: number;
          pairing_type?: string;
          cuisine_context?: string[] | null;
          user_votes?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_mutual_friends: {
        Args: {
          user1_id: string;
          user2_id: string;
        };
        Returns: {
          friend_id: string;
          friend_name: string;
        }[];
      };
      get_personalized_recommendations: {
        Args: {
          target_user_id: string;
          recommendation_limit?: number;
        };
        Returns: {
          restaurant_id: string;
          restaurant_name: string;
          recommendation_type: string;
          confidence_score: number;
          reasoning: string;
        }[];
      };
      cleanup_expired_recommendations: {
        Args: {};
        Returns: number;
      };
      is_friends_with: {
        Args: {
          user1_id: string;
          user2_id: string;
        };
        Returns: boolean;
      };
      can_view_user_profile: {
        Args: {
          viewer_id: string;
          profile_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      food_category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink' | 'other';
      meal_occasion: 'casual' | 'date' | 'business' | 'celebration' | 'family' | 'friends' | 'solo' | 'other';
      friendship_status: 'pending' | 'accepted' | 'blocked' | 'declined';
      activity_type: 'food_entry' | 'review' | 'friendship' | 'follow' | 'recommendation' | 'achievement';
      collection_item_type: 'restaurant' | 'food_entry' | 'review';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}