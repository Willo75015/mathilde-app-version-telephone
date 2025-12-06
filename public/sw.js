const CACHE_NAME = 'mathilde-fleurs-v1.0.0'
const STATIC_CACHE = 'static-v1.0.0'
const DYNAMIC_CACHE = 'dynamic-v1.0.0'
const API_CACHE = 'api-v1.0.0'

// Ressources critiques à mettre en cache (PRODUCTION SEULEMENT)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
]

// URLs à exclure du cache en développement
const DEV_EXCLUDES = [
  '/@vite/',
  '/src/',
  '/@react-refresh',
  '/node_modules/',
  '/__vite_ping',
  '/vite.svg'
]

// Détection de l'environnement
const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

// Fonction pour vérifier si une URL doit être ignorée
function shouldIgnoreURL(url) {
  if (isDev) {
    // En développement, ignorer les ressources Vite
    return DEV_EXCLUDES.some(exclude => url.includes(exclude))
  }
  return false
}

// Installation du service worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...')
  
  if (isDev) {
    console.log('🛠️ Development mode: Skipping cache installation')
    return self.skipWaiting()
  }
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ Service Worker: Cache installation failed:', error)
      })
  )
})

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Service Worker: Activated')
      return self.clients.claim()
    })
  )
})

// Interception des requêtes fetch
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorer les URLs de développement
  if (shouldIgnoreURL(request.url)) {
    console.log('⏭️ Service Worker: Ignoring dev URL:', request.url)
    return // Laisser passer sans interception
  }
  
  // En développement, ne pas mettre en cache
  if (isDev) {
    return // Laisser le réseau gérer toutes les requêtes
  }
  
  // Stratégie Cache First pour les assets statiques (PRODUCTION)
  if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
      request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'style') {
    
    event.respondWith(cacheFirstStrategy(request))
    return
  }
  
  // Stratégie Network First pour les APIs (PRODUCTION)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request))
    return
  }
  
  // Stratégie Stale While Revalidate pour le reste (PRODUCTION)
  event.respondWith(staleWhileRevalidateStrategy(request))
})

// Stratégies de cache (uniquement en production)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Cache First Strategy failed:', error)
    return new Response('Offline - Content not available', { status: 503 })
  }
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🔄 Network failed, trying cache for:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(JSON.stringify({
      error: 'Offline - API not available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => null)
  
  return cachedResponse || await networkResponsePromise || 
    new Response('Offline - Content not available', { status: 503 })
}

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background Sync: Processing...')
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  try {
    // En développement, ne pas synchroniser
    if (isDev) {
      console.log('🛠️ Development mode: Skipping background sync')
      return
    }
    
    // Logique de synchronisation pour production
    console.log('✅ Background sync completed')
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

// Gestion des notifications push
self.addEventListener('push', event => {
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/action-dismiss.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

// Message de confirmation
console.log('🌸 Mathilde Fleurs Service Worker loaded successfully')
if (isDev) {
  console.log('🛠️ Running in development mode - caching disabled')
} else {
  console.log('🚀 Running in production mode - caching enabled')
}