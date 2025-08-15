/**
 * AI Onboarding API Route
 * Manages the intelligent onboarding questionnaire flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Onboarding question types
type QuestionType = 'slider' | 'multi_select' | 'emoji_scale' | 'binary' | 'preference_ranking'

interface OnboardingQuestion {
  id: string
  type: QuestionType
  title: string
  description: string
  options?: Array<{ value: string; label: string; emoji?: string }>
  min?: number
  max?: number
  followUp?: (answers: Record<string, unknown>) => string | null
}

// Define the 7 core onboarding questions
const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'taste_sensitivity',
    type: 'slider',
    title: '🌶️ How adventurous are you with bold flavors?',
    description: 'Help us understand your comfort zone with intense tastes',
    min: 1,
    max: 10,
    followUp: (answers) => {
      const sensitivity = Number(answers.taste_sensitivity) || 5;
      if (sensitivity >= 8) {
        return 'Great! We\'ll show you some exciting spicy and exotic options.'
      } else if (sensitivity <= 3) {
        return 'Perfect! We\'ll focus on familiar, comforting flavors.'
      }
      return 'We\'ll balance familiar favorites with some gentle adventures.'
    }
  },
  {
    id: 'cuisine_preferences',
    type: 'multi_select',
    title: '🍜 Which cuisines make your mouth water?',
    description: 'Select all that appeal to you (don\'t worry, you can always explore more!)',
    options: [
      { value: 'italian', label: 'Italian', emoji: '🍝' },
      { value: 'japanese', label: 'Japanese', emoji: '🍣' },
      { value: 'mexican', label: 'Mexican', emoji: '🌮' },
      { value: 'chinese', label: 'Chinese', emoji: '🥟' },
      { value: 'indian', label: 'Indian', emoji: '🍛' },
      { value: 'thai', label: 'Thai', emoji: '🍜' },
      { value: 'american', label: 'American', emoji: '🍔' },
      { value: 'french', label: 'French', emoji: '🥐' },
      { value: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
      { value: 'korean', label: 'Korean', emoji: '🥘' }
    ]
  },
  {
    id: 'texture_preferences',
    type: 'emoji_scale',
    title: '🥄 How do you feel about these textures?',
    description: 'Rate each texture from love to hate',
    options: [
      { value: 'crunchy', label: 'Crunchy foods (chips, nuts)', emoji: '🥜' },
      { value: 'creamy', label: 'Creamy foods (ice cream, soup)', emoji: '🍨' },
      { value: 'chewy', label: 'Chewy foods (gummy, bread)', emoji: '🍞' },
      { value: 'crispy', label: 'Crispy foods (fried, toasted)', emoji: '🍟' },
      { value: 'soft', label: 'Soft foods (pasta, cake)', emoji: '🍰' }
    ]
  },
  {
    id: 'dietary_restrictions',
    type: 'multi_select',
    title: '🥗 Do you follow any dietary preferences?',
    description: 'Help us respect your dietary choices',
    options: [
      { value: 'vegetarian', label: 'Vegetarian', emoji: '🌱' },
      { value: 'vegan', label: 'Vegan', emoji: '🌿' },
      { value: 'gluten_free', label: 'Gluten-Free', emoji: '🌾' },
      { value: 'dairy_free', label: 'Dairy-Free', emoji: '🥛' },
      { value: 'keto', label: 'Keto', emoji: '🥑' },
      { value: 'paleo', label: 'Paleo', emoji: '🥩' },
      { value: 'halal', label: 'Halal', emoji: '☪️' },
      { value: 'kosher', label: 'Kosher', emoji: '✡️' },
      { value: 'none', label: 'No restrictions', emoji: '🍽️' }
    ]
  },
  {
    id: 'meal_timing',
    type: 'preference_ranking',
    title: '⏰ When do you love to eat most?',
    description: 'Rank these meal times by how much you enjoy them',
    options: [
      { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
      { value: 'brunch', label: 'Brunch', emoji: '🥞' },
      { value: 'lunch', label: 'Lunch', emoji: '🌞' },
      { value: 'dinner', label: 'Dinner', emoji: '🌙' },
      { value: 'late_night', label: 'Late Night Snacks', emoji: '🌃' }
    ]
  },
  {
    id: 'social_dining',
    type: 'binary',
    title: '👥 How do you prefer to dine?',
    description: 'This helps us understand your social dining style',
    options: [
      { value: 'social', label: 'I love dining with friends and family', emoji: '👨‍👩‍👧‍👦' },
      { value: 'solo', label: 'I enjoy solo dining experiences', emoji: '🧘‍♀️' }
    ]
  },
  {
    id: 'price_sensitivity',
    type: 'slider',
    title: '💰 What\'s your dining budget comfort zone?',
    description: 'Help us recommend places within your budget',
    min: 1,
    max: 4,
    options: [
      { value: '1', label: 'Budget-friendly ($)', emoji: '💵' },
      { value: '2', label: 'Moderate ($$)', emoji: '💶' },
      { value: '3', label: 'Upscale ($$$)', emoji: '💷' },
      { value: '4', label: 'Fine dining ($$$$)', emoji: '💎' }
    ]
  }
]

const onboardingAnswersSchema = z.record(z.any())

// GET - Get onboarding questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const step = parseInt(searchParams.get('step') || '0')
    const answers = searchParams.get('answers')
    
    let parsedAnswers = {}
    if (answers) {
      try {
        parsedAnswers = JSON.parse(decodeURIComponent(answers))
      } catch (e) {
        console.warn('Failed to parse answers:', e)
      }
    }

    // Get the current question
    if (step >= ONBOARDING_QUESTIONS.length) {
      return NextResponse.json({
        success: true,
        data: {
          completed: true,
          totalQuestions: ONBOARDING_QUESTIONS.length,
          currentStep: step
        }
      })
    }

    const currentQuestion = ONBOARDING_QUESTIONS[step]
    let followUpMessage = null
    
    // Generate follow-up message if this question has one and we have previous answers
    if (currentQuestion.followUp && Object.keys(parsedAnswers).length > 0) {
      followUpMessage = currentQuestion.followUp(parsedAnswers)
    }

    return NextResponse.json({
      success: true,
      data: {
        question: currentQuestion,
        followUpMessage,
        currentStep: step + 1,
        totalQuestions: ONBOARDING_QUESTIONS.length,
        progress: ((step + 1) / ONBOARDING_QUESTIONS.length) * 100
      }
    })

  } catch (error) {
    console.error('Get onboarding question error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load onboarding question'
    }, { status: 500 })
  }
}

// POST - Process onboarding answers and create taste profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const body = await request.json()
    const validation = onboardingAnswersSchema.safeParse(body.answers)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid answers format'
      }, { status: 400 })
    }

    const answers = validation.data

    // Convert onboarding answers to taste profile data
    const tasteProfileData = {
      user_id: user.id,
      culinary_adventurousness: answers.taste_sensitivity || 5,
      cuisine_preferences: {
        ...(answers.cuisine_preferences || []).reduce((acc: Record<string, number>, cuisine: string) => {
          acc[cuisine] = 10 // High preference for selected cuisines
          return acc
        }, {})
      },
      // Map texture preferences to taste profile fields
      crunchy_preference: answers.texture_preferences?.crunchy || 5,
      creamy_preference: answers.texture_preferences?.creamy || 5,
      chewy_preference: answers.texture_preferences?.chewy || 5,
      // Set moderate defaults for taste preferences
      salty_preference: 7,
      sweet_preference: 6,
      sour_preference: 5,
      bitter_preference: 4,
      umami_preference: 6,
      hot_food_preference: 7,
      cold_food_preference: 6
    }

    // Create or update taste profile
    const { data: tasteProfile, error: tasteError } = await supabase
      .from('taste_profiles')
      .upsert([tasteProfileData])
      .select()
      .single()

    if (tasteError) {
      console.error('Failed to create taste profile:', tasteError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save taste profile'
      }, { status: 500 })
    }

    // Update user profile with onboarding completion and dietary restrictions
    const profileUpdates: Record<string, unknown> = {
      onboarding_completed: true,
      taste_profile_setup: true
    }

    if (answers.dietary_restrictions) {
      profileUpdates.dietary_restrictions = answers.dietary_restrictions
    }

    await supabase
      .from('user_profiles')
      .update(profileUpdates)
      .eq('id', user.id)

    // Create recommendation preferences
    const recommendationPrefs = {
      user_id: user.id,
      enable_ai_recommendations: true,
      enable_friend_recommendations: true,
      enable_location_based: true,
      taste_similarity_weight: 0.4,
      friend_influence_weight: 0.3,
      location_proximity_weight: 0.2,
      trending_factor_weight: 0.1,
      max_distance_km: 25,
      price_range_filter: answers.price_sensitivity ? [1, answers.price_sensitivity] : [1, 4],
      exclude_cuisines: [],
      only_verified_restaurants: false
    }

    await supabase
      .from('recommendation_preferences')
      .upsert([recommendationPrefs])

    // Generate initial recommendations
    const initialRecommendations = await generateInitialRecommendations(user.id, answers)

    return NextResponse.json({
      success: true,
      data: {
        taste_profile: tasteProfile,
        onboarding_completed: true,
        initial_recommendations: initialRecommendations,
        personality_summary: generatePersonalitySummary(answers)
      },
      message: 'Onboarding completed successfully!'
    })

  } catch (error) {
    console.error('Process onboarding error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Helper function to generate initial recommendations based on onboarding
async function generateInitialRecommendations(userId: string, answers: Record<string, unknown>) {
  const recommendations = []

  // Generate cuisine-based recommendations
  const cuisinePrefs = Array.isArray(answers.cuisine_preferences) ? answers.cuisine_preferences : [];
  if (cuisinePrefs.length > 0) {
    const topCuisine = String(cuisinePrefs[0])
    recommendations.push({
      type: 'cuisine',
      title: `Explore ${topCuisine.charAt(0).toUpperCase() + topCuisine.slice(1)} Cuisine`,
      description: `Based on your love for ${topCuisine} food, here are some great options nearby`,
      cuisine: topCuisine,
      confidence: 0.9
    })
  }

  // Generate adventurousness-based recommendations
  const sensitivity = Number(answers.taste_sensitivity) || 5;
  if (sensitivity >= 7) {
    recommendations.push({
      type: 'adventure',
      title: 'Bold Flavor Adventures',
      description: 'Since you love bold flavors, try these exciting taste experiences',
      confidence: 0.8
    })
  } else if (sensitivity <= 4) {
    recommendations.push({
      type: 'comfort',
      title: 'Comfort Food Favorites',
      description: 'Warm, familiar flavors that will make you feel at home',
      confidence: 0.8
    })
  }

  // Generate meal timing recommendations
  const mealTiming = Array.isArray(answers.meal_timing) ? answers.meal_timing : [];
  if (mealTiming.length > 0) {
    const favoriteMealTime = String(mealTiming[0])
    recommendations.push({
      type: 'timing',
      title: `Perfect ${favoriteMealTime.charAt(0).toUpperCase() + favoriteMealTime.slice(1)} Spots`,
      description: `Great places for your favorite meal time`,
      meal_time: favoriteMealTime,
      confidence: 0.7
    })
  }

  return recommendations
}

// Helper function to generate personality summary
function generatePersonalitySummary(answers: Record<string, unknown>): string {
  const traits = []

  const sensitivity = Number(answers.taste_sensitivity) || 5;
  if (sensitivity >= 8) {
    traits.push('Culinary Adventurer')
  } else if (sensitivity <= 3) {
    traits.push('Comfort Food Lover')
  } else {
    traits.push('Balanced Explorer')
  }

  if (answers.social_dining === 'social') {
    traits.push('Social Diner')
  } else {
    traits.push('Solo Explorer')
  }

  const priceSensitivity = Number(answers.price_sensitivity) || 3;
  if (priceSensitivity <= 2) {
    traits.push('Value Seeker')
  } else if (priceSensitivity >= 4) {
    traits.push('Fine Dining Enthusiast')
  }

  const primaryTrait = traits[0]
  const additionalTraits = traits.slice(1).join(', ')
  
  return `You're a ${primaryTrait}${additionalTraits ? ` who's also a ${additionalTraits}` : ''}. We'll personalize your food journey accordingly!`
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}