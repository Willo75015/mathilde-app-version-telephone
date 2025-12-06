# 🛡️ Sécurité - Mathilde Fleurs

> **Guide complet de sécurité pour l'application Mathilde Fleurs**

## 🎯 **Vue d'ensemble de la sécurité**

La sécurité est au cœur de l'architecture Mathilde Fleurs. Cette application gère des données sensibles (informations clients, événements, données financières) et implémente des mesures de protection de niveau entreprise.

## 🔒 **Architecture de sécurité**

### Principes de sécurité appliqués

1. **🛡️ Défense en profondeur** - Multiples couches de protection
2. **🔐 Principe de moindre privilège** - Accès minimal nécessaire
3. **✅ Validation rigoureuse** - Validation côté client ET serveur
4. **🔍 Audit complet** - Traçabilité de toutes les actions
5. **🚫 Zero Trust** - Vérification systématique

### Stack de sécurité

```typescript
// Couches de sécurité implémentées
const securityStack = {
  input: ['Zod validation', 'DOMPurify sanitization'],
  storage: ['AES-256 encryption', 'Integrity checks'],
  transport: ['HTTPS only', 'CSP headers'],
  runtime: ['Rate limiting', 'XSS protection'],
  monitoring: ['Security audit', 'Anomaly detection']
}
```

## 🛡️ **Protection des entrées utilisateur**

### Validation avec Zod

```typescript
import { z } from 'zod'
import { DataSanitizer } from '@/utils/security'

// Schema de validation robuste
export const ClientSchema = z.object({
  firstName: z.string()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Caractères invalides'),
    
  email: z.string()
    .email('Email invalide')
    .max(100, 'Email trop long')
    .refine(val => !val.includes('<script'), 'Email suspect'),
    
  phone: z.string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Téléphone français invalide')
})

// Validation et sanitization automatiques
export function validateClientData(rawData: unknown): Client {
  // 1. Sanitization préventive
  const sanitized = DataSanitizer.sanitizeObject(rawData)
  
  // 2. Validation stricte
  const result = ClientSchema.safeParse(sanitized)
  
  if (!result.success) {
    throw new ValidationError('Données invalides', result.error.issues)
  }
  
  return result.data
}
```

### Sanitization anti-XSS

```typescript
export class DataSanitizer {
  static sanitizeString(input: string): string {
    // Configuration DOMPurify stricte
    const clean = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Aucun tag HTML
      ALLOWED_ATTR: [], // Aucun attribut
      KEEP_CONTENT: true,
      RETURN_DOM: false
    })
    
    return clean
      .replace(/[<>]/g, '') // Supprimer < et >
      .replace(/javascript:/gi, '') // Supprimer javascript:
      .replace(/on\w+=/gi, '') // Supprimer event handlers
      .trim()
  }
  
  // Analyse des patterns suspects
  static analyzeInput(input: string, context: string): void {
    const suspiciousPatterns = [
      /<script/i, /javascript:/i, /on\w+=/i,
      /eval\(/i, /function\(/i, /\.\.\/\.\.\//,
      /union.*select/i, /drop.*table/i
    ]
    
    const detected = suspiciousPatterns.find(pattern => pattern.test(input))
    
    if (detected) {
      SecurityAuditor.getInstance().logSecurityEvent(
        SecurityEventType.XSS_ATTEMPT,
        SecuritySeverity.HIGH,
        `Tentative d'injection détectée dans ${context}`,
        { input: input.substring(0, 100), pattern: detected.toString() }
      )
    }
  }
}
```

## 🔐 **Chiffrement et stockage sécurisé**

### Chiffrement AES-256-GCM

```typescript
export class SecurityManager {
  // Chiffrement avec clé dérivée PBKDF2
  encrypt(data: string, password?: string): string {
    const key = password || this.generateSecureKey()
    const salt = CryptoJS.lib.WordArray.random(256 / 8)
    const iv = CryptoJS.lib.WordArray.random(96 / 8)
    
    const derivedKey = CryptoJS.PBKDF2(key, salt, {
      keySize: 256 / 32,
      iterations: 10000, // Protection contre bruteforce
      hasher: CryptoJS.algo.SHA256
    })
    
    const encrypted = CryptoJS.AES.encrypt(data, derivedKey, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    })
    
    // Combiner salt + iv + données pour intégrité
    const combined = salt.toString() + ':' + iv.toString() + ':' + encrypted.toString()
    return btoa(combined)
  }
  
  // Génération de clés sécurisées
  generateSecureKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}
