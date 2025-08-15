import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users/search - Advanced user search with filters and similarity scoring
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const location = searchParams.get('location')
    const dietaryPreferences = searchParams.get('dietaryPreferences')
    const spiceLevel = searchParams.get('spiceLevel')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    if (limit > 50) {
      return NextResponse.json({ error: 'Limit cannot exceed 50' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Build search query with filters
    let searchQuery = supabase
      .from('profiles')
      .select(`
        id, 
        display_name, 
        first_name, 
        last_name, 
        profile_image_url, 
        email,
        location,
        dietary_preferences,
        taste_preferences,
        created_at
      `)
      .neq('id', user.id)
      .or(`display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)

    // Apply location filter
    if (location && location.trim()) {
      searchQuery = searchQuery.ilike('location', `%${location}%`)
    }

    // Apply dietary preferences filter
    if (dietaryPreferences) {
      try {
        const preferences = JSON.parse(dietaryPreferences)
        if (preferences.length > 0) {
          searchQuery = searchQuery.overlaps('dietary_preferences', preferences)
        }
      } catch (e) {
        // Invalid JSON, ignore filter
      }
    }

    // Apply spice level filter
    if (spiceLevel) {
      try {
        const [min, max] = JSON.parse(spiceLevel)
        searchQuery = searchQuery
          .gte('taste_preferences->spice_level', min)
          .lte('taste_preferences->spice_level', max)
      } catch (e) {
        // Invalid JSON, ignore filter
      }
    }

    const { data: users, error: searchError } = await searchQuery
      .range(offset, offset + limit - 1)

    if (searchError) {
      console.error('Error searching users:', searchError)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    // Get friendship status and mutual friends for each user
    const userIds = users?.map(u => u.id) || []
    
    if (userIds.length === 0) {
      return NextResponse.json({ users: [], total: 0 })
    }

    // Get friendship status
    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_id, friend_user_id, status')
      .or(`and(user_id.eq.${user.id},friend_user_id.in.(${userIds.join(',')})),and(user_id.in.(${userIds.join(',')}),friend_user_id.eq.${user.id})`)

    // Get current user's taste preferences for similarity calculation
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('taste_preferences, dietary_preferences')
      .eq('id', user.id)
      .single()

    // Get mutual friends count
    const { data: mutualFriendsData } = await supabase
      .from('friendships')
      .select('user_id, friend_user_id')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)

    // Create friendship status map
    const friendshipMap = new Map()
    friendships?.forEach(friendship => {
      const friendId = friendship.user_id === user.id ? friendship.friend_user_id : friendship.user_id
      friendshipMap.set(friendId, friendship.status)
    })

    // Calculate mutual friends
    const mutualFriendsMap = new Map()
    if (mutualFriendsData) {
      // Get current user's friends
      const currentUserFriends = new Set()
      mutualFriendsData.forEach(friendship => {
        if (friendship.user_id === user.id) {
          currentUserFriends.add(friendship.friend_user_id)
        } else if (friendship.friend_user_id === user.id) {
          currentUserFriends.add(friendship.user_id)
        }
      })

      // Calculate mutual friends for each search result
      for (const userId of userIds) {
        const userFriends = new Set()
        mutualFriendsData.forEach(friendship => {
          if (friendship.user_id === userId) {
            userFriends.add(friendship.friend_user_id)
          } else if (friendship.friend_user_id === userId) {
            userFriends.add(friendship.user_id)
          }
        })
        
        const mutualCount = [...currentUserFriends].filter(friendId => userFriends.has(friendId)).length
        mutualFriendsMap.set(userId, mutualCount)
      }
    }

    // Format results with all data
    const searchResults = users?.map(u => {
      const similarityScore = calculateSimilarityScore(
        currentUserProfile?.taste_preferences,
        currentUserProfile?.dietary_preferences,
        u.taste_preferences,
        u.dietary_preferences
      )

      return {
        id: u.id,
        displayName: u.display_name,
        firstName: u.first_name,
        lastName: u.last_name,
        profileImage: u.profile_image_url,
        email: u.email,
        location: u.location,
        dietaryPreferences: u.dietary_preferences,
        tasteProfile: u.taste_preferences,
        mutualFriends: mutualFriendsMap.get(u.id) || 0,
        friendshipStatus: friendshipMap.get(u.id) || 'none',
        joinedDate: u.created_at,
        similarityScore: Math.round(similarityScore)
      }
    }) || []

    // Apply sorting
    const sortedResults = sortSearchResults(searchResults, sortBy as any)

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('id', user.id)
      .or(`display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)

    return NextResponse.json({ 
      users: sortedResults,
      total: totalCount || 0,
      offset,
      limit,
      hasMore: (totalCount || 0) > offset + limit
    })

  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Calculate similarity score between two users based on taste preferences and dietary restrictions
function calculateSimilarityScore(
  currentUserTaste: Record<string, unknown>,
  currentUserDietary: string[],
  otherUserTaste: Record<string, unknown>,
  otherUserDietary: string[]
): number {
  let score = 0
  let totalFactors = 0

  // Compare taste preferences (70% weight)
  if (currentUserTaste && otherUserTaste) {
    const tasteFactors = ['spice_level', 'sweetness', 'sourness', 'umami', 'saltiness']
    let tasteScore = 0
    let validTasteFactors = 0

    tasteFactors.forEach(factor => {
      const current = currentUserTaste[factor]
      const other = otherUserTaste[factor]
      
      if (typeof current === 'number' && typeof other === 'number') {
        // Calculate similarity (closer values = higher score)
        const difference = Math.abs(current - other)
        const maxDifference = 10 // assuming 0-10 scale
        const factorScore = Math.max(0, (maxDifference - difference) / maxDifference) * 100
        tasteScore += factorScore
        validTasteFactors++
      }
    })

    if (validTasteFactors > 0) {
      score += (tasteScore / validTasteFactors) * 0.7
      totalFactors += 0.7
    }
  }

  // Compare dietary preferences (30% weight)
  if (currentUserDietary && otherUserDietary && 
      Array.isArray(currentUserDietary) && Array.isArray(otherUserDietary)) {
    const currentSet = new Set(currentUserDietary)
    const otherSet = new Set(otherUserDietary)
    
    // Calculate Jaccard similarity (intersection / union)
    const intersection = [...currentSet].filter(pref => otherSet.has(pref)).length
    const union = new Set([...currentSet, ...otherSet]).size
    
    if (union > 0) {
      const dietaryScore = (intersection / union) * 100
      score += dietaryScore * 0.3
      totalFactors += 0.3
    }
  }

  return totalFactors > 0 ? score / totalFactors : 0
}

// Sort search results based on the specified criteria
function sortSearchResults(results: Record<string, unknown>[], sortBy: 'relevance' | 'similarity' | 'mutual' | 'recent'): Record<string, unknown>[] {
  const sorted = [...results]

  switch (sortBy) {
    case 'similarity':
      return sorted.sort((a: any, b: any) => (Number(b.similarityScore) || 0) - (Number(a.similarityScore) || 0))
    
    case 'mutual':
      return sorted.sort((a: any, b: any) => {
        // First sort by mutual friends count, then by similarity
        const mutualDiff = (Number(b.mutualFriends) || 0) - (Number(a.mutualFriends) || 0)
        if (mutualDiff !== 0) return mutualDiff
        return (Number(b.similarityScore) || 0) - (Number(a.similarityScore) || 0)
      })
    
    case 'recent':
      return sorted.sort((a: any, b: any) => {
        const dateA = new Date(a.joinedDate || 0).getTime()
        const dateB = new Date(b.joinedDate || 0).getTime()
        return dateB - dateA
      })
    
    default: // relevance
      // Default relevance sorting: combination of similarity, mutual friends, and recency
      return sorted.sort((a: any, b: any) => {
        const scoreA = (Number(a.similarityScore) || 0) * 0.5 + (Number(a.mutualFriends) || 0) * 10 + 
          (Date.now() - new Date(a.joinedDate || 0).getTime()) / (1000 * 60 * 60 * 24) * -0.1
        const scoreB = (Number(b.similarityScore) || 0) * 0.5 + (Number(b.mutualFriends) || 0) * 10 + 
          (Date.now() - new Date(b.joinedDate || 0).getTime()) / (1000 * 60 * 60 * 24) * -0.1
        return scoreB - scoreA
      })
  }
}