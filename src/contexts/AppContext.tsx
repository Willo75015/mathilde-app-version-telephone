import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { AppState, Event, Client, EventStatus, Theme, Florist } from '@/types'
import { isSupabaseEnabled } from '@/lib/supabase'
import { supabaseService } from '@/lib/supabase-service'

// Interface du contexte - MODE FULL SUPABASE
interface AppContextType {
  state: AppState
  actions: {
    updateEvent: (id: string, event: Partial<Event>) => void
    updateEventWithTeamCheck: (id: string, event: Partial<Event>) => void
    updateEventWithStatusDates: (id: string, newStatus: EventStatus) => void
    createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>
    deleteEvent: (id: string) => void
    updateClient: (id: string, client: Partial<Client>) => void
    createClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>
    deleteClient: (id: string) => void
    setError: (error: string | null) => void
    setLoading: (loading: boolean) => void
    generateNotSelectedMessage: (floristName: string, eventTitle: string, eventDate: Date) => string
    syncClientNames: () => void
    refreshFromSupabase: () => Promise<void>
  }
  isSupabaseMode: boolean
}

const AppContext = createContext<AppContextType | null>(null)

// ============================================
// PROVIDER - MODE FULL SUPABASE (pas de localStorage)
// ============================================
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [florists, setFlorists] = useState<Florist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseMode] = useState(true) // Toujours true en mode full Supabase
  const initRef = useRef(false)
  const unsubscribeRef = useRef<(() => void)[]>([])

  // Charger depuis Supabase uniquement
  const loadFromSupabase = useCallback(async () => {
    if (!isSupabaseEnabled()) {
      console.error('❌ ERREUR: Supabase non configuré - L\'app nécessite Supabase')
      setError('Supabase non configuré. Vérifiez les variables d\'environnement.')
      return false
    }

    try {
      console.log('🔄 Chargement depuis Supabase (mode full cloud)...')
      const [supabaseEvents, supabaseClients, supabaseFlorists] = await Promise.all([
        supabaseService.getEvents(),
        supabaseService.getClients(),
        supabaseService.getFlorists()
      ])

      setEvents(supabaseEvents)
      setClients(supabaseClients)
      if (supabaseFlorists.length > 0) {
        setFlorists(supabaseFlorists)
      }

      console.log('✅ Données chargées depuis Supabase:', {
        events: supabaseEvents.length,
        clients: supabaseClients.length,
        florists: supabaseFlorists.length
      })
      return true
    } catch (error) {
      console.error('❌ Erreur chargement Supabase:', error)
      setError('Erreur de connexion à Supabase. Vérifiez votre connexion internet.')
      return false
    }
  }, [])

  // Configurer les abonnements temps réel
  const setupRealtimeSubscriptions = useCallback(() => {
    if (!isSupabaseEnabled()) return

    console.log('📡 Configuration des abonnements temps réel...')

    const unsubEvents = supabaseService.subscribeToEvents((newEvents) => {
      console.log('🔄 Sync temps réel - événements:', newEvents.length)
      setEvents(newEvents)
    })

    const unsubClients = supabaseService.subscribeToClients((newClients) => {
      console.log('🔄 Sync temps réel - clients:', newClients.length)
      setClients(newClients)
    })

    const unsubFlorists = supabaseService.subscribeToFlorists((newFlorists) => {
      console.log('🔄 Sync temps réel - fleuristes:', newFlorists.length)
      setFlorists(newFlorists)
    })

    if (unsubEvents) unsubscribeRef.current.push(unsubEvents)
    if (unsubClients) unsubscribeRef.current.push(unsubClients)
    if (unsubFlorists) unsubscribeRef.current.push(unsubFlorists)

    console.log('✅ Abonnements temps réel configurés')
  }, [])

  // INITIALISATION - SUPABASE UNIQUEMENT
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true

      const initialize = async () => {
        setIsLoading(true)
        setError(null)

        const success = await loadFromSupabase()

        if (success) {
          setupRealtimeSubscriptions()
        }

        setIsLoading(false)
        console.log('✅ App initialisée en mode FULL SUPABASE')
      }

      initialize()
    }

    return () => {
      unsubscribeRef.current.forEach(unsub => unsub())
      unsubscribeRef.current = []
    }
  }, [loadFromSupabase, setupRealtimeSubscriptions])

  // ============================================
  // ACTIONS - SUPABASE UNIQUEMENT (pas de localStorage)
  // ============================================

  const updateEvent = async (id: string, eventUpdate: Partial<Event>) => {
    // Mise à jour optimiste de l'UI
    setEvents(prev => prev.map(event =>
      event.id === id ? { ...event, ...eventUpdate, updatedAt: new Date() } : event
    ))

    // Sync avec Supabase
    try {
      await supabaseService.updateEvent(id, eventUpdate)
      console.log('✅ Événement mis à jour sur Supabase')
    } catch (error) {
      console.error('❌ Erreur updateEvent Supabase:', error)
      // Recharger pour revenir à l'état correct
      await loadFromSupabase()
    }
  }

  const updateEventWithTeamCheck = async (id: string, eventUpdate: Partial<Event>) => {
    const currentEvent = events.find(e => e.id === id)
    if (!currentEvent) return

    let finalUpdate = { ...eventUpdate }

    // LOGIQUE WORKFLOW
    if (eventUpdate.assignedFlorists) {
      const requiredFlorists = currentEvent.floristsRequired || 2
      const confirmedFlorists = eventUpdate.assignedFlorists.filter(f =>
        f.status === 'confirmed' || f.isConfirmed
      )

      if (confirmedFlorists.length >= requiredFlorists && confirmedFlorists.length > 0) {
        const updatedFlorists = eventUpdate.assignedFlorists.map(florist => {
          if (florist.status === 'pending') {
            const eventDate = eventUpdate.date || currentEvent.date || new Date()
            const formattedDate = eventDate.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric'
            })

            return {
              ...florist,
              status: 'not_selected' as const,
              preWrittenMessage: `Bonjour ${florist.floristName?.split(' ')[0]},\n\nL'événement "${eventUpdate.title || currentEvent.title}" du ${formattedDate} est pourvu.\n\nMerci pour votre disponibilité !\n\nMathilde Fleurs`
            }
          }
          return florist
        })

        finalUpdate = { ...finalUpdate, assignedFlorists: updatedFlorists }
      }
    }

    // Mise à jour optimiste
    setEvents(prev => prev.map(event =>
      event.id === id ? { ...event, ...finalUpdate, updatedAt: new Date() } : event
    ))

    // Sync Supabase
    try {
      await supabaseService.updateEvent(id, finalUpdate)
    } catch (error) {
      console.error('❌ Erreur updateEventWithTeamCheck Supabase:', error)
      await loadFromSupabase()
    }
  }

  const updateEventWithStatusDates = async (id: string, newStatus: EventStatus) => {
    const currentEvent = events.find(e => e.id === id)
    if (!currentEvent) return

    let updates: Partial<Event> = { status: newStatus, updatedAt: new Date() }

    switch (newStatus) {
      case EventStatus.COMPLETED:
        updates.completedDate = new Date()
        break
      case EventStatus.INVOICED:
        updates.completedDate = currentEvent.completedDate || new Date()
        updates.invoiced = true
        updates.invoiceDate = new Date()
        updates.archived = true
        break
      case EventStatus.PAID:
        updates.completedDate = currentEvent.completedDate || new Date()
        updates.paid = true
        updates.paidDate = new Date()
        updates.paymentMethod = 'transfer'
        break
    }

    // Mise à jour optimiste
    setEvents(prev => prev.map(event =>
      event.id === id ? { ...event, ...updates } : event
    ))

    // Sync Supabase
    try {
      await supabaseService.updateEvent(id, updates)
    } catch (error) {
      console.error('❌ Erreur updateEventWithStatusDates Supabase:', error)
      await loadFromSupabase()
    }
  }

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const tempId = `temp-${Date.now()}`
    const newEvent: Event = {
      ...eventData,
      id: tempId,
      title: eventData.title || 'Nouvel événement',
      description: eventData.description || '',
      date: eventData.date || new Date(),
      time: eventData.time || '09:00',
      location: eventData.location || 'À définir',
      budget: eventData.budget || 0,
      status: eventData.status || EventStatus.DRAFT,
      flowers: eventData.flowers || [],
      assignedFlorists: eventData.assignedFlorists || [],
      floristsRequired: eventData.floristsRequired, // Validation faite dans le modal
      clientId: eventData.clientId || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Ajout optimiste
    setEvents(prev => [...prev, newEvent])

    // Créer sur Supabase
    try {
      const created = await supabaseService.createEvent(eventData)
      if (created) {
        // Remplacer l'événement temporaire par celui de Supabase
        setEvents(prev => prev.map(e => e.id === tempId ? created : e))
        console.log('✅ Événement créé sur Supabase:', created.id)
        return created
      }
    } catch (error) {
      console.error('❌ Erreur createEvent Supabase:', error)
      // Retirer l'événement temporaire en cas d'erreur
      setEvents(prev => prev.filter(e => e.id !== tempId))
    }

    return newEvent
  }

  const deleteEvent = async (id: string) => {
    // Suppression optimiste
    setEvents(prev => prev.filter(event => event.id !== id))

    // Sync Supabase
    try {
      await supabaseService.deleteEvent(id)
      console.log('✅ Événement supprimé de Supabase')
    } catch (error) {
      console.error('❌ Erreur deleteEvent Supabase:', error)
      await loadFromSupabase()
    }
  }

  const updateClient = async (id: string, clientUpdate: Partial<Client>) => {
    // Mise à jour optimiste
    setClients(prev => prev.map(client =>
      client.id === id ? { ...client, ...clientUpdate, updatedAt: new Date() } : client
    ))

    // Sync Supabase
    try {
      await supabaseService.updateClient(id, clientUpdate)
    } catch (error) {
      console.error('❌ Erreur updateClient Supabase:', error)
      await loadFromSupabase()
    }
  }

  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const tempId = `temp-${Date.now()}`
    const newClient: Client = {
      ...clientData,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Ajout optimiste
    setClients(prev => [...prev, newClient])

    // Créer sur Supabase
    try {
      const created = await supabaseService.createClient(clientData)
      if (created) {
        setClients(prev => prev.map(c => c.id === tempId ? created : c))
        console.log('✅ Client créé sur Supabase:', created.id)
        return created
      }
    } catch (error) {
      console.error('❌ Erreur createClient Supabase:', error)
      setClients(prev => prev.filter(c => c.id !== tempId))
    }

    return newClient
  }

  const deleteClient = async (id: string) => {
    // Mettre à jour les événements liés
    setEvents(prev => prev.map(event => {
      if (event.clientId === id) {
        return { ...event, clientId: '', clientName: 'Client supprimé', updatedAt: new Date() }
      }
      return event
    }))

    // Suppression optimiste du client
    setClients(prev => prev.filter(client => client.id !== id))

    // Sync Supabase
    try {
      await supabaseService.deleteClient(id)
      console.log('✅ Client supprimé de Supabase')
    } catch (error) {
      console.error('❌ Erreur deleteClient Supabase:', error)
      await loadFromSupabase()
    }
  }

  const generateNotSelectedMessage = (floristName: string, eventTitle: string, eventDate: Date) => {
    const formattedDate = eventDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    })

    return `Bonjour ${floristName},

L'événement "${eventTitle}" du ${formattedDate} est pourvu.

Merci pour votre disponibilité !

Mathilde Fleurs`
  }

  const syncClientNames = () => {
    console.log('🔄 Sync demandée')
  }

  const refreshFromSupabase = async (): Promise<void> => {
    console.log('🔄 Rafraîchissement depuis Supabase...')
    setIsLoading(true)
    await loadFromSupabase()
    setIsLoading(false)
  }

  // ============================================
  // STATE & ACTIONS
  // ============================================
  const state: AppState = {
    user: null,
    events,
    clients,
    flowers: [],
    florists: florists,
    isLoading,
    error,
    theme: Theme.LIGHT
  }

  const actions = {
    updateEvent,
    updateEventWithTeamCheck,
    updateEventWithStatusDates,
    createEvent,
    deleteEvent,
    updateClient,
    createClient,
    deleteClient,
    setError,
    setLoading: setIsLoading,
    generateNotSelectedMessage,
    syncClientNames,
    refreshFromSupabase
  }

  return (
    <AppContext.Provider value={{ state, actions, isSupabaseMode }}>
      {children}
    </AppContext.Provider>
  )
}

