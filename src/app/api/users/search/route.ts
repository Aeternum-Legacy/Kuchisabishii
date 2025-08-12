import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users/search?q=query - Search for users by name or email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Search for users by display name, first name, last name, or email
    // Exclude current user from results
    const { data: users, error: searchError } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name, profile_image_url, email')
      .neq('id', user.id)
      .or(`display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20)

    if (searchError) {
      console.error('Error searching users:', searchError)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    // Get friendship status for each user
    const userIds = users?.map(u => u.id) || []
    
    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_id, friend_user_id, status')
      .or(`and(user_id.eq.${user.id},friend_user_id.in.(${userIds.join(',')})),and(user_id.in.(${userIds.join(',')}),friend_user_id.eq.${user.id})`)

    // Create friendship status map
    const friendshipMap = new Map()
    friendships?.forEach(friendship => {
      const friendId = friendship.user_id === user.id ? friendship.friend_user_id : friendship.user_id
      friendshipMap.set(friendId, friendship.status)
    })

    // Format results with friendship status
    const searchResults = users?.map(u => ({
      id: u.id,
      displayName: u.display_name,
      firstName: u.first_name,
      lastName: u.last_name,
      profileImage: u.profile_image_url,
      email: u.email,
      friendshipStatus: friendshipMap.get(u.id) || 'none' // none, pending, accepted
    })) || []

    return NextResponse.json({ users: searchResults })

  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}