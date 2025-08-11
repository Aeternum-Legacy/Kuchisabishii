/**
 * Advanced Search & Discovery Engine for Kuchisabishii
 * Provides intelligent search with ML ranking, semantic matching, and personalized results
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query: string;
  type: 'global' | 'restaurants' | 'dishes' | 'experiences' | 'users' | 'semantic';
  filters?: {
    cuisine?: string[];
    priceRange?: number[];
    rating?: { min: number; max: number };
    distance?: { lat: number; lng: number; radius: number };
    dietary?: string[];
    moodContext?: string;
    socialContext?: string;
    timeContext?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    dateRange?: { start: string; end: string };
    emotions?: string[];
    ingredients?: string[];
    exclude?: string[];
  };
  personalization?: {
    useHistory?: boolean;
    useTasteProfile?: boolean;
    useSocialSignals?: boolean;
    useLocationPrefs?: boolean;
  };
  ranking?: {
    algorithm: 'relevance' | 'popularity' | 'personalized' | 'hybrid' | 'ml_enhanced';
    weights?: {
      textMatch?: number;
      personalRelevance?: number;
      socialSignals?: number;
      recency?: number;
      quality?: number;
      diversity?: number;
    };
  };
  pagination?: {
    page: number;
    limit: number;
  };
  aggregations?: {
    facets?: boolean;
    suggestions?: boolean;
    trends?: boolean;
    related?: boolean;
  };
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    nextPage?: number;
  };
  facets?: SearchFacets;
  suggestions?: string[];
  trends?: TrendingItem[];
  related?: RelatedQuery[];
  searchMetadata: {
    query: string;
    processingTime: number;
    algorithm: string;
    personalized: boolean;
    resultsSource: string[];
  };
}

interface SearchResult {
  id: string;
  type: 'restaurant' | 'dish' | 'experience' | 'user';
  title: string;
  description: string;
  imageUrl?: string;
  rating?: number;
  metadata: Record<string, any>;
  score: {
    relevance: number;
    personalization: number;
    quality: number;
    popularity: number;
    final: number;
  };
  highlights: string[];
  reasons: string[];
  actions: {
    primary: string;
    secondary?: string[];
  };
  context?: {
    distance?: number;
    priceRange?: number;
    matchingTags: string[];
    emotionalMatch?: number;
    friendActivity?: boolean;
  };
}

interface SearchFacets {
  cuisines: Array<{ name: string; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
  ratings: Array<{ range: string; count: number }>;
  locations: Array<{ area: string; count: number }>;
  dietary: Array<{ type: string; count: number }>;
  emotions: Array<{ emotion: string; count: number }>;
}

interface TrendingItem {
  query: string;
  count: number;
  trend: 'rising' | 'stable' | 'falling';
  category: string;
}

interface RelatedQuery {
  query: string;
  relevance: number;
  type: 'similar' | 'broader' | 'narrower' | 'alternative';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    let user = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: userData } = await supabase.auth.getUser(token)
      user = userData?.user
    }

    const body: SearchRequest = await req.json()
    
    // Validate and sanitize search query
    if (!body.query || body.query.trim().length === 0) {
      throw new Error('Search query is required')
    }

    const sanitizedQuery = sanitizeSearchQuery(body.query)
    
    // Log search query for analytics
    if (user) {
      await logSearchQuery(supabase, user.id, body)
    }

    // Perform search based on type and algorithm
    const searchResults = await performAdvancedSearch(supabase, body, user)
    
    // Apply ML ranking if requested
    if (body.ranking?.algorithm === 'ml_enhanced' && user) {
      await enhanceResultsWithML(supabase, searchResults, user.id, body)
    }

    // Generate aggregations if requested
    let facets, suggestions, trends, related
    if (body.aggregations) {
      if (body.aggregations.facets) {
        facets = await generateSearchFacets(supabase, body, searchResults.rawResults)
      }
      if (body.aggregations.suggestions) {
        suggestions = await generateSearchSuggestions(supabase, sanitizedQuery, user?.id)
      }
      if (body.aggregations.trends) {
        trends = await getTrendingQueries(supabase)
      }
      if (body.aggregations.related) {
        related = await getRelatedQueries(supabase, sanitizedQuery)
      }
    }

    const response: SearchResponse = {
      results: searchResults.results,
      totalCount: searchResults.totalCount,
      pagination: {
        page: body.pagination?.page || 1,
        limit: body.pagination?.limit || 20,
        hasMore: searchResults.hasMore,
        nextPage: searchResults.hasMore ? (body.pagination?.page || 1) + 1 : undefined
      },
      facets,
      suggestions,
      trends,
      related,
      searchMetadata: {
        query: sanitizedQuery,
        processingTime: Date.now() - startTime,
        algorithm: body.ranking?.algorithm || 'relevance',
        personalized: !!user && (body.personalization?.useHistory || body.personalization?.useTasteProfile),
        resultsSource: searchResults.sources
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        processingTime: Date.now() - startTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function performAdvancedSearch(
  supabase: any, 
  request: SearchRequest, 
  user: any
): Promise<{ results: SearchResult[]; totalCount: number; hasMore: boolean; sources: string[]; rawResults: any[] }> {
  
  const { query, type, filters = {}, personalization = {}, ranking = { algorithm: 'relevance' }, pagination = { page: 1, limit: 20 } } = request
  
  let results: SearchResult[] = []
  let totalCount = 0
  let sources: string[] = []
  let rawResults: any[] = []

  // Determine search strategy based on type
  switch (type) {
    case 'restaurants':
      const restaurantResults = await searchRestaurants(supabase, query, filters, personalization, user, pagination)
      results = restaurantResults.results
      totalCount = restaurantResults.totalCount
      rawResults = restaurantResults.raw
      sources.push('restaurants')
      break

    case 'dishes':
      const dishResults = await searchDishes(supabase, query, filters, personalization, user, pagination)
      results = dishResults.results
      totalCount = dishResults.totalCount
      rawResults = dishResults.raw
      sources.push('dishes', 'menu_items')
      break

    case 'experiences':
      const experienceResults = await searchExperiences(supabase, query, filters, personalization, user, pagination)
      results = experienceResults.results
      totalCount = experienceResults.totalCount
      rawResults = experienceResults.raw
      sources.push('food_experiences')
      break

    case 'users':
      const userResults = await searchUsers(supabase, query, filters, user, pagination)
      results = userResults.results
      totalCount = userResults.totalCount
      rawResults = userResults.raw
      sources.push('users')
      break

    case 'semantic':
      const semanticResults = await performSemanticSearch(supabase, query, filters, personalization, user, pagination)
      results = semanticResults.results
      totalCount = semanticResults.totalCount
      rawResults = semanticResults.raw
      sources.push('semantic_analysis')
      break

    case 'global':
    default:
      const globalResults = await performGlobalSearch(supabase, query, filters, personalization, user, pagination)
      results = globalResults.results
      totalCount = globalResults.totalCount
      rawResults = globalResults.raw
      sources = globalResults.sources
      break
  }

  // Apply ranking algorithm
  results = await applyRankingAlgorithm(results, ranking, user, request)

  const hasMore = totalCount > (pagination.page * pagination.limit)

  return { results, totalCount, hasMore, sources, rawResults }
}

async function searchRestaurants(
  supabase: any,
  query: string,
  filters: any,
  personalization: any,
  user: any,
  pagination: any
): Promise<{ results: SearchResult[]; totalCount: number; raw: any[] }> {
  
  let queryBuilder = supabase
    .from('restaurants')
    .select(`
      *,
      reviews:restaurant_reviews(*),
      menu_items(*)
    `, { count: 'exact' })

  // Apply text search
  if (query.trim()) {
    queryBuilder = queryBuilder.textSearch('search_vector', query.trim(), {
      type: 'websearch',
      config: 'english'
    })
  }

  // Apply filters
  if (filters.cuisine?.length) {
    queryBuilder = queryBuilder.overlaps('cuisine_types', filters.cuisine)
  }

  if (filters.priceRange?.length) {
    queryBuilder = queryBuilder.in('price_range', filters.priceRange)
  }

  if (filters.rating) {
    if (filters.rating.min) queryBuilder = queryBuilder.gte('rating', filters.rating.min)
    if (filters.rating.max) queryBuilder = queryBuilder.lte('rating', filters.rating.max)
  }

  // Location-based filtering
  if (filters.distance && filters.distance.lat && filters.distance.lng) {
    // Add PostGIS distance filtering here
    queryBuilder = queryBuilder.not('latitude', 'is', null)
      .not('longitude', 'is', null)
  }

  // Apply pagination
  const offset = (pagination.page - 1) * pagination.limit
  queryBuilder = queryBuilder.range(offset, offset + pagination.limit - 1)

  const { data: restaurants, error, count } = await queryBuilder

  if (error) {
    throw new Error(`Restaurant search failed: ${error.message}`)
  }

  const results: SearchResult[] = (restaurants || []).map((restaurant: any) => ({
    id: restaurant.id,
    type: 'restaurant' as const,
    title: restaurant.name,
    description: restaurant.description || `${restaurant.cuisine_types.join(', ')} restaurant`,
    imageUrl: restaurant.photos?.[0],
    rating: restaurant.rating,
    metadata: {
      restaurant,
      cuisine: restaurant.cuisine_types,
      priceRange: restaurant.price_range,
      location: {
        address: restaurant.address,
        city: restaurant.city,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      }
    },
    score: {
      relevance: calculateTextRelevance(query, restaurant),
      personalization: await calculatePersonalizationScore(supabase, restaurant, user, personalization),
      quality: restaurant.rating / 5,
      popularity: Math.min(restaurant.review_count / 100, 1),
      final: 0 // Will be calculated by ranking algorithm
    },
    highlights: generateHighlights(query, restaurant),
    reasons: await generateReasons(supabase, restaurant, user, personalization),
    actions: {
      primary: `/restaurants/${restaurant.id}`,
      secondary: [`/restaurants/${restaurant.id}/menu`, `/restaurants/${restaurant.id}/reviews`]
    },
    context: {
      priceRange: restaurant.price_range,
      matchingTags: findMatchingTags(query, restaurant.cuisine_types.concat(restaurant.amenities || [])),
      distance: filters.distance ? calculateDistance(filters.distance, restaurant) : undefined
    }
  }))

  return { results, totalCount: count || 0, raw: restaurants || [] }
}

async function searchDishes(
  supabase: any,
  query: string,
  filters: any,
  personalization: any,
  user: any,
  pagination: any
): Promise<{ results: SearchResult[]; totalCount: number; raw: any[] }> {
  
  // Search in both menu_items and food_experiences
  const menuItemsPromise = supabase
    .from('menu_items')
    .select(`
      *,
      restaurants(*)
    `, { count: 'exact' })
    .textSearch('name', query.trim())
    .eq('is_available', true)
    .range((pagination.page - 1) * Math.floor(pagination.limit / 2), Math.floor(pagination.limit / 2) - 1)

  const experiencesPromise = supabase
    .from('food_experiences')
    .select(`
      *,
      restaurants(*),
      emotional_experiences(*)
    `, { count: 'exact' })
    .textSearch('search_vector', query.trim())
    .eq('is_private', false)
    .range((pagination.page - 1) * Math.floor(pagination.limit / 2), Math.floor(pagination.limit / 2) - 1)

  const [menuItemsResult, experiencesResult] = await Promise.all([menuItemsPromise, experiencesPromise])

  if (menuItemsResult.error || experiencesResult.error) {
    throw new Error('Dish search failed')
  }

  const menuItems = menuItemsResult.data || []
  const experiences = experiencesResult.data || []

  const results: SearchResult[] = []

  // Process menu items
  menuItems.forEach((item: any) => {
    results.push({
      id: `menu_${item.id}`,
      type: 'dish' as const,
      title: item.name,
      description: item.description || `${item.category} from ${item.restaurants?.name}`,
      imageUrl: item.image_urls?.[0],
      metadata: {
        menuItem: item,
        restaurant: item.restaurants,
        type: 'menu_item'
      },
      score: {
        relevance: calculateTextRelevance(query, item),
        personalization: await calculateDishPersonalizationScore(supabase, item, user, personalization),
        quality: 0.8, // Default for menu items
        popularity: 0.6,
        final: 0
      },
      highlights: generateHighlights(query, item),
      reasons: [`Available at ${item.restaurants?.name}`, `${item.category} option`],
      actions: {
        primary: `/restaurants/${item.restaurant_id}/menu/${item.id}`,
        secondary: [`/restaurants/${item.restaurant_id}`]
      },
      context: {
        priceRange: item.restaurants?.price_range,
        matchingTags: findMatchingTags(query, [item.name, item.category, ...(item.ingredients || [])])
      }
    })
  })

  // Process food experiences
  experiences.forEach((exp: any) => {
    results.push({
      id: `exp_${exp.id}`,
      type: 'experience' as const,
      title: exp.dish_name,
      description: `${exp.overall_rating}/5 stars - ${exp.custom_notes || 'Great experience'}`,
      imageUrl: exp.photos?.[0],
      rating: exp.overall_rating,
      metadata: {
        experience: exp,
        restaurant: exp.restaurants,
        type: 'food_experience'
      },
      score: {
        relevance: calculateTextRelevance(query, exp),
        personalization: await calculateExperiencePersonalizationScore(supabase, exp, user, personalization),
        quality: exp.overall_rating / 5,
        popularity: 0.7,
        final: 0
      },
      highlights: generateHighlights(query, exp),
      reasons: [
        `Rated ${exp.overall_rating}/5 stars`,
        exp.restaurants ? `From ${exp.restaurants.name}` : 'Personal experience'
      ],
      actions: {
        primary: `/experiences/${exp.id}`,
        secondary: exp.restaurant_id ? [`/restaurants/${exp.restaurant_id}`] : []
      },
      context: {
        emotionalMatch: exp.emotional_experiences?.[0] ? 
          calculateEmotionalRelevance(exp.emotional_experiences[0], user) : undefined,
        matchingTags: findMatchingTags(query, [exp.dish_name, ...(exp.emotions || [])])
      }
    })
  })

  const totalCount = (menuItemsResult.count || 0) + (experiencesResult.count || 0)
  const rawResults = [...menuItems, ...experiences]

  return { results, totalCount, raw: rawResults }
}

async function searchExperiences(
  supabase: any,
  query: string,
  filters: any,
  personalization: any,
  user: any,
  pagination: any
): Promise<{ results: SearchResult[]; totalCount: number; raw: any[] }> {
  
  let queryBuilder = supabase
    .from('food_experiences')
    .select(`
      *,
      restaurants(*),
      users!inner(display_name),
      emotional_experiences(*),
      taste_experiences(*)
    `, { count: 'exact' })

  // Apply text search
  if (query.trim()) {
    queryBuilder = queryBuilder.textSearch('search_vector', query.trim())
  }

  // Privacy filters
  queryBuilder = queryBuilder.eq('is_private', false)

  // Apply emotion filters
  if (filters.emotions?.length) {
    queryBuilder = queryBuilder.overlaps('emotions', filters.emotions)
  }

  // Date range filters
  if (filters.dateRange) {
    if (filters.dateRange.start) {
      queryBuilder = queryBuilder.gte('experienced_at', filters.dateRange.start)
    }
    if (filters.dateRange.end) {
      queryBuilder = queryBuilder.lte('experienced_at', filters.dateRange.end)
    }
  }

  // Rating filters
  if (filters.rating) {
    if (filters.rating.min) queryBuilder = queryBuilder.gte('overall_rating', filters.rating.min)
    if (filters.rating.max) queryBuilder = queryBuilder.lte('overall_rating', filters.rating.max)
  }

  // Meal time filters
  if (filters.timeContext) {
    queryBuilder = queryBuilder.eq('meal_time', filters.timeContext)
  }

  // Apply pagination
  const offset = (pagination.page - 1) * pagination.limit
  queryBuilder = queryBuilder
    .order('experienced_at', { ascending: false })
    .range(offset, offset + pagination.limit - 1)

  const { data: experiences, error, count } = await queryBuilder

  if (error) {
    throw new Error(`Experience search failed: ${error.message}`)
  }

  const results: SearchResult[] = (experiences || []).map((exp: any) => ({
    id: exp.id,
    type: 'experience' as const,
    title: exp.dish_name,
    description: generateExperienceDescription(exp),
    imageUrl: exp.photos?.[0],
    rating: exp.overall_rating,
    metadata: {
      experience: exp,
      restaurant: exp.restaurants,
      user: exp.users,
      emotions: exp.emotions,
      mealTime: exp.meal_time
    },
    score: {
      relevance: calculateTextRelevance(query, exp),
      personalization: await calculateExperiencePersonalizationScore(supabase, exp, user, personalization),
      quality: exp.overall_rating / 5,
      popularity: 0.6,
      final: 0
    },
    highlights: generateHighlights(query, exp),
    reasons: generateExperienceReasons(exp, user),
    actions: {
      primary: `/experiences/${exp.id}`,
      secondary: exp.restaurant_id ? [`/restaurants/${exp.restaurant_id}`] : []
    },
    context: {
      emotionalMatch: exp.emotional_experiences?.[0] ?
        calculateEmotionalRelevance(exp.emotional_experiences[0], user) : undefined,
      matchingTags: findMatchingTags(query, [exp.dish_name, ...(exp.emotions || [])]),
      priceRange: exp.restaurants?.price_range
    }
  }))

  return { results, totalCount: count || 0, raw: experiences || [] }
}

async function searchUsers(
  supabase: any,
  query: string,
  filters: any,
  user: any,
  pagination: any
): Promise<{ results: SearchResult[]; totalCount: number; raw: any[] }> {
  
  let queryBuilder = supabase
    .from('users')
    .select(`
      *,
      user_preferences(*),
      food_experiences(count)
    `, { count: 'exact' })

  // Search by username or display name
  if (query.trim()) {
    queryBuilder = queryBuilder.or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
  }

  // Privacy filters - only show public profiles or friends
  if (user) {
    queryBuilder = queryBuilder.or(`privacy_level.eq.public,id.in.(
      SELECT CASE 
        WHEN requester_id = '${user.id}' THEN addressee_id
        ELSE requester_id
      END
      FROM friendships
      WHERE (requester_id = '${user.id}' OR addressee_id = '${user.id}')
      AND status = 'accepted'
    )`)
  } else {
    queryBuilder = queryBuilder.eq('privacy_level', 'public')
  }

  // Apply pagination
  const offset = (pagination.page - 1) * pagination.limit
  queryBuilder = queryBuilder.range(offset, offset + pagination.limit - 1)

  const { data: users, error, count } = await queryBuilder

  if (error) {
    throw new Error(`User search failed: ${error.message}`)
  }

  const results: SearchResult[] = (users || []).map((userProfile: any) => ({
    id: userProfile.id,
    type: 'user' as const,
    title: userProfile.display_name || userProfile.username,
    description: generateUserDescription(userProfile),
    imageUrl: userProfile.profile_image,
    metadata: {
      user: userProfile,
      preferences: userProfile.user_preferences,
      experienceCount: userProfile.food_experiences?.[0]?.count || 0
    },
    score: {
      relevance: calculateTextRelevance(query, userProfile),
      personalization: calculateUserPersonalizationScore(userProfile, user),
      quality: 0.7,
      popularity: Math.min((userProfile.food_experiences?.[0]?.count || 0) / 100, 1),
      final: 0
    },
    highlights: generateHighlights(query, userProfile),
    reasons: generateUserReasons(userProfile, user),
    actions: {
      primary: `/users/${userProfile.id}`,
      secondary: [`/users/${userProfile.id}/experiences`]
    },
    context: {
      matchingTags: findMatchingTags(query, [
        userProfile.username, 
        userProfile.display_name,
        ...(userProfile.favorite_cuisines || [])
      ])
    }
  }))

  return { results, totalCount: count || 0, raw: users || [] }
}

async function performGlobalSearch(
  supabase: any,
  query: string,
  filters: any,
  personalization: any,
  user: any,
  pagination: any
): Promise<{ results: SearchResult[]; totalCount: number; sources: string[]; raw: any[] }> {
  
  // Perform parallel searches across all content types
  const itemsPerType = Math.ceil(pagination.limit / 4)
  
  const [restaurantResults, dishResults, experienceResults, userResults] = await Promise.all([
    searchRestaurants(supabase, query, filters, personalization, user, { page: 1, limit: itemsPerType }),
    searchDishes(supabase, query, filters, personalization, user, { page: 1, limit: itemsPerType }),
    searchExperiences(supabase, query, filters, personalization, user, { page: 1, limit: itemsPerType }),
    searchUsers(supabase, query, filters, user, { page: 1, limit: itemsPerType })
  ])

  // Combine and interleave results for diversity
  const allResults = [
    ...restaurantResults.results,
    ...dishResults.results,
    ...experienceResults.results,
    ...userResults.results
  ]

  const totalCount = restaurantResults.totalCount + dishResults.totalCount + 
                    experienceResults.totalCount + userResults.totalCount

  const sources = ['restaurants', 'dishes', 'experiences', 'users']
  const rawResults = [
    ...restaurantResults.raw,
    ...dishResults.raw,
    ...experienceResults.raw,
    ...userResults.raw
  ]

  return { results: allResults, totalCount, sources, raw: rawResults }
}

async function performSemanticSearch(
  supabase: any,
  query: string,
  filters: any,
  personalization: any,
  user: any,
  pagination: any
): Promise<{ results: SearchResult[]; totalCount: number; raw: any[] }> {
  
  // Placeholder for semantic search implementation
  // Would use embedding-based similarity search
  
  // For now, fall back to enhanced text search
  return await performGlobalSearch(supabase, query, filters, personalization, user, pagination)
}

// Ranking and scoring functions
async function applyRankingAlgorithm(
  results: SearchResult[],
  ranking: SearchRequest['ranking'],
  user: any,
  request: SearchRequest
): Promise<SearchResult[]> {
  
  const weights = ranking?.weights || {
    textMatch: 0.3,
    personalRelevance: 0.25,
    socialSignals: 0.15,
    recency: 0.1,
    quality: 0.15,
    diversity: 0.05
  }

  // Calculate final scores
  results.forEach(result => {
    result.score.final = 
      result.score.relevance * weights.textMatch! +
      result.score.personalization * weights.personalRelevance! +
      result.score.quality * weights.quality! +
      result.score.popularity * weights.socialSignals!
    
    // Apply algorithm-specific adjustments
    switch (ranking?.algorithm) {
      case 'personalized':
        result.score.final *= (1 + result.score.personalization)
        break
      case 'popularity':
        result.score.final *= (1 + result.score.popularity)
        break
      case 'hybrid':
        // Balanced approach - no additional weighting
        break
    }
  })

  // Sort by final score
  results.sort((a, b) => b.score.final - a.score.final)

  return results
}

// Helper functions continue...

function sanitizeSearchQuery(query: string): string {
  return query.trim().replace(/[<>]/g, '').substring(0, 200)
}

function calculateTextRelevance(query: string, item: any): number {
  const searchableText = [
    item.name || item.display_name || item.dish_name || item.title,
    item.description || item.bio || item.custom_notes,
    ...(item.cuisine_types || []),
    ...(item.tags || []),
    ...(item.ingredients || [])
  ].join(' ').toLowerCase()

  const queryTerms = query.toLowerCase().split(' ')
  let matches = 0

  queryTerms.forEach(term => {
    if (searchableText.includes(term)) {
      matches++
    }
  })

  return matches / queryTerms.length
}

async function calculatePersonalizationScore(
  supabase: any,
  restaurant: any,
  user: any,
  personalization: any
): Promise<number> {
  if (!user || !personalization.useTasteProfile) return 0.5

  // Get user's taste profile and history
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!userPrefs) return 0.5

  let score = 0.5

  // Cuisine preference matching
  if (userPrefs.preferred_cuisines && restaurant.cuisine_types) {
    const matches = restaurant.cuisine_types.filter(cuisine => 
      userPrefs.preferred_cuisines.includes(cuisine)
    ).length
    if (matches > 0) score += 0.3 * (matches / restaurant.cuisine_types.length)
  }

  // Price range matching
  if (userPrefs.preferred_price_range && userPrefs.preferred_price_range.includes(restaurant.price_range)) {
    score += 0.2
  }

  return Math.min(score, 1.0)
}

async function calculateDishPersonalizationScore(
  supabase: any,
  dish: any,
  user: any,
  personalization: any
): Promise<number> {
  if (!user) return 0.5
  
  // Placeholder - would analyze user's dish preferences
  return 0.6
}

async function calculateExperiencePersonalizationScore(
  supabase: any,
  experience: any,
  user: any,
  personalization: any
): Promise<number> {
  if (!user) return 0.5
  
  // Placeholder - would analyze emotional and taste alignment
  return 0.7
}

function calculateUserPersonalizationScore(profile: any, user: any): number {
  if (!user) return 0.5
  
  // Calculate compatibility based on shared interests
  // Placeholder implementation
  return 0.6
}

function generateHighlights(query: string, item: any): string[] {
  const highlights = []
  const queryTerms = query.toLowerCase().split(' ')
  
  // Find matching terms in title/name
  const title = item.name || item.display_name || item.dish_name || ''
  queryTerms.forEach(term => {
    if (title.toLowerCase().includes(term)) {
      highlights.push(`<mark>${term}</mark> in ${title}`)
    }
  })

  return highlights.slice(0, 3)
}

async function generateReasons(
  supabase: any,
  restaurant: any,
  user: any,
  personalization: any
): Promise<string[]> {
  const reasons = []
  
  if (restaurant.rating >= 4.5) {
    reasons.push('Highly rated restaurant')
  }
  
  if (restaurant.cuisine_types.length > 0) {
    reasons.push(`Specializes in ${restaurant.cuisine_types[0]} cuisine`)
  }
  
  return reasons.slice(0, 3)
}

function generateExperienceDescription(experience: any): string {
  const parts = []
  
  if (experience.overall_rating) {
    parts.push(`${experience.overall_rating}/5 stars`)
  }
  
  if (experience.custom_notes) {
    parts.push(experience.custom_notes.substring(0, 100))
  } else {
    parts.push('Memorable food experience')
  }
  
  if (experience.emotions && experience.emotions.length > 0) {
    parts.push(`Felt ${experience.emotions.slice(0, 2).join(', ')}`)
  }
  
  return parts.join(' - ')
}

function generateUserDescription(userProfile: any): string {
  const parts = []
  
  if (userProfile.bio) {
    parts.push(userProfile.bio.substring(0, 100))
  }
  
  if (userProfile.favorite_cuisines && userProfile.favorite_cuisines.length > 0) {
    parts.push(`Loves ${userProfile.favorite_cuisines.slice(0, 2).join(', ')} cuisine`)
  }
  
  return parts.join(' - ') || 'Food enthusiast'
}

function generateExperienceReasons(experience: any, user: any): string[] {
  const reasons = []
  
  if (experience.overall_rating >= 4) {
    reasons.push('Highly rated experience')
  }
  
  if (experience.emotions?.includes('happy')) {
    reasons.push('Positive emotional experience')
  }
  
  if (experience.restaurants) {
    reasons.push(`From ${experience.restaurants.name}`)
  }
  
  return reasons.slice(0, 3)
}

function generateUserReasons(userProfile: any, currentUser: any): string[] {
  const reasons = []
  
  if (userProfile.food_experiences?.[0]?.count > 50) {
    reasons.push('Experienced food enthusiast')
  }
  
  if (userProfile.favorite_cuisines?.length > 3) {
    reasons.push('Diverse culinary interests')
  }
  
  return reasons.slice(0, 3)
}

function findMatchingTags(query: string, tags: string[]): string[] {
  const queryTerms = query.toLowerCase().split(' ')
  return tags.filter(tag => 
    queryTerms.some(term => tag.toLowerCase().includes(term))
  )
}

function calculateDistance(location: any, restaurant: any): number | undefined {
  if (!restaurant.latitude || !restaurant.longitude) return undefined
  
  // Haversine distance calculation
  const R = 6371 // Earth's radius in km
  const dLat = (restaurant.latitude - location.lat) * Math.PI / 180
  const dLon = (restaurant.longitude - location.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(location.lat * Math.PI / 180) * Math.cos(restaurant.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function calculateEmotionalRelevance(emotionalExp: any, user: any): number {
  // Placeholder for emotional relevance calculation
  return 0.8
}

async function enhanceResultsWithML(supabase: any, results: any, userId: string, request: SearchRequest): Promise<void> {
  // Placeholder for ML enhancement
  // Would apply learned user preferences and behavior patterns
}

async function generateSearchFacets(supabase: any, request: SearchRequest, rawResults: any[]): Promise<SearchFacets> {
  // Generate faceted search results
  return {
    cuisines: [],
    priceRanges: [],
    ratings: [],
    locations: [],
    dietary: [],
    emotions: []
  }
}

async function generateSearchSuggestions(supabase: any, query: string, userId?: string): Promise<string[]> {
  // Generate search suggestions based on query and user history
  return []
}

async function getTrendingQueries(supabase: any): Promise<TrendingItem[]> {
  // Get trending search queries
  return []
}

async function getRelatedQueries(supabase: any, query: string): Promise<RelatedQuery[]> {
  // Get related search queries
  return []
}

async function logSearchQuery(supabase: any, userId: string, request: SearchRequest): Promise<void> {
  await supabase
    .from('search_history')
    .insert({
      user_id: userId,
      search_query: request.query,
      search_type: request.type,
      filters: request.filters,
      created_at: new Date().toISOString()
    })
}