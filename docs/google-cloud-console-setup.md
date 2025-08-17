# Google Cloud Console Setup Guide

Complete configuration guide for Google Cloud Console to support Supabase native OAuth implementation in the Kuchisabishii application.

## 🎯 Overview

This guide provides step-by-step instructions for:
- Creating and configuring OAuth 2.0 Client ID
- Setting up authorized domains and redirect URIs
- Configuring OAuth consent screen
- Managing API access and permissions
- Environment-specific configurations

## 🚀 Getting Started

### Prerequisites

- Google account with access to Google Cloud Console
- Project domains (staging and production)
- Supabase project details

### Initial Setup

1. **Navigate to Google Cloud Console**
   ```
   URL: https://console.cloud.google.com/
   ```

2. **Select or Create Project**
   - Existing project: Select "Kuchisabishii" project
   - New project: Click "New Project" and create "Kuchisabishii"
   - Note your **Project ID** for reference

## 🔐 OAuth 2.0 Configuration

### Step 1: Configure OAuth Consent Screen

#### Navigate to OAuth Consent Screen
```
Path: APIs & Services > OAuth consent screen
URL: https://console.cloud.google.com/apis/credentials/consent
```

#### User Type Selection
- Choose: **External** (for public application)
- Click **CREATE**

#### App Information Configuration

**Required Fields:**
```
App name: Kuchisabishii
User support email: people@kuchisabishii.io
App logo: [Upload your app logo - 120x120px PNG]
```

**App Domain Configuration:**
```
Application home page: https://kuchisabishii.io
Application privacy policy: https://kuchisabishii.io/privacy
Application terms of service: https://kuchisabishii.io/terms
```

**Authorized Domains:**
```
kuchisabishii.io
vercel.app
supabase.co
localhost (for development)
```

**Developer Contact Information:**
```
Email addresses: people@kuchisabishii.io
```

#### Scopes Configuration

Click **ADD OR REMOVE SCOPES** and add:

**OAuth Scopes Required:**
```
openid
email
profile
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

**Scope Justification:**
- `openid`: Required for OpenID Connect authentication
- `email`: Access to user's email address for account creation
- `profile`: Access to basic profile information (name, picture)

#### Test Users (Development Phase)

Add test user emails:
```
your-dev-email@gmail.com
test-user@gmail.com
staging-test@gmail.com
```

**Note**: Remove this section before publishing to production

#### Publishing Status

- **Development**: Keep in testing mode
- **Production**: Submit for verification when ready

### Step 2: Create OAuth 2.0 Client ID

#### Navigate to Credentials
```
Path: APIs & Services > Credentials
URL: https://console.cloud.google.com/apis/credentials
```

#### Create New Credentials

1. Click **+ CREATE CREDENTIALS**
2. Select **OAuth 2.0 Client ID**
3. Configure application type: **Web application**

#### Client Configuration

**Name:**
```
Kuchisabishii Web Client
```

**Authorized JavaScript Origins:**

Add all environments where your app will run:
```
# Development
http://localhost:3000
http://localhost:3006

# Staging
https://kuchisabishii-staging.vercel.app
https://staging.kuchisabishii.io

# Production
https://kuchisabishii.io
https://www.kuchisabishii.io

# Supabase (for native OAuth)
https://auelvsosyxrvbvxozhuz.supabase.co
```

**Authorized Redirect URIs:**

Configure callback URLs for all environments:
```
# Development - Custom Implementation
http://localhost:3000/api/auth/callback/google
http://localhost:3006/api/auth/callback/google

# Staging - Custom Implementation
https://kuchisabishii-staging.vercel.app/api/auth/callback/google
https://staging.kuchisabishii.io/api/auth/callback/google

# Production - Custom Implementation
https://kuchisabishii.io/api/auth/callback/google
https://www.kuchisabishii.io/api/auth/callback/google

# Supabase Native OAuth Callback
https://auelvsosyxrvbvxozhuz.supabase.co/auth/v1/callback
```

#### Save and Retrieve Credentials

After clicking **CREATE**, you'll receive:

```
Client ID: 455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
Client Secret: GOCSPX-[your-unique-secret]
```

**⚠️ Important**: Copy and securely store both values immediately.

## 🔧 API Configuration

### Step 3: Enable Required APIs

#### Navigate to API Library
```
Path: APIs & Services > Library
URL: https://console.cloud.google.com/apis/library
```

#### Enable These APIs

**Required APIs:**
1. **Google+ API**
   ```
   Purpose: User profile information
   Status: Enable
   ```

2. **People API** 
   ```
   Purpose: Advanced user data access
   Status: Enable
   ```

3. **OAuth2 API**
   ```
   Purpose: OAuth authentication flow
   Status: Enable (usually enabled by default)
   ```

**Optional APIs (if using additional Google services):**
4. **Maps JavaScript API**
   ```
   Purpose: Location features (if implemented)
   Status: Enable if needed
   ```

5. **Places API**
   ```
   Purpose: Restaurant location data
   Status: Enable if needed
   ```

### Step 4: Quota and Billing Configuration

#### Check API Quotas
```
Path: APIs & Services > Quotas
```

**Default Quotas (sufficient for most applications):**
```
OAuth2 API: 10,000 requests/day
People API: 1,000 requests/day
Google+ API: 1,000 requests/day
```

#### Billing Account (if needed)
- Link billing account for higher quotas
- Monitor usage in console dashboard

## 🌍 Environment-Specific Configuration

### Development Environment

**JavaScript Origins:**
```
http://localhost:3000
http://localhost:3006
```

**Redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
http://localhost:3006/api/auth/callback/google
```

