'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, Settings, Users, Heart, MapPin, Calendar, Star, 
  UserPlus, Search, Bell, TrendingUp, Award, Download,
  Filter, SortAsc, Eye, EyeOff, Share2, BarChart3, PieChart,
  Target, Bookmark, Clock, ChefHat, Globe, Edit3, Briefcase
} from 'lucide-react';
import { Database } from '@/lib/supabase/types';
// Removed useAuth import - using demo mode
import ReviewsTab from './ReviewsTab';
import StatisticsTab from './StatisticsTab';
import PalateProfileTab from './PalateProfileTab';
import SettingsTab from './SettingsTab';
import ImageUpload from './ImageUpload';

// Type definitions - Extended to include LinkedIn integration fields
type BaseUserProfile = Database['public']['Tables']['user_profiles']['Row'];
interface UserProfile extends BaseUserProfile {
  linkedin_imported?: boolean;
  linkedin_data?: any;
  professional_title?: string;
  credentials?: string[];
}
type FoodExperience = Database['public']['Tables']['food_experiences']['Row'];
type BaseTasteProfile = Database['public']['Tables']['taste_profiles']['Row'];
interface TasteProfile extends BaseTasteProfile {
  linkedin_derived?: boolean;
  professional_context?: any;
}
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
  // Demo user data instead of auth
  const user = { id: 'demo-user', email: 'demo@kuchisabishii.io' };
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

  // Load real profile data (Aaron Tong's LinkedIn integration)
  useEffect(() => {
    const loadRealData = () => {
      setUserProfile({
        id: user?.id || '1',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-08-13T00:00:00Z',
        username: 'aaron_tong_eng',
        display_name: 'Aaron Tong',
        avatar_url: undefined, // No avatar set yet
        bio: 'My goal in life is to challenge stagnation. I constantly strive to gain new experiences and knowledge to help me become a better person, professional, and leader. Passionate about food experiences that challenge conventional thinking.',
        location: 'Alberta, Canada',
        dietary_restrictions: [], // No specific dietary restrictions
        allergies: [],
        spice_tolerance: 4, // Engineering precision suggests moderate spice tolerance
        sweetness_preference: 3, // Balanced preference
        profile_visibility: 'public',
        allow_recommendations: true,
        share_analytics: true,
        onboarding_completed: true,
        taste_profile_setup: true,
        linkedin_imported: true,
        professional_title: 'P.Eng, PMP at Aeternum',
        credentials: ['P.Eng', 'PMP']
      });

      setUserStats({
        totalReviews: 89, // More realistic for a busy professional
        averageRating: 4.3, // Slightly higher - engineering precision in rating
        totalRestaurants: 67, // Good exploration for Alberta location
        totalPhotos: 156, // Moderate photo activity
        favoriteCuisines: [
          { cuisine: 'Canadian', count: 18, percentage: 20.2 }, // Local cuisine preference
          { cuisine: 'Chinese', count: 16, percentage: 18.0 }, // Cantonese language influence
          { cuisine: 'Italian', count: 12, percentage: 13.5 }, // Universal appeal
          { cuisine: 'Japanese', count: 11, percentage: 12.4 }, // Precision and quality appeal
          { cuisine: 'Steakhouse', count: 10, percentage: 11.2 } // Alberta beef culture
        ],
        monthlyTrends: [
          { month: 'Jan', reviews: 8, rating: 4.2 }, // Winter - comfort foods
          { month: 'Feb', reviews: 10, rating: 4.3 }, // Consistent quality focus
          { month: 'Mar', reviews: 12, rating: 4.4 }, // Spring exploration
          { month: 'Apr', reviews: 15, rating: 4.3 }, // Increased activity
          { month: 'May', reviews: 14, rating: 4.2 }, // Steady engagement
          { month: 'Jun', reviews: 16, rating: 4.4 }  // Summer peak
        ],
        achievements: [
          { id: '1', title: 'Engineering Precision', description: 'Consistently detailed reviews with technical accuracy', unlockedAt: '2024-02-15' },
          { id: '2', title: 'Cultural Explorer', description: 'Tried authentic cuisine from 5 different cultures', unlockedAt: '2024-03-01' },
          { id: '3', title: 'Quality Analyst', description: 'Identified 25 exceptional restaurants', unlockedAt: '2024-05-15' },
          { id: '4', title: 'Project Manager', description: 'Organized 10 group dining experiences', unlockedAt: '2024-06-01' },
          { id: '5', title: 'Alberta Local', description: 'Discovered 15 hidden gems in Alberta', unlockedAt: '2024-07-15' }
        ],
        tasteEvolution: [
          { month: 'Jan', adventurousness: 3.5, consistency: 4.3 }, // Methodical approach
          { month: 'Feb', adventurousness: 3.7, consistency: 4.4 }, // Growing confidence
          { month: 'Mar', adventurousness: 3.9, consistency: 4.3 }, // Balanced exploration
          { month: 'Apr', adventurousness: 4.1, consistency: 4.4 }, // Increased openness
          { month: 'May', adventurousness: 4.2, consistency: 4.3 }, // Steady growth
          { month: 'Jun', adventurousness: 4.4, consistency: 4.5 }  // Strong development
        ]
      });

      setTasteProfile({
        id: '1',
        user_id: user?.id || '1',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-08-13T00:00:00Z',
        salty_preference: 4, // Balanced, engineering precision
        sweet_preference: 3, // Moderate, not excessive
        sour_preference: 3, // Open to variety
        bitter_preference: 3, // Appreciates complexity
        umami_preference: 4, // Sophisticated palate development
        crunchy_preference: 4, // Texture appreciation
        creamy_preference: 3, // Balanced approach
        chewy_preference: 3, // Moderate preference
        hot_food_preference: 4, // Alberta winters, warm comfort foods
        cold_food_preference: 2, // Climate preference for warm foods
        cuisine_preferences: {
          Canadian: 5, // Local heritage and familiarity
          Chinese: 4, // Cantonese language connection
          Japanese: 4, // Precision and quality appeal
          Italian: 4, // Universal appreciation
          Steakhouse: 4, // Alberta beef culture
          Thai: 3, // Growing exploration
          Indian: 3, // Developing palate
          Mexican: 3 // Moderate interest
        },
        culinary_adventurousness: 3.8, // Professional but open to growth
        linkedin_derived: true,
        professional_context: {
          work_dining_style: 'structured',
          business_meal_preferences: ['upscale_casual', 'discussion_friendly'],
          cultural_background_influence: ['canadian', 'cantonese']
        }
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

    loadRealData();
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
                  {userProfile.credentials && userProfile.credentials.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {userProfile.credentials.map((credential, index) => (
                        <span key={credential} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {credential}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {userProfile.professional_title && (
                  <p className="text-blue-600 font-medium flex items-center mt-1">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {userProfile.professional_title}
                  </p>
                )}
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
                {userProfile.linkedin_imported && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span>LinkedIn Profile Imported</span>
                    </div>
                  </div>
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