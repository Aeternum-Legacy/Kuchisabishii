# Database Forensics Investigation Report
**Date:** August 19, 2025  
**Agent:** Database Forensics Agent  
**Issue:** Empty profiles table despite OAuth flow appearing to work  

## 🔍 Investigation Findings

### 1. ROOT CAUSE IDENTIFIED: RLS Policy Blocking Service Role

**Critical Issue:** The RLS policies on the `profiles` table were missing proper service role permissions.

**Evidence:**
- `row-level-security.sql` defines service role policies for `user_profiles` table but NOT `profiles` table
- OAuth callback uses regular `createClient()` which doesn't have service role permissions
- Profile INSERT operations were being silently blocked by RLS

### 2. Schema Inconsistency Problem

**Discovered:** Multiple profile tables exist with inconsistent policies:
- `profiles` table - Used by OAuth callback, missing service role policies
- `user_profiles` table - Has service role policies but not used by OAuth

### 3. Timing Issue with Database Triggers

**Found:** The trigger in `create-profile-trigger.sql` runs AFTER INSERT on `auth.users`, but:
- RLS blocks the trigger's INSERT to `profiles` table
- No error logging for failed trigger operations
- Trigger uses `SECURITY DEFINER` but still subject to RLS

## 🛠️ Solutions Implemented

### Solution 1: Service Role Admin Client
Created `/src/lib/supabase/admin.ts`:
- Uses `SUPABASE_SERVICE_ROLE_KEY` for bypassing RLS
- Dedicated admin client for OAuth operations
- Proper error handling and logging

### Solution 2: Updated OAuth Callback
Modified `/src/app/api/auth/callback/google/route.ts`:
- Uses admin client for profile operations
- Maintains regular client for OAuth exchange
- Comprehensive error logging
- Continues OAuth flow even if profile creation fails

### Solution 3: Bulletproof Database Fix
Created `/database/PROFILES_TABLE_FIX.sql`:
- **RLS Policy Fix**: Adds service role policies to `profiles` table
- **Enhanced Trigger**: Improved error handling with `SECURITY DEFINER`
- **Data Migration**: Backfills missing profiles for existing OAuth users
- **Permissions**: Grants proper service role access

## 📋 Fix Verification Commands

Run these SQL commands to verify the fix:

```sql
-- Check profiles table RLS policies
SELECT tablename, policyname, roles 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Verify missing profiles count
SELECT 
  'AUTH USERS' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 
  'PROFILES' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT
  'MISSING PROFILES' as table_name, COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Test service role access
SELECT 1 FROM public.profiles LIMIT 1; -- Should work with service role
```

## 🔧 Implementation Priority

**Execute in this order:**
1. Run `/database/PROFILES_TABLE_FIX.sql` in Supabase SQL editor
2. Deploy updated OAuth callback code
3. Test OAuth flow end-to-end
4. Verify profiles are created for new OAuth users

## 📊 Technical Details

**The RLS Permission Issue:**
```sql
-- MISSING (caused the bug):
CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- PRESENT (working correctly):
CREATE POLICY "Service role can manage all data" ON public.user_profiles
  FOR ALL TO service_role USING (true);
```

**The Admin Client Solution:**
```typescript
// Before (blocked by RLS):
const supabase = await createClient() // Uses anon key
await supabase.from('profiles').insert(...) // BLOCKED

// After (bypasses RLS):
const adminClient = createAdminClient() // Uses service role key
await adminClient.from('profiles').insert(...) // SUCCESS
```

## ✅ Expected Outcome

After implementing these fixes:
1. **New OAuth users**: Profiles created automatically
2. **Existing OAuth users**: Backfilled profiles from auth.users data
3. **Database trigger**: Works for edge cases and manual user creation
4. **RLS security**: Maintained for regular users, bypassed for service operations

## 🚨 Security Considerations

**Service Role Usage:**
- Service role key only used server-side in OAuth callbacks
- Admin client isolated in separate module
- RLS still protects regular user operations
- No client-side exposure of service role permissions

This comprehensive fix addresses all three identified issues: RLS blocking, schema inconsistency, and timing problems with the database trigger.