import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, DollarSign, Phone,
  User, Clock, Users, CheckCircle,
  XCircle, AlertCircle, MessageSquare, Trash2,
  Plus, Eye
} from 'lucide-react'
import { Event, Client, EventStatus } from '../../types'
import Button from '../ui/Button'
import PhoneInput from '../ui/PhoneInput'
import { useEventSync, useModalEventSync } from '../../hooks/useEventSync'
import { useApp } from '../../contexts/AppContext'

// 🆕 Fonctions utilitaires pour détecter les conflits de fleuristes
// BUG #5 FIX: Ajout de la comparaison des heures pour éviter les faux positifs

// Helper pour convertir "HH:MM" en minutes depuis minuit
const timeToMinutes = (time: string): number => {
  if (!time) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

// Helper pour vérifier si deux plages horaires se chevauchent
const timeRangesOverlap = (
  start1: string,
  end1: string | undefined,
  start2: string,
  end2: string | undefined
): boolean => {
  const start1Min = timeToMinutes(start1)
  const end1Min = end1 ? timeToMinutes(end1) : start1Min + 120 // Par défaut 2h si pas de fin
  const start2Min = timeToMinutes(start2)
  const end2Min = end2 ? timeToMinutes(end2) : start2Min + 120 // Par défaut 2h si pas de fin

  // Deux plages se chevauchent si l'une commence avant la fin de l'autre
  return start1Min < end2Min && start2Min < end1Min
}

const checkFloristConflicts = (
  floristId: string,
  currentEventId: string,
  eventDate: Date,
  eventTime: string,
  eventEndTime: string | undefined,
  allEvents: Event[]
): { hasConflict: boolean; conflictingEvents: Event[] } => {
  // Convertir la date en string pour comparaison
  const targetDate = eventDate.toDateString()

  const conflictingEvents = allEvents.filter(event => {
    // Ignorer l'événement actuel
    if (event.id === currentEventId) return false

    // Vérifier si c'est le même jour
    const eventDateStr = (event.date instanceof Date ? event.date : new Date(event.date)).toDateString()
    if (eventDateStr !== targetDate) return false

    // Vérifier si le fleuriste est assigné et confirmé
    const hasFlorist = event.assignedFlorists?.some(af =>
      af.floristId === floristId && (af.isConfirmed || af.status === 'confirmed')
    )

    if (!hasFlorist) return false

    // BUG #5 FIX: Vérifier si les plages horaires se chevauchent
    const hasTimeConflict = timeRangesOverlap(
      eventTime,
      eventEndTime,
      event.time,
      event.endTime
    )

    return hasTimeConflict
  })

  return {
    hasConflict: conflictingEvents.length > 0,
    conflictingEvents
  }
}

// BUG #10 & #11 FIX: Utiliser le type local LocalFlorist pour la compatibilité avec les données locales
// Ce type combine les propriétés nécessaires pour l'affichage dans le modal
const getFloristStatus = (
  florist: LocalFlorist,
  allEvents: Event[]
): {
  status: 'available' | 'on_mission' | 'unavailable'
  currentMissions: Event[]
  totalMissions: number
} => {
  // Trouver toutes les missions confirmées (toutes dates)
  const currentMissions = allEvents.filter(event => {
    return event.assignedFlorists?.some(af =>
      af.floristId === florist.id && (af.isConfirmed || af.status === 'confirmed')
    )
  })

  // Compter le total des missions (toutes dates confondues)
  const totalMissions = allEvents.filter(event => {
    return event.assignedFlorists?.some(af =>
      af.floristId === florist.id && (af.isConfirmed || af.status === 'confirmed')
    )
  }).length

  let status: 'available' | 'on_mission' | 'unavailable' = 'available'

  // BUG #11 FIX: Vérifier le statut local du fleuriste (busy/unavailable/available)
  // Le type LocalFlorist utilise 'busy' alors que GlobalFlorist utilise FloristAvailability enum
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

// BUG #10 FIX: Renommer l'interface locale pour éviter la confusion avec le type global Florist
// Cette interface est utilisée pour les données d'affichage dans le modal uniquement
interface LocalFlorist {
  id: string
  name: string
  role: string
  status: 'available' | 'unavailable' | 'busy' // Statut simplifié pour l'UI locale
  avatar?: string
  phone?: string // Numéro de téléphone pour WhatsApp
}

interface FloristAssignment {
  floristId: string
  status: 'pending' | 'confirmed' | 'refused' | 'not_selected'
  assignedAt: Date
  preWrittenMessage?: string // 🆕 Message pré-écrit pour les "non retenus"
}

interface EventModalProps {
  event: Event | null
  client?: Client
  isOpen: boolean
  onClose: () => void
  onEdit?: (event: Event, keepModalOpen?: boolean) => void
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
  const { latestEvent } = useModalEventSync(event?.id || null, 'EventModal')
  
  // Ref pour maintenir la position de scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // State pour les notifications
  const [showLimitReachedPopup, setShowLimitReachedPopup] = useState(false)
  const [showMaxReachedAlert, setShowMaxReachedAlert] = useState(false)

  // États pour la modal des missions de fleuriste (pour la liste des fleuristes disponibles)
  const [showFloristMissionsModal, setShowFloristMissionsModal] = useState(false)
  const [selectedFloristMissions, setSelectedFloristMissions] = useState<Event[]>([])

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
        
        const newAssignments = currentEvent.assignedFlorists.map(af => {
          let assignmentStatus: 'pending' | 'confirmed' | 'refused' | 'not_selected' = 'pending'
          if (af.status) {
            assignmentStatus = af.status
          } else if (af.isConfirmed) {
            assignmentStatus = 'confirmed'
          } else if (af.isRefused) {
            assignmentStatus = 'refused'
          }
          return {
            floristId: af.floristId,
            status: assignmentStatus,
            assignedAt: af.assignedAt,
            preWrittenMessage: af.preWrittenMessage
          }
        })
        
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
            // BUG #9 FIX: Utiliser af.role (pas af.floristRole qui n'existe pas)
            role: af.role || 'Fleuriste',
            status: 'available' // Par défaut disponible, sera calculé par getFloristStatus
          })
        }
      })
    })
    
    // Ajouter les fleuristes de base s'ils ne sont pas dans les événements
    const baseFlorists = [
      { id: '1', name: 'Marie Dubois', role: 'Assistant Fleuriste', status: 'available', phone: '+33612345678' },
      { id: '2', name: 'Paul Renault', role: 'Responsable Décoration', status: 'available', phone: '+33687654321' },
      { id: '3', name: 'Lucas Martin', role: 'Fleuriste Junior', status: 'available', phone: '+33698765432' },
      { id: '4', name: 'Jean Martin', role: 'Spécialiste Mariage', status: 'available', phone: '+33676543210' },
      { id: '5', name: 'Sophie Durand', role: 'Senior Fleuriste', status: 'available', phone: '+33654321098' },
      { id: '6', name: 'Claire Petit', role: 'Junior Fleuriste', status: 'busy', phone: '+33632109876' },
      { id: '7', name: 'Marc Durand', role: 'Créateur Bouquets', status: 'unavailable', phone: '+33621098765' }
    ]
    
    baseFlorists.forEach(florist => {
      if (!floristsMap.has(florist.id)) {
        floristsMap.set(florist.id, florist)
      }
    })
    
    return Array.from(floristsMap.values())
  }, [allEvents])

  const allFlorists = getAllFloristsFromEvents()

  if (!editedEvent) return null

  // Utiliser editedEvent pour les calculs - AVEC FALLBACKS INTELLIGENTS
  const requiredFlorists = editedEvent?.floristsRequired || event?.floristsRequired || 2
  console.log('🔍 FLEURISTES REQUIS:', {
    editedEventRequired: editedEvent?.floristsRequired,
    eventRequired: event?.floristsRequired,
    finalRequired: requiredFlorists,
    eventTitle: editedEvent?.title || event?.title
  })
  const confirmedCount = assignments.filter(a => a.status === 'confirmed').length
  const progressPercentage = Math.min((confirmedCount / requiredFlorists) * 100, 100)

  const assignedFloristIds = assignments.map(a => a.floristId)
  const availableFlorists = allFlorists.filter(f => !assignedFloristIds.includes(f.id))

  // Fonction helper pour synchroniser immédiatement les assignations
  const syncAssignmentsImmediately = (newAssignments: FloristAssignment[]) => {
    if (!event) return
    
    const updatedAssignedFlorists = newAssignments.map(assignment => ({
      floristId: assignment.floristId,
      floristName: allFlorists.find(f => f.id === assignment.floristId)?.name || '',
      isConfirmed: assignment.status === 'confirmed',
      isRefused: assignment.status === 'refused',
      status: assignment.status,
      assignedAt: assignment.assignedAt
    }))
    
    // Synchroniser avec les autres modals immédiatement
    const eventId = editedEvent?.id || event?.id
    if (!eventId) return
    
    syncFloristAssignments(eventId, updatedAssignedFlorists, 'EventModal')
    
    console.log('⚡ EventModal - Synchronisation immédiate:', {
      eventId,
      assignmentsCount: newAssignments.length
    })
  }

  const getFloristsByStatus = (status: FloristAssignment['status']) => {
    return assignments
      .filter(a => a.status === status)
      .map(a => allFlorists.find(f => f.id === a.floristId)!)
      .filter(Boolean)
  }

  const handleAddFlorist = (florist: LocalFlorist) => {
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
    
    // 🆕 LOGIQUE UNIVERSELLE : Auto-passage pending → not_selected quand équipe complète
    if (newStatus === 'confirmed') {
      const newConfirmedCount = newAssignments.filter(a => a.status === 'confirmed').length
      console.log('🎯 VÉRIFICATION ÉQUIPE COMPLÈTE [EventModal]:', {
        newConfirmedCount,
        requiredFlorists,
        isTeamComplete: newConfirmedCount >= requiredFlorists,
        currentAssignments: newAssignments.map(a => ({ florist: availableFlorists.find(f => f.id === a.floristId)?.name, status: a.status }))
      })
      
      if (newConfirmedCount >= requiredFlorists) {
        console.log('🎉 ÉQUIPE COMPLÈTE ! Auto-passage des "pending" → "not_selected"')
        
        // Passer automatiquement tous les "pending" en "not_selected" avec message pré-écrit
        const finalAssignments = newAssignments.map(assignment => {
          if (assignment.status === 'pending') {
            const florist = availableFlorists.find(f => f.id === assignment.floristId)
            if (florist) {
              console.log(`📝 ${florist.name} → "not_selected" (équipe complète)`)
              
              // Générer le message pré-écrit
              const eventTitle = editedEvent?.title || event?.title || 'cet événement'
              const eventDate = editedEvent?.date || event?.date || new Date()
              const formattedDate = eventDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'numeric', 
                year: 'numeric'
              })
              
              const preWrittenMessage = `Bonjour ${florist.name.split(' ')[0]},

L'événement "${eventTitle}" du ${formattedDate} est pourvu.

Merci pour votre disponibilité !

Mathilde Fleurs`
              
              return { 
                ...assignment, 
                status: 'not_selected' as const,
                preWrittenMessage
              }
            }
          }
          return assignment
        })
        
        console.log('✅ Assignments finaux après auto-passage:', finalAssignments.map(a => ({ 
          florist: availableFlorists.find(f => f.id === a.floristId)?.name, 
          status: a.status 
        })))
        
        // 🚀 DISPATCHING IMMÉDIAT ET SYNCHRONE
        // BUG #4 FIX: Suppression du double setAssignments qui causait une race condition
        console.log('🚀 DÉMARRAGE du dispatching immédiat...')

        // 1. Appliquer les changements une seule fois
        setAssignments(finalAssignments)

        // 2. Synchroniser immédiatement (pas de setTimeout)
        syncAssignmentsImmediately(finalAssignments)

        console.log('✅ Dispatching terminé. Popup dans 100ms...')
        
        // 4. Montrer le popup après un délai minimal pour laisser le DOM se mettre à jour
        setTimeout(() => {
          console.log('🎉 Affichage du popup "Équipe complète"')
          setShowLimitReachedPopup(true)
        }, 100)
        
        // ⚠️ IMPORTANT : Return early pour ne pas exécuter la logique normale
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollPosition
          }
        }, 0)
        return
      }
    }
    
    // Logique normale si pas d'équipe complète
    setAssignments(newAssignments)
    
    // Synchroniser immédiatement avec les autres modals
    syncAssignmentsImmediately(newAssignments)
    
    // Montrer popup limite atteinte seulement si on atteint exactement le nombre requis
    if (newStatus === 'confirmed') {
      const newConfirmedCount = newAssignments.filter(a => a.status === 'confirmed').length
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

  // 🆕 FONCTION POUR APPLIQUER LE WORKFLOW SANS FERMER LE MODAL
  const applyWorkflowNow = () => {
    if (confirmedCount >= requiredFlorists && assignments.length > 0) {
      console.log('🎯 WORKFLOW IMMÉDIAT - Déclenchement sans fermeture modal')
      
      const finalAssignments = assignments.map(assignment => {
        if (assignment.status === 'pending') {
          const florist = allFlorists.find(f => f.id === assignment.floristId)
          if (florist) {
            const eventDate = editedEvent?.date || new Date()
            const formattedDate = eventDate.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'numeric', 
              year: 'numeric'
            })
            
            const preWrittenMessage = `Bonjour ${florist.name.split(' ')[0]},

L'événement "${editedEvent?.title || 'cet événement'}" du ${formattedDate} est pourvu.

Merci pour votre disponibilité !

Mathilde Fleurs`

            console.log('🔥 WORKFLOW IMMÉDIAT - Passage pending→not_selected:', florist.name)
            
            return { 
              ...assignment, 
              status: 'not_selected' as const,
              preWrittenMessage
            }
          }
        }
        return assignment
      })
      
      // Mettre à jour immédiatement l'interface
      setAssignments(finalAssignments)
      
      console.log('✅ WORKFLOW IMMÉDIAT - Interface mise à jour, changements visibles')
    } else {
      console.log('⚠️ WORKFLOW IMMÉDIAT - Conditions non remplies')
    }
  }

  // 🆕 Fonction pour appliquer le workflow automatique SANS sauvegarder
  const applyWorkflowOnly = () => {
    console.log('🎯 APPLY WORKFLOW - Application workflow automatique sans sauvegarde')
    
    if (confirmedCount >= requiredFlorists) {
      console.log('🔥 WORKFLOW - Équipe complète, passage pending→not_selected')
      
      // Mettre à jour les assignations locales
      const updatedAssignments = assignments.map(assignment => {
        if (assignment.status === 'pending') {
          const florist = allFlorists.find(f => f.id === assignment.floristId)
          const eventDate = editedEvent?.date || new Date()
          const formattedDate = eventDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'numeric', 
            year: 'numeric'
          })
          
          const preWrittenMessage = `Bonjour ${florist?.name?.split(' ')[0]},

L'événement "${editedEvent?.title}" du ${formattedDate} est pourvu.

Merci pour votre disponibilité !

Mathilde Fleurs`

          console.log('🔥 WORKFLOW - Passage pending→not_selected:', florist?.name)
          
          return { 
            ...assignment, 
            status: 'not_selected' as const,
            preWrittenMessage
          }
        }
        return assignment
      })
      
      // Mettre à jour le state local
      setAssignments(updatedAssignments)
      
      console.log('✅ WORKFLOW - Assignations mises à jour localement')
    }
  }

  // Sauvegarder les modifications (détails + assignations)
  const handleSave = () => {
    console.log('🔥 EVENTMODAL - handleSave APPELÉ !', { editedEvent: !!editedEvent, onEdit: !!onEdit })
    
    if (editedEvent && onEdit) {
      // Distinguer création vs modification
      const isCreating = !event || event.id.startsWith('temp-')
      
      // Synchroniser les assignations avec l'événement
      const updatedEvent = {
        ...editedEvent,
        // Générer un nouvel ID si c'est une création
        id: isCreating ? `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : (editedEvent?.id || event?.id || `event-${Date.now()}`),
        assignedFlorists: assignments.map(assignment => ({
          floristId: assignment.floristId,
          floristName: allFlorists.find(f => f.id === assignment.floristId)?.name || '',
          isConfirmed: assignment.status === 'confirmed',
          isRefused: assignment.status === 'refused',
          status: assignment.status,
          assignedAt: assignment.assignedAt,
          preWrittenMessage: assignment.preWrittenMessage // 🆕 Inclure le message pré-écrit
        })),
        floristsRequired: requiredFlorists,
        // Mettre à jour le statut de l'événement selon les assignations
        status: confirmedCount >= requiredFlorists ? EventStatus.CONFIRMED : editedEvent.status,
        // Mettre à jour les timestamps
        createdAt: isCreating ? new Date() : editedEvent.createdAt,
        updatedAt: new Date()
      }

      console.log(`💾 EventModal - ${isCreating ? 'Création' : 'Modification'} événement:`, {
        eventId: updatedEvent.id,
        title: updatedEvent.title,
        floristsRequired: requiredFlorists,
        assignedFlorists: updatedEvent.assignedFlorists,
        confirmedCount,
        newStatus: updatedEvent.status
      })

      // 🔥 WORKFLOW FINAL : S'assurer que les pending passent en not_selected si équipe complète
      if (updatedEvent.assignedFlorists && confirmedCount >= requiredFlorists) {
        console.log('🎯 HANDLESAVE - Vérification finale workflow')
        const finalFlorists = updatedEvent.assignedFlorists.map(florist => {
          if (florist.status === 'pending') {
            const eventDate = updatedEvent.date || new Date()
            const formattedDate = eventDate.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'numeric', 
              year: 'numeric'
            })
            
            const preWrittenMessage = `Bonjour ${florist.floristName?.split(' ')[0]},

L'événement "${updatedEvent.title}" du ${formattedDate} est pourvu.

Merci pour votre disponibilité !

Mathilde Fleurs`

            console.log('🔥 HANDLESAVE - Passage final pending→not_selected:', florist.floristName)
            
            return { 
              ...florist, 
              status: 'not_selected' as const,
              preWrittenMessage
            }
          }
          return florist
        })
        
        updatedEvent.assignedFlorists = finalFlorists
      }
      
      // Émettre la synchronisation AVANT l'appel onEdit
      emitEventSync(updatedEvent, 'EventModal')
      
      // Appel onEdit pour maintenir la compatibilité (gère création ET modification)
      onEdit(updatedEvent, false) // 🔥 PASSER false pour fermer le modal (comportement normal)
    }
    onClose()
  }

  // Annuler les modifications
  const handleCancel = () => {
    if (event) {
      setEditedEvent({ ...event }) // Reset aux valeurs originales
    }
    onClose()
  }

  const getStatusIcon = (florist: LocalFlorist) => {
    if (florist.status === 'unavailable') return '⚠️'
    if (florist.status === 'busy') return '🔄'
    return '✅'
  }

  const getStatusText = (florist: LocalFlorist) => {
    if (florist.status === 'unavailable') return 'Indisponible'
    if (florist.status === 'busy') return 'Sur mission'
    return 'Disponible'
  }

  // Détecter mobile avec hook réactif
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 ${isMobile ? '' : 'bg-black bg-opacity-50 flex items-center justify-center p-4'}`}
          onClick={isMobile ? undefined : onClose}
        >
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`bg-white dark:bg-gray-900 shadow-2xl flex flex-col ${
              isMobile
                ? 'fixed inset-0'
                : 'rounded-xl w-full max-w-6xl max-h-[85vh] overflow-hidden'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Mobile vs Desktop */}
            <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${
              isMobile
                ? 'px-4 py-3 bg-white dark:bg-gray-900 sticky top-0 z-10 safe-top'
                : 'p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800'
            }`}>
              {isMobile ? (
                // HEADER MOBILE
                <>
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-600 dark:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <input
                    type="text"
                    value={editedEvent.title}
                    onChange={(e) => updateEventField('title', e.target.value)}
                    className="flex-1 bg-transparent text-center text-base font-semibold text-gray-900 dark:text-white focus:outline-none truncate mx-2"
                    placeholder="Nom de l'événement"
                  />
                  <div className="w-10" />
                </>
              ) : (
                // HEADER DESKTOP
                <>
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
                </>
              )}
            </div>

            {/* Tabs Mobile - Switch entre Détails et Assignation */}
            {isMobile && (
              <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button
                  onClick={() => setCurrentView('details')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    currentView === 'details'
                      ? 'text-green-600 border-b-2 border-green-600 bg-white dark:bg-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  📅 Détails
                </button>
                <button
                  onClick={() => setCurrentView('assignment')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    currentView === 'assignment'
                      ? 'text-green-600 border-b-2 border-green-600 bg-white dark:bg-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  👥 Équipe
                </button>
              </div>
            )}

            <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto ${isMobile ? 'pb-4' : ''}`}>
              {/* CONTENU DYNAMIQUE SELON LA VUE */}
              <div className={isMobile ? 'p-2' : 'p-6'}>
                {currentView === 'details' ? (
                  /* VUE DÉTAILS ÉVÉNEMENT */
                  <div className="max-w-4xl mx-auto space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      📅 Détails de l'événement
                    </h3>
                    
                    {/* Dates de début et fin */}
                    {/* BUG #16 FIX: Utilisation du format local pour éviter les décalages de timezone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date de début *
                        </label>
                        <input
                          type="date"
                          value={(() => {
                            const dateValue = editedEvent?.date || event?.date;
                            if (dateValue instanceof Date) {
                              // Format local YYYY-MM-DD sans conversion UTC
                              const year = dateValue.getFullYear();
                              const month = String(dateValue.getMonth() + 1).padStart(2, '0');
                              const day = String(dateValue.getDate()).padStart(2, '0');
                              return `${year}-${month}-${day}`;
                            }
                            if (dateValue && typeof dateValue === 'string') {
                              return (dateValue as string).split('T')[0];
                            }
                            return '';
                          })()}
                          onChange={(e) => {
                            // Créer la date à midi pour éviter les problèmes de timezone
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            const newDate = new Date(year, month - 1, day, 12, 0, 0);
                            updateEventField('date', newDate);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          value={(() => {
                            const endDateValue = editedEvent?.endDate;
                            if (endDateValue instanceof Date) {
                              // Format local YYYY-MM-DD sans conversion UTC
                              const year = endDateValue.getFullYear();
                              const month = String(endDateValue.getMonth() + 1).padStart(2, '0');
                              const day = String(endDateValue.getDate()).padStart(2, '0');
                              return `${year}-${month}-${day}`;
                            }
                            if (endDateValue && typeof endDateValue === 'string') {
                              return (endDateValue as string).split('T')[0];
                            }
                            return '';
                          })()}
                          onChange={(e) => {
                            if (!e.target.value) {
                              updateEventField('endDate', undefined);
                              return;
                            }
                            // Créer la date à midi pour éviter les problèmes de timezone
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            const newDate = new Date(year, month - 1, day, 12, 0, 0);
                            updateEventField('endDate', newDate);
                          }}
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
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 flex-shrink-0" />
                        <input
                          type="number"
                          value={editedEvent.budget || ''}
                          onChange={(e) => updateEventField('budget', parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          placeholder="Montant en €"
                          min="0"
                          step="0.01"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
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
                        <option value="c1">Sophie Pierre</option>
                        <option value="c2">Julie Marc</option>
                        <option value="c3">Marie Dubois</option>
                        <option value="c4">Thomas Laurent</option>
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
                          {getFloristsByStatus('confirmed').map(florist => {
                            const assignment = assignments.find(a => a.floristId === florist.id)
                            return (
                              <FloristCard
                                key={florist.id}
                                florist={florist}
                                status="confirmed"
                                allEvents={allEvents}
                                currentEvent={event}
                                currentEventId={editedEvent?.id || event?.id || ''}
                                currentEventDate={(editedEvent?.date || event?.date) instanceof Date ? (editedEvent?.date || event?.date) as Date : new Date(editedEvent?.date || event?.date || Date.now())}
                                currentEventTime={editedEvent?.time || event?.time || '09:00'}
                                currentEventEndTime={editedEvent?.endTime || event?.endTime}
                                onStatusChange={(newStatus) => handleUpdateFloristStatus(florist.id, newStatus)}
                                onRemove={() => handleRemoveFlorist(florist.id)}
                                preWrittenMessage={assignment?.preWrittenMessage} // 🆕 Passer le message
                              />
                            )
                          })}
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
                              currentEvent={event}
                              currentEventId={editedEvent?.id || event?.id || ''}
                              currentEventDate={(editedEvent?.date || event?.date) instanceof Date ? (editedEvent?.date || event?.date) as Date : new Date(editedEvent?.date || event?.date || Date.now())}
                              currentEventTime={editedEvent?.time || event?.time || '09:00'}
                              currentEventEndTime={editedEvent?.endTime || event?.endTime}
                              onStatusChange={(newStatus) => handleUpdateFloristStatus(florist.id, newStatus)}
                              onRemove={() => handleRemoveFlorist(florist.id)}
                            />
                          ))}
                          {getFloristsByStatus('pending').length === 0 && (
                            <p className="text-orange-600 dark:text-orange-400 text-sm text-center py-4">
                              Aucune demande en attente
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 🆕 ZONE NON RETENU - NOUVEAU */}
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/10">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                          <h4 className="font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>⭕ Non retenu ({getFloristsByStatus('not_selected').length})</span>
                          </h4>
                        </div>
                        <div className="p-3 space-y-2">
                          {getFloristsByStatus('not_selected').map(florist => (
                            <FloristCard
                              key={florist.id}
                              florist={florist}
                              status="not_selected"
                              allEvents={allEvents}
                              currentEvent={event}
                              currentEventId={editedEvent?.id || event?.id || ''}
                              currentEventDate={(editedEvent?.date || event?.date) instanceof Date ? (editedEvent?.date || event?.date) as Date : new Date(editedEvent?.date || event?.date || Date.now())}
                              currentEventTime={editedEvent?.time || event?.time || '09:00'}
                              currentEventEndTime={editedEvent?.endTime || event?.endTime}
                              onStatusChange={(newStatus) => handleUpdateFloristStatus(florist.id, newStatus)}
                              onRemove={() => handleRemoveFlorist(florist.id)}
                            />
                          ))}
                          {getFloristsByStatus('not_selected').length === 0 && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm text-center py-4">
                              Aucun non retenu
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
                              currentEvent={event}
                              currentEventId={editedEvent?.id || event?.id || ''}
                              currentEventDate={(editedEvent?.date || event?.date) instanceof Date ? (editedEvent?.date || event?.date) as Date : new Date(editedEvent?.date || event?.date || Date.now())}
                              currentEventTime={editedEvent?.time || event?.time || '09:00'}
                              currentEventEndTime={editedEvent?.endTime || event?.endTime}
                              onStatusChange={(newStatus) => handleUpdateFloristStatus(florist.id, newStatus)}
                              onRemove={() => handleRemoveFlorist(florist.id)}
                            />
                          ))}
                          {getFloristsByStatus('refused').length === 0 && (
                            <p className="text-red-600 dark:text-red-400 text-sm text-center py-4">
                              Aucun refus
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
                        {availableFlorists.map(florist => {
                          const floristStatus = getFloristStatus(florist, allEvents)
                          return (
                            <div key={florist.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                  {florist.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                                    <span>{florist.name}</span>
                                    {floristStatus.status === 'on_mission' && (
                                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                                        ⚠️ Sur mission
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <span>{florist.role}</span>
                                    {floristStatus.status === 'on_mission' && floristStatus.currentMissions.length > 0 && (
                                      <>
                                        <span> • </span>
                                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                                          📍 {floristStatus.currentMissions[0].title}
                                          {floristStatus.currentMissions.length > 1 && ` (+${floristStatus.currentMissions.length - 1})`}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span>{getStatusIcon(florist)}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    florist.status === 'available' && floristStatus.status === 'available' ? 'bg-green-100 text-green-800' :
                                    floristStatus.status === 'on_mission' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {floristStatus.status === 'on_mission' ? 'Sur mission' : getStatusText(florist)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {/* Bouton Voir mission */}
                                {floristStatus.status === 'on_mission' && floristStatus.currentMissions.length > 0 && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedFloristMissions(floristStatus.currentMissions)
                                      setShowFloristMissionsModal(true)
                                    }}
                                    leftIcon={<Eye className="w-3 h-3" />}
                                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                  >
                                    Voir mission
                                  </Button>
                                )}
                                
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAddFlorist(florist)}
                                  leftIcon={<Plus className="w-3 h-3" />}
                                  className={floristStatus.status === 'on_mission' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                                  title={
                                    floristStatus.status === 'on_mission' ? "Ajouter (déjà sur mission)" :
                                    florist.status === 'unavailable' ? "Ajouter (indisponible)" :
                                    "Ajouter le fleuriste"
                                  }
                                >
                                  Ajouter
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                        
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

            {/* Footer avec actions - Adapté mobile */}
            <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex-shrink-0 ${
              isMobile
                ? 'p-4 pb-6'
                : 'flex items-center justify-between p-6'
            }`}>
              {/* Stats fleuristes - masqué sur mobile pour gagner de l'espace */}
              {!isMobile && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentView === 'assignment' && (
                    <span>
                      👥 {confirmedCount}/{requiredFlorists} fleuriste{requiredFlorists > 1 ? 's' : ''} confirmé{confirmedCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              <div className={`flex items-center ${isMobile ? 'w-full space-x-2' : 'space-x-3'}`}>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  leftIcon={!isMobile ? <X className="w-4 h-4" /> : undefined}
                  className={isMobile ? 'flex-1 text-sm py-2' : ''}
                >
                  {isMobile ? 'Annuler' : 'Annuler'}
                </Button>

                {/* 🆕 BOUTON TEST WORKFLOW - Caché sur mobile car moins prioritaire */}
                {!isMobile && confirmedCount >= requiredFlorists && assignments.some(a => a.status === 'pending') && (
                  <Button
                    variant="outline"
                    onClick={applyWorkflowNow}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    leftIcon={<AlertCircle className="w-4 h-4" />}
                  >
                    🔥 Appliquer Workflow
                  </Button>
                )}

                <Button
                  variant="primary"
                  leftIcon={!isMobile ? <CheckCircle className="w-4 h-4" /> : undefined}
                  onClick={handleSave}
                  className={`bg-green-500 hover:bg-green-600 ${isMobile ? 'flex-1 text-sm py-2' : ''}`}
                >
                  {isMobile ? '✅ Valider' : '✅ Valider & Synchroniser'}
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
                Vous pouvez continuer à envoyer des messages ou cliquer sur "Valider & Synchroniser" quand vous êtes prêt.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowLimitReachedPopup(false)}
                  className="flex-1"
                >
                  Parfait !
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowLimitReachedPopup(false) // Fermer le popup
                    applyWorkflowOnly() // 🔥 Appliquer le workflow automatique SANS sauvegarder
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  OK, continuer
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* ALERTE MAXIMUM ATTEINT */}
        {showMaxReachedAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">
              ⚠️ Limite de confirmations atteinte ! Vous ne pouvez pas confirmer plus de {requiredFlorists} fleuriste{requiredFlorists > 1 ? 's' : ''}.
            </span>
          </motion.div>
        )}
    </AnimatePresence>
  )
}

