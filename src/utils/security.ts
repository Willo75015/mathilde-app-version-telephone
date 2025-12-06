import CryptoJS from 'crypto-js'
import { SecurityAudit, SecurityEventType, SecuritySeverity } from '@/types'

export class SecurityManager {
  private static instance: SecurityManager
  private keyCache = new Map<string, CryptoJS.lib.WordArray>()
  private readonly algorithm = CryptoJS.AES
  
  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }
  
  // Génération de clé sécurisée
  private generateSecureKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Dérivation de clé avec PBKDF2
  private deriveKey(password: string, salt: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
    const cacheKey = password + salt.toString()
    
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!
    }
    
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256
    })
    
    this.keyCache.set(cacheKey, key)
    return key
  }
  
  // Chiffrement AES-256-GCM
  encrypt(data: string, password?: string): string {
    try {
      const key = password || this.generateSecureKey()
      const salt = CryptoJS.lib.WordArray.random(256 / 8)
      const iv = CryptoJS.lib.WordArray.random(96 / 8)
      
      const derivedKey = this.deriveKey(key, salt)
      
      const encrypted = this.algorithm.encrypt(data, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding
      })
      
      // Combiner salt + iv + données chiffrées
      const combined = salt.toString() + ':' + iv.toString() + ':' + encrypted.toString()
      
      return btoa(combined)
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Échec du chiffrement')
    }
  }
  
  // Déchiffrement AES-256-GCM
  decrypt(encryptedData: string, password: string): string {
    try {
      const decoded = atob(encryptedData)
      const parts = decoded.split(':')
      
      if (parts.length !== 3) {
        throw new Error('Format de données chiffrées invalide')
      }
      
      const salt = CryptoJS.enc.Hex.parse(parts[0])
      const iv = CryptoJS.enc.Hex.parse(parts[1])
      const encrypted = parts[2]
      
      const derivedKey = this.deriveKey(password, salt)
      
      const decrypted = this.algorithm.decrypt(encrypted, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding
      })
      
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Échec du déchiffrement')
    }
  }
  
  // Hachage sécurisé
  hash(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex)
  }
  
  // Génération de token sécurisé
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Vérification d'intégrité
  verifyIntegrity(data: string, hash: string): boolean {
    return this.hash(data) === hash
  }
  
  // Nettoyage du cache (important pour la sécurité)
  clearKeyCache(): void {
    this.keyCache.clear()
  }
}

// Gestionnaire de stockage sécurisé
export class SecureStorage {
  private security = SecurityManager.getInstance()
  private userKey: string | null = null
  
  // Initialiser avec le mot de passe utilisateur
  initialize(userPassword: string): void {
    this.userKey = this.security.hash(userPassword)
  }
  
  // Stocker des données sensibles
  setSecure(key: string, data: any): void {
    if (!this.userKey) {
      throw new Error('SecureStorage non initialisé')
    }
    
    try {
      const serialized = JSON.stringify(data)
      const encrypted = this.security.encrypt(serialized, this.userKey)
      const timestamp = Date.now()
      
      const payload = {
        data: encrypted,
        timestamp,
        integrity: this.security.hash(encrypted + timestamp)
      }
      
      localStorage.setItem(`secure_${key}`, JSON.stringify(payload))
    } catch (error) {
      console.error('Secure storage failed:', error)
      throw new Error('Échec du stockage sécurisé')
    }
  }
  
  // Récupérer des données sensibles
  getSecure<T>(key: string): T | null {
    if (!this.userKey) {
      throw new Error('SecureStorage non initialisé')
    }
    
    try {
      const stored = localStorage.getItem(`secure_${key}`)
      if (!stored) return null
      
      const payload = JSON.parse(stored)
      
      // Vérifier l'intégrité
      const expectedIntegrity = this.security.hash(payload.data + payload.timestamp)
      if (payload.integrity !== expectedIntegrity) {
        console.warn('Integrity check failed for:', key)
        this.removeSecure(key)
        return null
      }
      
      // Vérifier l'expiration (optionnel)
      const age = Date.now() - payload.timestamp
      if (age > 24 * 60 * 60 * 1000) { // 24h
        this.removeSecure(key)
        return null
      }
      
      const decrypted = this.security.decrypt(payload.data, this.userKey)
      return JSON.parse(decrypted)
    } catch (error) {
      console.error('Secure retrieval failed:', error)
      this.removeSecure(key)
      return null
    }
  }
  
  // Supprimer des données sécurisées
  removeSecure(key: string): void {
    localStorage.removeItem(`secure_${key}`)
  }
  
  // Nettoyer toutes les données sécurisées
  clearAll(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key)
      }
    })
    this.security.clearKeyCache()
  }
}

