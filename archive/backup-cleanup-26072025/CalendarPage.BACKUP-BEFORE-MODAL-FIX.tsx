import React, { useState } from 'react'
import { Calendar, Clock, User, MapPin, Euro, Plus, CheckCircle, AlertCircle, Kanban as KanbanIcon, Edit, Trash2, X, DollarSign } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { KANBAN_COLUMNS, EventStatus, getKanbanColumn } from '@/types'
import EventModal from '@/components/events/EventModal'
import { ArchiveEventModal, PaymentTrackingModal } from '@/components/modals/billing'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationContainer } from '@/components/ui/Notification'

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

  // 🆕 HOOKS ET ÉTATS POUR LE WORKFLOW DE FACTURATION  
  const { notifications, removeNotification, showSuccess, showError } = useNotifications()
  
  const [selectedEventForArchive, setSelectedEventForArchive] = useState<any>(null)
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<any>(null)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

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

  // 🆕 HANDLERS POUR LE WORKFLOW DE FACTURATION
  const handleArchiveAndInvoice = (event: any) => {
    console.log('🎯 CALENDAR - Ouverture modale archivage pour:', event.title)
    setSelectedEventForArchive(event)
    setIsArchiveModalOpen(true)
  }

  const handlePaymentTracking = (event: any) => {
    console.log('🎯 CALENDAR - Ouverture modale paiement pour:', event.title)
    setSelectedEventForPayment(event)
    setIsPaymentModalOpen(true)
  }

  const handleArchiveConfirm = async (eventId: string) => {
    try {
      console.log('💼 CALENDAR - Archivage et facturation:', eventId)
      
      // 🔧 CORRECTION: Utiliser directement les actions du contexte existant
      if (actions.updateEvent) {
        const updates = {
          status: EventStatus.INVOICED,
          archived: true,
          invoiced: true,
          invoiceDate: new Date(),
          updatedAt: new Date()
        }
        
        actions.updateEvent(eventId, updates)
        
        showSuccess(
          `Événement archivé et facturé avec succès !`,
          'Facturation créée'
        )
        
        setIsArchiveModalOpen(false)
        setSelectedEventForArchive(null)
      } else {
        throw new Error('Fonction de mise à jour non disponible')
      }
      
    } catch (error) {
      console.error('❌ CALENDAR - Erreur archivage:', error)
      showError(
        `Erreur lors de l'archivage: ${error.message}`,
        'Erreur de facturation'
      )
    }
  }

  const handlePaymentStatusUpdate = async (eventId: string, status: 'paid' | 'overdue' | 'reminder') => {
    try {
      console.log('💰 CALENDAR - Mise à jour paiement:', eventId, status)
      
      // 🔧 CORRECTION: Utiliser directement les actions du contexte existant
      if (actions.updateEvent) {
        if (status === 'paid') {
          const updates = {
            status: EventStatus.PAID,
            paid: true,
            paidDate: new Date(),
            paymentMethod: 'transfer',
            updatedAt: new Date()
          }
          
          actions.updateEvent(eventId, updates)
        }
        
        const messages = {
          paid: 'Paiement enregistré avec succès !',
          overdue: 'Événement marqué comme en retard',
          reminder: 'Relance client enregistrée'
        }
        
        showSuccess(messages[status], 'Paiement mis à jour')
        
        if (status === 'paid') {
          setIsPaymentModalOpen(false)
          setSelectedEventForPayment(null)
        }
      } else {
        throw new Error('Fonction de mise à jour non disponible')
      }
      
    } catch (error) {
      console.error('❌ CALENDAR - Erreur paiement:', error)
      showError(
        `Erreur lors de la mise à jour: ${error.message}`,
        'Erreur de paiement'
      )
    }
  }

  // 🔍 Fonction pour obtenir les événements d'un jour (CORRECTION TIMEZONE)
  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dayDate = new Date(year, month, day)
    
    // 🔧 CORRECTION : Éviter les problèmes de timezone en comparant les dates directement
    return events.filter(event => {
      const eventDate = new Date(event.date)
      
      // Comparer année, mois et jour directement
      return eventDate.getFullYear() === year &&
             eventDate.getMonth() === month &&
             eventDate.getDate() === day
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

  // 🔄 FONCTION POUR CALCULER LE STATUT AUTOMATIQUE SELON LES FLEURISTES
  const getActualEventStatus = (event: any) => {
    // 🆕 PRIORISER LES STATUTS DE FACTURATION
    if (event.status === EventStatus.INVOICED || event.status === EventStatus.PAID) {
      return event.status
    }
    
    // Si l'événement est terminé ou annulé, garder le statut original
    if (event.status === EventStatus.COMPLETED || event.status === EventStatus.CANCELLED) {
      return event.status
    }
    
    // 📅 VÉRIFIER SI L'ÉVÉNEMENT EST PASSÉ
    const today = new Date()
    const eventDate = new Date(event.date)
    const isToday = today.getFullYear() === eventDate.getFullYear() &&
                    today.getMonth() === eventDate.getMonth() &&
                    today.getDate() === eventDate.getDate()
    const isPast = eventDate < today && !isToday
    
    // 🔄 LOGIQUE AUTOMATIQUE POUR ÉVÉNEMENTS PASSÉS
    if (isPast) {
      // Les événements passés deviennent automatiquement "completed"
      return EventStatus.COMPLETED
    }
    
    // Calculer le nombre de fleuristes assignés et confirmés
    const assignedCount = event.assignedFlorists?.length || 0
    const confirmedCount = event.assignedFlorists?.filter((f: any) => f.isConfirmed && f.status === 'confirmed').length || 0
    const requiredCount = event.floristsRequired || 0
    
    // 🔄 LOGIQUE KANBAN POUR ÉVÉNEMENTS FUTURS ET D'AUJOURD'HUI :
    
    // 1. IN_PROGRESS = SEULEMENT pour les événements d'AUJOURD'HUI avec tous les fleuristes confirmés
    if (isToday && confirmedCount >= requiredCount && requiredCount > 0) {
      return EventStatus.IN_PROGRESS
    }
    
    // 2. CONFIRMED = Tous les fleuristes requis confirmés (mais pas aujourd'hui)
    if (confirmedCount >= requiredCount && requiredCount > 0) {
      return EventStatus.CONFIRMED
    }
    
    // 3. DRAFT = Pas assez de fleuristes confirmés
    return EventStatus.DRAFT
  }

  // Fonction pour calculer l'urgence des événements
  const calculateEventUrgency = (event: any) => {
    const now = new Date()
    const eventDate = new Date(event.date)
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // 🔄 UTILISER LE STATUT AUTOMATIQUE au lieu du statut stocké
    const actualStatus = getActualEventStatus(event)
    
    // 📅 Événements terminés (passés ou marqués completed)
    if (actualStatus === 'completed') {
      return { level: 0, label: 'TERMINÉ', color: 'green', priority: 'archive', emoji: '✅' }
    }
    
    // Événements annulés
    if (actualStatus === 'cancelled') {
      return { level: 0, label: 'ANNULÉ', color: 'gray', priority: 'archive', emoji: '❌' }
    }
    
    // 🚨 Événements passés non terminés = CRITIQUE (ne devrait plus arriver avec la logique automatique)
    if (daysUntilEvent < 0 && actualStatus !== 'completed') {
      return { level: 5, label: 'EN RETARD', color: 'red', priority: 'critical', emoji: '🚨' }
    }
    
    // Événements aujourd'hui
    if (daysUntilEvent === 0) {
      if (actualStatus === 'draft') return { level: 5, label: 'AUJOURD\'HUI - FLEURISTES MANQUANTS', color: 'red', priority: 'critical', emoji: '🚨' }
      if (actualStatus === 'in_progress') return { level: 4, label: 'AUJOURD\'HUI - EN COURS', color: 'blue', priority: 'high', emoji: '🔄' }
      if (actualStatus === 'confirmed') return { level: 4, label: 'AUJOURD\'HUI - DÉMARRAGE IMMINENT', color: 'orange', priority: 'high', emoji: '🔥' }
    }
    
    // Événements demain
    if (daysUntilEvent === 1) {
      if (actualStatus === 'draft') return { level: 4, label: 'DEMAIN - FLEURISTES MANQUANTS', color: 'orange', priority: 'high', emoji: '🔥' }
      if (actualStatus === 'confirmed') return { level: 2, label: 'DEMAIN - CONFIRMÉ ET EN ATTENTE', color: 'yellow', priority: 'medium', emoji: '⏳' }
    }
    
    // Événements cette semaine (2-7 jours)
    if (daysUntilEvent >= 2 && daysUntilEvent <= 7) {
      if (actualStatus === 'draft') return { level: 3, label: 'CETTE SEMAINE - FLEURISTES MANQUANTS', color: 'yellow', priority: 'medium', emoji: '⚡' }
      if (actualStatus === 'confirmed') return { level: 1, label: 'CETTE SEMAINE - CONFIRMÉ ET EN ATTENTE', color: 'yellow', priority: 'low', emoji: '⏳' }
    }
    
    // Événements futurs
    if (daysUntilEvent > 7) {
      if (actualStatus === 'draft') return { level: 2, label: 'FUTUR - À PLANIFIER', color: 'gray', priority: 'low', emoji: '📋' }
      if (actualStatus === 'confirmed') return { level: 1, label: 'FUTUR - CONFIRMÉ ET EN ATTENTE', color: 'green', priority: 'planning', emoji: '⏳' }
    }
    
    return { level: 1, label: 'À VÉRIFIER', color: 'gray', priority: 'low', emoji: '📋' }
  }

  // Vue Kanban avec logique automatique
  const renderKanbanView = () => {
    // 🔄 UTILISER LE STATUT AUTOMATIQUE pour grouper les événements
    const eventsWithAutoStatus = events.map(event => ({
      ...event,
      actualStatus: getActualEventStatus(event)
    }))

    const kanbanColumns = KANBAN_COLUMNS.map(column => ({
      ...column,
      count: eventsWithAutoStatus.filter(e => e.actualStatus === column.status).length
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
              const count = eventsWithAutoStatus.filter(e => e.actualStatus === column.status).length
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

          {/* Colonnes Kanban avec statut automatique */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {KANBAN_COLUMNS.map((column) => {
              const columnEvents = eventsWithAutoStatus.filter(e => e.actualStatus === column.status)
              
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
                        <div className="mt-3 space-y-2">
                          {/* Ligne 1: Badge de statut */}
                          <div className="flex justify-between items-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${getKanbanColumn(event.actualStatus).bgColor} ${getKanbanColumn(event.actualStatus).textColor}`}>
                              {getKanbanColumn(event.actualStatus).emoji} {getKanbanColumn(event.actualStatus).title}
                              {/* 📊 Afficher le détail fleuristes */}
                              {event.floristsRequired && (
                                <span className="ml-1 text-xs">
                                  ({(event.assignedFlorists?.filter((f: any) => f.isConfirmed).length || 0)}/{event.floristsRequired})
                                </span>
                              )}
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

                          {/* 🆕 Ligne 2: Boutons de workflow de facturation */}
                          {event.actualStatus === EventStatus.COMPLETED && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleArchiveAndInvoice(event)
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-1"
                            >
                              <span>📋</span>
                              <span>Terminer</span>
                            </button>
                          )}

                          {event.actualStatus === EventStatus.INVOICED && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePaymentTracking(event)
                              }}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-1"
                            >
                              <span>💼</span>
                              <span>Facturé</span>
                            </button>
                          )}

                          {event.actualStatus === EventStatus.PAID && (
                            <div className="w-full bg-green-100 text-green-800 text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center space-x-1">
                              <span>💰</span>
                              <span>Payé</span>
                              {event.paidDate && (
                                <span className="text-green-600">
                                  ({new Date(event.paidDate).toLocaleDateString('fr-FR')})
                                </span>
                              )}
                            </div>
                          )}
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

  // Popup AVANCÉ pour afficher les événements du jour
  const renderDayPopup = () => {
    if (!selectedDay) return null

    // 🔧 CORRECTION : Créer la date correctement pour éviter les décalages timezone
    const dayNumber = parseInt(selectedDay)
    const dayEvents = getEventsForDay(dayNumber)
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)
    const formattedDate = date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    // Ajouter urgence et trier par priorité
    const eventsWithUrgency = dayEvents.map(event => ({
      ...event,
      urgency: calculateEventUrgency(event)
    })).sort((a, b) => {
      // Trier par niveau d'urgence décroissant, puis par heure
      if (b.urgency.level !== a.urgency.level) {
        return b.urgency.level - a.urgency.level
      }
      return a.time.localeCompare(b.time)
    })

    // Calculer les stats du jour
    const totalBudget = dayEvents.reduce((sum, event) => sum + event.budget, 0)
    const criticalEvents = eventsWithUrgency.filter(e => e.urgency?.level >= 4).length
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl overflow-hidden">
          {/* Header standardisé comme dans l'image */}
          <div className={`p-6 border-b border-gray-100 relative ${
            criticalEvents > 0 
              ? 'bg-gradient-to-r from-red-50 to-orange-50' 
              : 'bg-white'
          }`}>
            {/* Badge urgence en haut */}
            {criticalEvents > 0 && (
              <div className="absolute top-3 left-6">
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <span>🚨</span>
                  <span>{criticalEvents} urgent{criticalEvents > 1 ? 's' : ''}</span>
                </span>
              </div>
            )}
            
            {/* Bouton fermer */}
            <button 
              onClick={() => setSelectedDay(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Titre et infos principales */}
            <div className="pt-8">
              <h2 className="text-xl font-bold text-gray-900">{formattedDate}</h2>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-600">
                  {dayEvents.length} événement{dayEvents.length > 1 ? 's' : ''}
                </p>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-bold text-green-600">{totalBudget.toLocaleString()}€</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Liste des événements avec hiérarchie d'urgence */}
          <div className="overflow-y-auto max-h-[60vh]">
            {dayEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">Aucun événement</p>
                <p className="text-sm">Cette journée est libre</p>
                <p className="text-xs text-gray-400 mt-2">Cliquez sur "Nouvel Événement" pour planifier</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {eventsWithUrgency.map((event) => {
                  const urgency = event.urgency
                  
                  // Définir les couleurs selon priorité
                  const getCardColors = () => {
                    if (urgency.level >= 4) {
                      return urgency.color === 'red' 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-orange-300 bg-orange-50'
                    }
                    return 'border-gray-300 bg-gray-50'
                  }
                  
                  return (
                    <div 
                      key={event.id}
                      className={`rounded-xl p-4 border-2 cursor-pointer transition-all hover:scale-[1.02] ${getCardColors()}`}
                      onClick={() => handleEventClick(event)}
                    >
                      {/* Header événement avec urgence */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-lg">{urgency.emoji}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">
                              {event.title}
                            </h3>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              urgency.level >= 4 ? (
                                urgency.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                              ) : 'bg-gray-100 text-gray-800'
                            }`}>
                              {urgency.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {event.budget.toLocaleString()}€
                          </div>
                        </div>
                      </div>
                      
                      {/* Informations détaillées */}
                      <div className="space-y-2 text-sm text-gray-700">
                        {/* Horaires */}
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{event.time} - {event.endTime || '17:00'}</span>
                          <span className="text-xs text-gray-500">📅 {new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                        
                        {/* Lieu */}
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span>{event.location}</span>
                        </div>
                        
                        {/* Client */}
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-purple-500" />
                          <span>{event.clientName || 'Client non spécifié'}</span>
                        </div>
                        
                        {/* Fleuristes requis */}
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">
                              👥 Fleuristes requis: {event.assignedFlorists?.length || 0}/{event.floristsRequired || 2}
                            </span>
                          </div>
                          
                          {/* Exemples de fleuristes */}
                          <div className="space-y-1 mt-2">
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
                                <button className="w-6 h-6 bg-blue-400 hover:bg-blue-500 rounded-full flex items-colors transition-colors">
                                  <span className="text-white text-xs">💬</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions rapides */}
                      <div className="mt-4 flex items-center space-x-2">
                        {urgency.level >= 4 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`tel:${event.clientPhone || '0123456789'}`)
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                          >
                            📞 Appeler Client
                          </button>
                        )}
                        
                        {(event.assignedFlorists?.length || 0) < (event.floristsRequired || 2) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventClick(event)
                            }}
                            className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                          >
                            + Assigner Fleuriste ({(event.floristsRequired || 2) - (event.assignedFlorists?.length || 0)} manquant)
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
          {/* Footer avec actions globales */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setSelectedDay(null)
                  handleCreateEvent()
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel Événement</span>
              </button>
              
              {criticalEvents > 0 && (
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>Traiter Urgent</span>
                </button>
              )}
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

      {/* 🆕 MODALES DE WORKFLOW DE FACTURATION */}
      <ArchiveEventModal
        event={selectedEventForArchive}
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false)
          setSelectedEventForArchive(null)
        }}
        onArchiveAndInvoice={handleArchiveConfirm}
      />

      <PaymentTrackingModal
        event={selectedEventForPayment}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedEventForPayment(null)
        }}
        onUpdatePaymentStatus={handlePaymentStatusUpdate}
      />

      {/* 🔔 CONTAINER DE NOTIFICATIONS */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  )
}

export default CalendarPage