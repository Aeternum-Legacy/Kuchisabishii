/**
 * Restaurants API Route
 * Handles restaurant discovery, search, and management
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { RestaurantInsert, PaginatedResponse, SearchFilters } from '@/lib/supabase/types'

// Restaurant creation/update schema
const restaurantSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  state: z.string().max(50).optional(),
  country: z.string().min(2).max(50).default('US'),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  cuisine_types: z.array(z.string()).default([]),
  price_range: z.number().min(1).max(4).default(2),
  hours: z.record(z.any()).optional(),
  features: z.array(z.string()).default([]),
  dietary_options: z.array(z.string()).default([])
})

// Search/filter schema
const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  cuisine_types: z.string().optional(), // Comma-separated
  price_range: z.string().optional(), // Comma-separated numbers
  dietary_options: z.string().optional(), // Comma-separated
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  distance_km: z.coerce.number().min(1).max(200).default(25),
  verified_only: z.coerce.boolean().default(false),
  sort: z.enum(['name', 'distance', 'rating', 'created_at']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc')
})

// GET - Search and list restaurants
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validation = searchSchema.safeParse(queryParams)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.errors
      }, { status: 400 })
    }

    const {
      page,
      limit,
      search,
      cuisine_types,
      price_range,
      dietary_options,
      latitude,
      longitude,
      distance_km,
      verified_only,
      sort,
      order
    } = validation.data

    // Build query
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        menu_items (
          id,
          name,
          price,
          category,
          is_available
        )
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.textSearch('search_vector', search.trim().split(' ').join(' & '))
    }

    if (cuisine_types) {
      const cuisines = cuisine_types.split(',').map(c => c.trim())
      query = query.overlaps('cuisine_types', cuisines)
    }

    if (price_range) {
      const ranges = price_range.split(',').map(Number).filter(n => n >= 1 && n <= 4)
      if (ranges.length > 0) {
        query = query.in('price_range', ranges)
      }
    }

    if (dietary_options) {
      const options = dietary_options.split(',').map(o => o.trim())
      query = query.overlaps('dietary_options', options)
    }

    if (verified_only) {
      query = query.eq('verified', true)
    }

    // Location-based filtering
    if (latitude && longitude) {
      // Use PostGIS functions for distance calculation
      query = query.rpc('restaurants_within_distance', {
        center_lat: latitude,
        center_lng: longitude,
        distance_km
      })
    }

    // Apply sorting
    if (sort === 'distance' && latitude && longitude) {
      // Distance sorting is handled by the PostGIS function
    } else {
      query = query.order(sort, { ascending: order === 'asc' })
    }

    // Apply pagination
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data: restaurants, error, count } = await query

    if (error) {
      console.error('Failed to search restaurants:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to search restaurants'
      }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: PaginatedResponse<typeof restaurants> = {
      success: true,
      data: restaurants,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Restaurant search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST - Create new restaurant (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const body = await request.json()
    const validation = restaurantSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }

    const restaurantData = validation.data

    // Generate slug from name
    const slug = restaurantData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100)

    // Check if slug already exists
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .single()

    let finalSlug = slug
    if (existingRestaurant) {
      // Add random suffix if slug exists
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      finalSlug = `${slug}-${randomSuffix}`
    }

    const restaurantInsert: RestaurantInsert = {
      ...restaurantData,
      slug: finalSlug,
      verified: false // New restaurants start unverified
    }

    const { data: restaurant, error: insertError } = await supabase
      .from('restaurants')
      .insert([restaurantInsert])
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create restaurant:', insertError)
      
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: false,
          error: 'Restaurant with this name already exists at this location'
        }, { status: 409 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create restaurant'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { restaurant },
      message: 'Restaurant created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create restaurant error:', error)
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}