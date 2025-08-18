#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * SPARC Architecture: Production Safety Validator
 * This script ensures NO localhost references reach production deployments
 */

const { validateEnvironmentConfig, getEnvironmentInfo, getBaseUrl } = require('../src/lib/env.ts')

async function validateEnvironment() {
  console.log('🔍 Validating Environment Configuration...\n')
  
  try {
    // Import the environment utility (dynamic import for CommonJS compatibility)
    const envModule = await import('../src/lib/env.js')
    const { validateEnvironmentConfig, getEnvironmentInfo, getBaseUrl } = envModule
    
    // Get current environment info
    const envInfo = getEnvironmentInfo()
    
    console.log('📊 Environment Information:')
    console.log(`  Environment: ${envInfo.environment}`)
    console.log(`  Base URL: ${envInfo.baseUrl}`)
    console.log(`  Node ENV: ${envInfo.nodeEnv}`)
    console.log(`  Vercel ENV: ${envInfo.vercelEnv || 'Not set'}`)
    console.log(`  Vercel URL: ${envInfo.vercelUrl || 'Not set'}`)
    console.log(`  NextAuth URL: ${envInfo.nextAuthUrl || 'Not set'}`)
    console.log(`  App URL: ${envInfo.appUrl || 'Not set'}`)
    console.log(`  Is Vercel: ${envInfo.isVercel}`)
    console.log(`  Is Client: ${envInfo.isClient}\n`)
    
    // Validate configuration
    const validation = validateEnvironmentConfig()
    
    if (validation.isValid) {
      console.log('✅ Environment configuration is VALID')
    } else {
      console.log('❌ Environment configuration has ERRORS:')
      validation.errors.forEach(error => {
        console.log(`  - ${error}`)
      })
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      validation.warnings.forEach(warning => {
        console.log(`  - ${warning}`)
      })
    }
    
    // Check for localhost in production/staging
    if (envInfo.environment !== 'development') {
      console.log('\n🔒 Production Safety Checks:')
      
      if (envInfo.baseUrl.includes('localhost')) {
        console.log('❌ CRITICAL: Base URL contains localhost in non-development environment!')
        process.exit(1)
      } else {
        console.log('✅ Base URL is safe for production')
      }
      
      if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes('localhost')) {
        console.log('❌ CRITICAL: NEXTAUTH_URL contains localhost in non-development environment!')
        process.exit(1)
      } else {
        console.log('✅ NextAuth URL is safe for production')
      }
      
      if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
        console.log('❌ CRITICAL: NEXT_PUBLIC_APP_URL contains localhost in non-development environment!')
        process.exit(1)
      } else {
        console.log('✅ Public App URL is safe for production')
      }
    }
    
    console.log('\n🎉 Environment validation completed successfully!')
    
    // Exit with appropriate code
    process.exit(validation.isValid ? 0 : 1)
    
  } catch (error) {
    console.error('💥 Environment validation failed:', error.message)
    process.exit(1)
  }
}

// Show help
function showHelp() {
  console.log(`
Environment Validation Tool

Usage:
  npm run validate:env
  node scripts/validate-environment.js

This script validates that:
- No localhost URLs are used in production/staging
- Required environment variables are set
- OAuth configuration is consistent
- Environment detection works correctly

Exit codes:
  0 - Validation passed
  1 - Validation failed or errors found
`)
}

// Run validation
if (process.argv.includes('--help')) {
  showHelp()
} else {
  validateEnvironment()
}