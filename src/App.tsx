import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import EventsPage from '@/pages/Events/EventsPage'
import ClientsPage from '@/pages/Clients/ClientsPage'
import CreateClient from '@/pages/Clients/CreateClient'
import EditClient from '@/pages/Clients/EditClient'
import ClientProfile from '@/pages/Clients/ClientProfile'
import FleuristePage from '@/pages/Fleuriste'
import CalendarPage from '@/pages/Calendar'
import AnalyticsPage from '@/pages/Analytics/AnalyticsPage'
import SettingsPage from '@/pages/Settings/SettingsPage'
import { useApp } from '@/contexts/AppContext'
import OfflineIndicator from '@/components/PWA/OfflineIndicator'
import InstallPrompt from '@/components/PWA/InstallPrompt'
import EventSyncNotification from '@/components/ui/EventSyncNotification'

// Auth
import { useAuth } from '@/hooks/useAuth'
import LoginPage from '@/pages/Auth/LoginPage'
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage'
import { isSupabaseEnabled } from '@/lib/supabase'

import './App.css'

const App: React.FC = () => {
  const { state } = useApp()
  const auth = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [pageParams, setPageParams] = useState<Record<string, any>>({})

  // Détecter si on est sur la page de reset password (via URL)
  const isResetPasswordPage = window.location.pathname === '/reset-password' ||
                               window.location.hash.includes('type=recovery')

  // Gestion de la navigation
  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      setCurrentPage(e.detail.page)
      setPageParams(e.detail || {})
    }

    window.addEventListener('navigate', handleNavigation as EventListener)
    return () => window.removeEventListener('navigate', handleNavigation as EventListener)
  }, [])

  // Fonction de navigation
  const navigate = (page: string, params?: any) => {
    setCurrentPage(page)
    setPageParams(params || {})
  }

  // Écran de chargement pendant la vérification de l'auth
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Page de réinitialisation du mot de passe
  if (isResetPasswordPage && isSupabaseEnabled()) {
    return (
      <ResetPasswordPage
        onUpdatePassword={auth.updatePassword}
        onBackToLogin={() => {
          window.location.href = '/'
        }}
      />
    )
  }

  // Si Supabase est activé et utilisateur non connecté → Page de connexion
  if (isSupabaseEnabled() && !auth.isAuthenticated) {
    return (
      <LoginPage
        onLogin={auth.signIn}
        onForgotPassword={auth.resetPassword}
      />
    )
  }

  // Rendu de la page courante
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigate={navigate} />
      case 'events':
        return <EventsPage navigate={navigate} />
      case 'events/create':
        return <EventsPage navigate={navigate} />
      case 'events/edit':
        return <EventsPage navigate={navigate} />
      case 'events/details':
        return <EventsPage navigate={navigate} />
      case 'clients':
        return <ClientsPage navigate={navigate} />
      case 'clients/create':
        return <CreateClient navigate={navigate} />
      case 'clients/edit':
        return <EditClient navigate={navigate} clientId={pageParams.clientId} />
      case 'clients/profile':
        return <ClientProfile navigate={navigate} clientId={pageParams.clientId} />
      case 'fleuriste':
        return <FleuristePage navigate={navigate} />
      case 'calendar':
        return <CalendarPage navigate={navigate} />
      case 'analytics':
        return <AnalyticsPage navigate={navigate} />
      case 'settings':
        return <SettingsPage navigate={navigate} onSignOut={auth.signOut} />
      default:
        return <Home navigate={navigate} />
    }
  }

  return (
    <div className="App">
      <OfflineIndicator />
      <InstallPrompt />
      <EventSyncNotification />

      <Layout navigate={navigate} currentPage={currentPage}>
        {renderCurrentPage()}
      </Layout>

      {state.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <strong className="font-bold">Erreur: </strong>
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}
    </div>
  )
}

export default App
