import React from 'react'
import { Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react'
import { Florist, FloristAvailability, Event } from '@/types'
import { useFloristStatus } from '@/utils/floristStatus'

interface FloristStatusBadgeProps {
  florist: Florist
  assignedEvents?: Event[]
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const FloristStatusBadge: React.FC<FloristStatusBadgeProps> = ({
  florist,
  assignedEvents = [],
  showDetails = false,
  size = 'md'
}) => {
  const {
    currentStatus,
    statusReason,
    nextStatusChange,
    scheduleSummary,
    isOnMission,
    isUnavailable,
    isAvailable
  } = useFloristStatus(florist, assignedEvents)

  const getStatusConfig = () => {
    switch (currentStatus) {
      case FloristAvailability.AVAILABLE:
        return {
          color: 'bg-green-50 text-green-700 border-green-400 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600',
          icon: <CheckCircle className="w-3 h-3" />,
          dot: 'bg-green-500',
          emoji: '✅'
        }
      case FloristAvailability.ON_MISSION:
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600',
          icon: <Calendar className="w-3 h-3" />,
          dot: 'bg-blue-500',
          emoji: '📅'
        }
      case FloristAvailability.UNAVAILABLE:
        return {
          color: 'bg-red-50 text-red-700 border-red-400 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600',
          icon: <AlertCircle className="w-3 h-3" />,
          dot: 'bg-red-500',
          emoji: '🚫'
        }
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-400 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600',
          icon: <Clock className="w-3 h-3" />,
          dot: 'bg-gray-500',
          emoji: '❓'
        }
    }
  }

  const config = getStatusConfig()
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  }

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className="space-y-2">
      {/* Badge principal */}
      <div className={`
        inline-flex items-center rounded-full font-semibold border-2 transition-all hover:scale-105
        ${config.color} ${sizeClasses[size]}
      `}>
        <span className={`inline-block rounded-full mr-2 ${config.dot} ${dotSizeClasses[size]}`}></span>
        <span className="mr-1">{config.emoji}</span>
        <span>{getStatusText()}</span>
      </div>

      {/* Détails supplémentaires - AMÉLIORATION : Affichage automatique selon le statut */}
      {(showDetails || currentStatus !== FloristAvailability.AVAILABLE) && (
        <div className="space-y-2 mt-3">
          
          {/* MISSIONS EN COURS - Affichage automatique */}
          {currentStatus === FloristAvailability.ON_MISSION && assignedEvents.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500">
              <p className="font-semibold text-blue-700 dark:text-blue-300 flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Mission{assignedEvents.length > 1 ? 's' : ''} en cours :</span>
              </p>
              {assignedEvents.map((event) => (
                <div key={event.id} className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 mb-2 last:mb-0">
                  <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                    🎯 {event.title}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {event.date.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })} de {event.date.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {event.endDate && ` à ${event.endDate.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}`}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* PÉRIODES D'INDISPONIBILITÉ - Affichage automatique */}
          {currentStatus === FloristAvailability.UNAVAILABLE && florist.unavailabilityPeriods && florist.unavailabilityPeriods.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border-l-4 border-red-500">
              <p className="font-semibold text-red-700 dark:text-red-300 flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Période{florist.unavailabilityPeriods.length > 1 ? 's' : ''} d'indisponibilité :</span>
              </p>
              {florist.unavailabilityPeriods
                .filter(period => period.isActive)
                .map((period) => (
                <div key={period.id} className="bg-white/50 dark:bg-gray-800/50 rounded-md p-2 mb-2 last:mb-0">
                  <p className="font-medium text-red-800 dark:text-red-200 text-sm">
                    🚫 {period.reason}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Du {period.startDate.toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })} au {period.endDate.toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </p>
                  {/* Calcul des jours restants */}
                  {(() => {
                    const now = new Date()
                    const daysLeft = Math.ceil((period.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    if (daysLeft > 0) {
                      return (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                          ⏰ Encore {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                        </p>
                      )
                    }
                    return null
                  })()}
                </div>
              ))}
            </div>
          )}
          
          {/* Détails complets uniquement si showDetails est true */}
          {showDetails && (
            <>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  📝 {statusReason}
                </p>
                
                {nextStatusChange && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Jusqu'au {nextStatusChange.toLocaleDateString('fr-FR')} à {nextStatusChange.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                )}
                
                {scheduleSummary.thisWeek > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    📅 {scheduleSummary.thisWeek} événement(s) cette semaine
                  </p>
                )}
                
                {scheduleSummary.nextUnavailability && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    🚫 Prochaine indispo: {scheduleSummary.nextUnavailability.startDate.toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )

  function getStatusText(): string {
    switch (currentStatus) {
      case FloristAvailability.AVAILABLE:
        return 'Disponible'
      case FloristAvailability.ON_MISSION:
        return 'Programmé sur une mission'
      case FloristAvailability.UNAVAILABLE:
        return 'Indisponible'
      default:
        return 'Statut inconnu'
    }
  }
}

export default FloristStatusBadge