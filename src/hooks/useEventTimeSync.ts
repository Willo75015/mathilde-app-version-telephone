import { useEffect, useCallback } from 'react'
import { useTime } from '@/contexts/TimeContext'
import { useApp } from '@/contexts/AppContext'
import { EventStatus } from '@/types'

export const useEventTimeSync = () => {
  const { currentTime, currentDate } = useTime()
  const { state, actions } = useApp()
  
  // Fonction pour calculer le statut automatique d'un événement selon l'heure
  const getAutoEventStatus = useCallback((event: any) => {
    const now = currentTime
    const eventStartDate = new Date(event.date)
    const eventEndDate = event.endDate ? new Date(event.endDate) : null
    
    // Normaliser les dates (sans heures) pour comparaison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const eventDay = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate())
    
    // 📅 STATUTS FINAUX (ne changent plus automatiquement)
    if (event.status === EventStatus.COMPLETED || 
        event.status === EventStatus.CANCELLED ||
        event.status === EventStatus.INVOICED ||
        event.status === EventStatus.PAID) {
      return event.status // Garder le statut final
    }
    
    // 🔄 LOGIQUE AUTOMATIQUE SELON LA DATE ET L'HEURE
    
    // Événement dans le futur
    if (eventDay > today) {
      const assignedCount = event.assignedFlorists?.length || 0
      const confirmedCount = event.assignedFlorists?.filter((f: any) => 
        f.isConfirmed && f.status === 'confirmed'
      ).length || 0
      const requiredCount = event.floristsRequired || 0
      
      // Si manque des fleuristes → DRAFT
      if (assignedCount < requiredCount || confirmedCount < requiredCount) {
        return EventStatus.DRAFT
      }
      
      // Si tous les fleuristes sont confirmés → CONFIRMED
      return EventStatus.CONFIRMED
    }
    
    // Événement aujourd'hui
    if (eventDay.getTime() === today.getTime()) {
      // Vérifier l'heure si on a une heure de fin
      if (eventEndDate && now > eventEndDate) {
        return EventStatus.COMPLETED // Terminé automatiquement
      }
      
      // Sinon, en cours
      return EventStatus.IN_PROGRESS
    }
    
    // Événement passé
    if (eventDay < today) {
      // Vérifier si on a une heure de fin spécifique
      if (eventEndDate && now > eventEndDate) {
        return EventStatus.COMPLETED // Terminé automatiquement
      }
      
      // Si pas d'heure de fin, considérer terminé le lendemain
      const nextDay = new Date(eventDay)
      nextDay.setDate(nextDay.getDate() + 1)
      
      if (now >= nextDay) {
        return EventStatus.COMPLETED // Terminé automatiquement
      }
      
      // Sinon encore en cours (cas rare)
      return EventStatus.IN_PROGRESS
    }
    
    return event.status // Fallback
  }, [currentTime])
  
  // Fonction pour mettre à jour automatiquement les statuts
  const syncEventStatuses = useCallback(() => {
    let updatedCount = 0
    
    state.events.forEach(event => {
      const currentStatus = event.status
      const autoStatus = getAutoEventStatus(event)
      
      // Mettre à jour seulement si le statut a changé
      if (currentStatus !== autoStatus) {
        console.log(`🔄 Événement "${event.title}": ${currentStatus} → ${autoStatus}`)
        actions.updateEventWithStatusDates(event.id, autoStatus)
        updatedCount++
      }
    })
    
    if (updatedCount > 0) {
      console.log(`✅ ${updatedCount} événement(s) synchronisé(s) avec l'heure actuelle`)
    }
  }, [state.events, getAutoEventStatus, actions])
  
  // Synchronisation automatique toutes les minutes
  useEffect(() => {
    // Synchroniser immédiatement
    syncEventStatuses()
    
    // Puis toutes les minutes
    const interval = setInterval(syncEventStatuses, 60000) // 1 minute
    
    return () => clearInterval(interval)
  }, [syncEventStatuses])
  
  // 🚫 DÉSACTIVÉ TEMPORAIREMENT - CAUSE DES BOUCLES
  // useEffect(() => {
  //   console.log('📅 Date changée, synchronisation des événements...')
  //   syncEventStatuses()
  // }, [currentDate, syncEventStatuses])
  
  // Fonctions utilitaires
  const getEventsByStatus = useCallback((status: EventStatus) => {
    return state.events.filter(event => getAutoEventStatus(event) === status)
  }, [state.events, getAutoEventStatus])
  
  const getTodaysEvents = useCallback(() => {
    const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate())
    
    return state.events.filter(event => {
      const eventDay = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate())
      return eventDay.getTime() === today.getTime()
    })
  }, [state.events, currentTime])
  
  const getUpcomingEvents = useCallback(() => {
    const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate())
    
    return state.events.filter(event => {
      const eventDay = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate())
      return eventDay > today && getAutoEventStatus(event) !== EventStatus.CANCELLED
    }).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [state.events, currentTime, getAutoEventStatus])
  
  const getOverdueEvents = useCallback(() => {
    const now = currentTime
    
    return state.events.filter(event => {
      const eventDate = new Date(event.date)
      
      // 🔧 FIX: Comparer les DATES seulement, pas les heures
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
      
      // Un événement est en retard seulement si sa DATE est antérieure à aujourd'hui
      const isOverdue = eventDay < today
      
      const isNotCompleted = getAutoEventStatus(event) !== EventStatus.COMPLETED &&
                            getAutoEventStatus(event) !== EventStatus.CANCELLED &&
                            getAutoEventStatus(event) !== EventStatus.INVOICED &&
                            getAutoEventStatus(event) !== EventStatus.PAID
      
      return isOverdue && isNotCompleted
    })
  }, [state.events, currentTime, getAutoEventStatus])
  
  return {
    // Fonctions
    getAutoEventStatus,
    syncEventStatuses,
    
    // Événements filtrés synchronisés
    getEventsByStatus,
    getTodaysEvents,
    getUpcomingEvents,
    getOverdueEvents,
    
    // Stats en temps réel
    todaysEventsCount: getTodaysEvents().length,
    upcomingEventsCount: getUpcomingEvents().length,
    overdueEventsCount: getOverdueEvents().length,
    
    // Heure de référence
    currentTime,
    currentDate
  }
}

// Hook pour surveiller un événement spécifique
export const useEventTimeStatus = (eventId: string) => {
  const { getAutoEventStatus, currentTime } = useEventTimeSync()
  const { state } = useApp()
  
  const event = state.events.find(e => e.id === eventId)
  
  if (!event) {
    return {
      event: null,
      currentStatus: null,
      autoStatus: null,
      isOutOfSync: false,
      timeUntilEvent: null,
      isToday: false,
      isPast: false
    }
  }
  
  const autoStatus = getAutoEventStatus(event)
  const isOutOfSync = event.status !== autoStatus
  
  const now = currentTime
  const eventDate = new Date(event.date)
  const timeUntilEvent = eventDate.getTime() - now.getTime()
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  
  const isToday = eventDay.getTime() === today.getTime()
  const isPast = eventDay < today
  
  return {
    event,
    currentStatus: event.status,
    autoStatus,
    isOutOfSync,
    timeUntilEvent,
    isToday,
    isPast,
    daysUntilEvent: Math.ceil(timeUntilEvent / (1000 * 60 * 60 * 24))
  }
}
