/**
 * 🧪 TESTS UNITAIRES - Hook usePerformance
 * Tests pour le hook de monitoring des performances
 */

import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { usePerformance, useDebounce, useThrottle, useViewport } from '@/hooks/usePerformance'

// Mock de performance.now()
const mockPerformanceNow = vi.fn()
Object.defineProperty(window, 'performance', {
  value: { now: mockPerformanceNow }
})

describe('usePerformance Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPerformanceNow.mockReturnValue(1000) // Temps de base
  })

  test('devrait initialiser avec des métriques vides', () => {
    const { result } = renderHook(() => usePerformance())
    
    expect(result.current.metrics).toEqual([])
  })

  test('devrait mesurer une fonction synchrone', () => {
    mockPerformanceNow
      .mockReturnValueOnce(1000) // Début
      .mockReturnValueOnce(1050) // Fin
    
    const { result } = renderHook(() => usePerformance())
    
    const testFunction = (x: number, y: number) => x + y
    const measuredFunction = result.current.measureFunction(testFunction, 'addition')
    
    act(() => {
      const result = measuredFunction(2, 3)
      expect(result).toBe(5)
    })
    
    expect(result.current.metrics).toHaveLength(1)
    expect(result.current.metrics[0]).toMatchObject({
      name: 'addition',
      value: 50,
      timestamp: expect.any(Date)
    })
  })

  test('devrait mesurer une fonction asynchrone', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(1000) // Début
      .mockReturnValueOnce(1100) // Fin
    
    const { result } = renderHook(() => usePerformance())
    
    const asyncFunction = async (delay: number) => {
      await new Promise(resolve => setTimeout(resolve, delay))
      return 'completed'
    }
    
    const measuredFunction = result.current.measureAsyncFunction(asyncFunction, 'async-task')
    
    await act(async () => {
      const res = await measuredFunction(10)
      expect(res).toBe('completed')
    })
    
    expect(result.current.metrics).toHaveLength(1)
    expect(result.current.metrics[0]).toMatchObject({
      name: 'async-task',
      value: 100
    })
  })

  test('devrait nettoyer les métriques', () => {
    const { result } = renderHook(() => usePerformance())
    
    // Ajouter une métrique
    const testFunction = () => 'test'
    const measuredFunction = result.current.measureFunction(testFunction, 'test')
    
    act(() => {
      measuredFunction()
    })
    
    expect(result.current.metrics).toHaveLength(1)
    
    // Nettoyer
    act(() => {
      result.current.clearMetrics()
    })
    
    expect(result.current.metrics).toHaveLength(0)
  })
})

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('devrait debouncer une valeur', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )
    
    expect(result.current).toBe('initial')
    
    // Changer la valeur
    rerender({ value: 'updated', delay: 500 })
    
    // La valeur ne devrait pas encore changer
    expect(result.current).toBe('initial')
    
    // Avancer le temps
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    // Maintenant la valeur devrait être mise à jour
    expect(result.current).toBe('updated')
  })

  test('devrait annuler le debounce précédent', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )
    
    rerender({ value: 'first', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(250)
    })
    
    rerender({ value: 'second', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    // Seule la dernière valeur devrait être appliquée
    expect(result.current).toBe('second')
  })
})

describe('useThrottle Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Date, 'now')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('devrait throttler une fonction', () => {
    const mockCallback = vi.fn()
    let currentTime = 0
    
    vi.mocked(Date.now).mockImplementation(() => currentTime)
    
    const { result } = renderHook(() => useThrottle(mockCallback, 1000))
    
    // Premier appel - devrait passer
    act(() => {
      result.current('arg1')
    })
    expect(mockCallback).toHaveBeenCalledWith('arg1')
    expect(mockCallback).toHaveBeenCalledTimes(1)
    
    // Deuxième appel immédiat - devrait être throttlé
    currentTime = 500
    act(() => {
      result.current('arg2')
    })
    expect(mockCallback).toHaveBeenCalledTimes(1)
    
    // Après le délai - devrait passer
    currentTime = 1100
    act(() => {
      result.current('arg3')
    })
    expect(mockCallback).toHaveBeenCalledWith('arg3')
    expect(mockCallback).toHaveBeenCalledTimes(2)
  })
})

describe('useViewport Hook', () => {
  beforeEach(() => {
    // Mock de window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768
    })
    
    // Mock des event listeners
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('devrait retourner les dimensions initiales', () => {
    const { result } = renderHook(() => useViewport())
    
    expect(result.current).toEqual({
      width: 1024,
      height: 768
    })
  })

  test('devrait écouter les changements de taille', () => {
    const { unmount } = renderHook(() => useViewport())
    
    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )
    
    unmount()
    
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )
  })

  test('devrait mettre à jour les dimensions lors du resize', () => {
    const { result } = renderHook(() => useViewport())
    
    expect(result.current.width).toBe(1024)
    
    // Simuler un changement de taille
    act(() => {
      window.innerWidth = 800
      window.innerHeight = 600
      
      // Déclencher l'événement resize
      const resizeEvent = new Event('resize')
      window.dispatchEvent(resizeEvent)
    })
    
    expect(result.current).toEqual({
      width: 800,
      height: 600
    })
  })
})
