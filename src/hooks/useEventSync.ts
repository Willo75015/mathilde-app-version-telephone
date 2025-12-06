import { useEffect, useCallback, useRef, useMemo } from 'react'
import { Event } from '@/types'
import { useApp } from '@/contexts/AppContext'

// Hook pour synchroniser les événements entre tous les modals et composants
export const useEventSync = () => {
  const { state, actions } = useApp()
  const listenersRef = useRef<Set<(event: Event) => void>>(new Set())

  // Émettre un événement de synchronisation
  const emitEventSync = useCallback((updatedEvent: Event, source: string) => {
    console.log(`🔄 SYNC [${source}] - Émission synchronisation:`, {
      eventId: updatedEvent.id,
      title: updatedEvent.title,
      assignedFlorists: updatedEvent.assignedFlorists?.length || 0
    })

    // Mettre à jour le state global immédiatement
    actions.updateEvent(updatedEvent.id, updatedEvent)

    // Émettre un événement custom pour tous les composants
    window.dispatchEvent(new CustomEvent('eventSynchronized', {
      detail: { 
        event: updatedEvent, 
        source,
        timestamp: Date.now()
      }
    }))

    // Notifier tous les listeners enregistrés
    listenersRef.current.forEach(listener => {
      try {
        listener(updatedEvent)
      } catch (error) {
        console.error('❌ SYNC - Erreur listener:', error)
      }
    })

    console.log(`✅ SYNC [${source}] - Synchronisation émise`)
  }, [actions])

  // S'abonner aux changements d'événements
  const subscribeToEventChanges = useCallback((listener: (event: Event) => void) => {
    listenersRef.current.add(listener)
    
    // Retourner une fonction de désabonnement
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  // Synchroniser les assignations de fleuristes spécifiquement
  const syncFloristAssignments = useCallback((
    eventId: string, 
    assignedFlorists: any[], 
    source: string = 'FloristModal'
  ) => {
    console.log(`🔄 SYNC [${source}] - Synchronisation assignations:`, {
      eventId,
      floristsCount: assignedFlorists.length
    })

    const currentEvent = state.events.find(e => e.id === eventId)
    if (!currentEvent) {
      console.error('❌ SYNC - Événement non trouvé:', eventId)
      return
    }

    const updatedEvent: Event = {
      ...currentEvent,
      assignedFlorists,
      updatedAt: new Date()
    }

    emitEventSync(updatedEvent, source)
  }, [state.events, emitEventSync])

  // Écouter les événements de synchronisation
  useEffect(() => {
    const handleEventSync = (e: CustomEvent) => {
      const { event, source } = e.detail
      console.log(`📨 SYNC - Réception synchronisation de [${source}]:`, event.id)
    }

    window.addEventListener('eventSynchronized', handleEventSync as EventListener)
    
    return () => {
      window.removeEventListener('eventSynchronized', handleEventSync as EventListener)
    }
  }, [])

  return {
    emitEventSync,
    subscribeToEventChanges,
    syncFloristAssignments,
    // Getter pour avoir l'événement le plus récent
    getLatestEvent: useCallback((eventId: string) => {
      return state.events.find(e => e.id === eventId) || null
    }, [state.events])
  }
}

// Hook spécialisé pour les modals - CORRIGÉ POUR ÉVITER LA BOUCLE INFINIE
export const useModalEventSync = (eventId: string | null, modalName: string) => {
  const { subscribeToEventChanges, getLatestEvent } = useEventSync()

  // 🔧 CORRECTION: Utiliser useMemo pour éviter les re-calculs inutiles
  const latestEvent = useMemo(() => {
    return eventId ? getLatestEvent(eventId) : null
  }, [eventId, getLatestEvent])

  // S'abonner aux changements pour ce modal spécifique
  useEffect(() => {
    if (!eventId) return

    const unsubscribe = subscribeToEventChanges((updatedEvent) => {
      if (updatedEvent.id === eventId) {
        console.log(`📨 MODAL [${modalName}] - Événement synchronisé:`, {
          eventId: updatedEvent.id,
          assignedFlorists: updatedEvent.assignedFlorists?.length || 0
        })
        
        // Force refresh du composant parent si nécessaire
        window.dispatchEvent(new CustomEvent(`${modalName}EventUpdated`, {
          detail: { event: updatedEvent }
        }))
      }
    })

    return unsubscribe
  }, [eventId, modalName, subscribeToEventChanges])

  return {
    latestEvent,
    isEventOutdated: useCallback((currentEvent: Event | null) => {
      if (!currentEvent || !latestEvent) return false
      return currentEvent.updatedAt < latestEvent.updatedAt
    }, [latestEvent])
  }
}
