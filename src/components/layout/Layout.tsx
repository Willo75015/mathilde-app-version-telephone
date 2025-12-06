import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User,
  Calendar, Users, Flower, BarChart3, Home, ShoppingBag
} from 'lucide-react'
import { clsx } from 'clsx'
import { Clock } from '@/components/ui/Clock'
import { useEventNavigation } from '@/hooks/useEventNavigation'
import { useEventTimeSync } from '@/hooks/useEventTimeSync'
import BottomNavigation from './BottomNavigation'

interface LayoutProps {
  children: React.ReactNode
  navigate?: (page: string, params?: any) => void
  currentPage?: string
}

// Hook simple pour viewport sans dépendance
const useSimpleViewport = () => {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { width }
}

const Layout: React.FC<LayoutProps> = ({ children, navigate, currentPage: propCurrentPage }) => {
  const [currentPage, setCurrentPage] = useState(propCurrentPage || 'home')
  const [isDark, setIsDark] = useState(false)
  const { width } = useSimpleViewport()
  const { navigateToEvent } = useEventNavigation()

  // Initialiser la synchronisation des événements
  useEventTimeSync()

  const isMobile = width < 768

  // Navigation items pour desktop
  const navigation = [
    { name: 'Accueil', href: '/', icon: Home, current: currentPage === 'home' },
    { name: 'Calendrier', href: '/calendar', icon: Calendar, current: currentPage === 'calendar' },
    { name: 'Événements', href: '/events', icon: Flower, current: currentPage === 'events' },
    { name: 'Fleuriste', href: '/fleuriste', icon: ShoppingBag, current: currentPage === 'fleuriste' },
    { name: 'Clients', href: '/clients', icon: Users, current: currentPage === 'clients' },
    { name: 'Statistiques', href: '/analytics', icon: BarChart3, current: currentPage === 'analytics' },
  ]

  const toggleTheme = () => setIsDark(!isDark)

  // Synchroniser avec la prop currentPage
  useEffect(() => {
    if (propCurrentPage) {
      setCurrentPage(propCurrentPage)
    }
  }, [propCurrentPage])

  // Écouter les changements de navigation
  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      setCurrentPage(e.detail.page)
    }

    window.addEventListener('navigate', handleNavigation as EventListener)
    return () => window.removeEventListener('navigate', handleNavigation as EventListener)
  }, [])

  // Handler de navigation pour la bottom nav
  const handleNavigate = (page: string) => {
    if (navigate) {
      navigate(page)
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }))
    }
  }

  return (
    <div className={clsx("min-h-screen bg-gray-50 transition-colors duration-300", isDark && "dark bg-gray-900")}>

      {/* Sidebar Desktop - Toujours visible sur desktop */}
      <aside className={clsx(
        "fixed top-0 left-0 bottom-0 z-50 w-60 bg-white dark:bg-gray-800",
        "border-r border-gray-200 dark:border-gray-700",
        "flex flex-col shadow-lg",
        "hidden md:flex"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Flower className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Mathilde Fleurs
            </span>
          </div>
        </div>

        {/* Navigation Desktop */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => handleNavigate(item.href === '/' ? 'home' : item.href.substring(1))}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left',
                item.current
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </motion.button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Mathilde Dupont
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                mathilde@fleurs.com
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={toggleTheme}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isDark ? '🌞 Clair' : '🌙 Sombre'}
            </button>

            <button
              onClick={() => navigate?.('settings')}
              className="px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
              title="Paramètres"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={clsx(
        "transition-all duration-300",
        "md:ml-60", // Marge pour la sidebar sur desktop
        "pb-20 md:pb-0" // Padding bottom pour la bottom nav sur mobile
      )}>
        {/* Top Bar - Simplifié sur mobile */}
        <header className={clsx(
          "sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg",
          "border-b border-gray-200 dark:border-gray-700",
          "safe-top"
        )}>
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Header - Logo centré */}
            {isMobile ? (
              <>
                <div className="w-10" /> {/* Spacer */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Flower className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Mathilde
                  </span>
                </div>
                <button
                  onClick={() => navigate?.('settings')}
                  className="w-10 h-10 flex items-center justify-center text-gray-500"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                {/* Desktop Header */}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tableau de bord
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gérez vos événements et clients
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock format="datetime" showIcon={true} />
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className={clsx(
          "flex-1",
          "p-3 md:p-6 lg:p-8" // Moins de padding sur mobile
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <BottomNavigation
          currentPage={currentPage}
          navigate={handleNavigate}
        />
      )}
    </div>
  )
}

export default Layout
