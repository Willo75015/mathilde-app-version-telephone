import { useCallback } from 'react'
import { Event, EventStatus } from '@/types'
import { useApp } from '@/contexts/AppContext'

// Hook spécialisé pour la gestion du workflow de facturation
export const useBillingWorkflow = () => {
  const { state, actions } = useApp()
  const events = state.events
  const { updateEvent, updateEventWithStatusDates } = actions

  // Archiver un événement et le marquer comme facturé
  const archiveAndInvoiceEvent = useCallback(async (eventId: string) => {
    console.log('💼 BILLING - Archivage et facturation:', eventId)
    
    // 🔧 CORRECTION: Vérifier que events existe et n'est pas vide
    if (!events || events.length === 0) {
      throw new Error('Aucun événement trouvé dans la liste')
    }
    
    const event = events.find(e => e.id === eventId)
    if (!event) {
      throw new Error('Événement non trouvé')
    }

    if (event.status !== EventStatus.COMPLETED) {
      throw new Error('L\'événement doit être terminé pour être facturé')
    }

    // BUG #7 FIX: Vérifier que l'équipe de fleuristes est complète avant facturation
    const requiredFlorists = event.floristsRequired || 1
    const confirmedFlorists = event.assignedFlorists?.filter(
      af => af.status === 'confirmed' || af.isConfirmed
    ).length || 0

    if (confirmedFlorists < requiredFlorists) {
      throw new Error(`L'équipe de fleuristes est incomplète (${confirmedFlorists}/${requiredFlorists} confirmés)`)
    }

    // ✅ UTILISER LA NOUVELLE FONCTION SMART QUI GÈRE LES DATES AUTOMATIQUEMENT
    updateEventWithStatusDates(eventId, EventStatus.INVOICED)
    
    console.log('✅ BILLING - Événement archivé et facturé:', eventId)
    return { status: EventStatus.INVOICED }
  }, [events, updateEventWithStatusDates])

  // Marquer un événement comme payé
  const markEventAsPaid = useCallback(async (eventId: string, paymentMethod?: string) => {
    console.log('💰 BILLING - Marquage comme payé:', eventId)
    
    // 🔧 CORRECTION: Vérifier que events existe et n'est pas vide
    if (!events || events.length === 0) {
      throw new Error('Aucun événement trouvé dans la liste')
    }
    
    const event = events.find(e => e.id === eventId)
    if (!event) {
      throw new Error('Événement non trouvé')
    }

    if (event.status !== EventStatus.INVOICED) {
      throw new Error('L\'événement doit être facturé pour être marqué comme payé')
    }

    const updates = {
      status: EventStatus.PAID,
      paid: true,
      paidDate: new Date(),
      completedDate: event.completedDate || new Date(), // 🔧 S'assurer qu'on a une date de fin
      paymentMethod: paymentMethod || 'transfer',
      updatedAt: new Date()
    }

    // ✅ UTILISER LA NOUVELLE FONCTION SMART POUR LE STATUT
    updateEventWithStatusDates(eventId, EventStatus.PAID)
    
    // 🆕 Ajouter le mode de paiement séparément si fourni
    if (paymentMethod) {
      updateEvent(eventId, { paymentMethod: paymentMethod as 'cash' | 'card' | 'transfer' | 'check' })
    }
    
    console.log('✅ BILLING - Événement marqué comme payé:', eventId)
    return { status: EventStatus.PAID }
  }, [events, updateEventWithStatusDates, updateEvent])

  // Gérer les relances et états d'attente
  const updatePaymentStatus = useCallback(async (
    eventId: string, 
    status: 'paid' | 'overdue' | 'reminder'
  ) => {
    console.log('📊 BILLING - Mise à jour statut paiement:', eventId, status)
    
    // 🔧 CORRECTION: Vérifier que events existe et n'est pas vide
    if (!events || events.length === 0) {
      throw new Error('Aucun événement trouvé dans la liste')
    }
    
    const event = events.find(e => e.id === eventId)
    if (!event) {
      throw new Error('Événement non trouvé')
    }

    switch (status) {
      case 'paid':
        return await markEventAsPaid(eventId)
      
      case 'overdue':
        // Marquer comme en retard (peut-être ajouter un champ overdue)
        updateEvent(eventId, {
          notes: `${event.notes || ''}\n[${new Date().toLocaleDateString()}] Paiement en retard`,
          updatedAt: new Date()
        })
        break
      
      case 'reminder':
        // Marquer qu'une relance a été envoyée
        updateEvent(eventId, {
          notes: `${event.notes || ''}\n[${new Date().toLocaleDateString()}] Relance envoyée`,
          updatedAt: new Date()
        })
        break
    }
  }, [events, updateEvent, markEventAsPaid])

  // Calculer les statistiques de facturation
  const getBillingStats = useCallback(() => {
    const now = new Date()
    
    const eventsToInvoice = events.filter(e => 
      e.status === EventStatus.COMPLETED && !e.invoiced
    )
    
    const invoicedEvents = events.filter(e => e.status === EventStatus.INVOICED)
    
    const paidEvents = events.filter(e => e.status === EventStatus.PAID)
    
    const overdueEvents = invoicedEvents.filter(e => {
      if (!e.invoiceDate) return false
      const daysSince = Math.floor((now.getTime() - new Date(e.invoiceDate).getTime()) / (1000 * 60 * 60 * 24))
      return daysSince > 30
    })
    
    const totalToInvoice = eventsToInvoice.reduce((sum, e) => sum + e.budget, 0)
    const totalInvoiced = invoicedEvents.reduce((sum, e) => sum + e.budget, 0)
    const totalPaid = paidEvents.reduce((sum, e) => sum + e.budget, 0)
    const totalOverdue = overdueEvents.reduce((sum, e) => sum + e.budget, 0)
    
    // Calculer les délais moyens
    const avgDaysToInvoice = paidEvents
      .filter(e => e.completedDate && e.invoiceDate)
      .reduce((sum, e) => {
        const days = Math.floor((new Date(e.invoiceDate!).getTime() - new Date(e.completedDate!).getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0) / Math.max(1, paidEvents.filter(e => e.completedDate && e.invoiceDate).length)
    
    const avgDaysToPay = paidEvents
      .filter(e => e.invoiceDate && e.paidDate)
      .reduce((sum, e) => {
        const days = Math.floor((new Date(e.paidDate!).getTime() - new Date(e.invoiceDate!).getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0) / Math.max(1, paidEvents.filter(e => e.invoiceDate && e.paidDate).length)

    return {
      // Compteurs
      eventsToInvoice: eventsToInvoice.length,
      eventsInvoiced: invoicedEvents.length,
      eventsPaid: paidEvents.length,
      eventsOverdue: overdueEvents.length,
      
      // Montants
      totalToInvoice,
      totalInvoiced,
      totalPaid,
      totalOverdue,
      
      // Délais moyens
      avgDaysToInvoice: Math.round(avgDaysToInvoice || 0),
      avgDaysToPay: Math.round(avgDaysToPay || 0),
      
      // Listes d'événements
      toInvoiceList: eventsToInvoice,
      invoicedList: invoicedEvents,
      paidList: paidEvents,
      overdueList: overdueEvents
    }
  }, [events])

  return {
    // Actions principales
    archiveAndInvoiceEvent,
    markEventAsPaid,
    updatePaymentStatus,
    
    // Statistiques
    getBillingStats,
    
    // Getters utiles
    // BUG #7 FIX: Vérifier que l'équipe est complète avant de permettre la facturation
    getEventsToInvoice: useCallback(() =>
      events.filter(e => {
        if (e.status !== EventStatus.COMPLETED || e.invoiced) return false

        // Vérifier que l'équipe de fleuristes est complète
        const requiredFlorists = e.floristsRequired || 1
        const confirmedFlorists = e.assignedFlorists?.filter(
          af => af.status === 'confirmed' || af.isConfirmed
        ).length || 0

        return confirmedFlorists >= requiredFlorists
      }),
      [events]
    ),
    
    getInvoicedEvents: useCallback(() => 
      events.filter(e => e.status === EventStatus.INVOICED), 
      [events]
    ),
    
    getPaidEvents: useCallback(() => 
      events.filter(e => e.status === EventStatus.PAID), 
      [events]
    )
  }
}

export default useBillingWorkflow