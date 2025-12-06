import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, AlertTriangle, Clock, Users, FileText, CreditCard,
  Heart, X, ChevronDown, ChevronUp, Phone, MessageCircle,
  ExternalLink, CheckCircle
} from 'lucide-react'
import { Reminder, ReminderType, ReminderPriority } from '@/types'
import Card from '@/components/ui/Card'

interface RemindersSectionProps {
  reminders: Reminder[]
  urgentCount: number
  highCount: number
  totalUnread: number
  onDismiss: (id: string) => void
  onMarkAsRead: (id: string) => void
  navigate?: (page: string, params?: any) => void
}

// Configuration des types de rappels
const REMINDER_TYPE_CONFIG: Record<ReminderType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  [ReminderType.EVENT_UPCOMING]: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  [ReminderType.FLORIST_PENDING]: {
    icon: <Users className="w-4 h-4" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  [ReminderType.INVOICE_OVERDUE]: {
    icon: <FileText className="w-4 h-4" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  [ReminderType.PAYMENT_PENDING]: {
    icon: <CreditCard className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  [ReminderType.CLIENT_FOLLOWUP]: {
    icon: <Heart className="w-4 h-4" />,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30'
  },
  [ReminderType.TEAM_INCOMPLETE]: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  }
}

// Configuration des priorités
const PRIORITY_CONFIG: Record<ReminderPriority, { label: string; color: string; bgColor: string; borderColor: string }> = {
  [ReminderPriority.URGENT]: {
    label: 'URGENT',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-700'
  },
  [ReminderPriority.HIGH]: {
    label: 'Important',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-300 dark:border-orange-700'
  },
  [ReminderPriority.MEDIUM]: {
    label: 'Moyen',
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-300 dark:border-yellow-700'
  },
  [ReminderPriority.LOW]: {
    label: 'Info',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700'
  }
}

const RemindersSection: React.FC<RemindersSectionProps> = ({
  reminders,
  urgentCount,
  highCount,
  totalUnread,
  onDismiss,
  onMarkAsRead,
  navigate
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)

  // Limiter l'affichage par défaut
  const displayedReminders = showAll ? reminders : reminders.slice(0, 5)

  // Handler pour les actions
  const handleAction = (reminder: Reminder) => {
    onMarkAsRead(reminder.id)

    if (reminder.actionType === 'navigate' && reminder.actionData && navigate) {
      // Naviguer vers la page appropriée
      if (reminder.actionData.startsWith('event-')) {
        navigate('calendar') // Pour l'instant on redirige vers le calendrier
      } else if (reminder.actionData.startsWith('client-')) {
        navigate('clients')
      }
    } else if (reminder.actionType === 'whatsapp' && reminder.actionData) {
      // Ouvrir WhatsApp
      const phone = reminder.actionData.replace(/\s/g, '').replace('+', '')
      window.open(`https://wa.me/${phone}`, '_blank')
    } else if (reminder.actionType === 'call' && reminder.actionData) {
      // Appeler
      window.open(`tel:${reminder.actionData}`, '_blank')
    } else if (reminder.actionType === 'email' && reminder.actionData) {
      // Email
      window.open(`mailto:${reminder.actionData}`, '_blank')
    }
  }

  // Si aucun rappel, ne rien afficher
  if (reminders.length === 0) {
    return null
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>Rappels & Alertes</span>
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                  {urgentCount} urgent{urgentCount > 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {reminders.length} rappel{reminders.length > 1 ? 's' : ''} actif{reminders.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Compteurs par priorité */}
          {urgentCount > 0 && (
            <span className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold">{urgentCount}</span>
            </span>
          )}
          {highCount > 0 && (
            <span className="flex items-center space-x-1 text-orange-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">{highCount}</span>
            </span>
          )}

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Liste des rappels */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {displayedReminders.map((reminder) => {
                const typeConfig = REMINDER_TYPE_CONFIG[reminder.type]
                const priorityConfig = PRIORITY_CONFIG[reminder.priority]

                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`p-3 rounded-lg border ${priorityConfig.bgColor} ${priorityConfig.borderColor} ${
                      !reminder.isRead ? 'ring-2 ring-amber-400' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Icône du type */}
                        <span className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                          <span className={typeConfig.color}>{typeConfig.icon}</span>
                        </span>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                              {priorityConfig.label}
                            </span>
                            {!reminder.isRead && (
                              <span className="w-2 h-2 bg-amber-500 rounded-full" />
                            )}
                          </div>
                          <h4 className={`font-medium ${priorityConfig.color}`}>
                            {reminder.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {reminder.description}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {reminder.actionLabel && (
                          <button
                            type="button"
                            onClick={() => handleAction(reminder)}
                            className={`p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors ${typeConfig.color}`}
                            title={reminder.actionLabel}
                          >
                            {reminder.actionType === 'whatsapp' ? (
                              <MessageCircle className="w-4 h-4" />
                            ) : reminder.actionType === 'call' ? (
                              <Phone className="w-4 h-4" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onMarkAsRead(reminder.id)}
                          className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                          title="Marquer comme lu"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDismiss(reminder.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                          title="Masquer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Bouton voir plus/moins */}
              {reminders.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full py-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
                >
                  {showAll ? `Voir moins` : `Voir tous les ${reminders.length} rappels`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default RemindersSection
