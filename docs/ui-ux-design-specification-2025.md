# Kuchisabishii - Mobile-First UI/UX Design System

## Executive Summary

This comprehensive design system specification outlines a mobile-first UI/UX framework for Kuchisabishii that combines Uber Eats-style navigation with Facebook-inspired social elements. The design prioritizes food-centric experiences, thumb-friendly interactions, and seamless social discovery while maintaining accessibility and cross-platform consistency.

## 1. Design Philosophy & Core Principles

### Design Philosophy
- **Food-First**: Every design decision prioritizes food content visibility and appetite appeal
- **Mobile-Native**: Optimized for thumb-friendly interactions with gesture-based navigation
- **Social by Design**: Seamless sharing and discovery of food experiences with friend connections
- **Accessibility**: WCAG 2.1 AA compliant with inclusive design patterns for all users

### Navigation Philosophy: Uber Eats + Facebook Hybrid
**Bottom Tab Navigation (Uber Eats Style)**
- 5 primary tabs: Home, Search, Add Food, Social, Profile
- Card-based content presentation with large food imagery
- Horizontal scrolling categories for food discovery
- Sticky header with location selector and quick actions

**Social Elements (Facebook Style)**
- Activity feed showcasing friend food posts and reviews
- Like, comment, share interactions on food entries
- Friend suggestions based on taste similarity algorithms
- Group dining events and collaborative food discovery

## 2. Color System (Food-Friendly Warm Palette)

### Primary Colors
```css
:root {
  /* Brand Colors - Appetizing & Warm */
  --primary-orange: #FF6B35;        /* Main brand - warm, food-focused */
  --primary-orange-light: #FF8A60;  /* Hover states, lighter interactions */
  --primary-orange-dark: #E55A2B;   /* Active states, pressed buttons */
  
  /* Secondary Colors */
  --secondary-red: #E74C3C;         /* Accent - tomato red for favorites */
  --secondary-yellow: #F39C12;      /* Warnings/highlights - golden turmeric */
  --secondary-green: #27AE60;       /* Success states - fresh herb green */
  
  /* Food Category Colors */
  --category-protein: #8D4E85;      /* Purple for meat/protein dishes */
  --category-carbs: #D4A574;        /* Tan for grains/carbohydrates */
  --category-vegetables: #5D8E3A;   /* Green for vegetables/salads */
  --category-dairy: #4A90E2;        /* Blue for dairy products */
  --category-dessert: #E17B9B;      /* Pink for desserts/sweets */
  --category-beverages: #8E44AD;    /* Purple for drinks/beverages */
}
```

### Neutral Foundation
```css
:root {
  /* Light Theme */
  --neutral-100: #FAFAFA;           /* Background light */
  --neutral-200: #F5F5F5;           /* Card backgrounds */
  --neutral-300: #E0E0E0;           /* Borders and dividers */
  --neutral-400: #BDBDBD;           /* Disabled text */
  --neutral-500: #757575;           /* Secondary text */
  --neutral-600: #424242;           /* Primary text */
  --neutral-700: #212121;           /* Headers and emphasis */
  --neutral-800: #1A1A1A;           /* Dark mode background */
  --neutral-900: #000000;           /* Pure black accents */
}
```

### Dark Mode Adaptations
```css
:root[data-theme="dark"] {
  --primary-orange: #FF7A47;        /* Slightly brighter for dark backgrounds */
  --neutral-100: #1A1A1A;           /* Dark background */
  --neutral-200: #2D2D2D;           /* Dark card surfaces */
  --neutral-300: #404040;           /* Dark borders */
  --neutral-600: #E0E0E0;           /* Light text on dark */
  --neutral-700: #FFFFFF;           /* White headers on dark */
  
  /* Social Interaction Colors (Dark Mode) */
  --like-red: #FF5A6B;
  --share-blue: #4A9EFF;
  --comment-gray: #B3B3B3;
}
```

### Semantic Colors
```css
:root {
  /* Status Colors */
  --success: #4CAF50;               /* Confirmations, positive feedback */
  --warning: #FF9800;               /* Cautions, important notices */
  --error: #F44336;                 /* Destructive actions, errors */
  --info: #2196F3;                  /* Informational messages */
  
  /* Social Interaction Colors */
  --like-red: #FF3040;              /* Heart/like button active state */
  --share-blue: #1877F2;            /* Share button color */
  --comment-gray: #65676B;          /* Comment icon neutral state */
}
```

