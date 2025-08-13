# Kuchisabishii - UI/UX Design Specification 2025

## Executive Summary

This design specification outlines the comprehensive UI/UX design system for Kuchisabishii, a food journaling and recommendation app. Based on extensive research of 2025 design trends, this specification provides a complete design framework that balances modern aesthetics with accessibility, creating a fun, cute, and highly functional user experience.

## 1. Color Palettes & Typography

### Primary Color Palette

**Warm & Inviting Scheme (Food-Focused)**
- **Primary Orange**: `#FF6B6B` (Coral Red) - Main brand color, appetite-stimulating
- **Secondary Peach**: `#FFB74D` (Warm Peach) - Secondary actions, warm accent
- **Tertiary Coral**: `#FF8A65` (Soft Coral) - Tertiary elements, gentle highlights
- **Accent Yellow**: `#FFF176` (Butter Yellow) - Success states, positive feedback

**Neutral Foundation**
- **Background Light**: `#FAFAFA` (Warm White) - Main background
- **Background Dark**: `#F5F5F5` (Light Gray) - Secondary background
- **Surface**: `#FFFFFF` (Pure White) - Card surfaces, modals
- **Surface Variant**: `#F8F8F8` (Off-White) - Input fields, subtle surfaces

**Text Hierarchy**
- **Primary Text**: `#212121` (Dark Charcoal) - Main text content
- **Secondary Text**: `#757575` (Medium Gray) - Supporting text
- **Tertiary Text**: `#BDBDBD` (Light Gray) - Hints, placeholders
- **Inverse Text**: `#FFFFFF` (White) - Text on colored backgrounds

**Semantic Colors**
- **Success**: `#4CAF50` (Fresh Green) - Positive actions, confirmations
- **Warning**: `#FF9800` (Amber) - Cautions, important notices
- **Error**: `#F44336` (Error Red) - Destructive actions, errors
- **Info**: `#2196F3` (Info Blue) - Informational messages

### Dark Mode Palette

**Primary Dark Scheme**
- **Background Dark**: `#121212` (Near Black) - Main background
- **Surface Dark**: `#1E1E1E` (Dark Gray) - Card surfaces
- **Primary Dark**: `#FF8A80` (Light Coral) - Primary actions in dark mode
- **Secondary Dark**: `#FFD54F` (Light Yellow) - Secondary elements

### Typography System

**Primary Font: SF Pro (iOS) / Roboto (Android)**
- Modern, readable, system-optimized
- Excellent multi-language support
- Optimized for mobile screens

**Font Scale & Hierarchy**
```css
/* Display */
.text-display-large { font-size: 57px; line-height: 64px; font-weight: 400; }
.text-display-medium { font-size: 45px; line-height: 52px; font-weight: 400; }
.text-display-small { font-size: 36px; line-height: 44px; font-weight: 400; }

/* Headline */
.text-headline-large { font-size: 32px; line-height: 40px; font-weight: 600; }
.text-headline-medium { font-size: 28px; line-height: 36px; font-weight: 600; }
.text-headline-small { font-size: 24px; line-height: 32px; font-weight: 600; }

/* Title */
.text-title-large { font-size: 22px; line-height: 28px; font-weight: 500; }
.text-title-medium { font-size: 16px; line-height: 24px; font-weight: 500; }
.text-title-small { font-size: 14px; line-height: 20px; font-weight: 500; }

/* Body */
.text-body-large { font-size: 16px; line-height: 24px; font-weight: 400; }
.text-body-medium { font-size: 14px; line-height: 20px; font-weight: 400; }
.text-body-small { font-size: 12px; line-height: 16px; font-weight: 400; }

/* Label */
.text-label-large { font-size: 14px; line-height: 20px; font-weight: 500; }
.text-label-medium { font-size: 12px; line-height: 16px; font-weight: 500; }
.text-label-small { font-size: 11px; line-height: 16px; font-weight: 500; }
```

## 2. Interactive Elements

### Button Design System

**Primary Button (CTA)**
```css
.btn-primary {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8A65 100%);
  border-radius: 24px;
  height: 48px;
  min-width: 120px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(255, 107, 107, 0.3);
}
```

**Secondary Button**
```css
.btn-secondary {
  background: transparent;
  border: 2px solid #FF6B6B;
  border-radius: 24px;
  height: 48px;
  min-width: 120px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #FF6B6B;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #FF6B6B;
  color: #FFFFFF;
}
```

**Floating Action Button (FAB)**
```css
.fab {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8A65 100%);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}
```

### Micro-Interactions

**Button Press Animation**
- **Duration**: 200-300ms
- **Easing**: `cubic-bezier(0.4, 0.0, 0.2, 1)`
- **Scale**: 0.95x on press
- **Ripple Effect**: Material Design ripple with primary color

**Loading States**
```css
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-top: 2px solid #FF6B6B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**Success Feedback**
- **Checkmark Animation**: Scale from 0 to 1.2x then to 1x
- **Color Transition**: Button background animates to success green
- **Duration**: 500ms total

### Navigation Patterns

**Bottom Navigation (Primary)**
```css
.bottom-nav {
  height: 80px;
  background: #FFFFFF;
  border-top: 1px solid #F0F0F0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  transition: all 0.2s ease;
}

.nav-item.active {
  color: #FF6B6B;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  transition: transform 0.2s ease;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}
```

**Gesture-Based Navigation**
- **Swipe Right**: Back navigation
- **Swipe Left**: Forward navigation (where applicable)
- **Pull to Refresh**: 60px pull distance, spring animation
- **Swipe to Delete**: Red background reveal with trash icon

## 3. Layout & Components

### Card Design System

**Food Entry Card**
```css
.food-card {
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 8px 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.food-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.food-card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 16px 16px 0 0;
}

.food-card-content {
  padding: 16px;
}

.food-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 8px;
}

.food-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  width: 16px;
  height: 16px;
  color: #FFD54F;
}
```

**Restaurant Card**
```css
.restaurant-card {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin: 4px 16px;
  padding: 16px;
  border-left: 4px solid #FF6B6B;
}

.restaurant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.restaurant-name {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
}

.restaurant-distance {
  font-size: 12px;
  color: #757575;
  background: #F5F5F5;
  padding: 4px 8px;
  border-radius: 8px;
}
```

### Form Components

**Input Fields**
```css
.input-field {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  font-size: 16px;
  background: #FAFAFA;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #FF6B6B;
  background: #FFFFFF;
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
}

.input-field::placeholder {
  color: #BDBDBD;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  margin-bottom: 8px;
  display: block;
}
```

**Toggle Switches**
```css
.toggle-switch {
  width: 48px;
  height: 28px;
  background: #E0E0E0;
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-switch.active {
  background: #FF6B6B;
}

.toggle-handle {
  width: 24px;
  height: 24px;
  background: #FFFFFF;
  border-radius: 12px;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-handle {
  transform: translateX(20px);
}
```

### Modal & Overlay Components

**Modal Design**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 80vh;
  padding: 24px;
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-handle {
  width: 40px;
  height: 4px;
  background: #E0E0E0;
  border-radius: 2px;
  margin: 0 auto 20px;
}
```

## 4. Accessibility & Inclusive Design

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