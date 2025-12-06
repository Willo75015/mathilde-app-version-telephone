import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, AlertTriangle, CheckCircle, Eye } from 'lucide-react'
import { useEventTimeSync } from '@/hooks/useEventTimeSync'
import { useTime } from '@/contexts/TimeContext'

interface TimeSyncIndicatorProps {
  showDetails?: boolean
  onEventClick?: (eventId: string) => void
}

export const TimeSyncIndicator: React.FC<TimeSyncIndicatorProps> = ({ 
  showDetails = false,
  onEventClick 
}) => {
  const { formatTime } = useTime()
  const {
    todaysEventsCount,
    upcomingEventsCount,
    overdueEventsCount,
    getTodaysEvents,
    getUpcomingEvents,
    getOverdueEvents,
    currentTime
  } = useEventTimeSync()
  
  const todaysEvents = getTodaysEvents()
  const upcomingEvents = getUpcomingEvents().slice(0, 3) // 3 prochains
  const overdueEvents = getOverdueEvents()
  
  // Stats rapides
  const hasUrgentItems = overdueEventsCount > 0 || todaysEventsCount > 0
  
  if (!showDetails) {
    // Vue compacte pour le header
    return (
      <div className="flex items-center space-x-3 text-sm">
        {/* Heure synchronisée */}
        <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime()}</span>
        </div>
        
        {/* Indicateurs d'urgence */}
        {hasUrgentItems && (
          <div className="flex items-center space-x-2">
            {overdueEventsCount > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-1 text-red-600"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="font-bold">{overdueEventsCount}</span>
              </motion.div>
            )}
            
            {todaysEventsCount > 0 && (
              <div className="flex items-center space-x-1 text-blue-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{todaysEventsCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
  
  // Vue détaillée
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Synchronisation temps réel
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Dernière sync: {formatTime()}</span>
        </div>
      </div>
      
      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-2xl font-bold ${overdueEventsCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {overdueEventsCount}
          </div>
          <div className="text-xs text-gray-500">En retard</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${todaysEventsCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
            {todaysEventsCount}
          </div>
          <div className="text-xs text-gray-500">Aujourd'hui</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${upcomingEventsCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {upcomingEventsCount}
          </div>
          <div className="text-xs text-gray-500">À venir</div>
        </div>
      </div>
      
      {/* Événements en retard */}
      {overdueEvents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Événements en retard
          </h4>
          <div className="space-y-2">
            {overdueEvents.slice(0, 3).map(event => (
              <div 
                key={event.id}
                className="p-2 bg-red-50 border border-red-200 rounded text-sm cursor-pointer hover:bg-red-100"
                onClick={() => onEventClick?.(event.id)}
              >
                <div className="font-medium text-red-900">{event.title}</div>
                <div className="text-red-600 text-xs">
                  {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Événements d'aujourd'hui */}
      {todaysEvents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Événements d'aujourd'hui
          </h4>
          <div className="space-y-2">
            {todaysEvents.map(event => (
              <div 
                key={event.id}
                className="p-2 bg-blue-50 border border-blue-200 rounded text-sm cursor-pointer hover:bg-blue-100"
                onClick={() => onEventClick?.(event.id)}
              >
                <div className="font-medium text-blue-900">{event.title}</div>
                <div className="text-blue-600 text-xs">
                  {event.time} - {event.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Prochains événements */}
      {upcomingEvents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Prochains événements
          </h4>
          <div className="space-y-2">
            {upcomingEvents.map(event => {
              const daysUntil = Math.ceil((new Date(event.date).getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div 
                  key={event.id}
                  className="p-2 bg-green-50 border border-green-200 rounded text-sm cursor-pointer hover:bg-green-100"
                  onClick={() => onEventClick?.(event.id)}
                >
                  <div className="font-medium text-green-900">{event.title}</div>
                  <div className="text-green-600 text-xs">
                    Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''} - {event.time}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Message si aucun événement */}
      {overdueEvents.length === 0 && todaysEvents.length === 0 && upcomingEvents.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
          <p className="text-sm">Aucun événement urgent</p>
          <p className="text-xs">Tout est synchronisé !</p>
        </div>
      )}
    </div>
  )
}

export default TimeSyncIndicator
