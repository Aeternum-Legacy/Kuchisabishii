/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components
  serverExternalPackages: ['@supabase/ssr'],
  
  // Better handling of environment variables with proper URL resolution
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Environment-aware URL resolution (matches src/lib/env.ts logic)
    // Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > localhost fallback
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                         (process.env.NODE_ENV === 'development' ? 
                          `http://localhost:${process.env.PORT || '3000'}` : 
                          undefined)),
  },
  
  // Generate proper build ID for cache busting
  generateBuildId: async () => {
    // Use git commit hash or timestamp for proper cache invalidation
    return process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString()
  }
}

module.exports = nextConfig