import React from 'react'
import { motion } from 'framer-motion'
import { 
  X, Plus, Calendar as CalendarIcon, Clock, MapPin, 
  User, DollarSign, Edit, Trash2 
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Event } from '@/types'

interface SimpleDayEventsModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  events: Event[]
  onCreateEvent?: () => void
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (eventId: string) => void
}

const SimpleDayEventsModal: React.FC<SimpleDayEventsModalProps> = ({
  isOpen,
  onClose,
  date,
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  if (!isOpen) return null

  // Formatage de la date
  const formattedDate = date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Calculer le budget total
  const totalBudget = events.reduce((sum, event) => sum + (event.budget || 0), 0)
  
  // Trier les événements par heure
  const sortedEvents = events.sort((a, b) => {
    const timeA = a.time || '00:00'
    const timeB = b.time || '00:00'
    return timeA.localeCompare(timeB)
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formattedDate}</h2>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-600">
                  {events.length} événement{events.length > 1 ? 's' : ''}
                </p>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-bold text-green-600">{totalBudget.toLocaleString()}€</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Liste des événements */}
        <div className="overflow-y-auto max-h-[60vh]">
          {events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Aucun événement</p>
              <p className="text-sm">Cette journée est libre</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {sortedEvents.map((event) => (
                <div 
                  key={event.id}
                  className="rounded-xl p-4 border-2 border-gray-300 bg-gray-50 cursor-pointer transition-all hover:scale-[1.02]"
                  onClick={() => onEditEvent?.(event)}
                >
                  {/* Header événement */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {event.title}
                      </h3>
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 bg-green-100 text-green-800">
                        TERMINÉ
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {(event.budget || 0).toLocaleString()}€
                      </div>
                    </div>
                  </div>
                  
                  {/* Informations détaillées */}
                  <div className="space-y-2 text-sm text-gray-700">
                    {/* Horaires */}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{event.time || '09:00'} - {event.endTime || '17:00'}</span>
                      <span className="text-xs text-gray-500">
                        📅 {new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* Lieu */}
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>{event.location || 'Lieu non spécifié'}</span>
                    </div>
                    
                    {/* Client */}
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-purple-500" />
                      <span>{event.clientName || 'Client non spécifié'}</span>
                    </div>
                    
                    {/* Fleuristes */}
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">
                          👥 Fleuristes requis: 2/2
                        </span>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        {/* Sophie Durand */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              SD
                            </div>
                            <span className="text-sm font-medium">Sophie Durand</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="w-6 h-6 bg-green-400 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors">
                              <span className="text-white text-xs">✓</span>
                            </button>
                            <button className="w-6 h-6 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                              <span className="text-white text-xs">💬</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Julie Bernard */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              JB
                            </div>
                            <span className="text-sm font-medium">Julie Bernard</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="w-6 h-6 bg-green-400 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors">
                              <span className="text-white text-xs">✓</span>
                            </button>
                            <button className="w-6 h-6 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                              <span className="text-white text-xs">💬</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                onClose()
                onCreateEvent?.()
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Événement</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SimpleDayEventsModal