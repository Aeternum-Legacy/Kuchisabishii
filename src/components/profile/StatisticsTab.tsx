'use client';

import React from 'react';
import { 
  TrendingUp, Award, Target, BarChart3, PieChart, 
  Calendar, Star, Camera, MapPin, ChefHat, 
  Clock, Utensils, Trophy, Medal, Crown,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

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

interface StatisticsTabProps {
  userStats: UserStats;
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({ userStats }) => {
  const currentMonth = userStats.monthlyTrends[userStats.monthlyTrends.length - 1];
  const previousMonth = userStats.monthlyTrends[userStats.monthlyTrends.length - 2];
  
  const reviewsTrend = currentMonth && previousMonth 
    ? currentMonth.reviews - previousMonth.reviews 
    : 0;
  
  const ratingTrend = currentMonth && previousMonth 
    ? currentMonth.rating - previousMonth.rating 
    : 0;

  const renderTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const renderTrendText = (trend: number, suffix: string = '') => {
    const absValue = Math.abs(trend);
    const color = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
    const sign = trend > 0 ? '+' : '';
    
    return (
      <span className={`text-sm ${color} flex items-center`}>
        {renderTrendIcon(trend)}
        <span className="ml-1">{sign}{absValue.toFixed(1)}{suffix}</span>
      </span>
    );
  };

  const maxReviews = Math.max(...userStats.monthlyTrends.map(m => m.reviews));
  const maxRating = 5; // Rating is always out of 5

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            {renderTrendText(reviewsTrend)}
          </div>
          <div className="text-2xl font-bold text-gray-900">{userStats.totalReviews}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            {renderTrendText(ratingTrend)}
          </div>
          <div className="text-2xl font-bold text-gray-900">{userStats.averageRating}</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{userStats.totalRestaurants}</div>
          <div className="text-sm text-gray-600">Restaurants Visited</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{userStats.totalPhotos}</div>
          <div className="text-sm text-gray-600">Photos Uploaded</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Review Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Monthly Review Activity
          </h3>
          <div className="space-y-4">
            {userStats.monthlyTrends.map((month, index) => (
              <div key={month.month} className="flex items-center space-x-4">
                <div className="w-12 text-sm text-gray-600 font-medium">{month.month}</div>
                
                {/* Reviews Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Reviews</span>
                    <span className="text-xs font-medium">{month.reviews}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(month.reviews / maxReviews) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rating Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Rating</span>
                    <span className="text-xs font-medium">{month.rating}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(month.rating / maxRating) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuisine Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Favorite Cuisines
          </h3>
          <div className="space-y-4">
            {userStats.favoriteCuisines.slice(0, 6).map((cuisine, index) => {
              const colors = [
                'bg-red-500',
                'bg-blue-500', 
                'bg-green-500',
                'bg-yellow-500',
                'bg-purple-500',
                'bg-pink-500'
              ];
              
              return (
                <div key={cuisine.cuisine} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{cuisine.cuisine}</span>
                      <span className="text-xs text-gray-500">{cuisine.count} reviews</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                        style={{ width: `${cuisine.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {cuisine.percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Taste Evolution */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Taste Profile Evolution
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Adventurousness */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Culinary Adventurousness</h4>
            <div className="space-y-3">
              {userStats.tasteEvolution.map((data, index) => (
                <div key={data.month} className="flex items-center space-x-3">
                  <div className="w-8 text-xs text-gray-600">{data.month}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.adventurousness / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 w-8 text-right">
                    {data.adventurousness.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consistency */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Rating Consistency</h4>
            <div className="space-y-3">
              {userStats.tasteEvolution.map((data, index) => (
                <div key={data.month} className="flex items-center space-x-3">
                  <div className="w-8 text-xs text-gray-600">{data.month}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.consistency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 w-8 text-right">
                    {data.consistency.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Achievements ({userStats.achievements.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userStats.achievements.map((achievement, index) => {
            const icons = [Trophy, Medal, Crown, Star, Award];
            const IconComponent = icons[index % icons.length];
            const colors = [
              'from-yellow-400 to-yellow-600',
              'from-gray-400 to-gray-600',
              'from-yellow-600 to-yellow-800',
              'from-purple-400 to-purple-600',
              'from-blue-400 to-blue-600'
            ];

            return (
              <div key={achievement.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-3 rounded-full bg-gradient-to-br ${colors[index % colors.length]} text-white flex-shrink-0`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-sm p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{userStats.favoriteCuisines[0]?.cuisine || 'N/A'}</div>
            <div className="text-orange-100 text-sm">Most Reviewed Cuisine</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {userStats.monthlyTrends[userStats.monthlyTrends.length - 1]?.reviews || 0}
            </div>
            <div className="text-orange-100 text-sm">Reviews This Month</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {((userStats.totalPhotos / userStats.totalReviews) || 0).toFixed(1)}
            </div>
            <div className="text-orange-100 text-sm">Photos Per Review</div>
          </div>
        </div>
      </div>

      {/* Progress Goals */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Progress Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reviews Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Reviews Goal (200)</span>
              <span className="text-sm text-gray-600">{userStats.totalReviews}/200</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((userStats.totalReviews / 200) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {200 - userStats.totalReviews > 0 
                ? `${200 - userStats.totalReviews} reviews to go!` 
                : 'Goal achieved! 🎉'
              }
            </div>
          </div>

          {/* Restaurants Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Restaurants Goal (100)</span>
              <span className="text-sm text-gray-600">{userStats.totalRestaurants}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((userStats.totalRestaurants / 100) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {100 - userStats.totalRestaurants > 0 
                ? `${100 - userStats.totalRestaurants} restaurants to go!` 
                : 'Goal achieved! 🎉'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;