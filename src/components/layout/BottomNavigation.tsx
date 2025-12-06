import React from 'react'
import { Home, Calendar, Flower, Users, BarChart3 } from 'lucide-react'
import { clsx } from 'clsx'

interface BottomNavigationProps {
  currentPage: string
  navigate: (page: string) => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, navigate }) => {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'events', label: 'Events', icon: Flower },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 h-full py-2 px-1 transition-colors',
                'active:scale-95 transform',
                isActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Icon
                className={clsx(
                  'w-6 h-6 mb-1 transition-transform',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={clsx(
                'text-xs font-medium truncate',
                isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation
