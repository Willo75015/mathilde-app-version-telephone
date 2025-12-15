import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, CheckCircle, XCircle, MessageSquare, Trash2, 
  AlertCircle, Clock, MapPin
} from 'lucide-react'
import { Event, UnavailabilityPeriod } from '@/types'
import { isDateUnavailable } from '@/utils/floristAvailability'
import Button from '@/components/ui/Button'
import ContactFloristModal from '@/components/modals/ContactFloristModal'

// Types pour le composant FloristCard réutilisable
interface Florist {
  id: string
  name: string
  role: string
  status: 'available' | 'unavailable' | 'busy'
  avatar?: string
  unavailabilityPeriods?: UnavailabilityPeriod[]
}

interface FloristCardProps {
  florist: Florist
  status?: 'pending' | 'confirmed' | 'refused' | 'available' | 'not_selected' // 🆕
  allEvents?: Event[]
  currentEventId?: string
  currentEventDate?: Date
  onStatusChange?: (status: 'pending' | 'confirmed' | 'refused' | 'not_selected') => void // 🆕
  onRemove?: () => void
  onContact?: () => void
  showMissionDetails?: boolean
  showActions?: boolean
  variant?: 'default' | 'compact' | 'selection'
  className?: string
  preWrittenMessage?: string // 🆕 Message pré-écrit pour le contact
}

// Fonction pour obtenir le statut du fleuriste
const getFloristStatus = (
  florist: Florist, 
  allEvents: Event[] = [],
  targetDate: Date = new Date()
): {
  status: 'available' | 'on_mission' | 'unavailable'
  currentMissions: Event[]
  totalMissions: number
  unavailabilityReason?: string
} => {
  const targetDateString = targetDate.toDateString()
  
  // 🆕 VÉRIFIER LES INDISPONIBILITÉS EN PRIORITÉ
  if (florist.unavailabilityPeriods?.length) {
    const unavailabilityCheck = isDateUnavailable(targetDate, florist.unavailabilityPeriods)
    if (unavailabilityCheck.isUnavailable) {
      return {
        status: 'unavailable',
        currentMissions: [],
        totalMissions: 0,
        unavailabilityReason: unavailabilityCheck.reason
      }
    }
  }
  
  // Trouver toutes les missions en cours (pour la date cible) - EXCLURE les événements annulés/terminés
  const currentMissions = allEvents.filter(event => {
    const eventDateStr = (event.date instanceof Date ? event.date : new Date(event.date)).toDateString()
    if (eventDateStr !== targetDateString) return false
    
    // 🔧 CORRECTION : Exclure les événements non actifs
    if (event.status === 'cancelled' || event.status === 'completed' || event.status === 'paid' || event.status === 'invoiced') {
      return false
    }
    
    return event.assignedFlorists?.some(af => 
      af.floristId === florist.id && (af.isConfirmed || af.status === 'confirmed')
    )
  })
  
  // Compter le total des missions ACTIVES (toutes dates confondues)
  const totalMissions = allEvents.filter(event => {
    // 🔧 CORRECTION : Exclure les événements non actifs du comptage total
    if (event.status === 'cancelled' || event.status === 'completed' || event.status === 'paid' || event.status === 'invoiced') {
      return false
    }
    
    return event.assignedFlorists?.some(af => 
      af.floristId === florist.id && (af.isConfirmed || af.status === 'confirmed')
    )
  }).length
  
  let status: 'available' | 'on_mission' | 'unavailable' = 'available'
  
  if (florist.status === 'unavailable') {
    status = 'unavailable'
  } else if (currentMissions.length > 0) {
    status = 'on_mission'
  }
  
  return {
    status,
    currentMissions,
    totalMissions
  }
}

// Fonction pour vérifier les conflits
const checkFloristConflicts = (
  floristId: string, 
  currentEventId: string, 
  eventDate: Date, 
  allEvents: Event[]
): { hasConflict: boolean; conflictingEvents: Event[] } => {
  const targetDate = eventDate.toDateString()
  
  const conflictingEvents = allEvents.filter(event => {
    // Exclure l'événement actuel
    if (event.id === currentEventId) return false
    
    // 🔧 CORRECTION CRITIQUE : Exclure les événements annulés, terminés et payés
    if (event.status === 'cancelled' || event.status === 'completed' || event.status === 'paid' || event.status === 'invoiced') {
      return false
    }
    
    // Vérifier la date
    const eventDateStr = (event.date instanceof Date ? event.date : new Date(event.date)).toDateString()
    if (eventDateStr !== targetDate) return false
    
    // Vérifier si le fleuriste est assigné et confirmé
    const hasFlorist = event.assignedFlorists?.some(af => 
      af.floristId === floristId && (af.isConfirmed || af.status === 'confirmed')
    )
    
    return hasFlorist
  })
  
  return {
    hasConflict: conflictingEvents.length > 0,
    conflictingEvents
  }
}

