import React from 'react'
import { motion } from 'framer-motion'
import { Menu, Search, User, Settings } from 'lucide-react'
import Button from '@/components/ui/Button'
import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { useTheme } from '@/contexts/ThemeContext'

interface HeaderProps {
  onMenuClick: () => void
  isMobile: boolean
  onNavigateToEvent?: (eventId: string) => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile, onNavigateToEvent }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              leftIcon={<Menu className="w-5 h-5" />}
            />
          )}
          
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tableau de bord
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gérez vos événements et clients
            </p>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Search className="w-4 h-4" />}
            className="hidden sm:flex"
          >
            Rechercher
          </Button>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            leftIcon={isDark ? '🌞' : '🌙'}
          />
          
          {/* Notifications */}
          <NotificationCenter onNavigateToEvent={onNavigateToEvent} />
          
          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Settings className="w-4 h-4" />}
          />
          
          {/* User Menu */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<User className="w-4 h-4" />}
          />
        </div>
      </div>
    </header>
  )
}

export default Header