import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertCircle, CheckCircle, Plus, MessageSquare, XCircle, Trash2, Eye
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Event, EventStatus } from '@/types'

interface Florist {
  id: string
  name: string
  role?: string
  status?: 'available' | 'unavailable' | 'busy'
  avatar?: string
}

interface FloristWithConflictWarningProps {
  florist: Florist
  allEvents: Event[]
  currentEventId?: string
  currentEventDate?: Date
  assignmentStatus?: 'pending' | 'confirmed' | 'refused'
  onStatusChange?: (status: 'pending' | 'confirmed' | 'refused') => void
  onRemove?: () => void
  onContact?: () => void
  onAssign?: () => void
  showActions?: boolean
  showAddButton?: boolean // Afficher le bouton d'ajout
  compact?: boolean // Mode compact pour les listes
  className?: string
}

// 🆕 Fonction pour détecter les conflits de fleuristes
export const checkFloristConflicts = (
  floristId: string, 
  currentEventId: string, 
  eventDate: Date, 
  allEvents: Event[]
): { hasConflict: boolean; conflictingEvents: Event[] } => {
  const targetDate = eventDate.toDateString()
  
  const conflictingEvents = allEvents.filter(event => {
    if (event.id === currentEventId) return false
    
    const eventDateStr = (event.date instanceof Date ? event.date : new Date(event.date)).toDateString()
    if (eventDateStr !== targetDate) return false
    
    const hasFlorist = event.assignedFlorists?.some(af => 
      af.floristId === floristId && (af.isConfirmed || af.status === 'confirmed')
    )
    
    return hasFlorist
  })
  
  return {
    hasConflict: conflictingEvents.length > 0,
    conflictingEvents
  }
}

const FloristWithConflictWarning: React.FC<FloristWithConflictWarningProps> = ({
  florist,
  allEvents,
  currentEventId = '',
  currentEventDate = new Date(),
  assignmentStatus = 'pending',
  onStatusChange,
  onRemove,
  onContact,
  onAssign,
  showActions = true,
  className = ''
}) => {
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [showMissionModal, setShowMissionModal] = useState(false)
  
  // Détecter les conflits
  const { hasConflict, conflictingEvents } = checkFloristConflicts(
    florist.id,
    currentEventId,
    currentEventDate,
    allEvents
  )

  // Trouver les missions actuelles du fleuriste (toutes les missions confirmées)
  const currentMissions = allEvents.filter(event => {
    return event.assignedFlorists?.some(af => 
      af.floristId === florist.id && (af.isConfirmed || af.status === 'confirmed')
    )
  })

  const handleAssignWithWarning = () => {
    if (hasConflict) {
      setShowConflictModal(true)
    } else {
      onAssign?.()
    }
  }

  const handleConfirmAssignment = () => {
    setShowConflictModal(false)
    onAssign?.()
  }

  const ConflictWarningModal = () => (
    <Modal
      isOpen={showConflictModal}
      onClose={() => setShowConflictModal(false)}
      title="⚠️ Conflit détecté"
      size="sm"
    >
      <div className="text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
        <div>
          <p className="text-gray-700 mb-2">
            <strong>{florist.name}</strong> est déjà assigné(e) à {conflictingEvents.length} autre événement{conflictingEvents.length > 1 ? 's' : ''} le même jour.
          </p>
          <p className="text-sm text-gray-600">
            Mission en conflit :
          </p>
          {conflictingEvents.map(event => (
            <div key={event.id} className="text-sm bg-orange-50 p-2 rounded mt-1">
              {event.title} - {event.clientName}
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => setShowConflictModal(false)}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmAssignment}
            className="bg-green-500 hover:bg-green-600"
          >
            ✓ Confirmer quand même
          </Button>
        </div>
      </div>
    </Modal>
  )

  const MissionDetailsModal = () => (
    <Modal
      isOpen={showMissionModal}
      onClose={() => setShowMissionModal(false)}
      title={`Missions de ${florist.name}`}
      size="md"
    >
      <div className="space-y-4">
        {currentMissions.length > 0 ? (
          currentMissions.map(mission => (
            <div key={mission.id} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800">{mission.title}</h3>
              <p className="text-gray-600">Client: {mission.clientName}</p>
              <p className="text-sm text-gray-500">
                {mission.date instanceof Date ? mission.date.toLocaleString() : new Date(mission.date).toLocaleString()}
              </p>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  mission.status === EventStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                  mission.status === EventStatus.DRAFT || mission.status === EventStatus.PLANNING ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {mission.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">Aucune mission aujourd'hui</p>
        )}
      </div>
    </Modal>
  )

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white border rounded-lg p-4 ${hasConflict ? 'border-orange-300 bg-orange-50' : 'border-gray-200'} ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {florist.name.substring(0, 2).toUpperCase()}
              </div>
              {hasConflict && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">{florist.name}</h3>
              {florist.role && (
                <p className="text-sm text-gray-600">{florist.role}</p>
              )}
              {hasConflict && (
                <p className="text-xs text-orange-600">
                  ⚠️ Il manque {conflictingEvents.length} fleuriste{conflictingEvents.length > 1 ? 's' : ''}.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bouton Voir mission */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMissionModal(true)}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Voir mission
            </Button>

            {showActions && (
              <>
                {!onAssign && onStatusChange && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onStatusChange('confirmed')}
                      className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                      title="Confirmer le fleuriste"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onStatusChange('refused')}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                      title="Refuser le fleuriste"
                    >
                      <XCircle className="w-4 h-4" />
                    </motion.button>
                  </>
                )}

                {onAssign && (
                  <Button
                    variant={hasConflict ? "secondary" : "primary"}
                    size="sm"
                    onClick={handleAssignWithWarning}
                    className={hasConflict ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                  >
                    {hasConflict ? "⚠️ Assigner quand même" : "Assigner"}
                  </Button>
                )}
                
                {onRemove && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onRemove}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    title="Retirer de l'assignation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
      
      <ConflictWarningModal />
      <MissionDetailsModal />
    </>
  )
}

export default FloristWithConflictWarning