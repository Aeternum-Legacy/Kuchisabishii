import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const start = Date.now()
  const checks: Record<string, any> = {}

  try {
    // Check environment variables
    checks.environment = {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasGoogleOAuth: !!process.env.GOOGLE_CLIENT_ID,
      hasEmailConfig: !!process.env.EMAIL_FROM,
      status: 'healthy'
    }

    // Check database connection
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single()

      checks.database = {
        status: error ? 'unhealthy' : 'healthy',
        error: error?.message,
        responseTime: Date.now() - start
      }
    } catch (err) {
      checks.database = {
        status: 'unhealthy',
        error: err instanceof Error ? err.message : 'Unknown database error',
        responseTime: Date.now() - start
      }
    }

    // System health
    checks.system = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      status: 'healthy'
    }

    // Overall health determination
    const isHealthy = checks.database.status === 'healthy'
    const overallStatus = isHealthy ? 'healthy' : 'unhealthy'
    const statusCode = isHealthy ? 200 : 503

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - start,
        version: process.env.npm_package_version || '1.0.0',
        checks
      },
      { status: statusCode }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Health check failed',
        checks
      },
      { status: 503 }
    )
  }
}