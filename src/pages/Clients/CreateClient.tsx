import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, User, MapPin, Phone, Mail } from 'lucide-react'
import { useClients } from '@/contexts/AppContext'
import { Client } from '@/types'
import { ClientValidationSchema, DataSanitizer } from '@/utils/validation'
import ClientForm from '@/components/forms/ClientForm'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'

interface CreateClientProps {
  navigate?: (page: string, params?: any) => void
}

const CreateClient: React.FC<CreateClientProps> = ({ navigate }) => {
  const { createClient, isLoading } = useClients()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  
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
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
  
  const handleSubmit = async (formData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Validate and sanitize data
      const sanitizedData = DataSanitizer.validateAndSanitize(formData, ClientValidationSchema)
      
      // Create client
      await createClient(sanitizedData)
      
      // Show success message
      setToastMessage('Client créé avec succès !')
      setToastType('success')
      setShowToast(true)
      
      // Redirect after short delay
      setTimeout(() => {
        console.log('✅ Client créé, redirection vers la liste')
        if (navigate) {
          navigate('clients')
        } else {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'clients' } }))
        }
      }, 2000)
      
    } catch (error) {
      console.error('Error creating client:', error)
      setToastMessage('Erreur lors de la création du client')
      setToastType('error')
      setShowToast(true)
    }
  }
  
  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.')) {
      console.log('🔙 Retour vers la liste des clients')
      if (navigate) {
        navigate('clients')
      } else {
        // Fallback
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'clients' } }))
      }
    }
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={handleCancel}
        >
          Retour
        </Button>
        
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Nouveau Client
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Ajoutez un nouveau client à votre carnet d'adresses
          </p>
        </div>
      </motion.div>
      
      {/* Progress Steps */}
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Form */}
      <motion.div variants={itemVariants}>
        <ClientForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Créer le client"
          onCancel={handleCancel}
        />
      </motion.div>
      
      {/* Help Tips */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            💡 Conseils pour créer un client
          </h3>
          
          <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
            <div className="flex items-start space-x-2">
              <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Nom complet :</strong> Vérifiez l'orthographe pour éviter les doublons
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Email :</strong> L'adresse email sera utilisée pour les confirmations et rappels
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Téléphone :</strong> Numéro principal pour les contacts urgents
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Adresse complète :</strong> Nécessaire pour les livraisons et devis précis
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>💾 Sauvegarde automatique :</strong> Vos données sont automatiquement 
              sauvegardées pendant la saisie pour éviter toute perte.
            </p>
          </div>
        </Card>
      </motion.div>
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </motion.div>
  )
}

export default CreateClient