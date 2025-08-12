export default function KuchisabishiiLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }
  
  return (
    <div className={`inline-flex items-center justify-center ${dimensions[size]} bg-gray-100 rounded-full`}>
      <svg viewBox="0 0 100 100" className={size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-14 h-14' : 'w-16 h-16'}>
        <g>
          {/* Main bowl/face */}
          <circle cx="50" cy="50" r="35" fill="white" stroke="black" strokeWidth="3"/>
          
          {/* Smile with noodles */}
          <path d="M 25 50 Q 50 65 75 50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>
          
          {/* Noodle strands */}
          <line x1="35" y1="50" x2="35" y2="54" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          <line x1="45" y1="50" x2="45" y2="54" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          <line x1="55" y1="50" x2="55" y2="54" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          <line x1="65" y1="50" x2="65" y2="54" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Eyes */}
          <circle cx="35" cy="35" r="3" fill="black"/>
          <circle cx="65" cy="35" r="3" fill="black"/>
          
          {/* Eye shine */}
          <circle cx="36" cy="34" r="1" fill="white"/>
          <circle cx="66" cy="34" r="1" fill="white"/>
          
          {/* Chopsticks */}
          <circle cx="25" cy="25" r="10" fill="white" stroke="black" strokeWidth="3"/>
          <circle cx="75" cy="25" r="10" fill="white" stroke="black" strokeWidth="3"/>
          <circle cx="25" cy="25" r="5" fill="none" stroke="black" strokeWidth="2"/>
          <circle cx="75" cy="25" r="5" fill="none" stroke="black" strokeWidth="2"/>
        </g>
      </svg>
    </div>
  )
}