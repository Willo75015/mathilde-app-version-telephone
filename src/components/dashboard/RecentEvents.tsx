import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, User, ArrowRight } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useEvents, useClients } from '@/contexts/AppContext'
import { EventStatus } from '@/types'

interface RecentEventsProps {
  navigate?: (page: string, params?: any) => void
}

const RecentEvents: React.FC<RecentEventsProps> = ({ navigate }) => {
  const { events } = useEvents()
  const { clients } = useClients()
  const [showMore, setShowMore] = useState(false)
  
  // Trier par date d'événement (le plus proche en premier)
  const sortedEvents = events
    .filter(event => new Date(event.date) >= new Date()) // Seulement les événements futurs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Limiter à 3 par défaut, 6 max si "voir plus" activé
  const displayedEvents = sortedEvents.slice(0, showMore ? 6 : 3)
  
  const getClient = (clientId: string) => {
    return clients.find(client => client.id === clientId)
  }
  
  const getStatusVariant = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return 'default'
      case EventStatus.CONFIRMED:
        return 'primary'
      case EventStatus.IN_PROGRESS:
        return 'warning'
      case EventStatus.COMPLETED:
        return 'success'
      case EventStatus.CANCELLED:
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return 'Brouillon'
      case EventStatus.CONFIRMED:
        return 'Confirmé'
      case EventStatus.IN_PROGRESS:
        return 'En cours'
      case EventStatus.COMPLETED:
        return 'Terminé'
      case EventStatus.CANCELLED:
        return 'Annulé'
      default:
        return 'Inconnu'
    }
  }

  const handleViewAllEvents = () => {
    console.log('🎯 Navigation vers tous les événements')
    if (navigate) {
      navigate('events')
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'events' } }))
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Prochains événements</span>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        {displayedEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun événement à venir
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedEvents.map((event) => {
              const client = getClient(event.clientId)
              
              return (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
                >
                  {/* Header avec date et montant */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(event.date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {event.budget.toLocaleString('fr-FR')}€
                      </div>
                      <div className="text-xs text-gray-500">
                        1 événement
                      </div>
                    </div>
                  </div>

                  {/* Titre et statut */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <div className="text-right ml-auto">
                        <div className="text-lg font-bold text-green-600">
                          {event.budget.toLocaleString('fr-FR')}€
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(event.status)} size="sm" className="mb-3">
                      {getStatusLabel(event.status)}
                    </Badge>
                  </div>

                  {/* Informations détaillées */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Client :</span> {client ? `${client.firstName} ${client.lastName}` : 'Client inconnu'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Date :</span> {new Date(event.date).toLocaleDateString('fr-FR')} - {new Date(event.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Horaires :</span> {event.time} - {event.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Lieu :</span> {event.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-xs text-white font-bold">F</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Fleuriste requis :</span> {event.flowers?.length || 0}/2
                      </span>
                      {event.flowers && event.flowers.length > 0 && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          Manque
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assignation fleuriste */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">JM</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Jean Moreau
                      </span>
                      <div className="ml-auto flex space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="space-y-2">
                    <Button 
                      variant="primary" 
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                      onClick={() => {
                        if (navigate) {
                          navigate('events', { eventId: event.id, mode: 'assign' })
                        }
                      }}
                    >
                      + Assigner Fleuriste (1 manquant)
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (navigate) {
                            navigate('events', { eventId: event.id, mode: 'cancel' })
                          }
                        }}
                      >
                        Annuler Client
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-10 h-8 p-0 border-gray-300"
                      >
                        <span className="text-gray-600">⋯</span>
                      </Button>
                    </div>
                  </div>

                  {/* Footer avec boutons verts */}
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="primary"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        if (navigate) {
                          navigate('events', { eventId: event.id, mode: 'edit' })
                        }
                      }}
                    >
                      + Nouvel Événement
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="px-4 border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      ⚠ Traiter Urgent
                    </Button>
                  </div>
                </motion.div>
              )
            })}
            
            {/* Bouton voir plus/moins */}
            {sortedEvents.length > 3 && (
              <div className="text-center pt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowMore(!showMore)}
                  rightIcon={<ArrowRight className={`w-4 h-4 transition-transform ${showMore ? 'rotate-90' : ''}`} />}
                >
                  {showMore ? 'Voir moins d\'événements' : `Voir plus d'événements (${Math.min(sortedEvents.length - 3, 3)} de plus)`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentEvents
