'use client';

import React, { useState } from 'react';
import { TabItem } from '@/types/mobile';
import { useHapticFeedback, useSafeArea } from '@/hooks/useMobileInteractions';
import { mobileTheme } from '@/styles/mobile-theme';

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const { triggerHaptic } = useHapticFeedback();
  const safeArea = useSafeArea();

  const handleTabPress = (tabId: string) => {
    if (tabId !== activeTab) {
      triggerHaptic('light');
      onTabChange(tabId);
    }
  };

  const handleTouchStart = (tabId: string) => {
    setPressedTab(tabId);
    triggerHaptic('light');
  };

  const handleTouchEnd = () => {
    setPressedTab(null);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 ${className}`}
      style={{
        height: mobileTheme.tabBar.height,
        paddingBottom: Math.max(safeArea.bottom, 8),
      }}
    >
      <div className="flex h-full items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isPressed = tab.id === pressedTab;
          
          return (
            <button
              key={tab.id}
              className={`
                flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200
                ${isPressed ? 'scale-95' : 'scale-100'}
                ${isActive ? 'bg-orange-50' : 'bg-transparent'}
                active:scale-95
              `}
              style={{ minHeight: mobileTheme.touchTarget.minHeight }}
              onTouchStart={() => handleTouchStart(tab.id)}
              onTouchEnd={handleTouchEnd}
              onClick={() => handleTabPress(tab.id)}
            >
              {/* Icon Container */}
              <div className="relative mb-1">
                <div
                  className={`
                    text-2xl transition-all duration-300 transform
                    ${isActive 
                      ? 'text-orange-500 scale-110' 
                      : 'text-gray-500'
                    }
                  `}
                >
                  {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
                </div>
                
                {/* Badge */}
                {tab.badge && tab.badge > 0 && (
                  <div
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse"
                    style={{ fontSize: '10px', fontWeight: '600' }}
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </div>
                )}
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full animate-ping" />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-xs font-medium transition-all duration-200
                  ${isActive 
                    ? 'text-orange-500 scale-105' 
                    : 'text-gray-600'
                  }
                `}
                style={mobileTheme.typography.caption}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Animated Background Highlight */}
      <div
        className="absolute top-0 bg-gradient-to-t from-orange-100 to-transparent transition-all duration-300 opacity-30"
        style={{
          left: `${(tabs.findIndex(tab => tab.id === activeTab) / tabs.length) * 100}%`,
          width: `${100 / tabs.length}%`,
          height: '100%',
          transform: 'translateY(-2px)',
        }}
      />
    </div>
  );
};

// Default tab configuration
export const defaultTabs: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    activeIcon: '🏡',
    route: '/',
  },
  {
    id: 'search',
    label: 'Search',
    icon: '🔍',
    activeIcon: '🔎',
    route: '/search',
  },
  {
    id: 'add',
    label: 'Add Food',
    icon: '➕',
    activeIcon: '✨',
    route: '/add',
  },
  {
    id: 'social',
    label: 'Social',
    icon: '👥',
    activeIcon: '🫂',
    badge: 3,
    route: '/social',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    activeIcon: '👨‍🍳',
    route: '/profile',
  },
];