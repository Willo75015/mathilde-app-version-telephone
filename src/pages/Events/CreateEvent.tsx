import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Calendar, MapPin, Users, Flower2 } from 'lucide-react'
import { useEvents } from '@/contexts/AppContext'
import { Event, EventStatus } from '@/types'
import { EventValidationSchema, DataSanitizer } from '@/utils/validation'
import EventForm from '@/components/forms/EventForm'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'

const CreateEvent: React.FC = () => {
  const { createEvent, isLoading } = useEvents()
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
  
  const handleSubmit = async (formData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Validate and sanitize data
      const sanitizedData = DataSanitizer.validateAndSanitize(formData, EventValidationSchema.omit({
        id: true
      }))
      
      // Create event
      await createEvent(sanitizedData)
      
      // Show success message
      setToastMessage('Événement créé avec succès !')
      setToastType('success')
      setShowToast(true)
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/events'
      }, 2000)
      
    } catch (error) {
      console.error('Error creating event:', error)
      setToastMessage('Erreur lors de la création de l\'événement')
      setToastType('error')
      setShowToast(true)
    }
  }
  
  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.')) {
      window.location.href = '/events'
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
            Nouvel Événement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Créez un nouveau projet floral pour votre client
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
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Informations générales
                </span>
              </div>
              
              <div className="flex items-center space-x-2 opacity-50">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Flower2 className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm text-gray-500">
                  Sélection des fleurs
                </span>
              </div>
              
              <div className="flex items-center space-x-2 opacity-50">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Save className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm text-gray-500">
                  Finalisation
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Étape 1 sur 3
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Form */}
      <motion.div variants={itemVariants}>
        <EventForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Créer l'événement"
          onCancel={handleCancel}
        />
      </motion.div>
      
      {/* Help Tips */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 Conseils pour créer un événement
          </h3>
          
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Lieu :</strong> Soyez précis sur l'adresse pour faciliter la livraison et l'installation
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Date et heure :</strong> Prévoyez suffisamment de temps pour la préparation des arrangements
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Client :</strong> Assurez-vous que les informations de contact sont à jour
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <Flower2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Budget :</strong> Définissez un budget réaliste en tenant compte de la saisonnalité des fleurs
              </p>
            </div>
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

export default CreateEvent