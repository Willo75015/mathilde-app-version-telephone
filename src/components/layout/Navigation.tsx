import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Flower, BarChart3, Home } from 'lucide-react'
import { clsx } from 'clsx'

interface NavigationProps {
  className?: string
  direction?: 'horizontal' | 'vertical'
}

const Navigation: React.FC<NavigationProps> = ({ 
  className,
  direction = 'vertical' 
}) => {
  // Navigation items
  const navigation = [
    { name: 'Accueil', href: '/', icon: Home, current: true },
    { name: 'Calendrier', href: '/calendar', icon: Calendar, current: false },
    { name: 'Événements', href: '/events', icon: Flower, current: false },
    { name: 'Clients', href: '/clients', icon: Users, current: false },
    { name: 'Statistiques', href: '/stats', icon: BarChart3, current: false },
  ]

  return (
    <nav className={clsx(
      direction === 'vertical' ? 'space-y-2' : 'flex space-x-4',
      className
    )}>
      {navigation.map((item) => (
        <motion.a
          key={item.name}
          href={item.href}
          whileHover={{ scale: 1.02, x: direction === 'vertical' ? 4 : 0 }}
          whileTap={{ scale: 0.98 }}
          className={clsx(
            'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            item.current
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {direction === 'vertical' && <span>{item.name}</span>}
        </motion.a>
      ))}
    </nav>
  )
}

export default Navigation