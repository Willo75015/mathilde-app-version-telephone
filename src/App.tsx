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
import { useApp } from '@/contexts/AppContext'
import OfflineIndicator from '@/components/PWA/OfflineIndicator'
import InstallPrompt from '@/components/PWA/InstallPrompt'
import EventSyncNotification from '@/components/ui/EventSyncNotification'
import './App.css'

const App: React.FC = () => {
  const { state } = useApp()
  const [currentPage, setCurrentPage] = useState('home')
  const [pageParams, setPageParams] = useState<Record<string, any>>({})

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