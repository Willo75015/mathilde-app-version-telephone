// 🚨 SYSTÈME D'URGENCE INTELLIGENT
// Logique pour prioriser les événements selon les vrais besoins

import { Event, EventStatus } from '@/types'

export interface UrgencyInfo {
  level: number          // 1-5 (5 = le plus urgent)
  label: string         // Description de l'urgence
  color: string         // Couleur d'affichage
  priority: string      // Catégorie de priorité
  reasons: string[]     // Raisons spécifiques de l'urgence
  actionNeeded: string  // Action recommandée
}

export class SmartUrgencyCalculator {
  
  /**
   * Calcule l'urgence intelligente d'un événement
   * Priorise les événements à planifier selon personnel et proximité
   */
  static calculateUrgency(event: Event): UrgencyInfo {
    const now = new Date()
    const eventDate = new Date(event.date)
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // 🔧 CORRECTION : Vérifier si l'événement est vraiment terminé (avec endDate si multi-jours)
    const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate
    const daysUntilEventEnd = Math.ceil((eventEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // 🚫 EXCLURE les événements passés (seulement si endDate est aussi passée)
    if (daysUntilEventEnd < 0) {
      return {
        level: 0,
        label: 'Événement passé',
        color: 'gray',
        priority: 'none',
        reasons: ['Événement déjà passé'],
        actionNeeded: 'Archiver ou marquer comme terminé'
      }
    }
    
    // 🚫 EXCLURE les événements terminés/annulés
    if (event.status === EventStatus.COMPLETED || 
        event.status === EventStatus.PAID || 
        event.status === EventStatus.INVOICED || 
        event.status === EventStatus.CANCELLED) {
      return {
        level: 0,
        label: 'Événement finalisé',
        color: 'gray',
        priority: 'none',
        reasons: ['Événement finalisé'],
        actionNeeded: 'Aucune action requise'
      }
    }
    
    const reasons: string[] = []
    let urgencyLevel = 1
    let actionNeeded = 'Surveiller'
    
    // 🎯 PRIORITÉ 1 : Événements à planifier (DRAFT)
    if (event.status === EventStatus.DRAFT) {
      reasons.push('Événement non planifié')
      urgencyLevel += 2
      actionNeeded = 'Planifier et confirmer'
    }
    
    // ⏰ PRIORITÉ 2 : Proximité temporelle (avec gestion événements en cours)
    const isEventInProgress = daysUntilEvent < 0 && daysUntilEventEnd >= 0
    
    if (isEventInProgress) {
      reasons.push('Événement en cours')
      urgencyLevel += 3
      actionNeeded = 'Gérer l\'événement en cours'
    } else if (daysUntilEvent === 0) {
      reasons.push('Événement aujourd\'hui')
      urgencyLevel += 3
      actionNeeded = event.status === EventStatus.DRAFT ? 'CONFIRMER IMMÉDIATEMENT' : 'Vérifier préparation'
    } else if (daysUntilEvent === 1) {
      reasons.push('Événement demain')
      urgencyLevel += 2
      actionNeeded = event.status === EventStatus.DRAFT ? 'Confirmer rapidement' : 'Préparer équipe'
    } else if (daysUntilEvent <= 3) {
      reasons.push('Événement dans 2-3 jours')
      urgencyLevel += 1
    } else if (daysUntilEvent <= 7) {
      reasons.push('Événement cette semaine')
    }
    
    // 👥 PRIORITÉ 3 : Personnel manquant (simulé pour l'instant)
    const requiredFlorists = event.floristsRequired || this.estimateFloristsNeeded(event.budget)
    const assignedFlorists = event.assignedFlorists?.length || 0
    const missingFlorists = requiredFlorists - assignedFlorists
    
    if (missingFlorists > 0) {
      reasons.push(`${missingFlorists} fleuriste${missingFlorists > 1 ? 's' : ''} manquant${missingFlorists > 1 ? 's' : ''}`)
      urgencyLevel += Math.min(missingFlorists, 2) // Max +2 pour personnel
      
      if (actionNeeded === 'Surveiller') {
        actionNeeded = 'Assigner des fleuristes'
      }
    }
    
    // 💰 FACTEUR : Budget élevé = plus urgent
    if (event.budget > 2000) {
      reasons.push('Budget élevé')
      urgencyLevel += 1
    }
    
    // 🏷️ Déterminer le label et la couleur
    const cappedLevel = Math.min(urgencyLevel, 5)
    const { label, color, priority } = this.getUrgencyDisplay(cappedLevel, event.status, daysUntilEvent)
    
    return {
      level: cappedLevel,
      label,
      color,
      priority,
      reasons,
      actionNeeded
    }
  }
  
  /**
   * Filtre et trie les événements urgents
   * NOUVELLE LOGIQUE : Priorité absolue à la proximité temporelle
   */
  static getUrgentEvents(events: Event[], maxCount: number = 3): (Event & { urgency: UrgencyInfo })[] {
    const eventsWithUrgency = events
      .map(event => ({
        ...event,
        urgency: this.calculateUrgency(event)
      }))
      .filter(event => event.urgency.level > 0) // Exclure les événements passés/finalisés
      .sort((a, b) => {
        // 🎯 LOGIQUE BILL : Tri par DATE uniquement (plus proche = plus prioritaire)
        // Peu importe le statut (DRAFT ou autre), seule la proximité compte
        const aDays = Math.ceil((new Date(a.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const bDays = Math.ceil((new Date(b.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        if (aDays !== bDays) {
          return aDays - bDays // Plus proche = plus prioritaire
        }
        
        // En cas d'égalité de date, tri par niveau d'urgence
        return b.urgency.level - a.urgency.level
      })
    
    return eventsWithUrgency.slice(0, maxCount)
  }
  
  /**
   * Estimation du nombre de fleuristes nécessaires selon le budget
   */
  private static estimateFloristsNeeded(budget: number): number {
    if (budget < 500) return 1
    if (budget < 1500) return 2
    if (budget < 3000) return 3
    return 4
  }
  
  /**
   * Détermine l'affichage selon le niveau d'urgence
   */
  private static getUrgencyDisplay(level: number, status: EventStatus, daysUntil: number) {
    if (level >= 5) {
      return {
        label: daysUntil === 0 ? 'CRITIQUE - AUJOURD\'HUI' : 'CRITIQUE - URGENT',
        color: 'red',
        priority: 'critical'
      }
    }
    if (level >= 4) {
      return {
        label: status === EventStatus.DRAFT ? 'URGENT - À PLANIFIER' : 'URGENT - PRÉPARER',
        color: 'orange', 
        priority: 'high'
      }
    }
    if (level >= 3) {
      return {
        label: status === EventStatus.DRAFT ? 'IMPORTANT - À CONFIRMER' : 'IMPORTANT - SURVEILLER',
        color: 'yellow',
        priority: 'medium'
      }
    }
    
    return {
      label: 'NORMAL',
      color: 'green',
      priority: 'low'
    }
  }
}

export default SmartUrgencyCalculator