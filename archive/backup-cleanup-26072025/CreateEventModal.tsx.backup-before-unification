import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Calendar } from 'lucide-react'
import { useEvents } from '@/contexts/AppContext'
import { Event, EventStatus } from '@/types'
import { EventValidationSchema, DataSanitizer } from '@/utils/validation'
import EventForm from '@/components/forms/EventForm'
import Button from '@/components/ui/Button'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: (event: Event) => void
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const { createEvent, isLoading } = useEvents()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleSubmit = async (formData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('📝 Création événement via modal:', formData)
      
      // Validation des données
      const sanitizedData = DataSanitizer.sanitizeObject(formData)
      const validatedData = EventValidationSchema.parse({
        ...sanitizedData,
        id: crypto.randomUUID()
      })

      // Créer l'événement
      await createEvent(validatedData)
      
      console.log('✅ Événement créé avec succès')
      setToastMessage('Événement créé avec succès !')
      setShowToast(true)
      
      // Notifier le parent qu'un événement a été créé
      if (onEventCreated) {
        onEventCreated(validatedData as Event)
      }
      
      // Fermer le modal après un court délai
      setTimeout(() => {
        onClose()
        setShowToast(false)
      }, 1500)
      
    } catch (error) {
      console.error('❌ Erreur création événement:', error)
      setToastMessage('Erreur lors de la création de l\'événement')
      setShowToast(true)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Créer un nouvel événement
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Remplissez les informations de l'événement
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

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <EventForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                submitLabel="Créer l'événement"
                cancelLabel="Annuler"
              />
            </div>

            {/* Toast */}
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
              >
                {toastMessage}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default CreateEventModal
