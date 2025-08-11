// Restaurant API functions
import { supabase } from '../lib/supabase/client';
import type {
  DbRestaurant,
  InsertRestaurant,
  UpdateRestaurant,
  RestaurantWithDetails,
  ApiResponse,
  PaginatedResponse,
  RestaurantSearchParams,
  RestaurantMetrics,
  LocationData,
} from '../lib/types/api';

export class RestaurantAPI {
  /**
   * Get restaurant by ID with detailed information
   */
  static async getRestaurant(restaurantId: string): Promise<ApiResponse<RestaurantWithDetails>> {
    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .eq('is_active', true)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Get recent reviews with user information
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Check if current user has reviewed this restaurant
      const { data: { user } } = await supabase.auth.getUser();
      let userReview = null;
      let isFavorited = false;
      let visitCount = 0;

      if (user) {
        const [
          { data: userReviewData },
          { data: favoriteData },
          { count: visits }
        ] = await Promise.all([
          supabase.from('reviews').select('*').eq('restaurant_id', restaurantId).eq('user_id', user.id).maybeSingle(),
          supabase.from('collection_items').select('id').eq('item_type', 'restaurant').eq('item_id', restaurantId).limit(1),
          supabase.from('food_entries').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).eq('user_id', user.id)
        ]);

        userReview = userReviewData;
        isFavorited = !!favoriteData?.length;
        visitCount = visits || 0;
      }

      const restaurantWithDetails: RestaurantWithDetails = {
        ...restaurant,
        recent_reviews: reviews || [],
        user_review: userReview,
        is_favorited: isFavorited,
        visit_count: visitCount,
      };

