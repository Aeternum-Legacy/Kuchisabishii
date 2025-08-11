// Recommendations API functions
import { supabase, createSupabaseServiceClient } from '../lib/supabase/client';
import type {
  DbUserPreferences,
  RestaurantWithDetails,
  ApiResponse,
} from '../lib/types/api';

export class RecommendationAPI {
  /**
   * Get user preferences
   */
  static async getUserPreferences(userId?: string): Promise<ApiResponse<DbUserPreferences>> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { success: false, error: 'Not authenticated' };
        }
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        return { success: false, error: error.message };
      }

      // If no preferences exist, create default ones
      if (!data) {
        const defaultPreferences = {
          user_id: targetUserId,
          preferred_cuisines: {},
          disliked_cuisines: [],
          spice_tolerance: 3,
          sweetness_preference: 3,
          saltiness_preference: 3,
          sourness_preference: 3,
          bitterness_preference: 3,
          umami_preference: 3,
          dietary_restrictions: [],
          allergies: [],
          preferred_ingredients: [],
          disliked_ingredients: [],
          preferred_price_range: [1, 2, 3, 4],
          preferred_atmosphere: [],
          preferred_meal_times: {
            breakfast: { start: "07:00", end: "10:00" },
            lunch: { start: "11:30", end: "14:00" },
            dinner: { start: "18:00", end: "21:00" }
          },
          max_travel_distance: 10,
          preferred_neighborhoods: [],
          prefers_solo_dining: false,
          prefers_group_dining: true,
          shares_food_often: true,
          enable_smart_recommendations: true,
          recommendation_frequency: 'weekly',
          include_friend_recommendations: true,
          include_trending_recommendations: true,
        };

        const { data: newPreferences, error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPreferences)
          .select()
          .single();

        if (insertError) {
          return { success: false, error: insertError.message };
        }

        return { success: true, data: newPreferences };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user preferences'
      };
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    preferences: Partial<DbUserPreferences>
  ): Promise<ApiResponse<DbUserPreferences>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user preferences'
      };
    }
  }

  /**
   * Get personalized restaurant recommendations
   */
  static async getPersonalizedRecommendations(
    userId?: string,
    limit = 10
  ): Promise<ApiResponse<RestaurantWithDetails[]>> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { success: false, error: 'Not authenticated' };
        }
        targetUserId = user.id;
      }

      // Use the database function to get personalized recommendations
      const { data, error } = await supabase.rpc('get_personalized_recommendations', {
        target_user_id: targetUserId,
        recommendation_limit: limit,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get full restaurant details for recommended restaurants
      if (data && data.length > 0) {
        const restaurantIds = data.map((rec: any) => rec.restaurant_id);
        
        const { data: restaurants, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds)
          .eq('is_active', true);

        if (restaurantError) {
          return { success: false, error: restaurantError.message };
        }

        // Merge recommendation data with restaurant data
        const recommendationsWithDetails = restaurants?.map(restaurant => {
          const recommendation = data.find((rec: any) => rec.restaurant_id === restaurant.id);
          return {
            ...restaurant,
            recommendation_type: recommendation?.recommendation_type,
            confidence_score: recommendation?.confidence_score,
            reasoning: recommendation?.reasoning,
          };
        }) || [];

        return { success: true, data: recommendationsWithDetails };
      }

      return { success: true, data: [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get personalized recommendations'
      };
    }
  }

  /**
   * Generate recommendations based on user taste profile
   */
  static async generateRecommendations(userId: string): Promise<ApiResponse<void>> {
    try {
      // This would typically be called by a background job or cron function
      // Using service role client for admin operations
      const serviceClient = createSupabaseServiceClient();

      // Get user preferences and taste history
      const [
        { data: preferences },
        { data: tasteHistory },
        { data: foodEntries }
      ] = await Promise.all([
        serviceClient.from('user_preferences').select('*').eq('user_id', userId).single(),
        serviceClient.from('taste_profile_history').select('*').eq('user_id', userId).limit(50),
        serviceClient.from('food_entries').select('restaurant_id, rating').eq('user_id', userId).not('restaurant_id', 'is', null)
      ]);

      if (!preferences) {
        return { success: false, error: 'User preferences not found' };
      }

      // Get restaurants user hasn't visited
      const visitedRestaurantIds = foodEntries?.map(entry => entry.restaurant_id) || [];
      
      let restaurantQuery = serviceClient
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

      if (visitedRestaurantIds.length > 0) {
        restaurantQuery = restaurantQuery.not('id', 'in', `(${visitedRestaurantIds.join(',')})`);
      }

      const { data: candidateRestaurants } = await restaurantQuery.limit(100);

      if (!candidateRestaurants || candidateRestaurants.length === 0) {
        return { success: true };
      }

      // Generate recommendations based on preferences
      const recommendations = candidateRestaurants
        .map(restaurant => {
          let score = 0;
          let reasoning = 'Recommended based on your preferences: ';

          // Score based on cuisine preferences
          if (preferences.preferred_cuisines && typeof preferences.preferred_cuisines === 'object') {
            restaurant.cuisine_types.forEach(cuisine => {
              const cuisineScore = (preferences.preferred_cuisines as any)[cuisine];
              if (cuisineScore) {
                score += cuisineScore * 0.4;
                reasoning += `${cuisine} cuisine (${cuisineScore}/5), `;
              }
            });
          }

          // Score based on price range preference
          if (preferences.preferred_price_range?.includes(restaurant.price_range || 0)) {
            score += 0.3;
            reasoning += `matches your price preference, `;
          }

          // Score based on rating
          if (restaurant.rating >= 4.0) {
            score += 0.2;
            reasoning += `highly rated (${restaurant.rating}/5), `;
          }

          // Determine recommendation type
          let recommendationType = 'taste_match';
          if (restaurant.review_count > 100 && restaurant.rating > 4.5) {
            recommendationType = 'trending';
          }

          return {
            restaurant_id: restaurant.id,
            confidence_score: Math.min(score, 1.0),
            reasoning: reasoning.slice(0, -2), // Remove trailing comma
            recommendation_type: recommendationType,
          };
        })
        .filter(rec => rec.confidence_score > 0.3) // Only include decent matches
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 20); // Limit to top 20

      // Insert recommendations
      if (recommendations.length > 0) {
        const { error: insertError } = await serviceClient
          .from('restaurant_recommendations')
          .insert(
            recommendations.map(rec => ({
              ...rec,
              user_id: userId,
            }))
          );

        if (insertError) {
          return { success: false, error: insertError.message };
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations'
      };
    }
  }

  /**
   * Mark recommendation as viewed
   */
  static async markRecommendationViewed(recommendationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('restaurant_recommendations')
        .update({ was_viewed: true })
        .eq('id', recommendationId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark recommendation as viewed'
      };
    }
  }

  /**
   * Mark recommendation as visited
   */
  static async markRecommendationVisited(recommendationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('restaurant_recommendations')
        .update({ was_visited: true })
        .eq('id', recommendationId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark recommendation as visited'
      };
    }
  }

  /**
   * Rate recommendation (liked/disliked)
   */
  static async rateRecommendation(
    recommendationId: string,
    liked: boolean
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('restaurant_recommendations')
        .update({ was_liked: liked })
        .eq('id', recommendationId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rate recommendation'
      };
    }
  }

  /**
   * Dismiss recommendation
   */
  static async dismissRecommendation(recommendationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('restaurant_recommendations')
        .update({ was_dismissed: true })
        .eq('id', recommendationId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to dismiss recommendation'
      };
    }
  }

  /**
   * Get trending restaurants based on recent activity
   */
  static async getTrendingRestaurants(limit = 10): Promise<ApiResponse<RestaurantWithDetails[]>> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Get restaurants with recent activity and high ratings
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          recent_activity:food_entries!inner(created_at, rating)
        `)
        .eq('is_active', true)
        .gte('food_entries.created_at', oneWeekAgo)
        .gte('rating', 4.0)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get trending restaurants'
      };
    }
  }

  /**
   * Get recommendations from friends' activity
   */
  static async getFriendRecommendations(
    userId?: string,
    limit = 10
  ): Promise<ApiResponse<RestaurantWithDetails[]>> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { success: false, error: 'Not authenticated' };
        }
        targetUserId = user.id;
      }

      // Get friend IDs
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`)
        .eq('status', 'accepted');

      const friendIds = friendships?.map(f => 
        f.requester_id === targetUserId ? f.addressee_id : f.requester_id
      ) || [];

      if (friendIds.length === 0) {
        return { success: true, data: [] };
      }

      // Get restaurants friends have rated highly recently
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: friendActivity } = await supabase
        .from('food_entries')
        .select(`
          restaurant_id,
          rating,
          user_id,
          created_at,
          restaurant:restaurants!inner(*)
        `)
        .in('user_id', friendIds)
        .gte('rating', 4.0)
        .gte('created_at', oneMonthAgo)
        .not('restaurant_id', 'is', null)
        .order('rating', { ascending: false })
        .limit(limit * 2); // Get more to filter duplicates

      if (!friendActivity || friendActivity.length === 0) {
        return { success: true, data: [] };
      }

      // Remove duplicates and get unique restaurants
      const uniqueRestaurants = friendActivity
        .reduce((acc: any[], entry) => {
          if (!acc.find(r => r.id === entry.restaurant?.id)) {
            acc.push({
              ...entry.restaurant,
              friend_rating: entry.rating,
              friend_visit_date: entry.created_at,
            });
          }
          return acc;
        }, [])
        .slice(0, limit);

      return { success: true, data: uniqueRestaurants };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get friend recommendations'
      };
    }
  }

  /**
   * Get food pairing suggestions
   */
  static async getFoodPairings(foodItem: string, limit = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('food_pairings')
        .select('*')
        .or(`food_item_1.ilike.%${foodItem}%,food_item_2.ilike.%${foodItem}%`)
        .order('pairing_score', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      // Format the results to show the paired item
      const pairings = data?.map(pairing => ({
        paired_item: pairing.food_item_1.toLowerCase().includes(foodItem.toLowerCase()) 
          ? pairing.food_item_2 
          : pairing.food_item_1,
        score: pairing.pairing_score,
        type: pairing.pairing_type,
        cuisine_context: pairing.cuisine_context,
      })) || [];

      return { success: true, data: pairings };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get food pairings'
      };
    }
  }

  /**
   * Clean up expired recommendations
   */
  static async cleanupExpiredRecommendations(): Promise<ApiResponse<number>> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_recommendations');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup expired recommendations'
      };
    }
  }
}