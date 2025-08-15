'use client'

import { useState, useEffect, useRef } from 'react'
import QrScanner from 'qr-scanner'
import { X, Camera, Upload, CheckCircle, AlertCircle, Loader, ZoomIn, RotateCcw } from 'lucide-react'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
  onUserFound?: (user: Record<string, unknown>) => void
}

export default function QRScanner({ onScan, onClose, onUserFound }: QRScannerProps) {
  const [hasCamera, setHasCamera] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validatingQR, setValidatingQR] = useState(false)
  const [scannedUser, setScannedUser] = useState<any>(null)
  const [cameras, setCameras] = useState<QrScanner.Camera[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)

  useEffect(() => {
    // Check if camera is available and get camera list
    const initializeCameras = async () => {
      const hasAnyCamera = await QrScanner.hasCamera()
      setHasCamera(hasAnyCamera)
      
      if (hasAnyCamera) {
        try {
          const availableCameras = await QrScanner.listCameras(true)
          setCameras(availableCameras)
          if (availableCameras.length > 0) {
            // Prefer back camera if available
            const backCamera = availableCameras.find(cam => 
              cam.label.toLowerCase().includes('back') || 
              cam.label.toLowerCase().includes('rear')
            )
            setSelectedCamera(backCamera?.id || availableCameras[0].id)
          }
        } catch (error) {
          console.error('Failed to list cameras:', error)
        }
      }
    }

    initializeCameras()

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
      }
    }
  }, [])

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return

    try {
      setIsScanning(true)
      setError(null)
      setSuccess(null)
      setScannedUser(null)

      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          console.log('QR Code detected:', result.data)
          await handleQRCodeDetected(result.data)
          stopScanning()
        },
        {
          onDecodeError: (error) => {
            // Ignore decode errors, they happen when no QR code is visible
            console.log('QR decode error (normal):', error)
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
          preferredCamera: selectedCamera || 'environment'
        }
      )

      scannerRef.current = scanner
      
      if (selectedCamera) {
        await scanner.setCamera(selectedCamera)
      }
      
      await scanner.start()

    } catch (error) {
      console.error('Failed to start camera:', error)
      setError('Unable to access camera. Please check permissions and try again.')
      setIsScanning(false)
    }
  }

  const handleQRCodeDetected = async (qrData: string) => {
    setValidatingQR(true)
    
    try {
      // Validate the QR code and extract user information
      const url = new URL(qrData)
      const userId = url.searchParams.get('user')
      const token = url.searchParams.get('token')
      const type = url.searchParams.get('type')

      if (!userId) {
        throw new Error('Invalid QR code format')
      }

      // If there's a token, validate it first
      if (token && type === 'qr') {
        const response = await fetch(`/api/friends/qr-token?token=${token}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Invalid QR code')
        }
        
        const data = await response.json()
        setScannedUser(data.user)
        setSuccess(`Found ${data.user.displayName}! Ready to connect.`)
      } else {
        // Fallback: just show that we found a user ID
        setSuccess('QR code detected! Ready to send friend request.')
      }

      // Call the original onScan callback
      onScan(qrData)
      
    } catch (error) {
      console.error('QR validation error:', error)
      setError(error instanceof Error ? error.message : 'Invalid QR code')
    } finally {
      setValidatingQR(false)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
      scannerRef.current.destroy()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setSuccess(null)
      setValidatingQR(true)
      
      const result = await QrScanner.scanImage(file)
      console.log('QR Code from file:', result)
      await handleQRCodeDetected(result)
    } catch (error) {
      console.error('Failed to scan QR code from image:', error)
      setError('No valid QR code found in the image. Please try a clearer image.')
      setValidatingQR(false)
    }
  }

  const switchCamera = async () => {
    if (cameras.length <= 1 || !scannerRef.current) return
    
    const currentIndex = cameras.findIndex(cam => cam.id === selectedCamera)
    const nextIndex = (currentIndex + 1) % cameras.length
    const nextCamera = cameras[nextIndex]
    
    try {
      await scannerRef.current.setCamera(nextCamera.id)
      setSelectedCamera(nextCamera.id)
    } catch (error) {
      console.error('Failed to switch camera:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}
        
        {validatingQR && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
            <Loader className="w-4 h-4 animate-spin flex-shrink-0" />
            <p className="text-sm">Validating QR code...</p>
          </div>
        )}
        
        {/* Scanned User Preview */}
        {scannedUser && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {scannedUser.profileImage ? (
                  <img 
                    src={scannedUser.profileImage} 
                    alt={scannedUser.displayName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-lg">👤</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{scannedUser.displayName}</h3>
                <p className="text-sm text-gray-600">{scannedUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Camera Scanner */}
        {hasCamera && (
          <div className="mb-6">
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
                muted
              />
            </div>

            <div className="flex space-x-3">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  disabled={validatingQR}
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Stop Scanning
                </button>
              )}
              
              {isScanning && cameras.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors"
                  title="Switch Camera"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {cameras.length > 1 && !isScanning && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {cameras.map(camera => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${camera.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* File Upload */}
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Or upload an image with a QR code
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              disabled={validatingQR}
            >
              {validatingQR ? 'Processing...' : 'Choose Image'}
            </button>
          </div>
        </div>

        {!hasCamera && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <p className="text-sm">
              Camera not available. You can still upload an image with a QR code.
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Point your camera at a Kuchisabishii QR code to add a friend instantly
          </p>
        </div>
      </div>
    </div>
  )
}