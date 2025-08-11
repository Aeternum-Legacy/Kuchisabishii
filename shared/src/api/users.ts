// User API functions
import { supabase } from '../lib/supabase/client';
import type {
  DbUser,
  InsertUser,
  UpdateUser,
  UserProfile,
  ApiResponse,
  PaginatedResponse,
  UserSearchParams,
  UserEngagementMetrics,
} from '../lib/types/api';

export class UserAPI {
  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<DbUser>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get current user' 
      };
    }
  }

  /**
   * Get user profile by ID with additional stats
   */
  static async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        return { success: false, error: userError.message };
      }

      // Get additional stats
      const [
        { count: foodEntriesCount },
        { count: reviewsCount },
        { count: friendsCount },
        { count: followersCount },
        { count: followingCount }
      ] = await Promise.all([
        supabase.from('food_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('friendships').select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
          .eq('status', 'accepted'),
        supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      ]);

      // Check friendship status with current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let isFriend = false;
      let isFollowing = false;

      if (currentUser && currentUser.id !== userId) {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('status')
          .or(
            `and(requester_id.eq.${currentUser.id},addressee_id.eq.${userId}),` +
            `and(requester_id.eq.${userId},addressee_id.eq.${currentUser.id})`
          )
          .eq('status', 'accepted')
          .maybeSingle();

        const { data: follow } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
          .maybeSingle();

        isFriend = !!friendship;
        isFollowing = !!follow;
      }

      const userProfile: UserProfile = {
        ...user,
        friends_count: friendsCount || 0,
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        food_entries_count: foodEntriesCount || 0,
        reviews_count: reviewsCount || 0,
        is_friend: isFriend,
        is_following: isFollowing,
      };

      return { success: true, data: userProfile };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user profile'
      };
    }
  }

  /**
   * Create or update user profile
   */
  static async upsertUser(userData: InsertUser): Promise<ApiResponse<DbUser>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upsert user'
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: UpdateUser): Promise<ApiResponse<DbUser>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  }

  /**
   * Search users
   */
  static async searchUsers(params: UserSearchParams): Promise<PaginatedResponse<UserProfile>> {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        location = '',
        cuisine_preferences = []
      } = params;

      const offset = (page - 1) * limit;

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('privacy_level', 'public');

      // Apply search filter
      if (search) {
        query = query.or(
          `username.ilike.%${search}%,` +
          `display_name.ilike.%${search}%,` +
          `first_name.ilike.%${search}%,` +
          `last_name.ilike.%${search}%`
        );
      }

      // Apply location filter
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      // Apply cuisine preferences filter
      if (cuisine_preferences.length > 0) {
        query = query.overlaps('favorite_cuisines', cuisine_preferences);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search users',
        pagination: {} as any,
      };
    }
  }

  /**
   * Get user engagement metrics
   */
  static async getUserEngagementMetrics(userId: string): Promise<ApiResponse<UserEngagementMetrics>> {
    try {
      // Get basic stats
      const [
        { data: foodEntries },
        { data: reviews },
        { data: friendsData },
        { data: followersData },
        { data: followingData }
      ] = await Promise.all([
        supabase.from('food_entries').select('rating, category, consumed_at').eq('user_id', userId),
        supabase.from('reviews').select('rating').eq('user_id', userId),
        supabase.from('friendships').select('id')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
          .eq('status', 'accepted'),
        supabase.from('user_follows').select('id').eq('following_id', userId),
        supabase.from('user_follows').select('id').eq('follower_id', userId),
      ]);

      // Calculate metrics
      const totalFoodEntries = foodEntries?.length || 0;
      const totalReviews = reviews?.length || 0;
      
      const averageRating = foodEntries && foodEntries.length > 0
        ? foodEntries.reduce((sum, entry) => sum + entry.rating, 0) / foodEntries.length
        : 0;

      // Get favorite cuisines from restaurant visits
      const { data: cuisineData } = await supabase
        .from('food_entries')
        .select('restaurant:restaurants(cuisine_types)')
        .eq('user_id', userId)
        .not('restaurant_id', 'is', null);

      const cuisineCount: { [key: string]: number } = {};
      cuisineData?.forEach(entry => {
        if (entry.restaurant?.cuisine_types) {
          entry.restaurant.cuisine_types.forEach(cuisine => {
            cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
          });
        }
      });

      const favoriteCuisines = Object.entries(cuisineCount)
        .map(([cuisine, count]) => ({ cuisine, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate monthly activity
      const monthlyActivity = foodEntries?.reduce((acc: any[], entry) => {
        const month = new Date(entry.consumed_at).toISOString().slice(0, 7);
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.entries++;
        } else {
          acc.push({ month, entries: 1 });
        }
        return acc;
      }, []).sort((a, b) => a.month.localeCompare(b.month)) || [];

      const metrics: UserEngagementMetrics = {
        total_food_entries: totalFoodEntries,
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 10) / 10,
        favorite_cuisines: favoriteCuisines,
        monthly_activity: monthlyActivity,
        social_stats: {
          friends_count: friendsData?.length || 0,
          followers_count: followersData?.length || 0,
          following_count: followingData?.length || 0,
        },
      };

      return { success: true, data: metrics };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get engagement metrics'
      };
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string, excludeUserId?: string): Promise<ApiResponse<boolean>> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .limit(1);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data.length === 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check username availability'
      };
    }
  }
}