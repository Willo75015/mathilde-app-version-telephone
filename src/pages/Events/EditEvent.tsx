import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2, Copy, Share } from 'lucide-react'
import { useEvents } from '@/contexts/AppContext'
import { Event } from '@/types'
import { EventValidationSchema, DataSanitizer } from '@/utils/validation'
import EventForm from '@/components/forms/EventForm'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'
import Modal from '@/components/ui/Modal'

interface EditEventProps {
  eventId: string
}

const EditEvent: React.FC<EditEventProps> = ({ eventId }) => {
  const { events, updateEvent, deleteEvent, isLoading } = useEvents()
  const [event, setEvent] = useState<Event | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Find event
  useEffect(() => {
    const foundEvent = events.find(e => e.id === eventId)
    if (foundEvent) {
      setEvent(foundEvent)
    } else {
      // Event not found, redirect
      window.location.href = '/events'
    }
  }, [eventId, events])
  
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
    if (!event) return
    
    try {
      // Validate and sanitize data
      const sanitizedData = DataSanitizer.validateAndSanitize(formData, EventValidationSchema.omit({
        id: true
      }))
      
      // Update event
      await updateEvent(event.id, sanitizedData)
      
      // Show success message
      setToastMessage('Événement mis à jour avec succès !')
      setToastType('success')
      setShowToast(true)
      
    } catch (error) {
      console.error('Error updating event:', error)
      setToastMessage('Erreur lors de la mise à jour de l\'événement')
      setToastType('error')
      setShowToast(true)
    }
  }
  
  const handleDelete = async () => {
    if (!event) return
    
    setIsDeleting(true)
    try {
      await deleteEvent(event.id)
      
      setToastMessage('Événement supprimé avec succès')
      setToastType('success')
      setShowToast(true)
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/events'
      }, 2000)
      
    } catch (error) {
      console.error('Error deleting event:', error)
      setToastMessage('Erreur lors de la suppression de l\'événement')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }
  
  const handleDuplicate = () => {
    if (!event) return
    
    const duplicateData = {
      ...event,
      title: `${event.title} (Copie)`,
      date: new Date(event.date.getTime() + 7 * 24 * 60 * 60 * 1000) // +1 week
    }
    
    // Encode data and redirect to create page
    const encoded = encodeURIComponent(JSON.stringify(duplicateData))
    window.location.href = `/events/new?duplicate=${encoded}`
  }
  
  const handleShare = async () => {
    if (!event) return
    
    const shareData = {
      title: `Événement: ${event.title}`,
      text: `${event.description}\nDate: ${event.date.toLocaleDateString()}\nLieu: ${event.location}`,
      url: window.location.href
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
        setToastMessage('Lien copié dans le presse-papiers')
        setToastType('success')
        setShowToast(true)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }
  
  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les modifications non sauvegardées seront perdues.')) {
      window.location.href = `/events/${eventId}`
    }
  }
  
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de l'événement...</p>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            href={`/events/${eventId}`}
          >
            Retour
          </Button>
          
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Modifier l'événement
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {event.title}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Share className="w-4 h-4" />}
            onClick={handleShare}
          >
            Partager
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Copy className="w-4 h-4" />}
            onClick={handleDuplicate}
          >
            Dupliquer
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteModal(true)}
          >
            Supprimer
          </Button>
        </div>
      </motion.div>      
      {/* Event Status Banner */}
      <motion.div variants={itemVariants}>
        <Card className={`p-4 border-l-4 ${
          event.status === 'confirmed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
          event.status === 'in_progress' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
          event.status === 'completed' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
          event.status === 'cancelled' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
          'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Statut: {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Dernière modification: {event.updatedAt.toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {event.budget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Budget alloué
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Form */}
      <motion.div variants={itemVariants}>
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Sauvegarder les modifications"
          onCancel={handleCancel}
        />
      </motion.div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer définitivement cet événement ?
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              ⚠️ Cette action est irréversible
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• L'événement sera définitivement supprimé</li>
              <li>• Toutes les données associées seront perdues</li>
              <li>• Cette action ne peut pas être annulée</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
      
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

export default EditEvent