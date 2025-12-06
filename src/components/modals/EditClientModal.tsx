import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, Mail, Phone, MapPin, MessageSquare, DollarSign } from 'lucide-react'
import { useClients } from '@/contexts/AppContext'
import { Client } from '@/types'
import { ClientValidationSchema, DataSanitizer } from '@/utils/validation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Toast from '@/components/ui/Toast'

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string | null
}

const EditClientModal: React.FC<EditClientModalProps> = ({ 
  isOpen, 
  onClose, 
  clientId 
}) => {
  const { clients, updateClient, isLoading } = useClients()
  const [client, setClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    comments: '',
    managerPayment: 0,
    freelancePayment: 0
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [isSaving, setIsSaving] = useState(false)

  // Charger les données du client quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && clientId) {
      const foundClient = clients.find(c => c.id === clientId)
      if (foundClient) {
        setClient(foundClient)
        setFormData({
          firstName: foundClient.firstName,
          lastName: foundClient.lastName,
          email: foundClient.email,
          phone: foundClient.phone,
          address: foundClient.address,
          comments: (foundClient as any).comments || '',
          managerPayment: (foundClient as any).managerPayment || 0,
          freelancePayment: (foundClient as any).freelancePayment || 0
        })
      }
    }
  }, [isOpen, clientId, clients])

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      // Pour les champs imbriqués comme address.street
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    setIsSaving(true)
    try {
      // Validation et sanitization
      const sanitizedData = DataSanitizer.validateAndSanitize(formData, ClientValidationSchema)
      
      // Mise à jour
      await updateClient(client.id, sanitizedData)
      
      // Success feedback
      setToastMessage('Client mis à jour avec succès !')
      setToastType('success')
      setShowToast(true)
      
      // Fermer le modal après un délai
      setTimeout(() => {
        onClose()
        setShowToast(false)
      }, 1500)
      
    } catch (error) {
      console.error('Erreur mise à jour:', error)
      setToastMessage('Erreur lors de la mise à jour')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsSaving(false)
    }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  if (!client) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Modifier le client
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {client.firstName} {client.lastName}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Prénom"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                    <Input
                      label="Nom"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      required
                    />
                    <PhoneInput
                      label="Téléphone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Adresse
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Rue"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Ville"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        required
                      />
                      <Input
                        label="Code postal"
                        value={formData.address.postalCode}
                        onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                        required
                      />
                      <Input
                        label="Pays"
                        value={formData.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Commentaires */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Commentaires
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes sur le client
                      </label>
                      <textarea
                        value={formData.comments}
                        onChange={(e) => handleInputChange('comments', e.target.value)}
                        placeholder="Ajoutez des notes sur ce client, ses préférences, remarques particulières..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                                 placeholder-gray-500 dark:placeholder-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 transition-all duration-200 resize-none"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Paiements */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Paiements
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Tu es payé en tant que manager"
                        type="number"
                        value={formData.managerPayment}
                        onChange={(e) => handleInputChange('managerPayment', parseInt(e.target.value) || 0)}
                        min="0"
                        rightIcon={<span className="text-sm text-gray-500">€</span>}
                        hint="Montant en euros"
                      />
                      <Input
                        label="Tu es payé en tant que freelance"
                        type="number"
                        value={formData.freelancePayment}
                        onChange={(e) => handleInputChange('freelancePayment', parseInt(e.target.value) || 0)}
                        min="0"
                        rightIcon={<span className="text-sm text-gray-500">€</span>}
                        hint="Montant en euros"
                      />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 <strong>Rappel :</strong> Ces montants t'aident à suivre tes revenus selon ton statut pour chaque client.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSubmit}
                isLoading={isSaving}
              >
                Sauvegarder
              </Button>
            </div>
          </motion.div>

          {/* Toast */}
          <AnimatePresence>
            {showToast && (
              <Toast
                message={toastMessage}
                type={toastType}
                onClose={() => setShowToast(false)}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  )
}

export default EditClientModal
