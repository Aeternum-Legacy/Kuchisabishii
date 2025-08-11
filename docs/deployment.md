# Kuchisabishii - Deployment Guide

## Overview

This guide covers deployment strategies for both web and mobile applications of Kuchisabishii.

## Web Application Deployment

### Vercel (Recommended)

Vercel provides seamless Next.js deployment with automatic builds and deployments.

#### Setup
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Set up custom domain (optional)

#### Environment Variables
```bash
# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Analytics (optional)
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

#### Build Commands
```bash
# Install dependencies
npm install

# Build shared package
cd shared && npm run build && cd ..

# Build web application
cd web && npm run build
```

#### Deployment Steps
1. Push changes to main branch
2. Vercel automatically detects changes
3. Runs build process
4. Deploys to production URL

### Alternative: Docker Deployment

#### Dockerfile (web/Dockerfile)
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=kuchisabishii
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Mobile Application Deployment

### Expo Application Services (EAS)

EAS provides cloud-based build and submission services for React Native apps.

#### Setup
1. Install EAS CLI: `npm install -g @expo/eas-cli`
2. Login: `eas login`
3. Configure project: `eas build:configure`

#### EAS Configuration (eas.json)
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "../path/to/api-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEFGHIJ"
      }
    }
  }
}
```

#### Build Commands
```bash
# Development build
eas build --profile development

# Production build
eas build --profile production --platform all

# Submit to app stores
eas submit --profile production --platform all
```

#### Environment Variables
Set in Expo dashboard or via EAS CLI:
```bash
eas secret:create --name API_BASE_URL --value https://api.kuchisabishii.com
eas secret:create --name CLOUDINARY_UPLOAD_PRESET --value your-preset
```

### Manual Build Process

#### Android (APK)
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Build for Android
expo build:android --type apk

# Or with EAS
eas build --platform android
```

#### iOS (IPA)
```bash
# Build for iOS (requires macOS and Xcode)
expo build:ios --type archive

# Or with EAS
eas build --platform ios
```

## Database Deployment

### PostgreSQL on Railway

1. Create account on Railway.app
2. Deploy PostgreSQL service
3. Note connection details
4. Run migrations

#### Migration Commands
```bash
# Install Prisma CLI
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Supabase (Alternative)

1. Create project on Supabase
2. Set up database schema
3. Configure authentication
4. Use provided connection string

## CI/CD Pipeline

### GitHub Actions

#### Web Deployment (.github/workflows/deploy-web.yml)
```yaml
name: Deploy Web App

on:
  push:
    branches: [main]
    paths: ['web/**', 'shared/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build shared package
        run: cd shared && npm run build
        
      - name: Build web app
        run: cd web && npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

#### Mobile Build (.github/workflows/build-mobile.yml)
```yaml
name: Build Mobile App

on:
  push:
    branches: [main]
    paths: ['mobile/**', 'shared/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Setup Expo CLI
        run: npm install -g @expo/eas-cli
        
      - name: Install dependencies
        run: cd mobile && npm ci
        
      - name: Build with EAS
        run: cd mobile && eas build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Monitoring and Analytics

### Web Application
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior tracking

### Mobile Application
- **Expo Application Services**: Crash reporting
- **Firebase Analytics**: User engagement tracking
- **Sentry**: Error tracking

## Security Considerations

### Environment Variables
- Never commit sensitive data to version control
- Use environment-specific configurations
- Rotate secrets regularly

### HTTPS
- Always use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers

### Database Security
- Use connection pooling
- Enable SSL connections
- Regular security updates
- Backup encryption

## Performance Optimization

### Web
- Enable Next.js static optimization
- Use CDN for static assets
- Implement proper caching headers
- Optimize images with next/image

### Mobile
- Use Expo Updates for OTA updates
- Optimize bundle size
- Implement proper image caching
- Use native modules for performance-critical features

## Backup Strategy

### Database Backups
- Automated daily backups
- Point-in-time recovery
- Cross-region backup storage
- Regular backup testing

### File Storage Backups
- Automated cloud storage backups
- Versioning for uploaded images
- Regular backup verification