// Rate Limiter pour prévenir les attaques
export class RateLimiter {
  private attempts = new Map<string, number[]>()
  private readonly maxAttempts: number
  private readonly windowMs: number
  private readonly blockDurationMs: number
  
  constructor(
    maxAttempts: number = 30,
    windowMs: number = 60000,
    blockDurationMs: number = 300000
  ) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.blockDurationMs = blockDurationMs
  }
  
  // Vérifier si l'action est autorisée
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Nettoyer les tentatives anciennes
    const recentAttempts = attempts.filter(time => now - time < this.windowMs)
    this.attempts.set(identifier, recentAttempts)
    
    // Vérifier le blocage
    if (recentAttempts.length >= this.maxAttempts) {
      const firstAttempt = recentAttempts[0]
      if (now - firstAttempt < this.blockDurationMs) {
        return false
      }
      // Débloquer après la période de blocage
      this.attempts.delete(identifier)
      return true
    }
    
    return true
  }
  
  // Enregistrer une tentative
  recordAttempt(identifier: string): void {
    const attempts = this.attempts.get(identifier) || []
    attempts.push(Date.now())
    this.attempts.set(identifier, attempts)
  }
  
  // Réinitialiser les tentatives pour un identifiant
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
  
  // Obtenir le temps restant avant déblocage
  getTimeUntilUnblock(identifier: string): number {
    const attempts = this.attempts.get(identifier) || []
    if (attempts.length < this.maxAttempts) return 0
    
    const firstAttempt = attempts[0]
    const timeElapsed = Date.now() - firstAttempt
    return Math.max(0, this.blockDurationMs - timeElapsed)
  }
}

// Auditeur de sécurité
export class SecurityAuditor {
  private static instance: SecurityAuditor
  private audits: SecurityAudit[] = []
  private rateLimiter = new RateLimiter()
  
  static getInstance(): SecurityAuditor {
    if (!SecurityAuditor.instance) {
      SecurityAuditor.instance = new SecurityAuditor()
    }
    return SecurityAuditor.instance
  }
  
  // Enregistrer un événement de sécurité
  logSecurityEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    message: string,
    context?: Record<string, any>
  ): void {
    const audit: SecurityAudit = {
      id: crypto.randomUUID(),
      type,
      severity,
      message,
      timestamp: new Date(),
      userId: context?.userId,
      ip: context?.ip,
      userAgent: navigator.userAgent
    }
    
    this.audits.push(audit)
    
    // Limiter la taille des logs
    if (this.audits.length > 1000) {
      this.audits = this.audits.slice(-500)
    }
    
    // Alertes pour événements critiques
    if (severity === SecuritySeverity.CRITICAL) {
      this.handleCriticalAlert(audit)
    }
    
    console.warn('🔒 Security Event:', audit)
  }
  
  // Analyser les tentatives d'attaque
  analyzeInput(input: string, context: string): void {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /function\(/i,
      /\.\.\/\.\.\//,
      /union.*select/i,
      /drop.*table/i
    ]
    
    const detected = suspiciousPatterns.find(pattern => pattern.test(input))
    
    if (detected) {
      this.logSecurityEvent(
        SecurityEventType.XSS_ATTEMPT,
        SecuritySeverity.HIGH,
        `Tentative d'injection détectée dans ${context}`,
        { input: input.substring(0, 100), pattern: detected.toString() }
      )
    }
  }
  
  // Vérifier le rate limiting
  checkRateLimit(identifier: string, action: string): boolean {
    if (!this.rateLimiter.isAllowed(identifier)) {
      this.logSecurityEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        SecuritySeverity.MEDIUM,
        `Rate limit dépassé pour ${action}`,
        { identifier }
      )
      return false
    }
    
    this.rateLimiter.recordAttempt(identifier)
    return true
  }
  
  // Gérer les alertes critiques
  private handleCriticalAlert(audit: SecurityAudit): void {
    // En production, envoyer à un service de monitoring
    console.error('🚨 CRITICAL SECURITY ALERT:', audit)
    
    // Optionnel: Bloquer l'utilisateur temporairement
    if (audit.userId) {
      localStorage.setItem(`blocked_${audit.userId}`, Date.now().toString())
    }
  }
  
  // Obtenir les audits récents
  getRecentAudits(limit: number = 50): SecurityAudit[] {
    return this.audits.slice(-limit)
  }
  
  // Statistiques de sécurité
  getSecurityStats(): {
    totalEvents: number
    criticalEvents: number
    recentEvents: number
  } {
    const now = Date.now()
    const recentThreshold = now - (24 * 60 * 60 * 1000) // 24h
    
    return {
      totalEvents: this.audits.length,
      criticalEvents: this.audits.filter(a => a.severity === SecuritySeverity.CRITICAL).length,
      recentEvents: this.audits.filter(a => a.timestamp.getTime() > recentThreshold).length
    }
  }
}