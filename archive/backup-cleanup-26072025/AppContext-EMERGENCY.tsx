// 🚨 VERSION EMERGENCY - TOUS LES USEEFFECT DÉSACTIVÉS
import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react'
import { AppState, Event, Client, EventStatus, Theme, Florist } from '@/types'
import { mockEvents, mockClients } from '@/lib/mockData'
import { StorageManager } from '@/lib/storage'

// ... tout le code reste pareil SAUF les useEffect ...

// Provider EMERGENCY - SANS USEEFFECT
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    events: mockEvents,
    clients: mockClients
  })
  
  // Instance du StorageManager (SANS useEffect)
  const storage = useMemo(() => StorageManager.getInstance(), [])
  
  // 🚫 TOUS LES USEEFFECT DÉSACTIVÉS TEMPORAIREMENT
  // useEffect(() => {
  //   dispatch({ type: 'INIT_DATA' })
  // }, [])
  
  // Actions (sans sauvegarde automatique)
  const actions = useMemo(() => ({
    updateEvent: (id: string, event: Partial<Event>) => {
      console.log('🔧 EMERGENCY updateEvent:', id, event)
      dispatch({ type: 'UPDATE_EVENT', payload: { id, event } })
      // 💾 Sauvegarde manuelle SANS useEffect
      setTimeout(() => {
        try {
          const currentState = store.getState()
          storage.saveEvents(currentState.events)
        } catch (error) {
          console.error('❌ Erreur sauvegarde:', error)
        }
      }, 100)
    },
    
    updateClient: (id: string, client: Partial<Client>) => {
      console.log('🔧 EMERGENCY updateClient:', id, client)
      dispatch({ type: 'UPDATE_CLIENT', payload: { id, client } })
      // 💾 Sauvegarde manuelle SANS useEffect
      setTimeout(() => {
        try {
          const currentState = store.getState()
          storage.saveClients(currentState.clients)
        } catch (error) {
          console.error('❌ Erreur sauvegarde:', error)
        }
      }, 100)
    },
    
    // ... autres actions sans useEffect ...
    
  }), [state.events, state.clients])
  
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  )
}

// ... reste du code...