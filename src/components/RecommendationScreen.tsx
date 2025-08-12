'use client';

import React, { useState } from 'react';
import { Search, Users, Heart, Star, Clock, MapPin, Filter } from 'lucide-react';

const RecommendationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'group'>('personal');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Discover</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4">
          <div className="flex">
            {[
              { key: 'personal', label: 'For You', icon: <Heart className="w-4 h-4" /> },
              { key: 'group', label: 'Group Hunt', icon: <Users className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'personal' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Recommended for You</h2>
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Personalized recommendations coming soon!</p>
                <p className="text-sm text-gray-400">Based on your taste preferences and history</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Group Food Hunt</h2>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Group food discovery coming soon!</p>
                <p className="text-sm text-gray-400">Find foods that everyone will love</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationScreen;