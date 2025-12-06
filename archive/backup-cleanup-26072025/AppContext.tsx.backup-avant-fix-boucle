import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { AppState, Event, Client, EventStatus, Theme, Florist } from '@/types'
import { mockEvents, mockClients } from '@/lib/mockData'
import { StorageManager } from '@/lib/storage'

// 🆕 FONCTION UTILITAIRE : Synchroniser clientName avec clientId
const enrichEventWithClientName = (event: Event, clients: Client[]): Event => {
  console.log('🔥 DEBUG enrichEventWithClientName - DÉBUT')
  console.log('🔥 Event.clientId:', event.clientId)
  console.log('🔥 Event.clientName actuel:', event.clientName)
  console.log('🔥 Clients disponibles:', clients.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}` })))
  
  if (!event.clientName || event.clientName === 'Client non spécifié') {
    const client = clients.find(c => c.id === event.clientId)
    console.log('🔥 Client trouvé:', client)
    if (client) {
      const enrichedEvent = {
        ...event,
        clientName: `${client.firstName} ${client.lastName}`
      }
      console.log('🔥 Event enrichi:', { clientId: enrichedEvent.clientId, clientName: enrichedEvent.clientName })
      return enrichedEvent
    }
  }
  console.log('🔥 Pas d\'enrichissement nécessaire')
  return event
}

// 🆕 FONCTION UTILITAIRE : Enrichir tous les événements avec les noms de clients
const enrichEventsWithClientNames = (events: Event[], clients: Client[]): Event[] => {
  return events.map(event => enrichEventWithClientName(event, clients))
}

// Actions du reducer
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: { id: string; event: Partial<Event> } }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: { id: string; client: Partial<Client> } }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'INIT_DATA' }
  | { type: 'SYNC_FROM_STORAGE'; payload: { type: 'events' | 'clients'; data: any[] } }
  | { type: 'SYNC_CLIENT_NAMES' } // 🆕 Nouvelle action pour synchroniser les noms

// Reducer optimisé
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'INIT_DATA':
      // Charger depuis localStorage ou utiliser mock si vide
      const storage = StorageManager.getInstance()
      const storedEvents = storage.loadEvents()
      const storedClients = storage.loadClients()
      
      // Si pas de données stockées, utiliser les mocks et les sauvegarder
      let events = storedEvents
      let clients = storedClients
      
      if (events.length === 0) {
        events = mockEvents
        storage.saveEvents(events)
        console.log('🎯 Données mock chargées et sauvegardées - Events:', events.length)
      } else {
        console.log('📦 Données chargées depuis localStorage - Events:', events.length)
      }
      
      if (clients.length === 0) {
        clients = mockClients  
        storage.saveClients(clients)
        console.log('🎯 Données mock chargées et sauvegardées - Clients:', clients.length)
      } else {
        console.log('📦 Données chargées depuis localStorage - Clients:', clients.length)
      }
      
      // 🆕 ENRICHIR LES ÉVÉNEMENTS AVEC LES NOMS DE CLIENTS
      const enrichedEvents = enrichEventsWithClientNames(events, clients)
      console.log('✅ Événements enrichis avec noms de clients:', enrichedEvents.length)
      
      return {
        ...state,
        events: enrichedEvents,
        clients,
        isLoading: false
      }

    case 'SYNC_CLIENT_NAMES':
      // 🆕 SYNCHRONISER LES NOMS DE CLIENTS DANS TOUS LES ÉVÉNEMENTS
      const syncedEvents = enrichEventsWithClientNames(state.events, state.clients)
      console.log('🔄 Synchronisation des noms de clients terminée')
      return {
        ...state,
        events: syncedEvents
      }
      
    case 'SYNC_FROM_STORAGE':
      // Synchronisation depuis autre onglet ou composant
      if (action.payload.type === 'events') {
        console.log('🔄 Sync events depuis storage:', action.payload.data.length)
        // 🆕 Enrichir les événements synchronisés
        const enrichedSyncEvents = enrichEventsWithClientNames(action.payload.data, state.clients)
        return { ...state, events: enrichedSyncEvents }
      } else if (action.payload.type === 'clients') {
        console.log('🔄 Sync clients depuis storage:', action.payload.data.length)
        // 🆕 Quand les clients changent, re-synchroniser les noms dans les événements
        const enrichedEvents = enrichEventsWithClientNames(state.events, action.payload.data)
        return { ...state, clients: action.payload.data, events: enrichedEvents }
      }
      return state
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
      
    case 'SET_EVENTS':
      // 🆕 Enrichir automatiquement les événements lors de SET_EVENTS
      const enrichedSetEvents = enrichEventsWithClientNames(action.payload, state.clients)
      return { ...state, events: enrichedSetEvents, isLoading: false }
      
    case 'ADD_EVENT':
      // 🆕 Enrichir automatiquement le nouvel événement
      const enrichedNewEvent = enrichEventWithClientName(action.payload, state.clients)
      return { 
        ...state, 
        events: [...state.events, enrichedNewEvent],
        isLoading: false 
      }
      
    case 'UPDATE_EVENT':
      console.log('🔥 DEBUG REDUCER UPDATE_EVENT - DÉBUT')
      console.log('🔥 Action payload:', action.payload)
      return {
        ...state,
        events: state.events.map(event => {
          if (event.id === action.payload.id) {
            console.log('🔥 Événement trouvé pour mise à jour:', event.title)
            console.log('🔥 Ancien clientId:', event.clientId)
            console.log('🔥 Nouveau clientId:', action.payload.event.clientId)
            
            const updatedEvent = { ...event, ...action.payload.event, updatedAt: new Date() }
            console.log('🔥 Event avant enrichissement:', { 
              id: updatedEvent.id, 
              clientId: updatedEvent.clientId, 
              clientName: updatedEvent.clientName 
            })
            
            // 🆕 Enrichir automatiquement l'événement mis à jour
            const enrichedEvent = enrichEventWithClientName(updatedEvent, state.clients)
            console.log('🔥 Event après enrichissement:', { 
              id: enrichedEvent.id, 
              clientId: enrichedEvent.clientId, 
              clientName: enrichedEvent.clientName 
            })
            
            return enrichedEvent
          }
          return event
        }),
        isLoading: false
      }
      
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
        isLoading: false
      }
      
    case 'SET_CLIENTS':
      // 🆕 Quand les clients changent, re-synchroniser les noms dans les événements
      const enrichedEventsForNewClients = enrichEventsWithClientNames(state.events, action.payload)
      return { 
        ...state, 
        clients: action.payload, 
        events: enrichedEventsForNewClients,
        isLoading: false 
      }
      
    case 'ADD_CLIENT':
      const newClients = [...state.clients, action.payload]
      // 🆕 Re-synchroniser les événements avec le nouveau client
      const enrichedEventsForNewClient = enrichEventsWithClientNames(state.events, newClients)
      return {
        ...state,
        clients: newClients,
        events: enrichedEventsForNewClient,
        isLoading: false
      }
      
    case 'UPDATE_CLIENT':
      const updatedClients = state.clients.map(client => 
        client.id === action.payload.id 
          ? { ...client, ...action.payload.client, updatedAt: new Date() }
          : client
      )
      // 🆕 Re-synchroniser les événements avec le client mis à jour
      const enrichedEventsForUpdatedClient = enrichEventsWithClientNames(state.events, updatedClients)
      return {
        ...state,
        clients: updatedClients,
        events: enrichedEventsForUpdatedClient,
        isLoading: false
      }
      
    case 'DELETE_CLIENT':
      const filteredClients = state.clients.filter(client => client.id !== action.payload)
      // 🆕 Re-synchroniser les événements (ceux sans client valide auront "Client non spécifié")
      const enrichedEventsAfterClientDelete = state.events.map(event => {
        if (event.clientId === action.payload) {
          return { ...event, clientName: 'Client non spécifié' }
        }
        return enrichEventWithClientName(event, filteredClients)
      })
      return {
        ...state,
        clients: filteredClients,
        events: enrichedEventsAfterClientDelete,
        isLoading: false
      }
      
    default:
      return state
  }
}

// Interface du contexte avec actions stables
interface AppContextType {
  state: AppState
  actions: {
    // Events
    updateEvent: (id: string, event: Partial<Event>) => void
    updateEventWithTeamCheck: (id: string, event: Partial<Event>) => void // 🆕
    updateEventWithStatusDates: (id: string, newStatus: EventStatus) => void // 🆕 Nouvelle fonction
    createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void
    deleteEvent: (id: string) => void
    
    // Clients
    updateClient: (id: string, client: Partial<Client>) => void
    createClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void
    deleteClient: (id: string) => void
    
    // Utils
    setError: (error: string | null) => void
    setLoading: (loading: boolean) => void
    generateNotSelectedMessage: (floristName: string, eventTitle: string, eventDate: Date) => string // 🆕
    syncClientNames: () => void // 🆕 Nouvelle action publique
  }
}

const AppContext = createContext<AppContextType | null>(null)

// État initial stable
const initialState: AppState = {
  user: null,
  events: [],
  clients: [],
  flowers: [],
  florists: [
    {
      id: 'main-florist-bill',
      firstName: 'Bill',
      lastName: 'Billsantec',
      email: 'bill@mathilde-fleurs.com',
      phone: '+33 6 12 34 56 78',
      specialties: ['Mariage', 'Événement corporatif', 'Anniversaire'],
      experience: 'Expert',
      availability: 'available',
      rating: 4.9,
      isMainFlorist: true,
      unavailabilityPeriods: [
        {
          id: 'today-unavailable',
          startDate: new Date(),
          endDate: new Date(),
          reason: 'Indisponible aujourd\'hui',
          isActive: true
        }
      ]
    },
    {
      id: '1',
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@mathilde-fleurs.com',
      phone: '+33 6 23 45 67 89',
      specialties: ['Mariage', 'Événement corporatif'],
      experience: 'Expert',
      availability: 'available',
      rating: 4.8,
      isMainFlorist: false,
      unavailabilityPeriods: []
    },
    {
      id: '2',
      firstName: 'Paul',
      lastName: 'Renault',
      email: 'paul.renault@mathilde-fleurs.com',
      phone: '+33 6 34 56 78 90',
      specialties: ['Anniversaire', 'Événement corporatif'],
      experience: 'Intermédiaire',
      availability: 'available',
      rating: 4.5,
      isMainFlorist: false,
      unavailabilityPeriods: []
    },
    {
      id: '3',
      firstName: 'Jean',
      lastName: 'Moreau',
      email: 'jean.moreau@mathilde-fleurs.com',
      phone: '+33 6 45 67 89 01',
      specialties: ['Baptême', 'Anniversaire'],
      experience: 'Expert',
      availability: 'available',
      rating: 4.7,
      isMainFlorist: false,
      unavailabilityPeriods: []
    },
    {
      id: '4',
      firstName: 'Sophie',
      lastName: 'Durand',
      email: 'sophie.durand@mathilde-fleurs.com',
      phone: '+33 6 56 78 90 12',
      specialties: ['Mariage', 'Baptême'],
      experience: 'Expert',
      availability: 'available',
      rating: 4.9,
      isMainFlorist: false,
      unavailabilityPeriods: []
    },
    {
      id: '5',
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@mathilde-fleurs.com',
      phone: '+33 6 67 89 01 23',
      specialties: ['Anniversaire', 'Événement corporatif'],
      experience: 'Intermédiaire',
      availability: 'available',
      rating: 4.6,
      isMainFlorist: false,
      unavailabilityPeriods: []
    }
  ],
  isLoading: false,
  error: null,
  theme: Theme.LIGHT
}

// Provider optimisé avec actions stables
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  // Instance du StorageManager
  const storage = useMemo(() => StorageManager.getInstance(), [])
  
  // Initialiser les données au démarrage (une seule fois)
  useEffect(() => {
    dispatch({ type: 'INIT_DATA' })
  }, [])
  
  // 🔄 Synchronisation avec les autres onglets/composants - FIXÉ
  useEffect(() => {
    const handleStorageSync = (syncData: any) => {
      const { type, data } = syncData
      if (type === 'events' || type === 'clients') {
        dispatch({ type: 'SYNC_FROM_STORAGE', payload: { type, data } })
      }
    }
    
    storage.addListener(handleStorageSync)
    
    return () => {
      storage.removeListener(handleStorageSync)
    }
  }, []) // 🔧 SUPPRIMÉ storage des dépendances
  
  // 💾 Effet pour sauvegarder automatiquement les events - FIXÉ
  useEffect(() => {
    if (state.events.length > 0) {
      storage.saveEvents(state.events)
    }
  }, [state.events]) // 🔧 SUPPRIMÉ storage des dépendances
  
  // 💾 Effet pour sauvegarder automatiquement les clients - FIXÉ
  useEffect(() => {
    if (state.clients.length > 0) {
      storage.saveClients(state.clients)
    }
  }, [state.clients]) // 🔧 SUPPRIMÉ storage des dépendances
  
  // Actions stables avec useCallback
  const actions = useMemo(() => ({
    // Events
    updateEvent: (id: string, event: Partial<Event>) => {
      console.log('🔥 DEBUG AppContext.updateEvent - DÉBUT')
      console.log('🔥 ID:', id)
      console.log('🔥 Event partial reçu:', event)
      console.log('🔥 Event.clientId:', event.clientId)
      console.log('🔥 Event.clientName:', event.clientName)
      console.log('🔥 Clients disponibles:', state.clients.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}` })))
      dispatch({ type: 'UPDATE_EVENT', payload: { id, event } })
      console.log('🔥 Dispatch UPDATE_EVENT envoyé')
    },
    
    // 🆕 NOUVELLE FONCTION : Mise à jour avec logique d'équipe complète
    updateEventWithTeamCheck: (id: string, event: Partial<Event>) => {
      console.log('🔧 AppContext.updateEventWithTeamCheck appelé:', { id, event })
      
      // 2. Vérifier si l'équipe va être complète AVANT la mise à jour
      if (event.assignedFlorists) {
        // Trouver l'événement actuel pour connaître floristsRequired
        const currentEvent = state.events.find(e => e.id === id)
        const requiredFlorists = currentEvent?.floristsRequired || 2
        
        console.log('🔍 Événement actuel trouvé:', {
          eventId: id,
          currentEvent: currentEvent ? { 
            title: currentEvent.title, 
            floristsRequired: currentEvent.floristsRequired,
            existingAssignedCount: currentEvent.assignedFlorists?.length || 0
          } : null
        })
        
        const assignedFlorists = event.assignedFlorists
        const confirmedFlorists = assignedFlorists.filter(f => 
          f.status === 'confirmed' || f.isConfirmed
        )
        
        console.log('🎯 Vérification équipe:', {
          confirmés: confirmedFlorists.length,
          requis: requiredFlorists,
          progression: `${confirmedFlorists.length}/${requiredFlorists}`,
          estComplète: confirmedFlorists.length >= requiredFlorists,
          floristsDetails: assignedFlorists.map(f => ({
            nom: f.floristName,
            statut: f.status,
            isConfirmed: f.isConfirmed
          }))
        })
        
        // ✅ LOGIQUE CORRIGÉE : Seulement si l'équipe vient d'être complète (100%)
        if (confirmedFlorists.length >= requiredFlorists && confirmedFlorists.length > 0) {
          console.log('🎉 ÉQUIPE COMPLÈTE (100%) ! Auto-passage des "pending" → "not_selected"')
          
          // Passer tous les "pending" en "not_selected"
          const updatedFlorists = assignedFlorists.map(florist => {
            if (florist.status === 'pending') {
              console.log(`📝 ${florist.floristName} → "not_selected" (équipe complète)`)
              return { ...florist, status: 'not_selected' as const }
            }
            return florist
          })
          
          console.log('✅ Fleuristes après mise à jour:', updatedFlorists.map(f => ({
            nom: f.floristName,
            nouveauStatut: f.status
          })))
          
          // 1. Mettre à jour l'événement avec les florists modifiés
          dispatch({ type: 'UPDATE_EVENT', payload: { id, event: { ...event, assignedFlorists: updatedFlorists } } })
          return
        } else {
          console.log('⚠️ Équipe PAS complète - Les "pending" restent en attente')
        }
      }
      
      // 1. Mise à jour normale si pas d'équipe complète
      dispatch({ type: 'UPDATE_EVENT', payload: { id, event } })
    },
    
    // 🆕 NOUVELLE FONCTION : Mise à jour avec dates automatiques selon le statut
    updateEventWithStatusDates: (id: string, newStatus: EventStatus) => {
      console.log('🔧 AppContext.updateEventWithStatusDates appelé:', { id, newStatus })
      
      const currentEvent = state.events.find(e => e.id === id)
      if (!currentEvent) {
        console.error('❌ Événement non trouvé:', id)
        return
      }

      let updates: Partial<Event> = {
        status: newStatus,
        updatedAt: new Date()
      }

      // 🔧 Ajouter les dates appropriées selon le statut
      switch (newStatus) {
        case EventStatus.COMPLETED:
          updates.completedDate = currentEvent.completedDate || new Date()
          console.log('✅ Ajout completedDate pour COMPLETED')
          break
          
        case EventStatus.INVOICED:
          updates.completedDate = currentEvent.completedDate || new Date()
          updates.invoiced = true
          updates.invoiceDate = new Date()
          updates.archived = true
          console.log('📋 Ajout dates pour INVOICED')
          break
          
        case EventStatus.PAID:
          updates.completedDate = currentEvent.completedDate || new Date()
          updates.paid = true
          updates.paidDate = new Date()
          updates.paymentMethod = updates.paymentMethod || 'transfer'
          console.log('💰 Ajout dates pour PAID')
          break
      }

      console.log('📊 Updates finales:', updates)
      dispatch({ type: 'UPDATE_EVENT', payload: { id, event: updates } })
    },
    generateNotSelectedMessage: (floristName: string, eventTitle: string, eventDate: Date) => {
      const formattedDate = eventDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'numeric', 
        year: 'numeric'
      })
      
      return `Bonjour ${floristName},

L'événement "${eventTitle}" du ${formattedDate} est pourvu.

Merci pour votre disponibilité !

Mathilde Fleurs`
    },
    
    createEvent: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
      console.log('🆕 AppContext.createEvent - Données reçues:', eventData)
      
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: eventData.title || 'Nouvel événement',
        description: eventData.description || '',
        time: eventData.time || '09:00',
        location: eventData.location || 'À définir',
        budget: eventData.budget || 0,
        status: eventData.status || EventStatus.DRAFT,
        flowers: eventData.flowers || [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      console.log('🆕 AppContext.createEvent - Événement final:', newEvent)
      dispatch({ type: 'ADD_EVENT', payload: newEvent })
    },
    
    deleteEvent: (id: string) => {
      dispatch({ type: 'DELETE_EVENT', payload: id })
    },
    
    // Clients
    updateClient: (id: string, client: Partial<Client>) => {
      dispatch({ type: 'UPDATE_CLIENT', payload: { id, client } })
    },
    
    createClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newClient: Client = {
        ...clientData,
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      dispatch({ type: 'ADD_CLIENT', payload: newClient })
    },
    
    deleteClient: (id: string) => {
      dispatch({ type: 'DELETE_CLIENT', payload: id })
    },
    
    // Utils
    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error })
    },
    
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading })
    },
    
    // 🆕 NOUVELLE FONCTION PUBLIQUE : Synchroniser manuellement les noms de clients
    syncClientNames: () => {
      console.log('🔄 Synchronisation manuelle des noms de clients demandée')
      dispatch({ type: 'SYNC_CLIENT_NAMES' })
    },
    
    // 🔧 NOUVELLE FONCTION : Nettoyer les doublons
    cleanDuplicateEvents: () => {
      console.log('🧹 Nettoyage des doublons démarré...')
      
      const eventsMap = new Map<string, Event>()
      const uniqueEvents: Event[] = []
      
      // Identifier les doublons basés sur titre + date + client
      state.events.forEach(event => {
        const key = `${event.title}-${event.date.toDateString()}-${event.clientId}-${event.time}`
        
        if (eventsMap.has(key)) {
          // Doublon détecté - garder le plus récent (updatedAt)
          const existingEvent = eventsMap.get(key)!
          if (event.updatedAt > existingEvent.updatedAt) {
            eventsMap.set(key, event)
          }
        } else {
          eventsMap.set(key, event)
        }
      })
      
      // Convertir en array
      eventsMap.forEach(event => uniqueEvents.push(event))
      
      console.log(`🧹 Nettoyage terminé: ${state.events.length} → ${uniqueEvents.length} événements`)
      
      // Mettre à jour le state avec les événements uniques
      dispatch({ type: 'SET_EVENTS', payload: uniqueEvents })
    }
  }), [state.events, state.clients]) // 🆕 Ajouter state.clients pour les fonctions de synchronisation
  
  // Valeur du contexte stable
  const contextValue = useMemo(() => ({
    state,
    actions
  }), [state, actions])
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Hook de base
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

