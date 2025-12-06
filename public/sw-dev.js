// ⚡ MATHILDE FLEURS SERVICE WORKER - DÉVELOPPEMENT OPTIMISÉ
// Version de développement sans auto-refresh

console.log('🔧 SW Dev: Service Worker en mode développement')

// Éviter l'auto-activation qui cause les rafraîchissements
self.addEventListener('install', event => {
  console.log('📦 SW Dev: Installing (sans skipWaiting)')
  // PAS de self.skipWaiting() en dev !
})

self.addEventListener('activate', event => {
  console.log('✅ SW Dev: Activating (sans clientsClaim)')
  // PAS de self.clients.claim() en dev !
})

// Stratégie simple pour le dev : passer toutes les requêtes
self.addEventListener('fetch', event => {
  // Laisser passer toutes les requêtes en mode dev
  return
})

console.log('🚀 SW Dev: Configuré pour éviter les rafraîchissements')
