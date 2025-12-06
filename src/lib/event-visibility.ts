// 📅 GESTION DE LA VISIBILITÉ TEMPORELLE DES ÉVÉNEMENTS
// Logique pour masquer les événements payés après la fin du mois

import { Event, EventStatus } from '@/types'
import { endOfMonth, isAfter } from 'date-fns'

export class EventVisibilityManager {
  /**
   * Détermine si un événement PAID doit être visible dans le Kanban
   * Les événements PAID sont visibles jusqu'à la fin du mois en cours
   */
  static isPaidEventVisibleInKanban(event: Event): boolean {
    // Si ce n'est pas un événement payé, il est toujours visible
    if (event.status !== EventStatus.PAID) {
      return true
    }
    
    // Pour les événements payés, vérifier la date de paiement
    const paymentDate = event.paidDate || event.updatedAt || event.createdAt
    const endOfCurrentMonth = endOfMonth(new Date())
    
    // Si la date de paiement est dans le mois en cours, il reste visible
    return !isAfter(new Date(), endOfCurrentMonth) || 
           !isAfter(paymentDate, endOfCurrentMonth)
  }
  
  /**
   * Filtre les événements pour le Kanban (masque les événements payés expirés)
   */
  static filterEventsForKanban(events: Event[]): Event[] {
    return events.filter(event => this.isPaidEventVisibleInKanban(event))
  }
  
  /**
   * Filtre les événements pour l'onglet Événements (tous visibles)
   */
  static filterEventsForList(events: Event[]): Event[] {
    // Tous les événements sont visibles dans l'onglet Événements
    return events
  }
  
  /**
   * Compte combien d'événements payés vont bientôt être masqués du Kanban
   */
  static countPaidEventsToHide(events: Event[]): number {
    const paidEvents = events.filter(e => e.status === EventStatus.PAID)
    const visibleInKanban = this.filterEventsForKanban(paidEvents)
    return paidEvents.length - visibleInKanban.length
  }
  
  /**
   * Obtient les jours restants avant que les événements payés soient masqués
   */
  static getDaysUntilPaidEventsHidden(): number {
    const now = new Date()
    const endOfCurrentMonth = endOfMonth(now)
    const diffTime = endOfCurrentMonth.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }
  
  /**
   * Message informatif sur la visibilité des événements payés
   */
  static getPaidVisibilityMessage(): string {
    const daysLeft = this.getDaysUntilPaidEventsHidden()
    
    if (daysLeft === 0) {
      return "Les événements payés de ce mois ne sont plus visibles dans le Kanban"
    } else if (daysLeft === 1) {
      return "Les événements payés seront masqués du Kanban demain"
    } else if (daysLeft <= 7) {
      return `Les événements payés seront masqués du Kanban dans ${daysLeft} jours`
    } else {
      return `Les événements payés restent visibles dans le Kanban ${daysLeft} jours`
    }
  }
  
  /**
   * Debug : Affiche les informations de visibilité
   */
  static debugVisibility(events: Event[]): void {
    const paidEvents = events.filter(e => e.status === EventStatus.PAID)
    const visibleInKanban = this.filterEventsForKanban(paidEvents)
    
    console.log('📊 Visibilité des événements payés:')
    console.log(`   Total payés: ${paidEvents.length}`)
    console.log(`   Visibles Kanban: ${visibleInKanban.length}`)
    console.log(`   Jours restants: ${this.getDaysUntilPaidEventsHidden()}`)
    console.log(`   Message: ${this.getPaidVisibilityMessage()}`)
    
    if (paidEvents.length > visibleInKanban.length) {
      const hidden = paidEvents.filter(e => !visibleInKanban.includes(e))
      console.log(`   Événements masqués:`, hidden.map(e => e.title))
    }
  }
}

export default EventVisibilityManager