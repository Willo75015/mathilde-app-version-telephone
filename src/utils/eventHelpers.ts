import { Event, EventStatus } from '@/types'

/**
 * Utilitaires pour la gestion des événements
 */

// Type partiel pour les helpers qui n'ont besoin que de certaines propriétés
type PartialEvent = {
  status: EventStatus
  invoiceDate?: Date
  completedDate?: Date
  paidDate?: Date
  cancelledAt?: Date
  archived?: boolean
}

// Nombre de jours après lesquels un événement est considéré en retard
const PAYMENT_DELAY_DAYS = 30
const ARCHIVE_DELAY_DAYS = 30

/**
 * Vérifie si un événement facturé est en retard de paiement
 */
export function isPaymentOverdue(event: PartialEvent): boolean {
  if (event.status !== EventStatus.INVOICED || !event.invoiceDate) {
    return false
  }
  
  const daysSinceInvoice = Math.floor(
    (Date.now() - new Date(event.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return daysSinceInvoice > PAYMENT_DELAY_DAYS
}

/**
 * Obtient le nombre de jours depuis la facturation
 */
export function getDaysSinceInvoice(event: PartialEvent): number {
  if (!event.invoiceDate) return 0
  
  return Math.floor(
    (Date.now() - new Date(event.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
  )
}

/**
 * Vérifie si un événement doit être archivé automatiquement
 */
export function shouldBeArchived(event: PartialEvent): boolean {
  const now = Date.now()
  
  // Événements terminés depuis plus de 30 jours
  if (event.status === EventStatus.COMPLETED && event.completedDate) {
    const daysSinceCompleted = Math.floor(
      (now - new Date(event.completedDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceCompleted > ARCHIVE_DELAY_DAYS
  }
  
  // Événements facturés depuis plus de 30 jours
  if (event.status === EventStatus.INVOICED && event.invoiceDate) {
    const daysSinceInvoiced = Math.floor(
      (now - new Date(event.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceInvoiced > ARCHIVE_DELAY_DAYS
  }
  
  // Événements payés depuis plus de 30 jours
  if (event.status === EventStatus.PAID && event.paidDate) {
    const daysSincePaid = Math.floor(
      (now - new Date(event.paidDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSincePaid > ARCHIVE_DELAY_DAYS
  }
  
  // Événements annulés depuis plus de 30 jours
  if (event.status === EventStatus.CANCELLED && event.cancelledAt) {
    const daysSinceCancelled = Math.floor(
      (now - new Date(event.cancelledAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceCancelled > ARCHIVE_DELAY_DAYS
  }
  
  return false
}

/**
 * Obtient les couleurs de statut pour l'EventCard
 */
export function getStatusColors(event: PartialEvent): {
  bgColor: string
  borderColor: string
  textColor: string
} {
  // Si en retard de paiement, priorité absolue
  if (isPaymentOverdue(event)) {
    return {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-300 dark:border-red-700',
      textColor: 'text-red-900 dark:text-red-100'
    }
  }
  
  // Couleurs par statut
  switch (event.status) {
    case EventStatus.DRAFT:
      return {
        bgColor: 'bg-gray-50 dark:bg-gray-800',
        borderColor: 'border-gray-200 dark:border-gray-600',
        textColor: 'text-gray-900 dark:text-gray-100'
      }
      
    case EventStatus.CONFIRMED:
      return {
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-700',
        textColor: 'text-blue-900 dark:text-blue-100'
      }
      
    case EventStatus.IN_PROGRESS:
      return {
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-700',
        textColor: 'text-orange-900 dark:text-orange-100'
      }
      
    case EventStatus.COMPLETED:
      return {
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-700',
        textColor: 'text-green-900 dark:text-green-100'
      }
      
    case EventStatus.INVOICED:
      return {
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-700',
        textColor: 'text-purple-900 dark:text-purple-100'
      }
      
    case EventStatus.PAID:
      return {
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-700',
        textColor: 'text-emerald-900 dark:text-emerald-100'
      }
      
    case EventStatus.CANCELLED:
      return {
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-700',
        textColor: 'text-red-900 dark:text-red-100'
      }
      
    default:
      return {
        bgColor: 'bg-white dark:bg-gray-800',
        borderColor: 'border-gray-200 dark:border-gray-600',
        textColor: 'text-gray-900 dark:text-gray-100'
      }
  }
}

/**
 * Obtient l'indicateur de retard de paiement pour affichage
 */
export function getPaymentOverdueIndicator(event: PartialEvent): {
  show: boolean
  text: string
  icon: string
  severity: 'warning' | 'danger'
} {
  if (!isPaymentOverdue(event)) {
    return { show: false, text: '', icon: '', severity: 'warning' }
  }
  
  const daysOverdue = getDaysSinceInvoice(event) - PAYMENT_DELAY_DAYS
  
  if (daysOverdue > 60) {
    return {
      show: true,
      text: `RETARD ${daysOverdue}j`,
      icon: '🚨',
      severity: 'danger'
    }
  } else if (daysOverdue > 30) {
    return {
      show: true,
      text: `RETARD ${daysOverdue}j`,
      icon: '⚠️',
      severity: 'danger'
    }
  } else {
    return {
      show: true,
      text: `RETARD ${daysOverdue}j`,
      icon: '⚠️',
      severity: 'warning'
    }
  }
}

/**
 * Filtre les événements qui ne doivent pas être archivés
 */
export function filterActiveEvents(events: Event[]): Event[] {
  return events.filter(event => !event.archived && !shouldBeArchived(event))
}

/**
 * Filtre les événements qui doivent être archivés
 */
export function filterArchivedEvents(events: Event[]): Event[] {
  return events.filter(event => event.archived || shouldBeArchived(event))
}

/**
 * Obtient le texte du statut avec emoji
 */
export function getStatusText(status: EventStatus): string {
  switch (status) {
    case EventStatus.DRAFT:
      return '📝 Brouillon'
    case EventStatus.CONFIRMED:
      return '✅ Confirmé'
    case EventStatus.IN_PROGRESS:
      return '🚧 En cours'
    case EventStatus.COMPLETED:
      return '🎉 Terminé'
    case EventStatus.INVOICED:
      return '💰 Facturé'
    case EventStatus.PAID:
      return '💚 Payé'
    case EventStatus.CANCELLED:
      return '❌ Annulé'
    default:
      return status
  }
}
