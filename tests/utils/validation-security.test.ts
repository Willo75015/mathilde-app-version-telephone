/**
 * 🧪 TESTS UNITAIRES - Validation et Sécurité
 * Tests pour les utilitaires de validation et sécurité
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { EventValidationSchema, ClientValidationSchema, DataSanitizer, ValidationError } from '@/utils/validation'
import { SecurityManager, SecureStorage, RateLimiter, SecurityAuditor } from '@/utils/security'
import { EventStatus } from '@/types'

// Mock de DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn().mockImplementation((input) => input)
  }
}))

// Mock de CryptoJS
vi.mock('crypto-js', () => ({
  AES: {
    encrypt: vi.fn().mockReturnValue({ toString: () => 'encrypted-data' }),
    decrypt: vi.fn().mockReturnValue({ toString: () => 'decrypted-data' })
  },
  PBKDF2: vi.fn().mockReturnValue('derived-key'),
  SHA256: vi.fn().mockReturnValue({ toString: () => 'hashed-value' }),
  lib: {
    WordArray: {
      random: vi.fn().mockReturnValue('random-bytes')
    }
  },
  enc: {
    Hex: {
      parse: vi.fn().mockReturnValue('parsed-hex')
    },
    Utf8: 'utf8'
  },
  mode: {
    GCM: 'gcm'
  },
  pad: {
    NoPadding: 'nopadding'
  },
  algo: {
    SHA256: 'sha256'
  }
}))

describe('Validation Utils', () => {
  describe('EventValidationSchema', () => {
    const validEventData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Mariage Sophie',
      description: 'Décoration florale pour mariage',
      date: new Date('2024-12-25'),
      time: '15:30',
      location: 'Paris',
      clientId: '123e4567-e89b-12d3-a456-426614174001',
      budget: 1500,
      status: EventStatus.CONFIRMED,
      flowers: [
        { flowerId: '123e4567-e89b-12d3-a456-426614174002', quantity: 50 }
      ]
    }

    test('devrait valider des données correctes', () => {
      const result = EventValidationSchema.safeParse(validEventData)
      expect(result.success).toBe(true)
    })

    test('devrait rejeter un titre vide', () => {
      const invalidData = { ...validEventData, title: '' }
      const result = EventValidationSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('requis')
      }
    })

    test('devrait rejeter un titre trop long', () => {
      const invalidData = { ...validEventData, title: 'a'.repeat(101) }
      const result = EventValidationSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })

    test('devrait rejeter une heure invalide', () => {
      const invalidData = { ...validEventData, time: '25:30' }
      const result = EventValidationSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })

    test('devrait rejeter un budget négatif', () => {
      const invalidData = { ...validEventData, budget: -100 }
      const result = EventValidationSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })
  })

  describe('DataSanitizer', () => {
    test('devrait nettoyer une chaîne de caractères', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = DataSanitizer.sanitizeString(input)
      
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('javascript:')
    })

    test('devrait nettoyer un objet récursivement', () => {
      const input = {
        name: '<script>alert("xss")</script>Sophie',
        address: {
          street: 'javascript:void(0)',
          city: 'Paris'
        }
      }
      
      const result = DataSanitizer.sanitizeObject(input)
      
      expect(result.name).not.toContain('<script>')
      expect(result.address.street).not.toContain('javascript:')
      expect(result.address.city).toBe('Paris')
    })

    test('devrait valider et nettoyer avec schema', () => {
      const mockSchema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: { cleaned: 'data' }
        })
      }
      
      const result = DataSanitizer.validateAndSanitize(
        { test: 'data' },
        mockSchema as any
      )
      
      expect(result).toEqual({ cleaned: 'data' })
    })
  })
})

describe('Security Utils', () => {
  let securityManager: SecurityManager
  
  beforeEach(() => {
    securityManager = SecurityManager.getInstance()
  })

  describe('SecurityManager', () => {
    test('devrait être un singleton', () => {
      const instance1 = SecurityManager.getInstance()
      const instance2 = SecurityManager.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    test('devrait chiffrer et déchiffrer des données', () => {
      const data = 'données sensibles'
      const password = 'mot-de-passe-secret'
      
      const encrypted = securityManager.encrypt(data, password)
      expect(encrypted).not.toBe(data)
      expect(typeof encrypted).toBe('string')
      
      const decrypted = securityManager.decrypt(encrypted, password)
      expect(decrypted).toBe('decrypted-data') // Mock return value
    })

    test('devrait hasher des données', () => {
      const data = 'données à hasher'
      const hash = securityManager.hash(data)
      
      expect(hash).toBe('hashed-value') // Mock return value
      expect(typeof hash).toBe('string')
    })

    test('devrait générer un token sécurisé', () => {
      // Mock crypto.getRandomValues
      const mockValues = new Uint8Array([1, 2, 3, 4])
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr) => {
        arr.set(mockValues.slice(0, arr.length))
        return arr
      })
      
      const token = securityManager.generateSecureToken(4)
      expect(token).toBe('01020304')
    })

    test('devrait vérifier l\'intégrité', () => {
      const data = 'données test'
      const validHash = 'hashed-value'
      const invalidHash = 'invalid-hash'
      
      expect(securityManager.verifyIntegrity(data, validHash)).toBe(true)
      expect(securityManager.verifyIntegrity(data, invalidHash)).toBe(false)
    })
  })

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter
    
    beforeEach(() => {
      rateLimiter = new RateLimiter(3, 1000, 5000) // 3 tentatives par seconde, blocage 5s
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test('devrait permettre les premières tentatives', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true)
      rateLimiter.recordAttempt('user1')
      
      expect(rateLimiter.isAllowed('user1')).toBe(true)
      rateLimiter.recordAttempt('user1')
      
      expect(rateLimiter.isAllowed('user1')).toBe(true)
    })

    test('devrait bloquer après dépassement', () => {
      // Enregistrer 3 tentatives
      for (let i = 0; i < 3; i++) {
        rateLimiter.recordAttempt('user1')
      }
      
      expect(rateLimiter.isAllowed('user1')).toBe(false)
    })

    test('devrait débloquer après la période', () => {
      // Bloquer l'utilisateur
      for (let i = 0; i < 3; i++) {
        rateLimiter.recordAttempt('user1')
      }
      
      expect(rateLimiter.isAllowed('user1')).toBe(false)
      
      // Avancer le temps
      vi.advanceTimersByTime(6000) // 6 secondes
      
      expect(rateLimiter.isAllowed('user1')).toBe(true)
    })

    test('devrait calculer le temps restant', () => {
      for (let i = 0; i < 3; i++) {
        rateLimiter.recordAttempt('user1')
      }
      
      const timeLeft = rateLimiter.getTimeUntilUnblock('user1')
      expect(timeLeft).toBeGreaterThan(0)
      expect(timeLeft).toBeLessThanOrEqual(5000)
    })
  })

  describe('SecurityAuditor', () => {
    let auditor: SecurityAuditor
    
    beforeEach(() => {
      auditor = SecurityAuditor.getInstance()
      vi.clearAllMocks()
    })

    test('devrait être un singleton', () => {
      const instance1 = SecurityAuditor.getInstance()
      const instance2 = SecurityAuditor.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    test('devrait enregistrer un événement de sécurité', () => {
      auditor.logSecurityEvent(
        'XSS_ATTEMPT',
        'HIGH',
        'Tentative XSS détectée'
      )
      
      const audits = auditor.getRecentAudits(10)
      expect(audits).toHaveLength(1)
      expect(audits[0]).toMatchObject({
        type: 'XSS_ATTEMPT',
        severity: 'HIGH',
        message: 'Tentative XSS détectée'
      })
    })

    test('devrait analyser les inputs suspects', () => {
      const spy = vi.spyOn(auditor, 'logSecurityEvent')
      
      auditor.analyzeInput('<script>alert("xss")</script>', 'form-field')
      
      expect(spy).toHaveBeenCalledWith(
        'XSS_ATTEMPT',
        'HIGH',
        expect.stringContaining('Tentative d\'injection'),
        expect.any(Object)
      )
    })

    test('devrait vérifier le rate limiting', () => {
      const result1 = auditor.checkRateLimit('user1', 'login')
      expect(result1).toBe(true)
      
      // Simuler dépassement
      for (let i = 0; i < 30; i++) {
        auditor.checkRateLimit('user1', 'login')
      }
      
      const result2 = auditor.checkRateLimit('user1', 'login')
      expect(result2).toBe(false)
    })

    test('devrait retourner des statistiques', () => {
      auditor.logSecurityEvent('XSS_ATTEMPT', 'CRITICAL', 'Test')
      auditor.logSecurityEvent('RATE_LIMIT_EXCEEDED', 'MEDIUM', 'Test')
      
      const stats = auditor.getSecurityStats()
      
      expect(stats.totalEvents).toBe(2)
      expect(stats.criticalEvents).toBe(1)
    })
  })

  describe('SecureStorage', () => {
    let secureStorage: SecureStorage
    
    beforeEach(() => {
      secureStorage = new SecureStorage()
      
      // Mock localStorage
      global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      }
    })

    test('devrait initialiser avec un mot de passe', () => {
      expect(() => {
        secureStorage.initialize('password123')
      }).not.toThrow()
    })

    test('devrait stocker des données de manière sécurisée', () => {
      secureStorage.initialize('password123')
      
      const data = { secret: 'information sensible' }
      
      expect(() => {
        secureStorage.setSecure('test-key', data)
      }).not.toThrow()
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'secure_test-key',
        expect.any(String)
      )
    })

    test('devrait récupérer des données sécurisées', () => {
      secureStorage.initialize('password123')
      
      // Mock des données stockées
      const mockPayload = {
        data: 'encrypted-data',
        timestamp: Date.now(),
        integrity: 'hashed-value'
      }
      
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockPayload))
      
      const result = secureStorage.getSecure('test-key')
      expect(result).toBe('decrypted-data') // Mock return value
    })

    test('devrait lever une erreur si non initialisé', () => {
      expect(() => {
        secureStorage.setSecure('test', {})
      }).toThrow('SecureStorage non initialisé')
      
      expect(() => {
        secureStorage.getSecure('test')
      }).toThrow('SecureStorage non initialisé')
    })

    test('devrait nettoyer toutes les données', () => {
      // Mock des clés localStorage
      Object.defineProperty(localStorage, 'keys', {
        value: vi.fn().mockReturnValue(['secure_key1', 'secure_key2', 'other_key'])
      })
      
      secureStorage.clearAll()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('secure_key1')
      expect(localStorage.removeItem).toHaveBeenCalledWith('secure_key2')
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('other_key')
    })
  })
})
