/**
 * Individual Restaurant API Route
 * Handles operations on specific restaurants by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Restaurant update schema
const restaurantUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().min(1).max(300).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().max(50).optional(),
  country: z.string().min(2).max(50).optional(),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  cuisine_types: z.array(z.string()).optional(),
  price_range: z.number().min(1).max(4).optional(),
  hours: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
  dietary_options: z.array(z.string()).optional()
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

type RestaurantUpdate = z.infer<typeof restaurantUpdateSchema>

// GET - Fetch specific restaurant with detailed information
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID is required'
      }, { status: 400 })
    }

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        menu_items (*),
        restaurant_reviews (
          id,
          overall_restaurant_rating,
          service_rating,
          atmosphere_rating,
          would_recommend,
          visit_date,
          user_profiles (
            display_name,
            avatar_url
          )
        ),
        food_experiences (
          id,
          dish_name,
          overall_rating,
          experienced_at,
          user_profiles (
            display_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Restaurant not found'
        }, { status: 404 })
      }

      console.error('Failed to fetch restaurant:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to load restaurant'
      }, { status: 500 })
    }

    // Calculate statistics
    const reviews = restaurant.restaurant_reviews || []
    const experiences = restaurant.food_experiences || []
    
    const statistics = {
      total_reviews: reviews.length,
      total_experiences: experiences.length,
      average_restaurant_rating: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.overall_restaurant_rating || 0), 0) / reviews.length
        : null,
      average_food_rating: experiences.length > 0
        ? experiences.reduce((sum, e) => sum + (e.overall_rating || 0), 0) / experiences.length
        : null,
      recommendation_rate: reviews.length > 0
        ? reviews.filter(r => r.would_recommend).length / reviews.length
        : null
    }

    const restaurantData = {
      ...restaurant,
      statistics
    }

    return NextResponse.json({
      success: true,
      data: { restaurant: restaurantData }
    })

  } catch (error) {
    console.error('Get restaurant error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT - Update restaurant (only by owner or admin)
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

    const { id } = await params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID is required'
      }, { status: 400 })
    }

    const body = await request.json()
    const validation = restaurantUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }

    // Check if user owns the restaurant or is admin
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, claimed_by')
      .eq('id', id)
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant not found'
      }, { status: 404 })
    }

    // Check if user has permission to edit
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    const canEdit = restaurant.claimed_by === user.id || 
                   userProfile // Could add admin check here

    if (!canEdit) {
      return NextResponse.json({
        success: false,
        error: 'You do not have permission to edit this restaurant'
      }, { status: 403 })
    }

    const updates: RestaurantUpdate = validation.data

    // Update the restaurant
    const { data: updatedRestaurant, error: updateError } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update restaurant:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update restaurant'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { restaurant: updatedRestaurant },
      message: 'Restaurant updated successfully'
    })

  } catch (error) {
    console.error('Update restaurant error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE - Delete restaurant (admin only or owner)
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

    const { id } = await params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID is required'
      }, { status: 400 })
    }

    // Check if user owns the restaurant or is admin
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, claimed_by, name')
      .eq('id', id)
      .single()

    if (fetchError || !restaurant) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant not found'
      }, { status: 404 })
    }

    // Check if user has permission to delete
    const canDelete = restaurant.claimed_by === user.id
                     // Could add admin check here

    if (!canDelete) {
      return NextResponse.json({
        success: false,
        error: 'You do not have permission to delete this restaurant'
      }, { status: 403 })
    }

    // Check if restaurant has associated data
    const [experiencesResult, reviewsResult] = await Promise.all([
      supabase.from('food_experiences').select('id', { count: 'exact' }).eq('restaurant_id', id),
      supabase.from('restaurant_reviews').select('id', { count: 'exact' }).eq('restaurant_id', id)
    ])

    const hasExperiences = (experiencesResult.count || 0) > 0
    const hasReviews = (reviewsResult.count || 0) > 0

    if (hasExperiences || hasReviews) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete restaurant with existing experiences or reviews. Please contact support.'
      }, { status: 409 })
    }

    // Delete the restaurant
    const { error: deleteError } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Failed to delete restaurant:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete restaurant'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully'
    })

  } catch (error) {
    console.error('Delete restaurant error:', error)
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