#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🍜 Kuchisabishii Environment Setup\n');
console.log('This script will help you configure your environment variables.\n');

async function setupEnvironment() {
  try {
    console.log('📋 Step 1: Supabase Configuration\n');
    console.log('Go to your Supabase dashboard > Settings > API\n');
    
    const supabaseUrl = await question('Enter your Supabase Project URL (e.g., https://xxx.supabase.co): ');
    const supabaseAnonKey = await question('Enter your Supabase anon/public key: ');
    const supabaseServiceKey = await question('Enter your Supabase service_role key (click Reveal to see it): ');
    
    // Generate a random NextAuth secret
    const nextAuthSecret = crypto.randomBytes(32).toString('hex');
    
    console.log('\n📋 Step 2: OAuth Configuration (Optional - press Enter to skip)\n');
    const googleClientId = await question('Enter Google Client ID (or press Enter to skip): ') || 'your_google_client_id_here';
    const googleClientSecret = await question('Enter Google Client Secret (or press Enter to skip): ') || 'your_google_client_secret_here';
    const appleClientId = await question('Enter Apple Client ID (or press Enter to skip): ') || 'your_apple_client_id_here';
    const appleClientSecret = await question('Enter Apple Client Secret (or press Enter to skip): ') || 'your_apple_client_secret_here';
    
    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Authentication
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for later implementation)
GOOGLE_CLIENT_ID=${googleClientId}
GOOGLE_CLIENT_SECRET=${googleClientSecret}

# Apple OAuth (for later implementation)
APPLE_CLIENT_ID=${appleClientId}
APPLE_CLIENT_SECRET=${appleClientSecret}
`;

    const envPath = path.join(__dirname, '..', '.env.local');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment variables saved to .env.local');
    console.log('✅ Generated secure NextAuth secret');
    console.log('\n🎉 Environment setup complete!\n');
    console.log('Next steps:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Copy and paste the contents of database/schema.sql');
    console.log('3. Run the SQL to create tables');
    console.log('4. Restart your development server: npm run dev');
    console.log('5. Test authentication at http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error setting up environment:', error);
  } finally {
    rl.close();
  }
}

setupEnvironment();