# 🧪 Quick Test Instructions - Phase 5 Preview

## Live Test Site
**URL**: https://kuchisabishii-7cp3ekfu3-aeternum-legacys-projects.vercel.app

## ⚠️ Email Verification Issue
Currently, email verification redirects to localhost instead of the preview URL. 

### Workaround Options:

**Option A: Use Social Login (Recommended)**
- Click "Continue with Google" or "Continue with Apple"
- No email verification required
- Instant access to test Phase 5 features

**Option B: Skip Email Registration**
If you have access to the Supabase dashboard:
1. Temporarily disable email confirmation in Supabase settings
2. Register normally without email verification

**Option C: Test Locally**
```bash
git checkout feature/phase5-ai-recommendations
npm install && npm run dev
# Visit: http://localhost:3000
```

## 🎯 Phase 5 Features to Test

### 1. **AI Onboarding Flow** ⭐
- **URL**: `/onboarding`
- **What to test**: 11-dimensional taste profiling questionnaire
- **Expected**: Interactive questions with real-time insights and radar chart

### 2. **Enhanced User Profiles** ⭐
- **URL**: `/profile` 
- **What to test**: Navigate food history tabs
- **Expected**: Recent, Favorites, To-Try tabs with enhanced visualizations

### 3. **Main Dashboard**
- **URL**: `/`
- **What to test**: Overall app navigation and UI
- **Expected**: Clean, responsive design with Phase 5 components

### 4. **Group Recommendation UI**
- **Location**: Profile page components
- **What to test**: Group voting interface elements
- **Expected**: Democratic voting UI (demo state)

## 📱 Mobile Testing
- Test on mobile device or browser dev tools
- Verify touch interactions work properly
- Check responsive design across screen sizes

## 🚀 Quick Test Scenarios

### Scenario 1: New User Experience
1. Access preview URL
2. Use social login to authenticate
3. Complete onboarding questionnaire at `/onboarding`
4. Explore profile page with new tabs

### Scenario 2: UI/UX Validation
1. Test navigation between pages
2. Verify mobile responsiveness 
3. Check accessibility (keyboard navigation)
4. Validate visual design consistency

### Scenario 3: API Testing
1. Open browser dev tools
2. Navigate to different pages
3. Check network tab for API calls
4. Verify no console errors

## ✅ Success Criteria

- [ ] Application loads without errors
- [ ] Authentication works (social login)
- [ ] Onboarding flow completes successfully
- [ ] Profile page shows enhanced tabs
- [ ] Mobile experience is optimized
- [ ] No critical console errors
- [ ] API endpoints respond correctly

## 📝 Feedback Collection

**What to Note:**
- Any errors or broken functionality
- UI/UX improvements needed
- Performance issues
- Mobile experience feedback
- Missing features or expectations

**Positive Aspects:**
- Features that work well
- Good user experience elements
- Impressive AI/ML capabilities
- Strong visual design

## 🔄 Next Steps

After testing, we can:
1. **Fix auth issues** and redeploy
2. **Address any bugs** found during testing
3. **Merge to main** if satisfied with implementation
4. **Deploy to production** with full AI algorithm enabled