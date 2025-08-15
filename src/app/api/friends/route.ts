import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const addFriendSchema = z.object({
  friendUserId: z.string().uuid('Invalid user ID')
})

const removeFriendSchema = z.object({
  friendshipId: z.string().uuid('Invalid friendship ID')
})

// GET /api/friends - Get user's friends list
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get friendships where user is either requester or receiver and status is accepted
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select(`
        id,
        status,
        created_at,
        user_id,
        friend_user_id,
        requester:profiles!friendships_user_id_fkey(id, display_name, first_name, last_name, profile_image_url),
        receiver:profiles!friendships_friend_user_id_fkey(id, display_name, first_name, last_name, profile_image_url)
      `)
      .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)
      .eq('status', 'accepted')

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError)
      return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
    }

    // Transform the data to show the friend (not the current user)
    const friends = friendships?.map(friendship => {
      const isSentRequest = friendship.user_id === user.id
      const friend = isSentRequest ? friendship.receiver : friendship.requester
      
      return {
        friendshipId: friendship.id,
        friend: {
          id: friend?.[0]?.id,
          displayName: friend?.[0]?.display_name,
          firstName: friend?.[0]?.first_name,
          lastName: friend?.[0]?.last_name,
          profileImage: friend?.[0]?.profile_image_url
        },
        friendsSince: friendship.created_at
      }
    }) || []

    return NextResponse.json({ friends })

  } catch (error) {
    console.error('Friends API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/friends - Send friend request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = addFriendSchema.parse(body)
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if friendship already exists
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},friend_user_id.eq.${validatedData.friendUserId}),and(user_id.eq.${validatedData.friendUserId},friend_user_id.eq.${user.id})`)
      .single()

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 })
      } else if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 })
      }
    }

    // Create friendship request
    const { data: friendship, error: friendshipError } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_user_id: validatedData.friendUserId,
        status: 'pending'
      })
      .select()
      .single()

    if (friendshipError) {
      console.error('Error creating friendship:', friendshipError)
      return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Friend request sent successfully',
      friendship 
    }, { status: 201 })

  } catch (error) {
    console.error('Add friend error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/friends - Remove friend or decline request
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = removeFriendSchema.parse(body)
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Delete friendship (user must be either the requester or receiver)
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .eq('id', validatedData.friendshipId)
      .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)

    if (deleteError) {
      console.error('Error deleting friendship:', deleteError)
      return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Friend removed successfully' })

  } catch (error) {
    console.error('Remove friend error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}