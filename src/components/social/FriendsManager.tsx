'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus, QrCode, Camera, Users, Bell, UserCheck, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import QRCodeGenerator from './QRCodeGenerator'
import QRScanner from './QRScanner'
import FriendRecommendations from './FriendRecommendations'

interface Friend {
  friendshipId: string
  friend: {
    id: string
    displayName: string
    firstName: string
    lastName: string
    profileImage?: string
  }
  friendsSince: string
}

interface FriendRequest {
  id: string
  requester: {
    id: string
    displayName: string
    firstName: string
    lastName: string
    profileImage?: string
  }
  requestedAt: string
}

interface User {
  id: string
  displayName: string
  firstName: string
  lastName: string
  profileImage?: string
  email: string
  friendshipStatus: 'none' | 'pending' | 'accepted'
}

interface FriendsManagerProps {
  onBack?: () => void
}

export default function FriendsManager({ onBack }: FriendsManagerProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'discover'>('friends')
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)

  // Load friends and requests on component mount
  useEffect(() => {
    if (activeTab === 'friends') {
      loadFriends()
    } else if (activeTab === 'requests') {
      loadFriendRequests()
    }
  }, [activeTab])

  const loadFriends = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/friends')
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Failed to load friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFriendRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/friends/requests')
      if (response.ok) {
        const data = await response.json()
        setFriendRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to load friend requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error('Failed to search users:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUserId: userId })
      })
      
      if (response.ok) {
        // Update the user's friendship status in search results
        setSearchResults(prev => prev.map(u => 
          u.id === userId ? { ...u, friendshipStatus: 'pending' } : u
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Failed to send friend request:', error)
      alert('Failed to send friend request')
    }
  }

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId: requestId })
      })
      
      if (response.ok) {
        // Remove from requests and reload friends
        setFriendRequests(prev => prev.filter(r => r.id !== requestId))
        if (activeTab === 'friends') {
          loadFriends()
        }
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error)
    }
  }

  const declineFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId: requestId })
      })
      
      if (response.ok) {
        setFriendRequests(prev => prev.filter(r => r.id !== requestId))
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error)
    }
  }

  const handleQRScan = async (data: string) => {
    try {
      // Extract user ID from QR code URL
      const url = new URL(data)
      const userId = url.searchParams.get('user')
      
      if (userId && userId !== user?.id) {
        await sendFriendRequest(userId)
        alert('Friend request sent!')
      } else {
        alert('Invalid QR code or you cannot add yourself')
      }
    } catch (error) {
      console.error('Failed to process QR code:', error)
      alert('Invalid QR code')
    }
    setShowQRScanner(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Friends</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQRGenerator(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg"
              title="My QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowQRScanner(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
              title="Scan QR Code"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'friends', label: 'Friends', icon: Users, count: friends.length },
            { id: 'requests', label: 'Requests', icon: Bell, count: friendRequests.length },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'discover', label: 'Discover', icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <div className="relative mb-4">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchUsers(e.target.value)
                }}
                placeholder="Search for friends by name or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {loading && searchQuery.length >= 2 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map(user => (
                  <div key={user.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{user.displayName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      
                      {user.friendshipStatus === 'none' ? (
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      ) : user.friendshipStatus === 'pending' ? (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                          Pending
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                          <UserCheck className="w-4 h-4" />
                          <span>Friends</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No users found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Search for friends</p>
                <p className="text-sm">Enter at least 2 characters</p>
              </div>
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading friends...</p>
              </div>
            ) : friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map(friendship => (
                  <div key={friendship.friendshipId} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {friendship.friend.profileImage ? (
                          <img src={friendship.friend.profileImage} alt={friendship.friend.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{friendship.friend.displayName}</h3>
                        <p className="text-sm text-gray-600">
                          Friends since {new Date(friendship.friendsSince).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No friends yet</p>
                <p className="text-sm">Search for friends or share your QR code</p>
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : friendRequests.length > 0 ? (
              <div className="space-y-3">
                {friendRequests.map(request => (
                  <div key={request.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {request.requester.profileImage ? (
                            <img src={request.requester.profileImage} alt={request.requester.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{request.requester.displayName}</h3>
                          <p className="text-sm text-gray-600">
                            Sent {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptFriendRequest(request.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineFriendRequest(request.id)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded-lg text-sm"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No friend requests</p>
                <p className="text-sm">New requests will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            <FriendRecommendations limit={10} showTitle={false} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showQRGenerator && (
        <QRCodeGenerator onClose={() => setShowQRGenerator(false)} />
      )}
      
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  )
}