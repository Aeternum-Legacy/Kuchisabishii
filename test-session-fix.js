// Quick test script to verify session handling fix
// Run with: node test-session-fix.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3008';

async function testSessionEndpoints() {
  console.log('🧪 Testing session handling fix...\n');
  
  // Test with a mock session cookie (replace with real one from browser)
  const mockSessionCookie = 'sb-localhost-auth-token=mock-session-token; sb-localhost-auth-token.1=additional-token-data';
  
  const endpoints = [
    '/api/debug/session',
    '/api/auth/me',
    '/api/onboarding/complete'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`📡 Testing ${endpoint}...`);
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: endpoint === '/api/onboarding/complete' ? 'POST' : 'GET',
        headers: {
          'Cookie': mockSessionCookie,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.log(`   ❌ Error:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('✅ Test complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Open browser and login via OAuth');
  console.log('2. Copy actual session cookies from browser dev tools');
  console.log('3. Replace mockSessionCookie with real cookies and test again');
  console.log('4. Check server logs for detailed debugging output');
}

testSessionEndpoints().catch(console.error);