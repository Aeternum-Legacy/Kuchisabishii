/**
 * Individual Food Experience API Route
 * Handles operations on specific food experiences by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Update schema (partial of create schema)
const foodExperienceUpdateSchema = z.object({
  dish_name: z.string().min(1).max(200).optional(),
  restaurant_id: z.string().uuid().optional(),
  menu_item_id: z.string().uuid().optional(),
  custom_notes: z.string().max(1000).optional(),
  meal_time: z.enum(['breakfast', 'brunch', 'lunch', 'dinner', 'snack', 'dessert']).optional(),
  dining_method: z.enum(['dine_in', 'takeout', 'delivery', 'homemade']).optional(),
  experienced_at: z.string().datetime().optional(),
  amount_spent: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  overall_rating: z.number().min(1).max(5).optional(),
  taste_notes: z.record(z.any()).optional(),
  emotions: z.array(z.string()).optional(),
  mood_before: z.string().max(50).optional(),
  mood_after: z.string().max(50).optional(),
  satisfaction_level: z.number().min(1).max(10).optional(),
  mouthfeel: z.record(z.any()).optional(),
  aroma_notes: z.array(z.string()).optional(),
  temperature_rating: z.number().min(1).max(5).optional(),
  portion_size: z.enum(['too_small', 'just_right', 'too_large']).optional(),
  dining_companions: z.number().min(0).optional(),
  special_occasion: z.string().max(100).optional(),
  weather: z.string().max(50).optional(),
  photos: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  is_private: z.boolean().optional(),
  shared_with_friends: z.boolean().optional(),
  
  // Optional detailed taste experience
  taste_experience: z.object({
    saltiness: z.number().min(1).max(10).optional(),
    sweetness: z.number().min(1).max(10).optional(),
    sourness: z.number().min(1).max(10).optional(),
    bitterness: z.number().min(1).max(10).optional(),
    umami: z.number().min(1).max(10).optional(),
    crunchiness: z.number().min(1).max(10).optional(),
    creaminess: z.number().min(1).max(10).optional(),
    chewiness: z.number().min(1).max(10).optional(),
    juiciness: z.number().min(1).max(10).optional(),
    temperature: z.number().min(1).max(10).optional(),
    spice_heat: z.number().min(1).max(10).optional(),
    aroma_intensity: z.number().min(1).max(10).optional(),
    aroma_descriptors: z.array(z.string()).optional(),
    visual_appeal: z.number().min(1).max(10).optional(),
    color_vibrancy: z.number().min(1).max(10).optional()
  }).optional()
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Fetch specific food experience
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Experience ID is required'
      }, { status: 400 })
    }

    const { data: experience, error } = await supabase
      .from('food_experiences')
      .select(`
        *,
        restaurants (
          id,
          name,
          description,
          cuisine_types,
          address,
          city,
          state,
          phone,
          website
        ),
        menu_items (
          id,
          name,
          description,
          price,
          ingredients,
          allergens
        ),
        taste_experiences (*),
        user_profiles!inner (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only access their own experiences
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Experience not found'
        }, { status: 404 })
      }

      console.error('Failed to fetch experience:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to load experience'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { experience }
    })

  } catch (error) {
    console.error('Get experience error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT - Update food experience
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Experience ID is required'
      }, { status: 400 })
    }

    const body = await request.json()
    const validation = foodExperienceUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { taste_experience, ...experienceData } = validation.data

    // Verify ownership
    const { data: existingExperience, error: ownershipError } = await supabase
      .from('food_experiences')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (ownershipError || !existingExperience) {
      return NextResponse.json({
        success: false,
        error: 'Experience not found or access denied'
      }, { status: 404 })
    }

    // Update experience
    const { data: experience, error: updateError } = await supabase
      .from('food_experiences')
      .update(experienceData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        restaurants (
          id,
          name,
          cuisine_types,
          city,
          state
        ),
        menu_items (
          id,
          name,
          description,
          price
        )
      `)
      .single()

    if (updateError) {
      console.error('Failed to update experience:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update experience'
      }, { status: 500 })
    }

    // Update taste experience if provided
    let tasteExperienceData = null
    if (taste_experience) {
      const { data: tasteExperienceResult, error: tasteError } = await supabase
        .from('taste_experiences')
        .upsert([{
          food_experience_id: id,
          ...taste_experience
        }])
        .select()
        .single()

      if (tasteError) {
        console.warn('Failed to update taste experience:', tasteError)
      } else {
        tasteExperienceData = tasteExperienceResult
      }
    }

    const responseData = {
      ...experience,
      taste_experiences: tasteExperienceData ? [tasteExperienceData] : []
    }

    return NextResponse.json({
      success: true,
      data: { experience: responseData },
      message: 'Experience updated successfully'
    })

  } catch (error) {
    console.error('Update experience error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE - Delete food experience
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Experience ID is required'
      }, { status: 400 })
    }

    // Verify ownership and get experience data
    const { data: experience, error: fetchError } = await supabase
      .from('food_experiences')
      .select('id, user_id, photos, videos')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !experience) {
      return NextResponse.json({
        success: false,
        error: 'Experience not found or access denied'
      }, { status: 404 })
    }

    // Delete the experience (taste_experiences will be deleted via CASCADE)
    const { error: deleteError } = await supabase
      .from('food_experiences')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Failed to delete experience:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete experience'
      }, { status: 500 })
    }

    // TODO: Delete associated media files from storage
    // This would be implemented when we add file upload functionality

    return NextResponse.json({
      success: true,
      message: 'Experience deleted successfully'
    })

  } catch (error) {
    console.error('Delete experience error:', error)
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}