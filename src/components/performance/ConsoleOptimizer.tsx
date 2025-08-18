'use client';

import { useEffect } from 'react';

/**
 * Console Optimizer Component
 * Removes console statements in production and provides development warnings
 */

interface ConsoleOptimizerProps {
  enableInProduction?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

export const ConsoleOptimizer: React.FC<ConsoleOptimizerProps> = ({
  enableInProduction = false,
  logLevel = 'warn',
}) => {
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && !enableInProduction) {
      // Override console methods in production
      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug,
      };

      // Keep error logging in production for debugging
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
      
      // Keep warnings and errors based on logLevel
      if (logLevel === 'error') {
        console.warn = () => {};
      }

      // Restore on cleanup (for development hot reload)
      return () => {
        Object.assign(console, originalConsole);
      };
    }
  }, [enableInProduction, logLevel]);

  return null; // This component doesn't render anything
};

/**
 * Production-safe logger utility
 */
export class ProductionLogger {
  private static isProduction = process.env.NODE_ENV === 'production';
  
  static log(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }
  
  static warn(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  static error(message: string, ...args: any[]): void {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, ...args);
  }
  
  static info(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
  
  static debug(message: string, ...args: any[]): void {
    if (!this.isProduction && process.env.DEBUG_MODE === 'true') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  
  static mark(name: string): void {
    if (typeof performance !== 'undefined') {
      this.marks.set(name, performance.now());
    }
  }
  
  static measure(name: string, startMark: string): number | null {
    if (typeof performance === 'undefined') return null;
    
    const startTime = this.marks.get(startMark);
    if (!startTime) return null;
    
    const duration = performance.now() - startTime;
    
    if (process.env.NODE_ENV !== 'production') {
      ProductionLogger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  static clearMark(name: string): void {
    this.marks.delete(name);
  }
  
  static clearAllMarks(): void {
    this.marks.clear();
  }
}

/**
 * Touch performance optimizer
 */
export const optimizeTouchPerformance = () => {
  if (typeof document === 'undefined') return;
  
  // Add global touch-action optimization
  const style = document.createElement('style');
  style.textContent = `
    /* Optimize touch performance globally */
    * {
      -webkit-tap-highlight-color: transparent;
    }
    
    button, [role="button"], .touch-target {
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }
    
    .scroll-container {
      -webkit-overflow-scrolling: touch;
      overflow-scrolling: touch;
    }
    
    /* Reduce paint on scroll */
    .will-change-transform {
      will-change: transform;
    }
    
    .gpu-accelerated {
      transform: translateZ(0);
      backface-visibility: hidden;
    }
  `;
  
  if (!document.head.querySelector('[data-touch-optimization]')) {
    style.setAttribute('data-touch-optimization', 'true');
    document.head.appendChild(style);
  }
};

// Auto-initialize touch optimizations
if (typeof window !== 'undefined') {
  optimizeTouchPerformance();
}

export default ConsoleOptimizer;