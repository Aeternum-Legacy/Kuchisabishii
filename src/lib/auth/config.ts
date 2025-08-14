import { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import { createClient } from '@/lib/supabase/server'

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const supabase = await createClient()
          
          // Check if user exists in Supabase
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single()
          
          if (!existingUser) {
            // Create user in Supabase if doesn't exist
            const { error } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email!,
                display_name: user.name || '',
                first_name: user.name?.split(' ')[0] || '',
                last_name: user.name?.split(' ').slice(1).join(' ') || '',
                profile_image_url: user.image,
                email_verified: true, // Google OAuth users are pre-verified
                privacy_level: 'friends',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            
            if (error) {
              console.error('Failed to create user in Supabase:', error)
              return false
            }
          }
          
          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          const supabase = await createClient()
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .single()
          
          if (profile) {
            session.user.id = profile.id
            session.user.displayName = profile.display_name
            session.user.firstName = profile.first_name
            session.user.lastName = profile.last_name
            session.user.profileImage = profile.profile_image_url
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to home page after successful authentication
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
}