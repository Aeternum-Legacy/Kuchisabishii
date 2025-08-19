/**
 * OAuth Performance Tests
 * Tests for requestIdleCallback violation fixes and OAuth optimization
 */

import { oauthPerformanceMonitor, deferOAuthOperation } from '@/utils/oauthPerformanceMonitor'

// Mock requestIdleCallback for testing
const mockRequestIdleCallback = jest.fn()
const mockPerformanceNow = jest.fn()

beforeAll(() => {
  // Mock window.requestIdleCallback
  Object.defineProperty(window, 'requestIdleCallback', {
    value: mockRequestIdleCallback,
    writable: true
  })

  // Mock performance.now
  Object.defineProperty(window, 'performance', {
    value: { now: mockPerformanceNow },
    writable: true
  })
})

beforeEach(() => {
  jest.clearAllMocks()
  mockPerformanceNow.mockReturnValue(0)
  oauthPerformanceMonitor.clearMetrics()
})

describe('OAuth Performance Monitor', () => {
  test('should detect requestIdleCallback violations', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    
    // Mock a violation scenario
    mockPerformanceNow
      .mockReturnValueOnce(0)    // Start time
      .mockReturnValueOnce(100)  // End time (100ms duration > 50ms threshold)

    oauthPerformanceMonitor.startMonitoring('google-oauth')
    oauthPerformanceMonitor.endMonitoring('google-oauth')

    const summary = oauthPerformanceMonitor.getPerformanceSummary()
    
    expect(summary.totalViolations).toBe(1)
    expect(summary.operations[0].metrics.violationDetected).toBe(true)
    expect(summary.operations[0].metrics.duration).toBe(100)

    consoleSpy.mockRestore()
  })

  test('should not flag operations under threshold', () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)   // Start time
      .mockReturnValueOnce(30)  // End time (30ms duration < 50ms threshold)

    oauthPerformanceMonitor.startMonitoring('fast-oauth')
    oauthPerformanceMonitor.endMonitoring('fast-oauth')

    const summary = oauthPerformanceMonitor.getPerformanceSummary()
    
    expect(summary.totalViolations).toBe(0)
    expect(summary.operations[0].metrics.violationDetected).toBe(false)
  })

  test('should handle missing operation gracefully', () => {
    const result = oauthPerformanceMonitor.endMonitoring('non-existent')
    expect(result).toBeNull()
  })
})

describe('deferOAuthOperation', () => {
  test('should execute operation immediately when priority is immediate', async () => {
    const mockOperation = jest.fn().mockResolvedValue('result')
    
    const result = await deferOAuthOperation(mockOperation, 'immediate')
    
    expect(mockOperation).toHaveBeenCalledTimes(1)
    expect(result).toBe('result')
  })

  test('should defer operation with requestIdleCallback when priority is idle', async () => {
    const mockOperation = jest.fn().mockResolvedValue('deferred-result')
    
    // Mock requestIdleCallback to call the callback immediately
    mockRequestIdleCallback.mockImplementation((callback) => {
      callback()
    })

    const result = await deferOAuthOperation(mockOperation, 'idle')
    
    expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1)
    expect(mockOperation).toHaveBeenCalledTimes(1)
    expect(result).toBe('deferred-result')
  })

  test('should fallback to setTimeout when requestIdleCallback is not available', async () => {
    const originalRequestIdleCallback = window.requestIdleCallback
    delete (window as any).requestIdleCallback

    const mockOperation = jest.fn().mockResolvedValue('fallback-result')
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback()
      return 0 as any
    })

    const result = await deferOAuthOperation(mockOperation, 'idle')
    
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0)
    expect(mockOperation).toHaveBeenCalledTimes(1)
    expect(result).toBe('fallback-result')

    setTimeoutSpy.mockRestore()
    window.requestIdleCallback = originalRequestIdleCallback
  })

  test('should handle operation errors', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'))
    
    await expect(deferOAuthOperation(mockOperation, 'immediate')).rejects.toThrow('Operation failed')
    expect(mockOperation).toHaveBeenCalledTimes(1)
  })
})

describe('Performance Optimization Integration', () => {
  test('should properly monitor OAuth button clicks', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    
    // Simulate a slow OAuth button click
    mockPerformanceNow
      .mockReturnValueOnce(0)    // Start
      .mockReturnValueOnce(75)   // End (75ms > 50ms threshold)

    oauthPerformanceMonitor.startMonitoring('google-button-click')
    
    // Simulate some OAuth processing time
    const metrics = oauthPerformanceMonitor.endMonitoring('google-button-click')
    
    expect(metrics).not.toBeNull()
    expect(metrics?.violationDetected).toBe(true)
    expect(metrics?.duration).toBe(75)

    consoleSpy.mockRestore()
  })

  test('should track multiple OAuth operations', () => {
    mockPerformanceNow
      .mockReturnValueOnce(0).mockReturnValueOnce(25)    // Fast operation
      .mockReturnValueOnce(100).mockReturnValueOnce(180)  // Slow operation

    oauthPerformanceMonitor.startMonitoring('oauth-init')
    oauthPerformanceMonitor.endMonitoring('oauth-init')
    
    oauthPerformanceMonitor.startMonitoring('oauth-callback')
    oauthPerformanceMonitor.endMonitoring('oauth-callback')

    const summary = oauthPerformanceMonitor.getPerformanceSummary()
    
    expect(summary.operations).toHaveLength(2)
    expect(summary.totalViolations).toBe(1) // Only the slow operation
    expect(summary.operations[0].metrics.violationDetected).toBe(false)
    expect(summary.operations[1].metrics.violationDetected).toBe(true)
  })
})

describe('OAuth Performance Best Practices', () => {
  test('should demonstrate proper OAuth operation deferral', async () => {
    const heavyOperation = jest.fn().mockImplementation(() => {
      // Simulate heavy computation
      return new Promise(resolve => setTimeout(() => resolve('heavy-result'), 10))
    })

    const lightOperation = jest.fn().mockResolvedValue('light-result')

    // Execute light operation immediately
    const lightResult = await deferOAuthOperation(lightOperation, 'immediate')
    
    // Defer heavy operation
    const heavyResult = await deferOAuthOperation(heavyOperation, 'idle')

    expect(lightResult).toBe('light-result')
    expect(heavyResult).toBe('heavy-result')
    expect(lightOperation).toHaveBeenCalledTimes(1)
    expect(heavyOperation).toHaveBeenCalledTimes(1)
  })

  test('should validate performance monitoring does not impact OAuth flow', () => {
    // Performance monitoring should be lightweight
    const startTime = Date.now()
    
    for (let i = 0; i < 100; i++) {
      oauthPerformanceMonitor.startMonitoring(`test-operation-${i}`)
      oauthPerformanceMonitor.endMonitoring(`test-operation-${i}`)
    }
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Monitoring 100 operations should take less than 50ms
    expect(duration).toBeLessThan(50)
  })
})