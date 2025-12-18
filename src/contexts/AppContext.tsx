import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { AppState, Event, Client, EventStatus, Theme, FloristAvailability, Florist } from '@/types'
import { mockEvents, mockClients } from '@/lib/mockData'
import { isSupabaseEnabled } from '@/lib/supabase'
import { supabaseService } from '@/lib/supabase-service'

// Type local pour les fleuristes de l'application (compatible avec l'UI existante)
interface AppFlorist {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialties: string[]
  experience: string
  availability: FloristAvailability | 'available' | 'on_mission' | 'unavailable'
  rating: number
  isMainFlorist: boolean
  unavailabilityPeriods: Array<{
    id: string
    startDate: Date
    endDate: Date
    reason?: string
  }>
}

// Interface du contexte ULTRA-STABLE
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
    // Nouvelles actions pour Supabase
    migrateToSupabase: () => Promise<{ success: boolean, message: string }>
    refreshFromSupabase: () => Promise<void>
  }
  // Info sur le mode de stockage
  isSupabaseMode: boolean
}

const AppContext = createContext<AppContextType | null>(null)

// Fleuristes par défaut
const defaultFlorists: AppFlorist[] = [
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
    unavailabilityPeriods: []
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
]

// PROVIDER ULTRA-STABLE - AVEC SUPPORT SUPABASE
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // États simples
  const [events, setEvents] = useState<Event[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [florists, setFlorists] = useState<Florist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseMode, setIsSupabaseMode] = useState(false)
  const initRef = useRef(false)
  const unsubscribeRef = useRef<(() => void)[]>([])

  // Fonction pour charger depuis localStorage
  const loadFromLocalStorage = useCallback(() => {
    const storedEvents = localStorage.getItem('mathilde-events')
    const storedClients = localStorage.getItem('mathilde-clients')

    // BUG #2 FIX: Gestion robuste du parsing JSON avec try-catch
    if (storedEvents) {
      try {
        const parsed = JSON.parse(storedEvents)
        if (Array.isArray(parsed)) {
          const parsedEvents = parsed.map((event: any) => ({
            ...event,
            date: new Date(event.date),
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt)
          }))
          setEvents(parsedEvents)
          console.log('✅ Événements chargés depuis localStorage:', parsedEvents.length)
        } else {
          throw new Error('Format invalide: attendu un tableau')
        }
      } catch (error) {
        console.error('❌ Erreur parsing événements localStorage:', error)
        localStorage.removeItem('mathilde-events')
        setEvents(mockEvents)
        console.log('✅ Événements mockés chargés (fallback après erreur)')
      }
    } else {
      setEvents(mockEvents)
      console.log('✅ Événements mockés chargés')
    }

    if (storedClients) {
      try {
        const parsed = JSON.parse(storedClients)
        if (Array.isArray(parsed)) {
          const parsedClients = parsed.map((client: any) => ({
            ...client,
            createdAt: new Date(client.createdAt),
            updatedAt: new Date(client.updatedAt)
          }))
          setClients(parsedClients)
          console.log('✅ Clients chargés depuis localStorage:', parsedClients.length)
        } else {
          throw new Error('Format invalide: attendu un tableau')
        }
      } catch (error) {
        console.error('❌ Erreur parsing clients localStorage:', error)
        localStorage.removeItem('mathilde-clients')
        setClients(mockClients)
        console.log('✅ Clients mockés chargés (fallback après erreur)')
      }
    } else {
      setClients(mockClients)
      console.log('✅ Clients mockés chargés')
    }
  }, [])

  // Fonction pour charger depuis Supabase
  const loadFromSupabase = useCallback(async () => {
    if (!isSupabaseEnabled()) {
      console.log('⚠️ Supabase non configuré, fallback localStorage')
      return false
    }

    try {
      console.log('🔄 Chargement depuis Supabase...')
      const [supabaseEvents, supabaseClients, supabaseFlorists] = await Promise.all([
        supabaseService.getEvents(),
        supabaseService.getClients(),
        supabaseService.getFlorists()
      ])

      // TOUJOURS utiliser Supabase si configuré (même si vide)
      setEvents(supabaseEvents)
      setClients(supabaseClients)
      if (supabaseFlorists.length > 0) {
        setFlorists(supabaseFlorists)
      }
      setIsSupabaseMode(true)
      console.log('✅ Mode Supabase activé - Données:', {
        events: supabaseEvents.length,
        clients: supabaseClients.length,
        florists: supabaseFlorists.length
      })
      return true
    } catch (error) {
      console.error('❌ Erreur chargement Supabase:', error)
      return false
    }
  }, [])

  // Configurer les abonnements temps réel
  const setupRealtimeSubscriptions = useCallback(() => {
    if (!isSupabaseEnabled()) return

    console.log('📡 Configuration des abonnements temps réel...')

    const unsubEvents = supabaseService.subscribeToEvents((newEvents) => {
      console.log('🔄 Mise à jour temps réel des événements:', newEvents.length)
      setEvents(newEvents)
    })

    const unsubClients = supabaseService.subscribeToClients((newClients) => {
      console.log('🔄 Mise à jour temps réel des clients:', newClients.length)
      setClients(newClients)
    })

    const unsubFlorists = supabaseService.subscribeToFlorists((newFlorists) => {
      console.log('🔄 Mise à jour temps réel des fleuristes:', newFlorists.length)
      setFlorists(newFlorists)
    })

    if (unsubEvents) unsubscribeRef.current.push(unsubEvents)
    if (unsubClients) unsubscribeRef.current.push(unsubClients)
    if (unsubFlorists) unsubscribeRef.current.push(unsubFlorists)

    console.log('✅ Abonnements temps réel configurés')
  }, [])

  // INITIALISATION AVEC SUPABASE OU LOCALSTORAGE
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true

      const initialize = async () => {
        setIsLoading(true)

        // Essayer Supabase en premier
        const supabaseLoaded = await loadFromSupabase()

        if (!supabaseLoaded) {
          // Fallback vers localStorage
          loadFromLocalStorage()
          setIsSupabaseMode(false)
        } else {
          // Configurer les abonnements temps réel
          setupRealtimeSubscriptions()
        }

        setIsLoading(false)
        console.log('✅ Données initialisées', isSupabaseEnabled() ? '(mode Supabase)' : '(mode localStorage)')
      }

      initialize()
    }

    // Cleanup des abonnements
    return () => {
      unsubscribeRef.current.forEach(unsub => unsub())
      unsubscribeRef.current = []
    }
  }, [loadFromSupabase, loadFromLocalStorage, setupRealtimeSubscriptions])
  
  // ACTIONS AVEC SAUVEGARDE LOCALE ET SUPABASE
  const updateEvent = async (id: string, eventUpdate: Partial<Event>) => {
    setEvents(prev => {
      const updated = prev.map(event =>
        event.id === id ? { ...event, ...eventUpdate, updatedAt: new Date() } : event
      )
      localStorage.setItem('mathilde-events', JSON.stringify(updated))
      return updated
    })

    // Sync avec Supabase (toujours si configuré)
    if (isSupabaseEnabled()) {
      try {
        await supabaseService.updateEvent(id, eventUpdate)
      } catch (error) {
        console.error('❌ Erreur sync Supabase updateEvent:', error)
      }
    }
  }
  
  // WORKFLOW AVEC SAUVEGARDE
  const updateEventWithTeamCheck = async (id: string, eventUpdate: Partial<Event>) => {
    let finalUpdateForSupabase: Partial<Event> = {}

    setEvents(prevEvents => {
      const currentEvent = prevEvents.find(e => e.id === id)
      if (!currentEvent) return prevEvents

      let finalUpdate = { ...eventUpdate }

      // LOGIQUE WORKFLOW SIMPLIFIÉE
      if (eventUpdate.assignedFlorists) {
        console.log('🎯 WORKFLOW - Traitement assignations:', eventUpdate.assignedFlorists.length)

        const requiredFlorists = currentEvent.floristsRequired || 2
        const confirmedFlorists = eventUpdate.assignedFlorists.filter(f =>
          f.status === 'confirmed' || f.isConfirmed
        )

        console.log('📊 WORKFLOW - État:', {
          required: requiredFlorists,
          confirmed: confirmedFlorists.length,
          shouldTrigger: confirmedFlorists.length >= requiredFlorists && confirmedFlorists.length > 0
        })

        // Si équipe complète, passer pending → not_selected
        if (confirmedFlorists.length >= requiredFlorists && confirmedFlorists.length > 0) {
          console.log('🔥 WORKFLOW - DÉCLENCHEMENT AUTO-SÉLECTION !')

          const updatedFlorists = eventUpdate.assignedFlorists.map(florist => {
            if (florist.status === 'pending') {
              const eventDate = eventUpdate.date || currentEvent.date || new Date()
              const formattedDate = eventDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
              })

              const preWrittenMessage = `Bonjour ${florist.floristName?.split(' ')[0]},

L'événement "${eventUpdate.title || currentEvent.title}" du ${formattedDate} est pourvu.

Merci pour votre disponibilité !

Mathilde Fleurs`

              console.log('🚫 WORKFLOW - Fleuriste NON RETENU:', florist.floristName)

              return {
                ...florist,
                status: 'not_selected' as const,
                preWrittenMessage
              }
            }
            return florist
          })

          finalUpdate = { ...finalUpdate, assignedFlorists: updatedFlorists }
          console.log('✅ WORKFLOW - Fleuristes mis à jour:', updatedFlorists.map(f => `${f.floristName}: ${f.status}`))
        } else {
          console.log('⏸️ WORKFLOW - Pas assez de confirmés, pas de changement')
        }
      } else {
        console.log('ℹ️ WORKFLOW - Pas d\'assignations à traiter')
      }

      finalUpdateForSupabase = finalUpdate

      const updated = prevEvents.map(event =>
        event.id === id ? { ...event, ...finalUpdate, updatedAt: new Date() } : event
      )

      // 🔥 SAUVEGARDE CRITIQUE
      localStorage.setItem('mathilde-events', JSON.stringify(updated))
      return updated
    })

    // Sync avec Supabase si activé
    if (isSupabaseEnabled()) {
      try {
        await supabaseService.updateEvent(id, finalUpdateForSupabase)
      } catch (error) {
        console.error('❌ Erreur sync Supabase updateEventWithTeamCheck:', error)
      }
    }
  }
  
  const updateEventWithStatusDates = async (id: string, newStatus: EventStatus) => {
    let supabaseUpdates: Partial<Event> = {}

    setEvents(prev => {
      const updated = prev.map(event => {
        if (event.id === id) {
          let updates: Partial<Event> = { status: newStatus, updatedAt: new Date() }

          switch (newStatus) {
            case EventStatus.COMPLETED:
              updates.completedDate = new Date()
              break
            case EventStatus.INVOICED:
              updates.completedDate = event.completedDate || new Date()
              updates.invoiced = true
              updates.invoiceDate = new Date()
              updates.archived = true
              break
            case EventStatus.PAID:
              updates.completedDate = event.completedDate || new Date()
              updates.paid = true
              updates.paidDate = new Date()
              updates.paymentMethod = 'transfer'
              break
          }

          supabaseUpdates = updates
          return { ...event, ...updates }
        }
        return event
      })

      // BUG #1 FIX: Sauvegarde dans localStorage
      localStorage.setItem('mathilde-events', JSON.stringify(updated))
      return updated
    })

    // Sync avec Supabase si activé
    if (isSupabaseEnabled()) {
      try {
        await supabaseService.updateEvent(id, supabaseUpdates)
      } catch (error) {
        console.error('❌ Erreur sync Supabase updateEventWithStatusDates:', error)
      }
    }
  }
  
  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: eventData.title || 'Nouvel événement',
      description: eventData.description || '',
      date: eventData.date || new Date(),
      time: eventData.time || '09:00',
      location: eventData.location || 'À définir',
      budget: eventData.budget || 0,
      status: eventData.status || EventStatus.DRAFT,
      flowers: eventData.flowers || [],
      assignedFlorists: eventData.assignedFlorists || [],
      floristsRequired: eventData.floristsRequired || 1,
      clientId: eventData.clientId || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('🔥 CONTEXT - Événement créé:', newEvent)
    setEvents(prev => {
      const updated = [...prev, newEvent]
      localStorage.setItem('mathilde-events', JSON.stringify(updated))
      return updated
    })

    // Sync avec Supabase (toujours si configuré)
    if (isSupabaseEnabled()) {
      try {
        console.log('☁️ Sync Supabase: création événement...')
        await supabaseService.createEvent(eventData)
        console.log('✅ Événement synchronisé avec Supabase')
      } catch (error) {
        console.error('❌ Erreur sync Supabase createEvent:', error)
      }
    }

    return newEvent
  }
  
  const deleteEvent = async (id: string) => {
    setEvents(prev => {
      const updated = prev.filter(event => event.id !== id)
      localStorage.setItem('mathilde-events', JSON.stringify(updated))
      return updated
    })

    // Sync avec Supabase si activé
    if (isSupabaseEnabled()) {
      try {
        await supabaseService.deleteEvent(id)
      } catch (error) {
        console.error('❌ Erreur sync Supabase deleteEvent:', error)
      }
    }
  }
  
  const updateClient = async (id: string, clientUpdate: Partial<Client>) => {
    setClients(prev => {
      const updated = prev.map(client =>
        client.id === id ? { ...client, ...clientUpdate, updatedAt: new Date() } : client
      )
      localStorage.setItem('mathilde-clients', JSON.stringify(updated))
      return updated
    })

    // Sync avec Supabase si activé
    if (isSupabaseEnabled()) {
      try {
        await supabaseService.updateClient(id, clientUpdate)
      } catch (error) {
        console.error('❌ Erreur sync Supabase updateClient:', error)
      }
    }
  }

  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setClients(prev => {
      const updated = [...prev, newClient]
      localStorage.setItem('mathilde-clients', JSON.stringify(updated))
      return updated
    })

    // Sync avec Supabase si activé
    if (isSupabaseEnabled()) {
      try {
        await supabaseService.createClient(clientData)
      } catch (error) {
        console.error('❌ Erreur sync Supabase createClient:', error)
      }
    }

    return newClient
  }

  // BUG #3 FIX: Suppression client avec nettoyage des événements associés
  const deleteClient = async (id: string) => {
    // D'abord, nettoyer les événements associés à ce client
    setEvents(prevEvents => {
      const updated = prevEvents.map(event => {
        if (event.clientId === id) {
          // Retirer le clientId des événements associés (ne pas les supprimer)
          return { ...event, clientId: '', clientName: 'Client supprimé', updatedAt: new Date() }
        }
        return event
      })
      localStorage.setItem('mathilde-events', JSON.stringify(updated))
      return updated
    })

    // Ensuite, supprimer le client
    setClients(prev => {
      const updated = prev.filter(client => client.id !== id)
      localStorage.setItem('mathilde-clients', JSON.stringify(updated))
      return updated
    })

    // Sync avec Supabase si activé
    if (isSupabaseEnabled()) {
      try {
        await supabaseService.deleteClient(id)
      } catch (error) {
        console.error('❌ Erreur sync Supabase deleteClient:', error)
      }
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
    // Pour l'instant, ne rien faire pour éviter les boucles
    console.log('🔄 Sync demandée (désactivée temporairement)')
  }

  // Fonction pour migrer les données localStorage vers Supabase
  const migrateToSupabase = async (): Promise<{ success: boolean, message: string }> => {
    if (!isSupabaseEnabled()) {
      return { success: false, message: 'Supabase non configuré' }
    }

    console.log('🚀 Début de la migration vers Supabase...')

    try {
      const result = await supabaseService.migrateFromLocalStorage({
        events,
        clients,
        florists: florists.length > 0 ? florists : defaultFlorists.map(f => ({
          ...f,
          hourlyRate: 0,
          experience: 0,
          completedEvents: 0,
          skills: f.specialties || [],
          languages: ['Français'],
          certifications: [],
          location: f.location || '',
          avatar: f.avatar || '',
          createdAt: new Date(),
          updatedAt: new Date()
        } as Florist))
      })

      if (result.success) {
        setIsSupabaseMode(true)
        setupRealtimeSubscriptions()
        console.log('✅ Migration réussie:', result.message)
      }

      return result
    } catch (error) {
      console.error('❌ Erreur migration:', error)
      return { success: false, message: `Erreur: ${error}` }
    }
  }

  // Fonction pour rafraîchir les données depuis Supabase
  const refreshFromSupabase = async (): Promise<void> => {
    if (!isSupabaseEnabled()) {
      console.log('⚠️ Supabase non configuré')
      return
    }

    console.log('🔄 Rafraîchissement depuis Supabase...')
    setIsLoading(true)

    try {
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

      console.log('✅ Données rafraîchies depuis Supabase')
    } catch (error) {
      console.error('❌ Erreur rafraîchissement:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // ÉTAT ET ACTIONS ULTRA-SIMPLES
  const state: AppState = {
    user: null,
    events,
    clients,
    flowers: [],
    florists: florists.length > 0 ? florists : defaultFlorists.map(f => ({
      ...f,
      hourlyRate: 0,
      experience: 0,
      completedEvents: 0,
      skills: f.specialties || [],
      languages: ['Français'],
      certifications: [],
      location: f.location || '',
      avatar: f.avatar || '',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Florist)),
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
    // Nouvelles actions Supabase
    migrateToSupabase,
    refreshFromSupabase
  }

  return (
    <AppContext.Provider value={{ state, actions, isSupabaseMode }}>
      {children}
    </AppContext.Provider>
  )
}

// HOOKS ULTRA-SIMPLES
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
    
    // Actions
    updateEvent: actions.updateEvent,
    updateEventWithTeamCheck: actions.updateEventWithTeamCheck,
    updateEventWithStatusDates: actions.updateEventWithStatusDates,
    createEvent: actions.createEvent,
    deleteEvent: actions.deleteEvent,
    
    // Computed values simples
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