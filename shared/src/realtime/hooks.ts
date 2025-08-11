// React hooks for real-time subscriptions
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  subscriptionManager,
  FoodEntrySubscriptions,
  ReviewSubscriptions,
  SocialSubscriptions,
  NotificationSubscriptions,
  PresenceSystem,
} from './subscriptions';
import type { 
  RealtimeSubscription,
  DbFoodEntry,
  DbReview,
  DbFriendship,
  UserActivity,
  SubscriptionOptions,
} from '../lib/types/api';

/**
 * Hook for managing real-time food entries
 */
export function useFoodEntriesRealtime(
  type: 'all' | 'user' | 'restaurant' | 'friends' = 'all',
  id?: string,
  options: SubscriptionOptions & { enabled?: boolean } = {}
) {
  const [entries, setEntries] = useState<DbFoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<string | null>(null);
  const { enabled = true, ...subscriptionOptions } = options;

  const handleRealtimeUpdate = useCallback((payload: RealtimeSubscription<DbFoodEntry>) => {
    setEntries(currentEntries => {
      switch (payload.event) {
        case 'INSERT':
          if (payload.new) {
            return [payload.new, ...currentEntries];
          }
          break;
        case 'UPDATE':
          if (payload.new) {
            return currentEntries.map(entry => 
              entry.id === payload.new!.id ? payload.new! : entry
            );
          }
          break;
        case 'DELETE':
          if (payload.old) {
            return currentEntries.filter(entry => entry.id !== payload.old!.id);
          }
          break;
      }
      return currentEntries;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);

    // Subscribe based on type
    let subscription: string | null = null;

    switch (type) {
      case 'all':
        subscription = FoodEntrySubscriptions.subscribeToAllEntries(
          handleRealtimeUpdate,
          {
            ...subscriptionOptions,
            onConnect: () => {
              setLoading(false);
              subscriptionOptions.onConnect?.();
            },
          }
        );
        break;
      case 'user':
        if (id) {
          subscription = FoodEntrySubscriptions.subscribeToUserEntries(
            id,
            handleRealtimeUpdate,
            {
              ...subscriptionOptions,
              onConnect: () => {
                setLoading(false);
                subscriptionOptions.onConnect?.();
              },
            }
          );
        }
        break;
      case 'restaurant':
        if (id) {
          subscription = FoodEntrySubscriptions.subscribeToRestaurantEntries(
            id,
            handleRealtimeUpdate,
            {
              ...subscriptionOptions,
              onConnect: () => {
                setLoading(false);
                subscriptionOptions.onConnect?.();
              },
            }
          );
        }
        break;
      case 'friends':
        if (id) {
          // id should be an array of friend IDs in this case
          const friendIds = Array.isArray(id) ? id : [id];
          subscription = FoodEntrySubscriptions.subscribeToFriendsEntries(
            friendIds,
            handleRealtimeUpdate,
            {
              ...subscriptionOptions,
              onConnect: () => {
                setLoading(false);
                subscriptionOptions.onConnect?.();
              },
            }
          );
        }
        break;
    }

    subscriptionRef.current = subscription;

    return () => {
      if (subscription) {
        subscriptionManager.unsubscribe(subscription);
      }
    };
  }, [type, id, enabled, handleRealtimeUpdate]);

  const addEntry = useCallback((entry: DbFoodEntry) => {
    setEntries(current => [entry, ...current]);
  }, []);

  const updateEntry = useCallback((entryId: string, updates: Partial<DbFoodEntry>) => {
    setEntries(current => 
      current.map(entry => 
        entry.id === entryId ? { ...entry, ...updates } : entry
      )
    );
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    setEntries(current => current.filter(entry => entry.id !== entryId));
  }, []);

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    removeEntry,
    isConnected: subscriptionManager.getConnectionStatus(),
  };
}

/**
 * Hook for managing real-time reviews
 */
