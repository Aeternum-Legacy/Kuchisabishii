/**
 * Chrysos Golden Theme Class Mappings
 * Maps original orange/red theme classes to golden/amber equivalents
 */

export const themeClassMap = {
  // Background colors
  'bg-orange-50': 'bg-gradient-to-br from-chrysos-cream to-chrysos-champagne',
  'bg-orange-100': 'bg-chrysos-gold-100',
  'bg-orange-200': 'bg-chrysos-gold-200',
  'bg-orange-300': 'bg-chrysos-gold-300',
  'bg-orange-400': 'bg-chrysos-gold-400',
  'bg-orange-500': 'bg-chrysos-gold-500',
  'bg-orange-600': 'bg-chrysos-gold-600',
  'bg-orange-700': 'bg-chrysos-gold-700',
  'bg-orange-800': 'bg-chrysos-gold-800',
  'bg-orange-900': 'bg-chrysos-gold-900',
  
  // Text colors
  'text-orange-50': 'text-chrysos-gold-50',
  'text-orange-100': 'text-chrysos-gold-100',
  'text-orange-200': 'text-chrysos-gold-200',
  'text-orange-300': 'text-chrysos-gold-300',
  'text-orange-400': 'text-chrysos-gold-400',
  'text-orange-500': 'text-chrysos-gold-500',
  'text-orange-600': 'text-chrysos-gold-600',
  'text-orange-700': 'text-chrysos-gold-700',
  'text-orange-800': 'text-chrysos-gold-800',
  'text-orange-900': 'text-chrysos-gold-900',
  
  // Border colors
  'border-orange-200': 'border-chrysos-gold-200',
  'border-orange-300': 'border-chrysos-gold-300',
  'border-orange-400': 'border-chrysos-gold-400',
  'border-orange-500': 'border-chrysos-gold-500',
  'border-orange-600': 'border-chrysos-gold-600',
  
  // Ring colors
  'ring-orange-500': 'ring-chrysos-gold-500',
  'focus:ring-orange-500': 'focus:ring-chrysos-gold-500',
  
  // Hover states
  'hover:bg-orange-50': 'hover:bg-chrysos-gold-50',
  'hover:bg-orange-100': 'hover:bg-chrysos-gold-100',
  'hover:bg-orange-600': 'hover:bg-chrysos-gold-600',
  'hover:bg-orange-700': 'hover:bg-chrysos-gold-700',
  'hover:text-orange-600': 'hover:text-chrysos-gold-600',
  'hover:text-orange-700': 'hover:text-chrysos-gold-700',
  
  // Gradient classes
  'from-orange-50': 'from-chrysos-cream',
  'from-orange-100': 'from-chrysos-gold-100',
  'from-orange-400': 'from-chrysos-gold-400',
  'from-orange-500': 'from-chrysos-gold-500',
  'from-orange-600': 'from-chrysos-gold-600',
  'to-orange-100': 'to-chrysos-champagne',
  'to-orange-200': 'to-chrysos-gold-200',
  'to-red-500': 'to-chrysos-amber-600',
  'to-red-600': 'to-chrysos-amber-700',
  'via-red-50': 'via-chrysos-champagne',
  'via-blue-50': 'via-chrysos-pearl',
  'to-pink-50': 'to-chrysos-gold-50',
  
  // Purple to Gold conversions
  'from-purple-50': 'from-chrysos-pearl',
  'from-purple-500': 'from-chrysos-brass',
  'from-purple-600': 'from-chrysos-bronze',
  'to-purple-500': 'to-chrysos-brass',
  'to-purple-600': 'to-chrysos-bronze',
  'via-purple-50': 'via-chrysos-ivory',
  'bg-purple-50': 'bg-chrysos-champagne',
  'bg-purple-100': 'bg-chrysos-gold-100',
  'bg-purple-500': 'bg-chrysos-brass',
  'bg-purple-600': 'bg-chrysos-bronze',
  'text-purple-600': 'text-chrysos-brass',
  'text-purple-900': 'text-chrysos-mahogany',
  'border-purple-200': 'border-chrysos-gold-200',
  'hover:bg-purple-50': 'hover:bg-chrysos-champagne',
  'hover:bg-purple-700': 'hover:bg-chrysos-bronze',
  
  // Blue to Golden conversions
  'from-blue-50': 'from-chrysos-pearl',
  'to-blue-50': 'to-chrysos-ivory',
  'to-indigo-50': 'to-chrysos-cream',
  'bg-blue-50': 'bg-chrysos-ivory',
  'bg-blue-100': 'bg-chrysos-pearl',
  'bg-blue-500': 'bg-chrysos-gold-500',
  'bg-blue-600': 'bg-chrysos-gold-600',
  'text-blue-600': 'text-chrysos-gold-600',
  'border-blue-400': 'border-chrysos-gold-400',
  'hover:bg-blue-700': 'hover:bg-chrysos-gold-700',
  
  // Green to Gold-Green conversions
  'bg-green-500': 'bg-gradient-to-r from-chrysos-gold-500 to-emerald-600',
  'bg-green-600': 'bg-gradient-to-r from-chrysos-gold-600 to-emerald-700',
  'hover:bg-green-700': 'hover:bg-gradient-to-r hover:from-chrysos-gold-700 hover:to-emerald-800',
  'text-green-600': 'text-emerald-700',
  
  // Gray to Brown conversions
  'bg-gray-50': 'bg-chrysos-cream',
  'bg-gray-100': 'bg-chrysos-ivory',
  'bg-gray-200': 'bg-chrysos-pearl',
  'text-gray-500': 'text-chrysos-brown-500',
  'text-gray-600': 'text-chrysos-brown-600',
  'text-gray-700': 'text-chrysos-brown-700',
  'text-gray-800': 'text-chrysos-brown-800',
  'text-gray-900': 'text-chrysos-mahogany',
  'border-gray-200': 'border-chrysos-gold-200',
  'border-gray-300': 'border-chrysos-gold-300',
}

// Custom Tailwind plugin classes for Chrysos theme
export const chrysosClasses = {
  // Buttons
  'btn-primary': 'chrysos-button',
  'btn-secondary': 'bg-chrysos-amber-500 hover:bg-chrysos-amber-600 text-chrysos-ivory',
  'btn-accent': 'bg-chrysos-brass hover:bg-chrysos-bronze text-chrysos-ivory',
  
  // Cards
  'card': 'chrysos-card',
  'card-hover': 'chrysos-card hover:chrysos-glow',
  
  // Inputs
  'input': 'chrysos-input',
  
  // Gradients
  'gradient-primary': 'chrysos-gradient',
  'gradient-soft': 'chrysos-gradient-soft',
  'gradient-radial': 'chrysos-gradient-radial',
  
  // Text effects
  'text-gradient': 'chrysos-text-gradient',
  
  // Dividers
  'divider': 'chrysos-divider',
}

// Helper function to apply theme classes
export function applyThemeClass(originalClass: string): string {
  return themeClassMap[originalClass as keyof typeof themeClassMap] || originalClass
}

// Helper function to convert className string
export function convertThemeClasses(classString: string): string {
  const classes = classString.split(' ')
  return classes.map(cls => applyThemeClass(cls)).join(' ')
}