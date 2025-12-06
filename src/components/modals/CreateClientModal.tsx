import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Save, X, Mail, Phone, MapPin, MessageSquare } from 'lucide-react'
import { useClients } from '@/contexts/AppContext'
import { Client } from '@/types'
import { ClientValidationSchema, DataSanitizer } from '@/utils/validation'
import ClientForm from '@/components/forms/ClientForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'

interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (client: Client) => void
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createClient, isLoading } = useClients()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [formProgress, setFormProgress] = useState(0)

  // Calculer le progrès du formulaire
  const calculateProgress = (data: any) => {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'address.street', 'address.city', 'address.postalCode']
    const completed = fields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return data[parent] && data[parent][child]
      }
      return data[field]
    }).length
    return Math.round((completed / fields.length) * 100)
  }

  const handleSubmit = async (formData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('📝 Création client via modal...', formData)
      
      // Validate and sanitize data
      const sanitizedData = DataSanitizer.validateAndSanitize(formData, ClientValidationSchema)
      
      // Create client
      const newClient = await createClient(sanitizedData)
      
      // Show success message
      setToastMessage('Client créé avec succès !')
      setToastType('success')
      setShowToast(true)
      
      console.log('✅ Client créé:', newClient)
      
      // Call success callback
      if (onSuccess) {
        onSuccess(newClient)
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose()
        setShowToast(false)
      }, 1500)
      
    } catch (error) {
      console.error('❌ Erreur création client:', error)
      
      setToastMessage(
        error instanceof Error 
          ? error.message 
          : 'Erreur lors de la création du client'
      )
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les informations seront perdues.')) {
      console.log('❌ Annulation création client')
      onClose()
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Nouveau Client"
        size="xl"
        className="max-h-[90vh] overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header avec description */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Informations du client
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ajoutez un nouveau client à votre carnet d'adresses
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formProgress}% complété
              </div>
              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Informations personnelles
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Contact
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Adresse
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Informations complémentaires
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <ClientForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Créer le client"
            onCancel={handleCancel}
          />

          {/* Help Tips */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
              💡 Conseils pour créer un client
            </h4>
            
            <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <div className="flex items-start space-x-2">
                <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Nom complet :</strong> Vérifiez l'orthographe pour éviter les doublons
                </p>
              </div>
              
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Email :</strong> Utilisé pour les confirmations et rappels
                </p>
              </div>
              
              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Téléphone :</strong> Contact principal pour les urgences
                </p>
              </div>
              
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Adresse :</strong> Nécessaire pour les livraisons et devis
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Commentaires :</strong> Préférences, allergies, notes spéciales
                </p>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-800 rounded">
              <p className="text-xs text-green-800 dark:text-green-200">
                <strong>💾 Sauvegarde automatique :</strong> Vos données sont protégées pendant la saisie
              </p>
            </div>
          </div>
        </motion.div>
      </Modal>

      {/* Toast de notification */}
      {showToast && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}

export default CreateClientModal
