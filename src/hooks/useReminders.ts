import { useMemo, useState, useCallback } from 'react'
import { Event, Client, EventStatus, Reminder, ReminderType, ReminderPriority } from '@/types'

interface RemindersStats {
  reminders: Reminder[]
  urgentCount: number
  highCount: number
  totalUnread: number

  // Actions
  dismissReminder: (id: string) => void
  markAsRead: (id: string) => void
  clearDismissed: () => void
}

// Clé localStorage pour les rappels masqués
const DISMISSED_KEY = 'mathilde-reminders-dismissed'
const READ_KEY = 'mathilde-reminders-read'

/**
 * Hook pour générer et gérer les rappels automatiques
 */
export function useReminders(events: Event[], clients: Client[]): RemindersStats {
  // Charger les rappels masqués et lus depuis localStorage
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(READ_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Générer les rappels automatiquement
  const allReminders = useMemo(() => {
    const reminders: Reminder[] = []
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // === 1. ÉVÉNEMENTS À VENIR (rappels J-7, J-3, J-1) ===
    events.forEach(event => {
      if (event.status === EventStatus.CANCELLED ||
          event.status === EventStatus.COMPLETED ||
          event.status === EventStatus.INVOICED ||
          event.status === EventStatus.PAID) {
        return
      }

      const eventDate = new Date(event.date)
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // J-7 : Préparation
      if (daysUntil === 7) {
        reminders.push({
          id: `upcoming-7-${event.id}`,
          type: ReminderType.EVENT_UPCOMING,
          priority: ReminderPriority.LOW,
          title: 'Événement dans 1 semaine',
          description: `"${event.title}" - Préparez les détails`,
          eventId: event.id,
          dueDate: eventDate,
          createdAt: now,
          isRead: readIds.includes(`upcoming-7-${event.id}`),
          isDismissed: dismissedIds.includes(`upcoming-7-${event.id}`),
          actionLabel: 'Voir détails',
          actionType: 'navigate',
          actionData: `event-${event.id}`
        })
      }

      // J-3 : Confirmation équipe
      if (daysUntil === 3) {
        reminders.push({
          id: `upcoming-3-${event.id}`,
          type: ReminderType.EVENT_UPCOMING,
          priority: ReminderPriority.MEDIUM,
          title: 'Événement dans 3 jours',
          description: `"${event.title}" - Vérifiez l'équipe et le matériel`,
          eventId: event.id,
          dueDate: eventDate,
          createdAt: now,
          isRead: readIds.includes(`upcoming-3-${event.id}`),
          isDismissed: dismissedIds.includes(`upcoming-3-${event.id}`),
          actionLabel: 'Voir détails',
          actionType: 'navigate',
          actionData: `event-${event.id}`
        })
      }

      // J-1 : Rappel urgent
      if (daysUntil === 1) {
        reminders.push({
          id: `upcoming-1-${event.id}`,
          type: ReminderType.EVENT_UPCOMING,
          priority: ReminderPriority.HIGH,
          title: 'Événement DEMAIN',
          description: `"${event.title}" à ${event.time} - ${event.location}`,
          eventId: event.id,
          dueDate: eventDate,
          createdAt: now,
          isRead: readIds.includes(`upcoming-1-${event.id}`),
          isDismissed: dismissedIds.includes(`upcoming-1-${event.id}`),
          actionLabel: 'Voir détails',
          actionType: 'navigate',
          actionData: `event-${event.id}`
        })
      }

      // Aujourd'hui
      if (daysUntil === 0) {
        reminders.push({
          id: `today-${event.id}`,
          type: ReminderType.EVENT_UPCOMING,
          priority: ReminderPriority.URGENT,
          title: "Événement AUJOURD'HUI",
          description: `"${event.title}" à ${event.time} - ${event.location}`,
          eventId: event.id,
          dueDate: eventDate,
          createdAt: now,
          isRead: readIds.includes(`today-${event.id}`),
          isDismissed: dismissedIds.includes(`today-${event.id}`),
          actionLabel: 'Voir détails',
          actionType: 'navigate',
          actionData: `event-${event.id}`
        })
      }
    })

    // === 2. ÉQUIPE INCOMPLÈTE ===
    events.forEach(event => {
      if (event.status === EventStatus.CANCELLED ||
          event.status === EventStatus.COMPLETED ||
          event.status === EventStatus.INVOICED ||
          event.status === EventStatus.PAID) {
        return
      }

      const eventDate = new Date(event.date)
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Vérifier si l'équipe est complète
      const requiredFlorists = event.floristsRequired || 1
      const confirmedFlorists = (event.assignedFlorists || []).filter(
        f => f.status === 'confirmed' || f.isConfirmed
      ).length

      if (confirmedFlorists < requiredFlorists && daysUntil <= 7 && daysUntil > 0) {
        const priority = daysUntil <= 2 ? ReminderPriority.URGENT :
                        daysUntil <= 4 ? ReminderPriority.HIGH : ReminderPriority.MEDIUM

        reminders.push({
          id: `team-incomplete-${event.id}`,
          type: ReminderType.TEAM_INCOMPLETE,
          priority,
          title: 'Équipe incomplète',
          description: `"${event.title}" : ${confirmedFlorists}/${requiredFlorists} fleuristes confirmés`,
          eventId: event.id,
          dueDate: eventDate,
          createdAt: now,
          isRead: readIds.includes(`team-incomplete-${event.id}`),
          isDismissed: dismissedIds.includes(`team-incomplete-${event.id}`),
          actionLabel: 'Gérer équipe',
          actionType: 'navigate',
          actionData: `event-${event.id}`
        })
      }
    })

    // === 3. FLEURISTES EN ATTENTE ===
    events.forEach(event => {
      if (event.status === EventStatus.CANCELLED ||
          event.status === EventStatus.COMPLETED ||
          event.status === EventStatus.INVOICED ||
          event.status === EventStatus.PAID) {
        return
      }

      const pendingFlorists = (event.assignedFlorists || []).filter(f => f.status === 'pending')

      if (pendingFlorists.length > 0) {
        const eventDate = new Date(event.date)
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const priority = daysUntil <= 3 ? ReminderPriority.HIGH : ReminderPriority.MEDIUM

        reminders.push({
          id: `pending-florists-${event.id}`,
          type: ReminderType.FLORIST_PENDING,
          priority,
          title: 'Réponses en attente',
          description: `"${event.title}" : ${pendingFlorists.length} fleuriste(s) n'ont pas répondu`,
          eventId: event.id,
          dueDate: eventDate,
          createdAt: now,
          isRead: readIds.includes(`pending-florists-${event.id}`),
          isDismissed: dismissedIds.includes(`pending-florists-${event.id}`),
          actionLabel: 'Relancer',
          actionType: 'navigate',
          actionData: `event-${event.id}`
        })
      }
    })

    // === 4. FACTURATION EN RETARD ===
    events.forEach(event => {
      if (event.status !== EventStatus.COMPLETED) return
      if (event.invoiced) return

      const completedDate = event.completedDate ? new Date(event.completedDate) : new Date(event.date)
      const daysSinceCompletion = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceCompletion >= 3) {
        const priority = daysSinceCompletion >= 7 ? ReminderPriority.URGENT :
                        daysSinceCompletion >= 5 ? ReminderPriority.HIGH : ReminderPriority.MEDIUM

        const client = clients.find(c => c.id === event.clientId)

        reminders.push({
          id: `invoice-overdue-${event.id}`,
          type: ReminderType.INVOICE_OVERDUE,
          priority,
          title: 'Facturation en retard',
          description: `"${event.title}" terminé il y a ${daysSinceCompletion} jours - ${event.budget}€`,
          eventId: event.id,
          clientId: event.clientId,
          dueDate: completedDate,
          createdAt: now,
          isRead: readIds.includes(`invoice-overdue-${event.id}`),
          isDismissed: dismissedIds.includes(`invoice-overdue-${event.id}`),
          actionLabel: client?.phone ? 'Contacter client' : 'Voir événement',
          actionType: client?.phone ? 'whatsapp' : 'navigate',
          actionData: client?.phone || `event-${event.id}`
        })
      }
    })

    // === 5. PAIEMENTS EN ATTENTE ===
    events.forEach(event => {
      if (event.status !== EventStatus.INVOICED) return
      if (event.paid) return

      const invoiceDate = event.invoiceDate ? new Date(event.invoiceDate) : new Date(event.date)
      const daysSinceInvoice = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceInvoice >= 7) {
        const priority = daysSinceInvoice >= 30 ? ReminderPriority.URGENT :
                        daysSinceInvoice >= 14 ? ReminderPriority.HIGH : ReminderPriority.MEDIUM

        const client = clients.find(c => c.id === event.clientId)

        reminders.push({
          id: `payment-pending-${event.id}`,
          type: ReminderType.PAYMENT_PENDING,
          priority,
          title: 'Paiement en attente',
          description: `"${event.title}" facturé il y a ${daysSinceInvoice} jours - ${event.budget}€`,
          eventId: event.id,
          clientId: event.clientId,
          dueDate: invoiceDate,
          createdAt: now,
          isRead: readIds.includes(`payment-pending-${event.id}`),
          isDismissed: dismissedIds.includes(`payment-pending-${event.id}`),
          actionLabel: client?.phone ? 'Relancer client' : 'Voir événement',
          actionType: client?.phone ? 'whatsapp' : 'navigate',
          actionData: client?.phone || `event-${event.id}`
        })
      }
    })

    // === 6. SUIVI CLIENT POST-ÉVÉNEMENT ===
    events.forEach(event => {
      if (event.status !== EventStatus.PAID) return

      const paidDate = event.paidDate ? new Date(event.paidDate) : new Date(event.date)
      const daysSincePaid = Math.floor((today.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24))

      // Rappel de suivi à J+3 après paiement
      if (daysSincePaid >= 3 && daysSincePaid <= 7) {
        const client = clients.find(c => c.id === event.clientId)

        reminders.push({
          id: `followup-${event.id}`,
          type: ReminderType.CLIENT_FOLLOWUP,
          priority: ReminderPriority.LOW,
          title: 'Suivi client',
          description: `Demander un retour sur "${event.title}" - ${client?.firstName || 'Client'}`,
          eventId: event.id,
          clientId: event.clientId,
          dueDate: paidDate,
          createdAt: now,
          isRead: readIds.includes(`followup-${event.id}`),
          isDismissed: dismissedIds.includes(`followup-${event.id}`),
          actionLabel: client?.phone ? 'Envoyer message' : 'Voir client',
          actionType: client?.phone ? 'whatsapp' : 'navigate',
          actionData: client?.phone || `client-${event.clientId}`
        })
      }
    })

    // Filtrer les rappels masqués et trier par priorité
    return reminders
      .filter(r => !r.isDismissed)
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }, [events, clients, dismissedIds, readIds])

  // Actions
  const dismissReminder = useCallback((id: string) => {
    setDismissedIds(prev => {
      const updated = [...prev, id]
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      const updated = [...prev, id]
      localStorage.setItem(READ_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearDismissed = useCallback(() => {
    setDismissedIds([])
    localStorage.removeItem(DISMISSED_KEY)
  }, [])

  // Stats
  const urgentCount = allReminders.filter(r => r.priority === ReminderPriority.URGENT).length
  const highCount = allReminders.filter(r => r.priority === ReminderPriority.HIGH).length
  const totalUnread = allReminders.filter(r => !r.isRead).length

  return {
    reminders: allReminders,
    urgentCount,
    highCount,
    totalUnread,
    dismissReminder,
    markAsRead,
    clearDismissed
  }
}

export default useReminders
