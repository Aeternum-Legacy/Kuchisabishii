import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClientFromRequest } from '@/lib/supabase/server-alternative'
import { createClient as createFixedClient } from '@/lib/supabase/server-fixed'
import { createClientWithToken } from '@/lib/supabase/server-with-token'

export async function POST(request: NextRequest) {
  try {
    console.log('✅ /api/onboarding/complete called')
    
    // Try token-based client first (most reliable in Vercel)
    let supabase
    let clientType = 'unknown'
    
    try {
      supabase = await createClientWithToken(request)
      clientType = 'token-based'
      console.log('✅ Token-based client created for onboarding')
    } catch (tokenError) {
      console.log('❌ Token-based client failed for onboarding:', tokenError)
      
      // Try multiple fallback approaches
      try {
        supabase = await createFixedClient()
        clientType = 'fixed'
        console.log('✅ Fixed server client created for onboarding')
      } catch (error) {
        console.log('❌ Fixed server client failed for onboarding:', error)
        
        // Fallback to standard client
        try {
          supabase = await createClient()
          clientType = 'standard'
          console.log('✅ Standard server client created for onboarding')
        } catch (standardError) {
          console.log('❌ Standard server client failed for onboarding:', standardError)
          
          // Final fallback to request-based client
          try {
            supabase = await createClientFromRequest(request)
            clientType = 'request-based'
            console.log('✅ Request-based client created as final fallback for onboarding')
          } catch (fallbackError) {
            console.log('❌ All client creation methods failed for onboarding:', fallbackError)
            throw fallbackError
          }
        }
      }
    }
    
    console.log('📊 Using client type for onboarding:', clientType)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('👤 onboarding getUser() result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      errorCode: authError?.message,
      timestamp: new Date().toISOString()
    })
    
    if (authError || !user) {
      console.log('❌ Onboarding authentication failed:', authError?.message || 'No user')
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
      console.error('Failed to update onboarding status:', updateError)
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
    console.error('Onboarding completion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}