import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, ChevronDown, ChevronUp, Calendar, Clock, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useGlobalNotifications } from '@/contexts/GlobalNotificationContext'

interface NotificationCenterProps {
  onNavigateToEvent?: (eventId: string) => void
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNavigateToEvent
}) => {
  const { notifications, removeNotification, clearAllNotifications, navigateToEvent } = useGlobalNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  
  // 🔄 DEBUG - Vérifier si les notifications arrivent bien
  console.log(`🔔 NotificationCenter RENDER: ${notifications.length} notifications`)
  console.log('📋 Notifications actuelles:', notifications.map(n => ({ id: n.id, title: n.title, message: n.message })))
  
  const visibleNotifications = showAll ? notifications : notifications.slice(0, 5)
  const hasMore = notifications.length > 5
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'info': return <Clock className="w-4 h-4 text-blue-500" />
      case 'warning': return <Calendar className="w-4 h-4 text-orange-500" />
      case 'error': return <X className="w-4 h-4 text-red-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }
  
  const handleNotificationClick = (notification: any) => {
    // Si la notification contient un eventId, naviguer vers l'événement
    if (notification.eventId) {
      navigateToEvent(notification.eventId)
    }
    // Fermer le panneau de notifications
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Bouton cloche avec badge */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {notifications.length > 9 ? '9+' : notifications.length}
          </motion.span>
        )}
      </Button>

      {/* Panneau de notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panneau */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                  </p>
                </div>
                
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Tout effacer
                  </Button>
                )}
              </div>

              {/* Liste des notifications */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Aucune notification
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {visibleNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            {notification.title && (
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {notification.title}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date().toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton "Afficher plus" */}
              {hasMore && !showAll && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(true)}
                    leftIcon={<ChevronDown className="w-4 h-4" />}
                    className="w-full justify-center text-sm"
                  >
                    Afficher {notifications.length - 5} de plus
                  </Button>
                </div>
              )}

              {/* Bouton "Afficher moins" */}
              {showAll && hasMore && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(false)}
                    leftIcon={<ChevronUp className="w-4 h-4" />}
                    className="w-full justify-center text-sm"
                  >
                    Afficher moins
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationCenter
