import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppProvider } from './contexts/AppContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { TimeProvider } from './contexts/TimeContext'
import { GlobalNotificationProvider } from './contexts/GlobalNotificationContext'
import ErrorBoundary from './components/analytics/ErrorBoundary'
import './styles/globals.css'
import './styles/mobile-fixes.css'
import './styles/modal-fixes.css'

// Configuration React optimisée pour éviter les re-renders
// React.StrictMode DÉFINITIVEMENT DÉSACTIVÉ pour éviter les double-renders
console.log('🚀 Mathilde Fleurs - Initialisation...')

// Mode développement détecté
if (import.meta.env.DEV) {
  console.log('🔧 Mode développement détecté - Optimisations actives')
  // 🚫 DÉSACTIVÉ TEMPORAIREMENT - CAUSE DES BOUCLES
  // import('@/lib/storage-test').then(() => {
  //   console.log('🛠️ StorageTestUtils chargés')
  // })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <ThemeProvider>
      <TimeProvider>
        <GlobalNotificationProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </GlobalNotificationProvider>
      </TimeProvider>
    </ThemeProvider>
  </ErrorBoundary>
)

console.log('✅ Application initialisée avec succès!')
