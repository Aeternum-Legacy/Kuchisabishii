'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface GoogleMapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  restaurants?: Array<{
    id: string
    name: string
    address: string
    lat: number
    lng: number
    rating?: number
  }>
  className?: string
}

export default function GoogleMap({ 
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 13,
  onLocationSelect,
  restaurants = [],
  className = "w-full h-96"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        setError('Google Maps API key not configured')
        return
      }

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        })

        await loader.load()
        
        if (!mapRef.current) return

        const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }]
            }
          ]
        })

        setMap(mapInstance)
        setIsLoaded(true)

        // Add click listener if onLocationSelect is provided
        if (onLocationSelect) {
          mapInstance.addListener('click', async (event: any) => {
            if (event.latLng) {
              const lat = event.latLng.lat()
              const lng = event.latLng.lng()
              
              // Reverse geocode to get address
              const geocoder = new (window as any).google.maps.Geocoder()
              try {
                const response = await geocoder.geocode({ location: { lat, lng } })
                const address = response.results[0]?.formatted_address || `${lat}, ${lng}`
                onLocationSelect({ lat, lng, address })
              } catch (error) {
                console.error('Geocoding error:', error)
                onLocationSelect({ lat, lng, address: `${lat}, ${lng}` })
              }
            }
          })
        }

      } catch (error) {
        console.error('Error loading Google Maps:', error)
        setError('Failed to load Google Maps')
      }
    }

    initMap()
  }, [center.lat, center.lng, zoom, onLocationSelect])

  // Add restaurant markers when map is loaded
  useEffect(() => {
    if (!map || !isLoaded) return

    // Clear existing markers (you might want to store these in state for cleanup)
    restaurants.forEach(restaurant => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: restaurant.lat, lng: restaurant.lng },
        map,
        title: restaurant.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#f97316" stroke="white" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🍜</text>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(32, 32)
        }
      })

      // Add info window
      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-gray-800">${restaurant.name}</h3>
            <p class="text-sm text-gray-600">${restaurant.address}</p>
            ${restaurant.rating ? `<p class="text-sm text-yellow-600">⭐ ${restaurant.rating}</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })
    })
  }, [map, isLoaded, restaurants])

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center p-4">
          <div className="text-red-600 text-4xl mb-2">🗺️</div>
          <p className="text-red-800 font-medium">Map Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}