export function useReviewsRealtime(
  type: 'all' | 'restaurant' | 'user' = 'all',
  id?: string,
  options: SubscriptionOptions & { enabled?: boolean } = {}
) {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<string | null>(null);
  const { enabled = true, ...subscriptionOptions } = options;

  const handleRealtimeUpdate = useCallback((payload: RealtimeSubscription<DbReview>) => {
    setReviews(currentReviews => {
      switch (payload.event) {
        case 'INSERT':
          if (payload.new) {
            return [payload.new, ...currentReviews];
          }
          break;
        case 'UPDATE':
          if (payload.new) {
            return currentReviews.map(review => 
              review.id === payload.new!.id ? payload.new! : review
            );
          }
          break;
        case 'DELETE':
          if (payload.old) {
            return currentReviews.filter(review => review.id !== payload.old!.id);
          }
          break;
      }
      return currentReviews;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);
    let subscription: string | null = null;

    switch (type) {
      case 'all':
        subscription = ReviewSubscriptions.subscribeToAllReviews(
          handleRealtimeUpdate,
          {
            ...subscriptionOptions,
            onConnect: () => {
              setLoading(false);
              subscriptionOptions.onConnect?.();
            },
          }
        );
        break;
      case 'restaurant':
        if (id) {
          subscription = ReviewSubscriptions.subscribeToRestaurantReviews(
            id,
            handleRealtimeUpdate,
            {
              ...subscriptionOptions,
              onConnect: () => {
                setLoading(false);
                subscriptionOptions.onConnect?.();
              },
            }
          );
        }
        break;
      case 'user':
        if (id) {
          subscription = ReviewSubscriptions.subscribeToUserReviews(
            id,
            handleRealtimeUpdate,
            {
              ...subscriptionOptions,
              onConnect: () => {
                setLoading(false);
                subscriptionOptions.onConnect?.();
              },
            }
          );
        }
        break;
    }

    subscriptionRef.current = subscription;

    return () => {
      if (subscription) {
        subscriptionManager.unsubscribe(subscription);
      }
    };
  }, [type, id, enabled, handleRealtimeUpdate]);

  return {
    reviews,
    loading,
    isConnected: subscriptionManager.getConnectionStatus(),
  };
}

/**
 * Hook for managing real-time friendships
 */
export function useFriendshipsRealtime(
  userId: string,
  options: SubscriptionOptions & { enabled?: boolean } = {}
) {
  const [friendships, setFriendships] = useState<DbFriendship[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<string | null>(null);
  const { enabled = true, ...subscriptionOptions } = options;

  const handleRealtimeUpdate = useCallback((payload: RealtimeSubscription<DbFriendship>) => {
    setFriendships(currentFriendships => {
      switch (payload.event) {
        case 'INSERT':
          if (payload.new) {
            return [...currentFriendships, payload.new];
          }
          break;
        case 'UPDATE':
          if (payload.new) {
            return currentFriendships.map(friendship => 
              friendship.id === payload.new!.id ? payload.new! : friendship
            );
          }
          break;
        case 'DELETE':
          if (payload.old) {
            return currentFriendships.filter(friendship => friendship.id !== payload.old!.id);
          }
          break;
      }
      return currentFriendships;
    });
  }, []);

  useEffect(() => {
    if (!enabled || !userId) return;

    setLoading(true);
    const subscription = SocialSubscriptions.subscribeToFriendships(
      userId,
      handleRealtimeUpdate,
      {
        ...subscriptionOptions,
        onConnect: () => {
          setLoading(false);
          subscriptionOptions.onConnect?.();
        },
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      if (subscription) {
        subscriptionManager.unsubscribe(subscription);
      }
    };
  }, [userId, enabled, handleRealtimeUpdate]);

  return {
    friendships,
    loading,
    isConnected: subscriptionManager.getConnectionStatus(),
  };
}

/**
 * Hook for managing real-time activity feed
 */
export function useActivityFeedRealtime(
  userIds: string[],
  options: SubscriptionOptions & { enabled?: boolean } = {}
) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<string | null>(null);
  const { enabled = true, ...subscriptionOptions } = options;

  const handleRealtimeUpdate = useCallback((payload: RealtimeSubscription<UserActivity>) => {
    setActivities(currentActivities => {
      switch (payload.event) {
        case 'INSERT':
          if (payload.new) {
            return [payload.new, ...currentActivities].slice(0, 100); // Keep only recent 100
          }
          break;
        case 'UPDATE':
          if (payload.new) {
            return currentActivities.map(activity => 
              activity.id === payload.new!.id ? payload.new! : activity
            );
          }
          break;
        case 'DELETE':
          if (payload.old) {
            return currentActivities.filter(activity => activity.id !== payload.old!.id);
          }
          break;
      }
      return currentActivities;
    });
  }, []);

  useEffect(() => {
    if (!enabled || userIds.length === 0) return;

    setLoading(true);
    const subscription = SocialSubscriptions.subscribeToActivityFeed(
      userIds,
      handleRealtimeUpdate,
      {
        ...subscriptionOptions,
        onConnect: () => {
          setLoading(false);
          subscriptionOptions.onConnect?.();
        },
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      if (subscription) {
        subscriptionManager.unsubscribe(subscription);
      }
    };
  }, [userIds, enabled, handleRealtimeUpdate]);

  return {
    activities,
    loading,
    isConnected: subscriptionManager.getConnectionStatus(),
  };
}

/**
 * Hook for managing real-time notifications
 */
export function useNotificationsRealtime(
  userId: string,
  options: SubscriptionOptions & { 
    enabled?: boolean;
    maxNotifications?: number;
  } = {}
) {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    timestamp: Date;
    read: boolean;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionsRef = useRef<string[]>([]);
  const { enabled = true, maxNotifications = 50, ...subscriptionOptions } = options;

  const addNotification = useCallback((notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }) => {
    const newNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(current => {
      const updated = [newNotification, ...current].slice(0, maxNotifications);
      return updated;
    });

    setUnreadCount(current => current + 1);
  }, [maxNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(current =>
      current.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(current => Math.max(0, current - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(current =>
      current.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!enabled || !userId) return;

    const subscriptions = NotificationSubscriptions.subscribeToNotifications(
      userId,
      addNotification,
      subscriptionOptions
    );

    subscriptionsRef.current = subscriptions;

    return () => {
      subscriptions.forEach(sub => {
        subscriptionManager.unsubscribe(sub);
      });
    };
  }, [userId, enabled, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected: subscriptionManager.getConnectionStatus(),
  };
}

/**
 * Hook for managing presence (online users)
 */
export function usePresence(
  channelName: string,
  userInfo: { id: string; name: string; avatar?: string } | null,
  options: { enabled?: boolean } = {}
) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const presenceRef = useRef<PresenceSystem | null>(null);
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled || !userInfo || !channelName) return;

    presenceRef.current = new PresenceSystem();
    
    presenceRef.current.joinPresence(
      channelName,
      userInfo,
      (users) => {
        setOnlineUsers(users);
        setIsOnline(users.some(user => user.id === userInfo.id));
      }
    );

    return () => {
      if (presenceRef.current) {
        presenceRef.current.leavePresence();
        presenceRef.current = null;
      }
      setOnlineUsers([]);
      setIsOnline(false);
    };
  }, [channelName, userInfo?.id, enabled]);

  return {
    onlineUsers,
    isOnline,
    userCount: onlineUsers.length,
  };
}

/**
 * Hook for connection status
 */
export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(
    subscriptionManager.getConnectionStatus()
  );

  useEffect(() => {
    // Poll connection status every few seconds
    const interval = setInterval(() => {
      setIsConnected(subscriptionManager.getConnectionStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected };
}