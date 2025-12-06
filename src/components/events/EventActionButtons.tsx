import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Archive, DollarSign, CreditCard } from 'lucide-react'
import { Event, EventStatus } from '@/types'
import Button from '@/components/ui/Button'

interface EventActionButtonsProps {
  event: Event
  onComplete: (eventId: string) => void
  onArchive: (eventId: string) => void
  onTrackPayment: (eventId: string) => void
  disabled?: boolean
}

export const EventActionButtons: React.FC<EventActionButtonsProps> = ({
  event,
  onComplete,
  onArchive,
  onTrackPayment,
  disabled = false
}) => {
  
  // Fonction pour déterminer quel bouton afficher selon le statut
  const renderActionButton = () => {
    switch (event.status) {
      case EventStatus.IN_PROGRESS:
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onComplete(event.id)}
            leftIcon={<CheckCircle className="w-4 h-4" />}
            disabled={disabled}
            className="bg-green-500 hover:bg-green-600"
          >
            Terminer
          </Button>
        )

      case EventStatus.COMPLETED:
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="primary"
              size="sm"
              onClick={() => onArchive(event.id)}
              leftIcon={<Archive className="w-4 h-4" />}
              disabled={disabled}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Terminer
            </Button>
          </motion.div>
        )

      case EventStatus.INVOICED:
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="primary"
              size="sm"
              onClick={() => onTrackPayment(event.id)}
              leftIcon={<DollarSign className="w-4 h-4" />}
              disabled={disabled}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Facturé
            </Button>
          </motion.div>
        )

      case EventStatus.PAID:
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CreditCard className="w-4 h-4" />}
              disabled={true}
              className="bg-green-100 text-green-800 cursor-default"
            >
              Payé ✓
            </Button>
          </motion.div>
        )

      default:
        return null
    }
  }

  // Afficher un indicateur de statut supplémentaire si nécessaire
  const renderStatusIndicator = () => {
    if (event.status === EventStatus.INVOICED && event.invoiceDate) {
      const daysSinceInvoice = Math.floor(
        (new Date().getTime() - new Date(event.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceInvoice > 30) {
        return (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-2"
          >
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              En retard ({daysSinceInvoice}j)
            </span>
          </motion.div>
        )
      } else if (daysSinceInvoice > 7) {
        return (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-2"
          >
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
              À suivre ({daysSinceInvoice}j)
            </span>
          </motion.div>
        )
      }
    }
    
    if (event.status === EventStatus.PAID && event.paidDate) {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-2"
        >
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Finalisé
          </span>
        </motion.div>
      )
    }

    return null
  }

  return (
    <div className="flex items-center">
      {renderActionButton()}
      {renderStatusIndicator()}
    </div>
  )
}

export default EventActionButtons