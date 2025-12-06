/**
 * 🧪 TESTS - Utilitaires de dates
 * Tests complets pour src/lib/date.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DateUtils, format, parse, getRelativeText, getSeason } from '../../src/lib/date'

describe('DateUtils', () => {
  beforeEach(() => {
    // Mock de Date pour des tests déterministes
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T10:30:00.000Z')) // Samedi 15 juin 2024, 10:30
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('format', () => {
    const testDate = new Date('2024-06-15T14:30:00')

    it('devrait formater au format dd/MM/yyyy', () => {
      expect(format(testDate, 'dd/MM/yyyy')).toBe('15/06/2024')
    })

    it('devrait formater avec l\'heure', () => {
      expect(format(testDate, 'dd/MM/yyyy HH:mm')).toBe('15/06/2024 14:30')
    })

    it('devrait formater en français long', () => {
      expect(format(testDate, 'dd MMMM yyyy')).toBe('15 juin 2024')
    })

    it('devrait formater avec le jour de la semaine', () => {
      expect(format(testDate, 'EEEE dd MMMM yyyy')).toBe('samedi 15 juin 2024')
    })

    it('devrait formater en format court', () => {
      expect(format(testDate, 'dd MMM yyyy')).toBe('15 jun 2024')
    })

    it('devrait formater l\'heure seule', () => {
      expect(format(testDate, 'HH:mm')).toBe('14:30')
    })

    it('devrait formater en ISO', () => {
      expect(format(testDate, 'iso')).toBe(testDate.toISOString())
    })

    it('devrait gérer les dates invalides', () => {
      expect(format(new Date('invalid'))).toBe('Date invalide')
    })
  })

  describe('parse', () => {
    it('devrait parser une date française dd/MM/yyyy', () => {
      const parsed = parse('15/06/2024')
      expect(parsed).toBeInstanceOf(Date)
      expect(parsed?.getDate()).toBe(15)
      expect(parsed?.getMonth()).toBe(5) // Juin = 5 (base 0)
      expect(parsed?.getFullYear()).toBe(2024)
    })

    it('devrait parser avec l\'heure', () => {
      const parsed = parse('15/06/2024 14:30')
      expect(parsed?.getHours()).toBe(14)
      expect(parsed?.getMinutes()).toBe(30)
    })

    it('devrait gérer les formats invalides', () => {
      expect(parse('invalid')).toBeNull()
      expect(parse('')).toBeNull()
    })

    it('devrait gérer les dates invalides', () => {
      expect(parse('32/13/2024')).toBeNull()
    })
  })

  describe('getRelativeText', () => {
    it('devrait retourner "Aujourd\'hui" pour maintenant', () => {
      const now = new Date()
      expect(getRelativeText(now)).toBe("Aujourd'hui")
    })

    it('devrait retourner "Demain" pour demain', () => {
      const tomorrow = DateUtils.addDays(new Date(), 1)
      expect(getRelativeText(tomorrow)).toBe("Demain")
    })

    it('devrait retourner "Hier" pour hier', () => {
      const yesterday = DateUtils.addDays(new Date(), -1)
      expect(getRelativeText(yesterday)).toBe("Hier")
    })

    it('devrait retourner "Dans X jours" pour le futur proche', () => {
      const inThreeDays = DateUtils.addDays(new Date(), 3)
      expect(getRelativeText(inThreeDays)).toBe("Dans 3 jours")
    })

    it('devrait retourner "Il y a X jours" pour le passé proche', () => {
      const threeDaysAgo = DateUtils.addDays(new Date(), -3)
      expect(getRelativeText(threeDaysAgo)).toBe("Il y a 3 jours")
    })

    it('devrait retourner en semaines pour les dates éloignées', () => {
      const inTwoWeeks = DateUtils.addDays(new Date(), 14)
      expect(getRelativeText(inTwoWeeks)).toBe("Dans 2 semaines")
    })
  })

  describe('getSeason', () => {
    it('devrait retourner "spring" pour le printemps', () => {
      expect(getSeason(new Date('2024-04-15'))).toBe('spring')
    })

    it('devrait retourner "summer" pour l\'été', () => {
      expect(getSeason(new Date('2024-07-15'))).toBe('summer')
    })

    it('devrait retourner "autumn" pour l\'automne', () => {
      expect(getSeason(new Date('2024-10-15'))).toBe('autumn')
    })

    it('devrait retourner "winter" pour l\'hiver', () => {
      expect(getSeason(new Date('2024-01-15'))).toBe('winter')
    })
  })

  describe('isSameDay', () => {
    it('devrait identifier le même jour', () => {
      const date1 = new Date('2024-06-15T10:00:00')
      const date2 = new Date('2024-06-15T20:00:00')
      expect(DateUtils.isSameDay(date1, date2)).toBe(true)
    })

    it('devrait identifier des jours différents', () => {
      const date1 = new Date('2024-06-15T10:00:00')
      const date2 = new Date('2024-06-16T10:00:00')
      expect(DateUtils.isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('isSameWeek', () => {
    it('devrait identifier la même semaine', () => {
      const monday = new Date('2024-06-10') // Lundi
      const friday = new Date('2024-06-14') // Vendredi de la même semaine
      expect(DateUtils.isSameWeek(monday, friday)).toBe(true)
    })

    it('devrait identifier des semaines différentes', () => {
      const thisWeek = new Date('2024-06-10')
      const nextWeek = new Date('2024-06-17')
      expect(DateUtils.isSameWeek(thisWeek, nextWeek)).toBe(false)
    })
  })

  describe('startOfDay', () => {
    it('devrait retourner le début de la journée', () => {
      const date = new Date('2024-06-15T14:30:45.123')
      const startOfDay = DateUtils.startOfDay(date)
      
      expect(startOfDay.getHours()).toBe(0)
      expect(startOfDay.getMinutes()).toBe(0)
      expect(startOfDay.getSeconds()).toBe(0)
      expect(startOfDay.getMilliseconds()).toBe(0)
    })
  })

  describe('endOfDay', () => {
    it('devrait retourner la fin de la journée', () => {
      const date = new Date('2024-06-15T14:30:45.123')
      const endOfDay = DateUtils.endOfDay(date)
      
      expect(endOfDay.getHours()).toBe(23)
      expect(endOfDay.getMinutes()).toBe(59)
      expect(endOfDay.getSeconds()).toBe(59)
      expect(endOfDay.getMilliseconds()).toBe(999)
    })
  })

  describe('startOfWeek', () => {
    it('devrait retourner le lundi de la semaine', () => {
      const friday = new Date('2024-06-14') // Vendredi
      const startOfWeek = DateUtils.startOfWeek(friday)
      
      expect(startOfWeek.getDay()).toBe(1) // Lundi
      expect(startOfWeek.getDate()).toBe(10) // 10 juin 2024 est un lundi
    })
  })

  describe('addDays', () => {
    it('devrait ajouter des jours', () => {
      const date = new Date('2024-06-15')
      const result = DateUtils.addDays(date, 5)
      
      expect(result.getDate()).toBe(20)
    })

    it('devrait soustraire des jours', () => {
      const date = new Date('2024-06-15')
      const result = DateUtils.addDays(date, -5)
      
      expect(result.getDate()).toBe(10)
    })

    it('devrait gérer les changements de mois', () => {
      const date = new Date('2024-06-30')
      const result = DateUtils.addDays(date, 2)
      
      expect(result.getMonth()).toBe(6) // Juillet
      expect(result.getDate()).toBe(2)
    })
  })

  describe('differenceInDays', () => {
    it('devrait calculer la différence en jours', () => {
      const date1 = new Date('2024-06-15')
      const date2 = new Date('2024-06-20')
      
      expect(DateUtils.differenceInDays(date2, date1)).toBe(5)
      expect(DateUtils.differenceInDays(date1, date2)).toBe(-5)
    })
  })

  describe('isValidTime', () => {
    it('devrait valider des heures correctes', () => {
      expect(DateUtils.isValidTime('09:30')).toBe(true)
      expect(DateUtils.isValidTime('23:59')).toBe(true)
      expect(DateUtils.isValidTime('00:00')).toBe(true)
    })

    it('devrait rejeter des heures incorrectes', () => {
      expect(DateUtils.isValidTime('24:00')).toBe(false)
      expect(DateUtils.isValidTime('12:60')).toBe(false)
      expect(DateUtils.isValidTime('abc')).toBe(false)
      expect(DateUtils.isValidTime('12')).toBe(false)
    })
  })

  describe('parseTime', () => {
    it('devrait parser une heure valide', () => {
      const result = DateUtils.parseTime('14:30')
      expect(result).toEqual({ hours: 14, minutes: 30 })
    })

    it('devrait retourner null pour une heure invalide', () => {
      expect(DateUtils.parseTime('25:00')).toBeNull()
      expect(DateUtils.parseTime('abc')).toBeNull()
    })
  })

  describe('combineDateTime', () => {
    it('devrait combiner une date et une heure', () => {
      const date = new Date('2024-06-15')
      const result = DateUtils.combineDateTime(date, '14:30')
      
      expect(result?.getDate()).toBe(15)
      expect(result?.getHours()).toBe(14)
      expect(result?.getMinutes()).toBe(30)
    })

    it('devrait retourner null pour une heure invalide', () => {
      const date = new Date('2024-06-15')
      expect(DateUtils.combineDateTime(date, 'invalid')).toBeNull()
    })
  })

  describe('getTimeSlots', () => {
    it('devrait générer des créneaux horaires', () => {
      const slots = DateUtils.getTimeSlots('09:00', '11:00', 30)
      expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30'])
    })

    it('devrait gérer des intervalles personnalisés', () => {
      const slots = DateUtils.getTimeSlots('10:00', '12:00', 60)
      expect(slots).toEqual(['10:00', '11:00'])
    })
  })

  describe('formatDuration', () => {
    it('devrait formater en minutes', () => {
      expect(DateUtils.formatDuration(30)).toBe('30 minutes')
      expect(DateUtils.formatDuration(1)).toBe('1 minute')
    })

    it('devrait formater en heures', () => {
      expect(DateUtils.formatDuration(60)).toBe('1 heure')
      expect(DateUtils.formatDuration(120)).toBe('2 heures')
    })

    it('devrait formater en heures et minutes', () => {
      expect(DateUtils.formatDuration(90)).toBe('1h30')
      expect(DateUtils.formatDuration(150)).toBe('2h30')
    })
  })

  describe('getWorkingDays', () => {
    it('devrait compter les jours ouvrables', () => {
      const start = new Date('2024-06-10') // Lundi
      const end = new Date('2024-06-14') // Vendredi
      
      expect(DateUtils.getWorkingDays(start, end)).toBe(5)
    })

    it('devrait exclure les weekends', () => {
      const start = new Date('2024-06-10') // Lundi
      const end = new Date('2024-06-16') // Dimanche
      
      expect(DateUtils.getWorkingDays(start, end)).toBe(5) // Exclut samedi et dimanche
    })
  })

  describe('getEventDateInfo', () => {
    it('devrait retourner les informations complètes d\'une date', () => {
      const eventDate = new Date('2024-06-16T14:30:00') // Dimanche (demain)
      const info = DateUtils.getEventDateInfo(eventDate)
      
      expect(info.isToday).toBe(false)
      expect(info.isTomorrow).toBe(true)
      expect(info.isPast).toBe(false)
      expect(info.daysUntil).toBe(1)
      expect(info.season).toBe('summer')
      expect(info.formattedDate).toBe('16 juin 2024')
      expect(info.formattedTime).toBe('14:30')
      expect(info.relativeText).toBe('Demain')
    })
  })
})
