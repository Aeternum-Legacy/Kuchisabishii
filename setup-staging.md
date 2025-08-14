# Staging Environment Setup Guide

## 1. Create Staging Branch
```bash
git checkout -b staging
git push -u origin staging
```

## 2. Vercel Configuration

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link project
vercel link

# Create staging deployment
vercel --prod --env preview
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your Kuchisabishii project
3. Go to Settings → Domains
4. Add staging domain: `staging.kuchisabishii.io` or `kuchisabishii-staging.vercel.app`
5. Go to Settings → Environment Variables
6. Add all environment variables for "Preview" environment:

## 3. Environment Variables for Staging

Add these to Vercel Preview Environment:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://auelvsosyxrvbvxozhuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDY5MjQsImV4cCI6MjA3MDU4MjkyNH0.c7JJcY6MROjGKvPz_BGs8lYCXXv6jz7jZ-cvOFtHeZc
SUPABASE_SERVICE_ROLE_KEY=[KEEP SECURE - Add via dashboard]

# Authentication
NEXTAUTH_URL=https://staging.kuchisabishii.io
NEXTAUTH_SECRET=adc3f4be0b6da6eae1757786e37cc747589d5c73a147a24c33d15bfde4c956bd

# Google OAuth - Add your production credentials
GOOGLE_CLIENT_ID=[Your Google Client ID]
GOOGLE_CLIENT_SECRET=[Your Google Client Secret]

# Apple OAuth - Add your production credentials  
APPLE_CLIENT_ID=[Your Apple Client ID]
APPLE_TEAM_ID=[Your Apple Team ID]
APPLE_PRIVATE_KEY_ID=[Your Apple Private Key ID]
APPLE_PRIVATE_KEY=[Your Apple Private Key]

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBx_rCVNK1WtGW6nmvbcCmeuGvLoVfmILM

# Email Configuration
EMAIL_FROM=people@kuchisabishii.io
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_USER=people@kuchisabishii.io
SMTP_PASSWORD=[Your App-Specific Password from Apple]
```

## 4. Configure OAuth Redirect URLs

### Google OAuth Console
Add to authorized redirect URIs:
- `https://staging.kuchisabishii.io/auth/callback`
- `https://auelvsosyxrvbvxozhuz.supabase.co/auth/v1/callback`

### Apple Developer Console
Add to redirect URLs:
- `https://staging.kuchisabishii.io/auth/callback`
- `https://auelvsosyxrvbvxozhuz.supabase.co/auth/v1/callback`

### Supabase Dashboard
1. Go to Authentication → Providers
2. Enable Google - add Client ID and Secret
3. Enable Apple - add configuration
4. Set redirect URLs for both

## 5. Deployment Commands

```bash
# Deploy to staging
git add .
git commit -m "Staging deployment"
git push origin staging

# Vercel will auto-deploy staging branch
# Or manually deploy:
vercel --prod --env preview
```

## Required Manual Actions Summary:
1. ✅ Clear auth.flow_state in Supabase
2. ✅ Create Apple App-Specific Password for email
3. ✅ Set up staging branch in Git
4. ✅ Configure Vercel staging environment
5. ✅ Add all environment variables to Vercel
6. ✅ Configure OAuth redirect URLs