'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { UserPlus, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

function AddFriendContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [friendUser, setFriendUser] = useState<Record<string, unknown> | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'self' | 'already_friends'>('loading')
  const [message, setMessage] = useState('')

  const friendUserId = searchParams.get('user')

  useEffect(() => {
    if (!user || !friendUserId) {
      setStatus('error')
      setMessage('Invalid friend request')
      setLoading(false)
      return
    }

    if (user.id === friendUserId) {
      setStatus('self')
      setMessage('You cannot add yourself as a friend')
      setLoading(false)
      return
    }

    handleAddFriend()
  }, [user, friendUserId])

  const handleAddFriend = async () => {
    try {
      setLoading(true)

      // First, get the friend's profile
      const searchResponse = await fetch(`/api/users/search?q=${friendUserId}`)
      if (!searchResponse.ok) {
        throw new Error('Failed to find user')
      }

      const searchData = await searchResponse.json()
      const foundUser = searchData.users?.find((u: Record<string, unknown>) => u.id === friendUserId)

      if (!foundUser) {
        throw new Error('User not found')
      }

      setFriendUser(foundUser)

      // Check if already friends
      if (foundUser.friendshipStatus === 'accepted') {
        setStatus('already_friends')
        setMessage(`You are already friends with ${foundUser.displayName}`)
        setLoading(false)
        return
      }

      if (foundUser.friendshipStatus === 'pending') {
        setStatus('success')
        setMessage(`Friend request already sent to ${foundUser.displayName}`)
        setLoading(false)
        return
      }

      // Send friend request
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUserId })
      })

      if (response.ok) {
        setStatus('success')
        setMessage(`Friend request sent to ${foundUser.displayName}!`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send friend request')
      }

    } catch (error) {
      console.error('Add friend error:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to add friend')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      case 'error':
      case 'self':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto" />
      case 'already_friends':
        return <CheckCircle className="w-16 h-16 text-blue-500 mx-auto" />
      default:
        return (
          <div className="w-16 h-16 mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
          </div>
        )
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
      case 'self':
        return 'text-red-600'
      case 'already_friends':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Friend</h1>
          <p className="text-gray-600">Connect with friends on Kuchisabishii</p>
        </div>

        {/* Status Icon */}
        <div className="mb-6">
          {getStatusIcon()}
        </div>

        {/* Friend Info */}
        {friendUser && (
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
              {friendUser.profileImage ? (
                <Image 
                  src={friendUser.profileImage as string} 
                  alt={friendUser.displayName as string}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{friendUser.displayName as string}</h3>
            <p className="text-sm text-gray-600">{friendUser.email as string}</p>
          </div>
        )}

        {/* Status Message */}
        <div className={`text-center mb-8 ${getStatusColor()}`}>
          <p className="text-lg font-medium">{message}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {status === 'success' && (
            <button
              onClick={() => router.push('/?view=friends')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>View Friends</span>
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {status === 'success' 
              ? 'Your friend will receive a notification and can accept your request.'
              : 'Something went wrong? Try scanning the QR code again or contact your friend.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AddFriendPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    }>
      <AddFriendContent />
    </Suspense>
  )
}