import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.user) {
        // Check if this is a new user from social login
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // If no profile exists, create one from social login data
        if (profileError?.code === 'PGRST116' || !existingProfile) {
          const userMetadata = data.user.user_metadata || {}
          const email = data.user.email || ''
          
          // Extract name information from different social providers
          let firstName = userMetadata.first_name || userMetadata.given_name || ''
          let lastName = userMetadata.last_name || userMetadata.family_name || ''
          let displayName = userMetadata.name || userMetadata.full_name || 
                           `${firstName} ${lastName}`.trim() || 
                           email.split('@')[0]

          // For Apple Sign In, name might come differently
          if (userMetadata.provider === 'apple' && userMetadata.name) {
            firstName = userMetadata.name.firstName || firstName
            lastName = userMetadata.name.lastName || lastName
          }

          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              display_name: displayName,
              first_name: firstName,
              last_name: lastName,
              privacy_level: 'friends',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            console.error('Social login profile creation error:', insertError)
            // Continue anyway - user can complete profile later
          }
        }
        
        // Redirect to the app after successful authentication
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(new URL('/?error=auth_session_error', requestUrl.origin))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // If there's an error, redirect to login with error message
  return NextResponse.redirect(new URL('/?error=auth_callback_error', requestUrl.origin))
}