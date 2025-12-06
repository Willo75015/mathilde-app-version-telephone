import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Event } from '@/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface PaymentTrackingModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onPaymentUpdate: (eventId: string, paymentStatus: 'paid' | 'pending' | 'overdue', paymentMethod?: string) => void
}

export const PaymentTrackingModal: React.FC<PaymentTrackingModalProps> = ({
  event,
  isOpen,
  onClose,
  onPaymentUpdate
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')

  const calculateDaysSinceInvoice = () => {
    if (!event?.invoiceDate) return 0
    return Math.floor((new Date().getTime() - new Date(event.invoiceDate).getTime()) / (1000 * 60 * 60 * 24))
  }

  const handlePaymentUpdate = async (status: 'paid' | 'pending' | 'overdue') => {
    if (!event) return
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      onPaymentUpdate(event.id, status, selectedPaymentMethod || undefined)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!event) return null

  const daysSinceInvoice = calculateDaysSinceInvoice()
  const isOverdue = daysSinceInvoice > 30 // Considéré en retard après 30 jours

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                📊 Suivi de facturation
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

        {/* Statut actuel */}
        <div className="space-y-4 mb-6">
          <div className={`border rounded-lg p-4 ${
            isOverdue ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {isOverdue ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <Clock className="w-5 h-5 text-purple-500" />
                )}
                <span className={`font-medium ${
                  isOverdue ? 'text-red-900' : 'text-purple-900'
                }`}>
                  Statut : Facture envoyée au client
                </span>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isOverdue 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {isOverdue ? 'En retard' : 'En attente'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Date d'envoi :</span>
                <div className="font-medium text-gray-900">
                  {event.invoiceDate 
                    ? new Date(event.invoiceDate).toLocaleDateString('fr-FR')
                    : 'Non définie'
                  }
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Délai écoulé :</span>
                <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {daysSinceInvoice} jour{daysSinceInvoice > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Détails financiers */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Montant facturé :</span>
                <div className="text-lg font-bold text-gray-900">
                  {event.budget.toLocaleString('fr-FR')}€
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Échéance :</span>
                <div className="font-medium text-gray-900">
                  {event.invoiceDate 
                    ? new Date(new Date(event.invoiceDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
                    : 'Non définie'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Sélection du mode de paiement si paiement reçu */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">
              💼 Le paiement a-t-il été reçu ?
            </h4>
            
            <div className="space-y-3">
              {/* Mode de paiement */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Mode de paiement (si reçu) :
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="transfer">Virement</option>
                  <option value="check">Chèque</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={() => handlePaymentUpdate('paid')}
              className="flex-1 bg-green-500 hover:bg-green-600"
              leftIcon={<CheckCircle className="w-4 h-4" />}
              isLoading={isProcessing}
              disabled={!selectedPaymentMethod}
            >
              Paiement Reçu
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handlePaymentUpdate('pending')}
              className="flex-1"
              leftIcon={<Clock className="w-4 h-4" />}
              isLoading={isProcessing}
            >
              En Attente
            </Button>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => handlePaymentUpdate('overdue')}
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              leftIcon={<AlertTriangle className="w-4 h-4" />}
              isLoading={isProcessing}
            >
              En Retard
            </Button>
            
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default PaymentTrackingModal