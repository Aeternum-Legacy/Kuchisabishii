import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json({
        authenticated: false,
        error: error.message
      })
    }
    
    if (session?.user) {
      // Check if profile exists and is complete
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          ...session.user.user_metadata
        },
        profile,
        needsOnboarding: !profile?.onboarding_completed,
        redirectTo: profile?.onboarding_completed ? '/dashboard' : '/onboarding'
      })
    }
    
    return NextResponse.json({
      authenticated: false,
      user: null
    })
    
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}