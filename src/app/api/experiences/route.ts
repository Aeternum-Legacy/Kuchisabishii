import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const foodExperienceSchema = z.object({
  foodName: z.string().min(1, 'Food name is required'),
  restaurantName: z.string().optional(),
  location: z.string().optional(),
  cuisineType: z.string().optional(),
  foodType: z.string().optional(),
  mealTime: z.enum(['breakfast', 'brunch', 'lunch', 'dinner', 'dessert', 'snack']),
  diningMethod: z.enum(['homemade', 'dine-in', 'takeout', 'delivery']),
  dateEaten: z.string(),
  cost: z.number().optional(),
  experienceText: z.string().optional(),
  
  // Taste ratings (0-10)
  sweet: z.number().min(0).max(10),
  savory: z.number().min(0).max(10),
  sour: z.number().min(0).max(10),
  spicy: z.number().min(0).max(10),
  umami: z.number().min(0).max(10),
  bitter: z.number().min(0).max(10),
  
  // Experience rating
  experienceRating: z.enum(['never-again', 'occasionally', 'frequently', 'kuchisabishii']),
  
  // Privacy
  privacyLevel: z.enum(['private', 'friends', 'public']).default('friends'),
  
  // Media (for future implementation)
  images: z.array(z.string()).default([])
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { data: experiences, error } = await supabase
      .from('food_experiences')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch experiences:', error)
      return NextResponse.json(
        { error: 'Failed to load experiences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ experiences })

  } catch (error) {
    console.error('Get experiences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = foodExperienceSchema.parse(body)

    // Create food experience record
    const { data: experience, error } = await supabase
      .from('food_experiences')
      .insert({
        user_id: user.id,
        food_name: validatedData.foodName,
        restaurant_name: validatedData.restaurantName,
        location: validatedData.location,
        cuisine_type: validatedData.cuisineType,
        food_type: validatedData.foodType,
        meal_time: validatedData.mealTime,
        dining_method: validatedData.diningMethod,
        date_eaten: validatedData.dateEaten,
        cost: validatedData.cost,
        experience_text: validatedData.experienceText,
        sweet: validatedData.sweet,
        savory: validatedData.savory,
        sour: validatedData.sour,
        spicy: validatedData.spicy,
        umami: validatedData.umami,
        bitter: validatedData.bitter,
        experience_rating: validatedData.experienceRating,
        privacy_level: validatedData.privacyLevel,
        images: validatedData.images
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create experience:', error)
      return NextResponse.json(
        { error: 'Failed to save food experience' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Food experience saved successfully',
      experience
    }, { status: 201 })

  } catch (error) {
    console.error('Create experience error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}