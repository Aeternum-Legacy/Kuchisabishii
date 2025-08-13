# Phase 5 Test Deployment Guide

## 🚀 Quick Test Setup

### Option 1: Vercel Preview Deployment (Recommended)

The feature branch has been pushed and will automatically create a preview deployment:

1. **Automatic Deployment**: 
   - Branch: `feature/phase5-ai-recommendations`
   - Preview URL will be available at: `https://kuchisabishii-[hash].vercel.app`
   - Check GitHub repository for deployment status

2. **Manual Vercel Deployment**:
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel
   
   # Deploy from feature branch
   vercel --prod=false
   ```

### Option 2: Local Test Server

```bash
# Switch to test branch
git checkout feature/phase5-ai-recommendations

# Install dependencies (if needed)
npm install

# Set up environment variables
cp .env.example .env.local

# Add your Supabase credentials to .env.local:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

## 🧪 Phase 5 Features to Test

### 1. **AI Onboarding Flow**
- **URL**: `/onboarding`
- **Test**: Complete the 11-dimensional taste profiling questionnaire
- **Expected**: Personalized taste insights and radar chart visualization

### 2. **Enhanced User Profiles**  
- **URL**: `/profile`
- **Test**: Navigate through food history tabs (Recent, Favorites, To-Try)
- **Expected**: Enhanced palate profile with visual representations

### 3. **Recommendation System (Simplified)**
- **API**: `/api/recommendations`
- **Test**: Make authenticated API calls
- **Expected**: Mock recommendations with confidence scores

### 4. **Group Features** (UI Components)
- **Location**: Profile page components
- **Test**: Inspect group recommendation UI elements
- **Expected**: Group voting interface (demo state)

## 🔧 Test Environment Setup

### Database Requirements
- Phase 5 requires the new AI/ML tables from `database/schemas/`
- Run the SQL scripts in your test Supabase instance:
  - `07_ai_ml_tables.sql`
  - `08_palate_profile_tables.sql`

### Environment Variables Needed
```env
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key
```

## ✅ Testing Checklist

### Core Functionality
- [ ] Application builds successfully
- [ ] Authentication works (login/register)
- [ ] Basic navigation functions
- [ ] Profile page loads without errors

### Phase 5 Features
- [ ] Onboarding flow completes without errors
- [ ] Taste profile questionnaire saves data
- [ ] Enhanced profile tabs render correctly
- [ ] Recommendation API returns mock data
- [ ] Group recommendation UI displays properly

### Mobile Responsiveness
- [ ] All components work on mobile screens
- [ ] Touch interactions function properly
- [ ] Performance is acceptable on mobile

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Proper ARIA labels and roles

## 🐛 Known Limitations in Test Version

1. **Simplified Recommendations**: Using mock data instead of full AI algorithm
2. **Database Schema**: May need to run migration scripts
3. **Advanced Analytics**: Limited to basic metrics
4. **Real-time Features**: WebSocket features not fully implemented

## 📊 Success Metrics

- ✅ **Build Success**: Application compiles without errors
- ✅ **Core UX**: All main user flows function
- ✅ **Phase 5 UI**: All new components render properly
- ✅ **API Integration**: Basic API endpoints respond correctly
- ✅ **Mobile Experience**: Responsive design works across devices

## 🔄 After Testing

### If Tests Pass:
1. Create pull request to merge into `main`
2. Enable full AI algorithm implementation
3. Set up production environment variables
4. Deploy to production

### If Issues Found:
1. Document bugs and feedback
2. Create GitHub issues for tracking
3. Fix issues on feature branch
4. Re-test and iterate

---

## Quick Start Command

```bash
# One-command test setup
git checkout feature/phase5-ai-recommendations && npm install && cp .env.example .env.local && npm run dev
```

Test URL: `http://localhost:3000`

**Note**: Remember to add your Supabase credentials to `.env.local` before testing!