import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Archive, DollarSign, Calendar } from 'lucide-react'
import { Event } from '@/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface ArchiveEventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onArchive: (eventId: string) => void
}

export const ArchiveEventModal: React.FC<ArchiveEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onArchive
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleArchive = async () => {
    if (!event) return
    
    setIsProcessing(true)
    
    try {
      // Simulation d'une petite attente pour l'UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      onArchive(event.id)
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                🗂️ Archivage de l'événement
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {event.title}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="space-y-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-900 mb-1">
                  Événement terminé avec succès
                </h3>
                <p className="text-sm text-green-800">
                  Cet événement est maintenant terminé.<br />
                  Souhaitez-vous l'archiver et procéder à la facturation ?
                </p>
              </div>
            </div>
          </div>

          {/* Détails de l'événement */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Date :</span>
                <span className="font-medium text-gray-900">
                  {new Date(event.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Montant :</span>
                <span className="font-medium text-gray-900">
                  {event.budget.toLocaleString('fr-FR')}€
                </span>
              </div>
            </div>
          </div>

          {/* Information sur les prochaines étapes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              📋 Prochaines étapes après archivage :
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• L'événement passera au statut "Facturé"</li>
              <li>• Vous pourrez suivre le paiement</li>
              <li>• Les statistiques seront mises à jour</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          >
            Annuler
          </Button>
          
          <Button
            variant="primary"
            onClick={handleArchive}
            className="flex-1 bg-green-500 hover:bg-green-600"
            leftIcon={<Archive className="w-4 h-4" />}
            isLoading={isProcessing}
          >
            {isProcessing ? 'Archivage...' : 'Archiver et Facturer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ArchiveEventModal