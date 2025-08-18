/**
 * User Profile API Route
 * Handles profile CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Profile update validation schema
const profileUpdateSchema = z.object({
  username: z.string().min(3).max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  spice_tolerance: z.number().min(1).max(10).optional(),
  sweetness_preference: z.number().min(1).max(10).optional(),
  profile_visibility: z.enum(['public', 'friends', 'private']).optional(),
  allow_recommendations: z.boolean().optional(),
  share_analytics: z.boolean().optional()
})

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        taste_profiles (*),
        recommendation_preferences (*)
      `)
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Failed to fetch profile:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to load profile'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { profile }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const body = await request.json()
    const validation = profileUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }

    const updates = validation.data

    // Check if username is already taken (if updating username)
    if (updates.username) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single()

      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'Username already exists'
        }, { status: 409 })
      }
    }

    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update profile:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update profile'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}