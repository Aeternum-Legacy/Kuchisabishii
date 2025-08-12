'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Navigation, Search } from 'lucide-react'
import GoogleMap from './GoogleMap'
import RestaurantSearch from './RestaurantSearch'

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
}

interface MapViewProps {
  onBack?: () => void
  onRestaurantSelect?: (restaurant: Restaurant) => void
}

export default function MapView({ onBack, onRestaurantSelect }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [showSearch, setShowSearch] = useState(true)
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }) // Default to SF

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter(location)
        },
        (error) => {
          console.log('Location access denied:', error)
          // Keep default location
        },
        { timeout: 10000, enableHighAccuracy: true }
      )
    }
  }, [])

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setMapCenter({ lat: restaurant.lat, lng: restaurant.lng })
    
    // If parent provided handler, call it
    if (onRestaurantSelect) {
      onRestaurantSelect(restaurant)
    }
  }

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter(location)
        },
        (error) => {
          alert('Unable to access location. Please enable location services.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <h1 className="text-lg font-semibold text-gray-800">Find Restaurants</h1>
        
        <button
          onClick={handleUseLocation}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
        >
          <Navigation className="w-4 h-4" />
          <span className="text-sm">My Location</span>
        </button>
      </div>

      {/* Map and Search Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map */}
        <div className="flex-1 relative">
          <GoogleMap
            center={mapCenter}
            zoom={userLocation ? 15 : 13}
            restaurants={selectedRestaurant ? [selectedRestaurant] : []}
            className="w-full h-full"
          />
          
          {/* Toggle Search Button - Mobile */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="lg:hidden absolute top-4 left-4 bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Panel */}
        <div className={`lg:w-96 ${showSearch ? 'block' : 'hidden lg:block'} absolute lg:relative top-16 lg:top-0 left-4 right-4 lg:left-0 lg:right-0 z-10`}>
          <RestaurantSearch
            center={mapCenter}
            onRestaurantSelect={handleRestaurantSelect}
            className="h-full shadow-lg lg:shadow-none"
          />
        </div>
      </div>

      {/* Selected Restaurant Info */}
      {selectedRestaurant && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
              {selectedRestaurant.photos?.[0] ? (
                <img
                  src={selectedRestaurant.photos[0]}
                  alt={selectedRestaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  🍽️
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {selectedRestaurant.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {selectedRestaurant.address}
              </p>
              {selectedRestaurant.rating && (
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-700">{selectedRestaurant.rating}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => onRestaurantSelect?.(selectedRestaurant)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Select
            </button>
          </div>
        </div>
      )}
    </div>
  )
}