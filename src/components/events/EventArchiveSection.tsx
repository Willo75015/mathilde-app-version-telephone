import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, ChevronDown, ChevronRight, Eye, Calendar, MapPin, User, Euro } from 'lucide-react'
import { Event, EventStatus } from '@/types'
import { filterArchivedEvents, getStatusText, isPaymentOverdue } from '@/utils/eventHelpers'
import Button from '@/components/ui/Button'

interface EventArchiveSectionProps {
  events: Event[]
  onViewEvent?: (event: Event) => void
  className?: string
}

const EventArchiveSection: React.FC<EventArchiveSectionProps> = ({
  events,
  onViewEvent,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Filtrer les événements archivés
  const archivedEvents = filterArchivedEvents(events).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  if (archivedEvents.length === 0) {
    return null
  }
  
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header de la section Archives */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Archive className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📁 Archives
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {archivedEvents.length} événement{archivedEvents.length > 1 ? 's' : ''} archivé{archivedEvents.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </div>
      
      {/* Contenu des archives */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {archivedEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Titre et statut */}
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {event.title}
                          </h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {getStatusText(event.status)}
                          </span>
                          
                          {/* Indicateur retard si applicable */}
                          {isPaymentOverdue(event) && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 whitespace-nowrap animate-pulse">
                              ⚠️ RETARD
                            </span>
                          )}
                        </div>
                        
                        {/* Informations compactes */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">{event.clientName || 'Client non spécifié'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Euro className="w-3 h-3" />
                            <span>{formatCurrency(event.budget)}</span>
                          </div>
                        </div>
                        
                        {/* Date d'archivage */}
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                          {event.archivedAt && (
                            <>Archivé le {new Date(event.archivedAt).toLocaleDateString('fr-FR')}</>
                          )}
                          {event.status === EventStatus.COMPLETED && event.completedDate && !event.archivedAt && (
                            <>Terminé le {new Date(event.completedDate).toLocaleDateString('fr-FR')} • Auto-archivé</>
                          )}
                          {event.status === EventStatus.PAID && event.paidDate && !event.archivedAt && (
                            <>Payé le {new Date(event.paidDate).toLocaleDateString('fr-FR')} • Auto-archivé</>
                          )}
                          {event.status === EventStatus.CANCELLED && event.cancelledAt && !event.archivedAt && (
                            <>Annulé le {new Date(event.cancelledAt).toLocaleDateString('fr-FR')} • Auto-archivé</>
                          )}
                        </div>
                      </div>
                      
                      {/* Bouton d'action */}
                      <div className="ml-3 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewEvent?.(event)}
                          leftIcon={<Eye className="w-3 h-3" />}
                        >
                          Voir
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Message si trop d'archives */}
                {archivedEvents.length > 10 && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ... et {archivedEvents.length - 10} autres événements archivés
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventArchiveSection
