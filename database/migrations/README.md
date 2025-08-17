# Database Migrations

This directory contains SQL migration scripts for the Kuchisabishii database.

## Migration Files

### 001_initial_schema.sql
- Sets up the complete initial database schema
- Includes all tables, functions, policies, and indexes
- Should be run first when setting up a new database

### 002_add_onboarding_completed.sql
- Adds the `onboarding_completed` BOOLEAN column to user tables
- Updates existing users based on activity patterns
- Creates appropriate indexes for performance
- Handles both `public.users` and `public.user_profiles` table structures

### 002_add_onboarding_completed_rollback.sql
- Rollback script for the onboarding_completed column migration
- Removes the column and associated indexes
- Use only if you need to undo the onboarding column addition

## Quick Execution Scripts

### /database/scripts/add-onboarding-column-immediate.sql
- Immediate execution script for adding onboarding_completed column
- Safe to run multiple times
- Includes verification queries
- Can be run directly in Supabase SQL Editor

## Usage

### For New Databases
```sql
-- Run in order:
\i 001_initial_schema.sql
\i 002_add_onboarding_completed.sql
```

### For Existing Databases (Add onboarding column only)
```sql
-- Option 1: Full migration
\i 002_add_onboarding_completed.sql

-- Option 2: Quick execution (copy/paste into SQL editor)
-- Use: /database/scripts/add-onboarding-column-immediate.sql
```

### Rollback (if needed)
```sql
\i 002_add_onboarding_completed_rollback.sql
```

## Migration Details

The `onboarding_completed` column:
- Type: `BOOLEAN`
- Default: `FALSE`
- Purpose: Tracks whether users have completed the initial onboarding process

### Automatic User Updates
Existing users are automatically marked as `onboarding_completed = TRUE` if they have:
1. Created any food experiences
2. Completed their profile (display_name, bio, dietary preferences)
3. Been active for more than 24 hours with profile updates
4. Set up their taste profile (for user_profiles table)

### Performance
- Partial indexes created on `onboarding_completed = FALSE` for better query performance
- Indexes created with `CONCURRENTLY` to avoid blocking operations

## Verification

After running migrations, verify with:
```sql
-- Check column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name IN ('users', 'user_profiles') 
AND column_name = 'onboarding_completed';

-- Check user distribution
SELECT onboarding_completed, COUNT(*) 
FROM public.users 
GROUP BY onboarding_completed;
```