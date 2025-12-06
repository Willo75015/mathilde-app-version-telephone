import React, { createContext, useContext, ReactNode } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useEventNavigation } from '@/hooks/useEventNavigation'
import { NotificationProps } from '@/components/ui/Notification'

// BUG #12 FIX: Remplacer any[] par le type spécifique NotificationProps[]
interface GlobalNotificationContextType {
  notifications: NotificationProps[]
  showSuccess: (message: string, title?: string, duration?: number, eventId?: string) => string
  showError: (message: string, title?: string, duration?: number, eventId?: string) => string
  showWarning: (message: string, title?: string, duration?: number, eventId?: string) => string
  showInfo: (message: string, title?: string, duration?: number, eventId?: string) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  navigateToEvent: (eventId: string) => void
}

const GlobalNotificationContext = createContext<GlobalNotificationContextType | null>(null)

export const GlobalNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 🔔 INSTANCE UNIQUE DES NOTIFICATIONS
  const notificationHook = useNotifications()
  const { navigateToEvent } = useEventNavigation()
  
  console.log('🌍 GlobalNotificationProvider - Notifications:', notificationHook.notifications.length)
  
  const value = {
    notifications: notificationHook.notifications,
    showSuccess: notificationHook.showSuccess,
    showError: notificationHook.showError,
    showWarning: notificationHook.showWarning,
    showInfo: notificationHook.showInfo,
    removeNotification: notificationHook.removeNotification,
    clearAllNotifications: notificationHook.clearAllNotifications,
    navigateToEvent
  }

  return (
    <GlobalNotificationContext.Provider value={value}>
      {children}
    </GlobalNotificationContext.Provider>
  )
}

export const useGlobalNotifications = () => {
  const context = useContext(GlobalNotificationContext)
  if (!context) {
    throw new Error('useGlobalNotifications must be used within GlobalNotificationProvider')
  }
  return context
}

export default GlobalNotificationProvider
