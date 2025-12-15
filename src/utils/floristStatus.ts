import { Florist, FloristAvailability, UnavailabilityPeriod, Event, FloristStatusCalculation } from '@/types'

/**
 * Calcule automatiquement le statut d'un fleuriste selon :
 * 1. Les événements assignés (priorité max)
 * 2. Les périodes d'indisponibilité 
 * 3. Statut par défaut (disponible)
 */
export class FloristStatusManager {
  
  /**
   * Calcule le statut actuel d'un fleuriste
   */
  static calculateCurrentStatus(
    florist: Florist, 
    assignedEvents: Event[] = []
  ): FloristStatusCalculation {
    const now = new Date()
    
    // 1. PRIORITÉ MAX : Événements assignés (programmé sur mission)
    const currentEvent = this.getCurrentAssignedEvent(assignedEvents, now)
    if (currentEvent) {
      return {
        currentStatus: FloristAvailability.ON_MISSION,
        reason: `Assigné à "${currentEvent.title}"`,
        nextStatusChange: currentEvent.endDate || this.addHours(currentEvent.date, 8),
        assignedEvents: [currentEvent.id]
      }
    }
    
    // 2. PRIORITÉ MOYENNE : Périodes d'indisponibilité
    const currentUnavailability = this.getCurrentUnavailabilityPeriod(florist.unavailabilityPeriods || [], now)
    if (currentUnavailability) {
      return {
        currentStatus: FloristAvailability.UNAVAILABLE,
        reason: currentUnavailability.reason || 'Période d\'indisponibilité',
        nextStatusChange: currentUnavailability.endDate,
        assignedEvents: []
      }
    }
    
    // 3. Vérifier les prochains événements (dans les 24h)
    const upcomingEvent = this.getUpcomingEvent(assignedEvents, now)
    if (upcomingEvent) {
      return {
        currentStatus: FloristAvailability.AVAILABLE,
        reason: `Disponible (prochain événement: ${upcomingEvent.title})`,
        nextStatusChange: upcomingEvent.date,
        assignedEvents: [upcomingEvent.id]
      }
    }
    
    // 4. DÉFAUT : Disponible
    return {
      currentStatus: FloristAvailability.AVAILABLE,
      reason: 'Disponible',
      assignedEvents: []
    }
  }
  
  /**
   * Vérifie si le fleuriste a un événement en cours
   */
  private static getCurrentAssignedEvent(events: Event[], now: Date): Event | null {
    return events.find(event => {
      const eventStart = event.date
      const eventEnd = event.endDate || this.addHours(event.date, 8) // 8h par défaut
      return now >= eventStart && now <= eventEnd
    }) || null
  }
  
  /**
   * Vérifie si le fleuriste est dans une période d'indisponibilité
   */
  private static getCurrentUnavailabilityPeriod(periods: UnavailabilityPeriod[], now: Date): UnavailabilityPeriod | null {
    return periods.find(period => {
      return now >= period.startDate && now <= period.endDate
    }) || null
  }
  
  /**
   * Trouve le prochain événement assigné (dans les 24h)
   */
  private static getUpcomingEvent(events: Event[], now: Date): Event | null {
    const next24h = this.addHours(now, 24)
    
    return events
      .filter(event => event.date > now && event.date <= next24h)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0] || null
  }
  
  /**
   * Met à jour automatiquement le statut d'un fleuriste
   */
  static updateFloristStatus(florist: Florist, assignedEvents: Event[] = []): Florist {
    const statusCalculation = this.calculateCurrentStatus(florist, assignedEvents)
    
    return {
      ...florist,
      availability: statusCalculation.currentStatus,
      unavailabilityPeriods: this.updateUnavailabilityPeriods(florist.unavailabilityPeriods || [])
    }
  }
  
  /**
   * Met à jour les périodes d'indisponibilité (marque comme actives/inactives)
   * 🔧 CORRECTION : Ne pas écraser l'état isActive s'il est déjà défini manuellement
   */
  private static updateUnavailabilityPeriods(periods: UnavailabilityPeriod[]): UnavailabilityPeriod[] {
    const now = new Date()
    
    return periods.map(period => {
      // 🔧 PRÉSERVER L'ÉTAT ISACTIVE EXISTANT
      // Si isActive est déjà défini (true ou false), le conserver
      // Sinon, calculer automatiquement basé sur les dates
      const shouldAutoCalculate = period.isActive === undefined || period.isActive === null
      
      return {
        ...period,
        isActive: shouldAutoCalculate 
          ? (now >= period.startDate && now <= period.endDate)
          : period.isActive // Conserver l'état existant
      }
    })
  }
  
  /**
   * Vérifie tous les fleuristes et met à jour leurs statuts
   */
  static updateAllFloristStatuses(
    florists: Florist[], 
    allEvents: Event[]
  ): Florist[] {
    return florists.map(florist => {
      // Trouve les événements assignés à ce fleuriste
      const assignedEvents = allEvents.filter(event =>
        event.assignedFlorists?.some(f => f.id === florist.id)
      )
      
      return this.updateFloristStatus(florist, assignedEvents)
    })
  }
  
  /**
   * Obtient un résumé du planning d'un fleuriste
   */
  static getFloristScheduleSummary(florist: Florist, assignedEvents: Event[] = []): {
    today: string
    tomorrow: string
    thisWeek: number
    nextUnavailability?: UnavailabilityPeriod
  } {
    const now = new Date()
    const tomorrow = this.addDays(now, 1)
    const weekEnd = this.addDays(now, 7)
    
    const todayStatus = this.calculateCurrentStatus(florist, assignedEvents)
    const tomorrowEvents = assignedEvents.filter(event => 
      this.isSameDay(event.date, tomorrow)
    )
    
    const weekEvents = assignedEvents.filter(event => 
      event.date >= now && event.date <= weekEnd
    )
    
    const nextUnavailability = (florist.unavailabilityPeriods || [])
      .filter(period => period.startDate > now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0]
    
    return {
      today: todayStatus.reason,
      tomorrow: tomorrowEvents.length > 0 
        ? `${tomorrowEvents.length} événement(s)` 
        : 'Disponible',
      thisWeek: weekEvents.length,
      nextUnavailability
    }
  }
  
  // Utilitaires de date
  private static addHours(date: Date, hours: number): Date {
    const result = new Date(date)
    result.setHours(result.getHours() + hours)
    return result
  }
  
  private static addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString()
  }
}

/**
 * Hook React pour utiliser le gestionnaire de statut
 */
export const useFloristStatus = (florist: Florist, assignedEvents: Event[] = []) => {
  const statusCalculation = FloristStatusManager.calculateCurrentStatus(florist, assignedEvents)
  const scheduleSummary = FloristStatusManager.getFloristScheduleSummary(florist, assignedEvents)
  
  return {
    currentStatus: statusCalculation.currentStatus,
    statusReason: statusCalculation.reason,
    nextStatusChange: statusCalculation.nextStatusChange,
    scheduleSummary,
    isOnMission: statusCalculation.currentStatus === FloristAvailability.ON_MISSION,
    isUnavailable: statusCalculation.currentStatus === FloristAvailability.UNAVAILABLE,
    isAvailable: statusCalculation.currentStatus === FloristAvailability.AVAILABLE
  }
}
