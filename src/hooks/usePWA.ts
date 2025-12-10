import { useState, useEffect, useCallback } from 'react'
import { SyncTask } from '@/types'

// Hook pour gérer l'installation PWA
export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  
  useEffect(() => {
    // Détecter si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
    
    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    
    // Écouter l'installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false
    
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Install failed:', error)
      return false
    }
  }, [deferredPrompt])
  
  return {
    isInstallable,
    isInstalled,
    installApp
  }
}

// Alias pour compatibilité
export const usePWA = usePWAInstall

// Hook pour détecter le statut de connexion
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}

// Hook pour la synchronisation en arrière-plan
export const useBackgroundSync = () => {
  const [pendingSync, setPendingSync] = useState<SyncTask[]>([])
  
  const addSyncTask = useCallback(async (task: Omit<SyncTask, 'id' | 'timestamp' | 'retries'>) => {
    const syncTask: SyncTask = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      retries: 0,
      maxRetries: 3
    }
    
    // Stocker dans IndexedDB
    await storeSyncTask(syncTask)
    setPendingSync(prev => [...prev, syncTask])
    
    // Programmer la synchronisation
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('background-sync')
    }
  }, [])
  
  const clearSyncTasks = useCallback(() => {
    setPendingSync([])
  }, [])
  
  useEffect(() => {
    // Charger les tâches en attente au démarrage
    loadPendingSyncTasks().then(setPendingSync)
  }, [])
  
  return {
    pendingSync,
    addSyncTask,
    clearSyncTasks
  }
}

// Utilitaires pour IndexedDB
async function storeSyncTask(task: SyncTask): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('mathilde-sync', 1)
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id' })
      }
    }
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pending'], 'readwrite')
      const store = transaction.objectStore('pending')
      store.add(task)
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }
    
    request.onerror = () => reject(request.error)
  })
}

async function loadPendingSyncTasks(): Promise<SyncTask[]> {
  return new Promise((resolve) => {
    const request = indexedDB.open('mathilde-sync', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pending'], 'readonly')
      const store = transaction.objectStore('pending')
      const getAll = store.getAll()
      
      getAll.onsuccess = () => resolve(getAll.result)
    }
    
    request.onerror = () => resolve([])
  })
}

// Hook pour les notifications push
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])
  
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      
      if (sub) {
        setIsSubscribed(true)
        setSubscription(sub)
      }
    } catch (error) {
      console.error('Check subscription failed:', error)
    }
  }
  
  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
      })
      
      setIsSubscribed(true)
      setSubscription(sub)
      
      // Envoyer la subscription au serveur
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      })
      
      return true
    } catch (error) {
      console.error('Push subscription failed:', error)
      return false
    }
  }
  
  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        setIsSubscribed(false)
        setSubscription(null)
        
        // Informer le serveur
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      }
      
      return true
    } catch (error) {
      console.error('Push unsubscribe failed:', error)
      return false
    }
  }
  
  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe
  }
}