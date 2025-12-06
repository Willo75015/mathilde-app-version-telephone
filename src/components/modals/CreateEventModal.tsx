import React, { useCallback } from 'react'
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
  // Création d'un événement vide
  const getNewEvent = useCallback(() => {
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
      floristsRequired: 1,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }, [])

  const handleSave = useCallback((event: any) => {
    console.log('✅ Événement créé depuis CreateEventModal:', event.title)
    if (onEventCreated) {
      onEventCreated(event)
    }
    onClose()
  }, [onEventCreated, onClose])

  if (!isOpen) return null

  // Ouvre directement EventModal pour créer un événement
  return (
    <EventModal
      event={getNewEvent()}
      isOpen={true}
      onClose={onClose}
      onEdit={handleSave}
    />
  )
}

export default CreateEventModal