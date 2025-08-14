'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Type,
  Contrast,
  MousePointer,
  Keyboard,
  Settings,
  X,
  Check,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusIndicators: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  voiceDescriptions: boolean;
  textToSpeech: boolean;
  fontSize: number; // 0.8x to 2x
}

interface FoodAccessibilityProps {
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  initialSettings?: Partial<AccessibilitySettings>;
}

const defaultSettings: AccessibilitySettings = {
  screenReader: false,
  highContrast: false,
  largeText: false,
  focusIndicators: true,
  reducedMotion: false,
  keyboardNavigation: true,
  voiceDescriptions: false,
  textToSpeech: false,
  fontSize: 1.0,
};

export const FoodAccessibility: React.FC<FoodAccessibilityProps> = ({
  onSettingsChange,
  initialSettings = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...defaultSettings,
    ...initialSettings,
  });
  const [isReading, setIsReading] = useState(false);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--accessibility-font-scale', settings.fontSize.toString());
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  // Text-to-speech functionality
  const speakText = useCallback((text: string) => {
    if (!settings.textToSpeech || !('speechSynthesis' in window)) return;
    
    setIsReading(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    
    speechSynthesis.speak(utterance);
  }, [settings.textToSpeech]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsReading(false);
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const increaseFontSize = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(2.0, prev.fontSize + 0.1)
    }));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(0.8, prev.fontSize - 0.1)
    }));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!settings.keyboardNavigation) return;
      
      // Alt + A to toggle accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Escape to close panel
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation, isOpen]);

  return (
    <>
      {/* Accessibility Toggle Button */}
      <motion.button
        className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg z-40 flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open accessibility settings"
        title="Accessibility Settings (Alt + A)"
      >
        <Eye className="w-5 h-5" />
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Accessibility Settings</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Customize your food app experience
                    </p>
                  </div>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close accessibility settings"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {/* Visual Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Visual
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size: {Math.round(settings.fontSize * 100)}%
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          onClick={decreaseFontSize}
                          disabled={settings.fontSize <= 0.8}
                          aria-label="Decrease font size"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-200"
                            style={{
                              width: `${((settings.fontSize - 0.8) / 1.2) * 100}%`
                            }}
                          />
                        </div>
                        <button
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          onClick={increaseFontSize}
                          disabled={settings.fontSize >= 2.0}
                          aria-label="Increase font size"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* High Contrast */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Contrast className="w-5 h-5 text-gray-600" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            High Contrast
                          </label>
                          <p className="text-xs text-gray-500">
                            Increase color contrast for better visibility
                          </p>
                        </div>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.highContrast ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        onClick={() => updateSetting('highContrast', !settings.highContrast)}
                        role="switch"
                        aria-checked={settings.highContrast}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.highContrast ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Large Text */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Type className="w-5 h-5 text-gray-600" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Large Text
                          </label>
                          <p className="text-xs text-gray-500">
                            Use larger text throughout the app
                          </p>
                        </div>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.largeText ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        onClick={() => updateSetting('largeText', !settings.largeText)}
                        role="switch"
                        aria-checked={settings.largeText}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.largeText ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Reduced Motion */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RotateCcw className="w-5 h-5 text-gray-600" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Reduce Motion
                          </label>
                          <p className="text-xs text-gray-500">
                            Minimize animations and transitions
                          </p>
                        </div>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.reducedMotion ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                        role="switch"
                        aria-checked={settings.reducedMotion}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.reducedMotion ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audio Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Audio
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Text to Speech */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-gray-600" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Text to Speech
                          </label>
                          <p className="text-xs text-gray-500">
                            Read food descriptions and reviews aloud
                          </p>
                        </div>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.textToSpeech ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        onClick={() => updateSetting('textToSpeech', !settings.textToSpeech)}
                        role="switch"
                        aria-checked={settings.textToSpeech}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.textToSpeech ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Voice Descriptions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <VolumeX className="w-5 h-5 text-gray-600" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Voice Descriptions
                          </label>
                          <p className="text-xs text-gray-500">
                            Detailed audio descriptions of food images
                          </p>
                        </div>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.voiceDescriptions ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        onClick={() => updateSetting('voiceDescriptions', !settings.voiceDescriptions)}
                        role="switch"
                        aria-checked={settings.voiceDescriptions}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.voiceDescriptions ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Test Speech Button */}
                    {settings.textToSpeech && (
                      <div className="pt-2">
                        <button
                          className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                          onClick={() => {
                            if (isReading) {
                              stopSpeaking();
                            } else {
                              speakText("Welcome to Kuchisabishii! This is a test of the text-to-speech feature. You can use this to have food descriptions and reviews read aloud.");
                            }
                          }}
                        >
                          {isReading ? (
                            <>
                              <VolumeX className="w-4 h-4" />
                              Stop Reading
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              Test Speech
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Navigation
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Enhanced Focus */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MousePointer className="w-5 h-5 text-gray-600" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Enhanced Focus
                          </label>
                          <p className="text-xs text-gray-500">
                            Stronger focus indicators for keyboard navigation
                          </p>
                        </div>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.focusIndicators ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        onClick={() => updateSetting('focusIndicators', !settings.focusIndicators)}
                        role="switch"
                        aria-checked={settings.focusIndicators}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.focusIndicators ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Keyboard Navigation Info */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Keyboard Shortcuts:</strong>
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <kbd className="px-1 bg-gray-200 rounded">Alt + A</kbd> - Open accessibility settings</li>
                        <li>• <kbd className="px-1 bg-gray-200 rounded">Tab</kbd> - Navigate between elements</li>
                        <li>• <kbd className="px-1 bg-gray-200 rounded">Enter/Space</kbd> - Activate buttons</li>
                        <li>• <kbd className="px-1 bg-gray-200 rounded">Esc</kbd> - Close modals/menus</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  onClick={resetSettings}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  className="flex-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Check className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook for using accessibility settings in other components
export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, []);

  const speakText = useCallback((text: string) => {
    if (settings.textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, [settings.textToSpeech]);

  return {
    settings,
    setSettings,
    announceToScreenReader,
    speakText,
  };
};