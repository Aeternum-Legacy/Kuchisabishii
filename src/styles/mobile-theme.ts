// Mobile Theme Configuration
export const mobileTheme = {
  colors: {
    primary: '#FF6B35',
    primaryDark: '#E55A2E',
    primaryLight: '#FF8757',
    secondary: '#4ECDC4',
    secondaryDark: '#45B8B0',
    secondaryLight: '#6DD4CD',
    success: '#95E77E',
    successDark: '#7DD15F',
    successLight: '#ADEC95',
    warning: '#FFB347',
    error: '#FF6B6B',
    
    // Neutral colors
    white: '#FFFFFF',
    gray50: '#F8F9FA',
    gray100: '#F1F3F4',
    gray200: '#E8EAED',
    gray300: '#DADCE0',
    gray400: '#BDC1C6',
    gray500: '#9AA0A6',
    gray600: '#80868B',
    gray700: '#5F6368',
    gray800: '#3C4043',
    gray900: '#202124',
    black: '#000000',
    
    // Dark mode variants
    dark: {
      background: '#1A1A1A',
      surface: '#2D2D2D',
      surfaceLight: '#3A3A3A',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      border: '#404040',
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  typography: {
    h1: {
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '40px',
    },
    h2: {
      fontSize: '28px',
      fontWeight: '600',
      lineHeight: '36px',
    },
    h3: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '32px',
    },
    h4: {
      fontSize: '20px',
      fontWeight: '500',
      lineHeight: '28px',
    },
    body1: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    body2: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
    caption: {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '16px',
    },
    button: {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '20px',
    },
  },
  
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
  
  safeArea: {
    top: 44, // Status bar height
    bottom: 34, // Home indicator
  },
  
  tabBar: {
    height: 80,
    paddingBottom: 34, // Safe area bottom
  },
} as const;

export type MobileTheme = typeof mobileTheme;