## 3. Typography System (Mobile-Optimized)

### Font Stack
```css
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-secondary: 'Poppins', sans-serif; /* For headings and emphasis */
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}
```

### Mobile-First Type Scale
```css
:root {
  /* Display (Hero sections, splash screens) */
  --text-display-large: 2.5rem;     /* 40px - App name, major headers */
  --text-display-medium: 2rem;      /* 32px - Page headers */
  --text-display-small: 1.75rem;    /* 28px - Section headers */
  
  /* Headings (Content hierarchy) */
  --text-h1: 1.5rem;                /* 24px - Main titles, food names */
  --text-h2: 1.25rem;               /* 20px - Card titles, restaurant names */
  --text-h3: 1.125rem;              /* 18px - Subsections, categories */
  --text-h4: 1rem;                  /* 16px - Small headers, labels */
  
  /* Body Text (Main content) */
  --text-body-large: 1rem;          /* 16px - Primary content, descriptions */
  --text-body-medium: 0.875rem;     /* 14px - Secondary content, metadata */
  --text-body-small: 0.75rem;       /* 12px - Captions, timestamps */
  
  /* Interactive Elements */
  --text-button-large: 1rem;        /* 16px - Primary buttons, CTAs */
  --text-button-medium: 0.875rem;   /* 14px - Secondary buttons */
  --text-button-small: 0.75rem;     /* 12px - Tertiary buttons, tags */
  
  /* Line Heights (Reading comfort) */
  --line-height-tight: 1.2;         /* Headers, titles */
  --line-height-normal: 1.4;        /* Body text, buttons */
  --line-height-relaxed: 1.6;       /* Long-form content */
  
  /* Letter Spacing (Visual refinement) */
  --letter-spacing-tight: -0.025em; /* Large headings */
  --letter-spacing-normal: 0;       /* Body text */
  --letter-spacing-wide: 0.025em;   /* Small text, buttons */
}
```

### Typography Classes
```css
/* Food-Specific Typography */
.food-title {
  font-size: var(--text-h1);
  font-weight: 700;
  color: var(--neutral-700);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.restaurant-name {
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--neutral-600);
  line-height: var(--line-height-normal);
}

.food-description {
  font-size: var(--text-body-medium);
  color: var(--neutral-500);
  line-height: var(--line-height-relaxed);
}

.price-text {
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--primary-orange);
}

.rating-text {
  font-size: var(--text-body-small);
  font-weight: 600;
  color: var(--secondary-yellow);
}
```

## 4. Spacing System (8px Grid)

### Base Spacing Scale
```css
:root {
  /* Base unit: 8px for consistent spacing */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  
  /* Component-specific spacing */
  --padding-xs: var(--space-2);     /* 8px */
  --padding-sm: var(--space-3);     /* 12px */
  --padding-md: var(--space-4);     /* 16px */
  --padding-lg: var(--space-6);     /* 24px */
  --padding-xl: var(--space-8);     /* 32px */
  
  /* Touch target minimum sizes */
  --touch-target: 44px;             /* iOS minimum */
  --touch-target-android: 48px;     /* Android minimum */
}
```

## 5. Bottom Tab Navigation (Uber Eats Style)

### Tab Structure
```typescript
interface TabConfig {
  id: string;
  icon: React.ComponentType;
  iconActive: React.ComponentType;
  label: string;
  badge?: number;
  color: string;
}

const tabs: TabConfig[] = [
  {
    id: 'home',
    icon: HomeOutline,
    iconActive: HomeFilled,
    label: 'Home',
    color: 'var(--primary-orange)'
  },
  {
    id: 'search',
    icon: SearchOutline,
    iconActive: SearchFilled,
    label: 'Search',
    color: 'var(--secondary-green)'
  },
  {
    id: 'addFood',
    icon: PlusCircleOutline,
    iconActive: PlusCircleFilled,
    label: 'Add Food',
    color: 'var(--primary-orange)'
  },
  {
    id: 'social',
    icon: UsersOutline,
    iconActive: UsersFilled,
    label: 'Social',
    badge: 3, // Notification count
    color: 'var(--like-red)'
  },
  {
    id: 'profile',
    icon: UserOutline,
    iconActive: UserFilled,
    label: 'Profile',
    color: 'var(--neutral-600)'
  }
];
```

