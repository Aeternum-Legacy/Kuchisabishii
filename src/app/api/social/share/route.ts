import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const shareSchema = z.object({
  foodReviewId: z.string().uuid('Invalid food review ID'),
  type: z.enum(['food_review', 'restaurant_review']),
  friendIds: z.array(z.string().uuid()).optional(),
  visibility: z.enum(['friends', 'public']).default('friends')
})

// POST /api/social/share - Share content with friends or publicly
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = shareSchema.parse(body)
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify the food review belongs to the user or is shareable
    const { data: foodReview, error: reviewError } = await supabase
      .from('food_experiences')
      .select('id, user_id, food_name, restaurant_name, rating')
      .eq('id', validatedData.foodReviewId)
      .single()

    if (reviewError || !foodReview) {
      return NextResponse.json({ error: 'Food review not found' }, { status: 404 })
    }

    if (foodReview.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to share this review' }, { status: 403 })
    }

    // Create social share record
    const { data: share, error: shareError } = await supabase
      .from('social_shares')
      .insert({
        user_id: user.id,
        content_type: validatedData.type,
        content_id: validatedData.foodReviewId,
        visibility: validatedData.visibility,
        shared_at: new Date().toISOString()
      })
      .select()
      .single()

    if (shareError) {
      console.error('Error creating social share:', shareError)
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 })
    }

    // If sharing with specific friends, create friend notifications
    if (validatedData.friendIds && validatedData.friendIds.length > 0) {
      const friendNotifications = validatedData.friendIds.map(friendId => ({
        user_id: friendId,
        from_user_id: user.id,
        type: 'food_share',
        content: {
          shareId: share.id,
          foodName: foodReview.food_name,
          restaurantName: foodReview.restaurant_name,
          rating: foodReview.rating
        },
        created_at: new Date().toISOString()
      }))

      await supabase
        .from('notifications')
        .insert(friendNotifications)
    } else if (validatedData.visibility === 'friends') {
      // Share with all friends
      const { data: friends } = await supabase
        .from('friendships')
        .select('user_id, friend_user_id')
        .eq('status', 'accepted')
        .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)

      if (friends && friends.length > 0) {
        const friendNotifications = friends.map(friendship => {
          const friendId = friendship.user_id === user.id ? friendship.friend_user_id : friendship.user_id
          return {
            user_id: friendId,
            from_user_id: user.id,
            type: 'food_share',
            content: {
              shareId: share.id,
              foodName: foodReview.food_name,
              restaurantName: foodReview.restaurant_name,
              rating: foodReview.rating
            },
            created_at: new Date().toISOString()
          }
        })

        await supabase
          .from('notifications')
          .insert(friendNotifications)
      }
    }

    return NextResponse.json({ 
      message: 'Successfully shared',
      share: share
    })

  } catch (error) {
    console.error('Social share error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/social/share - Get social shares feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get friends' food shares
    const { data: friendShares, error: sharesError } = await supabase
      .from('social_shares')
      .select(`
        id,
        content_type,
        content_id,
        visibility,
        shared_at,
        user:profiles!social_shares_user_id_fkey(id, display_name, profile_image_url),
        food_experience:food_experiences!social_shares_content_id_fkey(
          id,
          food_name,
          restaurant_name,
          rating,
          experience_notes,
          photo_url,
          date_eaten
        )
      `)
      .eq('content_type', 'food_review')
      .in('user_id', ['']) // Placeholder - will be replaced with actual friend IDs
      .order('shared_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (sharesError) {
      console.error('Error fetching social shares:', sharesError)
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 })
    }

    return NextResponse.json({ shares: friendShares || [] })

  } catch (error) {
    console.error('Social shares feed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}