**Environment Variables:**
```bash
GOOGLE_CLIENT_ID=455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-dev-secret
```

### Staging Environment

**JavaScript Origins:**
```
https://kuchisabishii-staging.vercel.app
https://staging.kuchisabishii.io
```

**Redirect URIs:**
```
https://kuchisabishii-staging.vercel.app/api/auth/callback/google
https://staging.kuchisabishii.io/api/auth/callback/google
```

**Environment Variables:**
```bash
GOOGLE_CLIENT_ID=455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-staging-secret
```

### Production Environment

**JavaScript Origins:**
```
https://kuchisabishii.io
https://www.kuchisabishii.io
```

**Redirect URIs:**
```
https://kuchisabishii.io/api/auth/callback/google
https://www.kuchisabishii.io/api/auth/callback/google
```

**Environment Variables:**
```bash
GOOGLE_CLIENT_ID=455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-production-secret
```

## 🔒 Security Configuration

### Step 5: Advanced Security Settings

#### API Key Restrictions (if using API keys)

1. **Navigate to Credentials**
2. **Create API Key** (if needed for Maps/Places)
3. **Restrict Key:**
   ```
   Application restrictions: HTTP referrers
   Allowed referrers:
   - https://kuchisabishii.io/*
   - https://www.kuchisabishii.io/*
   - https://*.vercel.app/*
   - http://localhost:*/*
   ```

#### OAuth Client Security

**Security Best Practices:**
- Use different client secrets per environment
- Regularly rotate client secrets
- Monitor OAuth usage in console
- Set up alerts for unusual activity

**Monitoring Setup:**
```
Path: APIs & Services > Dashboard
Enable: API usage monitoring
Set alerts: For quota limits and unusual spikes
```

## 🧪 Testing & Verification

### Step 6: Test OAuth Configuration

#### OAuth Playground Testing

1. **Navigate to OAuth Playground:**
   ```
   URL: https://developers.google.com/oauthplayground/
   ```

2. **Configure OAuth Playground:**
   ```
   OAuth 2.0 configuration: Custom
   OAuth Client ID: 455260463368-lcokr50o1cvtsjs9m7pmujjnkvmc4756.apps.googleusercontent.com
   OAuth Client secret: [Your client secret]
   ```

3. **Test Scopes:**
   ```
   Select scopes:
   - https://www.googleapis.com/auth/userinfo.email
   - https://www.googleapis.com/auth/userinfo.profile
   - openid
   ```

4. **Authorize and Test:**
   - Click "Authorize APIs"
   - Complete OAuth flow
   - Verify token exchange works
   - Test API calls with received token

#### Browser Testing

**Test URLs for each environment:**

```bash
# Development
http://localhost:3006/api/auth/social/google

# Staging  
https://staging.kuchisabishii.io/api/auth/social/google

# Production
https://kuchisabishii.io/api/auth/social/google
```

**Expected Flow:**
1. Redirect to Google OAuth screen
2. User consent (if first time)
3. Redirect back to callback URL
4. Successful authentication

## 📊 Monitoring & Maintenance

### Step 7: Ongoing Management

#### Usage Monitoring

**Monitor These Metrics:**
```
Path: APIs & Services > Dashboard
Metrics:
- OAuth requests per day
- Error rates
- User consent flow completion
- Token refresh rates
```

#### Quota Management

**Set up Alerts:**
```
Alert thresholds:
- 80% of daily quota used
- Unusual spike in requests
- High error rates
```

#### Security Monitoring

**Regular Security Checks:**
- Review authorized domains monthly
- Check for unauthorized API access
- Monitor OAuth consent screen status
- Update redirect URIs when domains change

#### Compliance Management

**For Production Apps:**
- Submit OAuth consent screen for verification
- Respond to Google's security reviews
- Keep privacy policy and terms updated
- Monitor for policy violations

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. "Error 400: redirect_uri_mismatch"

**Cause:** Redirect URI not exactly matching
**Solution:** 
```
1. Check exact URI in Google Console
2. Ensure protocol (http/https) matches
3. Verify no trailing slashes
4. Case-sensitive matching required
```

#### 2. "Error 403: access_denied"

**Cause:** App not verified or consent screen issues
**Solution:**
```
1. Check OAuth consent screen configuration
2. Verify app domain authorization
3. Ensure user is added as test user (in development)
4. Submit for verification (in production)
```

#### 3. "Error 401: invalid_client"

**Cause:** Client ID or secret incorrect
**Solution:**
```
1. Verify Client ID matches exactly
2. Check Client Secret is correct
3. Ensure credentials are for correct project
4. Regenerate credentials if needed
```

#### 4. Quota Exceeded Errors

**Cause:** API quota limits reached
**Solution:**
```
1. Check quota usage in console
2. Implement request caching
3. Request quota increase
4. Enable billing for higher limits
```

### Debug Tools

#### Google OAuth Debug Console
```
URL: https://developers.google.com/identity/protocols/oauth2/web-server#httprest
Use for: Testing OAuth flows manually
```

#### Chrome Developer Tools
```
Network tab: Monitor OAuth requests
Console: Check for JavaScript errors
Application tab: Verify tokens/cookies
```

This comprehensive Google Cloud Console setup ensures secure and reliable OAuth authentication for the Kuchisabishii application across all deployment environments.