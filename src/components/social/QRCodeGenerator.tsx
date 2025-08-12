'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Share, Download, Copy } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface QRCodeGeneratorProps {
  onClose?: () => void
}

export default function QRCodeGenerator({ onClose }: QRCodeGeneratorProps) {
  const { user } = useAuth()
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      // Create a shareable URL for the user
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const userShareUrl = `${baseUrl}/add-friend?user=${user.id}`
      setShareUrl(userShareUrl)
    }
  }, [user])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Add me on Kuchisabishii!',
          text: `Connect with ${user?.displayName || 'me'} on Kuchisabishii to share food experiences!`,
          url: shareUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
        // Fallback to copy URL
        handleCopyUrl()
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyUrl()
    }
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `kuchisabishii-qr-${user?.displayName || 'user'}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    }
  }

  if (!user || !shareUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">My QR Code</h2>
          <p className="text-sm text-gray-600">
            Share this QR code to let friends add you instantly!
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex justify-center">
          <QRCode
            id="qr-code-svg"
            value={shareUrl}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-800">{user.displayName}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Share className="w-4 h-4" />
            <span>Share QR Code</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyUrl}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownloadQR}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Others can scan this code with their phone camera or the Kuchisabishii app
          </p>
        </div>
      </div>
    </div>
  )
}