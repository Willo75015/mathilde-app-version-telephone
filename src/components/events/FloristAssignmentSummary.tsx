import React from 'react'
import { Users, CheckCircle } from 'lucide-react'
import { Event } from '@/types'

interface FloristAssignmentSummaryProps {
  event: Event
  variant?: 'compact' | 'detailed'
  showMissing?: boolean
}

/**
 * Composant pour afficher un résumé propre des assignations de fleuristes
 * SUPPRIME l'affichage des statuts "en attente" et "refusé" comme demandé
 */
export const FloristAssignmentSummary: React.FC<FloristAssignmentSummaryProps> = ({
  event,
  variant = 'compact',
  showMissing = true
}) => {
  const assignedFlorists = event.assignedFlorists || []
  const requiredCount = event.floristsRequired || 2
  
  // ✅ COMPTER SEULEMENT LES CONFIRMÉS (plus d'affichage "en attente" ou "refusé")
  const confirmedCount = assignedFlorists.filter(f => 
    f.isConfirmed || f.status === 'confirmed'
  ).length
  
  const missingCount = Math.max(0, requiredCount - confirmedCount)
  const isComplete = confirmedCount >= requiredCount
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          🌸 Fleuristes : {confirmedCount}/{requiredCount}
        </span>
        {isComplete && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
        {!isComplete && showMissing && (
          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            {missingCount} manquant{missingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    )
  }
  
  // Variant 'detailed'
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Fleuristes assignés
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-bold ${
            isComplete ? 'text-green-600' : 'text-orange-600'
          }`}>
            {confirmedCount}/{requiredCount}
          </span>
          {isComplete && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${Math.min((confirmedCount / requiredCount) * 100, 100)}%` }}
        />
      </div>
      
      {/* Liste des fleuristes confirmés */}
      {confirmedCount > 0 && (
        <div className="space-y-1">
          {assignedFlorists
            .filter(f => f.isConfirmed || f.status === 'confirmed')
            .map((florist, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600">
                  {florist.floristName || `Fleuriste ${florist.floristId}`}
                </span>
              </div>
            ))
          }
        </div>
      )}
      
      {/* Message d'état */}
      {!isComplete && showMissing && (
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          ⚠️ Il manque {missingCount} fleuriste{missingCount > 1 ? 's' : ''} confirmé{missingCount > 1 ? 's' : ''}
        </div>
      )}
      
      {isComplete && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          ✅ Équipe complète et confirmée
        </div>
      )}
    </div>
  )
}

export default FloristAssignmentSummary