import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Calendar, MapPin, Euro, Clock, 
  Users, Plus, Eye, Edit, Trash2 
} from 'lucide-react'
import { useEvents, useClients } from '@/contexts/AppContext'
import { Event, EventStatus } from '@/types'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import EventModal from '@/components/events/EventModal'
import SimpleDayEventsModal from '@/components/dashboard/SimpleDayEventsModal'
import ClientList from '@/components/clients/ClientList'
import { clsx } from 'clsx'

const EventCalendar: React.FC = () => {
  const { events, updateEvent, deleteEvent } = useEvents()
  const { clients } = useClients()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // 🆕 États pour les modales
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null)
  
  // 🆕 Vue secondaire pour afficher les clients
  const [sidebarView, setSidebarView] = useState<'events' | 'clients'>('events')
  
  // Calculer le mois et l'année actuels
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Obtenir le premier jour du mois et le nombre de jours
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Noms des mois et jours en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  
  // Filtrer les événements pour le mois courant
  const monthEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    })
  }, [events, currentMonth, currentYear])
  
  // Grouper les événements par jour
  const eventsByDay = useMemo(() => {
    const grouped: { [key: number]: Event[] } = {}
    monthEvents.forEach(event => {
      const day = event.date.getDate()
      if (!grouped[day]) {
        grouped[day] = []
      }
      grouped[day].push(event)
    })
    return grouped
  }, [monthEvents])
  
  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    setSelectedDate(null)
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    setSelectedDate(null)
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }
  
  // Créer la grille du calendrier
  const calendarDays = []
  
  // Jours du mois précédent (grisés)
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const prevMonthDay = new Date(currentYear, currentMonth - 1, lastDayOfMonth.getDate() - i)
    calendarDays.push({
      date: prevMonthDay,
      isCurrentMonth: false,
      events: []
    })
  }
  
  // Jours du mois courant
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    calendarDays.push({
      date,
      isCurrentMonth: true,
      events: eventsByDay[day] || []
    })
  }
  
  // Jours du mois suivant (pour compléter la grille)
  const remainingCells = 42 - calendarDays.length
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDay = new Date(currentYear, currentMonth + 1, day)
    calendarDays.push({
      date: nextMonthDay,
      isCurrentMonth: false,
      events: []
    })
  }
  
  // Obtenir les événements du jour sélectionné
  const selectedDayEvents = selectedDate 
    ? events.filter(event => 
        event.date.toDateString() === selectedDate.toDateString()
      )
    : []
  
  // 🆕 Handlers pour les modales
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleDayClick = (date: Date, dayEvents: Event[]) => {
    setSelectedDate(date)
    if (dayEvents.length > 0) {
      setSelectedDayForModal(date)
      setIsDayModalOpen(true)
    }
  }

  const handleEventEdit = (editedEvent: Event) => {
    updateEvent(editedEvent.id, editedEvent)
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  const handleEventDelete = (eventId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      deleteEvent(eventId)
    }
  }

  const handleCreateEvent = () => {
    setSelectedEvent(null) // Mode création
    setIsEventModalOpen(true)
  }
  
  // Couleur selon le statut
  const getEventColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.COMPLETED:
        return 'bg-green-500'
      case EventStatus.CONFIRMED:
        return 'bg-blue-500'
      case EventStatus.IN_PROGRESS:
        return 'bg-yellow-500'
      case EventStatus.CANCELLED:
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }
  
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header du calendrier */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateEvent}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nouvel événement
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Aujourd'hui
            </Button>
            
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                leftIcon={<ChevronRight className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
        
        {/* Statistiques du mois */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {monthEvents.filter(e => e.status === EventStatus.CONFIRMED).length} Confirmés
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {monthEvents.filter(e => e.status === EventStatus.COMPLETED).length} Terminés
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {monthEvents.filter(e => e.status === EventStatus.IN_PROGRESS).length} En cours
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <strong>{monthEvents.reduce((sum, e) => sum + e.budget, 0)}€</strong> de CA
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Calendrier principal */}
        <div className="flex-1 p-6">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isToday = day.date.toDateString() === new Date().toDateString()
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()
              
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDayClick(day.date, day.events)}
                  className={clsx(
                    'h-24 p-1 border border-gray-100 dark:border-gray-700 rounded-lg transition-all duration-200',
                    'hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500',
                    !day.isCurrentMonth && 'opacity-30',
                    isToday && 'bg-primary-50 border-primary-200',
                    isSelected && 'ring-2 ring-primary-500 bg-primary-50'
                  )}
                >
                  <div className="w-full h-full flex flex-col">
                    {/* Numéro du jour */}
                    <div className={clsx(
                      'text-sm font-medium mb-1',
                      isToday ? 'text-primary-700' : 'text-gray-900 dark:text-gray-100',
                      !day.isCurrentMonth && 'text-gray-400'
                    )}>
                      {day.date.getDate()}
                    </div>
                    
                    {/* Événements du jour */}
                    <div className="flex-1 space-y-1">
                      {day.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={clsx(
                            'w-full h-4 rounded text-xs text-white px-1 truncate',
                            getEventColor(event.status)
                          )}
                          title={`${event.title} - ${event.time}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{day.events.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
        
        {/* 🆕 Sidebar améliorée avec onglets */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col"
          >
            {/* 🆕 Onglets pour changer de vue */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setSidebarView('events')}
                  className={clsx(
                    'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                    sidebarView === 'events'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  📅 Événements
                </button>
                <button
                  onClick={() => setSidebarView('clients')}
                  className={clsx(
                    'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                    sidebarView === 'clients'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  👥 Clients ({clients.length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sidebarView === 'events' ? (
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedDate.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </h3>
                  
                  {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucun événement ce jour</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateEvent}
                        leftIcon={<Plus className="w-3 h-3" />}
                        className="mt-3"
                      >
                        Créer un événement
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayEvents.map(event => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEventClick(event)
                                }}
                                className="p-1 h-6 w-6"
                                title="Voir/Modifier"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEventDelete(event.id)
                                }}
                                className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <Badge className={clsx(
                            'text-xs mb-2',
                            event.status === EventStatus.COMPLETED ? 'bg-green-50 text-green-700' :
                            event.status === EventStatus.CONFIRMED ? 'bg-blue-50 text-blue-700' :
                            event.status === EventStatus.IN_PROGRESS ? 'bg-yellow-50 text-yellow-700' :
                            'bg-gray-50 text-gray-700'
                          )}>
                            {event.status === EventStatus.COMPLETED ? 'Terminé' :
                             event.status === EventStatus.CONFIRMED ? 'Confirmé' :
                             event.status === EventStatus.IN_PROGRESS ? 'En cours' : 'Brouillon'}
                          </Badge>
                          
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Euro className="w-3 h-3" />
                              <span className="font-medium">{event.budget}€</span>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // 🆕 Vue Clients intégrée
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      👥 Liste des clients
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {clients.length} client{clients.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="max-h-[600px] overflow-y-auto">
                    {clients.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun client</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clients.map(client => (
                          <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                  {client.firstName} {client.lastName}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {client.email}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {client.address.city}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* 🎯 MODALES INTÉGRÉES - Fonctionnalités manquantes ajoutées */}
      
      {/* Modal d'événement pour création/édition */}
      <EventModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setSelectedEvent(null)
        }}
        onEdit={handleEventEdit}
      />

      {/* Modal pour afficher tous les événements d'un jour */}
      <SimpleDayEventsModal
        isOpen={isDayModalOpen}
        onClose={() => {
          setIsDayModalOpen(false)
          setSelectedDayForModal(null)
        }}
        date={selectedDayForModal || new Date()}
        events={selectedDayForModal ? events.filter(event => 
          event.date.toDateString() === selectedDayForModal.toDateString()
        ) : []}
        onCreateEvent={() => {
          setSelectedEvent(null)
          setIsEventModalOpen(true)
        }}
        onEditEvent={(event) => {
          setSelectedEvent(event)
          setIsEventModalOpen(true)
        }}
      />
    </>
  )
}

export default EventCalendar