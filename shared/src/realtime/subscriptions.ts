// Real-time subscription helpers for Supabase
import { supabase } from '../lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { 
  DbFoodEntry, 
  DbReview, 
  DbFriendship, 
  UserActivity,
  RealtimeSubscription 
} from '../lib/types/api';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SubscriptionOptions {
  filter?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

/**
 * Base class for real-time subscriptions
 */
export class RealtimeSubscriptionManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isConnected = false;

  constructor() {
    // Listen for connection status
    supabase.realtime.onOpen(() => {
      this.isConnected = true;
      console.log('Realtime connection opened');
    });

    supabase.realtime.onClose(() => {
      this.isConnected = false;
      console.log('Realtime connection closed');
    });

    supabase.realtime.onError((error) => {
      console.error('Realtime connection error:', error);
    });
  }

  /**
   * Create a subscription to a table
   */
  subscribeToTable<T = any>(
    tableName: string,
    callback: (payload: RealtimeSubscription<T>) => void,
    options: SubscriptionOptions = {}
  ): string {
    const channelName = `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: options.filter,
        },
        (payload) => {
          callback({
            channel: channelName,
            event: payload.eventType as RealtimeEvent,
            new: payload.new as T,
            old: payload.old as T,
            errors: payload.errors,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          options.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          options.onError?.(new Error('Channel subscription error'));
        } else if (status === 'TIMED_OUT') {
          options.onError?.(new Error('Channel subscription timed out'));
        }
      });

    this.channels.set(channelName, channel);
    return channelName;
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  /**
   * Check if connected to realtime
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Global subscription manager instance
export const subscriptionManager = new RealtimeSubscriptionManager();

/**
 * Hook for subscribing to food entries changes
 */
export class FoodEntrySubscriptions {
  /**
   * Subscribe to all food entry changes
   */
  static subscribeToAllEntries(
    callback: (payload: RealtimeSubscription<DbFoodEntry>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('food_entries', callback, {
      ...options,
      filter: 'is_public.eq.true', // Only subscribe to public entries
    });
  }

  /**
   * Subscribe to user's food entries
   */
  static subscribeToUserEntries(
    userId: string,
    callback: (payload: RealtimeSubscription<DbFoodEntry>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('food_entries', callback, {
      ...options,
      filter: `user_id.eq.${userId}`,
    });
  }

  /**
   * Subscribe to restaurant's food entries
   */
  static subscribeToRestaurantEntries(
    restaurantId: string,
    callback: (payload: RealtimeSubscription<DbFoodEntry>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('food_entries', callback, {
      ...options,
      filter: `restaurant_id.eq.${restaurantId}`,
    });
  }

  /**
   * Subscribe to friend's food entries
   */
  static subscribeToFriendsEntries(
    friendIds: string[],
    callback: (payload: RealtimeSubscription<DbFoodEntry>) => void,
    options: SubscriptionOptions = {}
  ): string {
    const filter = friendIds.length > 0 
      ? `user_id.in.(${friendIds.join(',')})`
      : undefined;
      
    return subscriptionManager.subscribeToTable('food_entries', callback, {
      ...options,
      filter,
    });
  }
}

/**
 * Hook for subscribing to review changes
 */
export class ReviewSubscriptions {
  /**
   * Subscribe to all review changes
   */
  static subscribeToAllReviews(
    callback: (payload: RealtimeSubscription<DbReview>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('reviews', callback, {
      ...options,
      filter: 'is_public.eq.true',
    });
  }

  /**
   * Subscribe to restaurant reviews
   */
  static subscribeToRestaurantReviews(
    restaurantId: string,
    callback: (payload: RealtimeSubscription<DbReview>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('reviews', callback, {
      ...options,
      filter: `restaurant_id.eq.${restaurantId}`,
    });
  }

  /**
   * Subscribe to user reviews
   */
  static subscribeToUserReviews(
    userId: string,
    callback: (payload: RealtimeSubscription<DbReview>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('reviews', callback, {
      ...options,
      filter: `user_id.eq.${userId}`,
    });
  }

  /**
   * Subscribe to review responses
   */
  static subscribeToReviewResponses(
    reviewId: string,
    callback: (payload: RealtimeSubscription<any>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('review_responses', callback, {
      ...options,
      filter: `review_id.eq.${reviewId}`,
    });
  }
}

/**
 * Hook for subscribing to social features
 */
export class SocialSubscriptions {
  /**
   * Subscribe to friendship changes
   */
  static subscribeToFriendships(
    userId: string,
    callback: (payload: RealtimeSubscription<DbFriendship>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('friendships', callback, {
      ...options,
      filter: `or(requester_id.eq.${userId},addressee_id.eq.${userId})`,
    });
  }

  /**
   * Subscribe to user activities
   */
  static subscribeToUserActivities(
    userId: string,
    callback: (payload: RealtimeSubscription<UserActivity>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('user_activities', callback, {
      ...options,
      filter: `user_id.eq.${userId}`,
    });
  }

  /**
   * Subscribe to activity feed (friends' activities)
   */
  static subscribeToActivityFeed(
    userIds: string[],
    callback: (payload: RealtimeSubscription<UserActivity>) => void,
    options: SubscriptionOptions = {}
  ): string {
    const filter = userIds.length > 0 
      ? `user_id.in.(${userIds.join(',')})`
      : undefined;
      
    return subscriptionManager.subscribeToTable('user_activities', callback, {
      ...options,
      filter: filter + (filter ? '.and.is_public.eq.true' : 'is_public.eq.true'),
    });
  }

  /**
   * Subscribe to user follows
   */
  static subscribeToFollows(
    userId: string,
    callback: (payload: RealtimeSubscription<any>) => void,
    options: SubscriptionOptions = {}
  ): string {
    return subscriptionManager.subscribeToTable('user_follows', callback, {
      ...options,
      filter: `or(follower_id.eq.${userId},following_id.eq.${userId})`,
    });
  }
}

/**
 * Hook for subscribing to notification-related changes
 */
export class NotificationSubscriptions {
  /**
   * Subscribe to events that should trigger notifications for a user
   */
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: {
      type: string;
      title: string;
      message: string;
      data?: any;
    }) => void,
    options: SubscriptionOptions = {}
  ): string[] {
    const subscriptions: string[] = [];

    // Subscribe to friend requests
    const friendshipSub = SocialSubscriptions.subscribeToFriendships(
      userId,
      (payload) => {
        if (payload.event === 'INSERT' && payload.new?.addressee_id === userId) {
          onNotification({
            type: 'friend_request',
            title: 'New Friend Request',
            message: 'Someone sent you a friend request',
            data: payload.new,
          });
        }
      },
      options
    );
    subscriptions.push(friendshipSub);

    // Subscribe to review responses on user's reviews
    const reviewResponsesSub = subscriptionManager.subscribeToTable(
      'review_responses',
      (payload) => {
        if (payload.event === 'INSERT') {
          onNotification({
            type: 'review_response',
            title: 'New Review Response',
            message: 'Someone responded to your review',
            data: payload.new,
          });
        }
      },
      {
        ...options,
        // Note: This would need a more complex filter in a real implementation
        // to only get responses to reviews authored by the user
      }
    );
    subscriptions.push(reviewResponsesSub);

    // Subscribe to new followers
    const followersSub = subscriptionManager.subscribeToTable(
      'user_follows',
      (payload) => {
        if (payload.event === 'INSERT' && payload.new?.following_id === userId) {
          onNotification({
            type: 'new_follower',
            title: 'New Follower',
            message: 'Someone started following you',
            data: payload.new,
          });
        }
      },
      options
    );
    subscriptions.push(followersSub);

    return subscriptions;
  }
}

/**
 * React hook for managing real-time subscriptions
 */
export function useRealtimeSubscription<T = any>(
  tableName: string,
  callback: (payload: RealtimeSubscription<T>) => void,
  options: SubscriptionOptions & {
    enabled?: boolean;
    deps?: any[];
  } = {}
) {
  const { enabled = true, deps = [], ...subscriptionOptions } = options;

  // This would be implemented differently in React vs React Native
  // This is a simplified version - in practice, you'd use useEffect
  let channelName: string | null = null;

  const subscribe = () => {
    if (enabled && !channelName) {
      channelName = subscriptionManager.subscribeToTable(
        tableName,
        callback,
        subscriptionOptions
      );
    }
  };

  const unsubscribe = () => {
    if (channelName) {
      subscriptionManager.unsubscribe(channelName);
      channelName = null;
    }
  };

  // Cleanup function
  const cleanup = () => {
    unsubscribe();
  };

  return {
    subscribe,
    unsubscribe,
    cleanup,
    isConnected: subscriptionManager.getConnectionStatus(),
  };
}

/**
 * Presence system for showing online users
 */
export class PresenceSystem {
  private presenceChannel: RealtimeChannel | null = null;
  private currentUsers: Map<string, any> = new Map();

  /**
   * Join a presence channel
   */
  joinPresence(
    channelName: string,
    userInfo: { id: string; name: string; avatar?: string },
    onUsersChange?: (users: any[]) => void
  ) {
    this.presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userInfo.id,
        },
      },
    });

    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = this.presenceChannel!.presenceState();
        const users = Object.values(state).flat();
        this.currentUsers.clear();
        users.forEach((user: any) => {
          this.currentUsers.set(user.id, user);
        });
        onUsersChange?.(Array.from(this.currentUsers.values()));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: any) => {
          this.currentUsers.set(presence.id, presence);
        });
        onUsersChange?.(Array.from(this.currentUsers.values()));
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          this.currentUsers.delete(presence.id);
        });
        onUsersChange?.(Array.from(this.currentUsers.values()));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.presenceChannel!.track(userInfo);
        }
      });
  }

  /**
   * Leave the presence channel
   */
  leavePresence() {
    if (this.presenceChannel) {
      this.presenceChannel.untrack();
      supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
      this.currentUsers.clear();
    }
  }

  /**
   * Get current online users
   */
  getCurrentUsers(): any[] {
    return Array.from(this.currentUsers.values());
  }
}

// Export subscription manager and classes
export default subscriptionManager;