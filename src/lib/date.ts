/**
 * 📅 MATHILDE FLEURS - UTILITAIRES DE DATES
 * Gestion complète des dates avec formatage français et logique métier
 */

import { SEASONS, SEASON_MONTHS } from './constants'

// Types pour les dates
export type DateFormat =
  | 'dd/MM/yyyy'
  | 'dd/MM/yyyy HH:mm'
  | 'dd MMMM yyyy'
  | 'EEEE dd MMMM yyyy'
  | 'dd MMM yyyy'
  | 'HH:mm'
  | 'iso'
  | 'yyyy-MM-dd'

export type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

export interface DateRange {
  start: Date
  end: Date
}

export interface EventDateInfo {
  date: Date
  isToday: boolean
  isTomorrow: boolean
  isThisWeek: boolean
  isThisMonth: boolean
  isPast: boolean
  daysUntil: number
  season: keyof typeof SEASONS
  formattedDate: string
  formattedTime: string
  relativeText: string
}

/**
 * Classe principale pour la gestion des dates
 */
export class DateUtils {
  private static readonly FRENCH_MONTHS = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ]

  private static readonly FRENCH_DAYS = [
    'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'
  ]

  private static readonly FRENCH_SHORT_MONTHS = [
    'jan', 'fév', 'mar', 'avr', 'mai', 'jun',
    'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'
  ]

  /**
   * Formater une date selon le format spécifié
   */
  static format(date: Date, format: DateFormat = 'dd/MM/yyyy'): string {
    if (!date || isNaN(date.getTime())) {
      return 'Date invalide'
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    const monthName = this.FRENCH_MONTHS[date.getMonth()]
    const shortMonthName = this.FRENCH_SHORT_MONTHS[date.getMonth()]
    const dayName = this.FRENCH_DAYS[date.getDay()]

    switch (format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`
      
      case 'dd/MM/yyyy HH:mm':
        return `${day}/${month}/${year} ${hours}:${minutes}`
      
      case 'dd MMMM yyyy':
        return `${day} ${monthName} ${year}`
      
      case 'EEEE dd MMMM yyyy':
        return `${dayName} ${day} ${monthName} ${year}`
      
      case 'dd MMM yyyy':
        return `${day} ${shortMonthName} ${year}`
      
      case 'HH:mm':
        return `${hours}:${minutes}`
      
      case 'iso':
        return date.toISOString()

      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`

      default:
        return `${day}/${month}/${year}`
    }
  }

  /**
   * Parser une chaîne de date française
   */
  static parse(dateString: string): Date | null {
    if (!dateString) return null

    // Format dd/MM/yyyy ou dd/MM/yyyy HH:mm
    const frenchDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/
    const match = dateString.match(frenchDateRegex)

    if (match) {
      const [, day, month, year, hours = '0', minutes = '0'] = match
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // Mois base 0
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      )
      
      return isNaN(date.getTime()) ? null : date
    }

    // Fallback vers Date.parse
    const parsed = new Date(dateString)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  /**
   * Obtenir des informations complètes sur une date d'événement
   */
  static getEventDateInfo(eventDate: Date): EventDateInfo {
    const now = new Date()
    const today = this.startOfDay(now)
    const tomorrow = this.addDays(today, 1)
    const eventDay = this.startOfDay(eventDate)

    const isToday = this.isSameDay(eventDate, now)
    const isTomorrow = this.isSameDay(eventDate, tomorrow)
    const isThisWeek = this.isSameWeek(eventDate, now)
    const isThisMonth = this.isSameMonth(eventDate, now)
    const isPast = eventDate < now
    const daysUntil = this.differenceInDays(eventDay, today)

    return {
      date: eventDate,
      isToday,
      isTomorrow,
      isThisWeek,
      isThisMonth,
      isPast,
      daysUntil,
      season: this.getSeason(eventDate),
      formattedDate: this.format(eventDate, 'dd MMMM yyyy'),
      formattedTime: this.format(eventDate, 'HH:mm'),
      relativeText: this.getRelativeText(eventDate)
    }
  }

  /**
   * Texte relatif pour une date (aujourd'hui, demain, dans 3 jours...)
   */
  static getRelativeText(date: Date): string {
    const now = new Date()
    const diffInDays = this.differenceInDays(this.startOfDay(date), this.startOfDay(now))

    if (diffInDays === 0) return "Aujourd'hui"
    if (diffInDays === 1) return "Demain"
    if (diffInDays === -1) return "Hier"
    if (diffInDays > 1 && diffInDays <= 7) return `Dans ${diffInDays} jours`
    if (diffInDays < -1 && diffInDays >= -7) return `Il y a ${Math.abs(diffInDays)} jours`
    if (diffInDays > 7) return `Dans ${Math.ceil(diffInDays / 7)} semaine${Math.ceil(diffInDays / 7) > 1 ? 's' : ''}`
    if (diffInDays < -7) return `Il y a ${Math.ceil(Math.abs(diffInDays) / 7)} semaine${Math.ceil(Math.abs(diffInDays) / 7) > 1 ? 's' : ''}`

    return this.format(date, 'dd MMM yyyy')
  }

  /**
   * Déterminer la saison d'une date
   */
  static getSeason(date: Date): keyof typeof SEASONS {
    const month = date.getMonth() + 1 // Base 1

    for (const [season, months] of Object.entries(SEASON_MONTHS)) {
      if ((months as readonly number[]).includes(month)) {
        return season.toUpperCase() as keyof typeof SEASONS
      }
    }

    return 'SPRING' // Fallback
  }

  /**
   * Vérifier si une date est dans le passé
   */
  static isPast(date: Date): boolean {
    return date < new Date()
  }

  /**
   * Vérifier si une date est dans le futur
   */
  static isFuture(date: Date): boolean {
    return date > new Date()
  }

  /**
   * Vérifier si c'est le même jour
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  /**
   * Vérifier si c'est la même semaine
   */
  static isSameWeek(date1: Date, date2: Date): boolean {
    const startOfWeek1 = this.startOfWeek(date1)
    const startOfWeek2 = this.startOfWeek(date2)
    return this.isSameDay(startOfWeek1, startOfWeek2)
  }

  /**
   * Vérifier si c'est le même mois
   */
  static isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  /**
   * Début de la journée (00:00:00)
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  /**
   * Fin de la journée (23:59:59)
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  /**
   * Début de la semaine (lundi)
   */
  static startOfWeek(date: Date): Date {
    const result = this.startOfDay(date)
    const day = result.getDay()
    const diff = result.getDate() - day + (day === 0 ? -6 : 1) // Lundi = 1
    result.setDate(diff)
    return result
  }

  /**
   * Fin de la semaine (dimanche)
   */
  static endOfWeek(date: Date): Date {
    const result = this.startOfWeek(date)
    result.setDate(result.getDate() + 6)
    return this.endOfDay(result)
  }

  /**
   * Début du mois
   */
  static startOfMonth(date: Date): Date {
    const result = new Date(date)
    result.setDate(1)
    return this.startOfDay(result)
  }

  /**
   * Fin du mois
   */
  static endOfMonth(date: Date): Date {
    const result = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return this.endOfDay(result)
  }

  /**
   * Ajouter des jours
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  /**
   * Ajouter des mois
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }

  /**
   * Ajouter une durée
   */
  static add(date: Date, amount: number, unit: TimeUnit): Date {
    const result = new Date(date)

    switch (unit) {
      case 'minute':
        result.setMinutes(result.getMinutes() + amount)
        break
      case 'hour':
        result.setHours(result.getHours() + amount)
        break
      case 'day':
        result.setDate(result.getDate() + amount)
        break
      case 'week':
        result.setDate(result.getDate() + (amount * 7))
        break
      case 'month':
        result.setMonth(result.getMonth() + amount)
        break
      case 'year':
        result.setFullYear(result.getFullYear() + amount)
        break
    }

    return result
  }

  /**
   * Différence en jours entre deux dates
   */
  static differenceInDays(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000 // millisecondes dans un jour
    return Math.round((date1.getTime() - date2.getTime()) / oneDay)
  }

  /**
   * Différence en heures entre deux dates
   */
  static differenceInHours(date1: Date, date2: Date): number {
    const oneHour = 60 * 60 * 1000 // millisecondes dans une heure
    return Math.round((date1.getTime() - date2.getTime()) / oneHour)
  }

  /**
   * Générer une plage de dates
   */
  static getDateRange(start: Date, end: Date): DateRange {
    return {
      start: this.startOfDay(start),
      end: this.endOfDay(end)
    }
  }

  /**
   * Générer toutes les dates entre deux dates
   */
  static getDatesInRange(start: Date, end: Date): Date[] {
    const dates: Date[] = []
    const current = new Date(start)

    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  /**
   * Vérifier si une date est dans une plage
   */
  static isInRange(date: Date, range: DateRange): boolean {
    return date >= range.start && date <= range.end
  }

  /**
   * Obtenir le nombre de jours ouvrables entre deux dates
   */
  static getWorkingDays(start: Date, end: Date): number {
    let count = 0
    const current = new Date(start)

    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Pas dimanche (0) ni samedi (6)
        count++
      }
      current.setDate(current.getDate() + 1)
    }

    return count
  }

  /**
   * Obtenir les dates d'événements pour un calendrier
   */
  static getCalendarDates(year: number, month: number): Date[] {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = this.startOfWeek(firstDay)
    const endDate = this.endOfWeek(lastDay)

    return this.getDatesInRange(startDate, endDate)
  }

  /**
   * Valider une chaîne de temps (HH:MM)
   */
  static isValidTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  /**
   * Parser une chaîne de temps vers des heures et minutes
   */
  static parseTime(time: string): { hours: number; minutes: number } | null {
    if (!this.isValidTime(time)) return null

    const [hours, minutes] = time.split(':').map(Number)
    return { hours, minutes }
  }

  /**
   * Combiner une date et un temps
   */
  static combineDateTime(date: Date, time: string): Date | null {
    const parsed = this.parseTime(time)
    if (!parsed) return null

    const result = new Date(date)
    result.setHours(parsed.hours, parsed.minutes, 0, 0)
    return result
  }

  /**
   * Obtenir les créneaux horaires disponibles
   */
  static getTimeSlots(
    startTime: string = '09:00',
    endTime: string = '18:00',
    intervalMinutes: number = 30
  ): string[] {
    const slots: string[] = []
    const start = this.parseTime(startTime)
    const end = this.parseTime(endTime)

    if (!start || !end) return slots

    let currentMinutes = start.hours * 60 + start.minutes
    const endMinutes = end.hours * 60 + end.minutes

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60)
      const minutes = currentMinutes % 60
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
      currentMinutes += intervalMinutes
    }

    return slots
  }

  /**
   * Formater une durée en texte lisible
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours} heure${hours > 1 ? 's' : ''}`
    }

    return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
  }

  /**
   * Calculer l'âge à partir d'une date de naissance
   */
  static calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  /**
   * Obtenir le fuseau horaire local
   */
  static getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  /**
   * Convertir une date vers un fuseau horaire spécifique
   */
  static toTimezone(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
}

// Raccourcis pour les fonctions les plus utilisées
export const {
  format,
  parse,
  getEventDateInfo,
  getRelativeText,
  getSeason,
  isPast,
  isFuture,
  isSameDay,
  startOfDay,
  endOfDay,
  addDays,
  addMonths,
  differenceInDays,
  getDateRange,
  isValidTime,
  combineDateTime,
  getTimeSlots,
  formatDuration
} = DateUtils

// Export par défaut
export default DateUtils

// Constantes utiles
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy' as const,
  LONG: 'dd MMMM yyyy' as const,
  FULL: 'EEEE dd MMMM yyyy' as const,
  TIME: 'HH:mm' as const,
  DATETIME: 'dd/MM/yyyy HH:mm' as const
}

export const COMMON_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
]
