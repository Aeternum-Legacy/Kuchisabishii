# Vercel Deployment Guide for Kuchisabishii OAuth

Complete deployment configuration guide for Vercel with Supabase native OAuth implementation.

## 🚀 Overview

This guide covers deploying the Kuchisabishii app to Vercel with proper environment configuration for:
- Development, Staging, and Production environments
- Google OAuth integration
- Supabase authentication
- Custom domains and SSL

## 📋 Prerequisites

Before deploying, ensure you have:
- [x] Vercel account with project access
- [x] Google Cloud Console OAuth configured
- [x] Supabase project configured
- [x] GitHub repository connected to Vercel
- [x] Custom domain (if using production)

## 🔧 Environment Configuration

### 1. Vercel Project Setup

#### Connect Repository

1. Navigate to: https://vercel.com/dashboard
2. Click **"New Project"**
3. Import from GitHub: `your-username/Kuchisabishii`
4. Configure project settings:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

#### Environment Variables Setup

Navigate to **Project Settings > Environment Variables** and configure:

### 2. Development Environment Variables

```bash
# Core Application
NEXTAUTH_URL=http://localhost:3006
NEXTAUTH_SECRET=dev-secret-key-32-chars-minimum
NODE_ENV=development

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# OAuth Configuration
GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-client-secret
```

### 3. Staging Environment Variables

```bash
# Core Application
NEXTAUTH_URL=https://kuchisabishii-staging.vercel.app
NEXTAUTH_SECRET=staging-secret-key-32-chars-minimum
NODE_ENV=production

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=https://auelvsosyxrvbvxozhuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDY5MjQsImV4cCI6MjA3MDU4MjkyNH0.c7JJcY6MROjGKvPz_BGs8lYCXXv6jz7jZ-cvOFtHeZc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNjkyNCwiZXhwIjoyMDcwNTgyOTI0fQ.Z9VUjI-otF-41iFFbEaBZ4RKId3Kh2x7vuHL6i_tDhE

# OAuth Configuration
GOOGLE_CLIENT_ID=455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_STAGING_GOOGLE_CLIENT_SECRET

# Optional Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
SENTRY_DSN=YOUR_SENTRY_DSN_FOR_STAGING
```

### 4. Production Environment Variables

```bash
# Core Application
NEXTAUTH_URL=https://kuchisabishii.io
NEXTAUTH_SECRET=production-secret-key-32-chars-minimum
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://auelvsosyxrvbvxozhuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDY5MjQsImV4cCI6MjA3MDU4MjkyNH0.c7JJcY6MROjGKvPz_BGs8lYCXXv6jz7jZ-cvOFtHeZc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNjkyNCwiZXhwIjoyMDcwNTgyOTI0fQ.Z9VUjI-otF-41iFFbEaBZ4RKId3Kh2x7vuHL6i_tDhE

# OAuth Configuration
GOOGLE_CLIENT_ID=455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_PRODUCTION_GOOGLE_CLIENT_SECRET

# Email Configuration
EMAIL_FROM=people@kuchisabishii.io
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_USER=people@kuchisabishii.io
SMTP_PASSWORD=meha-dyvx-rvuk-hrys

# Optional Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
REDIS_URL=YOUR_REDIS_URL
SENTRY_DSN=YOUR_SENTRY_DSN_FOR_PRODUCTION
LOG_LEVEL=info
```

## 🌐 Domain Configuration

### Custom Domains Setup

#### 1. Add Custom Domain in Vercel

1. Go to **Project Settings > Domains**
2. Add domains:
   ```
   Production: kuchisabishii.io
   Production: www.kuchisabishii.io
   Staging: staging.kuchisabishii.io
   ```

#### 2. Configure DNS Records

Add these DNS records with your domain provider:

```dns
# Production
CNAME kuchisabishii.io cname.vercel-dns.com
CNAME www.kuchisabishii.io cname.vercel-dns.com

# Staging  
CNAME staging.kuchisabishii.io cname.vercel-dns.com
```

#### 3. SSL Certificate

Vercel automatically provisions SSL certificates. Verify:
- SSL status shows "Valid"
- HTTPS redirects work properly
- Certificate covers all subdomains

## 🚀 Deployment Configuration

