'use client';

import React, { useState } from 'react';
import { BottomTabBar, defaultTabs } from './BottomTabBar';
import { useSafeArea } from '@/hooks/useMobileInteractions';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showTabBar?: boolean;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  activeTab = 'home',
  onTabChange,
  showTabBar = true,
  className = '',
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const safeArea = useSafeArea();

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={`mobile-container min-h-screen bg-gray-50 ${className}`}>
      {/* Status Bar Spacer */}
      <div style={{ height: safeArea.top }} className="bg-white" />
      
      {/* Main Content */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          paddingBottom: showTabBar ? 80 + safeArea.bottom : safeArea.bottom,
        }}
      >
        {children}
      </div>

      {/* Bottom Tab Bar */}
      {showTabBar && (
        <BottomTabBar
          tabs={defaultTabs}
          activeTab={currentTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
};

export default MobileLayout;