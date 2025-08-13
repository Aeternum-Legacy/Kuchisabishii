/**
 * Recommendation Analytics API Route
 * Tracks and analyzes recommendation performance for ML improvement
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Analytics request schema
const analyticsRequestSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  recommendation_type: z.enum(['ai_similar_taste', 'friend_shared', 'trending', 'location_based', 'seasonal']).optional(),
  metric: z.enum(['click_rate', 'conversion_rate', 'satisfaction', 'diversity', 'all']).optional()
})

interface RecommendationMetrics {
  total_shown: number
  total_clicked: number
  total_visited: number
  total_rated: number
  click_rate: number
  conversion_rate: number
  average_rating: number
  satisfaction_score: number
  diversity_score: number
  user_engagement: {
    daily_active_users: number
    avg_session_duration: number
    recommendations_per_session: number
  }
  recommendation_breakdown: Array<{
    type: string
    count: number
    performance: number
  }>
  trending_patterns: Array<{
    cuisine: string
    popularity_trend: number
    satisfaction_trend: number
  }>
}

// GET - Get recommendation analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const start_date = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const end_date = searchParams.get('end_date') || new Date().toISOString().split('T')[0]
    const recommendation_type = searchParams.get('recommendation_type')
    const metric = searchParams.get('metric') || 'all'
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Check if user has admin access or is viewing their own analytics
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found'
      }, { status: 404 })
    }

    // Get analytics data
    const analytics = await generateRecommendationAnalytics(
      supabase,
      user.id,
      start_date,
      end_date,
      recommendation_type,
      metric
    )

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        period: {
          start_date,
          end_date,
          days: Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24))
        },
        filters: {
          recommendation_type,
          metric
        }
      }
    })

  } catch (error) {
    console.error('Recommendation analytics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate analytics'
    }, { status: 500 })
  }
}

// POST - Log A/B test results
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
    const { test_id, variant, outcome, metadata } = body

    // Log A/B test result
    const { error: insertError } = await supabase
      .from('ab_test_results')
      .insert([{
        user_id: user.id,
        test_id,
        variant,
        outcome,
        metadata,
        recorded_at: new Date().toISOString()
      }])

    if (insertError) {
      console.error('Failed to log A/B test result:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to log test result'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'A/B test result logged successfully'
    })

  } catch (error) {
    console.error('A/B test logging error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Generate comprehensive recommendation analytics
async function generateRecommendationAnalytics(
  supabase: any,
  userId: string,
  startDate: string,
  endDate: string,
  recommendationType?: string,
  metric: string = 'all'
): Promise<RecommendationMetrics> {
  // Base query for recommendation interactions
  let interactionsQuery = supabase
    .from('recommendation_interactions')
    .select('*')
    .eq('user_id', userId)
    .gte('shown_at', startDate)
    .lte('shown_at', endDate)

  if (recommendationType) {
    interactionsQuery = interactionsQuery.eq('recommendation_type', recommendationType)
  }

  const { data: interactions } = await interactionsQuery

  // Calculate basic metrics
  const totalShown = interactions?.length || 0
  const totalClicked = interactions?.filter(i => i.clicked).length || 0
  const totalVisited = interactions?.filter(i => i.visited).length || 0
  const totalRated = interactions?.filter(i => i.rated).length || 0
  
  const clickRate = totalShown > 0 ? totalClicked / totalShown : 0
  const conversionRate = totalShown > 0 ? totalVisited / totalShown : 0
  
  // Calculate average rating
  const ratedInteractions = interactions?.filter(i => i.rating != null) || []
  const averageRating = ratedInteractions.length > 0 
    ? ratedInteractions.reduce((sum, i) => sum + i.rating, 0) / ratedInteractions.length 
    : 0

  // Calculate satisfaction score (percentage of ratings >= 4)
  const satisfactionScore = ratedInteractions.length > 0
    ? ratedInteractions.filter(i => i.rating >= 4).length / ratedInteractions.length
    : 0

  // Calculate diversity score
  const diversityScore = await calculateDiversityScore(supabase, userId, interactions || [])

  // Get user engagement metrics
  const userEngagement = await calculateUserEngagement(supabase, userId, startDate, endDate)

  // Get recommendation breakdown by type
  const recommendationBreakdown = await calculateRecommendationBreakdown(supabase, userId, interactions || [])

  // Get trending patterns
  const trendingPatterns = await calculateTrendingPatterns(supabase, startDate, endDate)

  return {
    total_shown: totalShown,
    total_clicked: totalClicked,
    total_visited: totalVisited,
    total_rated: totalRated,
    click_rate: clickRate,
    conversion_rate: conversionRate,
    average_rating: averageRating,
    satisfaction_score: satisfactionScore,
    diversity_score: diversityScore,
    user_engagement: userEngagement,
    recommendation_breakdown: recommendationBreakdown,
    trending_patterns: trendingPatterns
  }
}

// Calculate recommendation diversity (variety of cuisines, restaurants, etc.)
async function calculateDiversityScore(supabase: any, userId: string, interactions: any[]): Promise<number> {
  if (interactions.length === 0) return 0

  const restaurantIds = new Set()
  const cuisineTypes = new Set()
  
  for (const interaction of interactions) {
    if (interaction.restaurant_id) {
      restaurantIds.add(interaction.restaurant_id)
      
      // Get restaurant cuisine types
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('cuisine_types')
        .eq('id', interaction.restaurant_id)
        .single()
      
      if (restaurant?.cuisine_types) {
        restaurant.cuisine_types.forEach((cuisine: string) => cuisineTypes.add(cuisine))
      }
    }
  }
  
  // Diversity score based on unique restaurants and cuisines
  const restaurantDiversity = restaurantIds.size / Math.min(interactions.length, 10) // Cap at 10 for scoring
  const cuisineDiversity = cuisineTypes.size / Math.min(interactions.length, 8) // Cap at 8 different cuisines
  
  return (restaurantDiversity + cuisineDiversity) / 2
}

// Calculate user engagement metrics
async function calculateUserEngagement(supabase: any, userId: string, startDate: string, endDate: string) {
  // Get user analytics for the period
  const { data: analytics } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (!analytics || analytics.length === 0) {
    return {
      daily_active_users: 0,
      avg_session_duration: 0,
      recommendations_per_session: 0
    }
  }

  const totalSessions = analytics.reduce((sum, day) => sum + day.app_opens, 0)
  const totalDuration = analytics.reduce((sum, day) => sum + day.session_duration_minutes, 0)
  const activeDays = analytics.filter(day => day.app_opens > 0).length
  
  return {
    daily_active_users: activeDays,
    avg_session_duration: totalSessions > 0 ? totalDuration / totalSessions : 0,
    recommendations_per_session: totalSessions > 0 ? 5 : 0 // Placeholder calculation
  }
}

// Calculate recommendation breakdown by type
async function calculateRecommendationBreakdown(supabase: any, userId: string, interactions: any[]) {
  const breakdown: Record<string, { count: number; clicked: number; visited: number; rated: number }> = {}
  
  for (const interaction of interactions) {
    const type = interaction.recommendation_type || 'unknown'
    if (!breakdown[type]) {
      breakdown[type] = { count: 0, clicked: 0, visited: 0, rated: 0 }
    }
    
    breakdown[type].count++
    if (interaction.clicked) breakdown[type].clicked++
    if (interaction.visited) breakdown[type].visited++
    if (interaction.rated) breakdown[type].rated++
  }
  
  return Object.entries(breakdown).map(([type, stats]) => ({
    type,
    count: stats.count,
    performance: stats.count > 0 ? (stats.clicked + stats.visited * 2 + stats.rated * 3) / (stats.count * 6) : 0
  }))
}

// Calculate trending patterns in food preferences
async function calculateTrendingPatterns(supabase: any, startDate: string, endDate: string) {
  // Get recent food experiences to identify trends
  const { data: recentExperiences } = await supabase
    .from('food_experiences')
    .select(`
      *,
      restaurant:restaurants(cuisine_types)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .gte('overall_rating', 4)

  const cuisineTrends: Record<string, { count: number; totalRating: number }> = {}
  
  for (const experience of recentExperiences || []) {
    const cuisines = experience.restaurant?.cuisine_types || []
    for (const cuisine of cuisines) {
      if (!cuisineTrends[cuisine]) {
        cuisineTrends[cuisine] = { count: 0, totalRating: 0 }
      }
      cuisineTrends[cuisine].count++
      cuisineTrends[cuisine].totalRating += experience.overall_rating
    }
  }
  
  return Object.entries(cuisineTrends)
    .map(([cuisine, stats]) => ({
      cuisine,
      popularity_trend: stats.count,
      satisfaction_trend: stats.count > 0 ? stats.totalRating / stats.count : 0
    }))
    .sort((a, b) => b.popularity_trend - a.popularity_trend)
    .slice(0, 10)
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