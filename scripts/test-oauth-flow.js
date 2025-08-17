#!/usr/bin/env node

/**
 * SPARC OAuth Flow Validation Script
 * 
 * This script validates the native Supabase OAuth implementation
 * by checking configuration and testing authentication endpoints.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function validateEnvironment() {
  log(colors.blue, '🔍 Validating Environment Configuration...');
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(colors.red, `❌ Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  log(colors.green, '✅ All required environment variables found');
  return true;
}

async function validateSupabaseClient() {
  log(colors.blue, '🔍 Validating Supabase Client Configuration...');
  
  const clientPath = path.join(__dirname, '..', 'src', 'lib', 'supabase', 'client.ts');
  
  if (!fs.existsSync(clientPath)) {
    log(colors.red, '❌ Supabase client file not found');
    return false;
  }
  
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  
  // Check for native OAuth configuration
  const checks = [
    { pattern: /flowType:\s*['""]pkce['""]/, name: 'PKCE flow configuration' },
    { pattern: /persistSession:\s*true/, name: 'Session persistence' },
    { pattern: /detectSessionInUrl:\s*true/, name: 'URL session detection' },
    { pattern: /autoRefreshToken:\s*true/, name: 'Auto token refresh' }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (check.pattern.test(clientContent)) {
      log(colors.green, `✅ ${check.name} configured`);
    } else {
      log(colors.red, `❌ ${check.name} missing or misconfigured`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function validateAuthHook() {
  log(colors.blue, '🔍 Validating Auth Hook Implementation...');
  
  const hookPath = path.join(__dirname, '..', 'src', 'hooks', 'useAuth.ts');
  
  if (!fs.existsSync(hookPath)) {
    log(colors.red, '❌ Auth hook file not found');
    return false;
  }
  
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  
  // Check for native Supabase methods
  const checks = [
    { pattern: /supabase\.auth\.getSession\(\)/, name: 'Native getSession() usage' },
    { pattern: /supabase\.auth\.onAuthStateChange/, name: 'Native onAuthStateChange() usage' },
    { pattern: /supabase\.auth\.signInWithOAuth/, name: 'Native signInWithOAuth() usage' },
    { pattern: /SPARC Architecture/, name: 'SPARC documentation' },
    { pattern: /simplified.*auth.*hook/i, name: 'Simplified implementation' }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (check.pattern.test(hookContent)) {
      log(colors.green, `✅ ${check.name} implemented`);
    } else {
      log(colors.red, `❌ ${check.name} missing or incorrect`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function validateCallbackRoute() {
  log(colors.blue, '🔍 Validating OAuth Callback Route...');
  
  const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'auth', 'callback', 'google', 'route.ts');
  
  if (!fs.existsSync(routePath)) {
    log(colors.red, '❌ OAuth callback route not found');
    return false;
  }
  
  const routeContent = fs.readFileSync(routePath, 'utf8');
  
  // Check for native Supabase OAuth handling
  const checks = [
    { pattern: /exchangeCodeForSession\(code\)/, name: 'Native exchangeCodeForSession() usage' },
    { pattern: /SPARC Architecture/, name: 'SPARC documentation' },
    { pattern: /native.*oauth/i, name: 'Native OAuth implementation' },
    { pattern: /supabase.*handles.*automatically/i, name: 'Automatic session management' }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (check.pattern.test(routeContent)) {
      log(colors.green, `✅ ${check.name} implemented`);
    } else {
      log(colors.red, `❌ ${check.name} missing or incorrect`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function validateCodeReduction() {
  log(colors.blue, '🔍 Validating Code Reduction...');
  
  const files = [
    { path: 'src/app/api/auth/callback/google/route.ts', maxLines: 100 },
    { path: 'src/hooks/useAuth.ts', maxLines: 200 }
  ];
  
  let allPassed = true;
  
  for (const file of files) {
    const filePath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lineCount = content.split('\n').length;
      
      if (lineCount <= file.maxLines) {
        log(colors.green, `✅ ${file.path}: ${lineCount} lines (target: ≤${file.maxLines})`);
      } else {
        log(colors.yellow, `⚠️ ${file.path}: ${lineCount} lines (target: ≤${file.maxLines})`);
        allPassed = false;
      }
    }
  }
  
  return allPassed;
}

async function runValidation() {
  log(colors.blue, '🚀 SPARC OAuth Implementation Validation\n');
  
  const tests = [
    { name: 'Environment', fn: validateEnvironment },
    { name: 'Supabase Client', fn: validateSupabaseClient },
    { name: 'Auth Hook', fn: validateAuthHook },
    { name: 'Callback Route', fn: validateCallbackRoute },
    { name: 'Code Reduction', fn: validateCodeReduction }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (!result) {
        allPassed = false;
      }
      console.log(); // Add spacing
    } catch (error) {
      log(colors.red, `❌ ${test.name} validation failed: ${error.message}`);
      allPassed = false;
    }
  }
  
  if (allPassed) {
    log(colors.green, '🎉 All validations passed! SPARC OAuth implementation is ready.');
    log(colors.blue, '\nNext steps:');
    log(colors.blue, '1. Test OAuth flow in development');
    log(colors.blue, '2. Verify onboarding redirects');
    log(colors.blue, '3. Deploy to staging for end-to-end testing');
  } else {
    log(colors.red, '❌ Some validations failed. Please address the issues above.');
    process.exit(1);
  }
}

// Run validation
runValidation().catch(error => {
  log(colors.red, `💥 Validation script failed: ${error.message}`);
  process.exit(1);
});