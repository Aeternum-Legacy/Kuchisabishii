'use client';

import React, { useRef, useState, useEffect } from 'react';
import { CategoryItem } from '@/types/mobile';
import { useHapticFeedback } from '@/hooks/useMobileInteractions';
import { mobileTheme } from '@/styles/mobile-theme';

interface CategoryScrollProps {
  categories: CategoryItem[];
  activeCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  className?: string;
}

export const CategoryScroll: React.FC<CategoryScrollProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [snapTimeout, setSnapTimeout] = useState<NodeJS.Timeout | null>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handleCategoryClick = (categoryId: string) => {
    triggerHaptic('light');
    onCategorySelect(categoryId);
    
    // Scroll to center the selected category
    if (scrollRef.current) {
      const categoryElement = scrollRef.current.querySelector(`[data-category="${categoryId}"]`);
      if (categoryElement) {
        categoryElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  };

  const handleScroll = () => {
    setIsScrolling(true);
    
    // Clear existing timeout
    if (snapTimeout) {
      clearTimeout(snapTimeout);
    }
    
    // Set new timeout for snap-to-center
    const timeout = setTimeout(() => {
      setIsScrolling(false);
      snapToCenter();
    }, 150);
    
    setSnapTimeout(timeout);
  };

  const snapToCenter = () => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const containerCenter = container.offsetWidth / 2;
    const scrollLeft = container.scrollLeft;
    
    let closestElement: Element | null = null;
    let closestDistance = Infinity;
    
    // Find the element closest to center
    Array.from(container.children).forEach((child) => {
      const childRect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const childCenter = childRect.left - containerRect.left + childRect.width / 2;
      const distance = Math.abs(childCenter - containerCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = child;
      }
    });
    
    if (closestElement) {
      (closestElement as Element).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      
      // Trigger haptic feedback for snap
      triggerHaptic('light');
    }
  };

  useEffect(() => {
    return () => {
      if (snapTimeout) {
        clearTimeout(snapTimeout);
      }
    };
  }, [snapTimeout]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide space-x-3 px-4 py-3 snap-x snap-mandatory"
        onScroll={handleScroll}
        style={{
          scrollBehavior: isScrolling ? 'auto' : 'smooth',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x', // Enable horizontal scrolling only
        }}
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          
          return (
            <button
              key={category.id}
              data-category={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex-shrink-0 snap-center relative px-4 py-3 rounded-2xl transition-all duration-300 
                transform active:scale-95 min-w-[120px] flex flex-col items-center justify-center
                ${isActive 
                  ? 'shadow-lg scale-105' 
                  : 'shadow-sm hover:shadow-md'
                }
              `}
              style={{
                backgroundColor: isActive ? category.color : `${category.color}20`,
                minHeight: mobileTheme.touchTarget.minHeight + 20,
                border: `2px solid ${isActive ? category.color : 'transparent'}`,
              }}
            >
              {/* Icon */}
              <div className={`text-2xl mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {category.icon}
              </div>
              
              {/* Category Name */}
              <span
                className={`
                  font-semibold text-center transition-all duration-300
                  ${isActive ? 'text-white' : 'text-gray-700'}
                `}
                style={mobileTheme.typography.caption}
              >
                {category.name}
              </span>
              
              {/* Count Badge */}
              {category.count !== undefined && (
                <div
                  className={`
                    absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-white text-gray-800' 
                      : `bg-${category.color.replace('#', '')} text-white`
                    }
                  `}
                  style={{ minWidth: '20px' }}
                >
                  {category.count > 99 ? '99+' : category.count}
                </div>
              )}
              
              {/* Active Indicator */}
              {isActive && (
                <div 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'white' }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Scroll Indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
};

// Sample categories data
export const sampleCategories: CategoryItem[] = [
  {
    id: 'all',
    name: 'All',
    color: mobileTheme.colors.primary,
    icon: '🍽️',
    count: 1247,
  },
  {
    id: 'ramen',
    name: 'Ramen',
    color: mobileTheme.colors.secondary,
    icon: '🍜',
    count: 89,
  },
  {
    id: 'burger',
    name: 'Burgers',
    color: '#FF6B6B',
    icon: '🍔',
    count: 156,
  },
  {
    id: 'pizza',
    name: 'Pizza',
    color: '#4ECDC4',
    icon: '🍕',
    count: 203,
  },
  {
    id: 'sushi',
    name: 'Sushi',
    color: '#95E77E',
    icon: '🍣',
    count: 78,
  },
  {
    id: 'tacos',
    name: 'Tacos',
    color: '#FFB347',
    icon: '🌮',
    count: 134,
  },
  {
    id: 'dessert',
    name: 'Desserts',
    color: '#FF69B4',
    icon: '🍰',
    count: 267,
  },
  {
    id: 'coffee',
    name: 'Coffee',
    color: '#8B4513',
    icon: '☕',
    count: 189,
  },
  {
    id: 'healthy',
    name: 'Healthy',
    color: '#32CD32',
    icon: '🥗',
    count: 145,
  },
  {
    id: 'indian',
    name: 'Indian',
    color: '#FF4500',
    icon: '🍛',
    count: 67,
  },
];

// Custom CSS for hiding scrollbar
export const categoryScrollStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  @supports (scroll-snap-type: x mandatory) {
    .snap-x {
      scroll-snap-type: x mandatory;
    }
    
    .snap-center {
      scroll-snap-align: center;
    }
  }
`;