'use client';

import React, { useState } from 'react';
import { 
  Target, TrendingUp, Sparkles, ChefHat, 
  Edit3, Save, X, Info, Brain, Globe,
  Zap, Heart, Gauge, Star
} from 'lucide-react';

interface TasteProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  salty_preference: number | null;
  sweet_preference: number | null;
  sour_preference: number | null;
  bitter_preference: number | null;
  umami_preference: number | null;
  crunchy_preference: number | null;
  creamy_preference: number | null;
  chewy_preference: number | null;
  hot_food_preference: number | null;
  cold_food_preference: number | null;
  cuisine_preferences: Record<string, unknown>;
  culinary_adventurousness: number;
}

interface PalateProfileTabProps {
  tasteProfile: TasteProfile;
  setTasteProfile: (profile: TasteProfile) => void;
}

const PalateProfileTab: React.FC<PalateProfileTabProps> = ({ 
  tasteProfile, 
  setTasteProfile 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(tasteProfile);

  const handleSave = () => {
    setTasteProfile({
      ...editForm,
      updated_at: new Date().toISOString()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(tasteProfile);
    setIsEditing(false);
  };

  const updatePreference = (key: string, value: number) => {
    setEditForm({
      ...editForm,
      [key]: value
    });
  };

  // Radar chart calculation
  const tasteData = [
    { 
      label: 'Salty', 
      value: tasteProfile.salty_preference || 0, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-500'
    },
    { 
      label: 'Sweet', 
      value: tasteProfile.sweet_preference || 0, 
      color: 'text-pink-600',
      bgColor: 'bg-pink-500'
    },
    { 
      label: 'Sour', 
      value: tasteProfile.sour_preference || 0, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500'
    },
    { 
      label: 'Bitter', 
      value: tasteProfile.bitter_preference || 0, 
      color: 'text-green-600',
      bgColor: 'bg-green-500'
    },
    { 
      label: 'Umami', 
      value: tasteProfile.umami_preference || 0, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-500'
    }
  ];

  const textureData = [
    { 
      label: 'Crunchy', 
      value: tasteProfile.crunchy_preference || 0, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-500'
    },
    { 
      label: 'Creamy', 
      value: tasteProfile.creamy_preference || 0, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500'
    },
    { 
      label: 'Chewy', 
      value: tasteProfile.chewy_preference || 0, 
      color: 'text-red-600',
      bgColor: 'bg-red-500'
    }
  ];

  const temperatureData = [
    { 
      label: 'Hot Foods', 
      value: tasteProfile.hot_food_preference || 0, 
      color: 'text-red-600',
      bgColor: 'bg-red-500'
    },
    { 
      label: 'Cold Foods', 
      value: tasteProfile.cold_food_preference || 0, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-500'
    }
  ];

  const cuisinePreferences = tasteProfile.cuisine_preferences || {};
  const topCuisines = Object.entries(cuisinePreferences)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  const RadarChart: React.FC<{ data: Record<string, unknown>[]; title: string }> = ({ data, title }) => {
    const size = 200;
    const center = size / 2;
    const radius = 70;
    
    // Create pentagon points for 5 tastes
    const points = data.map((_, index) => {
      const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    });

    // Create data points
    const dataPoints = data.map((item, index) => {
      const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
      const dataRadius = (Number(item.value) / 5) * radius;
      return {
        x: center + dataRadius * Math.cos(angle),
        y: center + dataRadius * Math.sin(angle)
      };
    });

    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
        <div className="flex justify-center">
          <svg width={size} height={size} className="overflow-visible">
            {/* Grid circles */}
            {[1, 2, 3, 4, 5].map(level => (
              <circle
                key={level}
                cx={center}
                cy={center}
                r={(level / 5) * radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Grid lines */}
            {points.map((point, index) => (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Data polygon */}
            <polygon
              points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="rgba(249, 115, 22, 0.3)"
              stroke="rgba(249, 115, 22, 0.8)"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {dataPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#f97316"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            
            {/* Labels */}
            {data.map((item, index) => {
              const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
              const labelRadius = radius + 25;
              const labelX = center + labelRadius * Math.cos(angle);
              const labelY = center + labelRadius * Math.sin(angle);
              
              return (
                <text
                  key={index}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {String(item.label)}
                </text>
              );
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${item.bgColor} mr-2`} />
                <span>{String(item.label)}</span>
              </div>
              <span className="font-medium">{Number(item.value)}/5</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PreferenceSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    color?: string;
  }> = ({ label, value, onChange, disabled = false, color = 'orange' }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-600">{value}/5</span>
      </div>
      <input
        type="range"
        min="0"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${color}`}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-orange-500" />
              Your Palate Profile
            </h2>
            <p className="text-gray-600 mt-1">
              Understanding your taste preferences helps us provide better recommendations
            </p>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Taste Profile */}
      <RadarChart data={tasteData} title="Taste Preferences" />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{tasteProfile.culinary_adventurousness}</div>
          <div className="text-sm text-gray-600">Adventurousness</div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${(tasteProfile.culinary_adventurousness / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gauge className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(tasteData.reduce((sum, item) => sum + item.value, 0) / tasteData.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Taste Intensity</div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${((tasteData.reduce((sum, item) => sum + item.value, 0) / tasteData.length) / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {topCuisines.length > 0 ? Number(topCuisines[0][1]) : 0}/5
          </div>
          <div className="text-sm text-gray-600">Top Cuisine Rating</div>
          <div className="text-xs text-gray-500 mt-1">
            {topCuisines.length > 0 ? String(topCuisines[0][0]) : 'No data'}
          </div>
        </div>
      </div>

      {/* Detailed Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taste Preferences Editor */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Taste Preferences
          </h3>
          <div className="space-y-6">
            <PreferenceSlider
              label="Salty"
              value={isEditing ? editForm.salty_preference || 0 : tasteProfile.salty_preference || 0}
              onChange={(value) => updatePreference('salty_preference', value)}
              disabled={!isEditing}
              color="blue"
            />
            <PreferenceSlider
              label="Sweet"
              value={isEditing ? editForm.sweet_preference || 0 : tasteProfile.sweet_preference || 0}
              onChange={(value) => updatePreference('sweet_preference', value)}
              disabled={!isEditing}
              color="pink"
            />
            <PreferenceSlider
              label="Sour"
              value={isEditing ? editForm.sour_preference || 0 : tasteProfile.sour_preference || 0}
              onChange={(value) => updatePreference('sour_preference', value)}
              disabled={!isEditing}
              color="yellow"
            />
            <PreferenceSlider
              label="Bitter"
              value={isEditing ? editForm.bitter_preference || 0 : tasteProfile.bitter_preference || 0}
              onChange={(value) => updatePreference('bitter_preference', value)}
              disabled={!isEditing}
              color="green"
            />
            <PreferenceSlider
              label="Umami"
              value={isEditing ? editForm.umami_preference || 0 : tasteProfile.umami_preference || 0}
              onChange={(value) => updatePreference('umami_preference', value)}
              disabled={!isEditing}
              color="purple"
            />
          </div>
        </div>

        {/* Texture Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Texture Preferences
          </h3>
          <div className="space-y-6">
            <PreferenceSlider
              label="Crunchy"
              value={isEditing ? editForm.crunchy_preference || 0 : tasteProfile.crunchy_preference || 0}
              onChange={(value) => updatePreference('crunchy_preference', value)}
              disabled={!isEditing}
            />
            <PreferenceSlider
              label="Creamy"
              value={isEditing ? editForm.creamy_preference || 0 : tasteProfile.creamy_preference || 0}
              onChange={(value) => updatePreference('creamy_preference', value)}
              disabled={!isEditing}
            />
            <PreferenceSlider
              label="Chewy"
              value={isEditing ? editForm.chewy_preference || 0 : tasteProfile.chewy_preference || 0}
              onChange={(value) => updatePreference('chewy_preference', value)}
              disabled={!isEditing}
            />
            <PreferenceSlider
              label="Hot Foods"
              value={isEditing ? editForm.hot_food_preference || 0 : tasteProfile.hot_food_preference || 0}
              onChange={(value) => updatePreference('hot_food_preference', value)}
              disabled={!isEditing}
            />
            <PreferenceSlider
              label="Cold Foods"
              value={isEditing ? editForm.cold_food_preference || 0 : tasteProfile.cold_food_preference || 0}
              onChange={(value) => updatePreference('cold_food_preference', value)}
              disabled={!isEditing}
            />
            <PreferenceSlider
              label="Culinary Adventurousness"
              value={isEditing ? editForm.culinary_adventurousness || 0 : tasteProfile.culinary_adventurousness || 0}
              onChange={(value) => updatePreference('culinary_adventurousness', value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Cuisine Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Cuisine Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCuisines.map(([cuisine, rating]) => (
            <div key={String(cuisine)} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{String(cuisine)}</span>
                <span className="text-sm text-gray-600">{Number(rating)}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${((rating as number) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Palate Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Your Taste Profile</h4>
            <ul className="text-sm text-purple-100 space-y-1">
              <li>• You prefer {tasteData.sort((a, b) => b.value - a.value)[0]?.label.toLowerCase()} flavors</li>
              <li>• Your adventurousness level is {tasteProfile.culinary_adventurousness >= 4 ? 'high' : tasteProfile.culinary_adventurousness >= 2 ? 'moderate' : 'conservative'}</li>
              <li>• You enjoy {textureData.sort((a, b) => b.value - a.value)[0]?.label.toLowerCase()} textures most</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="text-sm text-purple-100 space-y-1">
              <li>• Try exploring {tasteData.sort((a, b) => a.value - b.value)[0]?.label.toLowerCase()} flavors more</li>
              <li>• Consider {topCuisines.length > 1 ? topCuisines[1][0] : 'new'} cuisine for variety</li>
              <li>• Your palate would enjoy fusion restaurants</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Profile Completion
          </h3>
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Complete your profile for better recommendations</span>
          </div>
        </div>
        
        {/* Calculate completion percentage */}
        {(() => {
          const totalFields = 11; // All preference fields
          const completedFields = [
            tasteProfile.salty_preference,
            tasteProfile.sweet_preference,
            tasteProfile.sour_preference,
            tasteProfile.bitter_preference,
            tasteProfile.umami_preference,
            tasteProfile.crunchy_preference,
            tasteProfile.creamy_preference,
            tasteProfile.chewy_preference,
            tasteProfile.hot_food_preference,
            tasteProfile.cold_food_preference,
            tasteProfile.culinary_adventurousness
          ].filter(field => field !== null && field !== undefined && field > 0).length;
          
          const completionPercentage = (completedFields / totalFields) * 100;
          
          return (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {completionPercentage < 100 
                  ? `Complete ${totalFields - completedFields} more preference${totalFields - completedFields !== 1 ? 's' : ''} to unlock advanced recommendations`
                  : 'Your profile is complete! You\'ll receive the most accurate recommendations.'
                }
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default PalateProfileTab;