import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Edit, Phone, MessageCircle, Users, Clock, 
  MapPin, Euro, Calendar as CalendarIcon
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import FloristWithConflictWarning from '@/components/ui/FloristWithConflictWarning'
import { Event, EventStatus } from '@/types'
import { useApp } from '@/contexts/AppContext'

interface MoreEventsModalProps {
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

const MoreEventsModal: React.FC<MoreEventsModalProps> = ({ 
  isOpen, 
  onClose, 
  date, 
  events 
}) => {
  const { state } = useApp() // 🆕 Pour accéder à tous les événements
  const allEvents = state.events // 🆕 Tous les événements pour détecter les conflits
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
  const getEventFlorists = (eventId: string): Florist[] => {
    return mockFlorists.slice(0, Math.floor(Math.random() * 3) + 1)
  }
  
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }
  
  const handleWhatsApp = (phone: string, floristName: string) => {
    const cleanPhone = phone.replace(/\+33/, '33').replace(/\s/g, '')
    const message = encodeURIComponent(`Bonjour ${floristName}, j'ai une question concernant la mission du ${date.toLocaleDateString('fr-FR')}.`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const EventCompactCard: React.FC<{ event: Event; index: number }> = ({ event, index }) => {
    const eventFlorists = getEventFlorists(event.id)
    const confirmedFlorists = eventFlorists.filter(f => f.isConfirmed)
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <Card className="p-3 hover:shadow-sm transition-all duration-200 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            {/* Informations principales */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {event.title}
                </h4>
                <Badge 
                  variant={getStatusBadgeVariant(event.status)}
                  className={`${getStatusColor(event.status)} text-white text-xs`}
                >
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Euro className="w-3 h-3" />
                  <span>{event.budget.toLocaleString('fr-FR')}€</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{confirmedFlorists.length}/{eventFlorists.length} confirmés</span>
                </div>
              </div>
            </div>
            
            {/* Actions compactes */}
            <div className="flex items-center space-x-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-7 w-7"
                title="Modifier"
              >
                <Edit className="w-3 h-3" />
              </Button>
              
              {/* Actions fleuristes */}
              {confirmedFlorists.length > 0 && (
                <div className="flex items-center space-x-1">
                  {confirmedFlorists.slice(0, 2).map((florist) => (
                    <div key={florist.id} className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCall(florist.phone)}
                        className="p-1 h-7 w-7 text-blue-600 hover:text-blue-700"
                        title={`Appeler ${florist.name}`}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWhatsApp(florist.phone, florist.name)}
                        className="p-1 h-7 w-7 text-green-600 hover:text-green-700"
                        title={`WhatsApp ${florist.name}`}
                      >
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {confirmedFlorists.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{confirmedFlorists.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Détails fleuristes au survol */}
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-h-0 group-hover:max-h-24 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 text-xs">
              <div className="font-medium mb-1">Équipe assignée:</div>
              <div className="flex flex-wrap gap-1">
                {eventFlorists.map((florist) => (
                  <span 
                    key={florist.id}
                    className={`px-1 py-0.5 rounded text-xs ${
                      florist.isConfirmed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}
                  >
                    {florist.name} {florist.isConfirmed ? '✅' : '⏳'}
                  </span>
                ))}
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
        className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tous les événements
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(date)} • {events.length} événement{events.length > 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              leftIcon={<X className="w-4 h-4" />}
            />
          </div>
          
          {/* Liste des événements */}
          <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
            <div className="p-4 space-y-3">
              {events.map((event, index) => (
                <EventCompactCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: <span className="font-medium">{events.length}</span> événements •{' '}
                <span className="font-medium">
                  {events.reduce((sum, event) => sum + getEventFlorists(event.id).filter(f => f.isConfirmed).length, 0)}
                </span> fleuristes confirmés
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Exporter la liste
                </Button>
                <Button variant="primary" size="sm" leftIcon={<CalendarIcon className="w-4 h-4" />}>
                  Vue détaillée
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MoreEventsModal