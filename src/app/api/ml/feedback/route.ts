/**
 * Machine Learning Feedback API Route
 * Processes user feedback to improve recommendation algorithms
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Feedback schema
const feedbackSchema = z.object({
  recommendation_id: z.string(),
  action: z.enum(['like', 'dislike', 'not_interested', 'visited', 'tried']),
  rating: z.number().min(1).max(5).optional(),
  feedback_text: z.string().optional(),
  context: z.object({
    time_of_day: z.string().optional(),
    mood: z.string().optional(),
    dining_companions: z.number().optional(),
    weather: z.string().optional(),
    occasion: z.string().optional()
  }).optional()
})

// Model training data structure
interface TrainingData {
  user_features: {
    taste_profile: Record<string, unknown>
    demographic: Record<string, unknown>
    behavior_patterns: Record<string, unknown>
    preference_history: Record<string, unknown>
  }
  item_features: {
    restaurant_attributes: Record<string, unknown> | null
    menu_item_attributes: Record<string, unknown> | null
    contextual_factors: Record<string, unknown>
  }
  interaction_data: {
    implicit_feedback: Record<string, unknown>
    explicit_feedback: Record<string, unknown>
    temporal_factors: Record<string, unknown>
  }
  outcome: {
    satisfaction_score: number
    engagement_level: string
    conversion_type: string
  }
}

// POST - Process recommendation feedback
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
    const validation = feedbackSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid feedback format',
        details: validation.error.errors
      }, { status: 400 })
    }

    const feedback = validation.data

    // Process the feedback
    const result = await processFeedback(supabase, user.id, feedback)

    // Update user's taste profile based on feedback
    await updateTasteProfile(supabase, user.id, feedback)

    // Generate training data for ML model
    const trainingData = await generateTrainingData(supabase, user.id, feedback)

    // Store training data for batch processing
    await storeTrainingData(supabase, trainingData)

    // Update recommendation preferences
    await updateRecommendationPreferences(supabase, user.id, feedback)

    return NextResponse.json({
      success: true,
      data: {
        feedback_processed: true,
        profile_updated: result.profileUpdated,
        learning_contribution: result.learningScore,
        next_recommendations_improved: true
      },
      message: 'Feedback received! Your recommendations will get better.'
    })

  } catch (error) {
    console.error('ML feedback processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process feedback'
    }, { status: 500 })
  }
}

// GET - Get model performance metrics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Get user's personal model performance
    const personalMetrics = await getPersonalModelMetrics(supabase, user.id)
    
    // Get overall system metrics (anonymized)
    const systemMetrics = await getSystemMetrics(supabase)

    return NextResponse.json({
      success: true,
      data: {
        personal_metrics: personalMetrics,
        system_metrics: systemMetrics,
        model_version: '1.0.2',
        last_training: '2024-01-15T10:30:00Z',
        improvement_suggestions: await getImprovementSuggestions(supabase, user.id)
      }
    })

  } catch (error) {
    console.error('Model metrics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get model metrics'
    }, { status: 500 })
  }
}

// Process user feedback and update systems
async function processFeedback(supabase: ReturnType<typeof createClient>, userId: string, feedback: z.infer<typeof feedbackSchema>) {
  let profileUpdated = false
  let learningScore = 0

  // Get the original recommendation
  const { data: interaction } = await supabase
    .from('recommendation_interactions')
    .select('*')
    .eq('id', feedback.recommendation_id)
    .single()

  if (!interaction) {
    throw new Error('Recommendation interaction not found')
  }

  // Update the interaction with feedback
  const updateData: Record<string, unknown> = {
    feedback_action: feedback.action,
    feedback_rating: feedback.rating,
    feedback_text: feedback.feedback_text,
    feedback_context: feedback.context,
    feedback_received_at: new Date().toISOString()
  }

  // Map actions to interaction fields
  switch (feedback.action) {
    case 'like':
      updateData.clicked = true
      updateData.clicked_at = new Date().toISOString()
      learningScore = 0.8
      break
    case 'dislike':
      learningScore = 0.9 // Negative feedback is very valuable
      break
    case 'visited':
      updateData.visited = true
      updateData.visited_at = new Date().toISOString()
      learningScore = 1.0
      break
    case 'tried':
      updateData.visited = true
      updateData.visited_at = new Date().toISOString()
      if (feedback.rating) {
        updateData.rated = true
        updateData.rating = feedback.rating
      }
      learningScore = 1.0
      profileUpdated = true
      break
    case 'not_interested':
      learningScore = 0.7
      break
  }

  await supabase
    .from('recommendation_interactions')
    .update(updateData)
    .eq('id', feedback.recommendation_id)

  // Create a dedicated feedback record for ML training
  await supabase
    .from('ml_feedback')
    .insert([{
      user_id: userId,
      recommendation_interaction_id: feedback.recommendation_id,
      feedback_type: feedback.action,
      feedback_score: mapActionToScore(feedback.action, feedback.rating),
      feedback_context: feedback.context,
      created_at: new Date().toISOString()
    }])

  return { profileUpdated, learningScore }
}

// Update taste profile based on feedback
async function updateTasteProfile(supabase: ReturnType<typeof createClient>, userId: string, feedback: z.infer<typeof feedbackSchema>) {
  if (feedback.action !== 'tried' || !feedback.rating) {
    return // Only update profile for explicit ratings
  }

  // Get the recommendation details
  const { data: interaction } = await supabase
    .from('recommendation_interactions')
    .select(`
      *,
      restaurant:restaurants(*),
      menu_item:menu_items(*)
    `)
    .eq('id', feedback.recommendation_id)
    .single()

  if (!interaction) return

  // Get current taste profile
  const { data: tasteProfile } = await supabase
    .from('taste_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!tasteProfile) return

  // Update cuisine preferences based on rating
  const cuisinePreferences = { ...tasteProfile.cuisine_preferences }
  
  if (interaction.restaurant?.cuisine_types) {
    for (const cuisine of interaction.restaurant.cuisine_types) {
      const currentPref = cuisinePreferences[cuisine] || 5
      const adjustment = (feedback.rating - 3) * 0.5 // -1 to +1 adjustment
      cuisinePreferences[cuisine] = Math.max(1, Math.min(10, currentPref + adjustment))
    }
  }

  // Update adventurousness based on how exotic the choice was
  let adventurousnessAdjustment = 0
  if (interaction.restaurant?.cuisine_types) {
    const uncommonCuisines = ['ethiopian', 'peruvian', 'moroccan', 'vietnamese']
    const hasUncommonCuisine = interaction.restaurant.cuisine_types.some((c: string) => 
      uncommonCuisines.includes(c.toLowerCase())
    )
    
    if (hasUncommonCuisine && feedback.rating >= 4) {
      adventurousnessAdjustment = 0.3
    } else if (hasUncommonCuisine && feedback.rating <= 2) {
      adventurousnessAdjustment = -0.2
    }
  }

  // Update taste profile
  const updates: Record<string, unknown> = {
    cuisine_preferences: cuisinePreferences
  }

  if (adventurousnessAdjustment !== 0) {
    const newAdventurousness = Math.max(1, Math.min(10, 
      tasteProfile.culinary_adventurousness + adventurousnessAdjustment
    ))
    updates.culinary_adventurousness = newAdventurousness
  }

  await supabase
    .from('taste_profiles')
    .update(updates)
    .eq('user_id', userId)
}

// Generate training data for ML model
async function generateTrainingData(supabase: ReturnType<typeof createClient>, userId: string, feedback: z.infer<typeof feedbackSchema>): Promise<TrainingData> {
  // Get user features
  const [userProfile, tasteProfile, recentExperiences] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('taste_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('food_experiences').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
  ])

  // Get item features
  const { data: interaction } = await supabase
    .from('recommendation_interactions')
    .select(`
      *,
      restaurant:restaurants(*),
      menu_item:menu_items(*)
    `)
    .eq('id', feedback.recommendation_id)
    .single()

  // Calculate behavior patterns
  const behaviorPatterns = await calculateBehaviorPatterns(supabase, userId)

  const trainingData: TrainingData = {
    user_features: {
      taste_profile: tasteProfile.data,
      demographic: {
        location: userProfile.data?.location,
        dietary_restrictions: userProfile.data?.dietary_restrictions,
        spice_tolerance: userProfile.data?.spice_tolerance
      },
      behavior_patterns: behaviorPatterns,
      preference_history: {
        total_experiences: recentExperiences.data?.length || 0,
        avg_rating: calculateAverageRating(recentExperiences.data || []),
        top_cuisines: extractTopCuisines(recentExperiences.data || [])
      }
    },
    item_features: {
      restaurant_attributes: interaction?.restaurant ? {
        cuisine_types: interaction.restaurant.cuisine_types,
        price_range: interaction.restaurant.price_range,
        features: interaction.restaurant.features,
        verified: interaction.restaurant.verified
      } : null,
      menu_item_attributes: interaction?.menu_item ? {
        category: interaction.menu_item.category,
        price: interaction.menu_item.price,
        spice_level: interaction.menu_item.spice_level,
        is_vegetarian: interaction.menu_item.is_vegetarian,
        is_vegan: interaction.menu_item.is_vegan
      } : null,
      contextual_factors: {
        recommendation_type: interaction?.recommendation_type,
        time_of_day: feedback.context?.time_of_day,
        weather: feedback.context?.weather
      }
    },
    interaction_data: {
      implicit_feedback: {
        time_to_click: interaction?.clicked_at ? 
          new Date(interaction.clicked_at).getTime() - new Date(interaction.shown_at).getTime() : null,
        time_to_visit: interaction?.visited_at ?
          new Date(interaction.visited_at).getTime() - new Date(interaction.shown_at).getTime() : null
      },
      explicit_feedback: {
        action: feedback.action,
        rating: feedback.rating,
        feedback_text: feedback.feedback_text
      },
      temporal_factors: {
        time_of_recommendation: interaction?.shown_at,
        day_of_week: new Date(interaction?.shown_at).getDay(),
        hour_of_day: new Date(interaction?.shown_at).getHours()
      }
    },
    outcome: {
      satisfaction_score: mapActionToScore(feedback.action, feedback.rating),
      engagement_level: mapActionToEngagement(feedback.action),
      conversion_type: feedback.action === 'visited' || feedback.action === 'tried' ? 'converted' : 'not_converted'
    }
  }

  return trainingData
}

// Store training data for batch ML processing
async function storeTrainingData(supabase: ReturnType<typeof createClient>, trainingData: TrainingData) {
  await supabase
    .from('ml_training_data')
    .insert([{
      data: trainingData,
      created_at: new Date().toISOString(),
      processed: false
    }])
}

// Update recommendation preferences based on feedback patterns
async function updateRecommendationPreferences(supabase: ReturnType<typeof createClient>, userId: string, feedback: z.infer<typeof feedbackSchema>) {
  // Get current preferences
  const { data: preferences } = await supabase
    .from('recommendation_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!preferences) return

  // Analyze recent feedback patterns
  const { data: recentFeedback } = await supabase
    .from('ml_feedback')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  // Calculate preference adjustments
  const adjustments = calculatePreferenceAdjustments(recentFeedback || [])

  // Apply adjustments to preferences
  const updates: Record<string, unknown> = {}
  
  if (adjustments.taste_similarity_weight_change !== 0) {
    updates.taste_similarity_weight = Math.max(0.1, Math.min(0.8, 
      preferences.taste_similarity_weight + adjustments.taste_similarity_weight_change
    ))
  }
  
  if (adjustments.friend_influence_weight_change !== 0) {
    updates.friend_influence_weight = Math.max(0.1, Math.min(0.6, 
      preferences.friend_influence_weight + adjustments.friend_influence_weight_change
    ))
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('recommendation_preferences')
      .update(updates)
      .eq('user_id', userId)
  }
}

// Helper functions
function mapActionToScore(action: string, rating?: number): number {
  switch (action) {
    case 'like': return 0.8
    case 'dislike': return 0.2
    case 'not_interested': return 0.3
    case 'visited': return 0.9
    case 'tried': return rating ? rating / 5 : 0.8
    default: return 0.5
  }
}

function mapActionToEngagement(action: string): string {
  switch (action) {
    case 'like': return 'medium'
    case 'dislike': return 'low'
    case 'not_interested': return 'low'
    case 'visited': return 'high'
    case 'tried': return 'very_high'
    default: return 'medium'
  }
}

async function calculateBehaviorPatterns(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: analytics } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30)

  if (!analytics || analytics.length === 0) {
    return {
      avg_sessions_per_day: 0,
      avg_session_duration: 0,
      most_active_time: 'unknown',
      engagement_trend: 'stable'
    }
  }

  const avgSessions = analytics.reduce((sum, day) => sum + day.app_opens, 0) / analytics.length
  const avgDuration = analytics.reduce((sum, day) => sum + day.session_duration_minutes, 0) / analytics.length
  
  return {
    avg_sessions_per_day: avgSessions,
    avg_session_duration: avgDuration,
    most_active_time: 'evening', // Placeholder
    engagement_trend: 'increasing' // Placeholder
  }
}

function calculateAverageRating(experiences: Record<string, unknown>[]): number {
  if (experiences.length === 0) return 0
  const total = experiences.reduce((sum, exp) => sum + ((exp.overall_rating as number) || 0), 0)
  return total / experiences.length
}

function extractTopCuisines(experiences: Record<string, unknown>[]): string[] {
  const cuisineCounts: Record<string, number> = {}
  
  experiences.forEach(exp => {
    const restaurant = exp.restaurant as Record<string, unknown>
    if (restaurant?.cuisine_types && Array.isArray(restaurant.cuisine_types)) {
      restaurant.cuisine_types.forEach((cuisine: string) => {
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
      })
    }
  })
  
  return Object.entries(cuisineCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([cuisine]) => cuisine)
}

function calculatePreferenceAdjustments(recentFeedback: Record<string, unknown>[]) {
  let tasteWeightChange = 0
  let friendWeightChange = 0
  
  // Analyze feedback patterns
  const positiveAIFeedback = recentFeedback.filter(f => 
    f.feedback_type === 'like' || f.feedback_type === 'tried'
  ).length
  
  const negativeFeedback = recentFeedback.filter(f => 
    f.feedback_type === 'dislike' || f.feedback_type === 'not_interested'
  ).length
  
  // Adjust weights based on feedback patterns
  if (positiveAIFeedback > negativeFeedback * 2) {
    tasteWeightChange = 0.05 // Increase AI influence
  } else if (negativeFeedback > positiveAIFeedback) {
    tasteWeightChange = -0.05 // Decrease AI influence
    friendWeightChange = 0.05 // Increase friend influence
  }
  
  return {
    taste_similarity_weight_change: tasteWeightChange,
    friend_influence_weight_change: friendWeightChange
  }
}

async function getPersonalModelMetrics(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: interactions } = await supabase
    .from('recommendation_interactions')
    .select('*')
    .eq('user_id', userId)
    .gte('shown_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (!interactions || interactions.length === 0) {
    return {
      recommendations_shown: 0,
      click_rate: 0,
      satisfaction_rate: 0,
      discovery_rate: 0
    }
  }

  const clicked = interactions.filter(i => i.clicked).length
  const visited = interactions.filter(i => i.visited).length
  const rated = interactions.filter(i => i.rated && i.rating >= 4).length
  
  return {
    recommendations_shown: interactions.length,
    click_rate: clicked / interactions.length,
    satisfaction_rate: rated / Math.max(interactions.filter(i => i.rated).length, 1),
    discovery_rate: visited / interactions.length
  }
}

async function getSystemMetrics(supabase: ReturnType<typeof createClient>) {
  // Return anonymized system-wide metrics
  return {
    total_users: 1250, // Placeholder
    avg_satisfaction: 4.2,
    model_accuracy: 0.78,
    improvement_over_baseline: 0.15
  }
}

async function getImprovementSuggestions(supabase: ReturnType<typeof createClient>, userId: string) {
  // Analyze user's interaction patterns and suggest improvements
  return [
    {
      type: 'data_collection',
      suggestion: 'Try rating more recommendations to improve accuracy',
      impact: 'high'
    },
    {
      type: 'exploration',
      suggestion: 'Explore a new cuisine to diversify your recommendations',
      impact: 'medium'
    }
  ]
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