```

### Stockage sécurisé avec intégrité

```typescript
export class SecureStorage {
  async setSecure(key: string, data: any): Promise<void> {
    const serialized = JSON.stringify(data)
    const encrypted = this.security.encrypt(serialized, this.userKey)
    const timestamp = Date.now()
    
    // Ajout de vérification d'intégrité
    const payload = {
      data: encrypted,
      timestamp,
      integrity: this.security.hash(encrypted + timestamp),
      version: '1.0'
    }
    
    localStorage.setItem(`secure_${key}`, JSON.stringify(payload))
  }
  
  async getSecure<T>(key: string): Promise<T | null> {
    const stored = localStorage.getItem(`secure_${key}`)
    if (!stored) return null
    
    const payload = JSON.parse(stored)
    
    // Vérification d'intégrité OBLIGATOIRE
    const expectedIntegrity = this.security.hash(payload.data + payload.timestamp)
    if (payload.integrity !== expectedIntegrity) {
      console.warn('🔒 Integrity check failed for:', key)
      this.removeSecure(key) // Supprimer données corrompues
      return null
    }
    
    // Vérification d'expiration
    const age = Date.now() - payload.timestamp
    if (age > 24 * 60 * 60 * 1000) { // 24h max
      this.removeSecure(key)
      return null
    }
    
    const decrypted = this.security.decrypt(payload.data, this.userKey)
    return JSON.parse(decrypted)
  }
}
```

## 🚫 **Protection contre les attaques**

### Rate Limiting intelligent

```typescript
export class RateLimiter {
  private attempts = new Map<string, number[]>()
  
  constructor(
    private maxAttempts: number = 30,
    private windowMs: number = 60000, // 1 minute
    private blockDurationMs: number = 300000 // 5 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Nettoyer les tentatives anciennes
    const recentAttempts = attempts.filter(time => now - time < this.windowMs)
    this.attempts.set(identifier, recentAttempts)
    
    // Blocage progressif (backoff exponentiel)
    if (recentAttempts.length >= this.maxAttempts) {
      const firstAttempt = recentAttempts[0]
      const blockedUntil = firstAttempt + this.blockDurationMs
      
      if (now < blockedUntil) {
        // Log de l'attaque potentielle
        SecurityAuditor.getInstance().logSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          SecuritySeverity.MEDIUM,
          `Rate limit dépassé pour ${identifier}`,
          { attempts: recentAttempts.length, blockedUntil }
        )
        return false
      }
      
      // Déblocage après expiration
      this.attempts.delete(identifier)
    }
    
    return true
  }
}
```

### Protection CSRF et injection

```typescript
// Headers de sécurité dans index.html
const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 'self' https://api.mathilde-fleurs.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

## 📊 **Audit et monitoring de sécurité**

### Système d'audit complet

```typescript
export class SecurityAuditor {
  private audits: SecurityAudit[] = []
  
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
      ip: this.getClientIP(),
      userAgent: navigator.userAgent,
      fingerprint: this.generateFingerprint()
    }
    
    this.audits.push(audit)
    
    // Alertes immédiates pour événements critiques
    if (severity === SecuritySeverity.CRITICAL) {
      this.handleCriticalAlert(audit)
    }
    
    // Persistence pour analyse
    this.persistAudit(audit)
  }
  
  // Détection d'anomalies
  detectAnomalies(): SecurityAnomaly[] {
    const recent = this.audits.filter(a => 
      Date.now() - a.timestamp.getTime() < 3600000 // 1h
    )
    
    const anomalies: SecurityAnomaly[] = []
    
    // Détection de patterns suspects
    const xssAttempts = recent.filter(a => a.type === SecurityEventType.XSS_ATTEMPT)
    if (xssAttempts.length > 5) {
      anomalies.push({
        type: 'repeated_xss_attempts',
        severity: SecuritySeverity.HIGH,
        count: xssAttempts.length,
        details: xssAttempts
      })
    }
    
    return anomalies
  }
  
  private generateFingerprint(): string {
    // Empreinte du navigateur pour détection d'anomalies
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    return CryptoJS.SHA256(fingerprint).toString()
  }
}
```

## 🔍 **Tests de sécurité**

### Tests automatisés de sécurité

