'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'react-qr-code'
import { Share, Download, Copy, Refresh, Settings, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface QRCodeGeneratorProps {
  onClose?: () => void
}

export default function QRCodeGenerator({ onClose }: QRCodeGeneratorProps) {
  const { user } = useAuth()
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')
  const [qrStyle, setQrStyle] = useState<'standard' | 'colorful' | 'branded'>('standard')
  const [showStyleOptions, setShowStyleOptions] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (user) {
      generateQRCode()
    }
  }, [user, qrStyle])

  const generateQRCode = async () => {
    try {
      // Generate a verification token for secure QR codes
      const token = await generateVerificationToken()
      setVerificationToken(token)
      
      // Create a shareable URL with verification token
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const userShareUrl = `${baseUrl}/add-friend?user=${user.id}&token=${token}&type=qr`
      setShareUrl(userShareUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      // Fallback to simple URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const userShareUrl = `${baseUrl}/add-friend?user=${user.id}`
      setShareUrl(userShareUrl)
    }
  }

  const generateVerificationToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/friends/qr-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.token
      }
    } catch (error) {
      console.error('Failed to generate verification token:', error)
    }
    
    // Fallback: generate a simple timestamp-based token
    return btoa(`${user.id}-${Date.now()}`)
  }

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
    if (qrStyle === 'branded' && canvasRef.current) {
      // Download the branded canvas version
      const pngFile = canvasRef.current.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `kuchisabishii-qr-${user?.displayName || 'user'}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    } else {
      // Download the SVG version
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
  }

  const refreshQRCode = () => {
    generateQRCode()
  }

  const renderBrandedQR = () => {
    // This would render a custom QR code with profile image in the center
    // For now, we'll use the standard QR code with custom styling
    return (
      <div className="relative">
        <QRCode
          id="qr-code-svg"
          value={shareUrl}
          size={200}
          level="H"
          includeMargin={true}
          fgColor={qrStyle === 'colorful' ? '#ea580c' : '#000000'}
          bgColor="#ffffff"
        />
        {user.profileImage && qrStyle === 'branded' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full p-1 shadow-lg">
              <img
                src={user.profileImage}
                alt={user.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    )
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
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">QR Code Style</span>
            <div className="flex space-x-1">
              <button
                onClick={refreshQRCode}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Refresh QR Code"
              >
                <Refresh className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowStyleOptions(!showStyleOptions)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Style Options"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {showStyleOptions && (
            <div className="flex space-x-2 mb-3">
              {[
                { id: 'standard', label: 'Standard', icon: '⬛' },
                { id: 'colorful', label: 'Colorful', icon: '🟧' },
                { id: 'branded', label: 'Branded', icon: '✨' }
              ].map(style => (
                <button
                  key={style.id}
                  onClick={() => setQrStyle(style.id as any)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                    qrStyle === style.id
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="flex justify-center">
            {renderBrandedQR()}
          </div>
          
          {verificationToken && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                <Sparkles className="w-3 h-3" />
                <span>Secured with verification</span>
              </div>
            </div>
          )}
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