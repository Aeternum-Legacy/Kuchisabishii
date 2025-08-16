import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // Return basic user data if profile fetch fails
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.display_name,
          firstName: user.user_metadata?.first_name,
          lastName: user.user_metadata?.last_name,
          onboardingCompleted: false // Default to false if profile not found
        }
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: profile.display_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        profileImage: profile.profile_image_url,
        bio: profile.bio,
        location: profile.location,
        dietaryRestrictions: profile.dietary_restrictions,
        onboardingCompleted: profile.onboarding_completed || false,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}