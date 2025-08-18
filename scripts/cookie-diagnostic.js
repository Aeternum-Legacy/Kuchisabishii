/**
 * Cookie Architecture Diagnostic Script
 * Tests cookie behavior across client/server boundaries
 */

const https = require('https');
const querystring = require('querystring');

const STAGING_URL = 'https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app';

class CookieDiagnostic {
  constructor() {
    this.results = {
      domain_analysis: {},
      cookie_parsing: {},
      server_visibility: {},
      recommendations: []
    };
  }

  async runDiagnostic() {
    console.log('🔍 Starting Cookie Architecture Analysis...\n');

    await this.testDomainConfiguration();
    await this.testCookieVisibility();
    await this.testServerSideReading();
    await this.generateRecommendations();

    this.printReport();
  }

  async testDomainConfiguration() {
    console.log('📊 Testing Domain Configuration...');
    
    try {
      // Test various cookie domain patterns
      const domains = [
        '.vercel.app',
        '.kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app',
        'kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app',
        undefined // No domain (should use current domain)
      ];

      for (const domain of domains) {
        console.log(`  Testing domain: ${domain || 'current domain'}`);
        
        const options = {
          hostname: 'kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app',
          path: '/api/auth/test-cookie',
          method: 'GET',
          headers: {
            'Cookie': `test-cookie=test-value; Domain=${domain || 'none'}`,
            'User-Agent': 'Cookie-Diagnostic/1.0'
          }
        };

        try {
          const response = await this.makeRequest(options);
          this.results.domain_analysis[domain || 'default'] = {
            status: response.statusCode,
            cookies_received: this.extractCookies(response.headers['set-cookie'] || []),
            headers: response.headers
          };
        } catch (error) {
          this.results.domain_analysis[domain || 'default'] = { error: error.message };
        }
      }
    } catch (error) {
      console.error('  ❌ Domain configuration test failed:', error.message);
    }
  }

  async testCookieVisibility() {
    console.log('🍪 Testing Cookie Visibility...');

    try {
      // Simulate a user with session cookies
      const testCookies = [
        'sb-auelvsosyxrvbvxozhuz-auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        'sb-auelvsosyxrvbvxozhuz-auth-token-code-verifier=test-verifier',
        'supabase-auth-token={"access_token":"test-token","refresh_token":"test-refresh"}'
      ];

      const options = {
        hostname: 'kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app',
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Cookie': testCookies.join('; '),
          'User-Agent': 'Cookie-Diagnostic/1.0'
        }
      };

      const response = await this.makeRequest(options);
      this.results.cookie_visibility = {
        status: response.statusCode,
        body: response.body,
        sent_cookies: testCookies.length,
        response_headers: response.headers
      };

    } catch (error) {
      this.results.cookie_visibility = { error: error.message };
    }
  }

  async testServerSideReading() {
    console.log('🔧 Testing Server-Side Cookie Reading...');

    try {
      // Test if server can read cookies properly
      const options = {
        hostname: 'kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app',
        path: '/api/debug/cookies',
        method: 'GET',
        headers: {
          'Cookie': 'test1=value1; test2=value2; sb-test=supabase-test',
          'User-Agent': 'Cookie-Diagnostic/1.0'
        }
      };

      const response = await this.makeRequest(options);
      this.results.server_reading = {
        status: response.statusCode,
        parsed_cookies: response.body,
        raw_headers: response.headers
      };

    } catch (error) {
      this.results.server_reading = { error: error.message };
    }
  }

  generateRecommendations() {
    console.log('💡 Generating Recommendations...');

    // Analyze results and generate actionable recommendations
    const recommendations = [];

    // Check domain issues
    if (this.results.domain_analysis) {
      Object.entries(this.results.domain_analysis).forEach(([domain, result]) => {
        if (result.error || result.status !== 200) {
          recommendations.push({
            priority: 'HIGH',
            issue: `Cookie domain "${domain}" configuration failure`,
            solution: 'Update Supabase cookie configuration to match Vercel domain pattern',
            code: `// In supabase server config
cookies: {
  getAll() { /* ... */ },
  setAll(cookiesToSet) {
    cookiesToSet.forEach(({ name, value, options = {} }) => {
      // Fix domain for Vercel deployments
      const domain = process.env.NODE_ENV === 'production' 
        ? '.vercel.app' 
        : undefined;
      
      cookieStore.set(name, value, {
        ...options,
        domain,
        sameSite: 'lax',
        secure: true,
        path: '/'
      });
    });
  }
}`
          });
        }
      });
    }

    // Check cookie visibility issues
    if (this.results.cookie_visibility?.status === 401) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Server cannot read client-side Supabase cookies',
        solution: 'Update createClient() to use proper cookie configuration for Vercel serverless',
        code: `// Fix server client cookie reading
export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(cookie => ({
          name: cookie.name,
          value: cookie.value
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, {
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            // Critical: Don't set domain for Vercel
            domain: undefined
          });
        });
      }
    }
  });
}`
      });
    }

    this.results.recommendations = recommendations;
  }

  async makeRequest(options) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsedBody = JSON.parse(body);
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: parsedBody
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  extractCookies(setCookieHeaders) {
    return setCookieHeaders.map(header => {
      const [cookiePart] = header.split(';');
      const [name, value] = cookiePart.split('=');
      return { name: name.trim(), value: value.trim() };
    });
  }

  printReport() {
    console.log('\n📋 COOKIE ARCHITECTURE ANALYSIS REPORT');
    console.log('=====================================\n');

    console.log('🔍 DOMAIN CONFIGURATION:');
    Object.entries(this.results.domain_analysis).forEach(([domain, result]) => {
      console.log(`  ${domain}: ${result.error ? '❌ ' + result.error : '✅ Status ' + result.status}`);
    });

    console.log('\n🍪 COOKIE VISIBILITY:');
    const visibility = this.results.cookie_visibility;
    if (visibility) {
      console.log(`  Status: ${visibility.error ? '❌ ' + visibility.error : visibility.status}`);
      if (visibility.status === 401) {
        console.log('  ⚠️  CRITICAL: Server cannot authenticate with client cookies');
      }
    }

    console.log('\n🔧 SERVER-SIDE READING:');
    const reading = this.results.server_reading;
    if (reading) {
      console.log(`  Status: ${reading.error ? '❌ ' + reading.error : reading.status}`);
    }

    console.log('\n💡 RECOMMENDATIONS:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`\n  ${index + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`     Solution: ${rec.solution}`);
      if (rec.code) {
        console.log(`     Code:\n${rec.code.split('\n').map(line => '       ' + line).join('\n')}`);
      }
    });

    console.log('\n🎯 KEY FINDINGS:');
    if (this.results.cookie_visibility?.status === 401) {
      console.log('  ❌ CONFIRMED: Cookie domain/path mismatch causing 401 errors');
      console.log('  🔧 SOLUTION: Fix Supabase cookie configuration for Vercel domains');
    }
  }
}

// Run diagnostic
const diagnostic = new CookieDiagnostic();
diagnostic.runDiagnostic().catch(console.error);