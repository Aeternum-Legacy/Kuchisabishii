'use client';

import React, { useState } from 'react';
import { Camera, Settings, Users, Heart, MapPin, Calendar, Star, UserPlus, Search, Bell } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  joinDate: string;
  favoritesCuisines: string[];
  dietaryRestrictions: string[];
  totalReviews: number;
  averageRating: number;
  friends: Friend[];
  isPrivate: boolean;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  mutualFriends: number;
  recentActivity: RecentActivity[];
  status: 'friend' | 'pending' | 'none';
}

interface RecentActivity {
  id: string;
  type: 'food_review' | 'restaurant_visit' | 'friend_add';
  foodName?: string;
  restaurantName?: string;
  rating?: number;
  image?: string;
  timestamp: string;
}

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'activity'>('profile');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [searchFriends, setSearchFriends] = useState('');

  // Mock user data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Food lover exploring the world one bite at a time 🍜 Always hungry for new experiences!',
    location: 'San Francisco, CA',
    joinDate: '2024-01-15',
    favoritesCuisines: ['Japanese', 'Italian', 'Thai', 'Mexican'],
    dietaryRestrictions: ['Vegetarian'],
    totalReviews: 147,
    averageRating: 4.2,
    friends: [],
    isPrivate: false
  });

  const [suggestedFriends] = useState<Friend[]>([
    {
      id: '2',
      name: 'Sarah Kim',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b7fc?w=150&h=150&fit=crop&crop=face',
      mutualFriends: 3,
      recentActivity: [
        { id: '1', type: 'food_review', foodName: 'Ramen', restaurantName: 'Ippudo', rating: 5, timestamp: '2 hours ago' }
      ],
      status: 'none'
    },
    {
      id: '3',
      name: 'Michael Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      mutualFriends: 1,
      recentActivity: [
        { id: '2', type: 'restaurant_visit', restaurantName: 'Blue Bottle Coffee', timestamp: '1 day ago' }
      ],
      status: 'pending'
    }
  ]);

  const [activityFeed] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'food_review',
      foodName: 'Margherita Pizza',
      restaurantName: 'Tony\'s Pizzeria',
      rating: 4,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      timestamp: '3 hours ago'
    },
    {
      id: '2',
      type: 'friend_add',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'food_review',
      foodName: 'Chocolate Croissant',
      restaurantName: 'Corner Bakery',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
      timestamp: '2 days ago'
    }
  ]);

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="relative inline-block">
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">{userProfile.name}</h1>
        <p className="text-gray-600">{userProfile.location}</p>
        <p className="text-sm text-gray-500 mt-2">{userProfile.bio}</p>
        
        <button
          onClick={() => setShowEditProfile(true)}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">{userProfile.totalReviews}</div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-500 mr-1" />
            <span className="text-2xl font-bold text-orange-600">{userProfile.averageRating}</span>
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">{userProfile.friends.length}</div>
          <div className="text-sm text-gray-600">Friends</div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Food Preferences</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Favorite Cuisines</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.favoritesCuisines.map((cuisine) => (
                <span
                  key={cuisine}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                >
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.dietaryRestrictions.map((restriction) => (
                <span
                  key={restriction}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {restriction}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Private Profile</h3>
            <p className="text-xs text-gray-500">Only friends can see your activity</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={userProfile.isPrivate}
              onChange={(e) => setUserProfile(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const FriendsTab = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for friends..."
          value={searchFriends}
          onChange={(e) => setSearchFriends(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Friend Suggestions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Suggested Friends
        </h2>
        
        <div className="space-y-4">
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{friend.name}</h3>
                  <p className="text-sm text-gray-600">{friend.mutualFriends} mutual friends</p>
                  {friend.recentActivity[0] && (
                    <p className="text-xs text-gray-500">
                      Recently tried {friend.recentActivity[0].foodName} at {friend.recentActivity[0].restaurantName}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {friend.status === 'none' && (
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                    Add Friend
                  </button>
                )}
                {friend.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                      Accept
                    </button>
                    <button className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Friends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          My Friends ({userProfile.friends.length})
        </h2>
        
        {userProfile.friends.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No friends yet</p>
            <p className="text-sm text-gray-400">Start by adding some friends above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {userProfile.friends.map((friend) => (
              <div key={friend.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{friend.name}</h3>
                  <p className="text-sm text-gray-600 truncate">Active recently</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Recent Activity
        </h2>
        
        <div className="space-y-4">
          {activityFeed.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              {activity.type === 'food_review' && (
                <>
                  {activity.image && (
                    <img
                      src={activity.image}
                      alt={activity.foodName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">You reviewed {activity.foodName}</p>
                    <p className="text-sm text-gray-600">at {activity.restaurantName}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{activity.rating}/5</span>
                      <span className="text-xs text-gray-500 ml-auto">{activity.timestamp}</span>
                    </div>
                  </div>
                </>
              )}
              
              {activity.type === 'friend_add' && (
                <div className="flex-1">
                  <p className="font-medium">You added a new friend</p>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              )}
              
              {activity.type === 'restaurant_visit' && (
                <div className="flex-1">
                  <p className="font-medium">You visited {activity.restaurantName}</p>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Profile</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4">
          <div className="flex">
            {[
              { key: 'profile', label: 'Profile', icon: <Heart className="w-4 h-4" /> },
              { key: 'friends', label: 'Friends', icon: <Users className="w-4 h-4" /> },
              { key: 'activity', label: 'Activity', icon: <Bell className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'friends' && <FriendsTab />}
        {activeTab === 'activity' && <ActivityTab />}
      </div>
    </div>
  );
};

export default ProfileScreen;