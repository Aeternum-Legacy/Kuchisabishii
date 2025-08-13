'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, MapPin, UserPlus, UserCheck, Clock, X, ChefHat, Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface User {
  id: string
  displayName: string
  firstName: string
  lastName: string
  profileImage?: string
  email: string
  location?: string
  dietaryPreferences?: string[]
  tasteProfile?: {
    spiceLevel: number
    sweetness: number
    sourness: number
  }
  mutualFriends?: number
  friendshipStatus: 'none' | 'pending' | 'accepted'
  joinedDate?: string
  similarityScore?: number
}

interface UserSearchProps {
  onUserSelect?: (user: User) => void
  showFilters?: boolean
  limit?: number
}

interface SearchFilters {
  location: string
  dietaryPreferences: string[]
  spiceLevel: [number, number]
  sortBy: 'relevance' | 'similarity' | 'recent' | 'mutual'
}

export default function UserSearch({ onUserSelect, showFilters = true, limit = 20 }: UserSearchProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    dietaryPreferences: [],
    spiceLevel: [0, 10],
    sortBy: 'relevance'
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Available dietary preferences
  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
    'Halal', 'Kosher', 'Keto', 'Paleo', 'Low-Carb'
  ]

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-user-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, filters])

  const performSearch = async () => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams({
        q: searchQuery,
        limit: limit.toString(),
        ...filters,
        dietaryPreferences: JSON.stringify(filters.dietaryPreferences),
        spiceLevel: JSON.stringify(filters.spiceLevel)
      })

      const response = await fetch(`/api/users/search?${searchParams}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
        
        // Save to recent searches
        if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
          const newRecent = [searchQuery.trim(), ...recentSearches.slice(0, 4)]
          setRecentSearches(newRecent)
          localStorage.setItem('recent-user-searches', JSON.stringify(newRecent))
        }
      }
    } catch (error) {
      console.error('Failed to search users:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUserId: userId })
      })
      
      if (response.ok) {
        setSearchResults(prev => prev.map(u => 
          u.id === userId ? { ...u, friendshipStatus: 'pending' } : u
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Failed to send friend request:', error)
      alert('Failed to send friend request')
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recent-user-searches')
  }

  const filteredAndSortedResults = useMemo(() => {
    if (!searchResults.length) return []

    let results = [...searchResults]

    // Apply sorting
    switch (filters.sortBy) {
      case 'similarity':
        results.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
        break
      case 'mutual':
        results.sort((a, b) => (b.mutualFriends || 0) - (a.mutualFriends || 0))
        break
      case 'recent':
        results.sort((a, b) => new Date(b.joinedDate || 0).getTime() - new Date(a.joinedDate || 0).getTime())
        break
      default: // relevance
        break
    }

    return results
  }, [searchResults, filters.sortBy])

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or taste preferences..."
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                showFilterPanel ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Recent searches</span>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="bg-white text-gray-700 px-2 py-1 rounded-lg text-sm hover:bg-gray-100"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Search Filters</h3>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, state, or country"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dietary Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    const isSelected = filters.dietaryPreferences.includes(option)
                    setFilters(prev => ({
                      ...prev,
                      dietaryPreferences: isSelected
                        ? prev.dietaryPreferences.filter(p => p !== option)
                        : [...prev.dietaryPreferences, option]
                    }))
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.dietaryPreferences.includes(option)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'similarity', label: 'Taste Similarity' },
                { value: 'mutual', label: 'Mutual Friends' },
                { value: 'recent', label: 'Recently Joined' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    filters.sortBy === option.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div>
        {loading && searchQuery.length >= 2 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Searching users...</p>
          </div>
        ) : filteredAndSortedResults.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredAndSortedResults.length} user{filteredAndSortedResults.length !== 1 ? 's' : ''} found
              </p>
              {filters.sortBy !== 'relevance' && (
                <p className="text-xs text-gray-500">Sorted by {filters.sortBy}</p>
              )}
            </div>
            
            {filteredAndSortedResults.map(searchUser => (
              <div 
                key={searchUser.id} 
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {searchUser.profileImage ? (
                          <img 
                            src={searchUser.profileImage} 
                            alt={searchUser.displayName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      {searchUser.similarityScore && searchUser.similarityScore > 70 && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          <Heart className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800 truncate">{searchUser.displayName}</h3>
                        {searchUser.similarityScore && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            {searchUser.similarityScore}% match
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{searchUser.email}</p>
                      
                      {/* Additional Info */}
                      <div className="flex items-center space-x-4 mt-1">
                        {searchUser.location && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{searchUser.location}</span>
                          </div>
                        )}
                        {searchUser.mutualFriends && searchUser.mutualFriends > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <UserCheck className="w-3 h-3" />
                            <span>{searchUser.mutualFriends} mutual friend{searchUser.mutualFriends !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {searchUser.tasteProfile && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ChefHat className="w-3 h-3" />
                            <span>Spice: {searchUser.tasteProfile.spiceLevel}/10</span>
                          </div>
                        )}
                      </div>

                      {/* Dietary Preferences */}
                      {searchUser.dietaryPreferences && searchUser.dietaryPreferences.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {searchUser.dietaryPreferences.slice(0, 3).map(pref => (
                            <span 
                              key={pref}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                            >
                              {pref}
                            </span>
                          ))}
                          {searchUser.dietaryPreferences.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{searchUser.dietaryPreferences.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {searchUser.friendshipStatus === 'none' ? (
                      <button
                        onClick={() => {
                          sendFriendRequest(searchUser.id)
                          onUserSelect?.(searchUser)
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    ) : searchUser.friendshipStatus === 'pending' ? (
                      <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Pending</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <UserCheck className="w-4 h-4" />
                        <span>Friends</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.length >= 2 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No users found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Search for food enthusiasts</p>
            <p className="text-sm">Enter at least 2 characters to start searching</p>
          </div>
        )}
      </div>
    </div>
  )
}