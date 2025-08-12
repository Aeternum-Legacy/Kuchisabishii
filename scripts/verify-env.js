#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Environment Configuration\n');

// Check .env.local file
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
    description: 'Supabase project URL'
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    pattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    description: 'Supabase anon/public key (JWT format)'
  },
  'NEXTAUTH_URL': {
    pattern: /^https?:\/\/.+$/,
    description: 'NextAuth URL (your app URL)'
  },
  'NEXTAUTH_SECRET': {
    pattern: /.{32,}/,
    description: 'NextAuth secret (min 32 chars)'
  }
};

const envVars = {};
lines.forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

console.log('Required Environment Variables:\n');
let hasErrors = false;

Object.entries(requiredVars).forEach(([key, config]) => {
  const value = envVars[key];
  
  if (!value) {
    console.error(`❌ ${key}: MISSING`);
    console.log(`   ${config.description}\n`);
    hasErrors = true;
  } else if (!config.pattern.test(value)) {
    console.error(`⚠️  ${key}: INVALID FORMAT`);
    console.log(`   Current: ${value.substring(0, 20)}...`);
    console.log(`   ${config.description}\n`);
    hasErrors = true;
  } else {
    console.log(`✅ ${key}: OK`);
    console.log(`   ${value.substring(0, 40)}...`);
    console.log(`   Length: ${value.length} chars\n`);
  }
});

if (hasErrors) {
  console.log('\n📝 To fix missing variables:');
  console.log('1. Copy the anon/public key from Supabase Dashboard → Settings → API');
  console.log('2. Add it to .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key');
  console.log('3. Add the same to Vercel Environment Variables');
  console.log('4. Redeploy your Vercel application');
} else {
  console.log('\n✨ All environment variables are properly configured!');
  console.log('\n📋 Copy these exact values to Vercel Environment Variables:');
  console.log('(Dashboard → Settings → Environment Variables)\n');
  
  Object.entries(requiredVars).forEach(([key]) => {
    if (envVars[key]) {
      console.log(`${key}=${envVars[key]}`);
    }
  });
}