```typescript
describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should block XSS attempts', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
        '"><script>alert("xss")</script>'
      ]
      
      maliciousInputs.forEach(input => {
        expect(() => {
          DataSanitizer.validateAndSanitize(
            { title: input }, 
            EventSchema
          )
        }).toThrow(ValidationError)
      })
    })
    
    it('should detect SQL injection attempts', () => {
      const sqlInjections = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM passwords"
      ]
      
      sqlInjections.forEach(injection => {
        const sanitized = DataSanitizer.sanitizeString(injection)
        expect(sanitized).not.toContain('DROP')
        expect(sanitized).not.toContain('UNION')
      })
    })
  })
  
  describe('Rate Limiting', () => {
    it('should block excessive requests', () => {
      const rateLimiter = new RateLimiter(5, 60000) // 5 req/min
      const identifier = 'test-user'
      
      // Première série de 5 requêtes -> OK
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed(identifier)).toBe(true)
        rateLimiter.recordAttempt(identifier)
      }
      
      // 6ème requête -> Bloquée
      expect(rateLimiter.isAllowed(identifier)).toBe(false)
    })
  })
  
  describe('Encryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const security = SecurityManager.getInstance()
      const originalData = 'sensitive information'
      
      const encrypted = security.encrypt(originalData)
      const decrypted = security.decrypt(encrypted, 'password')
      
      expect(decrypted).toBe(originalData)
      expect(encrypted).not.toContain(originalData)
    })
    
    it('should fail with wrong password', () => {
      const security = SecurityManager.getInstance()
      const encrypted = security.encrypt('data', 'correct-password')
      
      expect(() => {
        security.decrypt(encrypted, 'wrong-password')
      }).toThrow()
    })
  })
})
```

## 🚨 **Réponse aux incidents**

### Procédure d'incident de sécurité

1. **🚨 Détection** - Monitoring automatique + alertes
2. **🔍 Investigation** - Analyse des logs d'audit
3. **🛡️ Confinement** - Isolation des systèmes affectés
4. **🔧 Correction** - Patch de sécurité
5. **📊 Post-mortem** - Analyse et amélioration

### Script de réponse automatique

```typescript
export class IncidentResponse {
  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    switch (incident.severity) {
      case SecuritySeverity.CRITICAL:
        await this.lockdownUser(incident.userId)
        await this.notifyAdmins(incident)
        await this.createEmergencyBackup()
        break
        
      case SecuritySeverity.HIGH:
        await this.increaseMonitoring(incident.userId)
        await this.requireReauth(incident.userId)
        break
        
      case SecuritySeverity.MEDIUM:
        await this.logIncident(incident)
        await this.scheduleReview(incident)
        break
    }
  }
  
  private async lockdownUser(userId: string): Promise<void> {
    // Révocation immédiate des tokens
    await this.revokeAllTokens(userId)
    
    // Blocage temporaire du compte
    await this.temporaryAccountBlock(userId, '24h')
    
    // Notification obligatoire
    await this.notifyUser(userId, 'security_lockdown')
  }
}
```

## 📋 **Checklist de sécurité**

### Avant chaque déploiement

- [ ] **Tests de sécurité** passés à 100%
- [ ] **Audit des dépendances** sans vulnérabilités critiques
- [ ] **Validation des inputs** sur toutes les entrées
- [ ] **Headers de sécurité** configurés
- [ ] **HTTPS** activé et certificats valides
- [ ] **Logs d'audit** fonctionnels
- [ ] **Rate limiting** configuré
- [ ] **Backup de sécurité** effectué

### Maintenance périodique

- [ ] **Rotation des clés** (mensuelle)
- [ ] **Audit des accès** (hebdomadaire)
- [ ] **Mise à jour des dépendances** (hebdomadaire)
- [ ] **Analyse des logs** (quotidienne)
- [ ] **Test de pénétration** (trimestrielle)

## 🔧 **Configuration de sécurité**

### Variables d'environnement sécurisées

```bash
# Chiffrement
VITE_ENCRYPTION_KEY=your-32-char-secret-key
VITE_SALT_ROUNDS=12

# API Security
VITE_API_RATE_LIMIT=100
VITE_SESSION_TIMEOUT=1800000

# CSP
VITE_CSP_NONCE=random-nonce-per-request
VITE_ALLOWED_ORIGINS=https://app.mathilde-fleurs.com

# Monitoring
VITE_SECURITY_WEBHOOK=https://monitoring.mathilde-fleurs.com/security
```

### Configuration Nginx (Production)

```nginx
# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self'";

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;

# Hide version
server_tokens off;
```

## 📞 **Contact sécurité**

- 🚨 **Urgence sécurité** : security@mathilde-fleurs.com
- 🐛 **Bug bounty** : bugbounty@mathilde-fleurs.com
- 🔒 **Clé PGP** : [Télécharger](https://mathilde-fleurs.com/pgp-key.asc)

---

**🛡️ La sécurité est l'affaire de tous - Signaler tout incident suspect**
