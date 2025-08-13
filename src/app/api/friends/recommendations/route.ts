import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/friends/recommendations - Get friend recommendations based on mutual friends and taste similarity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get current user's friends
    const { data: currentFriends } = await supabase
      .from('friendships')
      .select('user_id, friend_user_id')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)

    const friendIds = new Set(
      currentFriends?.map(f => f.user_id === user.id ? f.friend_user_id : f.user_id) || []
    )

    // Get all users except current user and existing friends
    const excludeIds = [user.id, ...Array.from(friendIds)]
    
    const { data: potentialFriends, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name, profile_image_url, email')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(50) // Get a larger pool to work with

    if (usersError) {
      console.error('Error fetching potential friends:', usersError)
      return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
    }

    if (!potentialFriends || potentialFriends.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    // Calculate recommendations for each potential friend
    const recommendations = await Promise.all(
      potentialFriends.map(async (potentialFriend) => {
        let mutualFriends = 0
        let similarTastes = 0
        let matchScore = 0
        let recommendationReason = ''

        // Calculate mutual friends
        const { data: theirFriends } = await supabase
          .from('friendships')
          .select('user_id, friend_user_id')
          .eq('status', 'accepted')
          .or(`user_id.eq.${potentialFriend.id},friend_user_id.eq.${potentialFriend.id}`)

        const theirFriendIds = new Set(
          theirFriends?.map(f => f.user_id === potentialFriend.id ? f.friend_user_id : f.user_id) || []
        )

        // Count mutual friends
        mutualFriends = Array.from(friendIds).filter(id => theirFriendIds.has(id)).length

        // Calculate taste similarity based on food experiences
        const { data: userFoodPrefs } = await supabase
          .from('food_experiences')
          .select('food_type, cuisine_type, rating')
          .eq('user_id', user.id)
          .gte('rating', 4) // Only consider highly rated foods

        const { data: theirFoodPrefs } = await supabase
          .from('food_experiences')
          .select('food_type, cuisine_type, rating')
          .eq('user_id', potentialFriend.id)
          .gte('rating', 4)

        if (userFoodPrefs && theirFoodPrefs) {
          const userCuisines = new Set(userFoodPrefs.map(f => f.cuisine_type).filter(Boolean))
          const theirCuisines = new Set(theirFoodPrefs.map(f => f.cuisine_type).filter(Boolean))
          
          const userFoodTypes = new Set(userFoodPrefs.map(f => f.food_type).filter(Boolean))
          const theirFoodTypes = new Set(theirFoodPrefs.map(f => f.food_type).filter(Boolean))

          // Count similar cuisine preferences
          const sharedCuisines = Array.from(userCuisines).filter(c => theirCuisines.has(c)).length
          const sharedFoodTypes = Array.from(userFoodTypes).filter(t => theirFoodTypes.has(t)).length
          
          similarTastes = sharedCuisines + sharedFoodTypes
        }

        // Calculate match score (0-100)
        const mutualFriendsScore = Math.min(mutualFriends * 20, 40) // Max 40 points for mutual friends
        const tasteScore = Math.min(similarTastes * 10, 40) // Max 40 points for taste similarity
        const baseScore = 20 // Base score for being a potential friend

        matchScore = mutualFriendsScore + tasteScore + baseScore

        // Determine recommendation reason
        if (mutualFriends > 0 && similarTastes > 0) {
          recommendationReason = `${mutualFriends} mutual friend${mutualFriends !== 1 ? 's' : ''} and ${similarTastes} similar taste${similarTastes !== 1 ? 's' : ''}`
        } else if (mutualFriends > 0) {
          recommendationReason = `${mutualFriends} mutual friend${mutualFriends !== 1 ? 's' : ''}`
        } else if (similarTastes > 0) {
          recommendationReason = `${similarTastes} similar food preference${similarTastes !== 1 ? 's' : ''}`
        } else {
          recommendationReason = 'New to your network'
        }

        return {
          id: potentialFriend.id,
          displayName: potentialFriend.display_name,
          firstName: potentialFriend.first_name,
          lastName: potentialFriend.last_name,
          profileImage: potentialFriend.profile_image_url,
          email: potentialFriend.email,
          recommendationReason,
          mutualFriends,
          similarTastes,
          matchScore,
          friendshipStatus: 'none' as const
        }
      })
    )

    // Sort by match score and limit results
    const sortedRecommendations = recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)

    return NextResponse.json({ recommendations: sortedRecommendations })

  } catch (error) {
    console.error('Friend recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}