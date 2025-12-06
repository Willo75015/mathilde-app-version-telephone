import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

interface ThemeContextType {
  theme: ThemeMode
  isDark: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  systemPreference: ThemeMode.LIGHT | ThemeMode.DARK
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Vérifier d'abord si on est côté client
    if (typeof window === 'undefined') return ThemeMode.LIGHT
    
    const stored = localStorage.getItem('mathilde-theme')
    return (stored as ThemeMode) || ThemeMode.LIGHT // Default LIGHT au lieu de SYSTEM
  })
  
  const [systemPreference, setSystemPreference] = useState<ThemeMode.LIGHT | ThemeMode.DARK>(() => {
    if (typeof window === 'undefined') return ThemeMode.LIGHT
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? ThemeMode.DARK : ThemeMode.LIGHT
  })
  
  // Calculer le thème effectif avec logique corrigée
  const isDark = theme === ThemeMode.DARK || (theme === ThemeMode.SYSTEM && systemPreference === ThemeMode.DARK)
  
  // Écouter les changements de préférence système
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? ThemeMode.DARK : ThemeMode.LIGHT)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Appliquer le thème au DOM avec debounce
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    
    // Force un reflow pour éviter les bugs de transition
    requestAnimationFrame(() => {
      if (isDark) {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.remove('dark')
        root.style.colorScheme = 'light'
      }
      
      // Meta theme-color dynamique
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#10b981')
      }
    })
  }, [isDark])
  
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mathilde-theme', newTheme)
    }
  }, [])
  
  const toggleTheme = useCallback(() => {
    // Logic simplifiée : juste Light <-> Dark
    if (theme === ThemeMode.DARK) {
      setTheme(ThemeMode.LIGHT)
    } else {
      setTheme(ThemeMode.DARK)
    }
  }, [theme, setTheme])
  
  const value = {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    systemPreference
  }
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}