'use client'

/**
 * Recommendation Feedback Learning Component
 * Captures user feedback and continuously improves AI recommendations
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ThumbsUp, ThumbsDown, Star, Heart, 
  Brain, Zap, TrendingUp, Eye, MessageSquare,
  Lightbulb, Target, Award, CheckCircle, X
} from 'lucide-react'

interface FeedbackData {
  recommendation_id: string
  food_name: string
  restaurant_name: string
  predicted_rating: number
  user_rating?: number
  feedback_type: 'like' | 'dislike' | 'neutral' | 'detailed'
  reasons?: string[]
  comments?: string
  context: {
    time_of_day: string
    mood: string
    social_setting: string
    weather?: string
    special_occasion?: string
  }
}

interface LearningInsight {
  type: 'accuracy_improvement' | 'preference_discovered' | 'pattern_identified'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
}

interface RecommendationFeedbackProps {
  recommendationId: string
  foodName: string
  restaurantName: string
  predictedRating: number
  onFeedbackSubmitted: (feedback: FeedbackData) => void
  onClose?: () => void
  showDetailed?: boolean
}

export default function RecommendationFeedbackLearning({
  recommendationId,
  foodName,
  restaurantName,
  predictedRating,
  onFeedbackSubmitted,
  onClose,
  showDetailed = false
}: RecommendationFeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike' | 'neutral' | 'detailed' | null>(null)
  const [userRating, setUserRating] = useState<number>(0)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [comments, setComments] = useState('')
  const [currentMood, setCurrentMood] = useState('')
  const [socialSetting, setSocialSetting] = useState('')
  const [showDetailedForm, setShowDetailedForm] = useState(showDetailed)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([])

  const likingReasons = [
    'Perfect flavor balance',
    'Great texture',
    'Right spice level',
    'Good portion size',
    'Matches my mood',
    'New discovery',
    'Comfort food feel',
    'High quality ingredients',
    'Good value for price',
    'Authentic taste'
  ]

  const dislikingReasons = [
    'Too spicy/mild',
    'Poor texture',
    'Overpriced',
    'Not what I expected',
    'Poor quality',
    'Wrong for the mood',
    'Too heavy/light',
    'Bad seasoning',
    'Not authentic',
    'Service issues'
  ]

  const moodOptions = [
    'Happy', 'Stressed', 'Tired', 'Excited', 'Calm', 
    'Adventurous', 'Nostalgic', 'Celebratory', 'Comfort-seeking'
  ]

  const socialSettings = [
    'Solo dining', 'With family', 'Date night', 'Friends gathering',
    'Business meal', 'Celebration', 'Casual hangout', 'Group outing'
  ]

  const handleQuickFeedback = async (type: 'like' | 'dislike' | 'neutral') => {
    setFeedbackType(type)
    
    if (type === 'like' || type === 'dislike') {
      setShowDetailedForm(true)
    } else {
      await submitFeedback({ type, skipDetailed: true })
    }
  }

  const handleDetailedFeedback = () => {
    setFeedbackType('detailed')
    setShowDetailedForm(true)
  }

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    )
  }

  const submitFeedback = async (options: { type?: string, skipDetailed?: boolean } = {}) => {
    try {
      setIsSubmitting(true)
      
      const feedback: FeedbackData = {
        recommendation_id: recommendationId,
        food_name: foodName,
        restaurant_name: restaurantName,
        predicted_rating: predictedRating,
        user_rating: userRating || undefined,
        feedback_type: (options.type as any) || feedbackType || 'neutral',
        reasons: selectedReasons.length > 0 ? selectedReasons : undefined,
        comments: comments || undefined,
        context: {
          time_of_day: new Date().toISOString(),
          mood: currentMood || 'neutral',
          social_setting: socialSetting || 'unknown'
        }
      }

      // Submit feedback to API
      const response = await fetch('/api/ml/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      })

      const data = await response.json()
      
      if (data.success) {
        // Get learning insights
        if (data.data.insights) {
          setLearningInsights(data.data.insights)
        }
        
        setShowSuccess(true)
        onFeedbackSubmitted(feedback)
        
        if (!options.skipDetailed) {
          // Show success for a moment, then close
          setTimeout(() => {
            onClose?.()
          }, 3000)
        }
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, size = 24 }: Record<string, unknown>) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={`${
              star <= value 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      ))}
    </div>
  )

  if (showSuccess && !showDetailedForm) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle size={32} className="text-green-500" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Thanks for your feedback!
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your input helps our AI learn your preferences better.
          </p>
          
          {learningInsights.length > 0 && (
            <div className="space-y-3">
              {learningInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-3 bg-blue-50 rounded-lg text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">
                      {insight.title}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600">{insight.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="text-purple-500" size={24} />
                How was this recommendation?
              </h2>
              <p className="text-gray-600 mt-1">Help us learn your preferences better</p>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            )}
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Recommendation Details */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{foodName}</h3>
              <p className="text-gray-600 mb-3">{restaurantName}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-purple-500" />
                  <span className="text-sm text-gray-700">
                    AI predicted: {predictedRating}/5 stars
                  </span>
                </div>
              </div>
            </div>

            {!showDetailedForm ? (
              /* Quick Feedback */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Quick feedback
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickFeedback('like')}
                      className="flex items-center justify-center gap-3 p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      <ThumbsUp size={24} className="text-green-600" />
                      <div className="text-left">
                        <div className="font-semibold text-green-700">Loved it!</div>
                        <div className="text-sm text-green-600">Great recommendation</div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickFeedback('dislike')}
                      className="flex items-center justify-center gap-3 p-6 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <ThumbsDown size={24} className="text-red-600" />
                      <div className="text-left">
                        <div className="font-semibold text-red-700">Not for me</div>
                        <div className="text-sm text-red-600">Missed the mark</div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickFeedback('neutral')}
                      className="flex items-center justify-center gap-3 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Heart size={24} className="text-gray-600" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-700">It was okay</div>
                        <div className="text-sm text-gray-600">Average experience</div>
                      </div>
                    </motion.button>
                  </div>
                  
                  <button
                    onClick={handleDetailedFeedback}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors mx-auto"
                  >
                    <MessageSquare size={16} />
                    Provide detailed feedback
                  </button>
                </div>
              </div>
            ) : (
              /* Detailed Feedback Form */
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate this experience</h3>
                  <div className="flex items-center gap-4">
                    <StarRating value={userRating} onChange={setUserRating} />
                    <span className="text-gray-600">({userRating}/5 stars)</span>
                  </div>
                </div>

                {/* Reasons */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    What influenced your rating?
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(feedbackType === 'like' || userRating >= 4 ? likingReasons : dislikingReasons).map(reason => (
                      <button
                        key={reason}
                        onClick={() => toggleReason(reason)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          selectedReasons.includes(reason)
                            ? 'border-purple-400 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">How were you feeling?</h4>
                    <select
                      value={currentMood}
                      onChange={(e) => setCurrentMood(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select mood...</option>
                      {moodOptions.map(mood => (
                        <option key={mood} value={mood}>{mood}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Dining situation</h4>
                    <select
                      value={socialSetting}
                      onChange={(e) => setSocialSetting(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select situation...</option>
                      {socialSettings.map(setting => (
                        <option key={setting} value={setting}>{setting}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Additional comments (optional)</h4>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Tell us more about your experience..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-between items-center pt-6">
                  <button
                    onClick={() => setShowDetailedForm(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Back to quick feedback
                  </button>
                  
                  <button
                    onClick={() => submitFeedback()}
                    disabled={isSubmitting || userRating === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}