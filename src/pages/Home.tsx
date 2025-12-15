import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Event, EventStatus } from '@/types'
import EventModal from '../components/events/EventModal'
import EventReadOnlyModal from '../components/events/EventReadOnlyModal'
import CreateEventModal from '../components/modals/CreateEventModal'

// Composants dashboard selon la nouvelle hiérarchie
import UrgentEventsSection from '@/components/dashboard/UrgentEventsSection'
import InvoicingSection from '@/components/dashboard/InvoicingSection'
import StrategicPlanningSection from '@/components/dashboard/StrategicPlanningSection'
import BusinessMetricsSection from '@/components/dashboard/BusinessMetricsSection'
import RemindersSection from '@/components/dashboard/RemindersSection'

// Hook pour les rappels
import { useReminders } from '@/hooks/useReminders'

// 🚨 Nouveau système d'urgence intelligent
import { SmartUrgencyCalculator } from '@/lib/smart-urgency'

// Vérifier si Supabase est configuré
import { isSupabaseEnabled } from '@/lib/supabase'

interface HomeProps {
  navigate?: (page: string, params?: any) => void
}

const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { state, actions, isSupabaseMode } = useApp()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<Event | null>(null)
  const [selectedEventForFlorist, setSelectedEventForFlorist] = useState<Event | null>(null)
  const [showMoreUrgent, setShowMoreUrgent] = useState(false)
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null)

  // Hook pour les rappels automatiques
  const remindersData = useReminders(state.events, state.clients)

  // Fonction de migration vers Supabase
  const handleMigrateToCloud = async () => {
    if (isMigrating) return
    setIsMigrating(true)
    setMigrationMessage(null)

    try {
      const result = await actions.migrateToSupabase()
      setMigrationMessage(result.message)
      if (result.success) {
        // Rafraîchir après migration
        setTimeout(() => setMigrationMessage(null), 5000)
      }
    } catch (error) {
      setMigrationMessage(`Erreur: ${error}`)
    } finally {
      setIsMigrating(false)
    }
  }

  // 🚨 Événements urgents : Affichage intelligent selon la demande de Bill
  const urgentEvents = useMemo(() => {
    // 🎯 LOGIQUE BILL : Montrer TOUS les événements urgents par défaut
    // Le bouton "voir plus/moins" sert uniquement si on veut les compacter après 6
    const maxCount = showMoreUrgent ? 100 : 6 // 6 max en vue normale, tous en mode "plus"
    return SmartUrgencyCalculator.getUrgentEvents(state.events, maxCount)
  }, [state.events, showMoreUrgent])
  
  // Compter le total d'événements urgents disponibles
  const totalUrgentCount = useMemo(() => {
    return SmartUrgencyCalculator.getUrgentEvents(state.events, 100).length // Récupérer tous pour compter
  }, [state.events])

  // Événements à facturer (terminés non facturés)
  const eventsToInvoice = useMemo(() => {
    return state.events
      .filter(event => event.status === EventStatus.COMPLETED && !event.invoiced)
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
  }, [state.events])

  // Événements futurs (30 jours)
  const futureEvents = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return state.events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate > now && eventDate <= thirtyDaysFromNow && event.status !== EventStatus.CANCELLED
    })
  }, [state.events])

  // Handlers stables avec useCallback
  const handleEventEdit = useCallback(async (updatedEvent: Event) => {
    console.log('🔍 HOME - Début de sauvegarde:', {
      eventId: updatedEvent.id,
      title: updatedEvent.title
    })

    // 🆕 Distinguer création vs modification par l'ID généré
    const isCreating = updatedEvent.id.startsWith('event-')

    if (isCreating) {
      console.log('🆕 HOME - Création nouvel événement')

      // 🔧 CORRECTION: Supprimer les champs auto-générés pour createEvent
      const { id, createdAt, updatedAt, ...eventDataForCreation } = updatedEvent

      console.log('🔧 Données envoyées à createEvent:', eventDataForCreation)
      const newEvent = await actions.createEvent(eventDataForCreation)

      // 🔥 SI IL Y A DES FLEURISTES ASSIGNÉS, DÉCLENCHER LE WORKFLOW !
      if (eventDataForCreation.assignedFlorists && eventDataForCreation.assignedFlorists.length > 0) {
        console.log('🎯 DÉCLENCHEMENT workflow fleuristes sur nouvel événement')
        actions.updateEventWithTeamCheck(newEvent.id, eventDataForCreation)
      }

      console.log('✅ HOME - Nouvel événement créé avec workflow')
    } else if (updatedEvent.id) {
      console.log('📤 HOME - Modification événement existant:', updatedEvent.id)
      
      // 🔥 CRITIQUE: Utiliser updateEventWithTeamCheck pour déclencher le workflow !
      actions.updateEventWithTeamCheck(updatedEvent.id, updatedEvent)
      
      console.log('✅ HOME - Événement modifié avec workflow fleuristes')
    } else {
      console.error('❌ HOME - Pas d\'ID sur l\'événement:', updatedEvent)
    }
    
    setSelectedEventForEdit(null)
    console.log('🔍 HOME - Événement sauvegardé, modal fermé')
  }, [actions])

  const handleCreateEvent = useCallback(() => {
    console.log('🎯 Ouverture modal de création d\'événement')
    setIsCreateEventModalOpen(true)
  }, [])

  const handleEventCreated = useCallback((event: Event) => {
    console.log('✅ HOME - Événement créé, ajout au state:', event.title)
    
    // 🔥 CRITIQUE: Ajouter l'événement au state global
    actions.createEvent(event)
    
    setIsCreateEventModalOpen(false)
    
    // Redirection vers l'onglet Calendrier après création
    setTimeout(() => {
      navigate?.('calendar')
    }, 500)
  }, [navigate, actions])

  const handleEventSelect = useCallback((event: Event) => {
    setSelectedEvent(event)
  }, [])

  const handleEventEditSelect = useCallback((event: Event) => {
    setSelectedEventForEdit(event)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null)
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setSelectedEventForEdit(null)
  }, [])

  // Nouvelles fonctions pour UrgentEventsSection
  const handleAssignFlorist = useCallback((event: Event) => {
    console.log('🌸 Ouvrir modal fleuriste pour:', event.title)
    // Ouvrir le modal d'édition avec la vue fleuriste active
    setSelectedEventForFlorist(event)
  }, [])

  const handleCloseFloristModal = useCallback(() => {
    setSelectedEventForFlorist(null)
  }, [])

  const handleCancelEvent = useCallback((eventId: string) => {
    console.log('❌ Annulation de l\'événement:', eventId)
    // Mettre à jour le statut de l'événement à "CANCELLED" et l'archiver
    actions.updateEvent(eventId, { 
      status: EventStatus.CANCELLED,
      cancelledAt: new Date(),
      archivedAt: new Date()
    })
    
    // Notification de succès (optionnel)
    console.log('✅ Événement annulé et archivé avec succès')
  }, [actions])

  const handleSwitchToEdit = useCallback(() => {
    setSelectedEventForEdit(selectedEvent)
    setSelectedEvent(null)
  }, [selectedEvent])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="space-y-4 md:space-y-6">
        {/* Header Mobile-First */}
        <section className="flex flex-col gap-3">
          {/* Titre + Sync indicator */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            {/* Indicateur de synchronisation */}
            {isSupabaseEnabled() && (
              <div className="flex items-center">
                {isSupabaseMode ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    <Cloud className="w-3 h-3" />
                    <span>Sync</span>
                  </span>
                ) : (
                  <button
                    onClick={handleMigrateToCloud}
                    disabled={isMigrating}
                    className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"
                  >
                    {isMigrating ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <CloudOff className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bouton créer - pleine largeur sur mobile */}
          <button
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors text-base"
            onClick={handleCreateEvent}
          >
            <Plus className="w-5 h-5" />
            <span>Nouvel événement</span>
          </button>
        </section>

        {/* Message de migration */}
        {migrationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              migrationMessage.includes('réussie')
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {migrationMessage}
          </motion.div>
        )}

        {/* RAPPELS & ALERTES */}
        {remindersData.reminders.length > 0 && (
          <section>
            <RemindersSection
              reminders={remindersData.reminders}
              urgentCount={remindersData.urgentCount}
              highCount={remindersData.highCount}
              totalUnread={remindersData.totalUnread}
              onDismiss={remindersData.dismissReminder}
              onMarkAsRead={remindersData.markAsRead}
              navigate={navigate}
            />
          </section>
        )}

        {/* NIVEAU 1 - URGENCE OPÉRATIONNELLE */}
        <section>
          <UrgentEventsSection
            urgentEvents={urgentEvents}
            totalUrgentCount={totalUrgentCount}
            showMoreUrgent={showMoreUrgent}
            onToggleShowMore={() => setShowMoreUrgent(!showMoreUrgent)}
            onEventSelect={handleEventSelect}
            onEventEdit={handleEventEditSelect}
            onAssignFlorist={handleAssignFlorist}
            onCancelEvent={handleCancelEvent}
            navigate={navigate}
          />
        </section>

        {/* NIVEAU 2 - CASH FLOW */}
        <section>
          <InvoicingSection
            eventsToInvoice={eventsToInvoice}
            allEvents={state.events}
            navigate={navigate}
          />
        </section>

        {/* NIVEAU 3 - PLANIFICATION STRATÉGIQUE */}
        <section>
          <StrategicPlanningSection
            futureEvents={futureEvents}
            navigate={navigate}
            onEventEdit={handleEventEditSelect}
          />
        </section>

        {/* NIVEAU 4 - MÉTRIQUES BUSINESS */}
        <section>
          <BusinessMetricsSection
            events={state.events}
            clients={state.clients}
            futureEvents={futureEvents}
            eventsToInvoice={eventsToInvoice}
          />
        </section>
      </div>

      {/* Modales */}
      {selectedEvent && (
        <EventReadOnlyModal
          event={selectedEvent}
          isOpen={true}
          onClose={handleCloseModal}
          onEdit={handleSwitchToEdit}
        />
      )}

      {/* 🔧 CORRECTION: Toujours rendre le modal pour éviter le warning hooks */}
      <EventModal
        event={selectedEventForEdit}
        isOpen={!!selectedEventForEdit}
        onClose={handleCloseEditModal}
        onEdit={handleEventEdit}
      />

      {/* 🔧 CORRECTION: Modal fleuriste toujours rendu */}
      <EventModal
        event={selectedEventForFlorist}
        isOpen={!!selectedEventForFlorist}
        onClose={handleCloseFloristModal}
        onEdit={handleEventEdit}
        initialView="assignment"
      />

      {/* 🆕 MODAL DE CRÉATION D'ÉVÉNEMENT */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}

export default Home