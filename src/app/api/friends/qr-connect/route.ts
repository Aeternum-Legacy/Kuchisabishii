import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const qrConnectSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().optional(),
  type: z.enum(['qr', 'url']).default('url')
})

// POST /api/friends/qr-connect - Connect via QR code scan with verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = qrConnectSchema.parse(body)
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Prevent users from adding themselves
    if (user.id === validatedData.userId) {
      return NextResponse.json({ error: 'Cannot add yourself as a friend' }, { status: 400 })
    }

    // If this is a QR code connection with a token, verify it
    if (validatedData.type === 'qr' && validatedData.token) {
      const tokenValid = await verifyQRToken(validatedData.token, validatedData.userId)
      if (!tokenValid) {
        return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 })
      }
    }

    // Check if friendship already exists
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},friend_user_id.eq.${validatedData.userId}),and(user_id.eq.${validatedData.userId},friend_user_id.eq.${user.id})`)
      .single()

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 })
      } else if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 })
      }
    }

    // Get target user info for notification
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('display_name, email, notification_preferences')
      .eq('id', validatedData.userId)
      .single()

    // Create friendship request
    const { data: friendship, error: friendshipError } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_user_id: validatedData.userId,
        status: 'pending',
        connection_method: validatedData.type,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (friendshipError) {
      console.error('Error creating friendship:', friendshipError)
      return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
    }

    // Mark QR token as used if it was a QR connection
    if (validatedData.type === 'qr' && validatedData.token) {
      await markTokenAsUsed(validatedData.token)
    }

    // Send notification to target user (optional)
    if (targetUser && targetUser.notification_preferences?.friend_requests !== false) {
      await sendFriendRequestNotification(user, targetUser, validatedData.type)
    }

    // Log the connection for analytics
    await logConnectionEvent(user.id, validatedData.userId, validatedData.type)

    return NextResponse.json({ 
      message: 'Friend request sent successfully',
      friendship,
      connectionMethod: validatedData.type
    }, { status: 201 })

  } catch (error) {
    console.error('QR connect error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function verifyQRToken(token: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data: tokenData, error } = await supabase
      .from('qr_verification_tokens')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .eq('user_id', userId)
      .single()

    if (error || !tokenData) {
      return false
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now > expiresAt || tokenData.used) {
      return false
    }

    return true
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}

async function markTokenAsUsed(token: string): Promise<void> {
  try {
    const supabase = await createClient()
    
    await supabase
      .from('qr_verification_tokens')
      .update({ 
        used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('token', token)
  } catch (error) {
    console.error('Error marking token as used:', error)
  }
}

async function sendFriendRequestNotification(
  requester: any, 
  targetUser: any, 
  connectionMethod: string
): Promise<void> {
  try {
    // This would integrate with your notification system
    // For now, we'll just log it
    console.log(`Sending friend request notification:`, {
      from: requester.email,
      to: targetUser.email,
      method: connectionMethod
    })

    // You could integrate with email services, push notifications, etc.
    // Example:
    // await emailService.sendFriendRequestNotification({
    //   to: targetUser.email,
    //   requesterName: requester.display_name,
    //   connectionMethod
    // })
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

async function logConnectionEvent(
  requesterId: string, 
  targetId: string, 
  method: string
): Promise<void> {
  try {
    const supabase = await createClient()
    
    await supabase
      .from('connection_analytics')
      .insert({
        requester_id: requesterId,
        target_id: targetId,
        connection_method: method,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging connection event:', error)
    // Don't fail the request if analytics logging fails
  }
}