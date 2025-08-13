// Mobile UI Types
export interface TabItem {
  id: string;
  label: string;
  icon: string;
  activeIcon?: string;
  badge?: number;
  route: string;
}

export interface FoodCardProps {
  id: string;
  title: string;
  restaurant: string;
  image: string;
  rating: number;
  price: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  count?: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'food_post' | 'restaurant_review' | 'friend_activity';
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface FriendSuggestion {
  id: string;
  name: string;
  avatar: string;
  mutualFriends: number;
  tasteSimilarity: number;
  favoriteCategories: string[];
  recentActivity: string;
}

export interface GestureState {
  isSwipingLeft: boolean;
  isSwipingRight: boolean;
  swipeProgress: number;
}

export interface HapticFeedbackType {
  light: 'light';
  medium: 'medium';
  heavy: 'heavy';
  success: 'success';
  warning: 'warning';
  error: 'error';
}