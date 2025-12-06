/**
 * 🧪 TESTS - Utilitaires de formatage
 * Tests complets pour src/lib/format.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataFormatter, currency, phone, fullName, email } from '../../src/lib/format'

describe('DataFormatter', () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    vi.clearAllMocks()
  })

  describe('currency', () => {
    it('devrait formater un montant en euros', () => {
      expect(currency(1234.56)).toBe('1 234,56 €')
    })

    it('devrait gérer les montants négatifs', () => {
      expect(currency(-500.25)).toBe('-500,25 €')
    })

    it('devrait gérer les valeurs nulles/undefined', () => {
      expect(currency(null as any)).toBe('0,00 €')
      expect(currency(undefined as any)).toBe('0,00 €')
    })

    it('devrait formater en mode compact', () => {
      expect(currency(1500, { compact: true })).toBe('1.5K €')
      expect(currency(1000000, { compact: true })).toBe('1.0M €')
    })

    it('devrait respecter le nombre de décimales', () => {
      expect(currency(1234.567, { decimals: 0 })).toBe('1 235 €')
      expect(currency(1234.567, { decimals: 3 })).toBe('1 234,567 €')
    })

    it('devrait gérer différentes devises', () => {
      expect(currency(100, { currency: 'USD' })).toContain('$')
      expect(currency(100, { currency: 'GBP' })).toContain('£')
    })
  })

  describe('phone', () => {
    it('devrait formater un numéro français au format display', () => {
      expect(phone('0123456789')).toBe('01 23 45 67 89')
    })

    it('devrait formater au format international', () => {
      expect(phone('0123456789', 'international')).toBe('+33 1 23 45 67 89')
    })

    it('devrait retourner le format national', () => {
      expect(phone('0123456789', 'national')).toBe('0123456789')
    })

    it('devrait gérer les numéros avec indicatif +33', () => {
      expect(phone('33123456789', 'display')).toBe('01 23 45 67 89')
    })

    it('devrait gérer les chaînes vides', () => {
      expect(phone('')).toBe('')
      expect(phone(null as any)).toBe('')
    })

    it('devrait nettoyer les caractères non numériques', () => {
      expect(phone('01.23.45.67.89')).toBe('01 23 45 67 89')
      expect(phone('01-23-45-67-89')).toBe('01 23 45 67 89')
    })
  })

  describe('fullName', () => {
    it('devrait formater un nom complet standard', () => {
      expect(fullName('Jean', 'Dupont')).toBe('Jean Dupont')
    })

    it('devrait formater au format nom-prénom', () => {
      expect(fullName('Jean', 'Dupont', 'last-first')).toBe('Dupont, Jean')
    })

    it('devrait créer des initiales', () => {
      expect(fullName('Jean', 'Dupont', 'initials')).toBe('J.D.')
    })

    it('devrait formater au format formel', () => {
      expect(fullName('Jean', 'Dupont', 'formal')).toBe('DUPONT, Jean')
    })

    it('devrait gérer les noms manquants', () => {
      expect(fullName('Jean', '')).toBe('Jean')
      expect(fullName('', 'Dupont')).toBe('Dupont')
      expect(fullName('', '')).toBe('')
    })
  })

  describe('email', () => {
    it('devrait retourner l\'email sans masquage', () => {
      expect(email('test@example.com')).toBe('test@example.com')
    })

    it('devrait masquer l\'email partiellement', () => {
      expect(email('test@example.com', true)).toBe('t**t@example.com')
    })

    it('devrait gérer les emails courts', () => {
      expect(email('a@b.com', true)).toBe('a@b.com')
    })

    it('devrait gérer les chaînes vides', () => {
      expect(email('')).toBe('')
    })
  })

  describe('percentage', () => {
    it('devrait formater un pourcentage', () => {
      expect(DataFormatter.percentage(25.5)).toBe('25,5 %')
    })

    it('devrait gérer les valeurs nulles', () => {
      expect(DataFormatter.percentage(NaN)).toBe('0%')
    })

    it('devrait respecter le nombre de décimales', () => {
      expect(DataFormatter.percentage(25.567, 2)).toBe('25,57 %')
    })
  })

  describe('number', () => {
    it('devrait formater un nombre avec séparateurs', () => {
      expect(DataFormatter.number(1234567)).toBe('1 234 567')
    })

    it('devrait gérer les décimales', () => {
      expect(DataFormatter.number(1234.56, 2)).toBe('1 234,56')
    })
  })

  describe('fileSize', () => {
    it('devrait formater la taille en octets', () => {
      expect(DataFormatter.fileSize(0)).toBe('0 o')
      expect(DataFormatter.fileSize(512)).toBe('512 o')
    })

    it('devrait formater en kilooctets', () => {
      expect(DataFormatter.fileSize(1024)).toBe('1 Ko')
      expect(DataFormatter.fileSize(1536)).toBe('1.5 Ko')
    })

    it('devrait formater en mégaoctets', () => {
      expect(DataFormatter.fileSize(1024 * 1024)).toBe('1 Mo')
    })

    it('devrait formater en gigaoctets', () => {
      expect(DataFormatter.fileSize(1024 * 1024 * 1024)).toBe('1 Go')
    })
  })

  describe('truncate', () => {
    it('devrait tronquer un texte long', () => {
      expect(DataFormatter.truncate('Ceci est un texte très long', 10)).toBe('Ceci es...')
    })

    it('devrait retourner le texte court tel quel', () => {
      expect(DataFormatter.truncate('Court', 10)).toBe('Court')
    })

    it('devrait utiliser un suffixe personnalisé', () => {
      expect(DataFormatter.truncate('Texte long', 5, ' [...]')).toBe('T [...]')
    })

    it('devrait gérer les chaînes vides', () => {
      expect(DataFormatter.truncate('', 10)).toBe('')
    })
  })

  describe('slug', () => {
    it('devrait créer un slug à partir d\'un texte', () => {
      expect(DataFormatter.slug('Mon Titre Génial')).toBe('mon-titre-genial')
    })

    it('devrait supprimer les accents', () => {
      expect(DataFormatter.slug('Café & Restaurant')).toBe('cafe-restaurant')
    })

    it('devrait gérer les caractères spéciaux', () => {
      expect(DataFormatter.slug('Test@123#$%')).toBe('test-123')
    })

    it('devrait fusionner les tirets multiples', () => {
      expect(DataFormatter.slug('Test   Multiple   Spaces')).toBe('test-multiple-spaces')
    })
  })

  describe('list', () => {
    it('devrait formater une liste avec "et"', () => {
      expect(DataFormatter.list(['A', 'B', 'C'])).toBe('A, B et C')
    })

    it('devrait gérer deux éléments', () => {
      expect(DataFormatter.list(['A', 'B'])).toBe('A et B')
    })

    it('devrait gérer un seul élément', () => {
      expect(DataFormatter.list(['A'])).toBe('A')
    })

    it('devrait gérer une liste vide', () => {
      expect(DataFormatter.list([])).toBe('')
    })

    it('devrait utiliser une conjonction personnalisée', () => {
      expect(DataFormatter.list(['A', 'B', 'C'], 'ou')).toBe('A, B ou C')
    })
  })

  describe('timeAgo', () => {
    beforeEach(() => {
      // Mock de Date.now pour des tests déterministes
      vi.spyOn(Date, 'now').mockImplementation(() => 1640995200000) // 1er janvier 2022, 00:00:00
    })

    it('devrait retourner "à l\'instant" pour maintenant', () => {
      const now = new Date(Date.now())
      expect(DataFormatter.timeAgo(now)).toBe('à l\'instant')
    })

    it('devrait retourner les minutes', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(DataFormatter.timeAgo(fiveMinutesAgo)).toBe('il y a 5 min')
    })

    it('devrait retourner les heures', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(DataFormatter.timeAgo(twoHoursAgo)).toBe('il y a 2 h')
    })

    it('devrait retourner les jours', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      expect(DataFormatter.timeAgo(threeDaysAgo)).toBe('il y a 3 j')
    })
  })

  describe('address', () => {
    it('devrait formater une adresse complète', () => {
      const address = {
        street: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      }
      expect(DataFormatter.address(address)).toBe('123 Rue de la Paix, 75001 Paris')
    })

    it('devrait inclure le pays si différent de France', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        country: 'USA'
      }
      expect(DataFormatter.address(address)).toBe('123 Main St, 10001 New York, USA')
    })

    it('devrait gérer les champs manquants', () => {
      const address = {
        city: 'Paris'
      }
      expect(DataFormatter.address(address)).toBe('Paris')
    })
  })

  describe('initials', () => {
    it('devrait créer des initiales', () => {
      expect(DataFormatter.initials('Jean', 'Dupont')).toBe('JD')
    })

    it('devrait gérer les noms manquants', () => {
      expect(DataFormatter.initials('Jean', '')).toBe('J')
      expect(DataFormatter.initials('', 'Dupont')).toBe('D')
      expect(DataFormatter.initials('', '')).toBe('')
    })
  })

  describe('ordinal', () => {
    it('devrait retourner "1er" pour 1', () => {
      expect(DataFormatter.ordinal(1)).toBe('1er')
    })

    it('devrait retourner "Nème" pour les autres', () => {
      expect(DataFormatter.ordinal(2)).toBe('2ème')
      expect(DataFormatter.ordinal(21)).toBe('21ème')
    })
  })

  describe('progress', () => {
    it('devrait calculer un pourcentage de progression', () => {
      expect(DataFormatter.progress(25, 100)).toBe('25%')
      expect(DataFormatter.progress(1, 3)).toBe('33%')
    })

    it('devrait gérer la division par zéro', () => {
      expect(DataFormatter.progress(10, 0)).toBe('0%')
    })
  })

  describe('score', () => {
    it('devrait formater un score avec maximum', () => {
      expect(DataFormatter.score(4.2, 5)).toBe('4,2/5')
    })

    it('devrait formater sans maximum', () => {
      expect(DataFormatter.score(4.2, 5, false)).toBe('4,2')
    })
  })
})
