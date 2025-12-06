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
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationContainer } from '@/components/ui/Notification'
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
  const { notifications, removeNotification, showSuccess, showError } = useNotifications()

  // 📅 Filtrer les événements selon la logique de visibilité temporelle
  const visibleEvents = EventVisibilityManager.filterEventsForKanban(events)
  
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
      // 🚀 AUTOMATISATION : Changement automatique de statut lors du drop
      onEventStatusChange(draggedEvent.id, columnStatus)
      
      // Animation de confirmation du drop
      console.log(`✅ Événement "${draggedEvent.title}" déplacé vers "${columnStatus}"`)
    }
    setDraggedEvent(null)
    setDragOverColumn(null)
  }

  // Handlers pour les modales
  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (event: any) => {
    setSelectedEvent(event)
    setIsEditModalOpen(true)
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
      console.log('💼 KANBAN - Archivage et facturation:', eventId)
      await archiveAndInvoiceEvent(eventId)
      
      showSuccess(
        `Événement archivé et facturé avec succès !`,
        'Facturation créée'
      )
      
      setIsArchiveModalOpen(false)
      setSelectedEventForArchive(null)
      
    } catch (error) {
      console.error('❌ KANBAN - Erreur archivage:', error)
      showError(
        `Erreur lors de l'archivage: ${error.message}`,
        'Erreur de facturation'
      )
    }
  }

  const handlePaymentStatusUpdate = async (eventId: string, status: 'paid' | 'overdue' | 'reminder') => {
    try {
      console.log('💰 KANBAN - Mise à jour paiement:', eventId, status)
      await updatePaymentStatus(eventId, status)
      
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
      
    } catch (error) {
      console.error('❌ KANBAN - Erreur paiement:', error)
      showError(
        `Erreur lors de la mise à jour: ${error.message}`,
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
                      onDelete={onEventDelete}
                      onArchiveAndInvoice={handleArchiveAndInvoice}  // 🆕 Workflow
                      onPaymentTracking={handlePaymentTracking}      // 🆕 Workflow
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedEvent?.id === event.id}
                    />
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

    {/* 🔔 CONTAINER DE NOTIFICATIONS */}
    <NotificationContainer
      notifications={notifications}
      onRemove={removeNotification}
    />
  </>
  )
}

export default KanbanBoard
