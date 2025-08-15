'use client'

import { useState } from 'react'
import { Camera, MapPin, Calendar, DollarSign, Star, Save, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface FoodExperienceFormProps {
  onClose: () => void
  onSave: (data: Record<string, unknown>) => void
  prefillData?: Record<string, unknown>
}

export default function FoodExperienceForm({ onClose, onSave, prefillData }: FoodExperienceFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    foodName: (prefillData?.name as string) || '',
    restaurantName: ((prefillData?.restaurant as any)?.name as string) || (prefillData?.location as string) || '',
    location: ((prefillData?.restaurant as any)?.address as string) || ((prefillData?.restaurant as any)?.name as string) || '',
    cuisineType: (prefillData?.cuisineType as string) || '',
    foodType: '',
    mealTime: 'lunch',
    diningMethod: 'dine-in',
    dateEaten: new Date().toISOString().split('T')[0],
    cost: '',
    experienceText: '',
    
    // Taste ratings (0-10)
    sweet: 5,
    savory: 5,
    sour: 3,
    spicy: 3,
    umami: 5,
    bitter: 2,
    
    // Experience rating
    experienceRating: 'frequently',
    
    // Privacy
    privacyLevel: 'friends',
    
    // Image placeholder
    images: []
  })

  const mealTimes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'brunch', label: 'Brunch' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'snack', label: 'Snack' }
  ]

  const diningMethods = [
    { value: 'homemade', label: 'Homemade' },
    { value: 'dine-in', label: 'Dine-in' },
    { value: 'takeout', label: 'Takeout' },
    { value: 'delivery', label: 'Delivery' }
  ]

  const experienceRatings = [
    { value: 'never-again', label: 'Never Again 😤', color: 'text-red-600' },
    { value: 'occasionally', label: 'Occasionally 😐', color: 'text-yellow-600' },
    { value: 'frequently', label: 'Frequently 😊', color: 'text-blue-600' },
    { value: 'kuchisabishii', label: 'Kuchisabishii! 🤤', color: 'text-purple-600' }
  ]

  const tasteRatings = [
    { key: 'sweet', label: 'Sweet', color: 'bg-pink-100 text-pink-700' },
    { key: 'savory', label: 'Savory', color: 'bg-orange-100 text-orange-700' },
    { key: 'sour', label: 'Sour', color: 'bg-yellow-100 text-yellow-700' },
    { key: 'spicy', label: 'Spicy', color: 'bg-red-100 text-red-700' },
    { key: 'umami', label: 'Umami', color: 'bg-green-100 text-green-700' },
    { key: 'bitter', label: 'Bitter', color: 'bg-gray-100 text-gray-700' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        onSave(data.experience)
        onClose()
      } else {
        setError(data.error || 'Failed to save food experience')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Log Food Experience</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Name *
                </label>
                <input
                  type="text"
                  value={formData.foodName}
                  onChange={(e) => handleInputChange('foodName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Margherita Pizza"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant/Location
                </label>
                <input
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Joe's Pizza"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={formData.cuisineType}
                  onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Italian, Japanese"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Type
                </label>
                <input
                  type="text"
                  value={formData.foodType}
                  onChange={(e) => handleInputChange('foodType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Main Course, Appetizer"
                />
              </div>
            </div>
          </div>

          {/* Meal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Meal Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Time
                </label>
                <select
                  value={formData.mealTime}
                  onChange={(e) => handleInputChange('mealTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {mealTimes.map(time => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dining Method
                </label>
                <select
                  value={formData.diningMethod}
                  onChange={(e) => handleInputChange('diningMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {diningMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Eaten
                </label>
                <input
                  type="date"
                  value={formData.dateEaten}
                  onChange={(e) => handleInputChange('dateEaten', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., 15.99"
              />
            </div>
          </div>

          {/* Taste Profile */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Taste Profile</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tasteRatings.map(taste => (
                <div key={taste.key}>
                  <label className={`block text-sm font-medium mb-2 px-2 py-1 rounded-full text-center ${taste.color}`}>
                    {taste.label}: {(formData as any)[taste.key]}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={(formData as any)[taste.key]}
                    onChange={(e) => handleInputChange(taste.key, parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Experience Rating */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Overall Experience</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {experienceRatings.map(rating => (
                <button
                  key={rating.value}
                  type="button"
                  onClick={() => handleInputChange('experienceRating', rating.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.experienceRating === rating.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-sm font-medium ${rating.color}`}>
                    {rating.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Experience Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes & Experience
            </label>
            <textarea
              value={formData.experienceText}
              onChange={(e) => handleInputChange('experienceText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={4}
              placeholder="Describe your experience, flavors, texture, what you liked or didn't like..."
            />
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Level
            </label>
            <select
              value={formData.privacyLevel}
              onChange={(e) => handleInputChange('privacyLevel', e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="private">Private (Only me)</option>
              <option value="friends">Friends</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.foodName}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Experience</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}