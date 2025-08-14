# 🗄️ Database Management Scripts

## Production Deployment Scripts

### 1. `check-current-database.sql`
**Purpose**: Analyze current database state before cleanup
- Shows count of users, restaurants, food entries, reviews
- Identifies demo/test data that needs removal
- Checks auth.flow_state records
- Estimates cleanup impact
- Provides database size analysis

**When to run**: Before production deployment to understand data state

### 2. `production-cleanup.sql`
**Purpose**: Remove all demo/test data for production launch
- ⚠️ **DESTRUCTIVE** - Removes demo users and all related data
- Cleans demo restaurants and food entries
- Clears auth.flow_state for clean OAuth
- Removes low-vote food pairings (test data)
- Optimizes database with VACUUM ANALYZE
- Provides verification queries

**When to run**: ONCE before production launch

### 3. `verify-production-setup.sql`
**Purpose**: Verify database is production-ready after cleanup
- Confirms RLS is enabled on all tables
- Verifies no demo data remains
- Validates indexes and constraints
- Checks essential functions exist
- Provides production readiness metrics
- Shows security warnings if issues found

**When to run**: After production cleanup to verify success

## Execution Order for Production Deployment

```sql
-- Step 1: Understand current state
\i database/scripts/check-current-database.sql

-- Step 2: Clean up demo data (DESTRUCTIVE)
\i database/scripts/production-cleanup.sql

-- Step 3: Verify production readiness
\i database/scripts/verify-production-setup.sql
```

## Script Safety Notes

⚠️ **CRITICAL WARNINGS**:

1. **`production-cleanup.sql` is DESTRUCTIVE**
   - Will permanently delete demo/test data
   - Cannot be undone
   - Only run on databases that contain demo data

2. **Backup Before Running**
   - Always backup database before cleanup
   - Test scripts on staging environment first

3. **Production Checklist**
   - [ ] Database backup completed
   - [ ] Scripts tested on staging
   - [ ] `check-current-database.sql` reviewed
   - [ ] `production-cleanup.sql` executed
   - [ ] `verify-production-setup.sql` passed
   - [ ] User registration tested
   - [ ] OAuth flows tested

## Expected Results After Cleanup

After running production cleanup scripts successfully:

✅ **Should show 0 for these metrics**:
- Demo users remaining
- Demo restaurants remaining  
- Auth flow state records
- Tables without RLS

✅ **Should be positive**:
- RLS policies active
- Performance indexes present
- Foreign key constraints
- Essential functions available

## Troubleshooting

### If cleanup fails:
1. Check foreign key constraint errors
2. Ensure no active user sessions referencing demo data
3. Run cleanup in smaller batches if needed

### If verification shows warnings:
1. Re-run cleanup script for any remaining demo data
2. Check RLS policies are properly enabled
3. Verify all required functions exist

### If app functionality breaks after cleanup:
1. Check that essential functions weren't dropped
2. Verify RLS policies allow proper access
3. Test with a real user account (not demo)

## Support

For issues with these scripts:
1. Check the database logs for specific errors
2. Verify Supabase project configuration
3. Test individual sections of scripts in isolation
4. Ensure proper database permissions