      return { success: true, data: restaurantWithDetails };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get restaurant'
      };
    }
  }

  /**
   * Search restaurants with filters and pagination
   */
  static async searchRestaurants(params: RestaurantSearchParams): Promise<PaginatedResponse<RestaurantWithDetails>> {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        cuisine = [],
        price_range = [],
        rating_min = 0,
        city = '',
        delivery_available,
        takeout_available,
        location,
        sort_by = 'rating',
        sort_order = 'desc'
      } = params;

      const offset = (page - 1) * limit;

      let query = supabase
        .from('restaurants')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,` +
          `description.ilike.%${search}%,` +
          `address.ilike.%${search}%`
        );
      }

      // Apply cuisine filter
      if (cuisine.length > 0) {
        query = query.overlaps('cuisine_types', cuisine);
      }

      // Apply price range filter
      if (price_range.length > 0) {
        query = query.in('price_range', price_range);
      }

      // Apply rating filter
      if (rating_min > 0) {
        query = query.gte('rating', rating_min);
      }

      // Apply city filter
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      // Apply delivery filter
      if (delivery_available !== undefined) {
        query = query.eq('delivery_available', delivery_available);
      }

      // Apply takeout filter
      if (takeout_available !== undefined) {
        query = query.eq('takeout_available', takeout_available);
      }

      // Apply location-based filtering
      if (location) {
        const { latitude, longitude, radius_km = 10 } = location;
        // Using a simple bounding box for now - in production, use PostGIS functions
        const latDelta = radius_km / 111.32; // Rough conversion km to degrees
        const lngDelta = radius_km / (111.32 * Math.cos(latitude * Math.PI / 180));
        
        query = query
          .gte('latitude', latitude - latDelta)
          .lte('latitude', latitude + latDelta)
          .gte('longitude', longitude - lngDelta)
          .lte('longitude', longitude + lngDelta);
      }

      // Apply sorting
      const validSortFields = ['rating', 'review_count', 'name', 'created_at'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'rating';
      query = query.order(sortField, { ascending: sort_order === 'asc' });

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      // Calculate distances if location provided
      const restaurantsWithDetails = data?.map(restaurant => {
        let distance_km: number | undefined;
        
        if (location && restaurant.latitude && restaurant.longitude) {
          distance_km = calculateDistance(
            location.latitude,
            location.longitude,
            restaurant.latitude,
            restaurant.longitude
          );
        }

        return {
          ...restaurant,
          distance_km,
        } as RestaurantWithDetails;
      }) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: restaurantsWithDetails,
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
        error: error instanceof Error ? error.message : 'Failed to search restaurants',
        pagination: {} as any,
      };
    }
  }

  /**
   * Create new restaurant (admin/service role only)
   */
  static async createRestaurant(restaurantData: InsertRestaurant): Promise<ApiResponse<DbRestaurant>> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurantData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create restaurant'
      };
    }
  }

  /**
   * Update restaurant (admin/service role only)
   */
  static async updateRestaurant(restaurantId: string, updates: UpdateRestaurant): Promise<ApiResponse<DbRestaurant>> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update restaurant'
      };
    }
  }

  /**
   * Get nearby restaurants
   */
  static async getNearbyRestaurants(
    latitude: number, 
    longitude: number, 
    radius_km = 10,
    limit = 20
  ): Promise<ApiResponse<RestaurantWithDetails[]>> {
    try {
      // Simple bounding box approach - in production, use proper geospatial queries
      const latDelta = radius_km / 111.32;
      const lngDelta = radius_km / (111.32 * Math.cos(latitude * Math.PI / 180));

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .gte('latitude', latitude - latDelta)
        .lte('latitude', latitude + latDelta)
        .gte('longitude', longitude - lngDelta)
        .lte('longitude', longitude + lngDelta)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      // Calculate actual distances and sort by distance
      const restaurantsWithDistance = data
        ?.map(restaurant => ({
          ...restaurant,
          distance_km: restaurant.latitude && restaurant.longitude
            ? calculateDistance(latitude, longitude, restaurant.latitude, restaurant.longitude)
            : undefined,
        }))
        .filter(restaurant => !restaurant.distance_km || restaurant.distance_km <= radius_km)
        .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));

      return { success: true, data: restaurantsWithDistance || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get nearby restaurants'
      };
    }
  }

  /**
   * Get restaurant metrics for analytics
   */
  static async getRestaurantMetrics(restaurantId: string): Promise<ApiResponse<RestaurantMetrics>> {
    try {
      const [
        { data: foodEntries },
        { data: reviews },
      ] = await Promise.all([
        supabase.from('food_entries').select('consumed_at, rating, title').eq('restaurant_id', restaurantId),
        supabase.from('reviews').select('rating, visit_date').eq('restaurant_id', restaurantId).eq('is_public', true),
      ]);

      const totalVisits = (foodEntries?.length || 0) + (reviews?.length || 0);
      
      // Calculate average rating
      const allRatings = [
        ...(foodEntries?.map(entry => entry.rating) || []),
        ...(reviews?.map(review => review.rating) || [])
      ];
      const averageRating = allRatings.length > 0
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
        : 0;

      // Rating distribution
      const ratingDistribution = allRatings.reduce((acc: { [key: number]: number }, rating) => {
        const roundedRating = Math.round(rating);
        acc[roundedRating] = (acc[roundedRating] || 0) + 1;
        return acc;
      }, {});

      // Popular dishes
      const dishMentions: { [key: string]: number } = {};
      foodEntries?.forEach(entry => {
        if (entry.title) {
          const words = entry.title.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 3) {
              dishMentions[word] = (dishMentions[word] || 0) + 1;
            }
          });
        }
      });

      const popularDishes = Object.entries(dishMentions)
        .map(([dish, mentions]) => ({ dish, mentions }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 10);

      // Peak hours analysis
      const hourlyVisits = Array(24).fill(0);
      [...(foodEntries || []), ...(reviews || [])].forEach(item => {
        const date = new Date(item.consumed_at || item.visit_date);
        if (!isNaN(date.getTime())) {
          hourlyVisits[date.getHours()]++;
        }
      });

      const peakHours = hourlyVisits
        .map((visits, hour) => ({ hour, visits }))
        .filter(item => item.visits > 0)
        .sort((a, b) => b.visits - a.visits);

      // Seasonal trends
      const monthlyVisits: { [key: string]: number } = {};
      [...(foodEntries || []), ...(reviews || [])].forEach(item => {
        const date = new Date(item.consumed_at || item.visit_date);
        if (!isNaN(date.getTime())) {
          const month = date.toISOString().slice(0, 7);
          monthlyVisits[month] = (monthlyVisits[month] || 0) + 1;
        }
      });

      const seasonalTrends = Object.entries(monthlyVisits)
        .map(([month, visits]) => ({ month, visits }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const metrics: RestaurantMetrics = {
        total_visits: totalVisits,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingDistribution,
        popular_dishes: popularDishes,
        peak_hours: peakHours,
        seasonal_trends: seasonalTrends,
      };

      return { success: true, data: metrics };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get restaurant metrics'
      };
    }
  }

  /**
   * Get trending restaurants
   */
  static async getTrendingRestaurants(limit = 10): Promise<ApiResponse<RestaurantWithDetails[]>> {
    try {
      // Get restaurants with recent activity
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          food_entries!inner(id, created_at),
          reviews!inner(id, created_at)
        `)
        .eq('is_active', true)
        .or(`food_entries.created_at.gte.${oneWeekAgo},reviews.created_at.gte.${oneWeekAgo}`)
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
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}