# Kuchisabishii Deployment Guide

## 🚀 Deploy to kuchisabishi.io

This guide will help you deploy your Kuchisabishii app to your custom domain `kuchisabishi.io`.

## 🎯 Recommended Deployment: Vercel

Vercel is the best choice for Next.js apps with custom domains.

### ✅ Why Vercel?
- **Next.js optimized** - Built by the same team
- **Custom domains** - Easy SSL and domain setup
- **Auto deployment** - Deploy from GitHub automatically
- **Global CDN** - Fast worldwide performance
- **Free tier** - Perfect for personal projects

## 📋 Step-by-Step Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
# Navigate to your project
cd /path/to/Kuchisabishii

# Deploy (first time)
vercel

# Follow prompts:
# - Link to existing project? N
# - What's your project's name? kuchisabishii
# - In which directory is your code located? web/
```

### 4. Configure Custom Domain

**In Vercel Dashboard:**
1. Go to your project → Settings → Domains
2. Add `kuchisabishi.io`
3. Add `www.kuchisabishi.io` (optional)

**DNS Configuration:**
Add these records to your domain provider:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 5. Set Up Auto Deployment

**Connect GitHub:**
1. Vercel Dashboard → Git Integration
2. Connect your GitHub account
3. Select `Aeternum-Legacy/Kuchisabishii`
4. Set root directory to `web/`

**Auto Deploy Settings:**
- **Production Branch**: `master`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## 🔧 Project Configuration

### Vercel Configuration File
Create `vercel.json` in project root:

```json
{
  "version": 2,
  "name": "kuchisabishii",
  "builds": [
    {
      "src": "web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/web/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

### Environment Variables
Set in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_APP_URL=https://kuchisabishi.io
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🌐 Alternative Deployment Options

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd web
netlify deploy --prod
```

### Option 3: GitHub Pages (Static Only)
```bash
# Add to package.json
"homepage": "https://kuchisabishi.io",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

### Option 4: Self-hosted (VPS/Cloud)
```bash
# Build production
npm run build:web

# Copy build files to server
scp -r web/.next user@server:/var/www/kuchisabishi.io/
```

## 📱 PWA Deployment Checklist

### ✅ Pre-deployment Check
- [ ] PWA manifest configured (`web/public/manifest.json`)
- [ ] Service worker setup (`web/public/sw.js`)  
- [ ] Icons in all required sizes
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Mobile responsive design tested

### ✅ Post-deployment Test
- [ ] PWA install prompt works
- [ ] Offline functionality  
- [ ] Custom domain resolves
- [ ] SSL certificate active
- [ ] Mobile performance

## 🔒 Security & Performance

### Security Headers
Add to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### Performance Optimization
```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
};
```

## 📊 Monitoring & Analytics

### Vercel Analytics
```bash
npm install @vercel/analytics
```

```typescript
// Add to layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Monitoring
Consider adding:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - User analytics

## 🚦 Deployment Pipeline

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd web
          npm ci
      
      - name: Build
        run: |
          cd web
          npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./web
```

## 🎯 Quick Deploy Commands

```bash
# One-time setup
vercel login
vercel --cwd web

# Deploy updates
git push origin master  # Auto deploys if connected

# Manual deploy
vercel --prod --cwd web
```

## 📞 Support & Troubleshooting

### Common Issues:
1. **Build fails** → Check `web/package.json` scripts
2. **Domain not working** → Verify DNS settings (24-48h propagation)
3. **Images not loading** → Configure Next.js image domains
4. **PWA not installing** → Check manifest.json and HTTPS

### Domain Setup Help:
- **Vercel Domains**: https://vercel.com/docs/concepts/projects/domains
- **DNS Checker**: https://dnschecker.org/
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

---

Your Kuchisabishii app will be live at **https://kuchisabishi.io** with global CDN, automatic SSL, and PWA capabilities! 🍽️✨