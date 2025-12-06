import { useCallback } from 'react'

export const useEventNavigation = () => {
  
  const navigateToEvent = useCallback((eventId: string) => {
    console.log(`🎯 Navigation vers événement: ${eventId}`)
    
    // Émettre un événement personnalisé pour naviguer vers l'événement
    const navigationEvent = new CustomEvent('navigate-to-event', {
      detail: { eventId }
    })
    window.dispatchEvent(navigationEvent)
    
    // Optionnel: scroll vers l'événement dans le Kanban
    setTimeout(() => {
      const eventElement = document.querySelector(`[data-event-id="${eventId}"]`)
      if (eventElement) {
        eventElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        
        // Effet de highlight
        eventElement.classList.add('highlight-event')
        setTimeout(() => {
          eventElement.classList.remove('highlight-event')
        }, 3000)
      }
    }, 100)
    
  }, [])

  return {
    navigateToEvent
  }
}

export default useEventNavigation
