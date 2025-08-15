'use client'

import { useState } from 'react'
import { Share2, Heart, MessageCircle, Users, Copy, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface SocialShareProps {
  foodReview: {
    id: string
    name: string
    location: string
    kuchisabishiRating: number
    experience: string
    image?: string
    dateEaten: string
  }
  showShareOptions?: boolean
  onClose?: () => void
}

export default function SocialShare({ foodReview, showShareOptions = false, onClose }: SocialShareProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/share/food/${foodReview.id}`
  const shareText = `Check out this ${foodReview.kuchisabishiRating === 5 ? 'amazing' : 'great'} food I tried: ${foodReview.name} at ${foodReview.location}! ${foodReview.kuchisabishiRating}/5 stars ⭐`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${foodReview.name} - Kuchisabishii Review`,
          text: shareText,
          url: shareUrl
        })
        setShared(true)
      } catch (error) {
        console.error('Error sharing:', error)
        // Fallback to copy link
        handleCopyLink()
      }
    } else {
      // Fallback for browsers that dondon'tapos;t support Web Share API
      handleCopyLink()
    }
  }

  const shareTo = (platform: string) => {
    let url = ''
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        break
      default:
        return
    }
    
    window.open(url, '_blank', 'width=600,height=400')
    setShared(true)
  }

  const shareToFriends = async () => {
    try {
      const response = await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodReviewId: foodReview.id,
          type: 'food_review'
        })
      })

      if (response.ok) {
        setShared(true)
        alert('Shared with your friends!')
      } else {
        throw new Error('Failed to share')
      }
    } catch (error) {
      console.error('Failed to share with friends:', error)
      alert('Failed to share with friends')
    }
  }

  if (!showShareOptions) {
    return (
      <button
        onClick={handleWebShare}
        className="flex items-center space-x-1 text-gray-500 hover:text-orange-500 transition-colors"
        title="Share this food review"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-xs">Share</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50">
      <div className="bg-white rounded-t-xl w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Share Your Food Review</h3>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span>{foodReview.name}</span>
            <span>•</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < foodReview.kuchisabishiRating ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Share Options */}
        <div className="space-y-3">
          <button
            onClick={handleWebShare}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Everywhere</span>
          </button>

          <button
            onClick={shareToFriends}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Share with Friends</span>
          </button>
        </div>

        {/* Social Platforms */}
        <div>
          <p className="text-sm text-gray-600 mb-3 text-center">Share on social media</p>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => shareTo('twitter')}
              className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-lg text-center transition-colors"
            >
              <span className="text-lg">🐦</span>
              <p className="text-xs mt-1">Twitter</p>
            </button>
            <button
              onClick={() => shareTo('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-center transition-colors"
            >
              <span className="text-lg">📘</span>
              <p className="text-xs mt-1">Facebook</p>
            </button>
            <button
              onClick={() => shareTo('whatsapp')}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg text-center transition-colors"
            >
              <span className="text-lg">💬</span>
              <p className="text-xs mt-1">WhatsApp</p>
            </button>
            <button
              onClick={() => shareTo('telegram')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg text-center transition-colors"
            >
              <span className="text-lg">✈️</span>
              <p className="text-xs mt-1">Telegram</p>
            </button>
          </div>
        </div>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>

        {shared && (
          <div className="text-center text-green-600 text-sm">
            ✅ Successfully shared!
          </div>
        )}
      </div>
    </div>
  )
}