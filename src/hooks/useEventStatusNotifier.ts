import { EventStatus } from '@/types'
import { useGlobalNotifications } from '@/contexts/GlobalNotificationContext'

export const useEventStatusNotifier = () => {
  const { showSuccess, showInfo, showWarning } = useGlobalNotifications()
  
  const notifyStatusChange = (eventTitle: string, newStatus: EventStatus, eventId?: string) => {
    console.log(`🔔 NOTIFICATION STATUT: ${eventTitle} → ${newStatus}`)
    
    const statusMessages = {
      [EventStatus.DRAFT]: { 
        emoji: '📝', 
        action: 'créé en brouillon',
        type: 'info' as const
      },
      [EventStatus.PLANNING]: { 
        emoji: '📋', 
        action: 'remis en planification',
        type: 'info' as const
      },
      [EventStatus.CONFIRMED]: { 
        emoji: '✅', 
        action: 'confirmé',
        type: 'success' as const
      },
      [EventStatus.IN_PROGRESS]: { 
        emoji: '🎯', 
        action: 'démarré',
        type: 'info' as const
      },
      [EventStatus.COMPLETED]: { 
        emoji: '✨', 
        action: 'terminé avec succès',
        type: 'success' as const
      },
      [EventStatus.INVOICED]: { 
        emoji: '💼', 
        action: 'facturé au client',
        type: 'info' as const
      },
      [EventStatus.PAID]: { 
        emoji: '💰', 
        action: 'payé - parfait !',
        type: 'success' as const
      },
      [EventStatus.CANCELLED]: { 
        emoji: '❌', 
        action: 'annulé',
        type: 'warning' as const
      }
    }
    
    const statusInfo = statusMessages[newStatus]
    if (statusInfo) {
      const notificationFn = statusInfo.type === 'success' ? showSuccess :
                            statusInfo.type === 'warning' ? showWarning : showInfo
      
      notificationFn(
        `"${eventTitle}" a été ${statusInfo.action}`,
        `${statusInfo.emoji} Changement de statut`,
        5000,
        eventId
      )
    }
  }
  
  return { notifyStatusChange }
}

export default useEventStatusNotifier
