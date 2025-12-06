import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle, XCircle, Clock, Users, MessageSquare,
  AlertTriangle, Plus
} from 'lucide-react'
import { useFlorists } from '@/contexts/AppContext'
import { Florist as GlobalFlorist } from '@/types'
import FloristCard from '@/components/ui/FloristCard'

// Type local pour la compatibilité avec FloristCard
interface LocalFlorist {
  id: string
  name: string
  role: string
  status: 'available' | 'unavailable' | 'busy'
  avatar?: string
}

// Helper pour convertir un fleuriste global vers le format local
const toLocalFlorist = (florist: GlobalFlorist): LocalFlorist => ({
  id: florist.id,
  name: `${florist.firstName} ${florist.lastName}`,
  role: 'Fleuriste',
  status: florist.availability === 'available' ? 'available' :
          florist.availability === 'unavailable' ? 'unavailable' : 'busy',
  avatar: florist.avatar
})

interface FloristAssignmentCompleteProps {
  editedEvent: any
  allEvents: any[]
  onUpdateFloristStatus: (floristId: string, status: string) => void
  onRemoveFlorist: (floristId: string) => void
  onAddFlorist: (florist: any) => void
}

export const FloristAssignmentComplete: React.FC<FloristAssignmentCompleteProps> = ({
  editedEvent,
  allEvents,
  onUpdateFloristStatus,
  onRemoveFlorist,
  onAddFlorist
}) => {
  const { florists } = useFlorists()
  
  // Helper pour obtenir les fleuristes par statut
  const getFloristsByStatus = (status: string) => {
    if (!editedEvent.assignedFlorists) return []
    return editedEvent.assignedFlorists.filter((assignment: any) => 
      assignment.status === status || 
      (status === 'confirmed' && assignment.isConfirmed)
    )
  }
  
  // Fleuristes disponibles (non assignés)
  const availableFlorists = useMemo(() => {
    const assignedIds = editedEvent.assignedFlorists?.map((a: any) => a.floristId) || []
    return florists.filter(florist => !assignedIds.includes(florist.id))
  }, [florists, editedEvent.assignedFlorists])
  
  // Statistiques
  const requiredFlorists = editedEvent.floristsRequired || 2
  const confirmedCount = getFloristsByStatus('confirmed').length
  const isComplete = confirmedCount >= requiredFlorists
  
  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">👥 Assignation des fleuristes</h3>
        <div className="text-sm text-gray-600">
          {confirmedCount}/{requiredFlorists} fleuristes
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${Math.min(100, (confirmedCount / requiredFlorists) * 100)}%` }}
        />
      </div>

      {/* Message de statut */}
      {isComplete ? (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700 text-sm font-medium">
            🎉 Équipe complète ! L'événement peut être confirmé.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-orange-700 text-sm font-medium">
            ⚠️ Il manque {requiredFlorists - confirmedCount} fleuriste{requiredFlorists - confirmedCount > 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {/* ZONES DE STATUT */}
      <div className="space-y-4">
        
        {/* 🟢 ZONE CONFIRMÉ */}
        <div className="border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/10">
          <div className="p-3 border-b border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>🟢 Confirmé ({getFloristsByStatus('confirmed').length})</span>
            </h4>
          </div>
          <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
            {getFloristsByStatus('confirmed').map((assignment: any) => {
              const globalFlorist = florists.find(f => f.id === assignment.floristId)
              if (!globalFlorist) return null
              const florist = toLocalFlorist(globalFlorist)

              return (
                <FloristCard
                  key={florist.id}
                  florist={florist}
                  status="confirmed"
                  allEvents={allEvents}
                  currentEventId={editedEvent.id}
                  currentEventDate={editedEvent.date instanceof Date ? editedEvent.date : new Date(editedEvent.date)}
                  onStatusChange={(newStatus) => onUpdateFloristStatus(florist.id, newStatus)}
                  onRemove={() => onRemoveFlorist(florist.id)}
                />
              )
            })}
            {getFloristsByStatus('confirmed').length === 0 && (
              <p className="text-green-600 dark:text-green-400 text-sm text-center py-4">
                Aucun fleuriste confirmé
              </p>
            )}
          </div>
        </div>

        {/* 🟡 ZONE EN ATTENTE */}
        <div className="border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/10">
          <div className="p-3 border-b border-orange-200 dark:border-orange-800">
            <h4 className="font-medium text-orange-800 dark:text-orange-300 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>🟡 En attente de réponse ({getFloristsByStatus('pending').length})</span>
            </h4>
          </div>
          <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
            {getFloristsByStatus('pending').map((assignment: any) => {
              const globalFlorist = florists.find(f => f.id === assignment.floristId)
              if (!globalFlorist) return null
              const florist = toLocalFlorist(globalFlorist)

              return (
                <FloristCard
                  key={florist.id}
                  florist={florist}
                  status="pending"
                  allEvents={allEvents}
                  currentEventId={editedEvent.id}
                  currentEventDate={editedEvent.date instanceof Date ? editedEvent.date : new Date(editedEvent.date)}
                  onStatusChange={(newStatus) => onUpdateFloristStatus(florist.id, newStatus)}
                  onRemove={() => onRemoveFlorist(florist.id)}
                />
              )
            })}
            {getFloristsByStatus('pending').length === 0 && (
              <p className="text-orange-600 dark:text-orange-400 text-sm text-center py-4">
                Aucune demande en attente
              </p>
            )}
          </div>
        </div>

        {/* 🔴 ZONE REFUSÉ */}
        <div className="border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
          <div className="p-3 border-b border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>🔴 Refusé ({getFloristsByStatus('refused').length})</span>
            </h4>
          </div>
          <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
            {getFloristsByStatus('refused').map((assignment: any) => {
              const globalFlorist = florists.find(f => f.id === assignment.floristId)
              if (!globalFlorist) return null
              const florist = toLocalFlorist(globalFlorist)

              return (
                <FloristCard
                  key={florist.id}
                  florist={florist}
                  status="refused"
                  allEvents={allEvents}
                  currentEventId={editedEvent.id}
                  currentEventDate={editedEvent.date instanceof Date ? editedEvent.date : new Date(editedEvent.date)}
                  onStatusChange={(newStatus) => onUpdateFloristStatus(florist.id, newStatus)}
                  onRemove={() => onRemoveFlorist(florist.id)}
                />
              )
            })}
            {getFloristsByStatus('refused').length === 0 && (
              <p className="text-red-600 dark:text-red-400 text-sm text-center py-4">
                Aucun refus
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🟦 POOL DES FLEURISTES DISPONIBLES */}
      <div className="border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/10">
        <div className="p-3 border-b border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>🟦 Tous les fleuristes disponibles ({availableFlorists.length})</span>
          </h4>
        </div>
        <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
          {availableFlorists.map(globalFlorist => {
            const florist = toLocalFlorist(globalFlorist)
            return (
              <div key={florist.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {florist.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {florist.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {florist.role || 'Fleuriste'}
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center space-x-2">
                  {/* Contacter */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                    title="Contacter le fleuriste"
                    onClick={() => {
                      // Ici on pourrait ouvrir un modal de message
                      console.log('Contacter', florist.name)
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </motion.button>

                  {/* Ajouter */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                    title="Ajouter à l'équipe"
                    onClick={() => onAddFlorist(globalFlorist)}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )
          })}
          {availableFlorists.length === 0 && (
            <p className="text-blue-600 dark:text-blue-400 text-sm text-center py-4">
              Tous les fleuristes sont déjà assignés
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FloristAssignmentComplete