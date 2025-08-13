'use client';

import React from 'react';
import { 
  Search, Filter, SortAsc, Download, Star, MapPin, 
  Calendar, DollarSign, Camera, Eye, Share2, 
  Clock, Users, Utensils, Thermometer
} from 'lucide-react';

interface ReviewWithDetails {
  id: string;
  dish_name: string;
  custom_notes: string | null;
  experienced_at: string;
  amount_spent: number | null;
  overall_rating: number | null;
  photos: string[];
  meal_time: string | null;
  dining_method: string | null;
  dining_companions: number;
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

interface ReviewsTabProps {
  reviews: ReviewWithDetails[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  exportReviews: (format: 'csv' | 'pdf') => void;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviews,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  exportReviews
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const cuisineTypes = Array.from(
    new Set(
      reviews
        .flatMap(review => review.restaurant?.cuisine_types || [])
        .filter(Boolean)
    )
  ).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMealTime = (mealTime: string | null) => {
    if (!mealTime) return '';
    return mealTime.charAt(0).toUpperCase() + mealTime.slice(1);
  };

  const formatDiningMethod = (method: string | null) => {
    if (!method) return '';
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  const renderTasteProfile = (taste: any) => {
    if (!taste) return null;
    
    const tasteMap = {
      saltiness: { label: 'Salty', color: 'bg-blue-500' },
      sweetness: { label: 'Sweet', color: 'bg-pink-500' },
      sourness: { label: 'Sour', color: 'bg-yellow-500' },
      bitterness: { label: 'Bitter', color: 'bg-green-500' },
      umami: { label: 'Umami', color: 'bg-purple-500' }
    };

    return (
      <div className="flex space-x-2 mt-2">
        {Object.entries(tasteMap).map(([key, { label, color }]) => {
          const value = taste[key];
          if (!value || value === 0) return null;
          
          return (
            <div key={key} className="text-xs">
              <div className={`w-2 h-2 ${color} rounded-full inline-block mr-1`}></div>
              <span className="text-gray-600">{label}: {value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search dishes, restaurants, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-orange-500 text-white border-orange-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Export */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportReviews('csv')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                CSV
              </button>
              <button
                onClick={() => exportReviews('pdf')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars Only</option>
                  <option value="4+">4+ Stars</option>
                  <option value="3+">3+ Stars</option>
                </select>
              </div>

              {/* Cuisine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                <select
                  value={filters.cuisine}
                  onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Cuisines</option>
                  {cuisineTypes.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({...filters, sortOrder: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''} found</span>
        {(searchQuery || filters.dateRange !== 'all' || filters.rating !== 'all' || filters.cuisine !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters({
                dateRange: 'all',
                rating: 'all',
                cuisine: 'all',
                sortBy: 'date',
                sortOrder: 'desc'
              });
            }}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find more reviews.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:space-x-6">
                {/* Photo */}
                {review.photos.length > 0 && (
                  <div className="w-full lg:w-32 h-32 mb-4 lg:mb-0 flex-shrink-0">
                    <img
                      src={review.photos[0]}
                      alt={review.dish_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {review.photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        <Camera className="w-3 h-3 inline mr-1" />
                        +{review.photos.length - 1}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{review.dish_name}</h3>
                      {review.restaurant && (
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{review.restaurant.name}</span>
                          {review.restaurant.cuisine_types.length > 0 && (
                            <span className="text-xs text-gray-500 ml-2">
                              {review.restaurant.cuisine_types.join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 lg:mt-0">
                      {renderStars(review.overall_rating)}
                    </div>
                  </div>

                  {/* Review Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(review.experienced_at)}
                    </div>
                    {review.meal_time && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatMealTime(review.meal_time)}
                      </div>
                    )}
                    {review.dining_method && (
                      <div className="flex items-center">
                        <Utensils className="w-4 h-4 mr-1" />
                        {formatDiningMethod(review.dining_method)}
                      </div>
                    )}
                    {review.amount_spent && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${review.amount_spent}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {review.custom_notes && (
                    <p className="text-gray-700 mb-3 line-clamp-2">{review.custom_notes}</p>
                  )}

                  {/* Taste Profile */}
                  {renderTasteProfile(review.taste_experience)}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {review.dining_companions > 0 && (
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {review.dining_companions + 1} people
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                        <Eye className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                        <Share2 className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button (if needed for pagination) */}
      {reviews.length > 0 && reviews.length % 20 === 0 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;