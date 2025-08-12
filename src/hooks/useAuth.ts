import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  profileImage?: string
  bio?: string
  location?: string
  dietaryRestrictions?: string[]
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Skip initialization if supabase client is not available (during SSR/build)
    if (!supabase) {
      setAuthState({ user: null, loading: false, error: null })
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setAuthState({ user: null, loading: false, error: error.message })
          return
        }

        if (session?.user) {
          // Fetch user profile
          const response = await fetch('/api/auth/me')
          if (response.ok) {
            const data = await response.json()
            setAuthState({ user: data.user, loading: false, error: null })
          } else {
            // Fallback to basic user data
            setAuthState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                displayName: session.user.user_metadata?.display_name,
                firstName: session.user.user_metadata?.first_name,
                lastName: session.user.user_metadata?.last_name
              },
              loading: false,
              error: null
            })
          }
        } else {
          setAuthState({ user: null, loading: false, error: null })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState({ user: null, loading: false, error: 'Failed to initialize authentication' })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const response = await fetch('/api/auth/me')
            if (response.ok) {
              const data = await response.json()
              setAuthState({ user: data.user, loading: false, error: null })
            } else {
              setAuthState({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                  displayName: session.user.user_metadata?.display_name,
                  firstName: session.user.user_metadata?.first_name,
                  lastName: session.user.user_metadata?.last_name
                },
                loading: false,
                error: null
              })
            }
          } catch (error) {
            console.error('User profile fetch error:', error)
            setAuthState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                displayName: session.user.user_metadata?.display_name,
                firstName: session.user.user_metadata?.first_name,
                lastName: session.user.user_metadata?.last_name
              },
              loading: false,
              error: null
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, loading: false, error: null })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (userData: {
    email: string
    password: string
    displayName: string
    firstName: string
    lastName: string
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setAuthState(prev => ({ ...prev, loading: false, error: null }))
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      // Use Supabase client directly for authentication
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        // Check if it's an email not confirmed error
        if (authError.message.includes('Email not confirmed')) {
          const error = new Error('Email not verified')
          ;(error as any).code = 'EMAIL_NOT_VERIFIED'
          ;(error as any).email = email
          throw error
        }
        throw new Error(authError.message)
      }

      if (!authData.user || !authData.session) {
        throw new Error('Invalid credentials')
      }

      // The auth state will be updated by the onAuthStateChange listener
      // So we just need to wait a moment for it to trigger
      setTimeout(() => {
        setAuthState(prev => ({ ...prev, loading: false }))
      }, 100)
      
      return { success: true, data: authData }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      
      // Return additional error data if available
      return { 
        success: false, 
        error: errorMessage,
        code: (error as any).code,
        email: (error as any).email,
        data: (error as any).data
      }
    }
  }

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setAuthState({ user: null, loading: false, error: null })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      setAuthState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut
  }
}