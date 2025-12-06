import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Search, Bell, Settings, User, LogOut,
  Calendar, Users, Flower, BarChart3, Home, ShoppingBag
} from 'lucide-react'
import { clsx } from 'clsx'
import { Clock } from '@/components/ui/Clock'
import { useEventNavigation } from '@/hooks/useEventNavigation'
import { useEventTimeSync } from '@/hooks/useEventTimeSync'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(propCurrentPage || 'home')
  const [isDark, setIsDark] = useState(false)
  const { width } = useSimpleViewport()
  const { navigateToEvent } = useEventNavigation()
  
  // 🆕 Initialiser la synchronisation des événements
  useEventTimeSync()
  
  const isMobile = width < 768
  
  // Navigation items
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
  
  // Fermer la sidebar sur mobile quand on navigue
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])
  
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }
  
  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  }
  
  return (
    <div className={clsx("min-h-screen bg-gray-50 transition-colors duration-300", isDark && "dark bg-gray-900")}>
      
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar Desktop - Toujours visible */}
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
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => {
                const page = item.href === '/' ? 'home' : item.href.substring(1)
                if (navigate) {
                  navigate(page)
                } else {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }))
                }
              }}
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 left-0 bottom-0 z-50 w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg md:hidden"
          >
            {/* Header Mobile */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Flower className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Mathilde Fleurs
                </span>
              </div>
              
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation Mobile */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    const page = item.href === '/' ? 'home' : item.href.substring(1)
                    if (navigate) {
                      navigate(page)
                    } else {
                      window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }))
                    }
                    setSidebarOpen(false)
                  }}
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
            
            {/* Footer Mobile */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <button
                  onClick={toggleTheme}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {isDark ? '🌞' : '🌙'}
                </button>
                
                <button
                  onClick={() => {
                    navigate?.('settings')
                    setSidebarOpen(false)
                  }}
                  className="px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                  title="Paramètres"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="ml-0 md:ml-60 transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tableau de bord
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gérez vos événements et clients
                </p>
              </div>
              
              <div className="block sm:hidden">
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                  Mathilde Fleurs
                </h1>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2">
              <Clock format="datetime" showIcon={true} />
              
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Layout