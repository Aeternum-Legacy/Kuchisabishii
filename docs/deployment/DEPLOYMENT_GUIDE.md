# 🚀 Kuchisabishii Deployment Guide

## 🏗️ Infrastructure Overview

### 🌐 Hosting & CDN
- **Primary**: Vercel (Serverless deployment)
- **Domain**: kuchisabishii.io (via Cloudflare)
- **SSL**: Automatic HTTPS certificates
- **CDN**: Global edge network

### 🗄️ Database & Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (food images)
- **Real-time**: Supabase Realtime subscriptions

## 🎯 Deployment Environments

### 🌟 Production
```yaml
Environment: production
URL: https://kuchisabishii.io
Branch: main
Deployment: Automatic on PR merge
Protection: Manual approval required
```

### 🌙 Staging  
```yaml
Environment: staging
URL: https://staging-kuchisabishii.vercel.app
Branch: develop
Deployment: Automatic on push
Protection: CI checks required
```

### 🔍 Preview
```yaml
Environment: preview
URL: https://pr-{number}-kuchisabishii.vercel.app
Branch: feature/* branches
Deployment: Automatic on PR creation
Protection: CI checks required
```

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compilation (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors/warnings

### 🧪 Testing
- [ ] Manual testing completed
- [ ] Food logging functionality verified
- [ ] Restaurant reviews working
- [ ] Mobile responsiveness checked
- [ ] Cross-browser compatibility

### 🔒 Security
- [ ] No hardcoded secrets
- [ ] Environment variables configured
- [ ] Security audit passes (`npm audit`)
- [ ] HTTPS redirects working

### 📱 Performance
- [ ] Core Web Vitals optimized
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] Loading states implemented

## 🚀 Deployment Process

### 🆕 Feature Deployment (Normal Flow)

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-food-rating

# 2. Develop and test locally
npm run dev
# ... make changes ...

# 3. Commit changes
git add .
git commit -m "✨ Add 5-star food rating system"

# 4. Push and create PR
git push origin feature/new-food-rating
# Create PR: feature/new-food-rating → develop

# 5. Review preview deployment
# URL: https://pr-123-kuchisabishii.vercel.app

# 6. Merge to develop (staging deployment)
# URL: https://staging-kuchisabishii.vercel.app

# 7. Test on staging, then PR to main
# Create PR: develop → main

# 8. Production deployment after approval
# URL: https://kuchisabishii.io
```

### 🚨 Hotfix Deployment (Emergency)

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-login-fix

# 2. Fix the issue
# ... make minimal changes ...

# 3. Commit fix
git add .
git commit -m "🐛 Fix critical login authentication bug"

# 4. Push for preview
git push origin hotfix/critical-login-fix
# Preview: https://hotfix-456.vercel.app

# 5. Test preview, then PR to main
# Direct to production after validation

# 6. Merge back to develop
git checkout develop
git merge hotfix/critical-login-fix
```

## ⚙️ Environment Configuration

### 🔐 GitHub Secrets Required

```yaml
# Vercel Integration
VERCEL_TOKEN: [Your Vercel API token]
ORG_ID: [Your Vercel team/org ID]  
PROJECT_ID: [Your Vercel project ID]

# Future: Database & Services
SUPABASE_URL: [Supabase project URL]
SUPABASE_ANON_KEY: [Supabase anonymous key]
SUPABASE_SERVICE_KEY: [Supabase service role key]
```

### 📋 Environment Variables

#### Production (.env.production)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kuchisabishii.io
NEXT_TELEMETRY_DISABLED=1

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Analytics (Future)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Staging (.env.staging)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging-kuchisabishii.vercel.app
NEXT_TELEMETRY_DISABLED=1

# Staging Database
NEXT_PUBLIC_SUPABASE_URL=your-staging-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-key
```

## 📊 Monitoring & Health Checks

### 🔍 Deployment Verification

After each deployment, verify:

```bash
# 1. Basic health check
curl -I https://kuchisabishii.io
# Expected: 200 OK

# 2. Core functionality
# - Homepage loads
# - Sign-in works  
# - Food logging functions
# - Images load properly

# 3. Performance check
# - Core Web Vitals
# - Load time < 3 seconds
# - Mobile responsiveness
```

### 📈 Post-Deployment Monitoring

```yaml
Metrics to Monitor:
- Response time
- Error rate  
- Build time
- Bundle size
- User engagement

Tools:
- Vercel Analytics
- Lighthouse CI
- Web Vitals tracking
```

## 🛡️ Rollback Procedures

### 🔄 Quick Rollback (Vercel)

```bash
# 1. Via Vercel Dashboard
# Go to Deployments → Previous deployment → Promote

# 2. Via Git (if needed)
git checkout main
git revert HEAD
git push origin main
# Triggers automatic rollback deployment
```

### 🚨 Emergency Rollback

```bash
# 1. Immediately promote previous deployment in Vercel
# 2. Investigate issue in safe environment
# 3. Create hotfix if needed
# 4. Deploy fix when ready
```

## 📋 Troubleshooting Guide

### ❌ Common Issues

#### Build Failures
```bash
# Check build logs in GitHub Actions
# Common causes:
- TypeScript errors
- Missing dependencies
- Environment variable issues
- Build timeout

# Solutions:
npm run build        # Test locally
npm run type-check   # Fix TS errors
npm audit --fix      # Fix vulnerabilities
```

#### DNS Issues
```bash
# Check DNS propagation
nslookup kuchisabishii.io

# Verify Cloudflare settings:
# A record: @ → 76.76.21.21 (Proxied)
# CNAME: www → vercel-dns-value (Proxied)
```

#### SSL/Certificate Issues
```bash
# Usually auto-resolves in 24 hours
# Check Vercel domains section
# Verify Cloudflare SSL mode: "Full (strict)"
```

## 📞 Support & Contacts

### 🆘 Emergency Contacts
- **DevOps Lead**: [Your contact]
- **Vercel Support**: https://vercel.com/help
- **Cloudflare Support**: https://dash.cloudflare.com/

### 📖 Documentation
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Actions**: https://docs.github.com/actions

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Code linting
npm run type-check   # TypeScript validation

# Git Flow
git checkout develop                    # Switch to develop
git checkout -b feature/feature-name    # New feature
git checkout -b hotfix/fix-name         # Emergency fix

# Deployment
git push origin feature-name  # Triggers preview
git push origin develop       # Triggers staging
# PR to main                  # Triggers production
```

## 🎉 Success!

Your Kuchisabishii app is now running a professional-grade CI/CD pipeline! 

- **✅ Automated testing**
- **✅ Multi-environment deployments** 
- **✅ Proper branching strategy**
- **✅ Emergency procedures**
- **✅ Quality gates**

Happy deploying! 🍽️✨