/**
 * Composant FloristCard réutilisable avec affichage automatique des missions
 * 
 * @param florist - Données du fleuriste
 * @param status - Statut de l'assignation (pending, confirmed, refused, available)
 * @param allEvents - Tous les événements pour calculer les missions
 * @param showMissionDetails - Afficher automatiquement les détails de mission (par défaut: true)
 * @param showActions - Afficher les boutons d'action (par défaut: true)
 * @param variant - Variante d'affichage (default, compact, selection)
 */
const FloristCard: React.FC<FloristCardProps> = ({
  florist,
  status = 'available',
  allEvents = [],
  currentEventId = '',
  currentEventDate = new Date(),
  onStatusChange,
  onRemove,
  onContact,
  showMissionDetails = true,
  showActions = true,
  variant = 'default',
  className = '',
  preWrittenMessage // 🆕 Recevoir le message pré-écrit
}) => {
  const [showConflictWarning, setShowConflictWarning] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false) // 🆕
  
  const floristStatus = getFloristStatus(florist, allEvents, currentEventDate)
  const conflicts = currentEventId ? checkFloristConflicts(florist.id, currentEventId, currentEventDate, allEvents) : { hasConflict: false, conflictingEvents: [] }
  
  // Style de la carte selon le statut
  const getCardStyle = () => {
    if (floristStatus.status === 'on_mission') {
      return 'border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-900/20'
    }
    if (floristStatus.status === 'unavailable') {
      return 'border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20'
    }
    return 'border-l-4 border-green-400 bg-white dark:bg-gray-700'
  }
  
  // Icône de statut
  const getStatusIcon = () => {
    if (floristStatus.status === 'on_mission') return '⚠️'
    if (floristStatus.status === 'unavailable') return '❌'
    return '✅'
  }
  
  // Gestion des actions
  const handleConfirm = () => {
    // 🔧 NOUVELLE LOGIQUE : Popup si le fleuriste a des missions OU des conflits OU est indisponible
    if (floristStatus.status === 'unavailable' || conflicts.hasConflict || floristStatus.currentMissions.length > 0) {
      setShowConflictWarning(true)
    } else {
      onStatusChange?.('confirmed')
    }
  }
  
  const handleForceConfirm = () => {
    setShowConflictWarning(false)
    onStatusChange?.('confirmed')
  }
  
  const handleContact = () => {
    if (onContact) {
      onContact()
    } else {
      // 🆕 TOUS les messages passent par WhatsApp Web avec message adapté au statut
      if (currentEventId && allEvents) {
        const event = allEvents.find(e => e.id === currentEventId)
        if (event) {
          let message = ''
          
          // Message selon le statut du fleuriste
          switch (status) {
            case 'not_selected':
              message = `Bonjour ${florist.name.split(' ')[0]},\n\nL'événement "${event.title}" du ${event.date instanceof Date ? event.date.toLocaleDateString('fr-FR') : new Date(event.date).toLocaleDateString('fr-FR')} est pourvu.\n\nMerci pour votre disponibilité !\n\nMathilde Fleurs`
              break
              
            case 'confirmed':
              message = `Bonjour ${florist.name.split(' ')[0]},\n\nConfirmation pour l'événement "${event.title}" le ${event.date instanceof Date ? event.date.toLocaleDateString('fr-FR') : new Date(event.date).toLocaleDateString('fr-FR')} à ${event.time}.\n\nRendez-vous à : ${event.location}\n\nMerci !\n\nMathilde Fleurs`
              break
              
            case 'pending':
              message = `Bonjour ${florist.name.split(' ')[0]},\n\nÊtes-vous disponible pour l'événement "${event.title}" le ${event.date instanceof Date ? event.date.toLocaleDateString('fr-FR') : new Date(event.date).toLocaleDateString('fr-FR')} à ${event.time} ?\n\nLieu : ${event.location}\n\nMerci de me confirmer !\n\nMathilde Fleurs`
              break
              
            case 'refused':
              message = `Bonjour ${florist.name.split(' ')[0]},\n\nJ'ai bien noté que vous n'êtes pas disponible pour l'événement "${event.title}" le ${event.date instanceof Date ? event.date.toLocaleDateString('fr-FR') : new Date(event.date).toLocaleDateString('fr-FR')}.\n\nPas de souci ! À bientôt pour d'autres missions.\n\nMathilde Fleurs`
              break
              
            default:
              message = `Bonjour ${florist.name.split(' ')[0]},\n\nConcernant l'événement "${event.title}" le ${event.date instanceof Date ? event.date.toLocaleDateString('fr-FR') : new Date(event.date).toLocaleDateString('fr-FR')}...\n\nMathilde Fleurs`
              break
          }
          
          // Redirection vers WhatsApp Web
          const phoneNumber = "33658006143" // Numéro de Bill
          const encodedMessage = encodeURIComponent(message)
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
          
          console.log('📱 Redirection WhatsApp Web:', { 
            florist: florist.name, 
            status, 
            message: message.substring(0, 100) + '...' 
          })
          window.open(whatsappUrl, '_blank')
          return
        }
      }
      
      // Fallback si pas d'événement trouvé
      const fallbackMessage = `Bonjour ${florist.name.split(' ')[0]},\n\nComment allez-vous ?\n\nMathilde Fleurs`
      const phoneNumber = "33658006143"
      const encodedMessage = encodeURIComponent(fallbackMessage)
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
      
      window.open(whatsappUrl, '_blank')
    }
  }
  
  // Styles selon la variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-2'
      case 'selection':
        return 'p-3 hover:shadow-md transition-shadow cursor-pointer'
      default:
        return 'p-3'
    }
  }
  
  return (
    <>
      <div className={`
        flex flex-col rounded-lg border border-gray-200 dark:border-gray-600 
        ${getCardStyle()} ${getVariantClasses()} ${className}
      `}>
        {/* Section principale */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {florist.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            {/* Informations du fleuriste */}
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <span>
                  {florist.name}
                  {/* 🆕 COMPTEUR DE MISSIONS D'AUJOURD'HUI UNIQUEMENT */}
                  {floristStatus.currentMissions.length > 0 && (
                    <span className="text-gray-500 dark:text-gray-400 font-normal">
                      ({floristStatus.currentMissions.length})
                    </span>
                  )}
                </span>
                {floristStatus.status === 'on_mission' && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                    {getStatusIcon()} Sur mission
                  </span>
                )}
                {floristStatus.status === 'unavailable' && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                    {getStatusIcon()} {floristStatus.unavailabilityReason || 'Indisponible'}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2 mb-1">
                  <span>{florist.role}</span>
                  {/* 🆕 BOUTON "VOIR MISSION" VISIBLE SI LE FLEURISTE A DES MISSIONS AUJOURD'HUI */}
                  {floristStatus.currentMissions.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span>•</span>
                      <button
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={() => setShowConflictWarning(true)}
                        title="Voir les détails des missions d'aujourd'hui"
                      >
                        Voir mission{floristStatus.currentMissions.length > 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Badge de statut */}
            {status !== 'available' && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                status === 'refused' ? 'bg-red-100 text-red-800' :
                status === 'not_selected' ? 'bg-gray-100 text-gray-800' : // 🆕 Style pour "Non retenu"
                'bg-orange-100 text-orange-800'
              }`}>
                {status === 'confirmed' ? '✅ Confirmé' : 
                 status === 'refused' ? '❌ Refusé' :
                 status === 'not_selected' ? '📋 Non retenu' : // 🆕 Texte pour "Non retenu" 
                 '⏳ En attente'}
              </span>
            )}
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              {/* Contacter */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleContact}
                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                title="Contacter le fleuriste"
              >
                <MessageSquare className="w-4 h-4" />
              </motion.button>
              
              {/* Confirmer */}
              {onStatusChange && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleConfirm}
                  className={`p-2 rounded-full transition-colors ${
                    conflicts.hasConflict 
                      ? 'bg-orange-100 hover:bg-orange-200 text-orange-600' 
                      : 'bg-green-100 hover:bg-green-200 text-green-600'
                  }`}
                  title={conflicts.hasConflict ? "Confirmer malgré le conflit" : "Confirmer le fleuriste"}
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.button>
              )}
              
              {/* Refuser */}
              {onStatusChange && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onStatusChange('refused')}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                  title="Refuser le fleuriste"
                >
                  <XCircle className="w-4 h-4" />
                </motion.button>
              )}
              
              {/* Supprimer */}
              {onRemove && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onRemove}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Retirer de l'assignation"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* SECTION DES MISSIONS EN COURS SUPPRIMÉE - Remplacée par le bouton "Voir mission" */}
      </div>
      
      {/* Modal d'affichage des missions du fleuriste */}
      <AnimatePresence>
        {showConflictWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[70]"
            onClick={() => setShowConflictWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  📋 Statut de {florist.name}
                </h3>
                
                {/* Afficher l'indisponibilité si présente */}
                {floristStatus.status === 'unavailable' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium text-sm mb-2">
                      ❌ {florist.name} est indisponible ce jour-là
                    </p>
                    <p className="text-red-700 text-sm">
                      Raison : {floristStatus.unavailabilityReason || 'Période d\'indisponibilité'}
                    </p>
                  </div>
                )}
                
                {/* Afficher les missions en conflit s'il y en a */}
                {conflicts.hasConflict && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 font-medium text-sm mb-2">
                      ⚠️ Conflit détecté ! {florist.name} est déjà assigné(e) à {conflicts.conflictingEvents.length} événement{conflicts.conflictingEvents.length > 1 ? 's' : ''} le même jour.
                    </p>
                  </div>
                )}
                
                {/* Afficher un avertissement général si le fleuriste a des missions */}
                {!conflicts.hasConflict && floristStatus.status !== 'unavailable' && floristStatus.currentMissions.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium text-sm mb-2">
                      ℹ️ {florist.name} a déjà {floristStatus.currentMissions.length} mission{floristStatus.currentMissions.length > 1 ? 's' : ''} en cours ce jour-là.
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left max-h-60 overflow-y-auto">
                  {floristStatus.status === 'unavailable' ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🚫</div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {florist.name} est indisponible
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {floristStatus.unavailabilityReason || 'Période d\'indisponibilité'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {conflicts.hasConflict ? 'Mission(s) en conflit :' : 'Mission(s) actuelle(s) :'}
                      </h4>
                      
                      {/* Afficher les conflits en priorité */}
                      {conflicts.conflictingEvents.map(event => (
                        <div key={event.id} className="mb-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded border-l-4 border-orange-500">
                          <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                            <span>⚠️</span>
                            <span>{event.title}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            📅 {event.date instanceof Date ? event.date.toLocaleDateString('fr-FR') : new Date(event.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            🕒 {event.time} {event.location && `- 📍 ${event.location}`}
                          </div>
                        </div>
                      ))}
                      
                      {/* Afficher les autres missions actuelles (exclure les conflits déjà affichés) */}
                      {floristStatus.currentMissions
                        .filter(event => !conflicts.conflictingEvents.some(conflictEvent => conflictEvent.id === event.id))
                        .map(event => (
                        <div key={event.id} className="mb-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded border-l-4 border-blue-500">
                          <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                            <span>📋</span>
                            <span>{event.title}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            📅 {event.date instanceof Date ? event.date.toLocaleDateString('fr-FR') : new Date(event.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            🕒 {event.time} {event.location && `- 📍 ${event.location}`}
                          </div>
                        </div>
                      ))}
                      
                      {/* Message si aucune mission */}
                      {!conflicts.hasConflict && floristStatus.currentMissions.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          Aucune mission en cours ce jour-là
                        </p>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowConflictWarning(false)}
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  {/* Bouton de confirmation SI le fleuriste a des missions ET une fonction de changement de statut */}
                  {(floristStatus.status === 'unavailable' || conflicts.hasConflict || floristStatus.currentMissions.length > 0) && onStatusChange && (
                    <Button
                      variant="primary"
                      onClick={handleForceConfirm}
                      className={`flex-1 ${
                        floristStatus.status === 'unavailable' 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      {floristStatus.status === 'unavailable' ? 'Forcer l\'assignation' : 'Confirmer quand même'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 🆕 Modal de contact avec message pré-écrit */}
      <ContactFloristModal
        florist={{
          id: florist.id,
          name: florist.name,
          phone: '06 12 34 56 78', // TODO: Récupérer le vrai téléphone
          email: `${florist.name.toLowerCase().replace(' ', '.')}@example.com`, // TODO: Récupérer le vrai email
          preWrittenMessage: preWrittenMessage // 🆕 Passer le message pré-écrit
        }}
        event={currentEventId && allEvents ? {
          id: currentEventId,
          title: allEvents.find(e => e.id === currentEventId)?.title || 'Événement',
          date: currentEventDate || new Date()
        } : null}
        floristStatus={status || 'pending'}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  )
}

export default FloristCard