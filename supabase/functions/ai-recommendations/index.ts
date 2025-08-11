/**
 * AI-Powered Recommendation Engine Edge Function
 * Generates personalized restaurant and dish recommendations using advanced ML algorithms
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendationRequest {
  userId: string;
  type: 'restaurants' | 'dishes' | 'experiences' | 'social_discovery';
  preferences?: {
    cuisines?: string[];
    priceRange?: number[];
    maxDistance?: number;
    dietaryRestrictions?: string[];
    moodContext?: string;
    socialContext?: 'solo' | 'date' | 'family' | 'friends' | 'business';
  };
  context?: {
    currentLocation?: { lat: number; lng: number };
    timeOfDay?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    weather?: string;
    mood?: string;
    recentExperiences?: string[];
  };
  limit?: number;
}

interface AIRecommendation {
  id: string;
  type: 'restaurant' | 'dish' | 'experience';
  title: string;
  description: string;
  imageUrl?: string;
  rating: number;
  priceRange?: number;
  cuisine?: string[];
  distance?: number;
  confidenceScore: number;
  reasoning: string[];
  emotionalMatch: number;
  personalityFit: number;
  metadata: Record<string, any>;
  actions: {
    viewDetails: string;
    addToWishlist: boolean;
    shareWithFriend: boolean;
    bookReservation?: string;
  };
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

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    await supabase.auth.setSession({ access_token: token, refresh_token: '' })
    
    const { data: user, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user.user) {
      throw new Error('Unauthorized')
    }

    const body: RecommendationRequest = await req.json()
    const { userId, type, preferences = {}, context = {}, limit = 10 } = body

    if (userId !== user.user.id) {
      throw new Error('Unauthorized to get recommendations for other users')
    }

    // Get user's comprehensive profile for AI analysis
    const userProfile = await getUserProfile(supabase, userId)
    
    let recommendations: AIRecommendation[] = []

    switch (type) {
      case 'restaurants':
        recommendations = await generateRestaurantRecommendations(supabase, userProfile, preferences, context, limit)
        break
      case 'dishes':
        recommendations = await generateDishRecommendations(supabase, userProfile, preferences, context, limit)
        break
      case 'experiences':
        recommendations = await generateExperienceRecommendations(supabase, userProfile, preferences, context, limit)
        break
      case 'social_discovery':
        recommendations = await generateSocialRecommendations(supabase, userProfile, preferences, context, limit)
        break
    }

    // Track recommendation generation for analytics
    await trackRecommendationGeneration(supabase, userId, type, recommendations.length, context)

    return new Response(
      JSON.stringify({ 
        recommendations,
        metadata: {
          generatedAt: new Date().toISOString(),
          userProfile: {
            tasteProfileCompleteness: userProfile.tasteProfileCompleteness,
            experienceCount: userProfile.experienceCount,
            friendCount: userProfile.friendCount
          },
          context: context
        }
      }),
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

async function getUserProfile(supabase: any, userId: string) {
  // Get comprehensive user profile data
  const [profileData, tasteProfile, preferences, recentExperiences, friendData, analytics] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('taste_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('recommendation_preferences').select('*').eq('user_id', userId).single(),
    supabase.from('food_experiences')
      .select(`
        *,
        taste_experiences(*),
        restaurants(*)
      `)
      .eq('user_id', userId)
      .order('experienced_at', { ascending: false })
      .limit(50),
    supabase.from('friendships')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted'),
    supabase.from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  ])

  return {
    profile: profileData.data,
    tasteProfile: tasteProfile.data,
    preferences: preferences.data,
    recentExperiences: recentExperiences.data || [],
    friends: friendData.data || [],
    analytics: analytics.data || [],
    tasteProfileCompleteness: calculateTasteProfileCompleteness(tasteProfile.data),
    experienceCount: recentExperiences.data?.length || 0,
    friendCount: friendData.data?.length || 0
  }
}

async function generateRestaurantRecommendations(
  supabase: any, 
  userProfile: any, 
  preferences: any, 
  context: any, 
  limit: number
): Promise<AIRecommendation[]> {
  
  // Get candidate restaurants using multiple strategies
  const [collaborativeRecs, contentBasedRecs, trendingRecs, locationRecs] = await Promise.all([
    getCollaborativeRestaurantRecommendations(supabase, userProfile, limit * 2),
    getContentBasedRestaurantRecommendations(supabase, userProfile, preferences, limit * 2),
    getTrendingRestaurantRecommendations(supabase, userProfile, context, limit),
    getLocationBasedRecommendations(supabase, userProfile, context, limit)
  ])

  // Combine and deduplicate recommendations
  const allCandidates = new Map()
  
  // Add collaborative filtering results with high weight
  collaborativeRecs.forEach((rec: any) => {
    allCandidates.set(rec.id, {
      ...rec,
      scores: { collaborative: rec.score, contentBased: 0, trending: 0, location: 0 }
    })
  })

  // Add content-based results
  contentBasedRecs.forEach((rec: any) => {
    if (allCandidates.has(rec.id)) {
      allCandidates.get(rec.id).scores.contentBased = rec.score
    } else {
      allCandidates.set(rec.id, {
        ...rec,
        scores: { collaborative: 0, contentBased: rec.score, trending: 0, location: 0 }
      })
    }
  })

  // Add trending and location scores
  trendingRecs.forEach((rec: any) => {
    if (allCandidates.has(rec.id)) {
      allCandidates.get(rec.id).scores.trending = rec.score
    }
  })

  locationRecs.forEach((rec: any) => {
    if (allCandidates.has(rec.id)) {
      allCandidates.get(rec.id).scores.location = rec.score
    }
  })

  // Calculate final scores using user's preference weights
  const weights = userProfile.preferences ? {
    collaborative: userProfile.preferences.friend_influence_weight || 0.3,
    contentBased: userProfile.preferences.taste_similarity_weight || 0.4,
    trending: userProfile.preferences.trending_factor_weight || 0.1,
    location: userProfile.preferences.location_proximity_weight || 0.2
  } : { collaborative: 0.3, contentBased: 0.4, trending: 0.1, location: 0.2 }

  const recommendations: AIRecommendation[] = []

  for (const [restaurantId, candidate] of allCandidates) {
    const finalScore = 
      candidate.scores.collaborative * weights.collaborative +
      candidate.scores.contentBased * weights.contentBased +
      candidate.scores.trending * weights.trending +
      candidate.scores.location * weights.location

    // Get restaurant details
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select(`
        *,
        restaurant_reviews(*),
        menu_items(*)
      `)
      .eq('id', restaurantId)
      .single()

    if (restaurant && finalScore > 0.3) { // Minimum confidence threshold
      const emotionalMatch = calculateEmotionalMatch(restaurant, userProfile, context)
      const personalityFit = calculatePersonalityFit(restaurant, userProfile)
      
      recommendations.push({
        id: restaurantId,
        type: 'restaurant',
        title: restaurant.name,
        description: generateRestaurantDescription(restaurant, candidate.reasoning),
        imageUrl: restaurant.photos?.[0],
        rating: restaurant.rating || 0,
        priceRange: restaurant.price_range,
        cuisine: restaurant.cuisine_types,
        distance: candidate.distance,
        confidenceScore: Math.min(finalScore, 1.0),
        reasoning: generateReasoning(candidate.scores, userProfile, context),
        emotionalMatch: emotionalMatch,
        personalityFit: personalityFit,
        metadata: {
          restaurant,
          scores: candidate.scores,
          finalScore,
          recommendationSources: Object.keys(candidate.scores).filter(key => candidate.scores[key] > 0)
        },
        actions: {
          viewDetails: `/restaurants/${restaurantId}`,
          addToWishlist: true,
          shareWithFriend: true,
          bookReservation: restaurant.reservation_required ? `/book/${restaurantId}` : undefined
        }
      })
    }
  }

  // Sort by final score and apply contextual boosts
  return recommendations
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit)
    .map(rec => applyContextualBoosts(rec, context, userProfile))
}

async function generateDishRecommendations(
  supabase: any,
  userProfile: any,
  preferences: any,
  context: any,
  limit: number
): Promise<AIRecommendation[]> {
  
  // Analyze user's taste patterns from past experiences
  const tasteSignature = analyzeTasteSignature(userProfile.recentExperiences)
  
  // Get menu items that match taste signature
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select(`
      *,
      restaurants(*)
    `)
    .eq('is_available', true)
    .not('restaurant_id', 'in', `(${userProfile.recentExperiences.map(exp => exp.restaurant_id).filter(Boolean).join(',')})`)
    .limit(limit * 5)

  if (!menuItems || menuItems.length === 0) {
    return []
  }

  const recommendations: AIRecommendation[] = []

  for (const item of menuItems) {
    // Calculate dish compatibility
    const tasteCompatibility = calculateDishCompatibility(item, tasteSignature, userProfile.tasteProfile)
    const dietaryCompatibility = checkDietaryCompatibility(item, userProfile.profile)
    const noveltyScore = calculateNoveltyScore(item, userProfile.recentExperiences)
    
    if (tasteCompatibility > 0.6 && dietaryCompatibility) {
      const finalScore = (tasteCompatibility * 0.6) + (noveltyScore * 0.4)
      
      recommendations.push({
        id: item.id,
        type: 'dish',
        title: item.name,
        description: generateDishDescription(item, tasteCompatibility),
        imageUrl: item.image_urls?.[0],
        rating: 0, // Will be predicted
        priceRange: item.restaurants?.price_range,
        cuisine: item.restaurants?.cuisine_types,
        distance: null,
        confidenceScore: finalScore,
        reasoning: [
          `${(tasteCompatibility * 100).toFixed(0)}% taste compatibility`,
          `Matches your preference for ${getTopTastePreferences(userProfile.tasteProfile).join(', ')}`,
          `New ${item.restaurants?.cuisine_types?.[0]} experience`
        ],
        emotionalMatch: predictEmotionalResponse(item, userProfile),
        personalityFit: calculateDishPersonalityFit(item, userProfile),
        metadata: {
          menuItem: item,
          restaurant: item.restaurants,
          tasteCompatibility,
          noveltyScore,
          predictedRating: predictDishRating(item, userProfile)
        },
        actions: {
          viewDetails: `/restaurants/${item.restaurant_id}/menu/${item.id}`,
          addToWishlist: true,
          shareWithFriend: true
        }
      })
    }
  }

  return recommendations
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit)
}

async function generateExperienceRecommendations(
  supabase: any,
  userProfile: any,
  preferences: any,
  context: any,
  limit: number
): Promise<AIRecommendation[]> {
  
  // Generate experiential recommendations (food events, cooking classes, etc.)
  const recommendations: AIRecommendation[] = []

  // Analyze user's experience patterns
  const experiencePatterns = analyzeExperiencePatterns(userProfile.recentExperiences)
  
  // Recommend based on gaps in experience
  const missingExperiences = identifyMissingExperiences(experiencePatterns, userProfile.tasteProfile)
  
  for (const experience of missingExperiences.slice(0, limit)) {
    recommendations.push({
      id: `exp-${Date.now()}-${Math.random()}`,
      type: 'experience',
      title: experience.title,
      description: experience.description,
      rating: 0,
      confidenceScore: experience.confidence,
      reasoning: experience.reasoning,
      emotionalMatch: experience.emotionalMatch,
      personalityFit: experience.personalityFit,
      metadata: experience.metadata,
      actions: {
        viewDetails: experience.actionUrl,
        addToWishlist: true,
        shareWithFriend: true
      }
    })
  }

  return recommendations
}

async function generateSocialRecommendations(
  supabase: any,
  userProfile: any,
  preferences: any,
  context: any,
  limit: number
): Promise<AIRecommendation[]> {
  
  // Get friend activity and generate social discovery recommendations
  const friendIds = userProfile.friends.map((f: any) => 
    f.requester_id === userProfile.profile.id ? f.addressee_id : f.requester_id
  )

  if (friendIds.length === 0) {
    return []
  }

  const { data: friendExperiences } = await supabase
    .from('food_experiences')
    .select(`
      *,
      user_profiles(display_name),
      restaurants(*),
      shared_experiences(*)
    `)
    .in('user_id', friendIds)
    .gte('experienced_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .gte('overall_rating', 4)
    .order('experienced_at', { ascending: false })
    .limit(limit * 3)

  const recommendations: AIRecommendation[] = []

  if (friendExperiences) {
    for (const experience of friendExperiences) {
      // Check if user hasn't been to this restaurant
      const hasVisited = userProfile.recentExperiences.some(
        (exp: any) => exp.restaurant_id === experience.restaurant_id
      )

      if (!hasVisited && experience.restaurants) {
        const socialScore = calculateSocialRelevanceScore(experience, userProfile)
        
        if (socialScore > 0.6) {
          recommendations.push({
            id: `social-${experience.id}`,
            type: 'restaurant',
            title: experience.restaurants.name,
            description: `${experience.user_profiles?.display_name || 'Your friend'} loved their ${experience.dish_name} here (${experience.overall_rating}/5 stars)`,
            imageUrl: experience.photos?.[0] || experience.restaurants.photos?.[0],
            rating: experience.overall_rating,
            priceRange: experience.restaurants.price_range,
            cuisine: experience.restaurants.cuisine_types,
            confidenceScore: socialScore,
            reasoning: [
              `Recommended by ${experience.user_profiles?.display_name || 'your friend'}`,
              `They rated it ${experience.overall_rating}/5 stars`,
              `${experience.emotions?.join(', ') || 'Positive experience'}`,
              'Great for social dining'
            ],
            emotionalMatch: 0.8, // High for social recommendations
            personalityFit: calculatePersonalityFit(experience.restaurants, userProfile),
            metadata: {
              friendExperience: experience,
              friend: experience.user_profiles,
              restaurant: experience.restaurants
            },
            actions: {
              viewDetails: `/restaurants/${experience.restaurant_id}`,
              addToWishlist: true,
              shareWithFriend: true,
              bookReservation: `/book/${experience.restaurant_id}`
            }
          })
        }
      }
    }
  }

  return recommendations
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit)
}

// Helper functions for ML calculations

function calculateTasteProfileCompleteness(tasteProfile: any): number {
  if (!tasteProfile) return 0
  
  const fields = [
    'salty_preference', 'sweet_preference', 'sour_preference', 
    'bitter_preference', 'umami_preference', 'crunchy_preference',
    'creamy_preference', 'chewy_preference', 'hot_food_preference', 
    'cold_food_preference', 'culinary_adventurousness'
  ]
  
  const completedFields = fields.filter(field => tasteProfile[field] !== null && tasteProfile[field] !== undefined)
  return completedFields.length / fields.length
}

function analyzeTasteSignature(experiences: any[]): Record<string, number> {
  const signature: Record<string, number> = {
    avgSaltiness: 0,
    avgSweetness: 0,
    avgSourness: 0,
    avgBitterness: 0,
    avgUmami: 0,
    avgSpiceHeat: 0,
    preferredTextures: {},
    emotionalResponses: {}
  }

  if (experiences.length === 0) return signature

  const tasteSums = { saltiness: 0, sweetness: 0, sourness: 0, bitterness: 0, umami: 0, spiceHeat: 0 }
  let tasteCount = 0

  experiences.forEach(exp => {
    if (exp.taste_experiences && exp.taste_experiences.length > 0) {
      exp.taste_experiences.forEach((taste: any) => {
        if (taste.saltiness) { tasteSums.saltiness += taste.saltiness; tasteCount++ }
        if (taste.sweetness) { tasteSums.sweetness += taste.sweetness; tasteCount++ }
        if (taste.sourness) { tasteSums.sourness += taste.sourness; tasteCount++ }
        if (taste.bitterness) { tasteSums.bitterness += taste.bitterness; tasteCount++ }
        if (taste.umami) { tasteSums.umami += taste.umami; tasteCount++ }
        if (taste.spice_heat) { tasteSums.spiceHeat += taste.spice_heat; tasteCount++ }
      })
    }

    // Analyze emotional responses
    if (exp.emotions) {
      exp.emotions.forEach((emotion: string) => {
        signature.emotionalResponses[emotion] = (signature.emotionalResponses[emotion] || 0) + 1
      })
    }
  })

  if (tasteCount > 0) {
    signature.avgSaltiness = tasteSums.saltiness / tasteCount
    signature.avgSweetness = tasteSums.sweetness / tasteCount
    signature.avgSourness = tasteSums.sourness / tasteCount
    signature.avgBitterness = tasteSums.bitterness / tasteCount
    signature.avgUmami = tasteSums.umami / tasteCount
    signature.avgSpiceHeat = tasteSums.spiceHeat / tasteCount
  }

  return signature
}

function calculateDishCompatibility(dish: any, tasteSignature: any, userTasteProfile: any): number {
  let compatibility = 0.5 // Base compatibility

  // Dietary restrictions check
  if (userTasteProfile && dish.is_vegetarian && userTasteProfile.dietary_restrictions?.includes('vegetarian')) {
    compatibility += 0.2
  }

  // Spice level compatibility
  if (dish.spice_level && userTasteProfile?.spice_tolerance) {
    const spiceDiff = Math.abs(dish.spice_level - (userTasteProfile.spice_tolerance / 2))
    compatibility += (5 - spiceDiff) / 5 * 0.3
  }

  return Math.min(compatibility, 1.0)
}

function predictEmotionalResponse(dish: any, userProfile: any): number {
  // Predict emotional satisfaction based on user's past patterns
  let emotionalScore = 0.5

  // Check if dish matches positive emotional triggers
  if (userProfile.recentExperiences) {
    const positiveExps = userProfile.recentExperiences.filter((exp: any) => 
      exp.overall_rating >= 4 && exp.emotions?.some((e: string) => ['happy', 'satisfied', 'excited'].includes(e))
    )

    // Look for similar cuisine types or ingredients
    const dishCuisine = dish.restaurants?.cuisine_types || []
    const positivelyRatedCuisines = positiveExps
      .filter((exp: any) => exp.restaurants?.cuisine_types)
      .flatMap((exp: any) => exp.restaurants.cuisine_types)

    const cuisineMatch = dishCuisine.some(cuisine => positivelyRatedCuisines.includes(cuisine))
    if (cuisineMatch) emotionalScore += 0.3
  }

  return Math.min(emotionalScore, 1.0)
}

// Additional helper functions would continue here...

function getCollaborativeRestaurantRecommendations(supabase: any, userProfile: any, limit: number): Promise<any[]> {
  // Implement collaborative filtering logic
  return Promise.resolve([])
}

function getContentBasedRestaurantRecommendations(supabase: any, userProfile: any, preferences: any, limit: number): Promise<any[]> {
  // Implement content-based filtering logic
  return Promise.resolve([])
}

function getTrendingRestaurantRecommendations(supabase: any, userProfile: any, context: any, limit: number): Promise<any[]> {
  // Implement trending analysis logic
  return Promise.resolve([])
}

function getLocationBasedRecommendations(supabase: any, userProfile: any, context: any, limit: number): Promise<any[]> {
  // Implement location-based logic
  return Promise.resolve([])
}

function calculateEmotionalMatch(restaurant: any, userProfile: any, context: any): number {
  return 0.7 // Placeholder
}

function calculatePersonalityFit(restaurant: any, userProfile: any): number {
  return 0.8 // Placeholder
}

function generateRestaurantDescription(restaurant: any, reasoning: string[]): string {
  return `${restaurant.description || 'A great dining experience'} - ${reasoning.join(', ')}`
}

function generateReasoning(scores: any, userProfile: any, context: any): string[] {
  const reasons = []
  if (scores.collaborative > 0.5) reasons.push('Loved by users with similar tastes')
  if (scores.contentBased > 0.5) reasons.push('Matches your taste preferences')
  if (scores.trending > 0.3) reasons.push('Currently trending')
  if (scores.location > 0.4) reasons.push('Convenient location')
  return reasons
}

function applyContextualBoosts(rec: AIRecommendation, context: any, userProfile: any): AIRecommendation {
  // Apply contextual boosts based on time, weather, mood, etc.
  return rec
}

async function trackRecommendationGeneration(supabase: any, userId: string, type: string, count: number, context: any) {
  await supabase
    .from('recommendation_interactions')
    .insert({
      user_id: userId,
      recommendation_type: `ai_${type}`,
      recommendation_context: { 
        generatedCount: count, 
        context,
        timestamp: new Date().toISOString()
      },
      shown_at: new Date().toISOString()
    })
}

// Additional helper function implementations would continue here...
function generateDishDescription(item: any, tasteCompatibility: number): string {
  return `${item.description || item.name} - ${(tasteCompatibility * 100).toFixed(0)}% taste match`
}

function getTopTastePreferences(tasteProfile: any): string[] {
  if (!tasteProfile) return ['balanced flavors']
  
  const preferences = [
    { name: 'salty', value: tasteProfile.salty_preference },
    { name: 'sweet', value: tasteProfile.sweet_preference },
    { name: 'sour', value: tasteProfile.sour_preference },
    { name: 'bitter', value: tasteProfile.bitter_preference },
    { name: 'umami', value: tasteProfile.umami_preference }
  ].filter(p => p.value && p.value > 7)
   .sort((a, b) => b.value - a.value)
   .slice(0, 3)
   .map(p => p.name)

  return preferences.length > 0 ? preferences : ['balanced flavors']
}

function checkDietaryCompatibility(item: any, profile: any): boolean {
  if (!profile?.dietary_restrictions) return true
  
  const restrictions = profile.dietary_restrictions
  
  if (restrictions.includes('vegetarian') && !item.is_vegetarian) return false
  if (restrictions.includes('vegan') && !item.is_vegan) return false
  if (restrictions.includes('gluten_free') && !item.is_gluten_free) return false
  
  return true
}

function calculateNoveltyScore(item: any, recentExperiences: any[]): number {
  // Calculate how novel this dish is compared to recent experiences
  const similarDishes = recentExperiences.filter(exp => 
    exp.dish_name && item.name && 
    (exp.dish_name.toLowerCase().includes(item.name.toLowerCase()) || 
     item.name.toLowerCase().includes(exp.dish_name.toLowerCase()))
  )
  
  const cuisineMatch = recentExperiences.some(exp =>
    exp.restaurants?.cuisine_types?.some(cuisine => 
      item.restaurants?.cuisine_types?.includes(cuisine)
    )
  )

  let noveltyScore = 0.5
  if (similarDishes.length === 0) noveltyScore += 0.3
  if (!cuisineMatch) noveltyScore += 0.2
  
  return Math.min(noveltyScore, 1.0)
}

function predictDishRating(item: any, userProfile: any): number {
  // Predict what the user would rate this dish
  return 4.0 // Placeholder - would use ML model
}

function calculateDishPersonalityFit(item: any, userProfile: any): number {
  return 0.75 // Placeholder
}

function analyzeExperiencePatterns(experiences: any[]): any {
  return {
    cuisineVariety: [],
    mealTimePreferences: {},
    socialPatterns: {},
    seasonalTrends: {}
  }
}

function identifyMissingExperiences(patterns: any, tasteProfile: any): any[] {
  return [
    {
      title: "Try a cooking class",
      description: "Based on your taste preferences, a Japanese cuisine class would enhance your culinary journey",
      confidence: 0.8,
      reasoning: ["Matches your umami preferences", "Expands cooking skills", "Social experience"],
      emotionalMatch: 0.9,
      personalityFit: 0.8,
      metadata: { type: 'cooking_class', cuisine: 'japanese' },
      actionUrl: '/experiences/cooking-classes'
    }
  ]
}

function calculateSocialRelevanceScore(experience: any, userProfile: any): number {
  let score = 0.5
  
  // Higher score for highly rated experiences
  if (experience.overall_rating >= 4.5) score += 0.2
  if (experience.overall_rating >= 4) score += 0.1
  
  // Boost for positive emotions
  if (experience.emotions?.some((e: string) => ['happy', 'excited', 'satisfied'].includes(e))) {
    score += 0.2
  }
  
  // Check cuisine compatibility
  const userLikedCuisines = userProfile.recentExperiences
    .filter((exp: any) => exp.overall_rating >= 4)
    .flatMap((exp: any) => exp.restaurants?.cuisine_types || [])
  
  if (experience.restaurants?.cuisine_types?.some(cuisine => userLikedCuisines.includes(cuisine))) {
    score += 0.1
  }
  
  return Math.min(score, 1.0)
}