'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function DebugOAuthPage() {
  const { user, loading, error } = useAuth()
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown>[] | null>(null)
  const [authFlow, setAuthFlow] = useState<Record<string, unknown>[]>([])
  const [cookies, setCookies] = useState<Record<string, string>>({})
  
  useEffect(() => {
    // Check cookies on page load
    const allCookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [name, value] = cookie.trim().split('=')
      acc[name] = value
      return acc
    }, {})
    setCookies(allCookies)
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get('auth')
    const errorParam = urlParams.get('error')
    
    if (authStatus || errorParam) {
      setAuthFlow(prev => [...prev, {
        step: 'URL_REDIRECT',
        status: authStatus || 'error',
        error: errorParam,
        timestamp: new Date().toISOString()
      }])
    }
  }, [])
  
  const runDiagnostics = async () => {
    const results = []
    
    // 1. Test OAuth URL generation
    try {
      const response = await fetch('/api/auth/social/google?action=signin')
      const data = await response.json()
      results.push({
        test: 'OAuth URL Generation',
        status: response.ok ? 'PASS' : 'FAIL',
        data: data,
        details: response.ok ? 'OAuth URL generated successfully' : `Error: ${data.error}`
      })
    } catch (error) {
      results.push({
        test: 'OAuth URL Generation',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // 2. Test session endpoint
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      results.push({
        test: 'Session Check',
        status: response.ok ? 'PASS' : 'FAIL',
        data: data,
        details: response.ok ? 'Session endpoint accessible' : `Error: ${data.error}`
      })
    } catch (error) {
      results.push({
        test: 'Session Check',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // 3. Test Supabase connection
    try {
      const response = await fetch('/api/auth/test-supabase')
      const data = await response.json()
      results.push({
        test: 'Supabase Connection',
        status: response.ok ? 'PASS' : 'FAIL',
        data: data
      })
    } catch (error) {
      results.push({
        test: 'Supabase Connection',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // 4. Check useAuth hook state
    results.push({
      test: 'useAuth Hook State',
      status: user ? 'AUTHENTICATED' : (loading ? 'LOADING' : 'NOT_AUTHENTICATED'),
      data: {
        user: user ? { id: user.id, email: user.email } : null,
        loading,
        error
      }
    })
    
    setDiagnostics(results)
  }
  
  const testGoogleOAuth = async () => {
    setAuthFlow([])
    setAuthFlow(prev => [...prev, {
      step: 'OAUTH_INITIATION',
      status: 'starting',
      timestamp: new Date().toISOString()
    }])
    
    try {
      const response = await fetch('/api/auth/social/google?action=signin')
      const data = await response.json()
      
      setAuthFlow(prev => [...prev, {
        step: 'OAUTH_URL_GENERATED',
        status: 'success',
        url: data.url,
        timestamp: new Date().toISOString()
      }])
      
      // Redirect to Google
      window.location.href = data.url
    } catch (error) {
      setAuthFlow(prev => [...prev, {
        step: 'OAUTH_URL_GENERATION',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }])
    }
  }

  const checkExistingSession = async () => {
    try {
      const response = await fetch('/api/auth/check-session')
      const data = await response.json()
      
      if (data.authenticated) {
        alert(`You are already authenticated as ${data.user.email}! Redirecting to ${data.redirectTo}`)
        window.location.href = data.redirectTo
      } else {
        alert(`No valid session found. You need to sign in.`)
      }
    } catch (error) {
      alert(`Error checking session: ${error}`)
    }
  }
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 OAuth Flow Diagnostics</h1>
        
        {/* Current Auth State */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Current Authentication State</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <div className="font-medium">User</div>
              <div className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? `✅ ${user.email}` : `❌ Not authenticated`}
              </div>
            </div>
            <div className="p-4 border rounded">
              <div className="font-medium">Loading</div>
              <div className={loading ? 'text-yellow-600' : 'text-gray-600'}>
                {loading ? `⏳ Loading...` : `✅ Ready`}
              </div>
            </div>
            <div className="p-4 border rounded">
              <div className="font-medium">Error</div>
              <div className={error ? 'text-red-600' : 'text-green-600'}>
                {error || `✅ No errors`}
              </div>
            </div>
          </div>
        </div>
        
        {/* Cookies */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Browser Cookies</h2>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(cookies, null, 2)}
          </pre>
        </div>
        
        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Diagnostic Actions</h2>
          <div className="space-x-4">
            <button
              onClick={runDiagnostics}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Run System Diagnostics
            </button>
            <button
              onClick={testGoogleOAuth}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test Google OAuth Flow
            </button>
            <button
              onClick={checkExistingSession}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Check Existing Session
            </button>
          </div>
        </div>
        
        {/* OAuth Flow Tracking */}
        {authFlow.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">OAuth Flow Tracking</h2>
            <div className="space-y-2">
              {authFlow.map((step, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border-l-4 border-blue-400 bg-blue-50">
                  <span className="font-medium">{step.step}:</span>
                  <span className={step.status === 'success' ? 'text-green-600' : step.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}>
                    {step.status}
                  </span>
                  <span className="text-sm text-gray-500">{step.timestamp}</span>
                  {step.error && <span className="text-red-600">- {step.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Diagnostics Results */}
        {diagnostics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Diagnostic Results</h2>
            <div className="space-y-4">
              {diagnostics.map((result: Record<string, unknown>, index: number) => (
                <div key={index} className="border p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.status === 'PASS' ? 'bg-green-100 text-green-800' :
                      result.status === 'AUTHENTICATED' ? 'bg-green-100 text-green-800' :
                      result.status === 'LOADING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  {result.details && <p className="text-sm text-gray-600 mb-2">{result.details}</p>}
                  {result.data && (
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                  {result.error && (
                    <p className="text-sm text-red-600 mt-2">Error: {result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="bg-yellow-50 p-6 rounded-lg shadow mt-6">
          <h2 className="text-lg font-bold mb-2">📋 Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>First, click &quot;Run System Diagnostics&quot; to check all endpoints</li>
            <li>Then click &quot;Test Google OAuth Flow&quot; to start authentication</li>
            <li>After OAuth completes, return to this page to see results</li>
            <li>Check the &quot;Current Authentication State&quot; to see if login worked</li>
          </ol>
        </div>
      </div>
    </div>
  )
}