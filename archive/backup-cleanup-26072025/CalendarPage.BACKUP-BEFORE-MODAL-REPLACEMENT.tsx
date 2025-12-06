import React, { useState } from 'react'
import { Calendar, Clock, User, MapPin, Euro, Plus, CheckCircle, AlertCircle, Kanban as KanbanIcon, Edit, Trash2 } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { KANBAN_COLUMNS, EventStatus, getKanbanColumn } from '@/types'
import EventModal from '@/components/events/EventModal'

interface CalendarPageProps {
  navigate: (page: string, params?: any) => void
}

type ViewMode = 'calendrier' | 'kanban'

const CalendarPage: React.FC<CalendarPageProps> = ({ navigate }) => {
  const { state, actions } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('calendrier')

  // 🆕 États pour EventModal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  // Récupérer les événements depuis le state global
  const events = state.events || []

  // 🆕 Handlers pour EventModal
  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null) // Mode création
    setIsEventModalOpen(true)
  }

  const handleEventSave = (editedEvent: any) => {
    if (actions.updateEvent) {
      actions.updateEvent(editedEvent.id, editedEvent)
    }
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  // Fonction pour obtenir les événements d'un jour
  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dayDate = new Date(year, month, day)
    const dayString = dayDate.toISOString().split('T')[0]
    
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0]
      return eventDate === dayString
    })
  }

  // Fonction pour naviguer dans les mois
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Lundi = 0
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }

  // Vue Kanban
  const renderKanbanView = () => {
    const kanbanColumns = KANBAN_COLUMNS.map(column => ({
      ...column,
      count: events.filter(e => e.status === column.status).length
    }))

    return (
      <div className="space-y-6">
        {/* Récapitulatif */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Récapitulatif des événements
          </h2>
          
          <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-6 sm:gap-y-8">
            {KANBAN_COLUMNS.slice(0, 4).map((column, index) => {
              const count = events.filter(e => e.status === column.status).length
              const IconComponent = index === 0 ? Clock : index === 1 ? CheckCircle : index === 2 ? AlertCircle : CheckCircle
              
              return (
                <div key={column.id} className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${column.headerColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${column.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{column.title}</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {count}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Tableau Kanban - Gestion des Événements
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">ℹ</span>
                </div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Organisation par statuts d'événements</p>
                  <p>Glissez-déposez les événements entre les colonnes pour changer leur statut.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonnes Kanban */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {KANBAN_COLUMNS.map((column) => {
              const columnEvents = events.filter(e => e.status === column.status)
              
              return (
                <div key={column.id} className="flex flex-col">
                  {/* En-tête de colonne */}
                  <div className={`${column.headerColor} rounded-t-lg p-3 border-b-2 border-gray-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{column.emoji}</span>
                        <h3 className={`font-medium ${column.textColor}`}>{column.title}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${column.bgColor} ${column.textColor} font-medium`}>
                        {columnEvents.length}
                      </span>
                    </div>
                  </div>

                  {/* Corps de colonne */}
                  <div className={`${column.bgColor} rounded-b-lg p-3 min-h-96 space-y-3`}>
                    {columnEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm flex-1">{event.title}</h4>
                          
                          {/* 🎯 BOUTONS D'ACTION avec crayon */}
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEventClick(event)
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Modifier l'événement"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm('Supprimer cet événement ?')) {
                                  // TODO: Ajouter la suppression
                                  console.log('Supprimer événement:', event.id)
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Supprimer l'événement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                          
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {event.clientName || 'Client non spécifié'}
                          </div>
                          
                          <div className="flex items-center">
                            <Euro className="w-3 h-3 mr-1" />
                            {event.budget}€
                          </div>
                        </div>

                        {event.description && (
                          <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {/* Actions rapides */}
                        <div className="mt-3 flex justify-between items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${getKanbanColumn(event.status).bgColor} ${getKanbanColumn(event.status).textColor}`}>
                            {getKanbanColumn(event.status).emoji} {getKanbanColumn(event.status).title}
                          </span>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate('events/edit', { eventId: event.id })
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Bouton d'ajout dans chaque colonne */}
                    <button
                      onClick={handleCreateEvent}
                      className={`w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2`}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Ajouter un événement</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Vue Calendrier
  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Navigation du calendrier */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Précédent
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {formatMonth(currentDate)}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Suivant →
          </button>
        </div>

        {/* Calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {/* En-têtes des jours */}
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded"
            >
              {day}
            </div>
          ))}

          {/* Jours vides avant le début du mois */}
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2 h-20"></div>
          ))}

          {/* Jours du mois */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dayEvents = getEventsForDay(day)
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day.toString())}
                className={`p-2 h-20 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-green-700' : 'text-gray-900'}`}>
                  {day}
                </div>
                
                {/* Événements du jour */}
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded truncate"
                      title={event.title}
                    >
                      {event.time} - {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Popup pour afficher les événements du jour
  const renderDayPopup = () => {
    if (!selectedDay) return null

    const dayEvents = getEventsForDay(parseInt(selectedDay))
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Événements du {selectedDay} {formatMonth(currentDate).split(' ')[0]}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {dayEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun événement ce jour
              </p>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {event.clientName || 'Client non spécifié'}
                      </div>
                      <div className="flex items-center">
                        <Euro className="w-4 h-4 mr-2" />
                        {event.budget}€
                      </div>
                    </div>
                    {event.description && (
                      <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedDay(null)
                  navigate('events/create')
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel Événement</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
              <p className="text-gray-600">Gérez vos événements fleuriste</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Toggle Vue */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendrier')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'calendrier'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendrier</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <KanbanIcon className="w-4 h-4" />
                <span>Kanban</span>
              </button>
            </div>

            <button
              onClick={handleCreateEvent}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Événement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total Événements</p>
              <p className="text-2xl font-bold text-blue-600">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Ce Mois</p>
              <p className="text-2xl font-bold text-green-600">
                {events.filter(event => {
                  const eventDate = new Date(event.date)
                  return eventDate.getMonth() === currentDate.getMonth() && 
                         eventDate.getFullYear() === currentDate.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <User className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Clients Actifs</p>
              <p className="text-2xl font-bold text-purple-600">{state.clients?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal selon la vue */}
      {viewMode === 'calendrier' ? renderCalendarView() : renderKanbanView()}

      {/* Popup événements du jour */}
      {renderDayPopup()}

      {/* 🎯 EVENTMODAL pour création/édition */}
      <EventModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setSelectedEvent(null)
        }}
        onEdit={handleEventSave}
      />
    </div>
  )
}

export default CalendarPage