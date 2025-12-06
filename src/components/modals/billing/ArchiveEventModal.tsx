import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, FileText, X, Calendar } from 'lucide-react'
import { Event, EventStatus } from '@/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface ArchiveEventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onArchiveAndInvoice: (eventId: string) => void
}

export const ArchiveEventModal: React.FC<ArchiveEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onArchiveAndInvoice
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleArchiveAndInvoice = async () => {
    if (!event) return

    setIsProcessing(true)
    try {
      await onArchiveAndInvoice(event.id)
      onClose()
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!event) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Archive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Archivage de l'événement
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Finalisation et facturation
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="w-4 h-4" />}
          />
        </div>

        {/* Détails de l'événement */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {event.title}
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📍 {event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>👤 {event.clientName || 'Client'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                {event.budget.toLocaleString('fr-FR')}€
              </div>
              <div className="text-sm text-gray-500">
                Montant à facturer
              </div>
            </div>
          </div>
        </div>

        {/* Message principal */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium mb-2">
                Cet événement est maintenant terminé.
              </p>
              <p className="text-blue-800 text-sm">
                Souhaitez-vous l'archiver et procéder à la facturation ? 
                Cette action marquera l'événement comme "Facturé" et vous pourrez 
                ensuite suivre le statut du paiement.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleArchiveAndInvoice}
            isLoading={isProcessing}
            leftIcon={<FileText className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Archiver et Facturer
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ArchiveEventModal