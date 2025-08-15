'use client'

import { useState } from 'react'

export default function TestOAuthPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const testGoogleOAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/social/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const data = await response.json()
      setResult({ status: response.status, data })
      
      if (response.ok && data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }
  
  const testGoogleOAuthGET = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/social/google', {
        method: 'GET'
      })
      
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OAuth Debug Page</h1>
        
        <div className="space-y-4">
          <button
            onClick={testGoogleOAuth}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Google OAuth POST'}
          </button>
          
          <button
            onClick={testGoogleOAuthGET}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Google OAuth GET'}
          </button>
        </div>
        
        {result && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Result:</h2>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-bold mb-2">Environment Info:</h3>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p>Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}