import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, CheckCircle, Plus } from 'lucide-react'
import { Event, EventStatus } from '@/types'
import EventMetrics from './EventMetrics'
import EventCard from './EventCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface EventDashboardProps {
  events: Event[]
  onCreateEvent?: () => void
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onCall?: (phone: string) => void
  onEmail?: (email: string) => void
  className?: string
}

const EventDashboard: React.FC<EventDashboardProps> = ({
  events,
  onCreateEvent,
  onEdit,
  onDelete,
  onCall,
  onEmail,
  className = ''
}) => {
  const today = new Date()
  
  // Événements urgents (J-1 ou en retard)
  const urgentEvents = events.filter(event => {
    const daysDiff = Math.ceil((event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 1 && event.status !== EventStatus.COMPLETED
  }).slice(0, 3) // Limiter à 3 pour l'affichage
  
  // Événements du jour
  const todayEvents = events.filter(event => 
    event.date.toDateString() === today.toDateString()
  ).slice(0, 4) // Limiter à 4 pour l'affichage
  
  // Événements récents (complétés ou en cours)
  const recentEvents = events
    .filter(event => event.status !== EventStatus.DRAFT)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métriques */}
      <EventMetrics events={events} />
      
      {/* Événements urgents */}
      {urgentEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900 dark:text-red-300">
                  🚨 Événements urgents ({urgentEvents.length})
                </h3>
              </div>
              <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                Voir tout
              </Button>
            </div>
            
            <div className="space-y-3">
              {urgentEvents.map(event => {
                const daysDiff = Math.ceil((event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                const isOverdue = daysDiff < 0
                
                return (
                  <div 
                    key={event.id} 
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onEdit && onEdit(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span>
                            {event.date.toLocaleDateString('fr-FR')} à {event.time}
                          </span>
                          <span>•</span>
                          <span>{event.location}</span>
                          <span>•</span>
                          <span className="font-medium">{event.budget}€</span>
                        </div>
                        <div className="mt-2">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              En retard de {Math.abs(daysDiff)} jour{Math.abs(daysDiff) > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                              <Clock className="w-3 h-3" />
                              {daysDiff === 0 ? "Aujourd'hui" : "Demain"}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="primary">
                        Action
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}
      
      {/* Vue grille des sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Événements d'aujourd'hui */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                📅 Aujourd'hui ({todayEvents.length})
              </h3>
              {todayEvents.length > 4 && (
                <Button size="sm" variant="ghost">
                  Voir tout
                </Button>
              )}
            </div>
            
            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Aucun événement aujourd'hui</p>
                <p className="text-sm">Profitez de cette journée calme ! 🌸</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map(event => (
                  <div 
                    key={event.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => onEdit && onEdit(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {event.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {event.time} • {event.location} • {event.budget}€
                        </p>
                      </div>
                      <div className="text-xs">
                        {event.status === EventStatus.COMPLETED ? (
                          <span className="text-green-600">✅ Terminé</span>
                        ) : event.status === EventStatus.IN_PROGRESS ? (
                          <span className="text-blue-600">🔄 En cours</span>
                        ) : (
                          <span className="text-orange-600">⏳ Confirmé</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
        
        {/* Activité récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                📊 Activité récente
              </h3>
              <Button 
                size="sm" 
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={onCreateEvent}
              >
                Nouveau
              </Button>
            </div>
            
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Aucune activité récente</p>
                <Button 
                  size="sm" 
                  variant="ghost"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={onCreateEvent}
                  className="mt-2"
                >
                  Créer votre premier événement
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map(event => (
                  <div 
                    key={event.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => onEdit && onEdit(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {event.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {event.date.toLocaleDateString('fr-FR')} • {event.budget}€
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor((Date.now() - event.updatedAt.getTime()) / (1000 * 60 * 60 * 24))} j
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default EventDashboard