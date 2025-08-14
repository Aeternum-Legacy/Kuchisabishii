# 🚀 Kuchisabishii Staging Deployment Test Checklist

**Staging URL**: https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app

## 📋 Manual Testing Checklist

### 1. **Initial Access** ✅
- [ ] Open the staging URL in your browser
- [ ] Verify the page loads without errors
- [ ] Check browser console for any JavaScript errors (F12 → Console)

### 2. **Homepage Verification** 🏠
- [ ] Logo displays correctly (your provided logo)
- [ ] No "Demo Mode" button visible
- [ ] Only "Continue as Demo User" and "New User? Start Setup" buttons shown
- [ ] Professional UI with hover effects on buttons

### 3. **Authentication Testing** 🔐

#### Google OAuth:
- [ ] Click "Continue with Google"
- [ ] Google OAuth popup appears
- [ ] Can authenticate with Google account
- [ ] Redirects back to app after authentication

#### Email Registration:
- [ ] Click "New User? Start Setup"
- [ ] Registration form appears
- [ ] Can register with email/password
- [ ] Email verification sent to registered email

### 4. **UI/UX Enhancements** 🎨
- [ ] All buttons have hover effects (scale/shadow)
- [ ] Mobile responsive design works
- [ ] Food-centric orange color scheme present
- [ ] Professional loading states appear

### 5. **Core Features** 🍽️
- [ ] Restaurant search with Google Maps
- [ ] Food logging interface
- [ ] Profile page (no LinkedIn features)
- [ ] Social sharing features

### 6. **Security Verification** 🔒
- [ ] No Apple Sign-On button anywhere
- [ ] No demo user profiles visible
- [ ] OAuth credentials not exposed in page source

## 🔧 Troubleshooting

### If the page doesn't load:
1. **Check Vercel Dashboard** for build errors
2. **Verify environment variables** are set in Vercel:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - All others from `.env.staging`

### If authentication fails:
1. **Verify Google OAuth** is configured in Supabase
2. **Check redirect URLs** match your staging domain
3. **Ensure environment variables** are correct

### If you see build errors:
Run locally to test:
```bash
npm run build
npm run start
```

## 📊 Expected Results

✅ **What Should Work:**
- Google OAuth authentication
- Professional UI with hover effects
- Food journaling features
- Restaurant discovery with maps
- Email system (people@kuchisabishii.io)

❌ **What Should NOT Appear:**
- Apple Sign-On buttons
- Demo mode options
- LinkedIn profile features
- Mock user data

## 🚨 Common Issues & Fixes

### Issue: "Application error: a client-side exception has occurred"
**Fix**: Check Vercel Function Logs for errors

### Issue: Google OAuth redirect error
**Fix**: Add staging URL to Google OAuth authorized redirects:
- `https://kuchisabishii-app-git-staging-aeternum-legacys-projects.vercel.app/auth/callback`

### Issue: Database connection errors
**Fix**: Verify Supabase credentials in Vercel environment variables

## 📝 Database Cleanup (Required)

Before testing with real users, run in Supabase SQL Editor:
```sql
-- Check current state first
SELECT COUNT(*) FROM auth.users;

-- Then run cleanup script
-- Located at: /database/scripts/production-cleanup.sql
```

## 🎯 Next Steps After Testing

1. **Fix any identified issues**
2. **Clean the database** using provided scripts
3. **Configure custom domain** (optional)
4. **Launch for public testing**

---

**Please test the staging URL now and let me know:**
1. Does the page load?
2. What do you see on the homepage?
3. Any error messages?

This will help me identify and fix any deployment issues!