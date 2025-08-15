import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const acceptRequestSchema = z.object({
  friendshipId: z.string().uuid('Invalid friendship ID')
})

// GET /api/friends/requests - Get pending friend requests
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get pending friend requests where current user is the receiver
    const { data: requests, error: requestsError } = await supabase
      .from('friendships')
      .select(`
        id,
        created_at,
        requester:profiles!friendships_user_id_fkey(id, display_name, first_name, last_name, profile_image_url)
      `)
      .eq('friend_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching friend requests:', requestsError)
      return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 })
    }

    const friendRequests = requests?.map(request => ({
      id: request.id,
      requester: {
        id: request.requester[0]?.id,
        displayName: request.requester[0]?.display_name,
        firstName: request.requester[0]?.first_name,
        lastName: request.requester[0]?.last_name,
        profileImage: request.requester[0]?.profile_image_url
      },
      requestedAt: request.created_at
    })) || []

    return NextResponse.json({ requests: friendRequests })

  } catch (error) {
    console.error('Friend requests API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/friends/requests - Accept friend request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = acceptRequestSchema.parse(body)
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Accept the friend request (update status to accepted)
    const { data: updatedFriendship, error: updateError } = await supabase
      .from('friendships')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.friendshipId)
      .eq('friend_user_id', user.id) // Ensure current user is the receiver
      .eq('status', 'pending') // Only pending requests can be accepted
      .select()
      .single()

    if (updateError || !updatedFriendship) {
      console.error('Error accepting friend request:', updateError)
      return NextResponse.json({ error: 'Failed to accept friend request' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Friend request accepted',
      friendship: updatedFriendship 
    })

  } catch (error) {
    console.error('Accept friend request error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}