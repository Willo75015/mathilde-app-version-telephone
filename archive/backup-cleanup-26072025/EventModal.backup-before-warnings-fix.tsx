import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Edit, Calendar, MapPin, DollarSign, Phone, 
  User, Clock, FileText, Users, CheckCircle, 
  XCircle, AlertCircle, MessageSquare, Trash2,
  Plus
} from 'lucide-react'
import { Event, Client } from '@/types'
import Button from '@/components/ui/Button'
import PhoneInput from '@/components/ui/PhoneInput'
import FloristCard from '@/components/ui/FloristCard'  // 🆕 Import du composant réutilisable
import { useEventSync, useModalEventSync } from '@/hooks/useEventSync'
import { useApp, useFlorists } from '@/contexts/AppContext'

// Types pour les fleuristes
interface Florist {
  id: string
  name: string
  role: string
  status: 'available' | 'unavailable' | 'busy'
  avatar?: string
}

interface FloristAssignment {
  floristId: string
  status: 'pending' | 'confirmed' | 'refused' | 'not_selected' // 🆕
  assignedAt: Date
}

interface EventModalProps {
  event: Event | null
  client?: Client
  isOpen: boolean
  onClose: () => void
  onEdit?: (event: Event) => void
  initialView?: 'details' | 'assignment'
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  client,
  isOpen,
  onClose,
  onEdit,
  initialView = 'details'
}) => {
  const [currentView, setCurrentView] = useState<'details' | 'assignment'>(initialView)
  
  // 🆕 Récupérer tous les événements pour la détection de conflits
  const { state } = useApp()
  const allEvents = state.events
  
  // Hooks de synchronisation
  const { emitEventSync, syncFloristAssignments } = useEventSync()
  const { latestEvent, isEventOutdated } = useModalEventSync(event?.id || null, 'EventModal')
  
  // Ref pour maintenir la position de scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // State pour les notifications
  const [showLimitReachedPopup, setShowLimitReachedPopup] = useState(false)
  const [showMaxReachedAlert, setShowMaxReachedAlert] = useState(false)
  
  // State local pour l'édition (clone de l'événement)
  const [editedEvent, setEditedEvent] = useState<Event | null>(null)
  
  // Initialiser le state d'édition avec les données les plus récentes
  useEffect(() => {
    const currentEvent = latestEvent || event
    if (isOpen) {
      if (currentEvent) {
        console.log('🔄 EventModal - Initialisation avec données récentes:', {
          eventId: currentEvent.id,
          assignedFlorists: currentEvent.assignedFlorists?.length || 0,
          isLatest: !!latestEvent
        })
        setEditedEvent({ ...currentEvent })
      } else {
        // Mode création - nouvel événement
        console.log('🆕 EventModal - Mode création nouvel événement')
        const newEvent: Event = {
          id: `temp-${Date.now()}`,
          title: '',
          description: '',
          date: new Date(),
          time: '09:00',
          endTime: '17:00',
          location: '',
          clientId: '',
          clientPhone: '',
          budget: 0,
          status: 'draft' as any,
          flowers: [],
          floristsRequired: 2,
          assignedFlorists: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setEditedEvent(newEvent)
      }
    }
  }, [event, latestEvent, isOpen])

  // Gérer la vue initiale
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView)
    }
  }, [isOpen, initialView])

  // Assignations basées sur l'événement réel
  const [assignments, setAssignments] = useState<FloristAssignment[]>([])
  
  // Initialiser les assignations depuis l'événement le plus récent
  useEffect(() => {
    const currentEvent = latestEvent || event
    if (isOpen) {
      if (currentEvent?.assignedFlorists) {
        console.log('🔄 EventModal - Chargement assignations depuis événement synchronisé:', {
          eventId: currentEvent.id,
          assignedCount: currentEvent.assignedFlorists.length,
          isFromSync: !!latestEvent
        })
        
        const newAssignments = currentEvent.assignedFlorists.map(af => ({
          floristId: af.floristId,
          status: af.status || (af.isConfirmed ? 'confirmed' : af.isRefused ? 'refused' : 'pending') as const,
          assignedAt: af.assignedAt
        }))
        
        setAssignments(newAssignments)
        console.log('✅ EventModal - Assignations chargées:', newAssignments)
      } else {
        // Si pas d'assignations dans l'événement, reset à vide
        setAssignments([])
        console.log('🆕 EventModal - Nouvel événement - assignations vides')
      }
    }
  }, [event, latestEvent, isOpen])

  // 🆕 Récupérer tous les fleuristes depuis les événements existants
  const getAllFloristsFromEvents = useCallback(() => {
    const floristsMap = new Map()
    
    // Parcourir tous les événements pour extraire les fleuristes
    allEvents.forEach(event => {
      event.assignedFlorists?.forEach(af => {
        if (!floristsMap.has(af.floristId)) {
          floristsMap.set(af.floristId, {
            id: af.floristId,
            name: af.floristName,
            role: af.floristRole || 'Fleuriste', 
            status: 'available' // Par défaut disponible, sera calculé par getFloristStatus
          })
        }
      })
    })
    
    // Ajouter les fleuristes de base s'ils ne sont pas dans les événements
    const baseFlorists = [
      { id: '1', name: 'Marie Dubois', role: 'Assistant Fleuriste', status: 'available' },
      { id: '2', name: 'Paul Renault', role: 'Responsable Décoration', status: 'available' },
      { id: '3', name: 'Jean Moreau', role: 'Spécialiste Mariage', status: 'available' },
      { id: '4', name: 'Sophie Laurent', role: 'Senior Fleuriste', status: 'available' },
      { id: '5', name: 'Claire Petit', role: 'Junior Fleuriste', status: 'busy' },
      { id: '6', name: 'Marc Durand', role: 'Créateur Bouquets', status: 'unavailable' }
    ]
    
    baseFlorists.forEach(florist => {
      if (!floristsMap.has(florist.id)) {
        floristsMap.set(florist.id, florist)
      }
    })
    
    return Array.from(floristsMap.values())
  }, [allEvents])

  // Récupérer les données complètes des fleuristes
  const { florists } = useFlorists()
  
  // Créer une version étendue avec les données complètes
  const allFloristsWithData = getAllFloristsFromEvents().map(eventFlorist => {
    const fullFloristData = florists.find(f => f.id === eventFlorist.id)
    return {
      ...eventFlorist,
      unavailabilityPeriods: fullFloristData?.unavailabilityPeriods || []
    }
  })
  
  const allFlorists = allFloristsWithData

  if (!editedEvent) return null

  // Utiliser editedEvent pour les calculs
  const requiredFlorists = editedEvent.floristsRequired || 4 // Propriété à ajouter aux types
  const confirmedCount = assignments.filter(a => a.status === 'confirmed').length
  const progressPercentage = Math.min((confirmedCount / requiredFlorists) * 100, 100)

  const assignedFloristIds = assignments.map(a => a.floristId)
  const availableFlorists = allFlorists.filter(f => !assignedFloristIds.includes(f.id))

  // Récupérer updateEventWithTeamCheck au niveau du composant
  const { updateEventWithTeamCheck } = useApp()

  // Fonction helper pour synchroniser immédiatement les assignations
  const syncAssignmentsImmediately = (newAssignments: FloristAssignment[]) => {
    if (!editedEvent) return
    
    const updatedAssignedFlorists = newAssignments.map(assignment => ({
      floristId: assignment.floristId,
      floristName: allFlorists.find(f => f.id === assignment.floristId)?.name || '',
      isConfirmed: assignment.status === 'confirmed',
      isRefused: assignment.status === 'refused',
      status: assignment.status,
      assignedAt: assignment.assignedAt
    }))
    
    console.log('⚡ EventModal - AVANT updateEventWithTeamCheck:', {
      eventId: editedEvent.id,
      assignedFlorists: updatedAssignedFlorists,
      confirmedCount: updatedAssignedFlorists.filter(f => f.status === 'confirmed').length
    })
    
    // 🆕 Utiliser la nouvelle fonction avec vérification d'équipe complète
    updateEventWithTeamCheck(editedEvent.id, { 
      assignedFlorists: updatedAssignedFlorists 
    })
    
    // Synchroniser avec les autres modals immédiatement
    syncFloristAssignments(editedEvent.id, updatedAssignedFlorists, 'EventModal')
    
    console.log('⚡ EventModal - Synchronisation avec vérification équipe:', {
      eventId: editedEvent.id,
      assignmentsCount: newAssignments.length
    })
  }

  const getFloristsByStatus = (status: FloristAssignment['status']) => {
    return assignments
      .filter(a => a.status === status)
      .map(a => allFlorists.find(f => f.id === a.floristId)!)
      .filter(Boolean)
  }

  const handleAddFlorist = (florist: Florist) => {
    // On peut toujours ajouter en "En attente" - pas de limite
    // La limite s'applique seulement aux confirmés
    
    // Sauvegarder la position de scroll avant l'ajout
    const scrollPosition = scrollContainerRef.current?.scrollTop || 0
    
    const newAssignments = [...assignments, {
      floristId: florist.id,
      status: 'pending' as const, // Ajouter en "pending" d'abord
      assignedAt: new Date()
    }]
    
    setAssignments(newAssignments)
    
    // Synchroniser immédiatement avec les autres modals
    syncAssignmentsImmediately(newAssignments)
    
    // Restaurer la position de scroll après le re-render
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollPosition
      }
    }, 0)
  }

  const handleUpdateFloristStatus = (floristId: string, newStatus: FloristAssignment['status']) => {
    // Vérifier la limite seulement si on essaie de confirmer
    if (newStatus === 'confirmed') {
      const currentConfirmed = assignments.filter(a => a.status === 'confirmed').length
      
      if (currentConfirmed >= requiredFlorists) {
        setShowMaxReachedAlert(true)
        setTimeout(() => setShowMaxReachedAlert(false), 3000)
        return
      }
    }
    
    // Sauvegarder la position de scroll
    const scrollPosition = scrollContainerRef.current?.scrollTop || 0
    
    const newAssignments = assignments.map(a => 
      a.floristId === floristId ? { ...a, status: newStatus } : a
    )
    
    console.log('🔧 AVANT handleUpdateFloristStatus:', {
      floristId,
      oldStatus: assignments.find(a => a.floristId === floristId)?.status,
      newStatus,
      newConfirmedCount: newAssignments.filter(a => a.status === 'confirmed').length,
      requiredFlorists
    })
    
    setAssignments(newAssignments)
    
    // 🆕 VÉRIFICATION AUTO-PASSAGE APRÈS CHANGEMENT DE STATUT
    const confirmedCount = newAssignments.filter(a => a.status === 'confirmed').length
    if (confirmedCount >= requiredFlorists) {
      console.log('🎉 ÉQUIPE COMPLÈTE DÉTECTÉE ! Auto-passage des "pending" → "not_selected"')
      
      // Passer automatiquement tous les "pending" en "not_selected"
      const finalAssignments = newAssignments.map(a => {
        if (a.status === 'pending') {
          console.log(`📝 Auto-passage: ${allFlorists.find(f => f.id === a.floristId)?.name} → "not_selected"`)
          return { ...a, status: 'not_selected' as const }
        }
        return a
      })
      
      setAssignments(finalAssignments)
      syncAssignmentsImmediately(finalAssignments)
    } else {
      // Synchronisation normale
      syncAssignmentsImmediately(newAssignments)
    }
    
    // Vérifier si on vient d'atteindre la limite de confirmés
    if (newStatus === 'confirmed') {
      const newConfirmedCount = assignments.filter(a => a.status === 'confirmed').length + 1
      if (newConfirmedCount === requiredFlorists) {
        setTimeout(() => {
          setShowLimitReachedPopup(true)
        }, 100)
      }
    }
    
    // Restaurer la position
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollPosition
      }
    }, 0)
  }

  const handleRemoveFlorist = (floristId: string) => {
    // Sauvegarder la position de scroll
    const scrollPosition = scrollContainerRef.current?.scrollTop || 0
    
    const newAssignments = assignments.filter(a => a.floristId !== floristId)
    setAssignments(newAssignments)
    
    // Synchroniser immédiatement avec les autres modals
    syncAssignmentsImmediately(newAssignments)
    
    // Restaurer la position
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollPosition
      }
    }, 0)
  }

  // Fonctions pour mettre à jour l'événement en cours d'édition
  const updateEventField = (field: keyof Event, value: any) => {
    if (editedEvent) {
      setEditedEvent(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  // 🔧 CORRECTION: Sauvegarder les modifications avec validation
  const handleSave = () => {
    if (!editedEvent || !onEdit) {
      console.error('❌ Pas d\'événement à sauvegarder ou pas de fonction onEdit')
      return
    }
    
    // 🛡️ VALIDATION DES CHAMPS OBLIGATOIRES
    const errors: string[] = []
    
    if (!editedEvent.title || editedEvent.title.trim() === '') {
      errors.push('Le titre est requis')
    }
    
    if (!editedEvent.date) {
      errors.push('La date est requise')
    }
    
    if (!editedEvent.time || editedEvent.time.trim() === '') {
      errors.push('L\'heure est requise')
    }
    
    if (!editedEvent.location || editedEvent.location.trim() === '') {
      errors.push('L\'adresse est requise')
    }
    
    if (!editedEvent.clientId || editedEvent.clientId.trim() === '') {
      errors.push('Veuillez sélectionner un client')
    }
    
    if (!editedEvent.budget || editedEvent.budget <= 0) {
      errors.push('Le budget doit être supérieur à 0')
    }
    
    if (errors.length > 0) {
      console.error('❌ Erreurs de validation:', errors)
      console.error('🔥 DÉTAIL DES ERREURS:', errors.forEach((err, i) => console.error(`Erreur ${i+1}: ${err}`)))
      alert('Erreurs de validation:\n' + errors.join('\n'))
      return // ⚠️ ARRÊT COMPLET ICI
    }
    
    // 🔧 CORRECTION : Logique de création vs modification robuste
    const isCreating = !event || !event.id || event.id.startsWith('temp-') || event.id.startsWith('event-temp-')
    
    // Synchroniser les assignations avec l'événement
    const updatedEvent = {
      ...editedEvent,
      // Générer un nouvel ID si c'est une création
      id: isCreating ? `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : editedEvent.id,
      // 🔧 CORRECTION: Inclure explicitement endDate
      endDate: editedEvent.endDate || undefined,
      assignedFlorists: assignments.map(assignment => ({
        floristId: assignment.floristId,
        floristName: allFlorists.find(f => f.id === assignment.floristId)?.name || '',
        isConfirmed: assignment.status === 'confirmed',
        isRefused: assignment.status === 'refused',
        status: assignment.status,
        assignedAt: assignment.assignedAt
      })),
      floristsRequired: requiredFlorists,
      // Mettre à jour le statut de l'événement selon les assignations
      status: confirmedCount >= requiredFlorists ? 'confirmed' : editedEvent.status,
      // Mettre à jour les timestamps
      createdAt: isCreating ? new Date() : editedEvent.createdAt,
      updatedAt: new Date()
    }
    
    console.log(`💾 EventModal - ${isCreating ? 'Création' : 'Modification'} événement:`, {
      eventId: updatedEvent.id,
      title: updatedEvent.title,
      date: updatedEvent.date,
      endDate: updatedEvent.endDate,
      clientId: updatedEvent.clientId,
      budget: updatedEvent.budget,
      location: updatedEvent.location,
      floristsRequired: requiredFlorists,
      assignedFlorists: updatedEvent.assignedFlorists,
      confirmedCount,
      newStatus: updatedEvent.status
    })
    
    try {
      // Émettre la synchronisation AVANT l'appel onEdit
      emitEventSync(updatedEvent, 'EventModal')
      
      // Appel onEdit pour maintenir la compatibilité (gère création ET modification)
      onEdit(updatedEvent)
      
      console.log('✅ Événement sauvegardé avec succès')
      onClose()
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde: ' + (error as Error).message)
    }
  }

  // Annuler les modifications
  const handleCancel = () => {
    if (event) {
      setEditedEvent({ ...event }) // Reset aux valeurs originales
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={editedEvent.title}
                  onChange={(e) => updateEventField('title', e.target.value)}
                  className="bg-transparent border-b-2 border-primary-500 focus:outline-none focus:border-primary-600 text-2xl font-bold text-gray-900 dark:text-white"
                  placeholder={event ? "Nom de l'événement" : "Nom du nouvel événement"}
                />
                
                {/* Bouton Traiter Urgent */}
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                  leftIcon={<AlertCircle className="w-4 h-4" />}
                >
                  Traiter Urgent
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Switch entre Détails et Assignation */}
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${currentView === 'details' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                    📅 Détails
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentView === 'assignment'}
                      onChange={(e) => setCurrentView(e.target.checked ? 'assignment' : 'details')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                  <span className={`text-sm ${currentView === 'assignment' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                    👥 Assignation
                  </span>
                </div>

                <Button
                  variant="ghost"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={onClose}
                />
              </div>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
              {/* CONTENU DYNAMIQUE SELON LA VUE */}
              <div className="p-6">
                {currentView === 'details' ? (
                  /* VUE DÉTAILS ÉVÉNEMENT */
                  <div className="max-w-4xl mx-auto space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      📅 Détails de l'événement
                    </h3>
                    
                    {/* Dates de début et fin */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date de début *
                        </label>
                        <input
                          type="date"
                          value={editedEvent.date instanceof Date ? editedEvent.date.toISOString().split('T')[0] : editedEvent.date}
                          onChange={(e) => updateEventField('date', new Date(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          value={editedEvent.endDate ? (editedEvent.endDate instanceof Date ? editedEvent.endDate.toISOString().split('T')[0] : editedEvent.endDate) : ''}
                          onChange={(e) => updateEventField('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {/* Heures */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Heure de début *
                        </label>
                        <input
                          type="time"
                          value={editedEvent.time}
                          onChange={(e) => updateEventField('time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Heure de fin
                        </label>
                        <input
                          type="time"
                          value={editedEvent.endTime || ''}
                          onChange={(e) => updateEventField('endTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {/* Adresse complète */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Adresse complète *
                      </label>
                      <textarea
                        value={editedEvent.location}
                        onChange={(e) => updateEventField('location', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                        placeholder="Adresse complète de l'événement"
                      />
                    </div>

                    {/* CA généré */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        CA généré *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-green-500" />
                        <input
                          type="number"
                          value={editedEvent.budget || ''}
                          onChange={(e) => updateEventField('budget', parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          placeholder="Montant en €"
                          min="0"
                          step="0.01"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-gray-500">€</span>
                      </div>
                    </div>

                    {/* Nombre de fleuristes requis */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        🌸 Fleuristes requis *
                      </label>
                      <input
                        type="number"
                        value={requiredFlorists}
                        onChange={(e) => updateEventField('floristsRequired', parseInt(e.target.value) || 1)}
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        placeholder="Nombre de fleuristes"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Nombre de fleuristes nécessaires pour cet événement
                      </p>
                    </div>
                  </div>

                  {/* Informations Client */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      👤 Client
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assigner un client *
                      </label>
                      <select
                        value={editedEvent.clientId}
                        onChange={(e) => updateEventField('clientId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Sélectionner un client</option>
                        {state.clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Téléphone du client */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        📱 Téléphone du client
                      </label>
                      <PhoneInput
                        value={editedEvent.clientPhone || ''}
                        onChange={(value) => updateEventField('clientPhone', value)}
                        placeholder="01 23 45 67 89"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Numéro de téléphone pour joindre le client directement
                      </p>
                    </div>
                    
                    {client && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {client.firstName} {client.lastName}
                            </h4>
                            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3" />
                                <span>{client.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>📧</span>
                                <span>{client.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes supplémentaires */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      📝 Notes supplémentaires
                    </h3>
                    <textarea
                      value={editedEvent.notes || ''}
                      onChange={(e) => updateEventField('notes', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500"
                      rows={4}
                      placeholder="Notes internes sur l'événement..."
                    />
                  </div>
                </div>
                ) : (
                  /* VUE ASSIGNATION FLEURISTES */
                  <div className="max-w-4xl mx-auto space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      👥 Assignation des fleuristes
                    </h3>

                    {/* Barre de progression */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          🎯 Progression de l'équipe
                        </span>
                        <span className="text-sm font-bold text-primary-600">
                          {confirmedCount}/{requiredFlorists} fleuriste{requiredFlorists > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div
                          className="bg-primary-500 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        {confirmedCount >= requiredFlorists ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">
                              🎉 Équipe complète ! L'événement peut être confirmé.
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-orange-600">
                              ⚠️ Il manque {requiredFlorists - confirmedCount} fleuriste{requiredFlorists - confirmedCount > 1 ? 's' : ''}.
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 3 ZONES DE STATUT - ORDRE RÉORGANISÉ */}
                    <div className="space-y-4">
                      {/* ZONE CONFIRMÉ - EN HAUT */}
                      <div className="border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/10">
                        <div className="p-3 border-b border-green-200 dark:border-green-800">
                          <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>🟢 Confirmé ({getFloristsByStatus('confirmed').length})</span>
                          </h4>
                        </div>
                        <div className="p-3 space-y-2">
                          {getFloristsByStatus('confirmed').map(florist => (
                            <FloristCard
                              key={florist.id}
                              florist={florist}
                              status="confirmed"
                              allEvents={allEvents}
                              currentEventId={editedEvent.id}
                              currentEventDate={editedEvent.date instanceof Date ? editedEvent.date : new Date(editedEvent.date)}
                              onStatusChange={(newStatus) => handleUpdateFloristStatus(florist.id, newStatus)}
                              onRemove={() => handleRemoveFlorist(florist.id)}
                              showMissionDetails={true}
                              showActions={true}
                              variant="default"
                            />
                          ))}
                          {getFloristsByStatus('confirmed').length === 0 && (
                            <p className="text-green-600 dark:text-green-400 text-sm text-center py-4">
                              Aucune confirmation
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ZONE EN ATTENTE - AU MILIEU */}
                      <div className="border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                        <div className="p-3 border-b border-orange-200 dark:border-orange-800">
                          <h4 className="font-medium text-orange-800 dark:text-orange-300 flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>🟡 En attente de réponse ({getFloristsByStatus('pending').length})</span>
                          </h4>
                        </div>
                        <div className="p-3 space-y-2">
                          {getFloristsByStatus('pending').map(florist => (
                            <FloristCard
                              key={florist.id}
                              florist={florist}
                              status="pending"
                              allEvents={allEvents}
                              currentEventId={editedEvent.id}
                              currentEventDate={editedEvent.date instanceof Date ? editedEvent.date : new Date(editedEvent.date)}
                              onStatusChange={(newStatus) => handleUpdateFloristStatus(florist.id, newStatus)}
                              onRemove={() => handleRemoveFlorist(florist.id)}
                              showMissionDetails={true}
                              showActions={true}
                              variant="default"
                            />
                          ))}
                          {getFloristsByStatus('pending').length === 0 && (
                            <p className="text-orange-600 dark:text-orange-400 text-sm text-center py-4">
                              Aucune demande en attente
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 🆕 ZONE REFUSÉ - EN BAS */}
                      <div className="border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <div className="p-3 border-b border-red-200 dark:border-red-800">
                          <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center space-x-2">
                            <XCircle className="w-4 h-4" />
                            <span>🔴 Refusé ({getFloristsByStatus('refused').length})</span>
                          </h4>
                        </div>
                        <div className="p-3 space-y-2">
                          {getFloristsByStatus('refused').map(florist => (
                            <FloristCard
                              key={florist.id}
                              florist={florist}
                              status="refused"
                              allEvents={allEvents}
                              currentEventId={editedEvent.id}
                              currentEventDate={editedEvent.date instanceof Date ? editedEvent.date : new Date(editedEvent.date)}
                              onStatusChange={(newStatus) => handleUpdateFloristStatus(florist.id, newStatus)}
                              onRemove={() => handleRemoveFlorist(florist.id)}
                              showMissionDetails={true}
                              showActions={true}
                              variant="default"
                            />
                          ))}
                          {getFloristsByStatus('refused').length === 0 && (
                            <p className="text-red-600 dark:text-red-400 text-sm text-center py-4">
                              Aucun refus
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 🆕 ZONE NON RETENU */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/10">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-800 dark:text-gray-300 flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>📋 Non retenu ({getFloristsByStatus('not_selected').length})</span>
                            {getFloristsByStatus('not_selected').length > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                💬 Message pré-rempli à envoyer
                              </span>
                            )}
                          </h4>
                        </div>
                        <div className="p-3 space-y-2">
                          {getFloristsByStatus('not_selected').map(florist => (
                            <FloristCard
                              key={florist.id}
                              florist={florist}
                              status="not_selected"
                              allEvents={allEvents}
                              currentEventId={editedEvent.id}
                              currentEventDate={editedEvent.date instanceof Date ? editedEvent.date : new Date(editedEvent.date)}
                              onStatusChange={(newStatus) => handleUpdateFloristStatus(florist.id, newStatus)}
                              onRemove={() => handleRemoveFlorist(florist.id)}
                              showMissionDetails={true}
                              showActions={true}
                              variant="default"
                            />
                          ))}
                          {getFloristsByStatus('not_selected').length === 0 && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm text-center py-4">
                              Aucun non retenu
                            </p>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* POOL DES FLEURISTES DISPONIBLES */}
                    <div className="border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                      <div className="p-3 border-b border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>🟦 Tous les fleuristes disponibles ({availableFlorists.length})</span>
                        </h4>
                      </div>
                      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                        {availableFlorists.map(florist => (
                          <div key={florist.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <FloristCard
                                florist={florist}
                                status="available"
                                allEvents={allEvents}
                                showMissionDetails={true}
                                showActions={false}
                                variant="selection"
                                className="border-0 bg-transparent p-2"
                              />
                            </div>
                            <div className="ml-4">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAddFlorist(florist)}
                                leftIcon={<Plus className="w-3 h-3" />}
                                title="Ajouter le fleuriste"
                              >
                                Ajouter
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {availableFlorists.length === 0 && (
                          <p className="text-blue-600 dark:text-blue-400 text-sm text-center py-8">
                            🌸 Tous les fleuristes sont déjà assignés à cet événement
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer avec actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentView === 'assignment' && (
                  <div className="flex items-center space-x-4">
                    <span>
                      👥 {confirmedCount}/{requiredFlorists} fleuriste{requiredFlorists > 1 ? 's' : ''} confirmé{confirmedCount > 1 ? 's' : ''}
                    </span>
                    {/* 🔧 BOUTON DEBUG */}
                    {confirmedCount >= requiredFlorists && (
                      <button
                        onClick={() => {
                          console.log('🔧 DEBUG - Force auto-passage "pending" → "not_selected"')
                          const newAssignments = assignments.map(a => 
                            a.status === 'pending' ? { ...a, status: 'not_selected' as const } : a
                          )
                          setAssignments(newAssignments)
                          syncAssignmentsImmediately(newAssignments)
                        }}
                        className="text-xs bg-orange-500 text-white px-2 py-1 rounded"
                      >
                        🔧 Force Auto-Passage
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600"
                >
                  ✅ Valider & Synchroniser
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* POP-UP LIMITE ATTEINTE */}
      {showLimitReachedPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]"
          onClick={() => setShowLimitReachedPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                🎉 Équipe complète !
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Vous avez <span className="font-bold text-green-600">confirmé {requiredFlorists} fleuriste{requiredFlorists > 1 ? 's' : ''}</span> comme requis. 
                L'événement peut maintenant être validé !
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowLimitReachedPopup(false)}
                  className="flex-1"
                >
                  Continuer l'assignation
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowLimitReachedPopup(false)
                    handleSave()
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Valider l'événement
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ALERTE MAX ATTEINT */}
      {showMaxReachedAlert && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          ⚠️ Limite atteinte : {requiredFlorists} fleuriste{requiredFlorists > 1 ? 's' : ''} maximum
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EventModal