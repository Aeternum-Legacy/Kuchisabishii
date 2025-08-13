'use client'

/**
 * Eat Again Modal Component
 * Quick re-order functionality with similar dish suggestions and experience tracking
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Repeat, ThumbsUp, Clock, MapPin, Star, 
  TrendingUp, Zap, Heart, ChefHat, DollarSign,
  Navigation, Calendar, Users
} from 'lucide-react'

interface FoodExperience {
  id: string
  food_name: string
  restaurant_name: string
  restaurant_address: string
  image_url?: string
  rating: number
  emotional_rating: number
  price: number
  last_enjoyed: string
  times_ordered: number
  cuisine_type: string
  tags: string[]
  notes?: string
  palate_profile: Record<string, number>
}

interface SimilarDish {
  id: string
  name: string
  restaurant: string
  similarity_score: number
  match_reasons: string[]
  price: number
  image_url?: string
  distance_km?: number
  estimated_delivery?: number
}

interface EatAgainModalProps {
  isOpen: boolean
  onClose: () => void
  experience: FoodExperience
  onReorder: (experienceId: string, orderType: 'same' | 'delivery' | 'pickup') => void
  onTrySimilar: (dishId: string) => void
}

export default function EatAgainModal({
  isOpen,
  onClose,
  experience,
  onReorder,
  onTrySimilar
}: EatAgainModalProps) {
  const [similarDishes, setSimilarDishes] = useState<SimilarDish[]>([])
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'reorder' | 'similar' | 'compare'>('reorder')
  const [ratingImprovement, setRatingImprovement] = useState<number | null>(null)
  const [showRatingUpdate, setShowRatingUpdate] = useState(false)

  useEffect(() => {
    if (isOpen && selectedTab === 'similar') {
      loadSimilarDishes()
    }
  }, [isOpen, selectedTab])

  const loadSimilarDishes = async () => {
    try {
      setIsLoadingSimilar(true)
      
      // Mock similar dishes - in real app, this would call the recommendation API
      const mockSimilar: SimilarDish[] = [
        {
          id: '1',
          name: 'Spicy Tuna Roll',
          restaurant: 'Sushi Palace',
          similarity_score: 94,
          match_reasons: ['Similar spice level', 'Raw fish', 'Rice base'],
          price: 12.99,
          distance_km: 0.8,
          estimated_delivery: 25
        },
        {
          id: '2', 
          name: 'Salmon Poke Bowl',
          restaurant: 'Fresh Bowl Co.',
          similarity_score: 87,
          match_reasons: ['Raw fish', 'Fresh ingredients', 'Healthy option'],
          price: 15.50,
          distance_km: 1.2,
          estimated_delivery: 30
        },
        {
          id: '3',
          name: 'Chirashi Bowl', 
          restaurant: 'Tokyo Kitchen',
          similarity_score: 82,
          match_reasons: ['Sashimi grade fish', 'Rice bowl', 'Japanese cuisine'],
          price: 18.99,
          distance_km: 2.1,
          estimated_delivery: 35
        }
      ]
      
      setSimilarDishes(mockSimilar)
    } catch (error) {
      console.error('Failed to load similar dishes:', error)
    } finally {
      setIsLoadingSimilar(false)
    }
  }

  const handleReorderClick = (orderType: 'same' | 'delivery' | 'pickup') => {
    onReorder(experience.id, orderType)
    setShowRatingUpdate(true)
  }

  const handleRatingUpdate = async (newRating: number) => {
    try {
      // Update the experience rating
      await fetch(`/api/experiences/${experience.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rating: newRating,
          times_ordered: experience.times_ordered + 1
        })
      })
      
      setRatingImprovement(newRating - experience.rating)
      setShowRatingUpdate(false)
    } catch (error) {
      console.error('Failed to update rating:', error)
    }
  }

  const formatLastEnjoyedTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday' 
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500'
    if (rating >= 3.5) return 'text-yellow-500' 
    return 'text-red-500'
  }

  const renderStars = (rating: number, size = 16) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Repeat className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Eat Again</h2>
                <p className="text-gray-600">Reorder or find something similar</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { id: 'reorder', label: 'Reorder', icon: Repeat },
              { id: 'similar', label: 'Similar Dishes', icon: Zap },
              { id: 'compare', label: 'Compare', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Reorder Tab */}
            {selectedTab === 'reorder' && (
              <div className="space-y-6">
                {/* Experience Card */}
                <div className="flex gap-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                  {experience.image_url && (
                    <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={experience.image_url} 
                        alt={experience.food_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {experience.food_name}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-gray-700">{experience.restaurant_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gray-500" />
                        <span className="text-gray-700">${experience.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        {renderStars(experience.rating)}
                        <span className={`font-medium ${getRatingColor(experience.rating)}`}>
                          {experience.rating}/5
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Heart size={16} className="text-pink-500" />
                        <span className="text-pink-600 font-medium">
                          {experience.emotional_rating}/10 emotional
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Last enjoyed {formatLastEnjoyedTime(experience.last_enjoyed)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Repeat size={14} />
                        <span>Ordered {experience.times_ordered} times</span>
                      </div>
                    </div>
                    
                    {experience.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {experience.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-white text-gray-600 rounded-full text-sm border border-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReorderClick('same')}
                    className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    <ChefHat size={24} />
                    <div className="text-left">
                      <div className="font-bold">Dine In</div>
                      <div className="text-sm opacity-90">Visit restaurant</div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReorderClick('delivery')}
                    className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    <Navigation size={24} />
                    <div className="text-left">
                      <div className="font-bold">Delivery</div>
                      <div className="text-sm opacity-90">25-35 min</div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReorderClick('pickup')}
                    className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                  >
                    <Users size={24} />
                    <div className="text-left">
                      <div className="font-bold">Pickup</div>
                      <div className="text-sm opacity-90">15-20 min</div>
                    </div>
                  </motion.button>
                </div>

                {/* Rating Improvement */}
                {ratingImprovement !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${
                      ratingImprovement > 0 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : ratingImprovement < 0
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} />
                      <span className="font-medium">
                        {ratingImprovement > 0 ? 'Rating improved!' :
                         ratingImprovement < 0 ? 'Rating decreased' :
                         'Same rating maintained'}
                      </span>
                      <span>({ratingImprovement > 0 ? '+' : ''}{ratingImprovement} points)</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Similar Dishes Tab */}
            {selectedTab === 'similar' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Dishes Similar to {experience.food_name}
                  </h3>
                  <p className="text-gray-600">
                    Based on your taste preferences and this dish's flavor profile
                  </p>
                </div>

                {isLoadingSimilar ? (
                  <div className="text-center py-12">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-4"
                    >
                      <Zap size={32} className="text-orange-500" />
                    </motion.div>
                    <p className="text-gray-600">Finding similar dishes...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {similarDishes.map((dish, index) => (
                      <motion.div
                        key={dish.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          {dish.image_url && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              <img 
                                src={dish.image_url} 
                                alt={dish.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{dish.name}</h4>
                            <p className="text-gray-600">{dish.restaurant}</p>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <DollarSign size={14} />
                                <span>${dish.price}</span>
                              </div>
                              
                              {dish.distance_km && (
                                <div className="flex items-center gap-1">
                                  <Navigation size={14} />
                                  <span>{dish.distance_km}km away</span>
                                </div>
                              )}
                              
                              {dish.estimated_delivery && (
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>{dish.estimated_delivery} min delivery</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dish.match_reasons.slice(0, 3).map(reason => (
                                <span
                                  key={reason}
                                  className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="text-2xl font-bold text-green-500">
                              {dish.similarity_score}%
                            </div>
                            <div className="text-sm text-gray-600">match</div>
                          </div>
                          
                          <button
                            onClick={() => onTrySimilar(dish.id)}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                          >
                            Try This
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Compare Tab */}
            {selectedTab === 'compare' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Experience Tracking
                  </h3>
                  <p className="text-gray-600">
                    See how your rating of this dish has changed over time
                  </p>
                </div>
                
                {/* Placeholder for rating history chart */}
                <div className="p-8 bg-gray-50 rounded-xl text-center">
                  <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Rating History</h4>
                  <p className="text-gray-600">
                    Track how your experience with this dish evolves over multiple visits
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    Charts will appear after multiple orders
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rating Update Modal */}
          {showRatingUpdate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-xl p-8 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  How was it this time?
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Rate your experience to help improve future recommendations
                </p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingUpdate(rating)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Star 
                        size={32} 
                        className="text-yellow-400 hover:fill-current transition-all"
                      />
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowRatingUpdate(false)}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}