# OAuth Setup Guide for Kuchisabishii

## 🔵 Google OAuth Setup

### Step 1: Access Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Sign in with your Google account
3. Click "Select a project" dropdown at the top
4. Click "NEW PROJECT"
5. Name it: "Kuchisabishii"
6. Click "CREATE"

### Step 2: Enable Required APIs
1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - Google+ API
   - Google Identity Toolkit API
   - People API
3. Click "ENABLE" for each

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (for public testing)
3. Click "CREATE"
4. Fill in the form:
   - **App name**: Kuchisabishii
   - **User support email**: people@kuchisabishii.io
   - **App logo**: Upload your Kuchisabishii logo
   - **Application home page**: https://kuchisabishii.io
   - **Application privacy policy**: https://kuchisabishii.io/privacy
   - **Application terms of service**: https://kuchisabishii.io/terms
   - **Authorized domains**: 
     - kuchisabishii.io
     - vercel.app
     - supabase.co
   - **Developer contact**: people@kuchisabishii.io
5. Click "SAVE AND CONTINUE"
6. On Scopes page, add these scopes:
   - .../auth/userinfo.email
   - .../auth/userinfo.profile
   - openid
7. Click "SAVE AND CONTINUE"
8. Add test users if needed (optional for now)
9. Review and click "BACK TO DASHBOARD"

### Step 4: Create OAuth 2.0 Client ID
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Choose "Web application"
4. Name: "Kuchisabishii Web Client"
5. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://kuchisabishii.io
   https://staging.kuchisabishii.io
   https://kuchisabishii.vercel.app
   https://kuchisabishii-staging.vercel.app
   ```
6. Add Authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/api/auth/callback/google
   https://kuchisabishii.io/auth/callback
   https://kuchisabishii.io/api/auth/callback/google
   https://staging.kuchisabishii.io/auth/callback
   https://staging.kuchisabishii.io/api/auth/callback/google
   https://auelvsosyxrvbvxozhuz.supabase.co/auth/v1/callback
   ```
7. Click "CREATE"
8. **COPY YOUR CREDENTIALS**:
   - Client ID: (looks like: xxxxx.apps.googleusercontent.com)
   - Client Secret: (keep this secure!)

## 🍎 Apple OAuth Setup

### Step 1: Apple Developer Account
1. Go to https://developer.apple.com/
2. Sign in with your Apple ID
3. Ensure you have a paid developer account ($99/year)

### Step 2: Register App ID
1. Go to "Certificates, Identifiers & Profiles"
2. Click "Identifiers" → "+"
3. Select "App IDs" → "Continue"
4. Select "App" → "Continue"
5. Fill in:
   - **Description**: Kuchisabishii
   - **Bundle ID**: io.kuchisabishii.app (Explicit)
   - **Capabilities**: Check "Sign in with Apple"
6. Click "Continue" → "Register"

### Step 3: Create Service ID
1. Still in "Identifiers", click "+"
2. Select "Services IDs" → "Continue"
3. Fill in:
   - **Description**: Kuchisabishii Web Auth
   - **Identifier**: io.kuchisabishii.web
4. Click "Continue" → "Register"
5. Click on the created Service ID
6. Check "Sign In with Apple"
7. Click "Configure"
8. Primary App ID: Select "Kuchisabishii"
9. Add domains and return URLs:
   - **Domains**: 
     - kuchisabishii.io
     - staging.kuchisabishii.io
   - **Return URLs**:
     - https://kuchisabishii.io/auth/callback
     - https://kuchisabishii.io/api/auth/callback/apple
     - https://staging.kuchisabishii.io/auth/callback
     - https://staging.kuchisabishii.io/api/auth/callback/apple
     - https://auelvsosyxrvbvxozhuz.supabase.co/auth/v1/callback
10. Click "Next" → "Done" → "Continue" → "Save"

### Step 4: Create Private Key
1. Go to "Keys" → "+"
2. Key Name: "Kuchisabishii Auth Key"
3. Check "Sign in with Apple"
4. Configure → Select "Kuchisabishii" app
5. Click "Save" → "Continue" → "Register"
6. **DOWNLOAD THE KEY FILE** (AuthKey_XXXXXXXXXX.p8)
7. **SAVE THESE VALUES**:
   - Key ID: (shown on the key page)
   - Team ID: (found in Membership page)
   - Client ID: io.kuchisabishii.web (the Service ID)
   - Private Key: (contents of the .p8 file)

## 🔐 Supabase Configuration

### Step 1: Configure Google Provider
1. Go to your Supabase Dashboard
2. Navigate to "Authentication" → "Providers"
3. Click on "Google"
4. Toggle "Enable Google provider"
5. Add:
   - **Client ID**: (from Google OAuth setup)
   - **Client Secret**: (from Google OAuth setup)
6. Copy the Callback URL shown (should be: https://auelvsosyxrvbvxozhuz.supabase.co/auth/v1/callback) -  https://auelvsosyxrvbvxozhuz.supabase.co/auth/v1/callback confirmed
7. Click "Save"

### Step 2: Configure Apple Provider
1. Still in "Authentication" → "Providers"
2. Click on "Apple"
3. Toggle "Enable Apple provider"
4. Add:
   - **Service ID**: io.kuchisabishii.web
   - **Team ID**: (from Apple Developer)
   - **Key ID**: (from Apple Developer)
   - **Private Key**: (paste entire .p8 file contents)
5. Click "Save"

### Step 3: Configure Redirect URLs
1. Go to "Authentication" → "URL Configuration"
2. Add to "Redirect URLs":
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   https://kuchisabishii.io
   https://kuchisabishii.io/auth/callback
   https://staging.kuchisabishii.io
   https://staging.kuchisabishii.io/auth/callback
   ```
3. Click "Save"

## 📋 Update Environment Variables

After completing the above, update your `.env.local` and `.env.staging`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Apple OAuth
APPLE_CLIENT_ID=io.kuchisabishii.web
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_PRIVATE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENTS_HERE
-----END PRIVATE KEY-----"
```

## ✅ Verification Checklist

- [ ] Google OAuth Client created
- [ ] Google redirect URLs added
- [ ] Apple App ID registered
- [ ] Apple Service ID configured
- [ ] Apple Private Key downloaded
- [ ] Supabase Google provider enabled
- [ ] Supabase Apple provider enabled
- [ ] Environment variables updated
- [ ] Redirect URLs configured in Supabase

## 🚨 Important Notes

1. **Keep credentials secure** - Never commit them to git
2. **Apple Private Key** - Download it only once, Apple won't show it again
3. **Domain Verification** - Apple may require domain verification via a file upload
4. **Testing** - Use test users initially before going public
5. **Rate Limits** - Both providers have rate limits, implement proper error handling