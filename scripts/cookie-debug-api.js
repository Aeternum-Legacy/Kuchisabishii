/**
 * Cookie Debug API Route Test
 * Creates a temporary API endpoint to debug cookie issues
 */

const cookieDebugRoute = `
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const requestUrl = new URL(request.url);
    const allCookies = cookieStore.getAll();
    
    // Extract cookies directly from request headers
    const cookieHeader = request.headers.get('cookie') || '';
    const parsedCookies = cookieHeader
      .split(';')
      .filter(Boolean)
      .map(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        return {
          name: name.trim(),
          value: rest.join('=').trim()
        };
      });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        host: requestUrl.host,
        origin: requestUrl.origin,
        userAgent: request.headers.get('user-agent')
      },
      cookies: {
        fromNextCookies: allCookies,
        fromRequestHeaders: parsedCookies,
        rawCookieHeader: cookieHeader,
        supabaseCookies: {
          nextCookies: allCookies.filter(c => 
            c.name.includes('supabase') || c.name.startsWith('sb-')
          ),
          headerCookies: parsedCookies.filter(c => 
            c.name.includes('supabase') || c.name.startsWith('sb-')
          )
        }
      },
      diagnosis: {
        cookieCountMismatch: allCookies.length !== parsedCookies.length,
        hasSupabaseCookies: allCookies.some(c => 
          c.name.includes('supabase') || c.name.startsWith('sb-')
        ),
        cookieParsingWorking: cookieHeader.length > 0,
        serverCanReadCookies: allCookies.length > 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Cookie debug failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
`;

console.log('Cookie Debug API Route:');
console.log('File: src/app/api/debug/cookies/route.ts');
console.log(cookieDebugRoute);

// Write the debug route
require('fs').writeFileSync(
  'src/app/api/debug/cookies/route.ts',
  cookieDebugRoute.trim()
);

console.log('\n✅ Cookie debug API route created!');
console.log('📝 Test it at: https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/api/debug/cookies');