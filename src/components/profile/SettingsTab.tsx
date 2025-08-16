'use client';

import React, { useState } from 'react';
import { 
  Settings, Shield, Bell, Eye, EyeOff, Globe, 
  Smartphone, Mail, Lock, Trash2, Download,
  AlertTriangle, Check, X, Info, Users,
  Database, Share2, Camera, MapPin, TrendingUp, LogOut
} from 'lucide-react';
import {
  StandardComponentProps,
  PrivacySettingKey,
  PrivacySettingValue,
  DataSettingKey,
  DataSettingValue,
  NotificationType,
  UserNotificationSettings,
  UserPrivacySettings,
  UserDataSettings
} from '@/types/base';
import { Database as SupabaseDatabase } from '@/lib/supabase/types';

// Use Supabase user profile type for consistency
type UserProfile = SupabaseDatabase['public']['Tables']['user_profiles']['Row'];

interface SettingsTabProps extends StandardComponentProps<UserProfile> {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ userProfile, setUserProfile, className, testId, ariaLabel }) => {
  const [notifications, setNotifications] = useState<UserNotificationSettings>({
    food_recommendations: true,
    friend_activity: true,
    new_followers: false,
    review_responses: true,
    system_updates: false,
    email_digest: true,
    push_notifications: true
  });

  const [privacy, setPrivacy] = useState<UserPrivacySettings>({
    profile_visibility: userProfile.profile_visibility,
    show_location: true,
    show_activity: true,
    allow_friend_requests: true,
    share_analytics: userProfile.share_analytics,
    allow_recommendations: userProfile.allow_recommendations
  });

