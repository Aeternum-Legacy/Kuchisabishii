#!/usr/bin/env node

/**
 * Database Reset Utility
 * Safely resets user data while preserving core schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetUserDatabase() {
  console.log('🧹 Starting database reset...');
  
  try {
    // Step 1: Clear ML and AI data
    console.log('📊 Clearing ML and recommendation data...');
    const { error: mlError } = await supabase.rpc('reset_ml_data');
    if (mlError && !mlError.message.includes('function does not exist')) {
      console.warn('⚠️  ML data reset warning:', mlError.message);
    }

    // Step 2: Clear social data
    console.log('👥 Clearing social and friendship data...');
    await supabase.from('qr_friend_tokens').delete().neq('id', '');
    await supabase.from('friend_requests').delete().neq('id', '');
    await supabase.from('friendships').delete().neq('id', '');
    await supabase.from('social_activities').delete().neq('id', '');

    // Step 3: Clear user profiles and preferences
    console.log('👤 Clearing user profiles and preferences...');
    await supabase.from('taste_profiles').delete().neq('id', '');
    await supabase.from('user_profiles').delete().neq('id', '');

    // Step 4: Clear food experiences
    console.log('🍽️  Clearing food experiences and reviews...');
    await supabase.from('restaurant_reviews').delete().neq('id', '');
    await supabase.from('food_experiences_detailed').delete().neq('id', '');
    await supabase.from('food_experiences').delete().neq('id', '');

    // Step 5: Clear notifications
    console.log('🔔 Clearing notifications...');
    await supabase.from('notifications').delete().neq('id', '');

    // Verification
    console.log('✅ Database reset completed successfully!');
    console.log('\n📊 Remaining data:');
    
    const tables = [
      'user_profiles',
      'food_experiences', 
      'friendships',
      'restaurants'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`   ${table}: ${count} records`);
        }
      } catch (e) {
        console.log(`   ${table}: unable to count`);
      }
    }

    console.log('\n🚀 Database is ready for fresh testing!');
    console.log('💡 Next steps:');
    console.log('   1. Clear your browser cache');
    console.log('   2. Sign up with a new account');
    console.log('   3. Test the AI onboarding questionnaire');
    console.log('   4. Try the LinkedIn profile import');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  }
}

// Confirmation prompt
console.log('⚠️  This will reset ALL user data in the database.');
console.log('   - User profiles will be cleared');
console.log('   - Food experiences will be deleted');
console.log('   - Friendships will be removed');
console.log('   - Auth users will remain (login still works)');
console.log('   - Core restaurant data will be preserved');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nAre you sure you want to proceed? (type "RESET" to confirm): ', (answer) => {
  rl.close();
  
  if (answer === 'RESET') {
    resetUserDatabase();
  } else {
    console.log('❌ Reset cancelled.');
    process.exit(0);
  }
});