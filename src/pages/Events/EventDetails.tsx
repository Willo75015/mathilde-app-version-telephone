import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Edit, Share, Calendar, MapPin, User, 
  Phone, Mail, Euro, Clock, Flower2, Camera,
  CheckCircle2, AlertCircle, XCircle, Loader2
} from 'lucide-react'
import { useEvents, useClients } from '@/contexts/AppContext'
import { Event, EventStatus } from '@/types'
import EventDetails from '@/components/events/EventDetails'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Toast from '@/components/ui/Toast'

interface EventDetailsPageProps {
  eventId: string
}

const EventDetailsPage: React.FC<EventDetailsPageProps> = ({ eventId }) => {
  const { events, updateEvent } = useEvents()
  const { clients } = useClients()
  const [event, setEvent] = useState<Event | null>(null)
  const [client, setClient] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  
  // Find event and client
  useEffect(() => {
    const foundEvent = events.find(e => e.id === eventId)
    if (foundEvent) {
      setEvent(foundEvent)
      const foundClient = clients.find(c => c.id === foundEvent.clientId)
      setClient(foundClient)
    } else {
      // Event not found, redirect
      window.location.href = '/events'
    }
  }, [eventId, events, clients])
  
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
  
  const handleStatusChange = async (newStatus: EventStatus) => {
    if (!event) return
    
    setIsUpdatingStatus(true)
    try {
      await updateEvent(event.id, { status: newStatus })
      setEvent({ ...event, status: newStatus })
      setToastMessage(`Statut mis à jour: ${newStatus}`)
      setShowToast(true)
    } catch (error) {
      console.error('Error updating status:', error)
      setToastMessage('Erreur lors de la mise à jour du statut')
      setShowToast(true)
    } finally {
      setIsUpdatingStatus(false)
    }
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
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
        setToastMessage('Lien copié dans le presse-papiers')
        setShowToast(true)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }
  
  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case EventStatus.CONFIRMED:
        return <CheckCircle2 className="w-4 h-4" />
      case EventStatus.IN_PROGRESS:
        return <Loader2 className="w-4 h-4 animate-spin" />
      case EventStatus.COMPLETED:
        return <CheckCircle2 className="w-4 h-4" />
      case EventStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }
  
  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.CONFIRMED:
        return 'bg-green-500'
      case EventStatus.IN_PROGRESS:
        return 'bg-blue-500'
      case EventStatus.COMPLETED:
        return 'bg-purple-500'
      case EventStatus.CANCELLED:
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
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
            href="/events"
          >
            Retour aux événements
          </Button>
          
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {event.title}
              </h1>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(event.status)} text-white`}
              >
                <span className="flex items-center space-x-1">
                  {getStatusIcon(event.status)}
                  <span>{event.status}</span>
                </span>
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {event.description}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share className="w-4 h-4" />}
            onClick={handleShare}
          >
            Partager
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit className="w-4 h-4" />}
            href={`/events/${eventId}/edit`}
          >
            Modifier
          </Button>
        </div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actions rapides
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {event.status !== EventStatus.CONFIRMED && event.status !== EventStatus.COMPLETED && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(EventStatus.CONFIRMED)}
                isLoading={isUpdatingStatus}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirmer
              </Button>
            )}
            
            {event.status === EventStatus.CONFIRMED && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(EventStatus.IN_PROGRESS)}
                isLoading={isUpdatingStatus}
                leftIcon={<Loader2 className="w-4 h-4" />}
              >
                Commencer
              </Button>
            )}
            
            {event.status === EventStatus.IN_PROGRESS && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(EventStatus.COMPLETED)}
                isLoading={isUpdatingStatus}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Terminer
              </Button>
            )}
            
            {event.status !== EventStatus.CANCELLED && event.status !== EventStatus.COMPLETED && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(EventStatus.CANCELLED)}
                isLoading={isUpdatingStatus}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Annuler
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informations de l'événement
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.date.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Heure</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.time}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lieu</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.location}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Euro className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.budget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Flower Selection */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Flower2 className="w-5 h-5" />
                <span>Sélection de fleurs</span>
              </h3>
              
              {event.flowers && event.flowers.length > 0 ? (
                <div className="space-y-3">
                  {event.flowers.map((flower, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                          <Flower2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Fleur ID: {flower.flowerId}
                          </p>
                          {flower.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {flower.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        Qté: {flower.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Flower2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune fleur sélectionnée</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    href={`/events/${eventId}/edit`}
                  >
                    Ajouter des fleurs
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
          
          {/* Notes */}
          {event.notes && (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {event.notes}
                </p>
              </Card>
            </motion.div>
          )}
        </div>
        
        {/* Right Column - Client Info */}
        <div className="space-y-6">
          {/* Client Information */}
          {client && (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informations client</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {client.firstName} {client.lastName}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <a 
                        href={`mailto:${client.email}`}
                        className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                      <a 
                        href={`tel:${client.phone}`}
                        className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                    <div className="text-gray-900 dark:text-white">
                      <p>{client.address.street}</p>
                      <p>{client.address.postalCode} {client.address.city}</p>
                      <p>{client.address.country}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    href={`/clients/${client.id}`}
                  >
                    Voir le profil client
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
          
          {/* Event Gallery */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Galerie</span>
              </h3>
              
              {event.images && event.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {event.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Event image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune image</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    href={`/events/${eventId}/edit`}
                  >
                    Ajouter des images
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </motion.div>
  )
}

export default EventDetailsPage