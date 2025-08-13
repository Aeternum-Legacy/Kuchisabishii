'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, Settings, Users, Heart, MapPin, Calendar, Star, 
  UserPlus, Search, Bell, TrendingUp, Award, Download,
  Filter, SortAsc, Eye, EyeOff, Share2, BarChart3, PieChart,
  Target, Bookmark, Clock, ChefHat, Globe, Edit3
} from 'lucide-react';
import { Database } from '@/lib/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import ReviewsTab from './ReviewsTab';
import StatisticsTab from './StatisticsTab';
import PalateProfileTab from './PalateProfileTab';
import SettingsTab from './SettingsTab';
import ImageUpload from './ImageUpload';

// Type definitions
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type FoodExperience = Database['public']['Tables']['food_experiences']['Row'];
type TasteProfile = Database['public']['Tables']['taste_profiles']['Row'];
type RestaurantReview = Database['public']['Tables']['restaurant_reviews']['Row'];

interface UserStats {
  totalReviews: number;
  averageRating: number;
  totalRestaurants: number;
  totalPhotos: number;
  favoriteCuisines: Array<{ cuisine: string; count: number; percentage: number }>;
  monthlyTrends: Array<{ month: string; reviews: number; rating: number }>;
  achievements: Array<{ id: string; title: string; description: string; unlockedAt: string }>;
  tasteEvolution: Array<{ month: string; adventurousness: number; consistency: number }>;
}

interface ReviewWithDetails extends FoodExperience {
  restaurant?: {
    id: string;
    name: string;
    cuisine_types: string[];
  };
  taste_experience?: {
    saltiness: number | null;
    sweetness: number | null;
    sourness: number | null;
    bitterness: number | null;
    umami: number | null;
  };
}

interface FilterOptions {
  dateRange: 'all' | 'week' | 'month' | 'year';
  rating: 'all' | '5' | '4+' | '3+';
  cuisine: string;
  sortBy: 'date' | 'rating' | 'restaurant';
  sortOrder: 'asc' | 'desc';
}