  const [dataSettings, setDataSettings] = useState<UserDataSettings>({
    auto_backup: true,
    photo_quality: 'high',
    offline_mode: false
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const updateNotification = (key: NotificationType, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const updatePrivacy = <K extends keyof UserPrivacySettings>(
    key: K,
    value: UserPrivacySettings[K]
  ) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    
    // Update main profile for relevant settings
    if (key === 'profile_visibility' || key === 'share_analytics' || key === 'allow_recommendations') {
      setUserProfile({
        ...userProfile,
        [key]: value
      });
    }
  };

  const updateDataSetting = <K extends keyof UserDataSettings>(
    key: K,
    value: UserDataSettings[K]
  ) => {
    setDataSettings(prev => ({ ...prev, [key]: value }));
  };

  const exportData = async () => {
    // In a real app, this would call an API to generate and download user data
    const userData = {
      profile: userProfile,
      settings: {
        notifications,
        privacy,
        dataSettings
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kuchisabishii-data-export.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    if (deleteConfirmText === 'DELETE MY ACCOUNT') {
      // In a real app, this would call an API to delete the account
      console.log('Account deletion requested');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        enabled 
          ? 'bg-orange-600' 
          : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div 
      className={`space-y-6 ${className || ''}`}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Account Settings
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={userProfile.username || ''}
              onChange={(e) => setUserProfile({...userProfile, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Choose a unique username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={userProfile.display_name || ''}
              onChange={(e) => setUserProfile({...userProfile, display_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="How others will see your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={userProfile.location || ''}
              onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="City, State/Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={userProfile.bio || ''}
              onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Tell others about your food journey..."
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Privacy Settings
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Profile Visibility</h4>
              <p className="text-sm text-gray-600">Who can see your profile and reviews</p>
            </div>
            <select
              value={privacy.profile_visibility}
              onChange={(e) => updatePrivacy('profile_visibility', e.target.value as 'public' | 'friends' | 'private')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Show Location</h4>
              <p className="text-sm text-gray-600">Display your location on your profile</p>
            </div>
            <ToggleSwitch
              enabled={privacy.show_location}
              onChange={(value) => updatePrivacy('show_location', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Show Activity</h4>
              <p className="text-sm text-gray-600">Let friends see your recent reviews and visits</p>
            </div>
            <ToggleSwitch
              enabled={privacy.show_activity}
              onChange={(value) => updatePrivacy('show_activity', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Allow Friend Requests</h4>
              <p className="text-sm text-gray-600">Let other users send you friend requests</p>
            </div>
            <ToggleSwitch
              enabled={privacy.allow_friend_requests}
              onChange={(value) => updatePrivacy('allow_friend_requests', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Share Analytics</h4>
              <p className="text-sm text-gray-600">Help improve recommendations by sharing anonymous usage data</p>
            </div>
            <ToggleSwitch
              enabled={privacy.share_analytics}
              onChange={(value) => updatePrivacy('share_analytics', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">AI Recommendations</h4>
              <p className="text-sm text-gray-600">Receive personalized food and restaurant recommendations</p>
            </div>
            <ToggleSwitch
              enabled={privacy.allow_recommendations}
              onChange={(value) => updatePrivacy('allow_recommendations', value)}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Settings
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Food Recommendations</h4>
              <p className="text-sm text-gray-600">Get notified about new food recommendations</p>
            </div>
            <ToggleSwitch
              enabled={notifications.food_recommendations}
              onChange={(value) => updateNotification('food_recommendations', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Friend Activity</h4>
              <p className="text-sm text-gray-600">See when friends review new places</p>
            </div>
            <ToggleSwitch
              enabled={notifications.friend_activity}
              onChange={(value) => updateNotification('friend_activity', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">New Followers</h4>
              <p className="text-sm text-gray-600">Get notified when someone follows you</p>
            </div>
            <ToggleSwitch
              enabled={notifications.new_followers}
              onChange={(value) => updateNotification('new_followers', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Review Responses</h4>
              <p className="text-sm text-gray-600">Notifications when someone responds to your reviews</p>
            </div>
            <ToggleSwitch
              enabled={notifications.review_responses}
              onChange={(value) => updateNotification('review_responses', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email Digest</h4>
              <p className="text-sm text-gray-600">Weekly summary of your activity and recommendations</p>
            </div>
            <ToggleSwitch
              enabled={notifications.email_digest}
              onChange={(value) => updateNotification('email_digest', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications on your device</p>
            </div>
            <ToggleSwitch
              enabled={notifications.push_notifications}
              onChange={(value) => updateNotification('push_notifications', value)}
            />
          </div>
        </div>
      </div>

      {/* Data & Storage */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Data & Storage
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto Backup</h4>
              <p className="text-sm text-gray-600">Automatically backup your reviews and photos</p>
            </div>
            <ToggleSwitch
              enabled={dataSettings.auto_backup}
              onChange={(value) => updateDataSetting('auto_backup', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Photo Quality</h4>
              <p className="text-sm text-gray-600">Quality of uploaded photos</p>
            </div>
            <select
              value={dataSettings.photo_quality}
              onChange={(e) => updateDataSetting('photo_quality', e.target.value as 'low' | 'medium' | 'high')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="low">Low (Faster upload)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Best quality)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Offline Mode</h4>
              <p className="text-sm text-gray-600">Save reviews locally when offline</p>
            </div>
            <ToggleSwitch
              enabled={dataSettings.offline_mode}
              onChange={(value) => updateDataSetting('offline_mode', value)}
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export My Data</span>
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Download all your reviews, photos, and profile data
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Security
        </h3>
        
        <div className="space-y-4">
          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Login History</h4>
                <p className="text-sm text-gray-600">See recent account activity</p>
              </div>
              <Globe className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      {/* Taste Profile Management */}
      <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-200">
        <h3 className="text-lg font-semibold mb-6 flex items-center text-purple-600">
          <Database className="w-5 h-5 mr-2" />
          Taste Profile Management
        </h3>
        
        <div className="space-y-4">
          <button 
            onClick={() => {
              // Navigate directly to taste profiling questionnaire
              window.location.href = '/onboarding';
            }}
            className="w-full text-left p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors bg-purple-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900">Retake AI Taste Profiling</h4>
                <p className="text-sm text-purple-600">Update your taste profile with new questionnaire</p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </button>

          <button 
            onClick={() => {
              if (confirm('This will reset your taste profile and restart the full onboarding process. Continue?')) {
                // Clear taste profile data
                localStorage.removeItem('tasteProfile');
                localStorage.removeItem('onboardingCompleted');
                // Redirect to onboarding
                window.location.href = '/onboarding/intro';
              }
            }}
            className="w-full text-left p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900">Reset Taste Profile</h4>
                <p className="text-sm text-purple-600">Completely restart the AI taste questionnaire</p>
              </div>
              <Database className="w-5 h-5 text-purple-400" />
            </div>
          </button>

          <button className="w-full text-left p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900">View Taste Evolution</h4>
                <p className="text-sm text-purple-600">See how your preferences have changed</p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </button>

          <button className="w-full text-left p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900">Export Taste Data</h4>
                <p className="text-sm text-purple-600">Download your taste profile for analysis</p>
              </div>
              <Download className="w-5 h-5 text-purple-400" />
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
        <h3 className="text-lg font-semibold mb-6 flex items-center text-red-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Danger Zone
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Logout</h4>
            <p className="text-sm text-orange-700 mb-4">
              Sign out of your account on this device.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to logout?')) {
                  // This would call the logout function passed as prop
                  window.location.href = '/';
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-700 font-medium">
                  Type &quot;DELETE MY ACCOUNT&quot; to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="DELETE MY ACCOUNT"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={deleteAccount}
                    disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Save All Changes</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;