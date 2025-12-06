import { useEffect, useCallback } from 'react'
import { Event, EventStatus } from '@/types'

interface NotificationHookProps {
  events: Event[]
  onShowNotification?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void
}

export const useEventStatusNotifications = ({ events, onShowNotification }: NotificationHookProps) => {
  
  // Surveiller les changements de statut vers COMPLETED
  useEffect(() => {
    const checkForCompletedEvents = () => {
      const completedEvents = events.filter(event => 
        event.status === EventStatus.COMPLETED && 
        !event.archived &&
        !event.invoiced
      )

      completedEvents.forEach(event => {
        // Vérifier si on a déjà notifié pour cet événement
        const notificationKey = `notified_completed_${event.id}`
        const alreadyNotified = localStorage.getItem(notificationKey)
        
        if (!alreadyNotified) {
          // Déclencher la notification
          onShowNotification?.(
            `✅ Événement "${event.title}" terminé - Prêt à facturer (${event.budget.toLocaleString('fr-FR')}€)`,
            'success'
          )
          
          // Marquer comme notifié
          localStorage.setItem(notificationKey, Date.now().toString())
          
          console.log('🔔 Notification envoyée pour événement terminé:', {
            eventId: event.id,
            title: event.title,
            budget: event.budget
          })
        }
      })
    }

    // Vérifier immédiatement et ensuite toutes les 30 secondes
    checkForCompletedEvents()
    const interval = setInterval(checkForCompletedEvents, 30000)

    return () => clearInterval(interval)
  }, [events, onShowNotification])

  // Surveiller les événements facturés depuis longtemps
  useEffect(() => {
    const checkOverduePayments = () => {
      const now = new Date()
      const overdueEvents = events.filter(event => {
        if (event.status !== EventStatus.INVOICED || !event.invoiceDate) return false
        
        const daysSinceInvoiced = Math.floor(
          (now.getTime() - new Date(event.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        return daysSinceInvoiced > 30 // Plus de 30 jours
      })

      overdueEvents.forEach(event => {
        const notificationKey = `notified_overdue_${event.id}`
        const lastNotified = localStorage.getItem(notificationKey)
        const daysSinceLastNotification = lastNotified 
          ? Math.floor((now.getTime() - parseInt(lastNotified)) / (1000 * 60 * 60 * 24))
          : null

        // Notifier seulement une fois par semaine pour les impayés
        if (!lastNotified || (daysSinceLastNotification && daysSinceLastNotification >= 7)) {
          onShowNotification?.(
            `⚠️ Paiement en retard: "${event.title}" - ${event.budget.toLocaleString('fr-FR')}€`,
            'warning'
          )
          
          localStorage.setItem(notificationKey, now.getTime().toString())
        }
      })
    }

    // Vérifier les impayés toutes les heures
    checkOverduePayments()
    const interval = setInterval(checkOverduePayments, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [events, onShowNotification])

  // Fonction pour déclencher des notifications manuelles
  const triggerBillingNotification = useCallback((event: Event, type: 'invoiced' | 'paid') => {
    const messages = {
      invoiced: `💼 Facture créée pour "${event.title}" - ${event.budget.toLocaleString('fr-FR')}€`,
      paid: `💰 Paiement reçu pour "${event.title}" - ${event.budget.toLocaleString('fr-FR')}€`
    }

    onShowNotification?.(messages[type], type === 'paid' ? 'success' : 'info')
  }, [onShowNotification])

  // Nettoyer les notifications anciennes (plus de 30 jours)
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const now = Date.now()
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('notified_')) {
          const timestamp = parseInt(localStorage.getItem(key) || '0')
          if (timestamp < thirtyDaysAgo) {
            localStorage.removeItem(key)
          }
        }
      })
    }

    // Nettoyer au démarrage et une fois par jour
    cleanupOldNotifications()
    const interval = setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    triggerBillingNotification
  }
}

export default useEventStatusNotifications