### Tab Navigation Styling
```css
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--neutral-300);
  display: flex;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  position: relative;
  min-height: var(--touch-target);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-icon {
  width: 24px;
  height: 24px;
  margin-bottom: var(--space-1);
  transition: transform 0.2s ease;
}

.tab-item.active .tab-icon {
  transform: scale(1.1);
}

.tab-label {
  font-size: var(--text-button-small);
  font-weight: 500;
  color: var(--neutral-400);
  transition: color 0.2s ease;
}

.tab-item.active .tab-label {
  color: var(--primary-orange);
}

.tab-badge {
  position: absolute;
  top: 8px;
  right: 50%;
  transform: translateX(12px);
  background: var(--like-red);
  color: white;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}
```

## 6. Food Entry Cards (Content-First Design)

### Card Component Structure
```typescript
interface FoodEntryCardProps {
  id: string;
  imageUrl: string;
  dishName: string;
  restaurantName: string;
  rating: number; // 1-5 scale
  price?: string;
  tags: string[];
  timestamp: Date;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  socialStats: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
  };
  location?: {
    name: string;
    distance: string;
  };
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onPress: () => void;
}
```

### Card Styling
```css
.food-entry-card {
  background: var(--neutral-100);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: var(--space-3) var(--space-4);
  overflow: hidden;
  transition: all 0.2s ease;
}

.food-entry-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  background: var(--neutral-200);
}

.card-content {
  padding: var(--space-4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.dish-name {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--neutral-700);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-1);
}

.restaurant-name {
  font-size: var(--text-body-medium);
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.location-distance {
  font-size: var(--text-body-small);
  color: var(--neutral-400);
  background: var(--neutral-200);
  padding: var(--space-1) var(--space-2);
  border-radius: 8px;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.star-rating {
  display: flex;
  gap: 2px;
}

.star {
  width: 16px;
  height: 16px;
  color: var(--secondary-yellow);
}

.rating-text {
  font-size: var(--text-body-small);
  font-weight: 600;
  color: var(--neutral-600);
}

.price-tag {
  font-size: var(--text-h4);
  font-weight: 700;
  color: var(--primary-orange);
}
```

### Social Action Bar (Facebook Style)
```css
.social-action-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--space-3) 0;
  border-top: 1px solid var(--neutral-300);
  margin-top: var(--space-3);
}

.social-action {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: 8px;
  min-height: var(--touch-target);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  justify-content: center;
}

.social-action:active {
  transform: scale(0.95);
}

.like-action {
  color: var(--neutral-500);
}

.like-action.active {
  color: var(--like-red);
  background: rgba(255, 48, 64, 0.1);
}

.like-action.active .heart-icon {
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.comment-action {
  color: var(--neutral-500);
}

.share-action {
  color: var(--neutral-500);
}

.action-icon {
  width: 20px;
  height: 20px;
}

.action-count {
  font-size: var(--text-body-small);
  font-weight: 600;
  color: inherit;
}
```

## 7. Category Horizontal Scroll (Discovery)

### Category Chip Design
```typescript
interface CategoryChipProps {
  id: string;
  name: string;
  icon: React.ComponentType;
  color: string;
  count?: number;
  isSelected: boolean;
  onPress: (id: string) => void;
}
```

### Category Styling
```css
.category-scroll {
  padding: var(--space-4) 0;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.category-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.category-list {
  display: flex;
  gap: var(--space-3);
  padding: 0 var(--space-4);
}

.category-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3);
  min-width: 80px;
  border-radius: 16px;
  background: var(--neutral-200);
  transition: all 0.2s ease;
  cursor: pointer;
}

.category-chip.selected {
  background: var(--primary-orange);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.category-icon {
  width: 32px;
  height: 32px;
  margin-bottom: var(--space-2);
  color: var(--neutral-600);
}

.category-chip.selected .category-icon {
  color: white;
}

.category-name {
  font-size: var(--text-body-small);
  font-weight: 600;
  color: var(--neutral-600);
  text-align: center;
}

.category-chip.selected .category-name {
  color: white;
}

.category-count {
  font-size: var(--text-body-small);
  color: var(--neutral-400);
  margin-top: var(--space-1);
}

.category-chip.selected .category-count {
  color: rgba(255, 255, 255, 0.8);
}
```

## 8. Sticky Header (Location & Search)

### Header Component
```typescript
interface StickyHeaderProps {
  title: string;
  location?: {
    name: string;
    accuracy: 'precise' | 'approximate';
  };
  onLocationPress?: () => void;
  onSearchPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  scrollOffset: number;
}
```

