# Production Deployment Checklist
## Kuchisabishii - Strategic Hive Completion

**Last Updated:** August 17, 2025  
**Target Environment:** Production  
**Status:** ⚠️ Conditional Ready  

---

## 🚨 CRITICAL PRE-DEPLOYMENT REQUIREMENTS

### ✅ Must Complete Before Deploy

- [ ] **Execute Database Migration Script**
  ```bash
  # Run in production database
  psql -f database/immediate-fix-script.sql
  ```
  - Resolves OAuth → Dashboard redirect loop
  - Consolidates user profile tables
  - Fixes onboarding_completed defaults

- [ ] **Verify OAuth Flow Post-Migration**
  ```bash
  # Test OAuth callback → dashboard flow
  # Ensure users land on /app after Google sign-in
  ```

- [ ] **Add Test Script to package.json**
  ```json
  {
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest",
      "test:ui": "vitest --ui"
    }
  }
  ```

---

## 📋 Pre-Deployment Verification

### Environment Configuration
- [ ] **Production Environment Variables Set**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `NEXTAUTH_URL` (production domain)
  - [ ] `NEXTAUTH_SECRET` (crypto.randomUUID())

### Build Verification
- [x] **Production Build Succeeds**
  ```bash
  npm run build ✅
  # 238MB build output
  # 55/55 pages generated
  ```

- [x] **TypeScript Compilation** (src only)
  ```bash
  npm run type-check ✅ (with warnings)
  # Main application compiles successfully
  # Test files have 19 type errors (non-blocking)
  ```

- [x] **Linting Passes**
  ```bash
  npm run lint ✅ (with warnings)
  # 44 warnings (Image optimization suggestions)
  # No blocking errors
  ```

### Database Readiness
- [ ] **Database Migration Applied**
  - [ ] Profiles table consolidated
  - [ ] Orphaned users migrated
  - [ ] Indexes created
  - [ ] RLS policies verified

- [ ] **Database Backup Created**
  - [ ] Pre-migration backup
  - [ ] Test restoration process

### Security Verification
- [x] **No Hardcoded Secrets**
- [x] **Environment Variables Secured**
- [ ] **HTTPS Enforced**
- [ ] **Security Headers Configured**
- [ ] **CORS Policies Set**

---

## 🚀 Deployment Process

### Phase 1: Infrastructure Preparation
- [ ] **Deploy Database Changes**
  1. Create production database backup
  2. Execute migration script
  3. Verify data integrity
  4. Test database connections

### Phase 2: Application Deployment
- [ ] **Deploy Application**
  1. Build production bundle
  2. Deploy to hosting platform
  3. Verify environment variables
  4. Test application startup

### Phase 3: Post-Deployment Verification
- [ ] **Functional Testing**
  - [ ] OAuth Google sign-in flow
  - [ ] User dashboard access
  - [ ] Profile creation/editing
  - [ ] Food logging functionality
  - [ ] Friend system
  - [ ] Recommendations engine

- [ ] **Performance Testing**
  - [ ] Page load times < 3s
  - [ ] API response times < 500ms
  - [ ] Database query performance
  - [ ] Image loading optimization

---

## 🔧 Configuration Requirements

### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co'
      }
    ]
  },
  // Add security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
      ]
    }
  ]
}
```

### Database RLS Policies
```sql
-- Verify these policies exist
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);
```

---

## 📊 Monitoring & Observability

### Error Tracking
- [ ] **Sentry Configuration** (Recommended)
  ```bash
  npm install @sentry/nextjs
  # Configure in next.config.js
  ```

### Performance Monitoring
- [ ] **Core Web Vitals Tracking**
- [ ] **API Response Time Monitoring**
- [ ] **Database Performance Metrics**

### Logging
- [ ] **Application Logs Centralized**
- [ ] **Error Aggregation Setup**
- [ ] **Database Query Logging**

---

## 🚨 Rollback Plan

### Database Rollback
```bash
# If migration fails, restore from backup
pg_restore --clean --no-owner production_backup.sql

# Verify data integrity
psql -f database/verify-user-data-flow.sql
```

### Application Rollback
- [ ] **Previous Build Available**
- [ ] **Environment Variables Backed Up**
- [ ] **DNS Records Documented**

---

## 🎯 Post-Deployment Tasks

### Immediate (0-1 hour)
- [ ] **Smoke Test All Features**
- [ ] **Monitor Error Rates**
- [ ] **Verify Database Performance**
- [ ] **Check Authentication Flow**

### Short-term (1-24 hours) 
- [ ] **Performance Optimization**
  - [ ] Replace `<img>` with Next.js `Image`
  - [ ] Implement lazy loading
  - [ ] Optimize bundle size

### Medium-term (1-7 days)
- [ ] **Testing Infrastructure**
  - [ ] Fix TypeScript test errors
  - [ ] Implement CI/CD pipeline
  - [ ] Add automated testing

---

## ⚡ Quick Commands Reference

```bash
# Pre-deployment checks
npm run build
npm run type-check  
npm run lint

# Database migration
psql -f database/immediate-fix-script.sql

# Post-deployment verification
curl -f https://yourapp.com/api/health
curl -f https://yourapp.com/api/auth/test

# Monitoring
tail -f logs/application.log
```

---

## 🏁 Sign-off Checklist

### Technical Lead Approval
- [ ] **Database Migration Verified**
- [ ] **Authentication Flow Tested** 
- [ ] **Critical Path Functionality Verified**
- [ ] **Performance Metrics Acceptable**

### Product Owner Approval  
- [ ] **User Experience Validated**
- [ ] **Core Features Functional**
- [ ] **Onboarding Flow Working**
- [ ] **Social Features Operational**

### DevOps Approval
- [ ] **Infrastructure Scaled**
- [ ] **Monitoring Configured**
- [ ] **Backup Systems Active**
- [ ] **Rollback Plan Tested**

---

**Deployment Coordinator:** SPARC Completion Agent  
**Expected Deployment Time:** 2-4 hours (including verification)  
**Risk Level:** Medium (database migration required)  
**Go/No-Go Decision:** ⚠️ GO with critical fixes applied

---

## Contact Information

**Technical Issues:** Development Team  
**Database Issues:** Database Administrator  
**Infrastructure Issues:** DevOps Team  
**Emergency Rollback:** On-call Engineer  

**Deployment Status:** Ready for execution with critical fixes ✅