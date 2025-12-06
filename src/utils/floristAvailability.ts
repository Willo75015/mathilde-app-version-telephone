import { Florist, UnavailabilityPeriod } from '@/types'

/**
 * Vérifie si une date est dans une période d'indisponibilité
 */
export const isDateUnavailable = (
  date: Date,
  unavailabilityPeriods: UnavailabilityPeriod[]
): { isUnavailable: boolean; reason?: string } => {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0) // Normaliser à minuit
  
  for (const period of unavailabilityPeriods) {
    const startDate = new Date(period.startDate)
    const endDate = new Date(period.endDate)
    
    // Normaliser les dates à minuit pour comparaison
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    
    if (targetDate >= startDate && targetDate <= endDate) {
      return {
        isUnavailable: true,
        reason: period.reason || 'Période d\'indisponibilité'
      }
    }
  }
  
  return { isUnavailable: false }
}

/**
 * Obtient les périodes d'indisponibilité du fleuriste principal (Billsantec)
 */
export const getMainFloristUnavailability = (florists: Florist[]): UnavailabilityPeriod[] => {
  // Chercher le fleuriste principal (Billsantec)
  const mainFlorist = florists.find(f => 
    f.firstName === 'Bill' || 
    f.lastName === 'Billsantec' ||
    f.email?.toLowerCase().includes('bill') ||
    f.isMainFlorist === true
  )
  
  return mainFlorist?.unavailabilityPeriods || []
}

/**
 * Valide si une date d'événement est disponible
 */
export const validateEventDate = (
  date: Date,
  florists: Florist[]
): { isValid: boolean; error?: string } => {
  const unavailabilityPeriods = getMainFloristUnavailability(florists)
  const { isUnavailable, reason } = isDateUnavailable(date, unavailabilityPeriods)
  
  if (isUnavailable) {
    return {
      isValid: false,
      error: `❌ Date indisponible : ${reason}`
    }
  }
  
  return { isValid: true }
}