### Header Styling
```css
.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-top));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid transparent;
  display: flex;
  align-items: flex-end;
  padding: 0 var(--space-4) var(--space-2);
  z-index: 90;
  transition: all 0.2s ease;
}

.sticky-header.scrolled {
  background: rgba(255, 255, 255, 0.98);
  border-bottom-color: var(--neutral-300);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.back-button {
  width: var(--touch-target);
  height: var(--touch-target);
  border-radius: 22px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:active {
  background: var(--neutral-200);
  transform: scale(0.9);
}

.location-selector {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: 20px;
  background: var(--neutral-200);
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-selector:active {
  background: var(--neutral-300);
  transform: scale(0.98);
}

.location-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-orange);
}

.location-text {
  font-size: var(--text-body-medium);
  font-weight: 600;
  color: var(--neutral-700);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-down {
  width: 12px;
  height: 12px;
  color: var(--neutral-500);
  transition: transform 0.2s ease;
}

.location-selector.open .chevron-down {
  transform: rotate(180deg);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.search-button {
  width: var(--touch-target);
  height: var(--touch-target);
  border-radius: 22px;
  background: var(--primary-orange);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.search-button:active {
  transform: scale(0.9);
  box-shadow: 0 1px 4px rgba(255, 107, 53, 0.3);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: white;
}
```

## 9. Floating Action Button (Quick Add)

### FAB Component
```typescript
interface FABProps {
  icon: React.ComponentType;
  onPress: () => void;
  position?: 'bottomRight' | 'bottomCenter';
  extended?: boolean;
  label?: string;
  color?: 'primary' | 'secondary';
  size?: 'small' | 'large';
}
```

### FAB Styling
```css
.fab {
  position: fixed;
  bottom: calc(80px + var(--space-4) + env(safe-area-inset-bottom)); /* Above bottom nav */
  right: var(--space-4);
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, var(--primary-orange) 0%, var(--primary-orange-light) 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  z-index: 110;
  transition: all 0.2s ease;
}

.fab:active {
  transform: scale(0.9);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
}

.fab-extended {
  width: auto;
  min-width: 120px;
  padding: 0 var(--space-4);
  border-radius: 28px;
}

.fab-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.fab-label {
  font-size: var(--text-button-medium);
  font-weight: 600;
  color: white;
  margin-left: var(--space-2);
}

.fab-small {
  width: 40px;
  height: 40px;
  border-radius: 20px;
}

.fab-small .fab-icon {
  width: 20px;
  height: 20px;
}

/* Hide on scroll down, show on scroll up */
.fab.hidden {
  transform: translateY(calc(100% + var(--space-4)));
}
```

## 10. Animation Patterns

### Core Animation System
```css
:root {
  /* Timing Functions */
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Duration Guidelines */
  --duration-fast: 150ms;      /* Micro-interactions */
  --duration-normal: 200ms;    /* Button presses */
  --duration-slow: 300ms;      /* Page transitions */
  --duration-slower: 400ms;    /* Complex animations */
}
```

### Page Transitions
```css
/* Tab switching - instant */
.tab-transition-enter {
  opacity: 0;
}

.tab-transition-enter-active {
  opacity: 1;
  transition: opacity var(--duration-fast) var(--ease-out);
}

/* Modal slide up */
.modal-enter {
  transform: translateY(100%);
  opacity: 0;
}

.modal-enter-active {
  transform: translateY(0);
  opacity: 1;
  transition: all var(--duration-slow) var(--ease-out);
}

.modal-exit {
  transform: translateY(0);
  opacity: 1;
}

.modal-exit-active {
  transform: translateY(100%);
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-in);
}
```

