import { useEffect, useState } from 'react'

/**
 * Hook pour détecter si on doit réduire les animations
 * - Sur mobile : animations réduites par défaut
 * - Respecte prefers-reduced-motion de l'utilisateur
 */
export const useReducedMotion = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(() => {
    if (typeof window === 'undefined') return false

    // Vérifier la préférence utilisateur
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Vérifier si mobile (< 768px)
    const isMobile = window.innerWidth < 768

    return prefersReduced || isMobile
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = () => {
      const prefersReduced = mediaQuery.matches
      const isMobile = window.innerWidth < 768
      setShouldReduceMotion(prefersReduced || isMobile)
    }

    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      const prefersReduced = mediaQuery.matches
      setShouldReduceMotion(prefersReduced || isMobile)
    }

    mediaQuery.addEventListener('change', handleChange)
    window.addEventListener('resize', handleResize)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return shouldReduceMotion
}

/**
 * Variantes d'animation simplifiées pour mobile
 */
export const mobileAnimationVariants = {
  // Pas d'animation - apparition instantanée
  instant: {
    initial: {},
    animate: {},
    exit: {}
  },

  // Fade simple (léger)
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  },

  // Slide up rapide
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.15 } }
  },

  // Scale léger
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.1 } }
  }
}

/**
 * Helper pour choisir les variantes selon le contexte
 */
export const getAnimationVariants = (
  shouldReduceMotion: boolean,
  desktopVariants: any,
  mobileVariants: any = mobileAnimationVariants.fade
) => {
  return shouldReduceMotion ? mobileVariants : desktopVariants
}