const UserProfileTabs: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'statistics' | 'settings' | 'palate'>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithDetails[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    rating: 'all',
    cuisine: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Mock data for development
  useEffect(() => {
    const loadMockData = () => {
      setUserProfile({
        id: user?.id || '1',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-08-13T00:00:00Z',
        username: 'foodie_alex',
        display_name: 'Alex Chen',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Food lover exploring the world one bite at a time 🍜 Always hungry for new experiences!',
        location: 'San Francisco, CA',
        dietary_restrictions: ['Vegetarian'],
        allergies: [],
        spice_tolerance: 4,
        sweetness_preference: 3,
        profile_visibility: 'public',
        allow_recommendations: true,
        share_analytics: true,
        onboarding_completed: true,
        taste_profile_setup: true
      });

      setUserStats({
        totalReviews: 147,
        averageRating: 4.2,
        totalRestaurants: 89,
        totalPhotos: 234,
        favoriteCuisines: [
          { cuisine: 'Japanese', count: 32, percentage: 21.8 },
          { cuisine: 'Italian', count: 28, percentage: 19.0 },
          { cuisine: 'Thai', count: 22, percentage: 15.0 },
          { cuisine: 'Mexican', count: 18, percentage: 12.2 },
          { cuisine: 'Indian', count: 15, percentage: 10.2 }
        ],
        monthlyTrends: [
          { month: 'Jan', reviews: 12, rating: 4.1 },
          { month: 'Feb', reviews: 15, rating: 4.3 },
          { month: 'Mar', reviews: 18, rating: 4.2 },
          { month: 'Apr', reviews: 22, rating: 4.4 },
          { month: 'May', reviews: 19, rating: 4.1 },
          { month: 'Jun', reviews: 25, rating: 4.5 }
        ],
        achievements: [
          { id: '1', title: 'First Review', description: 'Posted your first food review', unlockedAt: '2024-01-15' },
          { id: '2', title: 'Explorer', description: 'Tried 5 different cuisines', unlockedAt: '2024-02-01' },
          { id: '3', title: 'Critic', description: 'Posted 50 reviews', unlockedAt: '2024-05-15' },
          { id: '4', title: 'Photographer', description: 'Uploaded 100 food photos', unlockedAt: '2024-06-01' }
        ],
        tasteEvolution: [
          { month: 'Jan', adventurousness: 3.2, consistency: 4.1 },
          { month: 'Feb', adventurousness: 3.5, consistency: 4.0 },
          { month: 'Mar', adventurousness: 3.8, consistency: 4.2 },
          { month: 'Apr', adventurousness: 4.1, consistency: 4.3 },
          { month: 'May', adventurousness: 4.3, consistency: 4.1 },
          { month: 'Jun', adventurousness: 4.5, consistency: 4.4 }
        ]
      });

      setTasteProfile({
        id: '1',
        user_id: user?.id || '1',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-08-13T00:00:00Z',
        salty_preference: 4,
        sweet_preference: 3,
        sour_preference: 2,
        bitter_preference: 3,
        umami_preference: 5,
        crunchy_preference: 4,
        creamy_preference: 3,
        chewy_preference: 2,
        hot_food_preference: 4,
        cold_food_preference: 3,
        cuisine_preferences: {
          Japanese: 5,
          Italian: 4,
          Thai: 4,
          Mexican: 3,
          Indian: 4
        },
        culinary_adventurousness: 4.5
      });

      // Mock reviews
      const mockReviews: ReviewWithDetails[] = Array.from({ length: 20 }, (_, i) => ({
        id: `review-${i}`,
        user_id: user?.id || '1',
        restaurant_id: `restaurant-${i % 10}`,
        menu_item_id: null,
        created_at: new Date(2024, 5 - i % 6, i + 1).toISOString(),
        updated_at: new Date(2024, 5 - i % 6, i + 1).toISOString(),
        dish_name: ['Margherita Pizza', 'Ramen Bowl', 'Tacos', 'Pasta Carbonara', 'Pad Thai'][i % 5],
        custom_notes: 'Amazing flavors and perfect presentation!',
        meal_time: ['lunch', 'dinner', 'breakfast', 'snack'][i % 4] as any,
        dining_method: ['dine_in', 'takeout', 'delivery'][i % 3] as any,
        experienced_at: new Date(2024, 5 - i % 6, i + 1).toISOString(),
        amount_spent: 15 + (i * 5),
        currency: 'USD',
        overall_rating: 3 + (i % 3),
        taste_notes: { spicy: i % 2 === 0, sweet: i % 3 === 0 },
        emotions: ['happy', 'satisfied', 'excited'][i % 3] ? [['happy', 'satisfied', 'excited'][i % 3]] : [],
        mood_before: 'hungry',
        mood_after: 'satisfied',
        satisfaction_level: 4 + (i % 2),
        mouthfeel: { creamy: i % 2 === 0, crunchy: i % 3 === 0 },
        aroma_notes: ['savory', 'aromatic'],
        temperature_rating: 4,
        portion_size: 'just_right' as any,
        dining_companions: i % 4,
        special_occasion: i % 5 === 0 ? 'birthday' : null,
        weather: 'sunny',
        photos: [`https://images.unsplash.com/photo-${1565299624946 + i}?w=300&h=200&fit=crop`],
        videos: [],
        is_private: false,
        shared_with_friends: true,
        search_vector: null,
        restaurant: {
          id: `restaurant-${i % 10}`,
          name: ['Tony\'s Pizzeria', 'Ramen House', 'Taco Bell', 'Italian Bistro', 'Thai Garden'][i % 5],
          cuisine_types: [['Italian'], ['Japanese'], ['Mexican'], ['Italian'], ['Thai']][i % 5]
        },
        taste_experience: {
          saltiness: 3 + (i % 3),
          sweetness: 2 + (i % 3),
          sourness: 1 + (i % 3),
          bitterness: 2 + (i % 2),
          umami: 4 + (i % 2)
        }
      }));

      setReviews(mockReviews);
      setFilteredReviews(mockReviews);
      setLoading(false);
    };

    loadMockData();
  }, [user]);

  // Filter and search reviews
  useEffect(() => {
    let filtered = reviews.filter(review => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          review.dish_name.toLowerCase().includes(searchLower) ||
          review.restaurant?.name.toLowerCase().includes(searchLower) ||
          review.custom_notes?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date filter
      const now = new Date();
      const reviewDate = new Date(review.experienced_at);
      if (filters.dateRange !== 'all') {
        const daysAgo = {
          week: 7,
          month: 30,
          year: 365
        }[filters.dateRange];
        
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        if (reviewDate < cutoffDate) return false;
      }

      // Rating filter
      if (filters.rating !== 'all') {
        const minRating = {
          '5': 5,
          '4+': 4,
          '3+': 3
        }[filters.rating];
        if ((review.overall_rating || 0) < minRating) return false;
      }

      // Cuisine filter
      if (filters.cuisine !== 'all') {
        const hasCuisine = review.restaurant?.cuisine_types.includes(filters.cuisine);
        if (!hasCuisine) return false;
      }

      return true;
    });

    // Sort reviews
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.experienced_at).getTime() - new Date(b.experienced_at).getTime();
          break;
        case 'rating':
          comparison = (a.overall_rating || 0) - (b.overall_rating || 0);
          break;
        case 'restaurant':
          comparison = (a.restaurant?.name || '').localeCompare(b.restaurant?.name || '');
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, filters]);

  const exportReviews = async (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const csvData = filteredReviews.map(review => ({
        Date: new Date(review.experienced_at).toLocaleDateString(),
        Dish: review.dish_name,
        Restaurant: review.restaurant?.name || '',
        Rating: review.overall_rating,
        Price: `$${review.amount_spent}`,
        Notes: review.custom_notes || ''
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'food-reviews.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: <Heart className="w-4 h-4" /> },
              { key: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
              { key: 'statistics', label: 'Statistics', icon: <BarChart3 className="w-4 h-4" /> },
              { key: 'palate', label: 'Palate Profile', icon: <Target className="w-4 h-4" /> },
              { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            userProfile={userProfile!} 
            userStats={userStats!} 
            setUserProfile={setUserProfile}
          />
        )}
        {activeTab === 'reviews' && (
          <ReviewsTab 
            reviews={filteredReviews}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            exportReviews={exportReviews}
          />
        )}
        {activeTab === 'statistics' && (
          <StatisticsTab userStats={userStats!} />
        )}
        {activeTab === 'palate' && (
          <PalateProfileTab 
            tasteProfile={tasteProfile!} 
            setTasteProfile={setTasteProfile}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab 
            userProfile={userProfile!} 
            setUserProfile={setUserProfile}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  userProfile: UserProfile;
  userStats: UserStats;
  setUserProfile: (profile: UserProfile) => void;
}> = ({ userProfile, userStats, setUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: userProfile.display_name || '',
    bio: userProfile.bio || '',
    location: userProfile.location || ''
  });

  const handleSave = () => {
    setUserProfile({
      ...userProfile,
      ...editForm,
      updated_at: new Date().toISOString()
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <ImageUpload
            currentImage={userProfile.avatar_url || undefined}
            onImageChange={(url) => setUserProfile({...userProfile, avatar_url: url})}
            size="lg"
          />
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                  className="text-2xl font-bold border-b-2 border-orange-200 focus:border-orange-500 outline-none bg-transparent"
                  placeholder="Display name"
                />
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="text-gray-600 border-b border-gray-200 focus:border-orange-500 outline-none bg-transparent"
                  placeholder="Location"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="text-gray-600 border border-gray-200 rounded-lg p-2 w-full focus:border-orange-500 outline-none resize-none"
                  placeholder="Bio"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">{userProfile.display_name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {userProfile.username && (
                  <p className="text-gray-500">@{userProfile.username}</p>
                )}
                {userProfile.location && (
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userProfile.location}
                  </p>
                )}
                {userProfile.bio && (
                  <p className="text-gray-600 mt-2">{userProfile.bio}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Joined {new Date(userProfile.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">{userStats.totalReviews}</div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-500 mr-1" />
            <span className="text-2xl font-bold text-orange-600">{userStats.averageRating}</span>
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">{userStats.totalRestaurants}</div>
          <div className="text-sm text-gray-600">Restaurants</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">{userStats.totalPhotos}</div>
          <div className="text-sm text-gray-600">Photos</div>
        </div>
      </div>

      {/* Recent Achievement */}
      {userStats.achievements.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8" />
            <div>
              <h3 className="font-semibold">Latest Achievement</h3>
              <p className="text-orange-100">{userStats.achievements[userStats.achievements.length - 1].title}</p>
              <p className="text-sm text-orange-200">{userStats.achievements[userStats.achievements.length - 1].description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Favorite Cuisines */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ChefHat className="w-5 h-5 mr-2" />
          Favorite Cuisines
        </h2>
        <div className="space-y-3">
          {userStats.favoriteCuisines.slice(0, 5).map((cuisine, index) => (
            <div key={cuisine.cuisine} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <span className="font-medium">{cuisine.cuisine}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${cuisine.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{cuisine.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Dietary Preferences</h2>
        <div className="flex flex-wrap gap-2">
          {userProfile.dietary_restrictions.map((restriction) => (
            <span
              key={restriction}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {restriction}
            </span>
          ))}
          {userProfile.allergies.map((allergy) => (
            <span
              key={allergy}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
            >
              ⚠️ {allergy}
            </span>
          ))}
          {userProfile.dietary_restrictions.length === 0 && userProfile.allergies.length === 0 && (
            <span className="text-gray-500 text-sm">No dietary restrictions</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileTabs;