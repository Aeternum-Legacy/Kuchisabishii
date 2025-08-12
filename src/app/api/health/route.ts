import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasNextAuthUrl = !!process.env.NEXTAUTH_URL
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
  
  // Create health check response
  const health = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      supabase_url: hasSupabaseUrl,
      supabase_key: hasSupabaseKey,
      nextauth_url: hasNextAuthUrl,
      nextauth_secret: hasNextAuthSecret,
    },
    supabase: {
      url_prefix: hasSupabaseUrl ? process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' : 'NOT SET',
      key_length: hasSupabaseKey ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length : 0
    }
  }
  
  // Determine overall status
  const allChecksPass = hasSupabaseUrl && hasSupabaseKey
  health.status = allChecksPass ? 'healthy' : 'unhealthy'
  
  // Try to connect to Supabase
  if (allChecksPass) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        health.status = 'degraded'
        health.checks['database'] = false
        health['database_error'] = error.message
      } else {
        health.checks['database'] = true
      }
    } catch (error) {
      health.status = 'degraded'
      health.checks['database'] = false
      health['database_error'] = error instanceof Error ? error.message : 'Unknown error'
    }
  }
  
  return NextResponse.json(health, { 
    status: health.status === 'healthy' ? 200 : 503 
  })
}