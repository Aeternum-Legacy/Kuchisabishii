'use client';

/**
 * LinkedIn Profile Card Component
 * Displays LinkedIn-imported profile information in a professional format
 */

import React, { useState } from 'react';
import { 
  Linkedin, MapPin, Briefcase, GraduationCap, Award, 
  Globe, ChevronDown, ChevronUp, ExternalLink, Star,
  Building, Calendar, Users, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkedInProfileData, formatCredentials } from '@/lib/linkedin/profile-import';

interface LinkedInProfileCardProps {
  profileData: LinkedInProfileData;
  showFullDetails?: boolean;
  className?: string;
  onImportToProfile?: () => void;
}

const LinkedInProfileCard: React.FC<LinkedInProfileCardProps> = ({
  profileData,
  showFullDetails = true,
  className = '',
  onImportToProfile
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const credentials = profileData.title.match(/P\.Eng|PMP|PhD|MD|JD|CPA|MBA|PE/gi) || [];
  const companyMatch = profileData.title.match(/at\s+(.+)$/);
  const company = companyMatch ? companyMatch[1] : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
              {profileData.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profileData.fullName}</h2>
              {credentials.length > 0 && (
                <div className="flex items-center space-x-2 mt-1">
                  <Award className="w-4 h-4" />
                  <span className="text-blue-100 font-medium">
                    {formatCredentials(credentials)}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2 mt-2 text-blue-100">
                <MapPin className="w-4 h-4" />
                <span>{profileData.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Linkedin className="w-6 h-6" />
            <span className="text-sm opacity-75">LinkedIn Profile</span>
          </div>
        </div>
      </div>

      {/* Professional Title & Company */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {profileData.title.replace(/,?\s*P\.Eng|,?\s*PMP/gi, '').replace(/\s+at\s+.+$/i, '')}
            </h3>
            {company && (
              <div className="flex items-center space-x-2 mt-1">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{company}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-3">Professional Summary</h4>
        <p className="text-gray-600 leading-relaxed">
          {profileData.bio}
        </p>
      </div>

      {/* Key Skills */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Key Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {profileData.skills.slice(0, 6).map((skill, index) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
            >
              {skill}
            </motion.span>
          ))}
          {profileData.skills.length > 6 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
            >
              <span>+{profileData.skills.length - 6} more</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {profileData.skills.slice(6).map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showFullDetails && (
        <>
          {/* Languages */}
          <div className="p-6 border-b border-gray-100">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Languages ({profileData.languages.length})
              </h4>
              {showLanguages ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {showLanguages && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  {profileData.languages.map((language, index) => (
                    <motion.div
                      key={language.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">{language.name}</span>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                        {language.proficiency}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Education */}
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Education
            </h4>
            <div className="space-y-3">
              {profileData.education.map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <h5 className="font-semibold text-gray-900">{edu.school}</h5>
                  {edu.degree && (
                    <p className="text-gray-700 mt-1">{edu.degree}</p>
                  )}
                  {edu.field && (
                    <p className="text-gray-600 text-sm">{edu.field}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{edu.years}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Professional Context for Food Preferences */}
      <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Star className="w-4 h-4 mr-2 text-orange-500" />
          Food Profile Insights
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          {credentials.includes('P.Eng' as never) && (
            <p>• Engineering background suggests appreciation for precision in flavor profiles</p>
          )}
          {credentials.includes('PMP' as never) && (
            <p>• Project management experience indicates structured approach to trying new cuisines</p>
          )}
          {profileData.location.includes('Alberta') && (
            <p>• Alberta location suggests familiarity with hearty Canadian comfort foods</p>
          )}
          {profileData.languages.some(lang => lang.name.includes('Cantonese')) && (
            <p>• Cantonese language skills indicate appreciation for authentic Chinese cuisine</p>
          )}
        </div>
      </div>

      {/* Action Button */}
      {onImportToProfile && (
        <div className="p-6">
          <button
            onClick={onImportToProfile}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Import to Food Profile</span>
          </button>
        </div>
      )}

      {/* Metadata */}
      <div className="px-6 pb-4 text-xs text-gray-500 flex items-center justify-between">
        <span>Professional profile data</span>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Verified</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LinkedInProfileCard;