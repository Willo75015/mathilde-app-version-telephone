import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2, User, Calendar } from 'lucide-react'
import { useClients, useEvents } from '@/contexts/AppContext'
import { Client } from '@/types'
import { ClientValidationSchema, DataSanitizer } from '@/utils/validation'
import ClientForm from '@/components/forms/ClientForm'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'
import Modal from '@/components/ui/Modal'

interface EditClientProps {
  clientId: string
  navigate: (page: string, params?: any) => void
}

const EditClient: React.FC<EditClientProps> = ({ clientId, navigate }) => {
  const { clients, updateClient, deleteClient, isLoading } = useClients()
  const { getEventsByClient } = useEvents()
  const [client, setClient] = useState<Client | null>(null)
  const [clientEvents, setClientEvents] = useState<any[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Find client and their events
  useEffect(() => {
    const foundClient = clients.find(c => c.id === clientId)
    if (foundClient) {
      setClient(foundClient)
      const events = getEventsByClient(clientId)
      setClientEvents(events)
    } else {
      // Client not found, redirect
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'clients' } }))
    }
  }, [clientId, clients, getEventsByClient])
  
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
  
  const handleSubmit = async (formData: any) => {
    if (!client) return
    
    setIsUpdating(true)
    try {
      // Validate and sanitize data
      const sanitizedData = DataSanitizer.validateAndSanitize(formData, ClientValidationSchema)
      
      // Update client
      await updateClient(client.id, sanitizedData)
      
      // Show success message
      setToastMessage('Client mis à jour avec succès !')
      setToastType('success')
      setShowToast(true)
      
    } catch (error) {
      console.error('Error updating client:', error)
      setToastMessage('Erreur lors de la mise à jour du client')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleDelete = async () => {
    if (!client) return
    
    // Check if client has events
    if (clientEvents.length > 0) {
      setToastMessage('Impossible de supprimer un client ayant des événements')
      setToastType('error')
      setShowToast(true)
      setShowDeleteModal(false)
      return
    }
    
    setIsDeleting(true)
    try {
      await deleteClient(client.id)
      
      setToastMessage('Client supprimé avec succès')
      setToastType('success')
      setShowToast(true)
      
      // Redirect after short delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'clients' } }))
      }, 2000)
      
    } catch (error) {
      console.error('Error deleting client:', error)
      setToastMessage('Erreur lors de la suppression du client')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }
  
  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les modifications non sauvegardées seront perdues.')) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'clients' } }))
    }
  }
  
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du client...</p>
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
            href={`/clients/${clientId}`}
          >
            Retour
          </Button>
          
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Modifier le client
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {client.firstName} {client.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            href={`/clients/${clientId}`}
          >
            Voir le profil
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteModal(true)}
            disabled={clientEvents.length > 0}
          >
            Supprimer
          </Button>
        </div>
      </motion.div>
      
      {/* Client Info Banner */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Client depuis: {client.createdAt.toLocaleDateString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Dernière modification: {client.updatedAt.toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {clientEvents.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                événement{clientEvents.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Form */}
      <motion.div variants={itemVariants}>
        <ClientForm
          initialData={client}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          submitLabel="Sauvegarder les modifications"
          onCancel={handleCancel}
          onSuccess={() => {
            // Success is handled in handleSubmit, no need to do anything here
          }}
        />
      </motion.div>
      
      {/* Client Events Summary */}
      {clientEvents.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Événements associés ({clientEvents.length})</span>
            </h3>
            
            <div className="space-y-3">
              {clientEvents.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.date.toLocaleDateString()} - {event.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.budget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {event.status}
                    </div>
                  </div>
                </div>
              ))}
              
              {clientEvents.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    href={`/clients/${clientId}`}
                  >
                    Voir tous les événements ({clientEvents.length})
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer définitivement ce client ?
          </p>
          
          {clientEvents.length > 0 ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ Suppression impossible
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Ce client a {clientEvents.length} événement{clientEvents.length > 1 ? 's' : ''} associé{clientEvents.length > 1 ? 's' : ''}. 
                Vous devez d'abord supprimer ou réassigner ces événements avant de pouvoir supprimer le client.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ Cette action est irréversible
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Le client sera définitivement supprimé</li>
                <li>• Toutes les données associées seront perdues</li>
                <li>• Cette action ne peut pas être annulée</li>
              </ul>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            {clientEvents.length === 0 && (
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Supprimer définitivement
              </Button>
            )}
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

export default EditClient