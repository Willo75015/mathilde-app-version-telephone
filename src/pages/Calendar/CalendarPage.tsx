import React, { useState } from 'react'
import { Calendar, Clock, User, MapPin, Euro, Plus, CheckCircle, AlertCircle, Kanban as KanbanIcon, Edit, Trash2, X, DollarSign, Phone } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useCalendarSync } from '@/contexts/TimeContext'
import { useEventTimeSync } from '@/hooks/useEventTimeSync'
import { KANBAN_COLUMNS, EventStatus, getKanbanColumn, getStatusLabel } from '@/types'
import EventModal from '@/components/events/EventModal'
import { ArchiveEventModal, PaymentTrackingModal } from '@/components/modals/billing'
import { useNotifications } from '@/hooks/useNotifications'

interface CalendarPageProps {
  navigate?: (page: string, params?: any) => void
}

type ViewMode = 'calendrier' | 'kanban'

const CalendarPage: React.FC<CalendarPageProps> = ({ navigate }) => {
  const { state, actions } = useApp()
  const { currentDate, setCurrentDate, navigateMonth, isToday } = useCalendarSync()
  const { getAutoEventStatus, syncEventStatuses } = useEventTimeSync()
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('calendrier')

  // 🆕 États pour EventModal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  
  // 🆕 État pour la surbrillance des événements similaires
  const [highlightedEventTitle, setHighlightedEventTitle] = useState<string | null>(null)

  // 🆕 État pour le menu déroulant des fleuristes
  const [expandedFloristsEventId, setExpandedFloristsEventId] = useState<string | null>(null)

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

  const handleEventSave = (editedEvent: any, keepModalOpen: boolean = false) => {
    console.log('🎯 CALENDAR - Sauvegarde événement:', editedEvent, { keepModalOpen })
    console.log('🎯 CALENDAR - Événement sélectionné:', selectedEvent)
    
    // 🔧 CORRECTION ROBUSTE : Vérifier si on modifie un événement existant
    const isModification = selectedEvent && selectedEvent.id && !selectedEvent.id.startsWith('temp-')
    
    if (isModification) {
      console.log('📝 CALENDAR - MODIFICATION événement existant:', selectedEvent.id)
      // Utiliser l'ID de l'événement sélectionné, pas celui du formulaire
      actions.updateEvent(selectedEvent.id, {
        ...editedEvent,
        id: selectedEvent.id // Forcer l'ID correct
      })
    } else {
      console.log('🆕 CALENDAR - CRÉATION nouvel événement')
      // Supprimer complètement l'ID pour éviter tout conflit
      const { id, createdAt, updatedAt, ...eventDataForCreation } = editedEvent
      actions.createEvent(eventDataForCreation)
    }
    
    // 🔥 NOUVEAU : Fermer le modal seulement si demandé
    if (!keepModalOpen) {
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    }
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
        `Erreur lors de l'archivage: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
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
            paymentMethod: 'transfer' as const,
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
        `Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        'Erreur de paiement'
      )
    }
  }

  // 🔍 Fonction pour obtenir les événements d'un jour (CORRECTION TIMEZONE + MULTI-JOURS)
  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dayDate = new Date(year, month, day)
    
    // 🔧 NOUVELLE LOGIQUE : Gestion des événements multi-jours
    return events.filter(event => {
      const eventStartDate = new Date(event.date)
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate
      
      // Normaliser les dates pour éviter les problèmes d'heures
      const eventStart = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate())
      const eventEnd = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate())
      const targetDay = new Date(year, month, day)
      
      // L'événement apparaît si la date cible est entre le début et la fin (inclus)
      const isInDateRange = targetDay >= eventStart && targetDay <= eventEnd
      
      // 🆕 EXCLURE les événements annulés du calendrier principal
      const isNotCancelled = event.status !== EventStatus.CANCELLED
      
      return isInDateRange && isNotCancelled
    })
  }

  // 🆕 Fonction pour obtenir les événements annulés du mois
  const getCancelledEventsForMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    return events.filter(event => {
      const eventStartDate = new Date(event.date)
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate
      
      // Vérifier si l'événement est annulé
      const isCancelled = event.status === EventStatus.CANCELLED
      
      // Vérifier si l'événement est dans le mois courant
      const isInCurrentMonth = (
        eventStartDate.getFullYear() === year && eventStartDate.getMonth() === month
      ) || (
        eventEndDate.getFullYear() === year && eventEndDate.getMonth() === month
      )
      
      return isCancelled && isInCurrentMonth
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Fonction pour récupérer les clients avec des événements ce mois-ci
  const getClientsOfMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Récupérer tous les événements du mois (non annulés)
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      const isInCurrentMonth = eventDate.getFullYear() === year && eventDate.getMonth() === month
      const isNotCancelled = event.status !== EventStatus.CANCELLED
      return isInCurrentMonth && isNotCancelled
    })
    
    // Grouper par client
    const clientMap = new Map()
    
    monthEvents.forEach(event => {
      if (!clientMap.has(event.clientId)) {
        // Trouver les infos du client dans le state global
        const client = state.clients?.find(c => c.id === event.clientId) || {
          id: event.clientId,
          firstName: 'Client',
          lastName: 'Inconnu',
          phone: 'N/A'
        }
        
        clientMap.set(event.clientId, {
          client,
          events: [],
          eventCount: 0,
          totalBudget: 0,
          nextEvent: null
        })
      }
      
      const clientInfo = clientMap.get(event.clientId)
      clientInfo.events.push(event)
      clientInfo.eventCount++
      clientInfo.totalBudget += event.budget || 0
      
      // Mettre à jour le prochain événement (le plus proche dans le futur)
      const eventDate = new Date(event.date)
      const now = new Date()
      
      if (eventDate >= now && (!clientInfo.nextEvent || eventDate < new Date(clientInfo.nextEvent.date))) {
        clientInfo.nextEvent = event
      }
    })
    
    // Convertir en array et trier par nombre d'événements décroissant
    return Array.from(clientMap.values()).sort((a, b) => b.eventCount - a.eventCount)
  }

  // Fonction pour naviguer dans les mois (maintenant synchronisée)
  // navigateMonth est fourni par useCalendarSync()
  
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

  // 🔄 FONCTION POUR CALCULER LE STATUT AUTOMATIQUE SELON LES FLEURISTES (maintenant synchronisée)
  const getActualEventStatus = getAutoEventStatus

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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {KANBAN_COLUMNS.map((column, index) => {
              const count = eventsWithAutoStatus.filter(e => e.actualStatus === column.status).length
              
              // Icônes selon le statut
              const getIcon = () => {
                switch (column.status) {
                  case EventStatus.DRAFT: return Clock
                  case EventStatus.CONFIRMED: return CheckCircle
                  case EventStatus.IN_PROGRESS: return AlertCircle
                  case EventStatus.COMPLETED: return CheckCircle
                  case EventStatus.INVOICED: return DollarSign
                  case EventStatus.PAID: return CheckCircle
                  case EventStatus.CANCELLED: return X
                  default: return Clock
                }
              }
              
              const IconComponent = getIcon()
              
              return (
                <div key={column.id} className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${column.headerColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${column.iconColor}`} />
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
                  <p className="font-medium mb-1">Organisation automatique par statuts</p>
                  <p>Les événements changent automatiquement de statut selon les règles métier et les dates.</p>
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
                    {columnEvents.map((event) => {
                      const isHighlighted = highlightedEventTitle === event.title
                      
                      return (
                        <div
                          key={event.id}
                          className={`rounded-xl p-4 shadow-lg border-2 transition-all cursor-pointer bg-gradient-to-br ${
                            isHighlighted 
                              ? 'from-blue-100 to-indigo-200 border-blue-400 shadow-xl ring-4 ring-blue-200 transform scale-105' 
                              : 'from-white to-gray-50 border-purple-300 hover:shadow-xl hover:border-purple-400 hover:transform hover:scale-102'
                          }`}
                          onClick={() => {
                            // Toggle highlight: si on clique sur le même événement, on désélectionne
                            setHighlightedEventTitle(
                              highlightedEventTitle === event.title ? null : event.title
                            )
                          }}
                        >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-purple-900 text-lg flex-1">{event.title}</h4>
                          
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
                                // Ouvrir le modal d'édition directement
                                handleEventClick(event)
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
                              <span>Facturer</span>
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
                              <span>Suivi paiement</span>
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
                      )
                    })}
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
        <div className="!grid !grid-cols-7 gap-1 w-full min-w-0"
             style={{
               display: 'grid !important',
               gridTemplateColumns: 'repeat(7, minmax(0, 1fr)) !important'
             }}>
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
            <div key={`empty-${index}`} className="p-2 min-h-[100px]"></div>
          ))}

          {/* Jours du mois */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dayEvents = getEventsForDay(day)
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const isTodaySync = isToday(dayDate) // Utiliser la fonction synchronisée

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day.toString())}
                className={`p-2 min-h-[100px] border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                  isTodaySync ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className={`text-sm font-medium ${isTodaySync ? 'text-green-700' : 'text-gray-900'}`}>
                  {day}
                </div>
                
                {/* Événements du jour */}
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    // 🔧 OBTENIR LES COULEURS KANBAN selon le statut automatique
                    const actualStatus = getActualEventStatus(event)
                    const kanbanColumn = getKanbanColumn(actualStatus)
                    const isHighlighted = highlightedEventTitle === event.title
                    
                    return (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer transition-all ${
                          isHighlighted 
                            ? 'bg-blue-200 text-blue-900 border-blue-400 ring-1 ring-blue-300' 
                            : `${kanbanColumn.bgColor} ${kanbanColumn.textColor} border ${kanbanColumn.textColor} border-opacity-30`
                        }`}
                        title={`${event.title} - ${kanbanColumn.title}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          // Toggle highlight: si on clique sur le même événement, on désélectionne
                          setHighlightedEventTitle(
                            highlightedEventTitle === event.title ? null : event.title
                          )
                        }}
                      >
                        <span className="mr-1">{kanbanColumn.emoji}</span>
                        {event.time} - {event.title}
                      </div>
                    )
                  })}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} autres
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

  // Popup pour afficher les événements d'un client spécifique
  const renderClientEventsPopup = () => {
    if (!selectedClient) return null

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Récupérer tous les événements du client pour ce mois
    const clientEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      const isClientEvent = event.clientId === selectedClient.id
      const isInCurrentMonth = eventDate.getFullYear() === year && eventDate.getMonth() === month
      return isClientEvent && isInCurrentMonth
    })

    // Trier par date
    const sortedEvents = clientEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const totalBudget = clientEvents.reduce((sum, event) => sum + (event.budget || 0), 0)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="w-6 h-6 text-blue-500 mr-3" />
                  {selectedClient.firstName} {selectedClient.lastName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {sortedEvents.length} événement{sortedEvents.length > 1 ? 's' : ''} en {formatMonth(currentDate)}
                  {totalBudget > 0 && ` • Budget total: ${totalBudget.toLocaleString()}€`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDay(null)
                  setSelectedClient(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun événement ce mois-ci
                </h3>
                <p className="text-gray-600">
                  Ce client n'a pas d'événements prévus en {formatMonth(currentDate)}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedEvents.map((event) => {
                  const actualStatus = getActualEventStatus(event)
                  const kanbanColumn = getKanbanColumn(actualStatus)
                  const urgency = calculateEventUrgency(event)

                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border-l-4 ${kanbanColumn.bgColor} ${kanbanColumn.borderColor} hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEventClick(event)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{kanbanColumn.emoji}</span>
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${kanbanColumn.bgColor} ${kanbanColumn.textColor}`}>
                              {kanbanColumn.title}
                            </span>
                            {urgency.level >= 4 && (
                              <span className="flex items-center text-red-600 text-xs font-medium">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Urgent
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(event.date).toLocaleDateString('fr-FR', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Euro className="w-4 h-4 mr-2" />
                              {event.budget?.toLocaleString() || 0}€
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm text-gray-700 mt-2 italic">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-100 transition-colors ml-4"
                          title="Modifier l'événement"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Popup AVANCÉ pour afficher les événements du jour ou d'un client
  const renderDayPopup = () => {
    if (!selectedDay) return null

    // Cas spécial : affichage des événements d'un client
    if (selectedDay === 'client-view' && selectedClient) {
      return renderClientEventsPopup()
    }

    // Cas normal : affichage des événements d'un jour
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
                      className={`rounded-xl p-4 border-2 transition-all hover:scale-[1.02] ${getCardColors()}`}
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
                        
                        {/* 🔧 FLEURISTES REQUIS - AFFICHAGE CORRECT */}
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">
                              👥 Fleuristes confirmés: {(event.assignedFlorists?.filter(f => f.isConfirmed && f.status === 'confirmed').length || 0)}/{event.floristsRequired || 2}
                            </span>
                          </div>
                          
                          {/* 🔧 AFFICHER MAXIMUM 2 FLEURISTES CONFIRMÉS */}
                          <div className="space-y-1 mt-2">
                            {(() => {
                              const confirmedFlorists = event.assignedFlorists?.filter(f => f.isConfirmed && f.status === 'confirmed') || []
                              const displayedFlorists = confirmedFlorists.slice(0, 2)
                              const remainingFlorists = confirmedFlorists.slice(2)
                              const remainingCount = remainingFlorists.length
                              const isExpanded = expandedFloristsEventId === event.id
                              
                              return (
                                <>
                                  {displayedFlorists.map((florist, index) => (
                                    <div key={florist.floristId || index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          {florist.floristName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'FL'}
                                        </div>
                                        <span className="text-sm font-medium">{florist.floristName || 'Fleuriste'}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        {/* Statut confirmé (pas de bouton valider nécessaire) */}
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">✓</span>
                                        </div>
                                        
                                        {/* 🔧 BOUTON MESSAGE - Ouvrir WhatsApp Web */}
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            const phone = florist.phone || '0123456789'
                                            const message = `Bonjour ${florist.floristName}, événement "${event.title}" le ${new Date(event.date).toLocaleDateString('fr-FR')} à ${event.time}. Merci de votre confirmation !`
                                            const whatsappUrl = `https://web.whatsapp.com/send?phone=33${phone.replace(/^(\+33|0)/, '')}&text=${encodeURIComponent(message)}`
                                            window.open(whatsappUrl, '_blank')
                                          }}
                                          className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                                          title="Envoyer message WhatsApp"
                                        >
                                          <span className="text-white text-xs">💬</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* 🔧 MENU DÉROULANT pour les fleuristes supplémentaires */}
                                  {remainingCount > 0 && (
                                    <div className="space-y-1">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setExpandedFloristsEventId(isExpanded ? null : event.id)
                                        }}
                                        className="w-full border border-gray-300 rounded-lg p-2 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors text-xs font-medium flex items-center justify-between"
                                      >
                                        <div className="flex items-center space-x-1">
                                          <span>👥</span>
                                          <span>+{remainingCount} fleuriste{remainingCount > 1 ? 's' : ''} confirmé{remainingCount > 1 ? 's' : ''}</span>
                                        </div>
                                        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                          ▼
                                        </span>
                                      </button>
                                      
                                      {/* Menu déroulant */}
                                      {isExpanded && (
                                        <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                                          {remainingFlorists.map((florist, index) => (
                                            <div key={florist.floristId || `remaining-${index}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                              <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                  {florist.floristName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'FL'}
                                                </div>
                                                <span className="text-sm font-medium">{florist.floristName || 'Fleuriste'}</span>
                                              </div>
                                              <div className="flex items-center space-x-1">
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                  <span className="text-white text-xs">✓</span>
                                                </div>
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    const phone = florist.phone || '0123456789'
                                                    const message = `Bonjour ${florist.floristName}, événement "${event.title}" le ${new Date(event.date).toLocaleDateString('fr-FR')} à ${event.time}. Merci de votre confirmation !`
                                                    const whatsappUrl = `https://web.whatsapp.com/send?phone=33${phone.replace(/^(\+33|0)/, '')}&text=${encodeURIComponent(message)}`
                                                    window.open(whatsappUrl, '_blank')
                                                  }}
                                                  className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                                                  title="Envoyer message WhatsApp"
                                                >
                                                  <span className="text-white text-xs">💬</span>
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Message si aucun fleuriste confirmé */}
                                  {confirmedFlorists.length === 0 && (
                                    <div className="text-xs text-gray-500 text-center py-2">
                                      Aucun fleuriste confirmé pour le moment
                                    </div>
                                  )}
                                  
                                  {/* 🔧 INDICATION des fleuristes manquants (pas un bouton) */}
                                  {confirmedFlorists.length < (event.floristsRequired || 2) && (
                                    <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-2 text-orange-700 text-xs font-medium text-center">
                                      ⚠️ {(event.floristsRequired || 2) - confirmedFlorists.length} fleuriste{((event.floristsRequired || 2) - confirmedFlorists.length) > 1 ? 's' : ''} manquant{((event.floristsRequired || 2) - confirmedFlorists.length) > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions rapides */}
                      <div className="mt-4 flex items-center space-x-2">
                        {/* 🔧 BOUTON MODIFIER - Ouvre le modal d'édition */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event) // Ouvrir le modal d'édition
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Modifier</span>
                        </button>
                        
                        {/* 🆕 Bouton Annuler la mission */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Êtes-vous sûr de vouloir annuler la mission "${event.title}" ?`)) {
                              console.log('🚫 Annulation de la mission:', event.title)
                              actions.updateEvent(event.id, { 
                                status: 'cancelled' as any,
                                cancelledAt: new Date(),
                                notes: (event.notes || '') + '\n[ANNULÉ] Mission annulée le ' + new Date().toLocaleString('fr-FR')
                              })
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Annuler Mission</span>
                        </button>
                        
                        {urgency.level >= 4 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              // Récupérer le téléphone du client depuis la base de données
                              const client = state.clients?.find(c => c.id === event.clientId)
                              const clientPhone = client?.phone || '0123456789'
                              window.open(`tel:${clientPhone}`)
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>📞 Appeler Client</span>
                          </button>
                        )}
                        
                        {(event.assignedFlorists?.length || 0) < (event.floristsRequired || 2) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventClick(event) // Ouvrir le modal d'édition pour assigner
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
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Détecter mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile vs Desktop */}
      <div className={`bg-white shadow-sm ${isMobile ? 'p-3' : 'rounded-lg p-6 mx-4 mt-4 mb-6'}`}>
        {isMobile ? (
          // HEADER MOBILE - Compact
          <div className="space-y-3">
            {/* Titre + Bouton créer */}
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-gray-900">Calendrier</h1>
              <button
                onClick={handleCreateEvent}
                className="bg-green-500 text-white p-2 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Vue - Pleine largeur */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendrier')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                  viewMode === 'calendrier'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendrier</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <KanbanIcon className="w-4 h-4" />
                <span>Kanban</span>
              </button>
            </div>
          </div>
        ) : (
          // HEADER DESKTOP - Original
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
        )}
      </div>

      {/* Statistiques - Mobile horizontal scroll, Desktop grid */}
      <div className={`${isMobile ? 'px-3 mb-4' : 'mx-4 mb-6'}`}>
        <div className={`${isMobile ? 'flex space-x-3 overflow-x-auto pb-2 hide-scrollbar' : 'grid grid-cols-3 gap-4'}`}>
          <div className={`bg-blue-50 p-3 rounded-lg ${isMobile ? 'flex-shrink-0 min-w-[140px]' : 'p-4'}`}>
            <div className="flex items-center">
              <Calendar className={`text-blue-500 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              <div className="ml-2">
                <p className={`font-medium text-blue-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total</p>
                <p className={`font-bold text-blue-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{events.length}</p>
              </div>
            </div>
          </div>

          <div className={`bg-green-50 p-3 rounded-lg ${isMobile ? 'flex-shrink-0 min-w-[140px]' : 'p-4'}`}>
            <div className="flex items-center">
              <Clock className={`text-green-500 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              <div className="ml-2">
                <p className={`font-medium text-green-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>Ce mois</p>
                <p className={`font-bold text-green-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {events.filter(event => {
                    const eventDate = new Date(event.date)
                    return eventDate.getMonth() === currentDate.getMonth() &&
                           eventDate.getFullYear() === currentDate.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className={`bg-purple-50 p-3 rounded-lg ${isMobile ? 'flex-shrink-0 min-w-[140px]' : 'p-4'}`}>
            <div className="flex items-center">
              <User className={`text-purple-500 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              <div className="ml-2">
                <p className={`font-medium text-purple-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>Clients</p>
                <p className={`font-bold text-purple-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{state.clients?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal selon la vue */}
      <div className={isMobile ? 'px-3' : 'mx-4'}>
        {viewMode === 'calendrier' ? renderCalendarView() : renderKanbanView()}
      </div>

      {/* 🆕 SECTION ÉVÉNEMENTS ANNULÉS - Affiché seulement en mode calendrier */}
      {viewMode === 'calendrier' && (
        <div className={`mt-4 bg-white rounded-lg shadow-sm ${isMobile ? 'mx-3 p-4 mb-24' : 'mx-4 p-6 mb-6'}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <X className="w-5 h-5 text-red-500 mr-2" />
            Événements annulés - {formatMonth(currentDate)}
          </h3>
          
          {(() => {
            const cancelledEvents = getCancelledEventsForMonth()
            
            if (cancelledEvents.length === 0) {
              return (
                <div className="text-center py-6 text-gray-500">
                  <X className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Aucun événement annulé ce mois-ci</p>
                </div>
              )
            }
            
            return (
              <div className="space-y-3">
                {cancelledEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <X className="w-4 h-4 text-red-500" />
                          <h4 className="font-medium text-red-900">{event.title}</h4>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            ANNULÉ
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-red-700">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{event.clientName || 'Client non spécifié'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Euro className="w-3 h-3" />
                            <span>{event.budget}€</span>
                          </div>
                        </div>
                        
                        {event.cancelledAt && (
                          <div className="mt-2 text-xs text-red-600">
                            Annulé le {new Date(event.cancelledAt).toLocaleDateString('fr-FR')} à {new Date(event.cancelledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        
                        {event.notes && event.notes.includes('[ANNULÉ]') && (
                          <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                            {event.notes.split('[ANNULÉ]').pop()?.trim()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEventClick(event)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                          title="Voir les détails"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Bouton pour réactiver l'événement */}
                        <button
                          onClick={() => {
                            if (confirm(`Réactiver l'événement "${event.title}" ?`)) {
                              actions.updateEvent(event.id, { 
                                status: 'draft' as any,
                                cancelledAt: null,
                                notes: (event.notes || '').replace(/\[ANNULÉ\].*$/, '').trim() + '\n[RÉACTIVÉ] Mission réactivée le ' + new Date().toLocaleString('fr-FR')
                              })
                            }
                          }}
                          className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-100 transition-colors"
                          title="Réactiver l'événement"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {/* 🆕 SECTION CLIENTS DU MOIS - Affiché seulement en mode calendrier */}
      {viewMode === 'calendrier' && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 text-blue-500 mr-2" />
            Clients du mois - {formatMonth(currentDate)}
          </h3>
          
          {(() => {
            const clientsOfMonth = getClientsOfMonth()
            
            if (clientsOfMonth.length === 0) {
              return (
                <p className="text-gray-500 text-center py-4">
                  Aucun client avec des événements ce mois-ci
                </p>
              )
            }
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientsOfMonth.map((clientInfo) => (
                  <div
                    key={clientInfo.client.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                    onClick={() => {
                      setSelectedClient(clientInfo.client)
                      setSelectedDay('client-view')
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {clientInfo.client.firstName} {clientInfo.client.lastName}
                      </h4>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {clientInfo.eventCount} événement{clientInfo.eventCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {clientInfo.client.phone}
                      </div>
                      <div className="flex items-center">
                        <Euro className="w-3 h-3 mr-1" />
                        Budget total: {clientInfo.totalBudget.toLocaleString()}€
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Prochaine mission: {clientInfo.nextEvent ?
                          `${new Date(clientInfo.nextEvent.date).toLocaleDateString('fr-FR')} - ${clientInfo.nextEvent.title}` :
                          'Aucune'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

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
    </div>
  )
}

export default CalendarPage
