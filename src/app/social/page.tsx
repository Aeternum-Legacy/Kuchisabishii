'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, QrCode, UserPlus, Heart, MessageCircle, Share2 } from 'lucide-react';
import ActivityFeed from '@/components/social/ActivityFeed';

export default function SocialPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'discover'>('feed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-3">Social</h1>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => router.push('/add-friend')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => router.push('/qr-scanner')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6">
          {[
            { id: 'feed', label: 'Activity Feed' },
            { id: 'friends', label: 'Friends' },
            { id: 'discover', label: 'Discover' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-white'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'feed' && (
          <div>
            <ActivityFeed />
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <h2 className="font-semibold mb-3">Your Friends</h2>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Chen', mutual: 12, reviews: 89 },
                  { name: 'Mike Johnson', mutual: 8, reviews: 156 },
                  { name: 'Emily Davis', mutual: 15, reviews: 203 }
                ].map((friend) => (
                  <div key={friend.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-sm text-gray-500">
                          {friend.mutual} mutual • {friend.reviews} reviews
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => router.push('/add-friend')}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Find More Friends</span>
            </button>
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <h2 className="font-semibold mb-3">People You May Know</h2>
              <div className="space-y-3">
                {[
                  { name: 'Alex Wong', similarity: '92% taste match', mutual: 5 },
                  { name: 'Jessica Liu', similarity: '88% taste match', mutual: 3 },
                  { name: 'David Park', similarity: '85% taste match', mutual: 7 }
                ].map((person) => (
                  <div key={person.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-orange-500 font-medium">{person.similarity}</p>
                        <p className="text-xs text-gray-500">{person.mutual} mutual friends</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}