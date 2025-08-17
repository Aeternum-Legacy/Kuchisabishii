// DEPRECATED: NextAuth configuration removed
// Application now uses ONLY Supabase native OAuth
// See: src/hooks/useAuth.ts and src/app/api/auth/callback/google/route.ts

export const authConfig = {
  // This file is kept for legacy compatibility but is no longer used
  deprecated: true,
  message: 'Use Supabase native OAuth instead'
}