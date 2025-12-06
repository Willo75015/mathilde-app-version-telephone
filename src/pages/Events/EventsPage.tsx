import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Search, Filter, SortAsc, SortDesc, Download, RefreshCw, AlertTriangle,
  Clock, Archive, XCircle, Edit, CheckCircle2, CheckCircle,
  MapPin, User, Euro, DollarSign, Receipt
} from 'lucide-react'
import { useEvents } from '@/contexts/AppContext'
import { EventStatus, KANBAN_COLUMNS } from '@/types'
import { StatusBadge, useStatusCounts } from '@/components/ui/StatusBadge'
import { filterActiveEvents, isPaymentOverdue } from '@/utils/eventHelpers'
import { useBillingWorkflow } from '@/hooks/useBillingWorkflow'
import EventList from '@/components/events/EventList'
import EventFilters from '@/components/events/EventFilters'
import EventMetrics from '@/components/events/EventMetrics'
import EventModal from '@/components/events/EventModal'
import EventArchive from '@/components/events/EventArchive'
import EventArchiveSection from '@/components/events/EventArchiveSection'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface EventsPageProps {
  navigate?: (page: string, params?: any) => void
}

const EventsPage: React.FC<EventsPageProps> = ({ navigate }) => {
  const { events, loadEvents, isLoading, updateEvent, createEvent } = useEvents()
  const statusCounts = useStatusCounts(events)
  
  // 🆕 Hook pour la facturation
  const { archiveAndInvoiceEvent, markEventAsPaid, getBillingStats } = useBillingWorkflow()
  
  console.log('🎯 EventsPage render - Events count:', events?.length || 0)
  console.log('🎯 Events data:', events)
  
  // State pour recherche et modales
  const [searchQuery, setSearchQuery] = useState('')
  
  // 🆕 États pour EventModal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  
  // 🗄️ État pour le mode archive
  const [showArchive, setShowArchive] = useState(false)
  
  // 🆕 État pour afficher les événements annulés
  const [showCancelledEvents, setShowCancelledEvents] = useState(false)
  
  // Les événements sont déjà chargés par défaut dans le contexte
  
  // 🆕 Fonction pour obtenir les événements annulés
  const cancelledEvents = useMemo(() => {
    return events.filter(event => event.status === EventStatus.CANCELLED)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Plus récents en premier
  }, [events])
  
  // 🆕 Événements catégorisés avec séparation COMPLETED/PAID
  const categorizedEvents = useMemo(() => {
    let activeEvents = filterActiveEvents(events).filter(event => event.status !== EventStatus.CANCELLED)
    
    // Appliquer la recherche à tous les événements
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      activeEvents = activeEvents.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.clientName?.toLowerCase().includes(query)
      )
    }
    
    // Événements en cours (workflow actif)
    const workflowEvents = activeEvents.filter(event => 
      event.status === EventStatus.DRAFT || 
      event.status === EventStatus.CONFIRMED || 
      event.status === EventStatus.IN_PROGRESS
    )
    
    // 🎉 Événements TERMINÉS (à facturer)
    const completedEvents = activeEvents.filter(event => 
      event.status === EventStatus.COMPLETED
    )
    
    // 💰 Événements FACTURÉS (en attente de paiement)
    const invoicedEvents = activeEvents.filter(event => 
      event.status === EventStatus.INVOICED
    )
    
    // 💚 Événements PAYÉS (finalisés)
    const paidEvents = activeEvents.filter(event => 
      event.status === EventStatus.PAID
    )
    
    return {
      workflow: workflowEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      completed: completedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      invoiced: invoicedEvents.sort((a, b) => {
        // Priorité aux retards de paiement
        const aOverdue = isPaymentOverdue(a)
        const bOverdue = isPaymentOverdue(b)
        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1
        // Puis par date d'événement
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }),
      paid: paidEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  }, [events, searchQuery])
  
  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  const handleRefresh = async () => {
    await loadEvents()
  }
  
  const handleExport = () => {
    console.log('Export events')
    // TODO: Implement export functionality
  }
  
  const handleEdit = (event: any) => {
    console.log('🖊️ Edit event:', event.id)
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }
  
  const handleDelete = (event: any) => {
    console.log('Delete event:', event.id)
    // TODO: Implement delete with confirmation
  }
  
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`)
  }
  
  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`)
  }
  
  const handleCreateEvent = () => {
    console.log('🎯 Create new event')
    setSelectedEvent(null) // Mode création
    setIsEventModalOpen(true)
  }

  // 🆕 Handler pour sauvegarder depuis la modal
  const handleEventSave = (editedEvent: any) => {
    console.log('🔥 DEBUG handleEventSave - DÉBUT')
    console.log('🔥 selectedEvent original:', selectedEvent)
    console.log('🔥 editedEvent reçu:', editedEvent)
    console.log('🔥 editedEvent.clientId:', editedEvent.clientId)
    console.log('🔥 editedEvent.clientName:', editedEvent.clientName)
    
    // 🔧 CORRECTION: Différencier création vs modification
    const isCreating = !selectedEvent || !selectedEvent.id || selectedEvent.id.startsWith('temp-')
    console.log('🔥 isCreating:', isCreating)
    
    if (isCreating) {
      console.log('🆕 Mode création - Utilisation de createEvent')
      console.log('🔥 Données envoyées à createEvent:', editedEvent)
      createEvent(editedEvent)
    } else {
      console.log('✏️ Mode modification - Utilisation de updateEvent')
      console.log('🔥 ID événement:', editedEvent.id)
      console.log('🔥 Données envoyées à updateEvent:', editedEvent)
      updateEvent(editedEvent.id, editedEvent)
    }
    
    setIsEventModalOpen(false)
    setSelectedEvent(null)
    console.log('✅ Modal fermée et état réinitialisé')
  }
  
  const handleNavigateToEvent = (eventId: string) => {
    console.log('🎯 Navigate to event:', eventId)
    
    // TODO: Navigate to event details or scroll to event in list
    // Pour l'instant, on pourrait filtrer la liste pour montrer seulement cet événement
    const event = events.find(e => e.id === eventId)
    if (event) {
      console.log('✅ Event found:', event.title)
      setSearchQuery(event.title) // Recherche par titre pour l'instant
    } else {
      console.log('❌ Event not found with ID:', eventId)
    }
  }
  
  // 🆕 Handler pour facturer un événement terminé
  const handleArchiveAndInvoice = async (event: any) => {
    try {
      console.log('💰 Facturation événement:', event.id)
      await archiveAndInvoiceEvent(event.id)
      console.log('✅ Événement facturé avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la facturation:', error)
    }
  }
  
  // 🆕 Handler pour marquer un événement comme payé
  const handlePaymentTracking = async (event: any) => {
    try {
      console.log('💳 Marquage comme payé:', event.id)
      await markEventAsPaid(event.id)
      console.log('✅ Événement marqué comme payé')
    } catch (error) {
      console.error('❌ Erreur lors du marquage payé:', error)
    }
  }
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mode Archive */}
      {showArchive ? (
        <EventArchive onClose={() => setShowArchive(false)} />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                🌸 Événements
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                Gérez tous vos événements floraux
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Button
                variant="outline"
                leftIcon={<RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />}
                onClick={handleRefresh}
                isLoading={isLoading}
                size="sm"
                className="text-xs px-2 py-1 sm:px-3 sm:py-2"
              >
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
              <Button
                variant="outline"
                leftIcon={<Download className="w-3 h-3 sm:w-4 sm:h-4" />}
                onClick={handleExport}
                size="sm"
                className="text-xs px-2 py-1 sm:px-3 sm:py-2"
              >
                <span className="hidden sm:inline">Exporter</span>
              </Button>
              <Button
                variant="outline"
                leftIcon={<Archive className="w-3 h-3 sm:w-4 sm:h-4" />}
                onClick={() => setShowArchive(true)}
                size="sm"
                className="text-xs px-2 py-1 sm:px-3 sm:py-2"
              >
                <span className="hidden sm:inline">Archive</span>
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
                onClick={handleCreateEvent}
                size="sm"
                className="text-xs px-2 py-1 sm:px-3 sm:py-2"
              >
                <span className="hidden sm:inline">Nouvel Événement</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </div>
          </div>
          
          {/* 📊 Métriques par catégories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Métriques facturation */}
            <Card className="p-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {categorizedEvents.invoiced.length}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    Facturés
                    {categorizedEvents.invoiced.filter(e => isPaymentOverdue(e)).length > 0 && (
                      <span className="ml-1 text-red-600 font-bold">
                        ({categorizedEvents.invoiced.filter(e => isPaymentOverdue(e)).length} retard)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Métriques workflow */}
            <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {categorizedEvents.workflow.length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    En workflow
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Métriques annulés */}
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-red-900 dark:text-red-100">
                    {cancelledEvents.length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    Annulés
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* 🔍 Recherche simplifiée */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input
                placeholder="Rechercher événements..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleCreateEvent}
                className="whitespace-nowrap"
              >
                Nouvel Événement
              </Button>
            </div>
          </Card>
          
          {/* 💰 SECTION FACTURATION - PRIORITÉ ABSOLUE */}
          {categorizedEvents.invoiced.length > 0 && (
            <Card className="border-2 border-purple-300 bg-purple-50 dark:bg-purple-900/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      💰 Événements Facturés
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {categorizedEvents.invoiced.length} événement{categorizedEvents.invoiced.length > 1 ? 's' : ''} - 
                      {categorizedEvents.invoiced.filter(e => isPaymentOverdue(e)).length > 0 && (
                        <span className="font-bold text-red-600 ml-1">
                          🚨 {categorizedEvents.invoiced.filter(e => isPaymentOverdue(e)).length} en retard !
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <EventList
                events={categorizedEvents.invoiced}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCall={handleCall}
                onEmail={handleEmail}
                onPaymentTracking={handlePaymentTracking}
                emptyMessage="Aucun événement facturé"
              />
            </Card>
          )}
          
          {/* 🚧 SECTION WORKFLOW - ÉVÉNEMENTS ACTIFS */}
          <Card className="border-2 border-blue-300 bg-blue-50 dark:bg-blue-900/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    🚧 Événements en Workflow
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {categorizedEvents.workflow.length} événement{categorizedEvents.workflow.length > 1 ? 's' : ''} en cours de traitement
                  </p>
                </div>
              </div>
            </div>
            
            <EventList
              events={categorizedEvents.workflow}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCall={handleCall}
              onEmail={handleEmail}
              emptyMessage="Aucun événement en cours"
            />
          </Card>
          
          {/* 🎉 SECTION TERMINÉS - À FACTURER */}
          {categorizedEvents.completed.length > 0 && (
            <Card className="border-2 border-pink-300 bg-pink-50 dark:bg-pink-900/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-800 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-pink-900 dark:text-pink-100">
                      🎉 Événements Terminés
                    </h3>
                    <p className="text-sm text-pink-700 dark:text-pink-300">
                      {categorizedEvents.completed.length} événement{categorizedEvents.completed.length > 1 ? 's' : ''} à facturer
                    </p>
                  </div>
                </div>
              </div>
              
              <EventList
                events={categorizedEvents.completed}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCall={handleCall}
                onEmail={handleEmail}
                onArchiveAndInvoice={handleArchiveAndInvoice}
                emptyMessage="Aucun événement terminé"
              />
            </Card>
          )}
          
          {/* 💰 SECTION FACTURÉS - EN ATTENTE DE PAIEMENT */}
          {categorizedEvents.invoiced.length > 0 && (
            <Card className="border-2 border-purple-300 bg-purple-50 dark:bg-purple-900/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      💰 Événements Facturés
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {categorizedEvents.invoiced.length} événement{categorizedEvents.invoiced.length > 1 ? 's' : ''} en attente de paiement
                    </p>
                  </div>
                </div>
              </div>
              
              <EventList
                events={categorizedEvents.invoiced}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCall={handleCall}
                onEmail={handleEmail}
                onPaymentTracking={handlePaymentTracking}
                emptyMessage="Aucun événement facturé"
              />
            </Card>
          )}
          
          {/* 💚 SECTION PAYÉS - FINALISÉS */}
          {categorizedEvents.paid.length > 0 && (
            <Card className="border-2 border-green-300 bg-green-50 dark:bg-green-900/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                      💚 Événements Payés
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {categorizedEvents.paid.length} événement{categorizedEvents.paid.length > 1 ? 's' : ''} finalisé{categorizedEvents.paid.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              <EventList
                events={categorizedEvents.paid}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCall={handleCall}
                onEmail={handleEmail}
                emptyMessage="Aucun événement payé"
              />
            </Card>
          )}
          
          {/* 🆕 SECTION ÉVÉNEMENTS ANNULÉS */}
          {cancelledEvents.length > 0 && (
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Événements annulés
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cancelledEvents.length} événement{cancelledEvents.length > 1 ? 's' : ''} annulé{cancelledEvents.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelledEvents(!showCancelledEvents)}
                  rightIcon={
                    <motion.div
                      animate={{ rotate: showCancelledEvents ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.div>
                  }
                >
                  {showCancelledEvents ? 'Masquer' : 'Afficher'}
                </Button>
              </div>
              
              {/* Liste des événements annulés */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: showCancelledEvents ? 1 : 0,
                  height: showCancelledEvents ? 'auto' : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {showCancelledEvents && (
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {cancelledEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <h4 className="font-medium text-red-900 dark:text-red-100">{event.title}</h4>
                              <Badge variant="destructive" size="sm">
                                ANNULÉ
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-red-700 dark:text-red-300">
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
                              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                Annulé le {new Date(event.cancelledAt).toLocaleDateString('fr-FR')} à {new Date(event.cancelledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                            
                            {event.notes && event.notes.includes('[ANNULÉ]') && (
                              <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-2 rounded">
                                {event.notes.split('[ANNULÉ]').pop()?.trim()}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(event)}
                              leftIcon={<Edit className="w-3 h-3" />}
                            >
                              Voir
                            </Button>
                            
                            {/* Bouton pour réactiver l'événement */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Réactiver l'événement "${event.title}" ?`)) {
                                  updateEvent(event.id, { 
                                    status: EventStatus.DRAFT,
                                    cancelledAt: null,
                                    notes: (event.notes || '').replace(/\[ANNULÉ\].*$/, '').trim() + '\n[RÉACTIVÉ] Mission réactivée le ' + new Date().toLocaleString('fr-FR')
                                  })
                                }
                              }}
                              leftIcon={<CheckCircle2 className="w-3 h-3" />}
                              className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                            >
                              Réactiver
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </Card>
          )}
          
          {/* 🆕 SECTION ARCHIVES */}
          <EventArchiveSection 
            events={events}
            onViewEvent={handleEdit}
            className="mt-6"
          />
        </>
      )}

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

export default EventsPage
