import { NextRequest, NextResponse } from 'next/server'
import { createClient, createClientWithToken, createClientFromRequest } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Try token-based auth first, then fallback to cookie-based
    let supabase
    
    try {
      supabase = await createClientWithToken(request)
    } catch (tokenError) {
      try {
        supabase = await createClientFromRequest(request)
      } catch (requestError) {
        supabase = await createClient()
      }
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        details: authError?.message
      }, { status: 401 })
    }

    // Mark onboarding as completed in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update onboarding status'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}