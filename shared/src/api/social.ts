// Social features API functions
import { supabase } from '../lib/supabase/client';
import type {
  DbFriendship,
  FriendshipWithUser,
  UserActivity,
  CollectionWithItems,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  FriendshipStatus,
} from '../lib/types/api';

export class SocialAPI {
  /**
   * Send friend request
   */
  static async sendFriendRequest(addresseeId: string): Promise<ApiResponse<DbFriendship>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),` +
          `and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
        )
        .maybeSingle();

      if (existingFriendship) {
        return { success: false, error: 'Friendship request already exists' };
      }

      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
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
        error: error instanceof Error ? error.message : 'Failed to send friend request'
      };
    }
  }

  /**
   * Respond to friend request (accept/decline)
   */
  static async respondToFriendRequest(
    friendshipId: string,
    status: 'accepted' | 'declined'
  ): Promise<ApiResponse<DbFriendship>> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to respond to friend request'
      };
    }
  }

  /**
   * Remove friendship or cancel request
   */
  static async removeFriendship(friendshipId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove friendship'
      };
    }
  }

  /**
   * Get user's friends
   */
  static async getUserFriends(
    userId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<FriendshipWithUser>> {
    try {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:users!friendships_requester_id_fkey(id, username, display_name, profile_image),
          addressee:users!friendships_addressee_id_fkey(id, username, display_name, profile_image)
        `, { count: 'exact' })
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      const friendships = data?.map(friendship => ({
        ...friendship,
        requester: friendship.requester,
        addressee: friendship.addressee,
      })) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: friendships,
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
        error: error instanceof Error ? error.message : 'Failed to get user friends',
        pagination: {} as any,
      };
    }
  }

  /**
   * Get pending friend requests
   */
  static async getPendingRequests(): Promise<ApiResponse<FriendshipWithUser[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:users!friendships_requester_id_fkey(id, username, display_name, profile_image),
          addressee:users!friendships_addressee_id_fkey(id, username, display_name, profile_image)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const requests = data?.map(friendship => ({
        ...friendship,
        requester: friendship.requester,
        addressee: friendship.addressee,
      })) || [];

      return { success: true, data: requests };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pending requests'
      };
    }
  }

  /**
   * Follow user
   */
  static async followUser(followingId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: followingId,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to follow user'
      };
    }
  }

  /**
   * Unfollow user
   */
  static async unfollowUser(followingId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unfollow user'
      };
    }
  }

  /**
   * Get user's followers
   */
  static async getUserFollowers(
    userId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('user_follows')
        .select(`
          *,
          follower:users!user_follows_follower_id_fkey(id, username, display_name, profile_image)
        `, { count: 'exact' })
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
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
        error: error instanceof Error ? error.message : 'Failed to get user followers',
        pagination: {} as any,
      };
    }
  }

  /**
   * Get users that a user is following
   */
  static async getUserFollowing(
    userId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('user_follows')
        .select(`
          *,
          following:users!user_follows_following_id_fkey(id, username, display_name, profile_image)
        `, { count: 'exact' })
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
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
        error: error instanceof Error ? error.message : 'Failed to get user following',
        pagination: {} as any,
      };
    }
  }

  /**
   * Get activity feed for user
   */
  static async getActivityFeed(
    userId?: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<UserActivity>> {
    try {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('user_activities')
        .select(`
          *,
          user:users!inner(id, username, display_name, profile_image)
        `, { count: 'exact' })
        .eq('is_public', true);

      // If userId provided, get activities from friends and followed users
      if (userId) {
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
        const allUserIds = [...new Set([...friendIds, ...followingIds, userId])];

        if (allUserIds.length > 0) {
          query = query.in('user_id', allUserIds);
        }
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, pagination: {} as any };
      }

      const activities = data?.map(activity => ({
        ...activity,
        user: activity.user,
      })) || [];

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: activities,
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
        error: error instanceof Error ? error.message : 'Failed to get activity feed',
        pagination: {} as any,
      };
    }
  }

  /**
   * Create user collection
   */
  static async createCollection(
    name: string,
    description?: string,
    isPublic = false,
    color = '#3b82f6',
    icon = 'bookmark'
  ): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          name,
          description,
          is_public: isPublic,
          color,
          icon,
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
        error: error instanceof Error ? error.message : 'Failed to create collection'
      };
    }
  }

  /**
   * Get user collections
   */
  static async getUserCollections(
    userId: string,
    includePrivate = false
  ): Promise<ApiResponse<CollectionWithItems[]>> {
    try {
      let query = supabase
        .from('user_collections')
        .select(`
          *,
          items:collection_items(count)
        `)
        .eq('user_id', userId);

      if (!includePrivate) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const collectionsWithItems = data?.map(collection => ({
        ...collection,
        items_count: Array.isArray(collection.items) ? collection.items.length : 0,
      })) || [];

      return { success: true, data: collectionsWithItems };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user collections'
      };
    }
  }

  /**
   * Add item to collection
   */
  static async addToCollection(
    collectionId: string,
    itemType: 'restaurant' | 'food_entry' | 'review',
    itemId: string,
    notes?: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('collection_items')
        .insert({
          collection_id: collectionId,
          item_type: itemType,
          item_id: itemId,
          notes,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item to collection'
      };
    }
  }

  /**
   * Remove item from collection
   */
  static async removeFromCollection(
    collectionId: string,
    itemType: 'restaurant' | 'food_entry' | 'review',
    itemId: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove item from collection'
      };
    }
  }

  /**
   * Get mutual friends between two users
   */
  static async getMutualFriends(
    user1Id: string,
    user2Id: string
  ): Promise<ApiResponse<Array<{ id: string; display_name: string; profile_image?: string }>>> {
    try {
      const { data, error } = await supabase.rpc('get_mutual_friends', {
        user1_id: user1Id,
        user2_id: user2Id,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const mutualFriends = data?.map((friend: any) => ({
        id: friend.friend_id,
        display_name: friend.friend_name,
      })) || [];

      return { success: true, data: mutualFriends };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get mutual friends'
      };
    }
  }

  /**
   * Block user
   */
  static async blockUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Create or update friendship status to blocked
      const { error } = await supabase
        .from('friendships')
        .upsert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'blocked',
        }, {
          onConflict: 'requester_id, addressee_id'
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Remove any follow relationships
      await supabase
        .from('user_follows')
        .delete()
        .or(
          `and(follower_id.eq.${user.id},following_id.eq.${userId}),` +
          `and(follower_id.eq.${userId},following_id.eq.${user.id})`
        );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to block user'
      };
    }
  }
}