import React, { createContext, useContext, ReactNode } from 'react'
import { useEventNavigation } from '@/hooks/useEventNavigation'
import { useNotifications } from '@/hooks/useNotifications'

interface AppProviderProps {
  navigateToEvent: (eventId: string) => void
  notifications: any[]
  showSuccess: (message: string, title?: string, duration?: number, eventId?: string) => string
  showError: (message: string, title?: string, duration?: number, eventId?: string) => string
  showWarning: (message: string, title?: string, duration?: number, eventId?: string) => string
  showInfo: (message: string, title?: string, duration?: number, eventId?: string) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const AppProvider = createContext<AppProviderProps | null>(null)

export const AppGlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { navigateToEvent } = useEventNavigation()
  const {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications
  } = useNotifications()

  const value = {
    navigateToEvent,
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications
  }

  return (
    <AppProvider.Provider value={value}>
      {children}
    </AppProvider.Provider>
  )
}

export const useAppGlobal = () => {
  const context = useContext(AppProvider)
  if (!context) {
    throw new Error('useAppGlobal must be used within AppGlobalProvider')
  }
  return context
}

export default AppGlobalProvider
