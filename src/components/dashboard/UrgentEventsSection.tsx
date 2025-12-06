import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Users,
  Calendar, User, MapPin, X, ArrowRight
} from 'lucide-react'
import { Event, EventStatus } from '@/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface UrgentEventsSectionProps {
  urgentEvents: (Event & { urgency: any })[]
  totalUrgentCount: number
  showMoreUrgent: boolean
  onToggleShowMore: () => void
  onEventSelect: (event: Event) => void
  onEventEdit?: (event: Event) => void
  onAssignFlorist?: (event: Event) => void
  onCancelEvent?: (eventId: string) => void
  navigate?: (page: string, params?: any) => void
}

const UrgentEventsSection: React.FC<UrgentEventsSectionProps> = ({
  urgentEvents,
  totalUrgentCount,
  showMoreUrgent,
  onToggleShowMore,
  onAssignFlorist,
  onCancelEvent,
  navigate
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [eventToCancel, setEventToCancel] = useState<Event | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Demain ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig = {
      [EventStatus.DRAFT]: { label: '📝 À planifier', color: 'bg-gray-100 text-gray-800' },
      [EventStatus.PLANNING]: { label: '📋 En planification', color: 'bg-orange-100 text-orange-800' },
      [EventStatus.CONFIRMED]: { label: '✅ Confirmé', color: 'bg-blue-100 text-blue-800' },
      [EventStatus.IN_PROGRESS]: { label: '🔄 En cours', color: 'bg-amber-100 text-amber-800' },
      [EventStatus.COMPLETED]: { label: '🎉 Terminé', color: 'bg-pink-100 text-pink-800' },
      [EventStatus.INVOICED]: { label: '💼 Facturé', color: 'bg-purple-100 text-purple-800' },
      [EventStatus.PAID]: { label: '💰 Payé', color: 'bg-green-100 text-green-800' },
      [EventStatus.CANCELLED]: { label: '❌ Annulé', color: 'bg-red-100 text-red-800' }
    }
    return statusConfig[status] || statusConfig[EventStatus.DRAFT]
  }

  // Gérer l'assignation de fleuriste
  const handleAssignFlorist = (event: Event) => {
    if (onAssignFlorist) {
      onAssignFlorist(event)
    } else {
      console.log('🌸 Assigner fleuriste pour:', event.title)
    }
  }

  // Gérer l'annulation d'événement
  const handleCancelEvent = (event: Event) => {
    setEventToCancel(event)
    setShowCancelModal(true)
  }

  const confirmCancelEvent = () => {
    if (eventToCancel) {
      setShowCancelModal(false)
      setShowConfirmModal(true)
    }
  }

  const finalCancelEvent = () => {
    if (eventToCancel && onCancelEvent) {
      onCancelEvent(eventToCancel.id)
      setShowConfirmModal(false)
      setEventToCancel(null)
      
      // Afficher une notification de succès
      console.log(`Événement "${eventToCancel.title}" annulé et archivé.`)
    }
  }

  // Fonction helper pour calculer les statistiques de fleuristes
  const getFloristStats = (event: Event) => {
    const allAssigned = event.assignedFlorists || []
    const required = event.floristsRequired || 1
    
    // Séparer par statut réel
    const confirmedFlorists = allAssigned.filter(f => 
      f.status === 'confirmed' || f.isConfirmed === true
    )
    const pendingFlorists = allAssigned.filter(f => 
      f.status === 'pending' || (!f.status && !f.isConfirmed)
    )
    const refusedFlorists = allAssigned.filter(f =>
      f.status === 'refused'
    )
    
    const confirmed = confirmedFlorists.length
    const pending = pendingFlorists.length
    const refused = refusedFlorists.length
    const totalAssigned = allAssigned.length
    const missing = Math.max(0, required - confirmed)
    
    return {
      confirmed,
      pending,
      refused,
      totalAssigned,
      required,
      missing,
      isComplete: confirmed >= required,
      hasAllFlorists: totalAssigned >= required,
      // 🎯 LOGIQUE SIMPLIFIÉE : Urgent = manque des fleuristes confirmés
      isUrgent: missing > 0
    }
  }

  // Fonction pour rendre une carte d'événement
  const renderEventCard = (event: Event, statusBadge: any, floristStats: any, isUrgent: boolean) => {
    return (
      <>
        {/* Header avec date et montant */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(event.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {event.budget.toLocaleString('fr-FR')}€
            </div>
            <div className="text-xs text-gray-500">
              1 événement
            </div>
          </div>
        </div>

        {/* Titre et statut */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h3>
            </div>
            <div className="text-lg font-bold text-green-600">
              {event.budget.toLocaleString('fr-FR')}€
            </div>
          </div>
          <div className="ml-4">
            <span className={`px-3 py-1 rounded-md text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3">
            <User className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Client :</span> {event.clientName || 'Client à définir'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Date :</span> {formatDate(event.date)}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Horaires :</span> 14:00 - 16:00
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Lieu :</span> {event.location}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
              <span className="text-xs text-white font-bold">🌸</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Fleuristes requis :</span> {floristStats.confirmed}/{floristStats.required}
            </span>
            {floristStats.missing > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {floristStats.missing} manquant{floristStats.missing > 1 ? 's' : ''}
              </span>
            )}
            {event.status === EventStatus.DRAFT && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                À planifier
              </span>
            )}
          </div>
        </div>

        {/* Assignation fleuriste */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JM</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Jean Moreau
            </span>
            <div className="ml-auto flex space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-2">
          {/* Bouton Assigner si des fleuristes manquent OU statut DRAFT */}
          {floristStats.isUrgent && (
            <Button 
              variant="primary" 
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              onClick={(e) => {
                e.stopPropagation()
                handleAssignFlorist(event)
              }}
            >
              {event.status === EventStatus.DRAFT ? 
                '📝 Finaliser la Planification' : 
                `+ Assigner Fleuriste (${floristStats.missing} manquant${floristStats.missing > 1 ? 's' : ''})`
              }
            </Button>
          )}
          
          {/* Si tout est organisé, bouton de gestion */}
          {!floristStats.isUrgent && (
            <Button 
              variant="primary" 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={(e) => {
                e.stopPropagation()
                handleAssignFlorist(event)
              }}
            >
              ✅ Gérer les Fleuristes ({floristStats.confirmed}/{floristStats.required})
            </Button>
          )}
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation()
                handleCancelEvent(event)
              }}
            >
              Annuler Client
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-10 h-8 p-0 border-gray-300"
            >
              <span className="text-gray-600">⋯</span>
            </Button>
          </div>
        </div>

        {/* Footer avec boutons verts */}
        <div className="flex space-x-2 mt-4">
          <Button 
            variant="primary"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={(e) => {
              e.stopPropagation()
              navigate?.('events', { mode: 'create' })
            }}
          >
            + Nouvel Événement
          </Button>
          
          <Button 
            variant="outline"
            className="px-4 border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={(e) => {
              e.stopPropagation()
              navigate?.('events', { filter: 'urgent' })
            }}
          >
            ⚠ Traiter Urgent
          </Button>
        </div>
      </>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-red-500">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                🚨 Urgences & Actions Immédiates
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Événements prioritaires nécessitant votre attention
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
              {urgentEvents.length} / {totalUrgentCount} urgent{totalUrgentCount > 1 ? 's' : ''}
            </span>
            
            {/* Bouton Voir plus / Voir moins */}
            {totalUrgentCount > 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleShowMore}
                leftIcon={showMoreUrgent ? <AlertTriangle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              >
                {showMoreUrgent ? 'Voir moins' : `Voir tous (${totalUrgentCount - 6} de plus)`}
              </Button>
            )}
            
            {/* Bouton Voir tous dans l'onglet */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate?.('events', { filter: 'urgent' })}
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Onglet Événements
            </Button>
          </div>
        </div>
        
        {urgentEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune urgence ! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tous vos événements sont bien organisés
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              // Séparer les événements en 2 groupes selon les VRAIS critères d'urgence
              const urgentEvents_real = urgentEvents.filter(event => {
                const floristStats = getFloristStats(event)
                // URGENCE = fleuristes non confirmés
                return floristStats.isUrgent
              })
              
              // 🔥 TRI PAR DATE : Événements urgents (manque fleuristes) par ordre chronologique
              urgentEvents_real.sort((a, b) => {
                // 🎯 LOGIQUE BILL : Tous les événements urgents (manque fleuristes) 
                // sont triés par DATE LA PLUS PROCHE en premier
                return new Date(a.date).getTime() - new Date(b.date).getTime()
              })
              
              const normalEvents = urgentEvents.filter(event => {
                const floristStats = getFloristStats(event)
                // NORMAL = tous fleuristes confirmés ET statut finalisé
                return !floristStats.isUrgent
              })
              
              // 🔥 TRI PAR DATE : Événements normaux (organisés) aussi par ordre chronologique
              normalEvents.sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime()
              })
              
              return (
                <>
                  {/* GROUPE 1 : URGENCES RÉELLES (fleuristes non confirmés OU à planifier) */}
                  {urgentEvents_real.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pb-2 border-b border-red-200 dark:border-red-800">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
                          🚨 Urgences - Action requise ({urgentEvents_real.length})
                        </h3>
                      </div>
                      
                      {urgentEvents_real.map((event) => {
                        const statusBadge = getStatusBadge(event.status)
                        const floristStats = getFloristStats(event)
                        
                        return (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm border-l-4 border-red-500 p-6 hover:shadow-md transition-all duration-200"
                          >
                            {/* Contenu de la carte urgente */}
                            {renderEventCard(event, statusBadge, floristStats, true)}
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                  
                  {/* SÉPARATEUR si les deux groupes existent */}
                  {urgentEvents_real.length > 0 && normalEvents.length > 0 && (
                    <div className="flex items-center space-x-4 py-4">
                      <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                        Événements organisés
                      </span>
                      <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                  )}
                  
                  {/* GROUPE 2 : ÉVÉNEMENTS NORMAUX (tous confirmés ET finalisés) */}
                  {normalEvents.length > 0 && (
                    <div className="space-y-4">
                      {urgentEvents_real.length > 0 && (
                        <div className="flex items-center space-x-2 pb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                            ✅ Prochains événements organisés ({normalEvents.length})
                          </h3>
                        </div>
                      )}
                      
                      {normalEvents.map((event) => {
                        const statusBadge = getStatusBadge(event.status)
                        const floristStats = getFloristStats(event)
                        
                        return (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 opacity-90"
                          >
                            {/* Contenu de la carte normale */}
                            {renderEventCard(event, statusBadge, floristStats, false)}
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </>
              )
            })()}
            
            {/* Bouton voir plus/moins */}
            {totalUrgentCount > 6 && (
              <div className="text-center pt-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onToggleShowMore}
                  rightIcon={<ArrowRight className={`w-4 h-4 transition-transform ${showMoreUrgent ? 'rotate-90' : ''}`} />}
                >
                  {showMoreUrgent ? 'Voir moins d\'événements' : `Voir tous les événements (${totalUrgentCount - 6} de plus)`}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmation d'annulation */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirmer l'annulation"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Êtes-vous sûr de vouloir annuler cet événement ?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {eventToCancel?.title}
              </p>
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-6">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Cette action annulera l'événement et l'enverra dans les archives. 
              Le client sera notifié de l'annulation.
            </p>
          </div>
          
          <div className="flex space-x-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelModal(false)}
            >
              Non, garder l'événement
            </Button>
            <Button 
              variant="primary"
              className="bg-orange-500 hover:bg-orange-600"
              onClick={confirmCancelEvent}
            >
              Oui, continuer l'annulation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmation finale */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Dernière confirmation"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vous êtes sur le point d'effacer cet événement
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Cette action est irréversible.
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Événement à supprimer :
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• <strong>Titre :</strong> {eventToCancel?.title}</li>
              <li>• <strong>Client :</strong> {eventToCancel?.clientName || 'Client à définir'}</li>
              <li>• <strong>Date :</strong> {eventToCancel ? formatDate(eventToCancel.date) : ''}</li>
              <li>• <strong>Budget :</strong> {eventToCancel?.budget.toLocaleString()}€</li>
            </ul>
          </div>
          
          <div className="flex space-x-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="primary"
              className="bg-red-500 hover:bg-red-600"
              onClick={finalCancelEvent}
            >
              Confirmer la suppression
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UrgentEventsSection