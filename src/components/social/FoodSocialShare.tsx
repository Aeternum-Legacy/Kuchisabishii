'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Mail,
  Camera,
  Heart,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Check,
  X,
  Download,
  QrCode,
  Link2
} from 'lucide-react';

interface FoodSocialShareProps {
  foodItem: {
    id: string;
    name: string;
    restaurant: string;
    image: string;
    rating: number;
    price: string;
    location: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onShare?: (platform: string) => void;
  shareUrl?: string;
  userReview?: {
    rating: number;
    text: string;
    date: string;
  };
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  action: (url: string, text: string) => void;
  popular?: boolean;
}

export const FoodSocialShare: React.FC<FoodSocialShareProps> = ({
  foodItem,
  isOpen,
  onClose,
  onShare,
  shareUrl = window.location.href,
  userReview,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generateShareText = useCallback(() => {
    const baseText = `Check out this ${foodItem.name} from ${foodItem.restaurant}!`;
    const rating = userReview ? ` I rated it ${userReview.rating}/5 stars.` : '';
    const review = userReview?.text ? ` "${userReview.text}"` : '';
    return `${baseText}${rating}${review} #Kuchisabishii #FoodReview`;
  }, [foodItem, userReview]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${generateShareText()}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.('clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }, [shareUrl, generateShareText, onShare]);

  const sharePlatforms: SharePlatform[] = [
    {
      id: 'copy',
      name: 'Copy Link',
      icon: copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />,
      color: copied ? '#10B981' : '#6B7280',
      action: copyToClipboard,
      popular: true,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: '#E4405F',
      action: () => {
        // Instagram doesn't support direct URL sharing, so we copy the text
        copyToClipboard();
        onShare?.('instagram');
      },
      popular: true,
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: '#1DA1F2',
      action: (url, text) => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
        onShare?.('twitter');
      },
      popular: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: '#1877F2',
      action: (url) => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(fbUrl, '_blank');
        onShare?.('facebook');
      },
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: '#25D366',
      action: (url, text) => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
        window.open(whatsappUrl, '_blank');
        onShare?.('whatsapp');
      },
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      color: '#EA4335',
      action: (url, text) => {
        const subject = `Check out this food from ${foodItem.restaurant}!`;
        const body = `${text}\n\nView more details: ${url}`;
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
        onShare?.('email');
      },
    },
  ];

  const popularPlatforms = sharePlatforms.filter(p => p.popular);
  const otherPlatforms = sharePlatforms.filter(p => !p.popular);

  const handlePlatformShare = useCallback((platform: SharePlatform) => {
    const text = generateShareText();
    platform.action(shareUrl, text);
  }, [shareUrl, generateShareText]);

  const generateShareImage = useCallback(async () => {
    setIsGeneratingImage(true);
    // In a real app, this would generate a beautiful share image
    // For now, we'll simulate the process
    setTimeout(() => {
      setIsGeneratingImage(false);
      onShare?.('image');
    }, 2000);
  }, [onShare]);

  const renderStars = useCallback((rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading-2 font-bold text-gray-800">Share Food Experience</h3>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={onClose}
                aria-label="Close share modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Food Preview */}
            <div className="food-card p-4 cursor-default">
              <div className="flex gap-3">
                <img
                  src={foodItem.image}
                  alt={foodItem.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{foodItem.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{foodItem.restaurant}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {renderStars(foodItem.rating)}
                    </div>
                    <span className="text-sm text-gray-600">{foodItem.rating}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{foodItem.price}</span>
                  </div>
                </div>
              </div>

              {/* User Review Preview */}
              {userReview && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {renderStars(userReview.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">Your Review</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{userReview.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Share Options */}
          <div className="p-6 space-y-6">
            {/* Popular Platforms */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Share</h4>
              <div className="grid grid-cols-3 gap-3">
                {popularPlatforms.map((platform) => (
                  <motion.button
                    key={platform.id}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    onClick={() => handlePlatformShare(platform)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: platform.color }}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{platform.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Other Platforms */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">More Options</h4>
              <div className="space-y-2">
                {otherPlatforms.map((platform) => (
                  <motion.button
                    key={platform.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    onClick={() => handlePlatformShare(platform)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: platform.color }}
                    >
                      {platform.icon}
                    </div>
                    <span className="font-medium text-gray-700">{platform.name}</span>
                  </motion.button>
                ))}

                {/* Generate Share Image */}
                <motion.button
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={generateShareImage}
                  disabled={isGeneratingImage}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 text-white flex-shrink-0">
                    {isGeneratingImage ? (
                      <div className="loading-spinner w-4 h-4" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      {isGeneratingImage ? 'Generating...' : 'Generate Share Image'}
                    </span>
                    <p className="text-xs text-gray-500">Create a beautiful image for sharing</p>
                  </div>
                </motion.button>

                {/* QR Code */}
                <motion.button
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={() => onShare?.('qr')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 text-white flex-shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Share QR Code</span>
                    <p className="text-xs text-gray-500">Let others scan to view</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-800">Help the Community</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Your shared reviews help others discover amazing food experiences!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};