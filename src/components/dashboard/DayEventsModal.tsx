import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Edit, Users,
  MapPin, Euro, Calendar as CalendarIcon, ChevronRight
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import MoreEventsModal from './MoreEventsModal'
import EventModal from '@/components/events/EventModal'
import FloristWithConflictWarning from '@/components/ui/FloristWithConflictWarning'
import { Event, EventStatus } from '@/types'
import { useEvents, useApp } from '@/contexts/AppContext'

interface DayEventsModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  events: Event[]
}

interface Florist {
  id: string
  name: string
  phone: string
  isConfirmed: boolean
  avatar?: string
}

// Simulation des données fleuristes
const mockFlorists: Florist[] = [
  { id: '1', name: 'Marie Dupont', phone: '+33623456789', isConfirmed: true },
  { id: '2', name: 'Pierre Martin', phone: '+33634567890', isConfirmed: false },
  { id: '3', name: 'Sophie Bernard', phone: '+33645678901', isConfirmed: true },
  { id: '4', name: 'Julien Petit', phone: '+33656789012', isConfirmed: false },
]

const DayEventsModal: React.FC<DayEventsModalProps> = ({ 
  isOpen, 
  onClose, 
  date, 
  events 
}) => {
  const { updateEvent } = useEvents()
  const { state } = useApp() // 🆕 Pour accéder à tous les événements
  const allEvents = state.events // 🆕 Tous les événements pour détecter les conflits
  
  const [showMoreEvents, setShowMoreEvents] = useState(false)
  const [showMoreEventsModal, setShowMoreEventsModal] = useState(false)
  
  // 🆕 États pour EventModal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  
  // Séparer les événements : 5 premiers + le reste
  const visibleEvents = events.slice(0, 5)
  const hiddenEvents = events.slice(5)
  const hasMoreEvents = hiddenEvents.length > 0
  
  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.CONFIRMED:
        return 'bg-blue-500'
      case EventStatus.IN_PROGRESS:
        return 'bg-yellow-500'
      case EventStatus.COMPLETED:
        return 'bg-green-500'
      case EventStatus.CANCELLED:
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case EventStatus.CONFIRMED:
        return 'Confirmé'
      case EventStatus.IN_PROGRESS:
        return 'En cours'
      case EventStatus.COMPLETED:
        return 'Terminé'
      case EventStatus.CANCELLED:
        return 'Annulé'
      default:
        return 'Brouillon'
    }
  }
  
  const getStatusBadgeVariant = (status: EventStatus) => {
    switch (status) {
      case EventStatus.CONFIRMED:
        return 'default'
      case EventStatus.IN_PROGRESS:
        return 'secondary'
      case EventStatus.COMPLETED:
        return 'default'
      case EventStatus.CANCELLED:
        return 'secondary'
      default:
        return 'secondary'
    }
  }
  
  // Simulation des fleuristes assignés pour chaque événement
  const getEventFlorists = (event: Event): Array<{id: string; name: string; isConfirmed: boolean}> => {
    // Utiliser les assignations réelles de l'événement si disponibles
    if (event.assignedFlorists && event.assignedFlorists.length > 0) {
      return event.assignedFlorists.map(af => ({
        id: af.floristId,
        name: af.floristName || 'Fleuriste',
        isConfirmed: af.isConfirmed || af.status === 'confirmed'
      }))
    }
    // Fallback vers mock data si pas d'assignations
    return mockFlorists.slice(0, Math.floor(Math.random() * 3) + 1).map(f => ({
      id: f.id,
      name: f.name,
      isConfirmed: f.isConfirmed
    }))
  }

  // 🆕 Handlers pour EventModal
  const handleCreateEvent = () => {
    setSelectedEvent(null) // Mode création
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleEventSave = (editedEvent: Event) => {
    updateEvent(editedEvent.id, editedEvent)
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const EventCard: React.FC<{ event: Event; index: number }> = ({ event, index }) => {
    const eventFlorists = getEventFlorists(event)
    const confirmedFlorists = eventFlorists.filter((f: {isConfirmed: boolean}) => f.isConfirmed)
    const pendingFlorists = eventFlorists.filter((f: {isConfirmed: boolean}) => !f.isConfirmed)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card className="p-4 hover:shadow-md transition-all duration-200">
          {/* Header avec titre et badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                {event.title}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={getStatusBadgeVariant(event.status)}
                  className={`${getStatusColor(event.status)} text-white`}
                >
                  {getStatusLabel(event.status)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Mission confirmée
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Informations principales - Layout réorganisé */}
          <div className="space-y-3 mb-4">
            {/* Première ligne : Dates de début et fin */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span className="font-medium">Début:</span>
                <span>{new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span className="font-medium">Fin:</span>
                <span>{event.endDate ? new Date(event.endDate).toLocaleDateString('fr-FR') : 'Non définie'}</span>
              </div>
            </div>
            
            {/* Deuxième ligne : Client et Budget */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span className="font-medium">Client:</span>
                <span>{event.clientId}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Euro className="w-4 h-4" />
                <span className="font-medium">Budget:</span>
                <span>{event.budget.toLocaleString('fr-FR')}€</span>
              </div>
            </div>
            
            {/* Troisième ligne : Lieu */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Lieu:</span>
              <span>{event.location}</span>
            </div>
          </div>
          
          {/* SECTION FLEURISTES AMÉLIORÉE */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                👥 Équipe fleuristes
              </h4>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">{confirmedFlorists.length}</span> confirmé{confirmedFlorists.length > 1 ? 's' : ''}
                </span>
                <span className="text-sm text-gray-600">
                  <span className="font-medium">{eventFlorists.length}</span> assigné{eventFlorists.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {/* 🆕 Liste des fleuristes avec détection de conflits */}
            {confirmedFlorists.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-medium text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">
                  ✅ Confirmés ({confirmedFlorists.length})
                </h5>
                <div className="space-y-2">
                  {confirmedFlorists.map((florist) => (
                    <FloristWithConflictWarning
                      key={florist.id}
                      florist={{
                        id: florist.id,
                        name: florist.name,
                        role: 'Fleuriste',
                        status: 'available'
                      }}
                      allEvents={allEvents}
                      currentEventId={event.id}
                      currentEventDate={new Date(event.date)}
                      onAssign={() => {}} // Pas d'assignation car déjà confirmé
                      showAddButton={false}
                      compact={true}
                      assignmentStatus="confirmed"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* 🆕 Liste des fleuristes en attente avec détection de conflits */}
            {pendingFlorists.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-2 uppercase tracking-wide">
                  ⏳ En attente de confirmation ({pendingFlorists.length})
                </h5>
                <div className="space-y-2">
                  {pendingFlorists.map((florist) => (
                    <FloristWithConflictWarning
                      key={florist.id}
                      florist={{
                        id: florist.id,
                        name: florist.name,
                        role: 'Fleuriste',
                        status: 'available'
                      }}
                      allEvents={allEvents}
                      currentEventId={event.id}
                      currentEventDate={new Date(event.date)}
                      onAssign={() => {}} // Déjà assigné, en attente
                      showAddButton={false}
                      compact={true}
                      assignmentStatus="pending"
                      onStatusChange={(newStatus) => {
                        console.log(`🌸 Changement statut ${florist.name}: ${newStatus}`)
                        // Ici on pourrait appeler updateEvent pour changer le statut
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Actions - Boutons réorganisés dans la même colonne */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit className="w-3 h-3" />}
                className="text-xs justify-start"
                onClick={() => handleEditEvent(event)}
              >
                Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Users className="w-3 h-3" />}
                className="text-xs text-purple-600 border-purple-300 hover:bg-purple-50 justify-start"
              >
                Fleuristes
              </Button>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">
                Créé le {new Date(event.createdAt).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-xs font-medium text-gray-700">
                ID: {event.id.slice(0, 8)}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {formatDate(date)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {events.length} événement{events.length > 1 ? 's' : ''} planifié{events.length > 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              leftIcon={<X className="w-4 h-4" />}
            />
          </div>
          
          {/* Contenu scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="p-6 space-y-4">
              {/* Événements visibles (max 5) */}
              {visibleEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
              
              {/* Bouton "Voir plus" si > 5 événements */}
              {hasMoreEvents && !showMoreEvents && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <Button
                    variant="outline"
                    onClick={() => setShowMoreEventsModal(true)}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    className="px-6"
                  >
                    Voir {hiddenEvents.length} autre{hiddenEvents.length > 1 ? 's' : ''} événement{hiddenEvents.length > 1 ? 's' : ''}
                  </Button>
                </motion.div>
              )}
              
              {/* Événements supplémentaires */}
              <AnimatePresence>
                {showMoreEvents && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {hiddenEvents.map((event, index) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        index={visibleEvents.length + index} 
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Footer avec actions globales */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{events.reduce((sum, event) => sum + getEventFlorists(event).filter((f: {isConfirmed: boolean}) => f.isConfirmed).length, 0)}</span> fleuristes confirmés sur{' '}
                <span className="font-medium">{events.reduce((sum, event) => sum + getEventFlorists(event).length, 0)}</span> assignés
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  Exporter la journée
                </Button>
                <Button variant="primary" size="sm" leftIcon={<CalendarIcon className="w-4 h-4" />} onClick={handleCreateEvent}>
                  Planifier nouveau
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Modal pour les événements supplémentaires */}
      <MoreEventsModal
        isOpen={showMoreEventsModal}
        onClose={() => setShowMoreEventsModal(false)}
        date={date}
        events={hiddenEvents}
      />

      {/* 🎯 EVENTMODAL pour création/édition depuis DayEventsModal */}
      <EventModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setSelectedEvent(null)
        }}
        onEdit={handleEventSave}
      />
    </AnimatePresence>
  )
}

export default DayEventsModal