'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import RecommendationsList from '@/components/recommendations/RecommendationsList';

export default function RecommendationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 pt-12">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ml-3">AI Recommendations</h1>
        </div>
        <p className="text-purple-100">Personalized dishes based on your taste profile</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <RecommendationsList />
      </div>
    </div>
  );
}