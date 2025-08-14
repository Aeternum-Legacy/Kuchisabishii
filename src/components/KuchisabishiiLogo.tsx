import Image from 'next/image'

interface KuchisabishiiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  seamless?: boolean // New prop to control shadow
}

export default function KuchisabishiiLogo({ size = 'lg', className = '', seamless = false }: KuchisabishiiLogoProps) {
  const dimensions = {
    sm: { width: 48, height: 48 },    // 12x12 in Tailwind (48px)
    md: { width: 64, height: 64 },    // 16x16 in Tailwind (64px)
    lg: { width: 80, height: 80 },    // 20x20 in Tailwind (80px)
    xl: { width: 120, height: 120 }   // 30x30 in Tailwind (120px)
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20',
    xl: 'w-30 h-30'
  }
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src="/images/kuchisabishii-logo.png"
        alt="Kuchisabishii Logo"
        width={dimensions[size].width}
        height={dimensions[size].height}
        className={`${sizeClasses[size]} rounded-lg object-contain`}
        priority={size === 'lg' || size === 'xl'}
        style={{
          maxWidth: '100%',
          height: 'auto',
          filter: seamless ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : undefined,
          background: 'transparent'
        }}
      />
    </div>
  )
}