/**
 * Simplified Recommendations API for Testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Return mock recommendations for testing
    return NextResponse.json({
      success: true,
      data: {
        recommendations: [
          {
            id: '1',
            name: 'Spicy Tuna Roll',
            restaurant: 'Sushi Palace',
            score: 0.95,
            confidence: 0.89,
            cuisine_type: 'japanese',
            predicted_rating: 4.7
          },
          {
            id: '2', 
            name: 'Margherita Pizza',
            restaurant: 'Tony\'s Italian',
            score: 0.92,
            confidence: 0.85,
            cuisine_type: 'italian',
            predicted_rating: 4.5
          }
        ],
        algorithm_version: 'phase5-test',
        processing_time_ms: 150
      }
    })

  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}