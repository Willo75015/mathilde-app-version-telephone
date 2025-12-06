import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Target, AlertTriangle, Euro, X, Clock, MapPin, User
} from 'lucide-react'
import { Event, EventStatus } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface EventMetricsProps {
  events: Event[]
  className?: string
  onNavigateToEvent?: (eventId: string) => void
}

const EventMetrics: React.FC<EventMetricsProps> = ({ 
  events, 
  className = '',
  onNavigateToEvent 
}) => {
  const [showModal, setShowModal] = useState<string | null>(null)
  // Calcul des métriques
  const metrics = useMemo(() => {
    console.log('📊 EventMetrics: Total events received:', events.length)
    
    const today = new Date()
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const todayEvents = events.filter(e => 
      e.date.toDateString() === today.toDateString()
    )
    
    const weekEvents = events.filter(e => 
      e.date >= startOfWeek && e.date < endOfWeek
    )
    
    const urgentEvents = events.filter(e => {
      const daysDiff = Math.ceil((e.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff <= 1 && e.status !== EventStatus.COMPLETED
    })
    
    console.log('📅 Today events:', todayEvents.length)
    console.log('📅 Week events:', weekEvents.length)
    console.log('🚨 Urgent events:', urgentEvents.length)
    
    const totalRevenue = events.reduce((sum, e) => sum + e.budget, 0)
    
    return {
      todayCount: todayEvents.length,
      weekCount: weekEvents.length,
      urgentCount: urgentEvents.length,
      totalRevenue,
      totalEvents: events.length,
      todayEvents,
      weekEvents,
      urgentEvents
    }
  }, [events])
  
  const metricCards = [
    {
      id: 'today',
      title: "Aujourd'hui",
      value: metrics.todayCount,
      subtitle: 'événements',
      icon: Calendar,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      events: metrics.todayEvents,
      clickable: true
    },
    {
      id: 'week',
      title: 'Cette semaine',
      value: metrics.weekCount,
      subtitle: 'événements',
      icon: Target,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      events: metrics.weekEvents,
      clickable: true
    },
    {
      id: 'urgent',
      title: 'Urgents',
      value: metrics.urgentCount,
      subtitle: 'à traiter',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      events: metrics.urgentEvents,
      clickable: true
    },
    {
      id: 'revenue',
      title: 'CA Total',
      value: `${metrics.totalRevenue}€`,
      subtitle: `${metrics.totalEvents} événements`,
      icon: Euro,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      events: [],
      clickable: false
    }
  ]
  
  // Gestion des clics sur les métriques
  const handleMetricClick = (metric: typeof metricCards[0]) => {
    console.log('🔥 Metric clicked:', metric.id, 'Events count:', metric.events.length)
    
    if (!metric.clickable || metric.events.length === 0) {
      console.log('❌ Metric not clickable or no events')
      return
    }
    
    if (metric.events.length === 1) {
      // Navigation directe vers l'événement unique
      console.log('➡️ Single event navigation:', metric.events[0].title)
      onNavigateToEvent?.(metric.events[0].id)
    } else {
      // Popup avec liste des événements
      console.log('📋 Opening popup for', metric.events.length, 'events')
      setShowModal(metric.id)
    }
  }
  
  // Popup avec liste des événements
  const renderEventsModal = () => {
    if (!showModal) return null
    
    const metric = metricCards.find(m => m.id === showModal)
    if (!metric || metric.events.length === 0) return null
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`w-4 h-4 ${metric.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {metric.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.events.length} événement{metric.events.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(null)}
                leftIcon={<X className="w-4 h-4" />}
              />
            </div>
          </div>
          
          {/* Liste des événements */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-96">
            {metric.events.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onNavigateToEvent?.(event.id)
                  setShowModal(null)
                }}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {event.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.date.toLocaleDateString('fr-FR')} à {event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-600">
                      {event.budget.toLocaleString('fr-FR')}€
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      event.status === EventStatus.CONFIRMED ? 'bg-yellow-100 text-yellow-800' :
                      event.status === EventStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                      event.status === EventStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status === EventStatus.CONFIRMED ? 'Confirmé' :
                       event.status === EventStatus.IN_PROGRESS ? 'En cours' :
                       event.status === EventStatus.COMPLETED ? 'Terminé' : 'Brouillon'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <>
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 ${className}`}>
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`p-1.5 sm:p-2 transition-all duration-200 relative ${
                metric.clickable && metric.events.length > 0 
                  ? 'hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleMetricClick(metric)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate leading-tight">
                    {metric.title}
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {metric.subtitle}
                  </p>
                </div>
                
                <div className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.bgColor} rounded flex items-center justify-center flex-shrink-0 ml-1`}>
                  <metric.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${metric.iconColor}`} />
                </div>
              </div>
              
              {/* Indicateur urgent compact */}
              {metric.id === 'urgent' && metrics.urgentCount > 0 && (
                <div className="mt-1 sm:mt-2">
                  <div className="w-full bg-red-100 rounded-full h-0.5 sm:h-1">
                    <div 
                      className="bg-red-500 h-0.5 sm:h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((metrics.urgentCount / metrics.totalEvents) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Indicateur cliquable */}
              {metric.clickable && metric.events.length > 0 && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Modal des événements */}
      <AnimatePresence>
        {renderEventsModal()}
      </AnimatePresence>
    </>
  )
}

export default EventMetrics