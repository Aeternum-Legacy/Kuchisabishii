// Reviews API functions
import { supabase } from '../lib/supabase/client';
import type {
  DbReview,
  InsertReview,
  UpdateReview,
  ReviewWithUser,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '../lib/types/api';

export class ReviewAPI {
  /**
   * Get review by ID with user and restaurant information
   */
  static async getReview(reviewId: string): Promise<ApiResponse<ReviewWithUser>> {
    try {
      const { data: review, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants!inner(id, name, address, city),
          food_entry:food_entries(id, title, images)
        `)
        .eq('id', reviewId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Get helpful votes count and user's vote
      const { data: { user } } = await supabase.auth.getUser();
      let userVote = null;
      let helpfulVotes = 0;

      const [
        { count: helpfulCount },
        { data: userVoteData }
      ] = await Promise.all([
        supabase.from('review_votes').select('*', { count: 'exact', head: true })
          .eq('review_id', reviewId)
          .eq('is_helpful', true),
        user ? supabase.from('review_votes').select('is_helpful')
          .eq('review_id', reviewId)
          .eq('user_id', user.id)
          .maybeSingle() : Promise.resolve({ data: null })
      ]);

      helpfulVotes = helpfulCount || 0;
      userVote = userVoteData?.is_helpful || null;

      // Get responses count
      const { count: responsesCount } = await supabase
        .from('review_responses')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', reviewId);

      const reviewWithUser: ReviewWithUser = {
        ...review,
        user: review.user,
        restaurant: review.restaurant,
        food_entry: review.food_entry,
        helpful_votes: helpfulVotes,
        user_vote: userVote,
        responses_count: responsesCount || 0,
      };

      return { success: true, data: reviewWithUser };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get review'
      };
    }
  }

  /**
   * Create new review
   */
  static async createReview(reviewData: InsertReview): Promise<ApiResponse<DbReview>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create review'
      };
    }
  }

  /**
   * Update review
   */
  static async updateReview(reviewId: string, updates: UpdateReview): Promise<ApiResponse<DbReview>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update review'
      };
    }
  }

  /**
   * Delete review
   */
  static async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete review'
      };
    }
  }

  /**
   * Get reviews for a restaurant
   */
  static async getRestaurantReviews(
    restaurantId: string,
    params: PaginationParams & { sort_by?: string; sort_order?: 'asc' | 'desc' } = {}
  ): Promise<PaginatedResponse<ReviewWithUser>> {
    try {
      const {
        page = 1,
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params;

      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants!inner(id, name, address, city),
          food_entry:food_entries(id, title, images)
        `, { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .eq('is_public', true)
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      const reviewsWithUser = data?.map(review => ({
        ...review,
        user: review.user,
        restaurant: review.restaurant,
        food_entry: review.food_entry,
      })) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: reviewsWithUser,
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
        error: error instanceof Error ? error.message : 'Failed to get restaurant reviews',
        pagination: {} as any,
      };
    }
  }

  /**
   * Get reviews by user
   */
  static async getUserReviews(
    userId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<ReviewWithUser>> {
    try {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants!inner(id, name, address, city),
          food_entry:food_entries(id, title, images)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      const reviewsWithUser = data?.map(review => ({
        ...review,
        user: review.user,
        restaurant: review.restaurant,
        food_entry: review.food_entry,
      })) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: reviewsWithUser,
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
        error: error instanceof Error ? error.message : 'Failed to get user reviews',
        pagination: {} as any,
      };
    }
  }

  /**
   * Vote on review helpfulness
   */
  static async voteOnReview(reviewId: string, isHelpful: boolean): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Upsert vote
      const { error } = await supabase
        .from('review_votes')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful,
        }, {
          onConflict: 'review_id, user_id'
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to vote on review'
      };
    }
  }

  /**
   * Remove vote from review
   */
  static async removeVoteFromReview(reviewId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('review_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove vote from review'
      };
    }
  }

  /**
   * Add response to review
   */
  static async addReviewResponse(
    reviewId: string,
    content: string,
    isOwnerResponse = false
  ): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          content,
          is_owner_response: isOwnerResponse,
        })
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add review response'
      };
    }
  }

  /**
   * Get review responses
   */
  static async getReviewResponses(
    reviewId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('review_responses')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image)
        `, { count: 'exact' })
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

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
        error: error instanceof Error ? error.message : 'Failed to get review responses',
        pagination: {} as any,
      };
    }
  }

  /**
   * Get featured reviews
   */
  static async getFeaturedReviews(limit = 10): Promise<ApiResponse<ReviewWithUser[]>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants!inner(id, name, address, city),
          food_entry:food_entries(id, title, images)
        `)
        .eq('is_featured', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      const reviewsWithUser = data?.map(review => ({
        ...review,
        user: review.user,
        restaurant: review.restaurant,
        food_entry: review.food_entry,
      })) || [];

      return { success: true, data: reviewsWithUser };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get featured reviews'
      };
    }
  }

  /**
   * Get recent reviews
   */
  static async getRecentReviews(limit = 20): Promise<ApiResponse<ReviewWithUser[]>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants!inner(id, name, address, city),
          food_entry:food_entries(id, title, images)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      const reviewsWithUser = data?.map(review => ({
        ...review,
        user: review.user,
        restaurant: review.restaurant,
        food_entry: review.food_entry,
      })) || [];

      return { success: true, data: reviewsWithUser };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recent reviews'
      };
    }
  }

  /**
   * Search reviews
   */
  static async searchReviews(
    query: string,
    params: PaginationParams & { 
      restaurant_id?: string;
      user_id?: string;
      rating_min?: number;
    } = {}
  ): Promise<PaginatedResponse<ReviewWithUser>> {
    try {
      const {
        page = 1,
        limit = 20,
        restaurant_id,
        user_id,
        rating_min
      } = params;

      const offset = (page - 1) * limit;

      let supabaseQuery = supabase
        .from('reviews')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image),
          restaurant:restaurants!inner(id, name, address, city),
          food_entry:food_entries(id, title, images)
        `, { count: 'exact' })
        .eq('is_public', true);

      // Apply search
      if (query) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,` +
          `content.ilike.%${query}%`
        );
      }

      // Apply filters
      if (restaurant_id) {
        supabaseQuery = supabaseQuery.eq('restaurant_id', restaurant_id);
      }

      if (user_id) {
        supabaseQuery = supabaseQuery.eq('user_id', user_id);
      }

      if (rating_min !== undefined && rating_min > 0) {
        supabaseQuery = supabaseQuery.gte('rating', rating_min);
      }

      const { data, error, count } = await supabaseQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      const reviewsWithUser = data?.map(review => ({
        ...review,
        user: review.user,
        restaurant: review.restaurant,
        food_entry: review.food_entry,
      })) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: reviewsWithUser,
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
        error: error instanceof Error ? error.message : 'Failed to search reviews',
        pagination: {} as any,
      };
    }
  }
}