// Hook Events simplifié avec actions stables
export const useEvents = () => {
  const { state, actions } = useApp()
  
  // Computed values stables avec références stables
  const computedValues = useMemo(() => {
    const now = new Date()
    
    const getUpcomingEvents = () => {
      return state.events
        .filter(event => event.date > now)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
    }
    
    const getEventStats = () => {
      const total = state.events.length
      const completed = state.events.filter(event => 
        event.status === EventStatus.COMPLETED
      ).length
      const upcoming = state.events.filter(event => 
        event.date > now && event.status !== EventStatus.CANCELLED
      ).length
      
      return { total, completed, upcoming }
    }
    
    const getTodayEvents = () => {
      const today = new Date()
      return state.events.filter(event => 
        event.date.toDateString() === today.toDateString()
      )
    }
    
    return {
      upcomingEvents: getUpcomingEvents(),
      eventStats: getEventStats(),
      todayEvents: getTodayEvents()
    }
  }, [state.events]) // Seulement quand les events changent vraiment
  
  return {
    events: state.events,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions stables du contexte
    updateEvent: actions.updateEvent,
    updateEventWithStatusDates: actions.updateEventWithStatusDates, // 🆕 Nouvelle action exposée
    createEvent: actions.createEvent,
    deleteEvent: actions.deleteEvent,
    syncClientNames: actions.syncClientNames, // 🆕 Nouvelle action exposée,
    
    // Computed values stables
    ...computedValues,
    
    // Fonctions utilitaires stables
    getEventsByClient: useCallback((clientId: string) => {
      return state.events.filter(event => event.clientId === clientId)
    }, [state.events])
  }
}

// Hook Clients simplifié
export const useClients = () => {
  const { state, actions } = useApp()
  
  return {
    clients: state.clients,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions stables du contexte
    updateClient: actions.updateClient,
    createClient: actions.createClient,
    deleteClient: actions.deleteClient,
    
    // Fonctions utilitaires stables
    getClientByEmail: useCallback((email: string) => {
      return state.clients.find(client => client.email === email)
    }, [state.clients])
  }
}

// Hook Florists simplifié
export const useFlorists = () => {
  const { state } = useApp()
  
  return {
    florists: state.florists || [],
    isLoading: state.isLoading,
    error: state.error
  }
}