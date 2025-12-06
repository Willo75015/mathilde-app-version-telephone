/**
 * 🧪 TESTS UNITAIRES - Hook usePWA
 * Tests pour les hooks PWA (installation, statut en ligne, sync)
 */

import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { usePWAInstall, useOnlineStatus, useBackgroundSync } from '@/hooks/usePWA'

// Mock de l'IndexedDB
const mockIndexedDB = {
  open: vi.fn().mockReturnValue({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          add: vi.fn(),
          getAll: vi.fn().mockReturnValue({ onsuccess: null, result: [] }),
          delete: vi.fn()
        }),
        oncomplete: null,
        onerror: null
      }),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(false)
      },
      createObjectStore: vi.fn()
    }
  })
}

Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB
})

describe('usePWAInstall Hook', () => {
  let mockDeferredPrompt: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock du prompt d'installation
    mockDeferredPrompt = {
      prompt: vi.fn().mockResolvedValue(),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    }
    
    // Mock de matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })
    })
    
    // Mock des event listeners
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('devrait initialiser avec les bonnes valeurs par défaut', () => {
    const { result } = renderHook(() => usePWAInstall())
    
    expect(result.current.isInstallable).toBe(false)
    expect(result.current.isInstalled).toBe(false)
    expect(typeof result.current.installApp).toBe('function')
  })

  test('devrait détecter si l\'app est déjà installée', () => {
    // Mock pour simuler une app installée
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockReturnValue({ matches: true })
    })
    
    const { result } = renderHook(() => usePWAInstall())
    
    expect(result.current.isInstalled).toBe(true)
  })

  test('devrait gérer l\'événement beforeinstallprompt', () => {
    const { result } = renderHook(() => usePWAInstall())
    
    expect(window.addEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    )
    
    // Simuler l'événement beforeinstallprompt
    act(() => {
      const event = new Event('beforeinstallprompt')
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })
      
      const handler = vi.mocked(window.addEventListener).mock.calls
        .find(call => call[0] === 'beforeinstallprompt')?.[1]
      
      if (handler && typeof handler === 'function') {
        handler(event)
      }
    })
    
    expect(result.current.isInstallable).toBe(true)
  })

  test('devrait installer l\'application avec succès', async () => {
    const { result } = renderHook(() => usePWAInstall())
    
    // Simuler un prompt disponible
    act(() => {
      // @ts-ignore
      result.current._setDeferredPrompt?.(mockDeferredPrompt)
    })
    
    let installResult: boolean | undefined
    
    await act(async () => {
      installResult = await result.current.installApp()
    })
    
    expect(mockDeferredPrompt.prompt).toHaveBeenCalled()
    expect(installResult).toBe(true)
  })

  test('devrait nettoyer les event listeners au démontage', () => {
    const { unmount } = renderHook(() => usePWAInstall())
    
    unmount()
    
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    )
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    )
  })
})

describe('useOnlineStatus Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
    
    // Mock de navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('devrait retourner le statut en ligne initial', () => {
    const { result } = renderHook(() => useOnlineStatus())
    
    expect(result.current).toBe(true)
  })

  test('devrait écouter les changements de statut en ligne', () => {
    renderHook(() => useOnlineStatus())
    
    expect(window.addEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    )
    expect(window.addEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    )
  })

  test('devrait mettre à jour le statut lors des événements online/offline', () => {
    const { result } = renderHook(() => useOnlineStatus())
    
    expect(result.current).toBe(true)
    
    // Simuler passage hors ligne
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false })
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)
    })
    
    expect(result.current).toBe(false)
    
    // Simuler retour en ligne
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true })
      const onlineEvent = new Event('online')
      window.dispatchEvent(onlineEvent)
    })
    
    expect(result.current).toBe(true)
  })

  test('devrait nettoyer les event listeners', () => {
    const { unmount } = renderHook(() => useOnlineStatus())
    
    unmount()
    
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    )
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    )
  })
})

describe('useBackgroundSync Hook', () => {
  const mockServiceWorkerRegistration = {
    sync: {
      register: vi.fn().mockResolvedValue(undefined)
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock de crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn().mockReturnValue('mock-uuid-123')
      }
    })
    
    // Mock de serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve(mockServiceWorkerRegistration)
      }
    })
    
    // Mock d'IndexedDB success callback
    mockIndexedDB.open.mockReturnValue({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue({
            add: vi.fn(),
            getAll: vi.fn().mockReturnValue({ 
              onsuccess: null,
              result: []
            })
          }),
          oncomplete: null
        })
      }
    })
  })

  test('devrait initialiser avec des tâches vides', () => {
    const { result } = renderHook(() => useBackgroundSync())
    
    expect(result.current.pendingSync).toEqual([])
    expect(typeof result.current.addSyncTask).toBe('function')
    expect(typeof result.current.clearSyncTasks).toBe('function')
  })

  test('devrait ajouter une tâche de synchronisation', async () => {
    const { result } = renderHook(() => useBackgroundSync())
    
    const taskData = {
      type: 'create-event',
      data: { title: 'Test Event' },
      maxRetries: 3
    }
    
    await act(async () => {
      await result.current.addSyncTask(taskData)
    })
    
    expect(result.current.pendingSync).toHaveLength(1)
    expect(result.current.pendingSync[0]).toMatchObject({
      id: 'mock-uuid-123',
      type: 'create-event',
      data: { title: 'Test Event' },
      maxRetries: 3,
      retries: 0,
      timestamp: expect.any(Date)
    })
  })

  test('devrait enregistrer la synchronisation background', async () => {
    const { result } = renderHook(() => useBackgroundSync())
    
    const taskData = {
      type: 'create-event',
      data: { title: 'Test Event' },
      maxRetries: 3
    }
    
    await act(async () => {
      await result.current.addSyncTask(taskData)
    })
    
    expect(mockServiceWorkerRegistration.sync.register).toHaveBeenCalledWith(
      'background-sync'
    )
  })

  test('devrait nettoyer les tâches de synchronisation', () => {
    const { result } = renderHook(() => useBackgroundSync())
    
    act(() => {
      result.current.clearSyncTasks()
    })
    
    expect(result.current.pendingSync).toEqual([])
  })

  test('devrait gérer l\'absence de support pour background sync', async () => {
    // Mock sans support de background sync
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          // Pas de propriété sync
        })
      }
    })
    
    const { result } = renderHook(() => useBackgroundSync())
    
    const taskData = {
      type: 'create-event',
      data: { title: 'Test Event' },
      maxRetries: 3
    }
    
    // Ne devrait pas lever d'erreur
    await act(async () => {
      await result.current.addSyncTask(taskData)
    })
    
    expect(result.current.pendingSync).toHaveLength(1)
  })
})
