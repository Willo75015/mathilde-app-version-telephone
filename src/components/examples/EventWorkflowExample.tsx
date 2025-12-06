import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EventStatus } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { useBillingWorkflow } from '@/hooks/useBillingWorkflow'
import { useNotifications } from '@/hooks/useNotifications'
import { useEventStatusNotifications } from '@/hooks/useEventStatusNotifications'
import EventCard from '@/components/events/EventCard'
import { ArchiveEventModal, PaymentTrackingModal } from '@/components/modals/billing'
import { NotificationContainer } from '@/components/ui/Notification'

// 🎯 EXEMPLE D'INTÉGRATION COMPLÈTE DU WORKFLOW DE FACTURATION
// Ce composant montre comment connecter tous les éléments ensemble

export const EventWorkflowExample: React.FC = () => {
  const { state } = useApp()
  const events = state.events
  const { archiveAndInvoiceEvent, updatePaymentStatus } = useBillingWorkflow()
  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications()
  
  // États pour les modales
  const [selectedEventForArchive, setSelectedEventForArchive] = useState<any>(null)
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<any>(null)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // 🔔 Activation des notifications automatiques
  useEventStatusNotifications({
    events,
    onShowNotification: (message, type) => {
      if (type === 'success') showSuccess(message)
      else if (type === 'error') showError(message)
      else if (type === 'warning') showSuccess(message) // Warning en orange dans notre hook
      else showInfo(message)
    }
  })

  // 📋 Handlers pour les actions de workflow
  const handleArchiveAndInvoice = (event: any) => {
    setSelectedEventForArchive(event)
    setIsArchiveModalOpen(true)
  }

  const handlePaymentTracking = (event: any) => {
    setSelectedEventForPayment(event)
    setIsPaymentModalOpen(true)
  }

  // 🆕 Handler pour l'annulation d'événement
  const handleCancelEvent = (event: any) => {
    // Simuler l'annulation
    showSuccess(
      `Événement "${event.title}" annulé avec succès`,
      'Événement annulé'
    )
    console.log('Événement annulé:', event)
  }
  // 💼 Traitement de l'archivage et facturation
  const handleArchiveConfirm = async (eventId: string) => {
    try {
      await archiveAndInvoiceEvent(eventId)
      
      // Notification de succès
      showSuccess(
        `Événement archivé et facturé avec succès !`,
        'Facturation créée'
      )
      
      // Fermer la modale
      setIsArchiveModalOpen(false)
      setSelectedEventForArchive(null)
      
    } catch (error) {
      showError(
        `Erreur lors de l'archivage: ${error instanceof Error ? error.message : String(error)}`,
        'Erreur de facturation'
      )
    }
  }

  // 💰 Traitement du suivi de paiement
  const handlePaymentStatusUpdate = async (eventId: string, status: 'paid' | 'overdue' | 'reminder') => {
    try {
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
      showError(
        `Erreur lors de la mise à jour: ${error instanceof Error ? error.message : String(error)}`,
        'Erreur de paiement'
      )
    }
  }
  // Filtrer les événements par statut pour l'exemple
  const completedEvents = events.filter(e => e.status === EventStatus.COMPLETED)
  const invoicedEvents = events.filter(e => e.status === EventStatus.INVOICED)
  const paidEvents = events.filter(e => e.status === EventStatus.PAID)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header avec instructions */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎯 Workflow de Facturation - Démo
        </h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            Instructions du workflow :
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. <strong>Événements Terminés</strong> : Cliquez sur "Terminer" pour archiver et créer la facture</li>
            <li>2. <strong>Événements Facturés</strong> : Cliquez sur "Facturé" pour gérer le paiement</li>
            <li>3. <strong>Événements Payés</strong> : Affichage final avec badge de confirmation</li>
            <li>4. <strong>Notifications automatiques</strong> : Se déclenchent à chaque changement de statut</li>
          </ul>
        </div>
      </div>

      {/* Grille d'événements par statut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne Terminés */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            ✅ Terminés ({completedEvents.length})
            <span className="ml-2 text-sm font-normal text-gray-500">
              → Prêts à facturer
            </span>
          </h2>
          <div className="space-y-4">
            {completedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                view="list"
                onArchiveAndInvoice={handleArchiveAndInvoice}
                onEdit={() => showInfo('Fonction d\'édition simulée')}
                onCancel={handleCancelEvent}
              />
            ))}
            {completedEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun événement terminé</p>
              </div>
            )}
          </div>
        </div>
        {/* Colonne Facturés */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💼 Facturés ({invoicedEvents.length})
            <span className="ml-2 text-sm font-normal text-gray-500">
              → En attente de paiement
            </span>
          </h2>
          <div className="space-y-4">
            {invoicedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                view="list"
                onPaymentTracking={handlePaymentTracking}
                onEdit={() => showInfo('Fonction d\'édition simulée')}
                onCancel={handleCancelEvent}
              />
            ))}
            {invoicedEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun événement facturé</p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne Payés */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💰 Payés ({paidEvents.length})
            <span className="ml-2 text-sm font-normal text-gray-500">
              → Finalisés
            </span>
          </h2>
          <div className="space-y-4">
            {paidEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                view="list"
                onEdit={() => showInfo('Fonction d\'édition simulée')}
                onCancel={handleCancelEvent}
              />
            ))}
            {paidEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun paiement encaissé</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modales de workflow */}
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

      {/* Container de notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  )
}

export default EventWorkflowExample