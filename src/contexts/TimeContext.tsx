import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface TimeContextType {
  currentTime: Date
  currentDate: Date
  timezone: string
  isToday: (date: Date) => boolean
  formatTime: (options?: Intl.DateTimeFormatOptions) => string
  formatDate: (options?: Intl.DateTimeFormatOptions) => string
  formatDateTime: (options?: Intl.DateTimeFormatOptions) => string
  setCurrentDate: (date: Date) => void
  updateInterval: number
}

const TimeContext = createContext<TimeContextType | null>(null)

interface TimeProviderProps {
  children: React.ReactNode
  updateInterval?: number
}

export const TimeProvider: React.FC<TimeProviderProps> = ({ 
  children, 
  updateInterval = 1000 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Détection du timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Mise à jour automatique de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      // Si on est sur une date différente, mettre à jour currentDate aussi
      if (now.toDateString() !== currentDate.toDateString()) {
        setCurrentDate(now)
      }
    }, updateInterval)
    
    return () => clearInterval(timer)
  }, [updateInterval]) // 🔧 RETIRÉ currentDate pour éviter les boucles
  
  // Fonction pour vérifier si une date est aujourd'hui
  const isToday = useCallback((date: Date) => {
    const now = new Date()
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth() === now.getMonth() &&
           date.getDate() === now.getDate()
  }, [])
  
  // Fonctions de formatage
  const formatTime = useCallback((options?: Intl.DateTimeFormatOptions) => {
    return currentTime.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    })
  }, [currentTime])
  
  const formatDate = useCallback((options?: Intl.DateTimeFormatOptions) => {
    return currentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options
    })
  }, [currentDate])
  
  const formatDateTime = useCallback((options?: Intl.DateTimeFormatOptions) => {
    return currentTime.toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    })
  }, [currentTime])
  
  // Callback pour changer la date (utilisé par le calendrier)
  const handleSetCurrentDate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])
  
  const value = {
    currentTime,
    currentDate,
    timezone,
    isToday,
    formatTime,
    formatDate,
    formatDateTime,
    setCurrentDate: handleSetCurrentDate,
    updateInterval
  }
  
  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  )
}

export const useTime = () => {
  const context = useContext(TimeContext)
  if (!context) {
    throw new Error('useTime must be used within TimeProvider')
  }
  return context
}

// Hook spécialisé pour la synchronisation calendrier
export const useCalendarSync = () => {
  const { currentDate, setCurrentDate, isToday } = useTime()
  
  return {
    currentDate,
    setCurrentDate,
    isToday,
    // Helper pour naviguer dans les mois en gardant la sync
    navigateMonth: useCallback((direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate)
      if (direction === 'prev') {
        newDate.setMonth(currentDate.getMonth() - 1)
      } else {
        newDate.setMonth(currentDate.getMonth() + 1)
      }
      setCurrentDate(newDate)
    }, [currentDate, setCurrentDate])
  }
}
