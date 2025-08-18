import { createClient } from '@/lib/supabase/server'
import { createClientFromRequest } from '@/lib/supabase/server-alternative'
import { createClient as createFixedClient } from '@/lib/supabase/server-fixed'
import { createClientWithToken } from '@/lib/supabase/server-with-token'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 /api/auth/me called')
    
    // Try token-based client first (most reliable in Vercel)
    let supabase
    let clientType = 'unknown'
    
    try {
      supabase = await createClientWithToken(request)
      clientType = 'token-based'
      console.log('✅ Token-based client created')
    } catch (tokenError) {
      console.log('❌ Token-based client failed:', tokenError)
      
      // Try multiple fallback approaches
      try {
        supabase = await createFixedClient()
        clientType = 'fixed'
        console.log('✅ Fixed server client created')
      } catch (error) {
        console.log('❌ Fixed server client failed:', error)
        
        // Fallback to standard client
        try {
          supabase = await createClient()
          clientType = 'standard'
          console.log('✅ Standard server client created')
        } catch (standardError) {
          console.log('❌ Standard server client failed:', standardError)
          
          // Final fallback to request-based client
          try {
            supabase = await createClientFromRequest(request)
            clientType = 'request-based'
            console.log('✅ Request-based client created as final fallback')
          } catch (fallbackError) {
            console.log('❌ All client creation methods failed:', fallbackError)
            throw fallbackError
          }
        }
      }
    }
    
    console.log('📊 Using client type:', clientType)
    
    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('👤 getUser() result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      errorCode: userError?.message,
      timestamp: new Date().toISOString()
    })

    if (userError || !user) {
      console.log('❌ Authentication failed:', userError?.message || 'No user')
      return NextResponse.json(
        { error: 'Not authenticated', details: userError?.message },
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