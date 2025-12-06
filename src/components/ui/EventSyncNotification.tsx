import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useEventTimeSync } from '@/hooks/useEventTimeSync'

export const EventSyncNotification: React.FC = () => {
  const { overdueEventsCount, todaysEventsCount } = useEventTimeSync()
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'sync' | 'urgent' | 'today'
    message: string
    timestamp: Date
  }>>([])
  
  // Surveiller les changements et créer des notifications
  useEffect(() => {
    const now = new Date()
    
    if (overdueEventsCount > 0) {
      setNotifications(prev => {
        const existingUrgent = prev.find(n => n.type === 'urgent')
        if (!existingUrgent) {
          return [...prev, {
            id: `urgent-${now.getTime()}`,
            type: 'urgent',
            message: `${overdueEventsCount} événement${overdueEventsCount > 1 ? 's' : ''} en retard !`,
            timestamp: now
          }]
        }
        return prev
      })
    }
    
    if (todaysEventsCount > 0) {
      const currentHour = now.getHours()
      // Notification seulement le matin (8h-12h)
      if (currentHour >= 8 && currentHour <= 12) {
        setNotifications(prev => {
          const existingToday = prev.find(n => n.type === 'today')
          if (!existingToday) {
            return [...prev, {
              id: `today-${now.getTime()}`,
              type: 'today',
              message: `${todaysEventsCount} événement${todaysEventsCount > 1 ? 's' : ''} prévu${todaysEventsCount > 1 ? 's' : ''} aujourd'hui`,
              timestamp: now
            }]
          }
          return prev
        })
      }
    }
  }, [overdueEventsCount, todaysEventsCount])
  
  // Auto-suppression des notifications après 10 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setNotifications(prev => 
        prev.filter(notification => 
          now.getTime() - notification.timestamp.getTime() < 10000
        )
      )
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }
  
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`p-4 rounded-lg shadow-lg max-w-sm border-l-4 ${
              notification.type === 'urgent' 
                ? 'bg-red-50 border-red-500' 
                : notification.type === 'today'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-green-50 border-green-500'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${
                notification.type === 'urgent' 
                  ? 'text-red-500' 
                  : notification.type === 'today'
                  ? 'text-blue-500'
                  : 'text-green-500'
              }`}>
                {notification.type === 'urgent' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : notification.type === 'today' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'urgent' 
                    ? 'text-red-900' 
                    : notification.type === 'today'
                    ? 'text-blue-900'
                    : 'text-green-900'
                }`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Synchronisé avec l'heure actuelle
                </p>
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default EventSyncNotification