// ============================================
// HOOKS
// ============================================
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const useEvents = () => {
  const { state, actions } = useApp()

  const now = new Date()

  return {
    events: state.events,
    isLoading: state.isLoading,
    error: state.error,

    updateEvent: actions.updateEvent,
    updateEventWithTeamCheck: actions.updateEventWithTeamCheck,
    updateEventWithStatusDates: actions.updateEventWithStatusDates,
    createEvent: actions.createEvent,
    deleteEvent: actions.deleteEvent,

    upcomingEvents: state.events.filter(event => event.date > now),
    eventStats: {
      total: state.events.length,
      completed: state.events.filter(event => event.status === EventStatus.COMPLETED).length,
      upcoming: state.events.filter(event => event.date > now).length
    },
    todayEvents: state.events.filter(event =>
      event.date.toDateString() === now.toDateString()
    ),

    getEventsByClient: (clientId: string) => {
      return state.events.filter(event => event.clientId === clientId)
    }
  }
}

export const useClients = () => {
  const { state, actions } = useApp()

  return {
    clients: state.clients,
    isLoading: state.isLoading,
    error: state.error,

    updateClient: actions.updateClient,
    createClient: actions.createClient,
    deleteClient: actions.deleteClient,

    getClientByEmail: (email: string) => {
      return state.clients.find(client => client.email === email)
    }
  }
}

export const useFlorists = () => {
  const { state } = useApp()

  return {
    florists: state.florists || [],
    isLoading: state.isLoading,
    error: state.error
  }
}
