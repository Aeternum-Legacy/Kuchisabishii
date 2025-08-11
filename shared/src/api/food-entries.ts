// Food entries API functions
import { supabase } from '../lib/supabase/client';
import type {
  DbFoodEntry,
  InsertFoodEntry,
  UpdateFoodEntry,
  FoodEntryWithDetails,
  ApiResponse,
  PaginatedResponse,
  FoodEntrySearchParams,
} from '../lib/types/api';

export class FoodEntryAPI {
  /**
   * Get food entry by ID with detailed information
   */
  static async getFoodEntry(entryId: string): Promise<ApiResponse<FoodEntryWithDetails>> {
    try {
      const { data: entry, error } = await supabase
        .from('food_entries')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants(id, name, address, city)
        `)
        .eq('id', entryId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Check user interactions if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      let isLiked = false;
      let isBookmarked = false;

      if (user) {
        const [
          { data: likeData },
          { data: bookmarkData }
        ] = await Promise.all([
          // Check if user liked this entry (would need a likes table)
          // For now, just return false
          Promise.resolve({ data: null }),
          // Check if entry is bookmarked
          supabase.from('collection_items').select('id')
            .eq('item_type', 'food_entry')
            .eq('item_id', entryId)
            .limit(1)
        ]);

        isBookmarked = !!bookmarkData?.length;
      }

      const entryWithDetails: FoodEntryWithDetails = {
        ...entry,
        user: entry.user,
        restaurant: entry.restaurant,
        is_liked: isLiked,
        is_bookmarked: isBookmarked,
      };

      return { success: true, data: entryWithDetails };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get food entry'
      };
    }
  }

  /**
   * Create new food entry
   */
  static async createFoodEntry(entryData: InsertFoodEntry): Promise<ApiResponse<DbFoodEntry>> {
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create food entry'
      };
    }
  }

  /**
   * Update food entry
   */
  static async updateFoodEntry(entryId: string, updates: UpdateFoodEntry): Promise<ApiResponse<DbFoodEntry>> {
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update food entry'
      };
    }
  }

  /**
   * Delete food entry
   */
  static async deleteFoodEntry(entryId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete food entry'
      };
    }
  }

  /**
   * Get food entries with filters and pagination
   */
  static async getFoodEntries(params: FoodEntrySearchParams): Promise<PaginatedResponse<FoodEntryWithDetails>> {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = [],
        user_id,
        restaurant_id,
        is_public,
        tags = [],
        ingredients = [],
        rating_min,
        price_range = [],
        date_from,
        date_to,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params;

      const offset = (page - 1) * limit;

      let query = supabase
        .from('food_entries')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants(id, name, address, city)
        `, { count: 'exact' });

      // Apply user filter
      if (user_id) {
        query = query.eq('user_id', user_id);
      } else {
        // Only show public entries if not filtering by specific user
        query = query.eq('is_public', true);
      }

      // Apply restaurant filter
      if (restaurant_id) {
        query = query.eq('restaurant_id', restaurant_id);
      }

      // Apply public filter
      if (is_public !== undefined) {
        query = query.eq('is_public', is_public);
      }

      // Apply search filter
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,` +
          `description.ilike.%${search}%,` +
          `notes.ilike.%${search}%`
        );
      }

      // Apply category filter
      if (category.length > 0) {
        query = query.in('category', category);
      }

      // Apply tags filter
      if (tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      // Apply ingredients filter
      if (ingredients.length > 0) {
        query = query.overlaps('ingredients', ingredients);
      }

      // Apply rating filter
      if (rating_min !== undefined && rating_min > 0) {
        query = query.gte('rating', rating_min);
      }

      // Apply price filter
      if (price_range.length === 2) {
        query = query.gte('price', price_range[0]).lte('price', price_range[1]);
      }

      // Apply date filters
      if (date_from) {
        query = query.gte('consumed_at', date_from);
      }
      if (date_to) {
        query = query.lte('consumed_at', date_to);
      }

      // Apply sorting
      const validSortFields = ['created_at', 'consumed_at', 'rating', 'title'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
      query = query.order(sortField, { ascending: sort_order === 'asc' });

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      const entriesWithDetails = data?.map(entry => ({
        ...entry,
        user: entry.user,
        restaurant: entry.restaurant,
      })) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: entriesWithDetails,
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
        error: error instanceof Error ? error.message : 'Failed to get food entries',
        pagination: {} as any,
      };
    }
  }

  /**
   * Get user's food entries
   */
  static async getUserFoodEntries(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      category?: string[];
      date_from?: string;
      date_to?: string;
    } = {}
  ): Promise<PaginatedResponse<FoodEntryWithDetails>> {
    return this.getFoodEntries({
      ...options,
      user_id: userId,
    });
  }

  /**
   * Get restaurant's food entries
   */
  static async getRestaurantFoodEntries(
    restaurantId: string,
    options: {
      page?: number;
      limit?: number;
      rating_min?: number;
    } = {}
  ): Promise<PaginatedResponse<FoodEntryWithDetails>> {
    return this.getFoodEntries({
      ...options,
      restaurant_id: restaurantId,
      is_public: true,
    });
  }

  /**
   * Get trending food entries
   */
  static async getTrendingFoodEntries(limit = 20): Promise<ApiResponse<FoodEntryWithDetails[]>> {
    try {
      // Get entries from the past week with high ratings
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('food_entries')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants(id, name, address, city)
        `)
        .eq('is_public', true)
        .gte('created_at', oneWeekAgo)
        .gte('rating', 4.0)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      const entriesWithDetails = data?.map(entry => ({
        ...entry,
        user: entry.user,
        restaurant: entry.restaurant,
      })) || [];