// Composant FloristCard pour afficher les fleuristes avec actions
interface FloristCardProps {
  florist: LocalFlorist
  status: FloristAssignment['status']
  allEvents: Event[]
  currentEvent: Event | null
  currentEventId: string
  currentEventDate: Date
  currentEventTime: string // BUG #5 FIX: Ajout heure de début
  currentEventEndTime?: string // BUG #5 FIX: Ajout heure de fin
  onStatusChange: (newStatus: FloristAssignment['status']) => void
  onRemove: () => void
  preWrittenMessage?: string // 🆕 Message pré-écrit
}

const FloristCard: React.FC<FloristCardProps> = ({
  florist,
  status,
  allEvents,
  currentEvent,
  currentEventId,
  currentEventDate,
  currentEventTime,
  currentEventEndTime,
  onStatusChange,
  onRemove,
  preWrittenMessage // 🆕 Recevoir le message pré-écrit
}) => {
  const [showConflictWarning, setShowConflictWarning] = useState(false)
  const [showFloristMissionsModal, setShowFloristMissionsModal] = useState(false)
  const [selectedFloristMissions, setSelectedFloristMissions] = useState<Event[]>([])

  const floristStatus = getFloristStatus(florist, allEvents)
  // BUG #5 FIX: Passer les heures pour une détection de conflit précise
  const conflicts = checkFloristConflicts(florist.id, currentEventId, currentEventDate, currentEventTime, currentEventEndTime, allEvents)
  
  // Couleur de la carte selon le statut
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
  
  const handleConfirm = () => {
    if (conflicts.hasConflict) {
      setShowConflictWarning(true)
    } else {
      onStatusChange('confirmed')
    }
  }
  
  const handleForceConfirm = () => {
    setShowConflictWarning(false)
    onStatusChange('confirmed')
  }
  
  return (
    <>
      <div className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 ${getCardStyle()}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {florist.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <span>{florist.name}</span>
              {floristStatus.status === 'on_mission' && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                  {getStatusIcon()} Sur mission
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
              <span>{florist.role}</span>
              {floristStatus.status === 'on_mission' && (
                <div className="flex items-center space-x-1">
                  <span>•</span>
                  <button
                    className="text-blue-600 hover:text-blue-800 underline"
                    onClick={() => setShowConflictWarning(true)}
                    title="Voir les missions en conflit"
                  >
                    Voir mission{floristStatus.currentMissions.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {status === 'confirmed' ? '✅ Confirmé' : '⏳ En attente'}
          </span>
        </div>
        
        {/* PICTOGRAMMES D'ACTION */}
        <div className="flex items-center space-x-2">
          {/* Bulle - Contacter */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('🔥 BOUTON WHATSAPP CLIQUÉ !', {
                florist: florist.name,
                phone: florist.phone,
                preWrittenMessage,
                eventTitle: currentEvent?.title
              })
              
              // 🔥 OUVRIR WHATSAPP ou modal de contact
              const floristName = florist.name
              
              // Message selon le statut
              let message
              if (preWrittenMessage) {
                message = preWrittenMessage
              } else if (status === 'not_selected') {
                message = `Salut ${floristName} ! Merci pour ton intérêt pour l'événement "${currentEvent?.title}". Malheureusement c'est déjà pris, mais je penserai à toi pour les prochaines missions. À bientôt !`
              } else {
                // Message détaillé pour proposition de mission
                const eventDate = currentEvent?.date ? new Date(currentEvent.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : ''
                
                const eventTime = currentEvent?.time || ''
                const eventLocation = currentEvent?.location || ''
                const eventDescription = currentEvent?.description || ''
                
                message = `Salut ${floristName} !

J'ai une mission qui pourrait t'intéresser :

${currentEvent?.title}
${eventDate} à ${eventTime}
${eventLocation}

${eventDescription}

Tu es dispo ? Dis-moi vite !

Mathilde`
              }
              
              console.log('📱 MESSAGE À ENVOYER:', message)
              
              // Ouvrir WhatsApp Business avec ton numéro (format international)
              const businessPhone = '33658006143' // Ton numéro WhatsApp Business (+33)
              const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`
              console.log('🌐 OUVERTURE WHATSAPP:', whatsappUrl)
              window.open(whatsappUrl, '_blank')
            }}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
            title="Contacter le fleuriste via WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </motion.button>
          
          {/* Vert - Confirmer */}
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
          
          {/* 🆕 Rouge - Refuser */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onStatusChange('refused')}
            className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
            title="Refuser le fleuriste"
          >
            <XCircle className="w-4 h-4" />
          </motion.button>
          
          {/* Poubelle - Supprimer */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRemove}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Retirer de l'assignation"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* Modal d'Alerte de Conflit */}
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
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ⚠️ Conflit détecté
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <span className="font-bold text-orange-600">{florist.name}</span> est déjà assigné(e) 
                  à {conflicts.conflictingEvents.length} autre{conflicts.conflictingEvents.length > 1 ? 's' : ''} événement{conflicts.conflictingEvents.length > 1 ? 's' : ''} 
                  le même jour.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Mission{conflicts.conflictingEvents.length > 1 ? 's' : ''} en conflit :
                  </h4>
                  {conflicts.conflictingEvents.map(event => (
                    <div key={event.id} className="mb-2 p-2 bg-white dark:bg-gray-600 rounded border-l-2 border-orange-400">
                      <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.time} - {event.location}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowConflictWarning(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleForceConfirm}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Confirmer quand même
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal des missions du fleuriste */}
      <AnimatePresence>
        {showFloristMissionsModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Missions du fleuriste
                  </h3>
                  <button
                    onClick={() => setShowFloristMissionsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {selectedFloristMissions.length > 0 ? (
                    selectedFloristMissions.map(mission => (
                      <div key={mission.id} className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-medium text-gray-800">{mission.title}</h4>
                        <p className="text-sm text-gray-600">Client: {mission.clientName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {mission.date instanceof Date ? mission.date.toLocaleString() : new Date(mission.date).toLocaleString()}
                        </p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            mission.status === EventStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                            mission.status === EventStatus.DRAFT || mission.status === EventStatus.PLANNING ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {mission.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Aucune mission trouvée</p>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowFloristMissionsModal(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default EventModal