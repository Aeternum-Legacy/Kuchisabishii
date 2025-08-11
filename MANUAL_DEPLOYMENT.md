# Manual Deployment Guide for kuchisabishi.io

## 🚀 Quick Deployment Steps

Since you already have a Vercel account linked to your GitHub email, follow these steps:

### Option 1: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login with your existing account

2. **Import Project**
   - Click "New Project" or "Import Project"
   - Connect to your GitHub account if not already connected
   - Select `Aeternum-Legacy/Kuchisabishii` repository

3. **Configure Project Settings**
   ```
   Framework Preset: Next.js
   Root Directory: web/
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables (Optional)**
   ```
   NEXT_PUBLIC_APP_URL=https://kuchisabishi.io
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at a Vercel URL

6. **Add Custom Domain**
   - In project settings → Domains
   - Add `kuchisabishi.io` and `www.kuchisabishi.io`
   - Follow DNS configuration instructions

### Option 2: CLI Method (If Login Works)

1. **Login to Vercel**
   ```bash
   # Try different login methods if GitHub doesn't work
   vercel login --email your-email@example.com
   # Or visit the URL shown and complete authentication
   ```

2. **Deploy**
   ```bash
   vercel --cwd web
   ```

3. **Production Deploy**
   ```bash
   vercel --cwd web --prod
   ```

### Option 3: GitHub Actions (Automated)

I've created a GitHub Action that will automatically deploy on every push to master:

**Setup Required:**
1. In Vercel Dashboard → Account Settings → Tokens → Create new token
2. In your GitHub repo → Settings → Secrets and variables → Actions
3. Add these secrets:
   ```
   VERCEL_TOKEN: [your-token-from-step-1]
   ORG_ID: [from Vercel project settings]
   PROJECT_ID: [from Vercel project settings]
   ```

**Then simply:**
```bash
git push origin master  # Auto deploys!
```

## 🌐 DNS Configuration for kuchisabishi.io

Once deployed, add these DNS records to your domain provider:

```
Type: A
Name: @  (or leave blank)
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Domain propagation takes 24-48 hours**

## 🔗 Expected URLs After Deployment

- **Vercel Preview**: https://kuchisabishii-[random].vercel.app
- **Your Domain**: https://kuchisabishi.io
- **WWW**: https://www.kuchisabishi.io

## ✅ What's Already Configured

- ✅ PWA manifest for mobile app installation
- ✅ Service worker for offline functionality
- ✅ Security headers for production
- ✅ Image optimization for Unsplash photos
- ✅ Compression and performance optimization
- ✅ Automatic HTTPS/SSL certificates

## 🎯 Post-Deployment Checklist

1. **Test PWA Installation**
   - Visit site on mobile
   - Look for "Add to Home Screen" prompt
   - Install and test offline functionality

2. **Test Food Logging**
   - Complete onboarding flow
   - Log a new food experience
   - Check "My Foods" page functionality

3. **Performance Check**
   - Test loading speed
   - Verify images load properly
   - Check mobile responsiveness

## 🚨 Troubleshooting

### Build Errors
- Check Next.js version compatibility
- Verify all dependencies installed
- Review build logs in Vercel dashboard

### Domain Not Working
- Verify DNS settings (use dnschecker.org)
- Wait for DNS propagation (up to 48 hours)
- Check domain configuration in Vercel

### Images Not Loading
- Verify Unsplash domain in next.config.ts
- Check image optimization settings
- Test with different image URLs

## 🆘 Need Help?

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: https://vercel.com/help

**Your App Status:**
- Repository: https://github.com/Aeternum-Legacy/Kuchisabishii
- All configuration files are ready
- Build process configured for deployment

---

🎉 **Your Kuchisabishii app is ready to go live at kuchisabishi.io!** 🍽️

The easiest path is Option 1 (Vercel Dashboard) - just import your GitHub repo and deploy!