      return { success: true, data: entriesWithDetails };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get trending food entries'
      };
    }
  }

  /**
   * Get food entries feed for user (friends and followed users)
   */
  static async getFeedEntries(
    userId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PaginatedResponse<FoodEntryWithDetails>> {
    try {
      const { page = 1, limit = 20 } = options;
      const offset = (page - 1) * limit;

      // Get IDs of friends and followed users
      const { data: socialConnections } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId);

      const friendIds = socialConnections?.map(f => 
        f.requester_id === userId ? f.addressee_id : f.requester_id
      ) || [];

      const followingIds = follows?.map(f => f.following_id) || [];
      const allUserIds = [...new Set([...friendIds, ...followingIds])];

      if (allUserIds.length === 0) {
        return {
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false,
          },
        };
      }

      const { data, error, count } = await supabase
        .from('food_entries')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants(id, name, address, city)
        `, { count: 'exact' })
        .in('user_id', allUserIds)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      const entriesWithDetails = data?.map(entry => ({
        ...entry,
        user: entry.user,
        restaurant: entry.restaurant,
      })) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: entriesWithDetails,
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
        error: error instanceof Error ? error.message : 'Failed to get feed entries',
        pagination: {} as any,
      };
    }
  }

  /**
   * Get popular tags
   */
  static async getPopularTags(limit = 50): Promise<ApiResponse<Array<{ tag: string; count: number }>>> {
    try {
      // This is a simplified version - in production, you'd want a separate tags table
      // or use a more efficient aggregation method
      const { data, error } = await supabase
        .from('food_entries')
        .select('tags')
        .eq('is_public', true);

      if (error) {
        return { success: false, error: error.message };
      }

      const tagCounts: { [key: string]: number } = {};
      
      data?.forEach(entry => {
        if (entry.tags) {
          entry.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return { success: true, data: popularTags };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get popular tags'
      };
    }
  }

  /**
   * Get similar food entries based on tags and ingredients
   */
  static async getSimilarEntries(entryId: string, limit = 10): Promise<ApiResponse<FoodEntryWithDetails[]>> {
    try {
      // Get the reference entry
      const { data: refEntry, error: refError } = await supabase
        .from('food_entries')
        .select('tags, ingredients, category, user_id')
        .eq('id', entryId)
        .single();

      if (refError) {
        return { success: false, error: refError.message };
      }

      // Find similar entries
      let query = supabase
        .from('food_entries')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants(id, name, address, city)
        `)
        .eq('is_public', true)
        .neq('id', entryId)
        .neq('user_id', refEntry.user_id); // Exclude same user's entries

      // Match by category first
      if (refEntry.category) {
        query = query.eq('category', refEntry.category);
      }

      // Match by tags or ingredients
      if (refEntry.tags?.length > 0 || refEntry.ingredients?.length > 0) {
        const searchTerms = [...(refEntry.tags || []), ...(refEntry.ingredients || [])];
        if (searchTerms.length > 0) {
          query = query.or(
            `tags.ov.{${searchTerms.join(',')}},` +
            `ingredients.ov.{${searchTerms.join(',')}}`
          );
        }
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      const entriesWithDetails = data?.map(entry => ({
        ...entry,
        user: entry.user,
        restaurant: entry.restaurant,
      })) || [];

      return { success: true, data: entriesWithDetails };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get similar entries'
      };
    }
  }
}