### Micro-interactions
```css
/* Button press feedback */
.button-press {
  transform: scale(0.95);
  transition: transform var(--duration-fast) var(--ease-out);
}

/* Like button animation */
.like-animation {
  animation: likeHeartBeat var(--duration-slow) var(--bounce);
}

@keyframes likeHeartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* Card appearance animation */
.card-appear {
  animation: cardSlideUp var(--duration-normal) var(--ease-out);
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered list animations */
.list-item {
  animation: listItemAppear var(--duration-normal) var(--ease-out);
  animation-fill-mode: both;
}

.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }
.list-item:nth-child(4) { animation-delay: 150ms; }

@keyframes listItemAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Loading States
```css
/* Skeleton loading for cards */
.skeleton {
  background: linear-gradient(90deg, var(--neutral-200) 25%, var(--neutral-300) 50%, var(--neutral-200) 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.skeleton-card {
  background: var(--neutral-100);
  border-radius: 16px;
  padding: var(--space-4);
  margin: var(--space-3) var(--space-4);
}

.skeleton-image {
  width: 100%;
  height: 200px;
  margin-bottom: var(--space-3);
}

.skeleton-title {
  width: 70%;
  height: 20px;
  margin-bottom: var(--space-2);
}

.skeleton-subtitle {
  width: 50%;
  height: 16px;
  margin-bottom: var(--space-2);
}

.skeleton-text {
  width: 100%;
  height: 14px;
  margin-bottom: var(--space-1);
}

.skeleton-text:last-child {
  width: 75%;
}

/* Pull to refresh */
.pull-to-refresh {
  position: relative;
  overflow: hidden;
}

.refresh-indicator {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: var(--primary-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: top var(--duration-normal) var(--ease-out);
}

.pull-to-refresh.pulling .refresh-indicator {
  top: 20px;
}

.refresh-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## 11. Gesture Navigation Patterns

### Touch Gesture System
```typescript
interface GestureConfig {
  // Card interactions
  cardSwipe: {
    leftAction: 'like' | 'save' | 'share';
    rightAction: 'delete' | 'hide';
    threshold: number; // 0-1, percentage of screen width
    snapback: boolean;
  };
  
  // Tab switching
  tabSwipe: {
    enabled: boolean;
    sensitivity: number; // 0-1
    bounceback: boolean;
  };
  
  // Navigation
  edgeSwipe: {
    enabled: boolean;
    edge: 'left' | 'right';
    threshold: number; // pixels from edge
    completion: number; // 0-1, swipe completion required
  };
  
  // Modal dismissal
  modalDismiss: {
    direction: 'down' | 'up';
    threshold: number; // 0-1
    velocity: number; // pixels per second
  };
}
```

### Swipe Actions
```css
.swipeable-card {
  position: relative;
  touch-action: pan-x;
  transition: transform var(--duration-normal) var(--ease-out);
}

.swipe-actions {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.swipe-action-left {
  left: 0;
  background: linear-gradient(90deg, var(--success) 0%, #66BB6A 100%);
}

.swipe-action-right {
  right: 0;
  background: linear-gradient(90deg, var(--error) 0%, #EF5350 100%);
}

.swipe-action-icon {
  width: 24px;
  height: 24px;
  color: white;
}
```

## 12. Responsive Design & Platform Adaptations

### Responsive Breakpoints
```css
:root {
  /* Mobile-first breakpoints */
  --breakpoint-xs: 320px;    /* Small phones (iPhone SE) */
  --breakpoint-sm: 375px;    /* Standard phones (iPhone 12) */
  --breakpoint-md: 414px;    /* Large phones (iPhone Pro Max) */
  --breakpoint-lg: 768px;    /* Tablets portrait */
  --breakpoint-xl: 1024px;   /* Tablets landscape */
  --breakpoint-2xl: 1440px;  /* Desktop */
}

/* Small phone optimizations */
@media (max-width: 374px) {
  .tab-label {
    display: none; /* Hide labels on very small screens */
  }
  
  .food-entry-card {
    margin: var(--space-2) var(--space-3); /* Reduced margins */
  }
  
  .category-chip {
    min-width: 70px; /* Smaller category chips */
  }
}

/* Large phone optimizations */
@media (min-width: 414px) {
  .container {
    max-width: 414px;
    margin: 0 auto;
  }
}

/* Tablet adaptations */
@media (min-width: 768px) {
  .bottom-navigation {
    position: static;
    width: 240px;
    height: 100vh;
    flex-direction: column;
    border-top: none;
    border-right: 1px solid var(--neutral-300);
  }
  
  .tab-item {
    flex-direction: row;
    justify-content: flex-start;
    padding: var(--space-4);
  }
  
  .tab-icon {
    margin-bottom: 0;
    margin-right: var(--space-3);
  }
  
  .tab-label {
    display: block;
  }
  
  .main-content {
    margin-left: 240px;
  }
  
  .food-entry-card {
    max-width: 400px;
    margin: var(--space-3) auto;
  }
}
```

### iOS Specific Adaptations
```css
/* iOS safe area handling */
.ios-safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* iOS-specific styling */
@supports (-webkit-touch-callout: none) {
  .bottom-navigation {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
  }
  
  .sticky-header {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
  }
  
  /* iOS button styling */
  .button {
    border-radius: 8px; /* iOS prefers slightly less rounded */
    -webkit-tap-highlight-color: transparent;
  }
}
```

### Android Specific Adaptations
```css
/* Android material design adaptations */
.android .button {
  border-radius: 4px; /* Material design prefers less rounded */
  elevation: 2dp;
  transition: elevation var(--duration-normal) ease;
}

.android .button:hover {
  elevation: 4dp;
}

.android .fab {
  border-radius: 28px; /* Perfect circle for FAB */
  elevation: 6dp;
}

.android .card {
  elevation: 1dp;
  border-radius: 4px;
}

/* Android ripple effect */
.android .ripple {
  position: relative;
  overflow: hidden;
}

.android .ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.3);
  transform: translate(-50%, -50%);
  transition: width var(--duration-normal) ease, height var(--duration-normal) ease;
}

.android .ripple:active::after {
  width: 300px;
  height: 300px;
}
```

## 13. Accessibility & Inclusive Design

### WCAG 2.2 Compliance

**Color Contrast Requirements**
- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text (18px+)**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Minimum 3:1 contrast ratio

**Touch Target Guidelines**
- **Minimum Size**: 44px × 44px (iOS) / 48dp × 48dp (Android)
- **Recommended Size**: 48px × 48px minimum
- **Spacing**: 8px minimum between targets

**Text & Typography Accessibility**
```css
/* Scalable text sizes supporting dynamic type */
.text-scalable {
  font-size: clamp(14px, 4vw, 18px);
  line-height: 1.5;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid currentColor;
    background: #000000;
    color: #FFFFFF;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Screen Reader Support**
```html
<!-- Semantic HTML structure -->
<button aria-label="Add new food entry" class="fab">
  <span aria-hidden="true">+</span>
</button>

<!-- Form labels and descriptions -->
<label for="food-name" class="input-label">Food Name</label>
<input 
  id="food-name" 
  type="text" 
  class="input-field"
  aria-describedby="food-name-help"
  placeholder="Enter the name of the dish"
>
<div id="food-name-help" class="input-help">
  This will help you remember and search for this dish later
</div>

<!-- Status announcements -->
<div aria-live="polite" id="status-announcements"></div>
```

### Dark Mode Implementation

**Automatic Detection**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #121212;
    --bg-secondary: #1E1E1E;
    --text-primary: #FFFFFF;
    --text-secondary: #B3B3B3;
    --accent-primary: #FF8A80;
  }
}

/* Manual toggle support */
[data-theme="dark"] {
  --bg-primary: #121212;
  --bg-secondary: #1E1E1E;
  --text-primary: #FFFFFF;
  --text-secondary: #B3B3B3;
  --accent-primary: #FF8A80;
}
```

### Inclusive Design Features

**Multi-Language Support**
- RTL (Right-to-Left) language support
- Dynamic font loading for non-Latin scripts
- Cultural color considerations (red = luck in Chinese culture)

**Cognitive Accessibility**
- Clear visual hierarchy
- Consistent navigation patterns
- Error prevention and clear error messages
- Progress indicators for multi-step processes

## 5. Mobile-First Design Patterns

### Responsive Grid System

**Breakpoint System**
```css
/* Mobile First Approach */
.container {
  padding: 0 16px;
  max-width: 100%;
}

/* Small phones */
@media (min-width: 375px) {
  .container {
    padding: 0 20px;
  }
}

/* Large phones / Small tablets */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
    padding: 0 32px;
  }
}

/* Tablets */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 0 48px;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .container {
    max-width: 1200px;
    padding: 0 64px;
  }
}
```

### Touch-Optimized Interactions

**Swipe Gestures**
```css
.swipeable-card {
  touch-action: pan-x;
  transition: transform 0.2s ease;
}

.swipe-action-left {
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  border-radius: 0 8px 8px 0;
}

.swipe-action-right {
  background: linear-gradient(90deg, #F44336, #EF5350);
  border-radius: 8px 0 0 8px;
}
```

**Pull-to-Refresh**
```css
.pull-to-refresh {
  position: relative;
  overflow: hidden;
}

.refresh-indicator {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #FF6B6B;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: top 0.2s ease;
}

.pull-to-refresh.pulling .refresh-indicator {
  top: 20px;
}
```

## 6. Animation & Transition Specifications

### Core Animation Principles

**Timing Functions**
```css
:root {
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Duration Guidelines**
- **Micro-interactions**: 100-200ms
- **UI transitions**: 200-300ms
- **Page transitions**: 300-400ms
- **Complex animations**: 400-600ms

### Specific Animations

**Page Transitions**
```css
/* Slide transition for navigation */
.page-enter {
  transform: translateX(100%);
  opacity: 0;
}

.page-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: all 0.3s var(--ease-out);
}

.page-exit {
  transform: translateX(0);
  opacity: 1;
}

.page-exit-active {
  transform: translateX(-100%);
  opacity: 0;
  transition: all 0.3s var(--ease-in);
}
```

**Loading Animations**
```css
/* Skeleton loading */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
```

**Success/Error Feedback**
```css
/* Shake animation for errors */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-shake {
  animation: shake 0.5s ease-in-out;
}

/* Bounce animation for success */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: scale(1); }
  40%, 43% { transform: scale(1.1); }
}

