import { useEffect, useCallback } from 'react'
import { Event, EventStatus } from '@/types'

// Types pour les notifications (renommé pour éviter conflit avec API native)
interface AppNotificationOptions {
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
  persistent?: boolean
}

// Hook pour gérer les notifications automatiques des événements
export const useEventNotifications = (events: Event[]) => {

  // Fonction pour afficher une notification
  const showNotification = useCallback((options: AppNotificationOptions) => {
    // Utiliser l'API de notification native du navigateur si disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.message,
        icon: '/pwa-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'mathilde-fleurs-event'
      })
    }
    
    // Afficher aussi une notification dans l'interface (toast)
    console.log(`🔔 NOTIFICATION [${options.type.toUpperCase()}]:`, {
      title: options.title,
      message: options.message
    })
    
    // Ici on pourrait intégrer avec un système de toast/notification UI
    // Par exemple avec react-hot-toast, react-toastify, etc.
    
    // Pour l'instant, utiliser un événement custom pour l'interface
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: options
    }))
  }, [])

  // Fonction pour demander la permission de notification
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  // Surveiller les changements de statut des événements
  useEffect(() => {
    const handleEventStatusChange = (event: CustomEvent) => {
      const { updatedEvent, previousStatus } = event.detail
      
      // Notification quand un événement passe en "Terminé"
      if (updatedEvent.status === EventStatus.COMPLETED && previousStatus !== EventStatus.COMPLETED) {
        showNotification({
          title: '✅ Événement terminé',
          message: `"${updatedEvent.title}" est maintenant terminé et prêt à être facturé (${updatedEvent.budget.toLocaleString('fr-FR')}€)`,
          type: 'success',
          duration: 8000,
          persistent: true
        })
      }
      
      // Notification quand un événement passe en "Facturé"
      if (updatedEvent.status === EventStatus.INVOICED && previousStatus !== EventStatus.INVOICED) {
        showNotification({
          title: '💼 Événement facturé',
          message: `Facture envoyée pour "${updatedEvent.title}". Suivez le paiement dans le tableau de bord.`,
          type: 'info',
          duration: 5000
        })
      }
      
      // Notification quand un événement est payé
      if (updatedEvent.status === EventStatus.PAID && previousStatus !== EventStatus.PAID) {
        const paymentMethod = updatedEvent.paymentMethod ? ` (${updatedEvent.paymentMethod})` : ''
        showNotification({
          title: '💰 Paiement reçu',
          message: `"${updatedEvent.title}" a été payé${paymentMethod}. Montant encaissé : ${updatedEvent.budget.toLocaleString('fr-FR')}€`,
          type: 'success',
          duration: 6000
        })
      }
    }

    // Écouter les changements de statut
    window.addEventListener('eventStatusChanged', handleEventStatusChange as EventListener)
    
    return () => {
      window.removeEventListener('eventStatusChanged', handleEventStatusChange as EventListener)
    }
  }, [showNotification])

  // Vérifier les factures en retard (vérification quotidienne)
  useEffect(() => {
    const checkOverdueInvoices = () => {
      const overdueEvents = events.filter(event => {
        if (event.status !== EventStatus.INVOICED || !event.invoiceDate) return false
        
        const daysSinceInvoice = Math.floor(
          (new Date().getTime() - new Date(event.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        return daysSinceInvoice > 30
      })
      
      if (overdueEvents.length > 0) {
        const totalOverdue = overdueEvents.reduce((sum, event) => sum + event.budget, 0)
        
        showNotification({
          title: '⚠️ Factures en retard',
          message: `${overdueEvents.length} facture(s) en retard pour un total de ${totalOverdue.toLocaleString('fr-FR')}€`,
          type: 'warning',
          duration: 10000,
          persistent: true
        })
      }
    }

    // Vérifier au démarrage
    checkOverdueInvoices()
    
    // Vérifier toutes les heures
    const interval = setInterval(checkOverdueInvoices, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [events, showNotification])

  return {
    showNotification,
    requestNotificationPermission
  }
}

// Hook pour émettre les changements de statut
export const useEventStatusEmitter = () => {
  
  const emitStatusChange = useCallback((updatedEvent: Event, previousStatus: EventStatus) => {
    // Émettre un événement global pour notifier le changement
    window.dispatchEvent(new CustomEvent('eventStatusChanged', {
      detail: {
        updatedEvent,
        previousStatus,
        timestamp: new Date()
      }
    }))
    
    console.log(`📡 STATUS CHANGE EMITTED:`, {
      eventId: updatedEvent.id,
      title: updatedEvent.title,
      from: previousStatus,
      to: updatedEvent.status
    })
  }, [])

  return {
    emitStatusChange
  }
}

export default useEventNotifications