### 1. Build Settings

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/auth/signin",
      "destination": "/auth/login",
      "permanent": false
    }
  ],
  "rewrites": [
    {
      "source": "/api/auth/:path*",
      "destination": "/api/auth/:path*"
    }
  ]
}
```

### 2. Branch Deployment Strategy

Configure automatic deployments:

```bash
# Production Branch: master
# Staging Branch: staging  
# Development: All other branches (preview deployments)
```

#### Git Deployment Settings

1. **Production Deployments**: 
   - Branch: `master`
   - Domain: `kuchisabishii.io`
   - Environment: Production variables

2. **Staging Deployments**:
   - Branch: `staging`
   - Domain: `staging.kuchisabishii.io`
   - Environment: Staging variables

3. **Preview Deployments**:
   - All other branches
   - Auto-generated domains
   - Environment: Development variables

## ⚙️ Advanced Configuration

### 1. Function Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/app',
        permanent: false,
      },
    ]
  }
}

module.exports = nextConfig
```

### 2. Security Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## 🔍 Testing & Verification

### Pre-Deployment Checklist

#### Environment Variables
- [ ] All required variables set for each environment
- [ ] Secrets are properly masked in Vercel dashboard
- [ ] URLs match the deployment environment
- [ ] Google OAuth credentials are environment-specific

#### Build & Deployment
- [ ] `npm run build` succeeds locally
- [ ] TypeScript compilation passes
- [ ] No build warnings or errors
- [ ] API routes are accessible
- [ ] OAuth flow works end-to-end

#### Domain & SSL
- [ ] Custom domains point to Vercel
- [ ] SSL certificates are valid
- [ ] HTTPS redirects work
- [ ] All subdomains resolve correctly

### Post-Deployment Testing

#### 1. OAuth Flow Testing

```bash
# Test staging environment
curl -I https://staging.kuchisabishii.io/api/auth/social/google

# Expected: 200 OK with proper redirect

# Test production environment  
curl -I https://kuchisabishii.io/api/auth/social/google

# Expected: 200 OK with proper redirect
```

#### 2. Database Connection Testing

```bash
# Test API endpoint
curl https://kuchisabishii.io/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: User profile data or 401 if not authenticated
```

#### 3. Environment-Specific Testing

```javascript
// Browser console test
console.log({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  environment: process.env.NODE_ENV,
  baseUrl: window.location.origin
});

// Verify correct values per environment
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. "Build Failed" Errors

```bash
# Check build logs
vercel logs YOUR_DEPLOYMENT_URL

# Common fixes:
# - Ensure all dependencies in package.json
# - Check TypeScript errors
# - Verify environment variables are set
```

#### 2. OAuth Redirect Errors

```bash
# Verify redirect URIs match exactly:
# Google Console: https://kuchisabishii.io/api/auth/callback/google
# Supabase: https://kuchisabishii.io/api/auth/callback/google
# Vercel Domain: https://kuchisabishii.io
```

#### 3. Environment Variable Issues

```bash
# Check if variables are available at runtime
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasGoogleClient: !!process.env.GOOGLE_CLIENT_ID,
  nodeEnv: process.env.NODE_ENV
});
```

#### 4. Database Connection Issues

```bash
# Test Supabase connection
curl -X GET 'https://auelvsosyxrvbvxozhuz.supabase.co/rest/v1/profiles?select=*' \
-H "apikey: YOUR_ANON_KEY" \
-H "Authorization: Bearer YOUR_ANON_KEY"

# Expected: Empty array or user data
```

### Performance Optimization

#### 1. Function Optimization

```typescript
// Optimize API routes for faster cold starts
export const runtime = 'nodejs18'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
```

#### 2. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['auelvsosyxrvbvxozhuz.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  }
}
```

#### 3. Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to package.json
"analyze": "ANALYZE=true next build"

# Run analysis
npm run analyze
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

Enable in Project Settings:
- [x] Web Analytics
- [x] Function Analytics  
- [x] Real User Monitoring

### 2. Error Tracking

```typescript
// Setup Sentry (optional)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Performance Monitoring

```typescript
// pages/_app.tsx
export function reportWebVitals(metric) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    console.log(metric);
  }
}
```

This deployment guide ensures a robust, secure, and scalable deployment of the Kuchisabishii app with proper OAuth configuration across all environments.