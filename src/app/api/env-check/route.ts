import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironmentConfig, getEnvironmentInfo } from '@/lib/env'

/**
 * Environment Configuration Check API
 * Provides runtime validation of environment configuration
 */
export async function GET(request: NextRequest) {
  try {
    const validation = validateEnvironmentConfig()
    const envInfo = getEnvironmentInfo()
    
    // Only show detailed info in development
    const isDevelopment = envInfo.environment === 'development'
    
    const response = {
      environment: envInfo.environment,
      isValid: validation.isValid,
      timestamp: new Date().toISOString(),
      ...(isDevelopment && {
        // Detailed info only in development
        details: {
          baseUrl: envInfo.baseUrl,
          errors: validation.errors,
          warnings: validation.warnings,
          config: {
            hasNextAuthUrl: !!envInfo.nextAuthUrl,
            hasAppUrl: !!envInfo.appUrl,
            isVercel: envInfo.isVercel,
            nodeEnv: envInfo.nodeEnv,
            vercelEnv: envInfo.vercelEnv
          }
        }
      })
    }
    
    // Return appropriate status code
    const status = validation.isValid ? 200 : 500
    
    return NextResponse.json(response, { 
      status,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Environment check failed:', error)
    
    return NextResponse.json({
      environment: 'unknown',
      isValid: false,
      error: 'Environment check failed',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}