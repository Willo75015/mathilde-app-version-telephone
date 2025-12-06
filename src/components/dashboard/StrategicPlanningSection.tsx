import React from 'react'
import { 
  Calendar, AlertTriangle, CheckCircle,
  Users, Mail, Edit
} from 'lucide-react'
import { Event, EventStatus } from '@/types'
import Button from '@/components/ui/Button'

interface StrategicPlanningSectionProps {
  futureEvents: Event[]
  navigate?: (page: string, params?: any) => void
  onEventEdit?: (event: Event) => void // 🆕 Handler pour ouvrir le modal de modification
}

const StrategicPlanningSection: React.FC<StrategicPlanningSectionProps> = ({
  futureEvents,
  navigate,
  onEventEdit
}) => {
  // 🆕 Fonction helper pour calculer les statistiques de fleuristes (même logique que UrgentEventsSection)
  const getFloristStats = (event: Event) => {
    const allAssigned = event.assignedFlorists || []
    const required = event.floristsRequired || 1
    
    // Séparer par statut réel
    const confirmedFlorists = allAssigned.filter(f => 
      f.status === 'confirmed' || f.isConfirmed === true
    )
    const pending = allAssigned.filter(f => 
      f.status === 'pending' || (!f.status && !f.isConfirmed)
    ).length
    
    const confirmed = confirmedFlorists.length
    const missing = Math.max(0, required - confirmed)
    
    return {
      confirmed,
      pending,
      required,
      missing,
      isComplete: confirmed >= required,
      // 🎯 LOGIQUE BILL : Urgent = manque des fleuristes confirmés
      needsPlanning: missing > 0
    }
  }

  // 🔄 NOUVELLE LOGIQUE : À planifier = événements où il manque des fleuristes
  const eventsNeedingPlanning = futureEvents.filter(event => {
    const floristStats = getFloristStats(event)
    return floristStats.needsPlanning || event.status === EventStatus.DRAFT
  })
  
  // Les événements organisés = tous fleuristes confirmés ET statut finalisé
  const organizedEvents = futureEvents.filter(event => {
    const floristStats = getFloristStats(event)
    return !floristStats.needsPlanning && event.status !== EventStatus.DRAFT
  })
  
  // Calculer les métriques pour les 2 colonnes restantes
  const totalPipeline = futureEvents.reduce((sum, e) => sum + e.budget, 0)
  const planningNeededAmount = eventsNeedingPlanning.reduce((sum, e) => sum + e.budget, 0)
  const organizedAmount = organizedEvents.reduce((sum, e) => sum + e.budget, 0)

  // Calculer les jours jusqu'à l'événement
  const getDaysUntilEvent = (eventDate: Date | string) => {
    const date = eventDate instanceof Date ? eventDate : new Date(eventDate)
    return Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="bg-blue-500 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold text-white">Planification Stratégique</h2>
              <p className="text-blue-100 text-sm">Vision 30 jours - Anticipation business</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {totalPipeline.toLocaleString()}€
            </div>
            <div className="text-blue-100 text-sm">Pipeline 30j</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6">
        {futureEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Aucun événement planifié
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Commencez à planifier vos prochains événements
            </p>
            <Button
              variant="primary"
              onClick={() => navigate?.('events', { action: 'create' })}
            >
              Créer un événement
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Colonne 1: À Planifier (ORGANISATION REQUISE) */}
            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-orange-800 dark:text-orange-300 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>🌸 À Planifier</span>
                </h3>
                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                  {eventsNeedingPlanning.length}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                {eventsNeedingPlanning.slice(0, 4).map((event) => {
                  const daysUntil = getDaysUntilEvent(event.date)
                  const floristStats = getFloristStats(event)
                  
                  return (
                    <div key={event.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {event.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Client • {event.budget.toLocaleString()}€
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            {event.status === EventStatus.DRAFT ? 
                              '📝 Événement à confirmer' : 
                              `🌸 ${floristStats.missing} fleuriste${floristStats.missing > 1 ? 's' : ''} manquant${floristStats.missing > 1 ? 's' : ''}`
                            }
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          daysUntil <= 7 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          J-{daysUntil}
                        </span>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-xs"
                          leftIcon={<Users className="w-3 h-3" />}
                          onClick={() => {
                            // Logique assignation fleuriste
                            navigate?.('events', { eventId: event.id, action: 'assign-florists' })
                          }}
                        >
                          {event.status === EventStatus.DRAFT ? 'Planifier' : 'Assigner'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Mail className="w-3 h-3" />}
                          onClick={() => {
                            // Logique email client
                            navigate?.('communications', { action: 'email', eventId: event.id })
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                
                {eventsNeedingPlanning.length > 4 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate?.('events', { filter: 'needs-planning' })}
                    >
                      +{eventsNeedingPlanning.length - 4} autres
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <div className="text-lg font-bold text-orange-800 dark:text-orange-300">
                  {planningNeededAmount.toLocaleString()}€
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">CA nécessitant organisation</div>
              </div>
            </div>

            {/* Colonne 2: Organisés (ÉQUIPE COMPLÈTE) */}
            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>✅ Organisés</span>
                </h3>
                <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {organizedEvents.length}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                {organizedEvents.slice(0, 4).map((event) => {
                  const daysUntil = getDaysUntilEvent(event.date)
                  const floristStats = getFloristStats(event)
                  
                  return (
                    <div key={event.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {event.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Client • {event.budget.toLocaleString()}€
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            🌸 {floristStats.confirmed}/{floristStats.required} fleuriste{floristStats.required > 1 ? 's' : ''} confirmé{floristStats.confirmed > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          J-{daysUntil}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                        leftIcon={<Edit className="w-3 h-3" />}
                        onClick={() => {
                          // 🎯 LOGIQUE BILL : Ouvrir le modal de modification d'événement
                          onEventEdit?.(event)
                        }}
                      >
                        Modifier
                      </Button>
                    </div>
                  )
                })}
                
                {organizedEvents.length > 4 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate?.('events', { filter: 'organized' })}
                    >
                      +{organizedEvents.length - 4} autres
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <div className="text-lg font-bold text-green-800 dark:text-green-300">
                  {organizedAmount.toLocaleString()}€
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">CA organisé</div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default StrategicPlanningSection