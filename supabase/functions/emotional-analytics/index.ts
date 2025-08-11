/**
 * Emotional Analytics Edge Function for Kuchisabishii
 * Analyzes emotional food journeys and provides insights using AI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmotionalAnalysisRequest {
  userId: string;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  analysisType: 'mood_trends' | 'satisfaction_patterns' | 'cuisine_emotions' | 'social_influence';
}

interface EmotionalInsight {
  type: string;
  title: string;
  description: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Set the auth context
    await supabase.auth.setSession({ access_token: token, refresh_token: '' })
    
    const { data: user, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user.user) {
      throw new Error('Unauthorized')
    }

    const body: EmotionalAnalysisRequest = await req.json()
    const { userId, timeRange, analysisType } = body

    // Ensure user can only analyze their own data
    if (userId !== user.user.id) {
      throw new Error('Unauthorized to analyze other user data')
    }

    const insights: EmotionalInsight[] = []
    const dateFilter = getDateFilter(timeRange)

    switch (analysisType) {
      case 'mood_trends':
        insights.push(...await analyzeMoodTrends(supabase, userId, dateFilter))
        break
      case 'satisfaction_patterns':
        insights.push(...await analyzeSatisfactionPatterns(supabase, userId, dateFilter))
        break
      case 'cuisine_emotions':
        insights.push(...await analyzeCuisineEmotions(supabase, userId, dateFilter))
        break
      case 'social_influence':
        insights.push(...await analyzeSocialInfluence(supabase, userId, dateFilter))
        break
    }

    return new Response(
      JSON.stringify({ insights }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function getDateFilter(timeRange: string): string {
  const intervals = {
    week: '7 days',
    month: '30 days', 
    quarter: '90 days',
    year: '365 days'
  }
  return intervals[timeRange as keyof typeof intervals] || '30 days'
}

async function analyzeMoodTrends(supabase: any, userId: string, dateFilter: string): Promise<EmotionalInsight[]> {
  const { data: experiences } = await supabase
    .from('food_experiences')
    .select(`
      *,
      taste_experiences(*)
    `)
    .eq('user_id', userId)
    .gte('experienced_at', `now() - interval '${dateFilter}'`)
    .order('experienced_at', { ascending: true })

  if (!experiences || experiences.length === 0) {
    return [{
      type: 'mood_trends',
      title: 'No Recent Data',
      description: 'Not enough recent food experiences to analyze mood trends.',
      score: 0,
      trend: 'stable',
      recommendations: ['Start logging more food experiences to track your emotional journey'],
      data: {}
    }]
  }

  // Analyze mood progression
  const moodProgression = experiences.map((exp: any, index: number) => ({
    date: exp.experienced_at,
    before: exp.mood_before,
    after: exp.mood_after,
    satisfaction: exp.satisfaction_level || 5,
    dayIndex: index
  }))

  // Calculate trend
  const recentSatisfaction = moodProgression.slice(-7).reduce((sum: number, exp: any) => sum + exp.satisfaction, 0) / 7
  const earlierSatisfaction = moodProgression.slice(0, 7).reduce((sum: number, exp: any) => sum + exp.satisfaction, 0) / 7
  const trend = recentSatisfaction > earlierSatisfaction + 0.5 ? 'improving' : 
               recentSatisfaction < earlierSatisfaction - 0.5 ? 'declining' : 'stable'

  // Identify patterns
  const positiveEmotions = experiences.filter((exp: any) => 
    exp.emotions.some((emotion: string) => ['happy', 'satisfied', 'excited', 'content'].includes(emotion))
  ).length

  const negativeEmotions = experiences.filter((exp: any) => 
    exp.emotions.some((emotion: string) => ['disappointed', 'frustrated', 'sad', 'angry'].includes(emotion))
  ).length

  const emotionalBalance = positiveEmotions / (positiveEmotions + negativeEmotions) * 100

  return [{
    type: 'mood_trends',
    title: 'Emotional Food Journey',
    description: `Your food experiences show a ${trend} emotional trend with ${emotionalBalance.toFixed(1)}% positive emotions.`,
    score: emotionalBalance,
    trend,
    recommendations: getEmotionalRecommendations(trend, emotionalBalance),
    data: {
      moodProgression,
      emotionalBalance,
      positiveCount: positiveEmotions,
      negativeCount: negativeEmotions,
      averageSatisfaction: recentSatisfaction
    }
  }]
}

async function analyzeSatisfactionPatterns(supabase: any, userId: string, dateFilter: string): Promise<EmotionalInsight[]> {
  const { data: patterns } = await supabase
    .from('food_experiences')
    .select('meal_time, dining_method, overall_rating, satisfaction_level, dining_companions, special_occasion')
    .eq('user_id', userId)
    .gte('experienced_at', `now() - interval '${dateFilter}'`)
    .not('overall_rating', 'is', null)

  if (!patterns || patterns.length === 0) {
    return []
  }

  // Analyze patterns by different factors
  const mealTimePatterns = analyzeGroupedSatisfaction(patterns, 'meal_time')
  const diningMethodPatterns = analyzeGroupedSatisfaction(patterns, 'dining_method') 
  const socialPatterns = analyzeSocialSatisfaction(patterns)

  const insights: EmotionalInsight[] = []

  // Best meal time
  const bestMealTime = Object.entries(mealTimePatterns)
    .sort(([,a], [,b]) => b.avgSatisfaction - a.avgSatisfaction)[0]

  if (bestMealTime) {
    insights.push({
      type: 'satisfaction_patterns',
      title: `Peak Satisfaction: ${bestMealTime[0]}`,
      description: `You tend to be most satisfied during ${bestMealTime[0]} with an average satisfaction of ${bestMealTime[1].avgSatisfaction.toFixed(1)}/10.`,
      score: bestMealTime[1].avgSatisfaction * 10,
      trend: 'stable',
      recommendations: [
        `Consider planning special meals during ${bestMealTime[0]}`,
        'Try new restaurants during your peak satisfaction time'
      ],
      data: {
        mealTimePatterns,
        bestTime: bestMealTime[0],
        avgSatisfaction: bestMealTime[1].avgSatisfaction
      }
    })
  }

  return insights
}

async function analyzeCuisineEmotions(supabase: any, userId: string, dateFilter: string): Promise<EmotionalInsight[]> {
  const { data: cuisineData } = await supabase
    .from('food_experiences')
    .select(`
      emotions,
      overall_rating,
      satisfaction_level,
      restaurants(cuisine_types)
    `)
    .eq('user_id', userId)
    .gte('experienced_at', `now() - interval '${dateFilter}'`)
    .not('restaurants.cuisine_types', 'is', null)

  if (!cuisineData || cuisineData.length === 0) {
    return []
  }

  const cuisineEmotions: Record<string, {
    emotions: string[],
    ratings: number[],
    satisfaction: number[]
  }> = {}

  cuisineData.forEach((exp: any) => {
    exp.restaurants.cuisine_types.forEach((cuisine: string) => {
      if (!cuisineEmotions[cuisine]) {
        cuisineEmotions[cuisine] = {
          emotions: [],
          ratings: [],
          satisfaction: []
        }
      }
      cuisineEmotions[cuisine].emotions.push(...exp.emotions)
      if (exp.overall_rating) cuisineEmotions[cuisine].ratings.push(exp.overall_rating)
      if (exp.satisfaction_level) cuisineEmotions[cuisine].satisfaction.push(exp.satisfaction_level)
    })
  })

  const insights: EmotionalInsight[] = []

  // Find most emotionally positive cuisine
  const cuisineScores = Object.entries(cuisineEmotions).map(([cuisine, data]) => {
    const positiveEmotions = data.emotions.filter(emotion => 
      ['happy', 'satisfied', 'excited', 'content', 'delighted'].includes(emotion)
    ).length
    const totalEmotions = data.emotions.length
    const avgRating = data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b) / data.ratings.length : 0
    const avgSatisfaction = data.satisfaction.length > 0 ? data.satisfaction.reduce((a, b) => a + b) / data.satisfaction.length : 0
    
    return {
      cuisine,
      positiveRatio: totalEmotions > 0 ? positiveEmotions / totalEmotions : 0,
      avgRating,
      avgSatisfaction,
      experienceCount: data.ratings.length
    }
  }).filter(item => item.experienceCount >= 3) // At least 3 experiences

  const topCuisine = cuisineScores.sort((a, b) => b.positiveRatio - a.positiveRatio)[0]

  if (topCuisine) {
    insights.push({
      type: 'cuisine_emotions',
      title: `Emotional Favorite: ${topCuisine.cuisine}`,
      description: `${topCuisine.cuisine} cuisine brings you the most joy with ${(topCuisine.positiveRatio * 100).toFixed(1)}% positive emotions.`,
      score: topCuisine.positiveRatio * 100,
      trend: 'stable',
      recommendations: [
        `Explore more ${topCuisine.cuisine} restaurants`,
        'Try cooking ${topCuisine.cuisine} dishes at home',
        'Share your ${topCuisine.cuisine} experiences with friends'
      ],
      data: {
        topCuisine,
        allCuisineScores: cuisineScores
      }
    })
  }

  return insights
}

async function analyzeSocialInfluence(supabase: any, userId: string, dateFilter: string): Promise<EmotionalInsight[]> {
  const { data: socialData } = await supabase
    .from('food_experiences')
    .select('dining_companions, overall_rating, satisfaction_level, emotions, special_occasion')
    .eq('user_id', userId)
    .gte('experienced_at', `now() - interval '${dateFilter}'`)

  if (!socialData || socialData.length === 0) {
    return []
  }

  const soloExperiences = socialData.filter(exp => exp.dining_companions === 0)
  const socialExperiences = socialData.filter(exp => exp.dining_companions > 0)
  const specialExperiences = socialData.filter(exp => exp.special_occasion)

  const insights: EmotionalInsight[] = []

  if (soloExperiences.length > 0 && socialExperiences.length > 0) {
    const soloSatisfaction = soloExperiences.reduce((sum, exp) => sum + (exp.satisfaction_level || 5), 0) / soloExperiences.length
    const socialSatisfaction = socialExperiences.reduce((sum, exp) => sum + (exp.satisfaction_level || 5), 0) / socialExperiences.length

    const prefersSocial = socialSatisfaction > soloSatisfaction

    insights.push({
      type: 'social_influence',
      title: prefersSocial ? 'Social Diner' : 'Solo Explorer',
      description: `You tend to be more satisfied when ${prefersSocial ? 'dining with others' : 'eating alone'} (${(prefersSocial ? socialSatisfaction : soloSatisfaction).toFixed(1)}/10 vs ${(prefersSocial ? soloSatisfaction : socialSatisfaction).toFixed(1)}/10).`,
      score: prefersSocial ? socialSatisfaction * 10 : soloSatisfaction * 10,
      trend: 'stable',
      recommendations: prefersSocial ? [
        'Plan more social dining experiences',
        'Try group dining at new restaurants',
        'Host dinner parties to combine food and socializing'
      ] : [
        'Embrace solo dining adventures',
        'Try counter seating at restaurants',
        'Explore cafes and bistros perfect for solo dining'
      ],
      data: {
        prefersSocial,
        soloSatisfaction,
        socialSatisfaction,
        soloCount: soloExperiences.length,
        socialCount: socialExperiences.length
      }
    })
  }

  return insights
}

function analyzeGroupedSatisfaction(data: any[], groupBy: string) {
  const grouped: Record<string, { ratings: number[], satisfaction: number[] }> = {}

  data.forEach(item => {
    const key = item[groupBy] || 'unknown'
    if (!grouped[key]) {
      grouped[key] = { ratings: [], satisfaction: [] }
    }
    if (item.overall_rating) grouped[key].ratings.push(item.overall_rating)
    if (item.satisfaction_level) grouped[key].satisfaction.push(item.satisfaction_level)
  })

  return Object.entries(grouped).reduce((acc, [key, values]) => {
    acc[key] = {
      avgRating: values.ratings.length > 0 ? values.ratings.reduce((a, b) => a + b) / values.ratings.length : 0,
      avgSatisfaction: values.satisfaction.length > 0 ? values.satisfaction.reduce((a, b) => a + b) / values.satisfaction.length : 0,
      count: values.ratings.length
    }
    return acc
  }, {} as Record<string, any>)
}

function analyzeSocialSatisfaction(data: any[]) {
  const solo = data.filter(item => item.dining_companions === 0)
  const small = data.filter(item => item.dining_companions >= 1 && item.dining_companions <= 3)
  const large = data.filter(item => item.dining_companions > 3)

  return {
    solo: {
      avgSatisfaction: solo.length > 0 ? solo.reduce((sum, exp) => sum + (exp.satisfaction_level || 5), 0) / solo.length : 0,
      count: solo.length
    },
    small: {
      avgSatisfaction: small.length > 0 ? small.reduce((sum, exp) => sum + (exp.satisfaction_level || 5), 0) / small.length : 0,
      count: small.length
    },
    large: {
      avgSatisfaction: large.length > 0 ? large.reduce((sum, exp) => sum + (exp.satisfaction_level || 5), 0) / large.length : 0,
      count: large.length
    }
  }
}

function getEmotionalRecommendations(trend: string, balance: number): string[] {
  const recommendations = []

  if (trend === 'declining' || balance < 60) {
    recommendations.push(
      'Try visiting restaurants that have given you joy in the past',
      'Consider exploring new cuisines that match your taste preferences',
      'Share meals with friends or family for positive social experiences'
    )
  }

  if (trend === 'improving' || balance > 80) {
    recommendations.push(
      'Continue exploring new dining experiences',
      'Consider keeping a gratitude journal for meals',
      'Share your positive food experiences with friends'
    )
  }

  if (balance >= 60 && balance <= 80) {
    recommendations.push(
      'You have a good emotional balance with food',
      'Try documenting what makes certain meals special',
      'Experiment with new restaurants in your favorite cuisines'
    )
  }

  return recommendations
}