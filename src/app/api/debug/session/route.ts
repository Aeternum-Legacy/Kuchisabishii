import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClientFromRequest } from '@/lib/supabase/server-alternative'

export async function GET(request: NextRequest) {
  console.log('🐛 DEBUG: Session endpoint called')
  
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    cookieHeader: request.headers.get('cookie'),
    allHeaders: Object.fromEntries(request.headers.entries()),
    url: request.url
  }

  try {
    // Test standard server client
    console.log('🧪 Testing standard server client...')
    const standardClient = await createClient()
    const { data: standardUser, error: standardError } = await standardClient.auth.getUser()
    
    debugInfo.standardClient = {
      hasUser: !!standardUser,
      userId: standardUser?.id,
      error: standardError?.message
    }

    // Test request-based client
    console.log('🧪 Testing request-based client...')
    const requestClient = await createClientFromRequest(request)
    const { data: requestUser, error: requestError } = await requestClient.auth.getUser()
    
    debugInfo.requestClient = {
      hasUser: !!requestUser,
      userId: requestUser?.id,
      error: requestError?.message
    }

    // Test manual cookie parsing
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = cookieHeader
      .split(';')
      .filter(Boolean)
      .map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return {
          name: name.trim(),
          value: rest.join('=').trim()
        }
      })
    
    debugInfo.cookieAnalysis = {
      totalCookies: cookies.length,
      supabaseCookies: cookies.filter(c => c.name.includes('supabase')),
      authCookies: cookies.filter(c => c.name.includes('auth')),
      sessionCookies: cookies.filter(c => c.name.includes('session'))
    }

    console.log('🐛 Debug info collected:', debugInfo)

    return NextResponse.json({
      success: true,
      debug: debugInfo
    })

  } catch (error) {
    console.error('🚨 Debug endpoint error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: debugInfo
    }, { status: 500 })
  }
}