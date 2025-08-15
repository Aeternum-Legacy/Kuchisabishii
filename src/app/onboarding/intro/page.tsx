'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingIntro() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      title: "Mission",
      message: "Kuchisabishii is on a mission to redefine our relationship with food and emotions.",
      emoji: "🎯"
    },
    {
      title: "Approach", 
      message: "We approach eating with understanding, self-compassion, and an adventurous spirit to explore the great foods of the world!",
      emoji: "🌍"
    },
    {
      title: "Community",
      message: "By connecting with people of the same palate, we meet like-minded taste buddies to share in the joy that Kuchisabishii brings!",
      emoji: "👥"
    }
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // After intro screens, go to taste profile questionnaire
      router.push('/onboarding');
    }
  };

  const skipIntro = () => {
    // Skip directly to taste profile questionnaire
    router.push('/onboarding');
  };

  const skipOnboardingCompletely = async () => {
    try {
      // Mark onboarding as completed in database
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        console.log('Onboarding skipped and marked as completed')
      }
    } catch (error) {
      console.error('Error marking onboarding as completed:', error)
    }
    
    // Mark onboarding as completed and go directly to app
    localStorage.setItem('onboardingCompleted', 'true');
    // Use router.push to maintain session state
    router.push('/app');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-8"
          >
            {/* Logo */}
            <motion.div 
              className="flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <div className="relative">
                <Image
                  src="/images/kuchisabishii-logo.png"
                  alt="Kuchisabishii Logo"
                  width={120}
                  height={120}
                  className="rounded-2xl"
                  priority
                  style={{
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                    background: 'transparent'
                  }}
                />
                <motion.div
                  className="absolute -top-2 -right-2 text-4xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                >
                  {currentStepData.emoji}
                </motion.div>
              </div>
            </motion.div>
            
            {/* Content */}
            <div className="space-y-4">
              <motion.h1 
                className="text-3xl font-bold text-gray-800"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentStepData.title}
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-700 leading-relaxed px-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentStepData.message}
              </motion.p>
            </div>
            
            {/* Progress indicators */}
            <div className="flex justify-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-orange-500 w-8' 
                      : index < currentStep 
                      ? 'bg-orange-400' 
                      : 'bg-orange-200'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>
            
            {/* Buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>
                  {currentStep === onboardingSteps.length - 1 ? "Let's Begin!" : "Continue"}
                </span>
                {currentStep === onboardingSteps.length - 1 ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </motion.button>
              
              {currentStep === 0 && (
                <div className="space-y-1">
                  <button
                    onClick={skipIntro}
                    className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors"
                  >
                    Skip intro
                  </button>
                  <button
                    onClick={skipOnboardingCompletely}
                    className="w-full text-gray-400 py-1 text-xs hover:text-gray-600 transition-colors"
                  >
                    Skip all onboarding
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}