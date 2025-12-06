import { useEffect, useCallback } from 'react'
import { Event, EventStatus } from '@/types'
import { useGlobalNotifications } from '@/contexts/GlobalNotificationContext'

interface UseAutoStatusTransitionProps {
  events: Event[]
  onEventStatusChange: (eventId: string, newStatus: EventStatus) => void
}

export const useAutoStatusTransition = ({
  events,
  onEventStatusChange
}: UseAutoStatusTransitionProps) => {
  const { showInfo, showSuccess } = useGlobalNotifications()

  const checkAndUpdateEventStatuses = useCallback(() => {
    const now = new Date()
    console.log(`🕐 VÉRIFICATION AUTO-STATUS à ${now.toLocaleTimeString('fr-FR')}`)
    
    events.forEach(event => {
      const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date
      const [hours, minutes] = event.time.split(':').map(Number)

      // BUG #6 FIX: Utiliser endTime si disponible, sinon 2h par défaut
      const eventEndTime = new Date(eventDate)
      if (event.endTime) {
        const [endHours, endMinutes] = event.endTime.split(':').map(Number)
        eventEndTime.setHours(endHours, endMinutes, 0, 0)
      } else {
        // Fallback: 2h de durée par défaut si pas d'heure de fin
        eventEndTime.setHours(hours + 2, minutes, 0, 0)
      }
      
      // LOGS DE DEBUG DÉTAILLÉS
      console.log(`📅 Événement: ${event.title}`)
      console.log(`   - Status actuel: ${event.status}`)
      console.log(`   - Date événement: ${eventDate.toLocaleDateString('fr-FR')}`)
      console.log(`   - Heure début: ${event.time}`)
      console.log(`   - Heure fin calculée: ${eventEndTime.toLocaleTimeString('fr-FR')}`)
      console.log(`   - Maintenant: ${now.toLocaleTimeString('fr-FR')}`)
      console.log(`   - Fini depuis: ${now > eventEndTime ? 'OUI' : 'NON'}`)
      
      // Vérifier si l'événement "En cours" devrait être "Terminé"
      if (event.status === EventStatus.IN_PROGRESS && now > eventEndTime) {
        console.log(`🚀 AUTO-TRANSITION: ${event.title} (${event.time}) → Terminé`)
        console.log(`   ⏰ Événement terminé depuis: ${Math.floor((now.getTime() - eventEndTime.getTime()) / (1000 * 60))} minutes`)
        
        // Changer le statut automatiquement
        onEventStatusChange(event.id, EventStatus.COMPLETED)
        
        // Afficher une notification
        showSuccess(
          `L'événement "${event.title}" a été automatiquement marqué comme terminé`,
          '✅ Événement terminé',
          6000,
          event.id
        )
      }
      
      // Vérifier si l'événement "Confirmé" devrait être "En cours"
      const eventStartTime = new Date(eventDate)
      eventStartTime.setHours(hours, minutes, 0, 0)
      
      console.log(`   - Heure début: ${eventStartTime.toLocaleTimeString('fr-FR')}`)
      console.log(`   - Commencé: ${now >= eventStartTime ? 'OUI' : 'NON'}`)
      
      if (event.status === EventStatus.CONFIRMED && now >= eventStartTime && now <= eventEndTime) {
        console.log(`🚀 AUTO-TRANSITION: ${event.title} (${event.time}) → En cours`)
        
        // Changer le statut automatiquement
        onEventStatusChange(event.id, EventStatus.IN_PROGRESS)
        
        // Afficher une notification
        showInfo(
          `L'événement "${event.title}" a commencé et est maintenant en cours`,
          '🎯 Événement démarré',
          5000,
          event.id
        )
      }
    })
    
    console.log(`✅ Vérification terminée - ${events.length} événements analysés`)
  }, [events, onEventStatusChange, showInfo, showSuccess])

  // Vérifier toutes les minutes
  useEffect(() => {
    console.log(`🎯 HOOK AUTO-STATUS ACTIVÉ - ${events.length} événements surveillés`)
    
    // Vérification initiale
    checkAndUpdateEventStatuses()
    
    // Puis toutes les minutes
    const interval = setInterval(() => {
      console.log(`⏰ TIMER: Vérification automatique...`)
      checkAndUpdateEventStatuses()
    }, 60000) // 60 secondes
    
    console.log(`⏱️ Timer créé, vérification toutes les 60 secondes`)
    
    return () => {
      console.log(`🛑 Timer supprimé`)
      clearInterval(interval)
    }
  }, [checkAndUpdateEventStatuses])

  return {
    checkAndUpdateEventStatuses
  }
}

export default useAutoStatusTransition