.success-bounce {
  animation: bounce 0.6s ease-in-out;
}
```

## 7. Component Library Specifications

### Icon System

**Icon Guidelines**
- **Style**: Rounded, friendly, consistent stroke width (2px)
- **Sizes**: 16px, 20px, 24px, 32px, 40px
- **Format**: SVG for scalability
- **Color**: Inherit from parent or semantic colors

**Common Icons**
```svg
<!-- Plus Icon (Add) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 6V18M6 12H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>

<!-- Heart Icon (Favorite) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M20.84 4.61A5.5 5.5 0 0012 5.5a5.5 5.5 0 00-8.84-.89 5.5 5.5 0 000 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- Camera Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
</svg>
```

### Badge System

**Rating Badges**
```css
.rating-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  gap: 4px;
}

.rating-excellent {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: #FFFFFF;
}

.rating-good {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
  color: #FFFFFF;
}

.rating-average {
  background: linear-gradient(135deg, #FFC107, #FFD54F);
  color: #212121;
}

.rating-poor {
  background: linear-gradient(135deg, #F44336, #EF5350);
  color: #FFFFFF;
}
```

### Loading States

**Progressive Loading**
```css
/* Content placeholder */
.content-placeholder {
  background: #f0f0f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.content-placeholder::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: shimmer 1.5s infinite;
}

/* Specific placeholders */
.title-placeholder {
  height: 20px;
  width: 60%;
  margin-bottom: 8px;
}

.text-placeholder {
  height: 14px;
  width: 100%;
  margin-bottom: 4px;
}

.text-placeholder:last-child {
  width: 75%;
}
```

## 8. Implementation Guidelines

### CSS Custom Properties

**Color Variables**
```css
:root {
  /* Primary Colors */
  --color-primary: #FF6B6B;
  --color-primary-variant: #FF8A65;
  --color-secondary: #FFB74D;
  --color-secondary-variant: #FFF176;
  
  /* Background Colors */
  --color-background: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-surface-variant: #F8F8F8;
  
  /* Text Colors */
  --color-on-background: #212121;
  --color-on-surface: #212121;
  --color-on-primary: #FFFFFF;
  
  /* Semantic Colors */
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-round: 50%;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

### Utility Classes

**Spacing Utilities**
```css
/* Margin utilities */
.m-0 { margin: 0; }
.m-1 { margin: var(--spacing-xs); }
.m-2 { margin: var(--spacing-sm); }
.m-3 { margin: var(--spacing-md); }
.m-4 { margin: var(--spacing-lg); }
.m-5 { margin: var(--spacing-xl); }

/* Padding utilities */
.p-0 { padding: 0; }
.p-1 { padding: var(--spacing-xs); }
.p-2 { padding: var(--spacing-sm); }
.p-3 { padding: var(--spacing-md); }
.p-4 { padding: var(--spacing-lg); }
.p-5 { padding: var(--spacing-xl); }

/* Directional spacing */
.mt-1 { margin-top: var(--spacing-xs); }
.mr-1 { margin-right: var(--spacing-xs); }
.mb-1 { margin-bottom: var(--spacing-xs); }
.ml-1 { margin-left: var(--spacing-xs); }

.pt-1 { padding-top: var(--spacing-xs); }
.pr-1 { padding-right: var(--spacing-xs); }
.pb-1 { padding-bottom: var(--spacing-xs); }
.pl-1 { padding-left: var(--spacing-xs); }
```

**Display & Layout Utilities**
```css
/* Flexbox utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

/* Grid utilities */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.gap-1 { gap: var(--spacing-xs); }
.gap-2 { gap: var(--spacing-sm); }
.gap-3 { gap: var(--spacing-md); }
```

## 9. Platform-Specific Considerations

### iOS Design Adaptations

**Safe Area Handling**
```css
.ios-safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.bottom-nav-ios {
  padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
}
```

**iOS-Specific Interactions**
- **Haptic Feedback**: Light haptic on button press, medium on success, heavy on error
- **Swipe Back**: Edge swipe gesture for navigation
- **3D Touch**: Preview functionality where applicable

### Android Design Adaptations

**Material Design Integration**
```css
.material-button {
  background: var(--color-primary);
  border-radius: 4px; /* Less rounded than iOS */
  elevation: 2dp;
  transition: elevation 0.2s ease;
}

.material-button:hover {
  elevation: 4dp;
}

.material-card {
  border-radius: 4dp;
  elevation: 1dp;
}
```

**Android-Specific Features**
- **FAB**: Prominent floating action button
- **Snackbar**: Bottom notification system
- **Navigation Drawer**: Side navigation panel

## 10. Performance Considerations

### Optimization Guidelines

**Image Optimization**
```css
/* Progressive loading */
.image-progressive {
  background: var(--color-surface-variant);
  transition: opacity 0.3s ease;
}

.image-progressive.loaded {
  opacity: 1;
}

/* Responsive images */
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  loading: lazy;
}
```

**Animation Performance**
```css
/* GPU acceleration for animations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
}

/* Efficient animations */
.smooth-animation {
  animation-fill-mode: both;
  animation-timing-function: var(--ease-out);
}
```

### Accessibility Performance

**Reduced Motion Handling**
```css
@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none !important;
    transition: none !important;
  }
  
  .parallax {
    transform: none !important;
  }
}
```

## 11. Testing & Quality Assurance

### Accessibility Testing Checklist

- [ ] Color contrast meets WCAG 2.2 AA standards
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader compatibility tested
- [ ] Touch targets meet minimum size requirements
- [ ] Focus indicators are visible and clear
- [ ] Error messages are descriptive and helpful
- [ ] Form labels are properly associated
- [ ] Alternative text provided for images
- [ ] Loading states are announced to screen readers
- [ ] Auto-playing content can be paused

### Cross-Platform Testing

**Device Testing Matrix**
- iPhone 13 Mini (375px width)
- iPhone 14 Pro (393px width)
- iPhone 14 Pro Max (430px width)
- Samsung Galaxy S22 (360px width)
- iPad Air (820px width)
- iPad Pro 12.9" (1024px width)

**Browser Testing**
- iOS Safari
- Chrome Mobile
- Samsung Internet
- Firefox Mobile

### Performance Metrics

**Target Performance**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

## 12. Design Token Implementation

### JSON Design Tokens

```json
{
  "color": {
    "primary": {
      "50": "#FFF3F3",
      "100": "#FFE0E0",
      "200": "#FFC7C7",
      "300": "#FFA1A1",
      "400": "#FF6B6B",
      "500": "#FF5252",
      "600": "#E53E3E",
      "700": "#C53030",
      "800": "#9B2C2C",
      "900": "#742A2A"
    },
    "secondary": {
      "50": "#FFF9E5",
      "100": "#FFECB3",
      "200": "#FFE082",
      "300": "#FFD54F",
      "400": "#FFCC02",
      "500": "#FFB74D",
      "600": "#FF9800",
      "700": "#F57C00",
      "800": "#E65100",
      "900": "#BF360C"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "typography": {
    "fontFamily": {
      "primary": "SF Pro Display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    "fontSize": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  "borderRadius": {
    "none": "0px",
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "2xl": "24px",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 3px rgba(0, 0, 0, 0.1)",
    "md": "0 2px 8px rgba(0, 0, 0, 0.1)",
    "lg": "0 4px 16px rgba(0, 0, 0, 0.15)",
    "xl": "0 8px 32px rgba(0, 0, 0, 0.2)"
  }
}
```

## Conclusion

This comprehensive design specification provides a solid foundation for creating a modern, accessible, and delightful food journaling app that follows 2025 design trends while maintaining excellent usability. The emphasis on warm, food-inspired colors, rounded friendly interfaces, smooth micro-interactions, and robust accessibility features ensures that Kuchisabishii will provide an engaging and inclusive experience for all users.

The specification balances visual appeal with functionality, creating a design system that is both beautiful and practical for everyday use. Regular testing and iteration based on user feedback will be essential for maintaining and improving the user experience over time.