/**
 * Taste Profile API Route
 * Manages user taste preferences for personalized recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Taste profile validation schema
const tasteProfileSchema = z.object({
  salty_preference: z.number().min(1).max(10).optional(),
  sweet_preference: z.number().min(1).max(10).optional(),
  sour_preference: z.number().min(1).max(10).optional(),
  bitter_preference: z.number().min(1).max(10).optional(),
  umami_preference: z.number().min(1).max(10).optional(),
  crunchy_preference: z.number().min(1).max(10).optional(),
  creamy_preference: z.number().min(1).max(10).optional(),
  chewy_preference: z.number().min(1).max(10).optional(),
  hot_food_preference: z.number().min(1).max(10).optional(),
  cold_food_preference: z.number().min(1).max(10).optional(),
  culinary_adventurousness: z.number().min(1).max(10).optional(),
  cuisine_preferences: z.record(z.number()).optional()
})

// GET - Fetch taste profile
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

    const { data: tasteProfile, error } = await supabase
      .from('taste_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Failed to fetch taste profile:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to load taste profile'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { taste_profile: tasteProfile || null }
    })

  } catch (error) {
    console.error('Get taste profile error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST - Create taste profile
export async function POST(request: NextRequest) {
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
    const validation = tasteProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }

    // Check if taste profile already exists
    const { data: existingProfile } = await supabase
      .from('taste_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({
        success: false,
        error: 'Taste profile already exists. Use PUT to update.'
      }, { status: 409 })
    }

    const tasteProfileData: any = {
      user_id: user.id,
      ...validation.data
    }

    const { data: tasteProfile, error } = await supabase
      .from('taste_profiles')
      .insert([tasteProfileData])
      .select()
      .single()

    if (error) {
      console.error('Failed to create taste profile:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create taste profile'
      }, { status: 500 })
    }

    // Update user profile to mark taste profile as set up
    await supabase
      .from('user_profiles')
      .update({ taste_profile_setup: true })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      data: { taste_profile: tasteProfile },
      message: 'Taste profile created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create taste profile error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT - Update taste profile
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
    const validation = tasteProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }

    const updates: any = validation.data

    // Upsert taste profile
    const { data: tasteProfile, error } = await supabase
      .from('taste_profiles')
      .upsert([{
        user_id: user.id,
        ...updates
      }])
      .select()
      .single()

    if (error) {
      console.error('Failed to update taste profile:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update taste profile'
      }, { status: 500 })
    }

    // Update user profile to mark taste profile as set up
    await supabase
      .from('user_profiles')
      .update({ taste_profile_setup: true })
      .eq('id', user.id)

    // Update analytics
    const today = new Date().toISOString().split('T')[0]
    await supabase.rpc('increment_analytics', {
      p_user_id: user.id,
      p_date: today,
      p_field: 'taste_profile_updates'
    })

    return NextResponse.json({
      success: true,
      data: { taste_profile: tasteProfile },
      message: 'Taste profile updated successfully'
    })

  } catch (error) {
    console.error('Update taste profile error:', error)
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}