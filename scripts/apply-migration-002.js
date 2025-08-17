#!/usr/bin/env node

/**
 * Apply Migration 002: Add onboarding_completed column
 * This script adds the missing onboarding_completed column to prevent redirect loops
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔄 Applying Migration 002: Add onboarding_completed column...');
  
  try {
    // Check if column exists
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('column_name', 'onboarding_completed')
      .eq('table_schema', 'public');

    if (checkError) {
      console.error('❌ Error checking column existence:', checkError);
      return false;
    }

    if (columns && columns.length > 0) {
      console.log('✅ Column onboarding_completed already exists');
      return true;
    }

    // Add column if it doesn't exist
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users 
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT true NOT NULL;
        
        CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed 
        ON public.users(onboarding_completed);
        
        UPDATE public.users 
        SET onboarding_completed = true 
        WHERE onboarding_completed IS NULL OR onboarding_completed = false;
      `
    });

    if (addError) {
      console.error('❌ Error adding column:', addError);
      return false;
    }

    console.log('✅ Successfully added onboarding_completed column');
    console.log('✅ Updated existing users to completed=true');
    console.log('✅ Added performance index');
    
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Run migration
applyMigration().then(success => {
  if (success) {
    console.log('🎉 Migration 002 completed successfully');
    process.exit(0);
  } else {
    console.log('💥 Migration 002 failed');
    process.exit(1);
  }
});