import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { 
  Calendar, Users, Flower, BarChart3, Home,
  Bell, Search, Settings, User
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  // Navigation items
  const navigation = [
    { name: 'Accueil', href: '/', icon: Home, current: true },
    { name: 'Calendrier', href: '/calendar', icon: Calendar, current: false },
    { name: 'Événements', href: '/events', icon: Flower, current: false },
    { name: 'Clients', href: '/clients', icon: Users, current: false },
    { name: 'Statistiques', href: '/stats', icon: BarChart3, current: false },
  ]

  return (
    <motion.aside
      className={clsx(
        "fixed top-0 left-0 bottom-0 z-50 w-60 bg-white dark:bg-gray-800",
        "border-r border-gray-200 dark:border-gray-700",
        "flex flex-col shadow-lg"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
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
          <motion.a
            key={item.name}
            href={item.href}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              item.current
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.name}</span>
          </motion.a>
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
      </div>
    </motion.aside>
  )
}

export default Sidebar