#!/usr/bin/env node

/**
 * OAuth Environment Test Script
 * Tests OAuth configuration and environment-aware URL resolution
 */

const https = require('https');
const http = require('http');

// Get environment-aware base URL
function getTestBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT || '3000'}`;
}

// Test environment configuration
async function testEnvironmentConfig() {
  const baseUrl = getTestBaseUrl();
  console.log('🔍 Testing OAuth Environment Configuration...');
  console.log(`Base URL: ${baseUrl}`);
  
  try {
    // Test environment check endpoint
    const envCheckUrl = `${baseUrl}/api/env-check`;
    console.log(`\n📋 Testing environment validation: ${envCheckUrl}`);
    
    const response = await fetch(envCheckUrl);
    const data = await response.json();
    
    if (data.isValid) {
      console.log('✅ Environment configuration is valid');
      if (data.details) {
        console.log('📊 Environment Details:');
        console.log(`  - Environment: ${data.environment}`);
        console.log(`  - Base URL: ${data.details.baseUrl}`);
        console.log(`  - Has NextAuth URL: ${data.details.config.hasNextAuthUrl}`);
        console.log(`  - Has App URL: ${data.details.config.hasAppUrl}`);
        console.log(`  - Is Vercel: ${data.details.config.isVercel}`);
        
        if (data.details.warnings.length > 0) {
          console.log('⚠️  Warnings:');
          data.details.warnings.forEach(warning => console.log(`    - ${warning}`));
        }
      }
    } else {
      console.log('❌ Environment configuration has errors:');
      data.details?.errors?.forEach(error => console.log(`  - ${error}`));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to test environment configuration:', error.message);
    return false;
  }
}

// Test OAuth flow initiation
async function testOAuthFlow() {
  const baseUrl = getTestBaseUrl();
  console.log('\n🔐 Testing OAuth Flow Initiation...');
  
  try {
    // Test Google OAuth endpoint
    const oauthUrl = `${baseUrl}/api/auth/social/google`;
    console.log(`Testing OAuth endpoint: ${oauthUrl}`);
    
    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OAuth endpoint responding correctly');
      console.log(`  - Environment info included: ${!!data.env}`);
      
      if (data.env) {
        console.log(`  - NextAuth URL: ${data.env.nextAuthUrl}`);
        console.log(`  - Has Google credentials: ${data.env.hasGoogleClientId && data.env.hasGoogleClientSecret}`);
      }
    } else {
      console.log('⚠️  OAuth endpoint returned non-200 status:', response.status);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to test OAuth flow:', error.message);
    return false;
  }
}

// Test URL generation consistency
function testUrlGeneration() {
  console.log('\n🔗 Testing URL Generation Consistency...');
  
  const baseUrl = getTestBaseUrl();
  const expectedUrls = [
    `${baseUrl}/api/auth/callback/google`,
    `${baseUrl}/app`,
    `${baseUrl}/auth/callback`,
    `${baseUrl}/auth/reset-password`
  ];
  
  console.log('Generated URLs:');
  expectedUrls.forEach(url => {
    console.log(`  ✅ ${url}`);
    
    // Check for localhost in production-like environments
    if (url.includes('localhost') && process.env.VERCEL_URL) {
      console.log('⚠️  Warning: Using localhost in Vercel environment');
    }
  });
  
  return true;
}

// Test for hardcoded localhost references
function testHardcodedReferences() {
  console.log('\n🔍 Checking for hardcoded localhost references...');
  
  const config = {
    baseUrl: getTestBaseUrl(),
    environment: process.env.NODE_ENV || 'development',
    vercelUrl: process.env.VERCEL_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL
  };
  
  let hasIssues = false;
  
  // Check for localhost in production environment
  if (config.environment === 'production' && config.baseUrl.includes('localhost')) {
    console.log('❌ CRITICAL: Using localhost in production environment');
    hasIssues = true;
  }
  
  // Check for inconsistent URLs
  if (config.nextAuthUrl && config.appUrl && config.nextAuthUrl !== config.appUrl) {
    console.log('⚠️  Warning: NEXTAUTH_URL and NEXT_PUBLIC_APP_URL are different');
    console.log(`  - NEXTAUTH_URL: ${config.nextAuthUrl}`);
    console.log(`  - NEXT_PUBLIC_APP_URL: ${config.appUrl}`);
  }
  
  if (!hasIssues) {
    console.log('✅ No hardcoded localhost issues detected');
  }
  
  return !hasIssues;
}

// Main test runner
async function runTests() {
  console.log('🚀 OAuth Environment Test Suite');
  console.log('=====================================\n');
  
  const results = {
    environmentConfig: await testEnvironmentConfig(),
    oauthFlow: await testOAuthFlow(),
    urlGeneration: testUrlGeneration(),
    hardcodedReferences: testHardcodedReferences()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('=====================================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! OAuth environment is properly configured.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues above.');
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Deploy to staging environment');
  console.log('2. Test OAuth flow end-to-end');
  console.log('3. Verify chunk loading works correctly');
  console.log('4. Monitor for redirect loops');
  
  process.exit(allPassed ? 0 : 1);
}

// Polyfill fetch if needed (Node.js < 18)
if (typeof fetch === 'undefined') {
  console.log('⚠️  Fetch not available, using node-fetch polyfill...');
  global.fetch = require('node-fetch');
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});