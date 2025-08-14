# Staging Deployment Guide - Step by Step

## Part 1: Git Setup (I'll do this for you)

```bash
# Create and push staging branch
git checkout -b staging
git add .
git commit -m "Initial staging setup"
git push -u origin staging
```

## Part 2: Vercel Configuration (You need to do this)

### Option A: Using Vercel Dashboard (Recommended)

#### Step 1: Access Vercel
1. Go to https://vercel.com/dashboard
2. Sign in with your account
3. Find and click on "kuchisabishii" project

#### Step 2: Set Up Preview Deployment
1. Click on "Settings" tab
2. Go to "Git" in the left sidebar
3. Under "Production Branch", it should show "main" or "master"
4. Scroll to "Preview Branches"
5. Add "staging" to the list

#### Step 3: Add Staging Domain
1. Go to "Domains" in the left sidebar
2. Click "Add"
3. Add one of these options:
   - `staging.kuchisabishii.io` (if you own the domain)
   - Let Vercel generate: `kuchisabishii-staging.vercel.app`
4. Click "Add"

#### Step 4: Configure Environment Variables
1. Go to "Environment Variables" in the left sidebar
2. For EACH variable below, do:
   - Click "Add New"
   - Enter Key and Value
   - Select environments: ✅ Preview, ✅ Development
   - Click "Save"

**Add these variables:**

```
NEXT_PUBLIC_SUPABASE_URL = https://auelvsosyxrvbvxozhuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDY5MjQsImV4cCI6MjA3MDU4MjkyNH0.c7JJcY6MROjGKvPz_BGs8lYCXXv6jz7jZ-cvOFtHeZc
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZWx2c29zeXhydmJ2eG96aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAwNjkyNCwiZXhwIjoyMDcwNTgyOTI0fQ.Z9VUjI-otF-41iFFbEaBZ4RKId3Kh2x7vuHL6i_tDhE
NEXTAUTH_URL = https://[your-staging-domain]
NEXTAUTH_SECRET = adc3f4be0b6da6eae1757786e37cc747589d5c73a147a24c33d15bfde4c956bd
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSyBx_rCVNK1WtGW6nmvbcCmeuGvLoVfmILM
EMAIL_FROM = people@kuchisabishii.io
SMTP_HOST = smtp.mail.me.com
SMTP_PORT = 587
SMTP_USER = people@kuchisabishii.io
SMTP_PASSWORD = meha-dyvx-rvuk-hrys
```

**After you get OAuth credentials, also add:**
```
GOOGLE_CLIENT_ID = [from Google OAuth setup]
GOOGLE_CLIENT_SECRET = [from Google OAuth setup]
APPLE_CLIENT_ID = [from Apple OAuth setup]
APPLE_TEAM_ID = [from Apple OAuth setup]
APPLE_PRIVATE_KEY_ID = [from Apple OAuth setup]
APPLE_PRIVATE_KEY = [from Apple OAuth setup]
```

#### Step 5: Deploy
1. After adding all environment variables
2. Go back to main project page
3. You should see staging deployment happening automatically
4. Or manually trigger: Click "..." menu → "Redeploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link
# Select your scope/team
# Select "Link to existing project"
# Enter: kuchisabishii

# Pull environment variables
vercel env pull .env.staging

# Add each environment variable for preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# (paste the value when prompted)
# Repeat for each variable...

# Deploy to staging
vercel --prod --target preview
```

## Part 3: Verify Deployment

After deployment completes:

1. **Check deployment URL**:
   - Vercel will provide a URL like: https://kuchisabishii-staging-xxx.vercel.app
   - Or your custom domain: https://staging.kuchisabishii.io

2. **Test basic functionality**:
   - Visit the staging URL
   - Check that the app loads
   - Verify Google Maps appears
   - Test navigation

3. **Check build logs**:
   - In Vercel dashboard → "Functions" tab
   - Look for any build errors
   - Check "Runtime Logs" for errors

## Part 4: Domain Setup (Optional)

If you want staging.kuchisabishii.io:

1. **In your DNS provider** (where kuchisabishii.io is registered):
   - Add CNAME record:
     - Name: staging
     - Value: cname.vercel-dns.com

2. **In Vercel**:
   - Domains → Add → staging.kuchisabishii.io
   - Vercel will verify and set up SSL

## Troubleshooting

### If deployment fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Check for TypeScript errors: `npm run build` locally

### If OAuth doesn't work:
1. Verify redirect URLs match your staging domain
2. Check environment variables in Vercel
3. Look at browser console for errors

### If emails don't send:
1. Verify SMTP password is correct
2. Check that sender domain is verified with Apple
3. Look at API route logs in Vercel

## Quick Commands Reference

```bash
# Push changes to staging
git add .
git commit -m "Update message"
git push origin staging

# View staging logs
vercel logs --follow

# List deployments
vercel list

# Promote staging to production (later)
vercel promote [deployment-url]
```

## Status Checklist

- [ ] Staging branch created
- [ ] Pushed to GitHub
- [ ] Vercel preview branch configured
- [ ] Environment variables added
- [ ] Domain configured (optional)
- [ ] First deployment successful
- [ ] Staging URL accessible

Let me know which step you're on and I'll help you through it!