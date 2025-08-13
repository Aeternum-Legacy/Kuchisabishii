'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, User, Download, Upload, Settings } from 'lucide-react';
import UserProfileTabs from '@/components/profile/UserProfileTabs';
import LinkedInProfileCard from '@/components/profile/LinkedInProfileCard';
import AuthWrapper from '@/components/auth/AuthWrapper';
import { LinkedInProfileData, aaronTongLinkedInData } from '@/lib/linkedin/profile-import';

const ProfilePage: React.FC = () => {
  const [showLinkedInIntegration, setShowLinkedInIntegration] = useState(false);
  const [linkedInData, setLinkedInData] = useState<LinkedInProfileData | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    // Load Aaron Tong's LinkedIn data on component mount
    setLinkedInData(aaronTongLinkedInData);
  }, []);

  const handleImportLinkedInProfile = async () => {
    if (!linkedInData) return;

    setIsImporting(true);
    try {
      const response = await fetch('/api/profile/linkedin-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedInData,
          importMode: 'merge'
        })
      });

      const data = await response.json();

      if (data.success) {
        setImportSuccess(true);
        setShowLinkedInIntegration(false);
        // Refresh the page to show updated profile
        window.location.reload();
      } else {
        console.error('Failed to import LinkedIn profile:', data.error);
        alert('Failed to import LinkedIn profile. Please try again.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('An error occurred while importing the profile.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-100">
        {/* Header with LinkedIn Integration */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <div className="flex items-center space-x-3">
                {!showLinkedInIntegration && (
                  <button
                    onClick={() => setShowLinkedInIntegration(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>Import from LinkedIn</span>
                  </button>
                )}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Settings className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {importSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-green-500 text-white py-3 px-4 text-center"
            >
              <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>LinkedIn profile imported successfully! Your profile has been updated with professional information.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LinkedIn Integration Modal */}
        <AnimatePresence>
          {showLinkedInIntegration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-8 h-8 text-blue-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Import LinkedIn Profile</h2>
                        <p className="text-gray-600">Import professional information to enhance your food profile</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLinkedInIntegration(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* LinkedIn Profile Card */}
                <div className="p-6">
                  {linkedInData && (
                    <LinkedInProfileCard
                      profileData={linkedInData}
                      showFullDetails={true}
                      onImportToProfile={handleImportLinkedInProfile}
                    />
                  )}
                </div>

                {/* Import Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>✓ Professional information will be added to your profile</p>
                      <p>✓ Skills and credentials will enhance food recommendations</p>
                      <p>✓ Location and language data will personalize suggestions</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowLinkedInIntegration(false)}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleImportLinkedInProfile}
                        disabled={isImporting}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isImporting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Importing...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Import Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Profile Content */}
        <UserProfileTabs />
      </div>
    </AuthWrapper>
  );
};

export default ProfilePage;