'use client'

/**
 * AI Onboarding Page
 * Complete taste profiling experience for new users
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import TasteProfileQuestionnaire from '@/components/onboarding/TasteProfileQuestionnaire'
import OnboardingResults from '@/components/onboarding/OnboardingResults'

interface TasteProfileData {
  sweet: number
  salty: number
  sour: number
  bitter: number
  umami: number
  spicy: number
  crunchy: number
  creamy: number
  chewy: number
  hot: number
  cold: number
  adventurousness: number
  social_dining: string
  meal_frequency: string
  cooking_frequency: string
  cuisine_preferences: Record<string, number>
  dietary_restrictions: string[]
  allergies: string[]
  comfort_foods: string[]
  celebration_foods: string[]
  stress_foods: string[]
  ingredient_preferences: Record<string, number>
  preparation_methods: Record<string, number>
  meal_timing: Record<string, number>
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'questionnaire' | 'results' | 'complete'>('questionnaire')
  const [tasteProfile, setTasteProfile] = useState<TasteProfileData | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Record<string, unknown>[]>([])

  const handleQuestionnaireComplete = async (profile: TasteProfileData, profileInsights: string[]) => {
    try {
      // Save the taste profile to the backend
      const response = await fetch('/api/profile/taste-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      const data = await response.json()
      
      if (data.success) {
        setTasteProfile(profile)
        setInsights(profileInsights)
        
        // Generate initial recommendations
        const recResponse = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            taste_profile: profile,
            onboarding: true,
            limit: 5
          })
        })
        
        const recData = await recResponse.json()
        if (recData.success) {
          setRecommendations(recData.data.recommendations)
        }
        
        setCurrentStep('results')
      }
    } catch (error) {
      console.error('Failed to save taste profile:', error)
    }
  }

  const handleOnboardingComplete = async () => {
    setCurrentStep('complete')
    
    try {
      // Mark onboarding as completed in database
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        console.log('Onboarding completed successfully')
      } else {
        console.error('Failed to mark onboarding as completed')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
    
    // Mark onboarding as completed in localStorage as fallback
    localStorage.setItem('onboardingCompleted', 'true')
    
    // Redirect to main app after a short delay
    setTimeout(() => {
      // Use router.push to maintain session state
      router.push('/app')
    }, 2000)
  }

  const handleRetakeQuestionnaire = () => {
    setCurrentStep('questionnaire')
    setTasteProfile(null)
    setInsights([])
    setRecommendations([])
  }

  const handleSkipOnboarding = async () => {
    // Show popup notice about accessing through settings
    const shouldSkip = window.confirm(
      "You can restart the AI Taste Profiling anytime through the Settings menu in your profile.\n\nContinue to skip?"
    )
    
    if (!shouldSkip) return
    
    try {
      // Mark onboarding as completed in database
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        console.log('Onboarding skipped and marked as completed')
      }
    } catch (error) {
      console.error('Error marking onboarding as completed:', error)
    }
    
    // Mark onboarding as completed when skipped
    localStorage.setItem('onboardingCompleted', 'true')
    // Use router.push to maintain session state
    router.push('/app')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <AnimatePresence mode="wait">
          {currentStep === 'questionnaire' && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TasteProfileQuestionnaire
                onComplete={handleQuestionnaireComplete}
                onSkip={handleSkipOnboarding}
              />
            </motion.div>
          )}

          {currentStep === 'results' && tasteProfile && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingResults
                tasteProfile={tasteProfile as unknown as Record<string, unknown>}
                insights={insights}
                recommendations={recommendations}
                onContinue={handleOnboardingComplete}
                onRetake={handleRetakeQuestionnaire}
              />
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 3
                  }}
                  className="text-8xl mb-8"
                >
                  🍽️
                </motion.div>
                
                <motion.h1
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold text-gray-900 mb-4"
                >
                  Welcome to Kuchisabishii!
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gray-600 mb-8"
                >
                  Your personalized food journey begins now
                </motion.p>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full"
                >
                  ✓ Profile Created Successfully
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}