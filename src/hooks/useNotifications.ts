import { useState, useCallback } from 'react'
import { NotificationType, NotificationProps } from '@/components/ui/Notification'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const addNotification = useCallback((
    message: string,
    type: NotificationType = 'info',
    title?: string,
    duration?: number,
    eventId?: string
  ) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log(`📬 AJOUT NOTIFICATION:`, { id, type, title, message, eventId })

    setNotifications(prev => {
      const notification: NotificationProps = {
        id,
        type,
        title,
        message,
        duration,
        eventId,
        onClose: () => setNotifications(current => current.filter(n => n.id !== id))
      }
      const newNotifications = [...prev, notification]
      console.log(`📬 NOUVEAU TOTAL NOTIFICATIONS: ${newNotifications.length}`)
      return newNotifications
    })

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Fonctions utilitaires pour différents types
  const showSuccess = useCallback((message: string, title?: string, duration?: number, eventId?: string) => {
    return addNotification(message, 'success', title, duration, eventId)
  }, [addNotification])

  const showError = useCallback((message: string, title?: string, duration?: number, eventId?: string) => {
    return addNotification(message, 'error', title, duration || 8000, eventId) // Erreurs plus longues
  }, [addNotification])

  const showWarning = useCallback((message: string, title?: string, duration?: number, eventId?: string) => {
    return addNotification(message, 'warning', title, duration, eventId)
  }, [addNotification])

  const showInfo = useCallback((message: string, title?: string, duration?: number, eventId?: string) => {
    return addNotification(message, 'info', title, duration, eventId)
  }, [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

export default useNotifications