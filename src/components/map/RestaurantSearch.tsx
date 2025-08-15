'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Clock, DollarSign } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  priceLevel?: number
  openNow?: boolean
  cuisine?: string
  photos?: string[]
  phoneNumber?: string
}

interface RestaurantSearchProps {
  onRestaurantSelect?: (restaurant: Restaurant) => void
  center?: { lat: number; lng: number }
  radius?: number
  className?: string
}

export default function RestaurantSearch({ 
  onRestaurantSelect,
  center = { lat: 37.7749, lng: -122.4194 },
  radius = 5000,
  className = ""
}: RestaurantSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchNearbyRestaurants = async (query: string = '') => {
    if (!(window as any).google?.maps) {
      setError('Google Maps not loaded')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = new (window as any).google.maps.places.PlacesService(
        document.createElement('div')
      )

      const request: any = {
        query: query || 'restaurants',
        location: new (window as any).google.maps.LatLng(center.lat, center.lng),
        radius,
        type: 'restaurant'
      }

      service.textSearch(request, (results: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
          const formattedResults: Restaurant[] = results.slice(0, 20).map((place: any) => ({
            id: place.place_id || '',
            name: place.name || '',
            address: place.formatted_address || '',
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            rating: place.rating,
            priceLevel: place.price_level,
            openNow: place.opening_hours?.open_now,
            cuisine: place.types?.[0]?.replace('_', ' '),
            photos: place.photos?.slice(0, 3).map((photo: any) => 
              photo.getUrl({ maxWidth: 400, maxHeight: 300 })
            )
          }))
          
          setRestaurants(formattedResults)
        } else {
          setError('No restaurants found')
          setRestaurants([])
        }
        setIsLoading(false)
      })
    } catch (error) {
      console.error('Restaurant search error:', error)
      setError('Failed to search restaurants')
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchNearbyRestaurants(searchQuery)
  }

  // Load nearby restaurants on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchNearbyRestaurants()
    }, 1000) // Wait for Google Maps to load

    return () => clearTimeout(timer)
  }, [center.lat, center.lng])

  const getPriceDisplay = (priceLevel?: number) => {
    if (!priceLevel) return ''
    return '$'.repeat(priceLevel)
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for restaurants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {error && (
          <div className="p-4 text-center text-red-600">
            <p>{error}</p>
          </div>
        )}

        {isLoading && restaurants.length === 0 && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Searching restaurants...</p>
          </div>
        )}

        {restaurants.length === 0 && !isLoading && !error && (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No restaurants found</p>
            <p className="text-sm">Try adjusting your search or location</p>
          </div>
        )}

        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => onRestaurantSelect?.(restaurant)}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start space-x-3">
              {/* Restaurant Photo */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {restaurant.photos?.[0] ? (
                  <img
                    src={restaurant.photos[0]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    🍽️
                  </div>
                )}
              </div>

              {/* Restaurant Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">
                  {restaurant.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {restaurant.address}
                </p>

                <div className="flex items-center space-x-4 text-sm">
                  {restaurant.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-700">{restaurant.rating}</span>
                    </div>
                  )}

                  {restaurant.priceLevel && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{getPriceDisplay(restaurant.priceLevel)}</span>
                    </div>
                  )}

                  {restaurant.openNow !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className={`text-sm ${restaurant.openNow ? 'text-green-600' : 'text-red-600'}`}>
                        {restaurant.openNow ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}