import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Eye, Info } from 'lucide-react'
import { EventStatus, KANBAN_COLUMNS, canTransitionTo } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import EventCard from '@/components/events/EventCard'
import EventModal from '@/components/events/EventModal'
import EventReadOnlyModal from '@/components/events/EventReadOnlyModal'
import Button from '@/components/ui/Button'
import { ArchiveEventModal, PaymentTrackingModal } from '@/components/modals/billing'
import { useBillingWorkflow } from '@/hooks/useBillingWorkflow'
import { useAutoStatusTransition } from '@/hooks/useAutoStatusTransition'
import { useStatusChangeNotifications } from '@/hooks/useStatusChangeNotifications'
import { useEventStatusNotifier } from '@/hooks/useEventStatusNotifier'
import { useGlobalNotifications } from '@/contexts/GlobalNotificationContext'
import { useEvents } from '@/contexts/AppContext' // 🆕 Ajout pour utiliser updateEventWithStatusDates
import { EventVisibilityManager } from '@/lib/event-visibility'

interface KanbanBoardProps {
  events: any[]
  onEventStatusChange: (eventId: string, newStatus: EventStatus) => void
  onEventEdit?: (event: any) => void
  onEventDelete?: (event: any) => void
  onCreateEvent?: (status: EventStatus) => void
  showCreateButtons?: boolean
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  events,
  onEventStatusChange,
  onEventEdit,
  onEventDelete,
  onCreateEvent,
  showCreateButtons = true
}) => {
  const [draggedEvent, setDraggedEvent] = useState<any>(null)
  const [dragOverColumn, setDragOverColumn] = useState<EventStatus | null>(null)
  
  // 🆕 HOOK POUR UTILISER LA NOUVELLE FONCTION DE MISE À JOUR AVEC DATES
  const { updateEventWithStatusDates } = useEvents()
  
  // États pour les modales existantes
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // 🆕 NOUVEAUX ÉTATS POUR LE WORKFLOW DE FACTURATION
  const [selectedEventForArchive, setSelectedEventForArchive] = useState<any>(null)
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<any>(null)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // 🆕 HOOKS POUR LE WORKFLOW
  const { archiveAndInvoiceEvent, updatePaymentStatus } = useBillingWorkflow()
  const { notifications, showSuccess, showError, showWarning, removeNotification } = useGlobalNotifications()
  
  // 🧪 DEBUG: Vérifier que showSuccess existe
  console.log('🔍 KanbanBoard - showSuccess:', typeof showSuccess, showSuccess)
  console.log('🔍 KanbanBoard - notifications:', notifications.length)

  // 📅 Filtrer les événements selon la logique de visibilité temporelle
  const visibleEvents = EventVisibilityManager.filterEventsForKanban(events)

  // 🔔 NOTIFICATIONS POUR TOUS LES CHANGEMENTS DE STATUT
  const { notifyStatusChange } = useStatusChangeNotifications({
    events: visibleEvents
  })
  const { notifyStatusChange: notifyManualChange } = useEventStatusNotifier()
  
  // 🎯 WRAPPER POUR NOTIFICATION AUTOMATIQUE SUR CHANGEMENT DE STATUT
  const handleEventStatusChangeWithNotification = (eventId: string, newStatus: EventStatus) => {
    const event = visibleEvents.find(e => e.id === eventId)
    if (event) {
      console.log(`🔔 Changement de statut avec notification: ${event.title} → ${newStatus}`)
      
      // 🔧 CORRECTION : Utiliser notre nouvelle fonction avec dates automatiques
      updateEventWithStatusDates(eventId, newStatus)
      
      // Notification automatique
      notifyManualChange(event.title, newStatus, eventId)
    }
  }

  // 🚫 WRAPPER POUR NOTIFICATION SUR ANNULATION D'ÉVÉNEMENT
  const handleEventDeleteWithNotification = (event: any) => {
    console.log(`🗑️ Annulation avec notification: ${event.title}`)
    
    if (onEventDelete) {
      // Appeler la fonction originale d'annulation
      onEventDelete(event)
      
      // Notification spécifique pour annulation
      showWarning(
        `L'événement "${event.title}" a été annulé définitivement`,
        '🗑️ Événement supprimé',
        6000,
        event.id
      )
    }
  }

  // 🤖 LOGIQUE AUTOMATIQUE DES STATUTS
  useAutoStatusTransition({
    events: visibleEvents,
    onEventStatusChange: handleEventStatusChangeWithNotification
  })
  
  // 📊 Informations sur la visibilité des événements payés
  const paidVisibilityInfo = {
    message: EventVisibilityManager.getPaidVisibilityMessage(),
    daysLeft: EventVisibilityManager.getDaysUntilPaidEventsHidden(),
    hiddenCount: events.length - visibleEvents.length
  }

  const handleDragStart = (event: any) => {
    setDraggedEvent(event)
  }

  const handleDragEnd = () => {
    setDraggedEvent(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnStatus: EventStatus) => {
    e.preventDefault()
    if (draggedEvent && canTransitionTo(draggedEvent.status, columnStatus)) {
      setDragOverColumn(columnStatus)
    }
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, columnStatus: EventStatus) => {
    e.preventDefault()
    if (draggedEvent && canTransitionTo(draggedEvent.status, columnStatus)) {
      console.log(`🎯 DROP: "${draggedEvent.title}" de "${draggedEvent.status}" vers "${columnStatus}"`)
      
      // 🚀 CHANGEMENT DE STATUT AVEC NOTIFICATION AUTOMATIQUE
      handleEventStatusChangeWithNotification(draggedEvent.id, columnStatus)
      
      // 🔧 TEST DIRECT - FORCER UNE NOTIFICATION
      console.log('🧪 TEST: Forcer une notification directe...')
      showSuccess(
        `Événement "${draggedEvent.title}" déplacé vers ${columnStatus}`,
        `✅ Statut mis à jour`,
        5000,
        draggedEvent.id
      )
      console.log('🧪 TEST: showSuccess appelé !')
      
      console.log(`✅ Événement "${draggedEvent.title}" déplacé vers "${columnStatus}"`)
    }
    setDraggedEvent(null)
    setDragOverColumn(null)
  }

  // Handlers pour les modales - INVERSÉS
  const handleEventClick = (event: any) => {
    // MAINTENANT : Crayon = Modal d'édition
    setSelectedEvent(event)
    setIsEditModalOpen(true)
  }

  const handleEditClick = (event: any) => {
    // MAINTENANT : Bouton Voir = Modal coloré readonly
    setSelectedEvent(event)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedEvent(null)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedEvent(null)
  }

  const handleOpenEditFromView = () => {
    setIsViewModalOpen(false)
    setIsEditModalOpen(true)
  }

  const handleEditEvent = (editedEvent: any) => {
    if (onEventEdit) {
      onEventEdit(editedEvent)
    }
    handleCloseEditModal()
  }

  // 🆕 HANDLERS POUR LE WORKFLOW DE FACTURATION
  const handleArchiveAndInvoice = (event: any) => {
    console.log('🎯 KANBAN - Ouverture modale archivage pour:', event.title)
    setSelectedEventForArchive(event)
    setIsArchiveModalOpen(true)
  }

  const handlePaymentTracking = (event: any) => {
    console.log('🎯 KANBAN - Ouverture modale paiement pour:', event.title)
    setSelectedEventForPayment(event)
    setIsPaymentModalOpen(true)
  }

  const handleArchiveConfirm = async (eventId: string) => {
    try {
      const event = visibleEvents.find(e => e.id === eventId)
      console.log('💼 KANBAN - Archivage et facturation:', eventId)
      await archiveAndInvoiceEvent(eventId)
      
      // 🔔 NOTIFICATION POUR ARCHIVAGE
      if (event) {
        showSuccess(
          `"${event.title}" a été terminé et facturé avec succès`,
          '📋 Événement archivé',
          6000,
          eventId
        )
      }
      
      setIsArchiveModalOpen(false)
      setSelectedEventForArchive(null)
      
    } catch (error) {
      console.error('❌ KANBAN - Erreur archivage:', error)
      showError(
        `Erreur lors de l'archivage: ${error instanceof Error ? error.message : String(error)}`,
        'Erreur de facturation'
      )
    }
  }

  const handlePaymentStatusUpdate = async (eventId: string, status: 'paid' | 'overdue' | 'reminder') => {
    try {
      const event = visibleEvents.find(e => e.id === eventId)
      console.log('💰 KANBAN - Mise à jour paiement:', eventId, status)
      await updatePaymentStatus(eventId, status)
      
      const messages = {
        paid: { text: 'Paiement enregistré avec succès !', emoji: '💰', title: 'Paiement reçu' },
        overdue: { text: 'Événement marqué comme en retard', emoji: '⏰', title: 'En attente' },
        reminder: { text: 'Relance client enregistrée', emoji: '📧', title: 'Relance envoyée' }
      }
      
      const msgInfo = messages[status]
      
      // 🔔 NOTIFICATION POUR PAIEMENT avec eventId
      if (event && msgInfo) {
        showSuccess(
          `"${event.title}" - ${msgInfo.text}`,
          `${msgInfo.emoji} ${msgInfo.title}`,
          5000,
          eventId
        )
      }
      
      if (status === 'paid') {
        setIsPaymentModalOpen(false)
        setSelectedEventForPayment(null)
      }
      
    } catch (error) {
      console.error('❌ KANBAN - Erreur paiement:', error)
      showError(
        `Erreur lors de la mise à jour: ${error instanceof Error ? error.message : String(error)}`,
        'Erreur de paiement'
      )
    }
  }

  return (
    <>
      {/* 📅 Message informatif sur la visibilité des événements payés */}
      {paidVisibilityInfo.hiddenCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <span className="font-medium">
              {paidVisibilityInfo.hiddenCount} événement{paidVisibilityInfo.hiddenCount > 1 ? 's' : ''} payé{paidVisibilityInfo.hiddenCount > 1 ? 's' : ''} masqué{paidVisibilityInfo.hiddenCount > 1 ? 's' : ''} du Kanban
            </span>
            <span className="ml-1 text-blue-600">
              (visibles dans l'onglet Événements)
            </span>
          </div>
        </div>
      )}
      
      {paidVisibilityInfo.daysLeft <= 7 && events.some(e => e.status === 'paid') && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            {paidVisibilityInfo.message}
          </div>
        </div>
      )}
      
      {/* 🎯 MESSAGE EXPLICATIF MIS À JOUR */}
      <motion.div 
        className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white text-lg">🎨</span>
          </motion.div>
          <div>
            <h4 className="font-bold text-purple-800 text-sm">
              🎉 Nouveau : Modal coloré et user-friendly !
            </h4>
            <p className="text-sm text-purple-700 mt-1">
              <span className="font-semibold bg-purple-100 px-2 py-0.5 rounded mr-1">✏️ Crayon</span> = 
              <span className="text-green-700 font-medium"> Modal coloré readonly</span> | 
              <span className="font-semibold bg-blue-100 px-2 py-0.5 rounded mx-1">📝 Modifier</span> = 
              <span className="text-blue-700 font-medium"> Formulaire d'édition</span>
            </p>
          </div>
        </div>
      </motion.div>
      
      <div className="flex gap-6 overflow-x-auto pb-6">
        {KANBAN_COLUMNS.filter(col => col.status !== EventStatus.CANCELLED).map((column) => {
          const columnEvents = visibleEvents.filter(event => event.status === column.status)
          const isDropTarget = dragOverColumn === column.status

          return (
            <motion.div
              key={column.id}
              className={`
                flex-shrink-0 w-80 rounded-lg p-4 shadow-sm border transition-all duration-200
                ${isDropTarget 
                  ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200 shadow-lg transform scale-102' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                }
              `}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
              whileHover={{ y: -2 }}
            >
            {/* Header de colonne - AMÉLIORÉ VISUELLEMENT */}
            <div className={`
              flex items-center justify-between p-4 rounded-xl mb-4 shadow-sm
              ${column.headerColor} border-l-4 border-l-${column.iconColor.replace('text-', '')}-500
            `}>
              <div className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${column.bgColor} ${column.textColor} border border-current border-opacity-20
                `}>
                  <span className="text-lg">{column.emoji}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${column.textColor}`}>
                    {column.title}
                  </h3>
                  <p className={`text-xs ${column.textColor} opacity-75`}>
                    {columnEvents.length} événement{columnEvents.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Badge de compteur amélioré */}
                <motion.span 
                  className={`
                    px-3 py-1 text-xs font-bold rounded-full
                    ${column.bgColor} ${column.textColor} border border-current border-opacity-30
                    shadow-sm
                  `}
                  animate={{ scale: columnEvents.length > 0 ? 1 : 0.8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {columnEvents.length}
                </motion.span>

                {showCreateButtons && onCreateEvent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Plus className="w-3 h-3" />}
                    onClick={() => onCreateEvent(column.status)}
                    className="opacity-70 hover:opacity-100 hover:scale-105 transition-all"
                    title={`Créer un événement ${column.title.toLowerCase()}`}
                  />
                )}
              </div>
            </div>

            {/* Description améliorée */}
            <div className="mb-4 px-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                💡 {column.description}
              </p>
            </div>

            {/* Cartes d'événements */}
            <div className="space-y-3 min-h-[200px]">
              <AnimatePresence>
                {columnEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EventCard
                      event={event}
                      view="kanban"
                      onClick={handleEventClick}  // 👁️ Clic sur événement = visualisation
                      onEdit={handleEditClick}     // ✏️ Clic sur crayon = édition
                      onDelete={handleEventDeleteWithNotification}  // 🚫 Annulation avec notification
                      onArchiveAndInvoice={handleArchiveAndInvoice}  // 🆕 Workflow
                      onPaymentTracking={handlePaymentTracking}      // 🆕 Workflow
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedEvent?.id === event.id}
                    />
                    
                    {/* 🎯 BOUTON VOIR AMÉLIORÉ - SUPER ATTRACTIF + ANIMATION */}
                    <motion.div 
                      className="mt-3 flex justify-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEventClick(event)}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border-blue-300 font-bold px-6 py-2 text-sm shadow-md hover:shadow-lg transition-all duration-200 border-2 relative overflow-hidden"
                        >
                          {/* Badge NOUVEAU */}
                          <motion.div
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-20"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            NEW
                          </motion.div>
                          <span className="flex items-center space-x-2 relative z-10">
                            <motion.span 
                              className="text-lg"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                              ✏️
                            </motion.span>
                            <span>Modifier l'événement</span>
                            <motion.span 
                              className="text-lg"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                              📝
                            </motion.span>
                          </span>
                          
                          {/* Effet de brillance */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 w-full h-full"
                            initial={{ x: -100 }}
                            animate={{ x: 200 }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                          />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {columnEvents.length === 0 && (
                <motion.div 
                  className="text-center py-12 text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-4xl mb-2">{column.emoji}</div>
                  <p className="text-sm font-medium">Aucun événement</p>
                  <p className="text-xs mt-1 max-w-[200px] mx-auto">
                    {column.description}
                  </p>
                  {showCreateButtons && onCreateEvent && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus className="w-3 h-3" />}
                      onClick={() => onCreateEvent(column.status)}
                      className="mt-3 text-xs"
                    >
                      Créer le premier
                    </Button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Zone de drop améliorée */}
            {isDropTarget && draggedEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-6 border-2 border-dashed border-primary-400 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 shadow-inner"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✨</div>
                  <p className="text-sm text-primary-700 font-medium">
                    Déplacer "{draggedEvent.title}"
                  </p>
                  <p className="text-xs text-primary-600 mt-1">
                    vers {column.title} {column.emoji}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>

    {/* 👁️ MODAL DE VISUALISATION */}
    <EventReadOnlyModal
      event={selectedEvent}
      isOpen={isViewModalOpen}
      onClose={handleCloseViewModal}
      onEdit={handleOpenEditFromView}
    />

    {/* ✏️ MODAL D'ÉDITION */}
    <EventModal
      event={selectedEvent}
      isOpen={isEditModalOpen}
      onClose={handleCloseEditModal}
      onEdit={handleEditEvent}
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
  </>
  )
}

export default KanbanBoard
