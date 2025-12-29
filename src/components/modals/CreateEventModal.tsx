import React, { useCallback, useMemo } from 'react'
import EventModal from '../events/EventModal'
import { EventStatus } from '@/types'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: (event: any) => void
}

/**
 * 🎯 MODAL DE CRÉATION D'ÉVÉNEMENT
 *
 * Ouvre directement le formulaire EventModal pour créer un nouvel événement
 */
const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  // Création d'un événement vide - useMemo pour éviter recréation à chaque render
  const newEvent = useMemo(() => {
    if (!isOpen) return null
    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      description: '',
      date: new Date(),
      time: '10:00',
      location: '',
      clientId: '',
      budget: 0,
      status: EventStatus.DRAFT,
      flowers: [],
      floristsRequired: 0, // Pas de valeur par défaut - champ obligatoire
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }, [isOpen])

  const handleSave = useCallback((event: any) => {
    console.log('✅ Événement créé depuis CreateEventModal:', event.title)
    if (onEventCreated) {
      onEventCreated(event)
    }
    onClose()
  }, [onEventCreated, onClose])

  if (!isOpen || !newEvent) return null

  // Ouvre directement EventModal pour créer un événement
  return (
    <EventModal
      event={newEvent}
      isOpen={true}
      onClose={onClose}
      onEdit={handleSave}
    />
  )
}

export default CreateEventModal