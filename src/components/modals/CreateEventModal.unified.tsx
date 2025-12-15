import React from 'react'
import EventModal from '../events/EventModal'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: (event: any) => void
}

/**
 * 🎯 MODAL UNIFIÉ DE CRÉATION
 *
 * Ce composant utilise le EventModal complet en mode création.
 * Il offre toutes les fonctionnalités :
 * - Création d'événement avec statut brouillon
 * - Assignation de fleuristes
 * - Interface complète identique à la modification
 */
const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {

  const handleEdit = (event: any) => {
    console.log('✅ Événement créé depuis CreateEventModal:', event.title)
    if (onEventCreated) {
      onEventCreated(event)
    }
    onClose()
  }

  return (
    <EventModal
      event={null}  // null = mode création
      isOpen={isOpen}
      onClose={onClose}
      onEdit={handleEdit}
    />
  )
}

export default CreateEventModal