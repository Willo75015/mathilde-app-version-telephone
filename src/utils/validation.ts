import { z } from 'zod'
import DOMPurify from 'dompurify'
import { EventStatus } from '@/types'

// BUG #8 FIX: Schéma de base sans contrainte de date pour l'édition
const BaseEventSchema = {
  id: z.string().uuid().optional(),
  title: z.string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .refine(val => DOMPurify.sanitize(val) === val, 'Titre contient des caractères interdits'),

  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .refine(val => DOMPurify.sanitize(val) === val, 'Description contient des caractères interdits'),

  time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'),

  location: z.string()
    .min(1, 'Le lieu est requis')
    .max(200, 'Le lieu ne peut pas dépasser 200 caractères'),

  clientId: z.string().uuid('ID client invalide'),

  budget: z.number()
    .positive('Le budget doit être positif')
    .max(100000, 'Budget trop élevé')
    .multipleOf(0.01, 'Budget doit avoir au maximum 2 décimales'),

  status: z.nativeEnum(EventStatus),

  flowers: z.array(z.object({
    flowerId: z.string().uuid(),
    quantity: z.number().positive().int().max(1000)
  })).max(50, 'Trop de types de fleurs sélectionnés'),

  notes: z.string().max(500).optional(),

  images: z.array(z.string().url()).max(10, 'Maximum 10 images').optional()
}

// Schéma pour la CRÉATION d'événements (dates futures uniquement)
export const EventCreateValidationSchema = z.object({
  ...BaseEventSchema,
  date: z.date()
    .min(new Date(), 'La date ne peut pas être dans le passé'),
})

// BUG #8 FIX: Schéma pour l'ÉDITION d'événements (toutes dates acceptées)
export const EventEditValidationSchema = z.object({
  ...BaseEventSchema,
  date: z.date(), // Pas de contrainte de date pour l'édition
})

// Schéma par défaut (pour compatibilité ascendante) - utilise le schéma d'édition
export const EventValidationSchema = EventEditValidationSchema

export const ClientValidationSchema = z.object({
  firstName: z.string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Prénom trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Prénom contient des caractères invalides'),
  
  lastName: z.string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Nom contient des caractères invalides'),
  
  email: z.string()
    .email('Email invalide')
    .max(100, 'Email trop long')
    .refine(val => !val.includes('<script'), 'Email suspect'),
  
  // BUG #14 FIX: Regex téléphone accepte les espaces, points et tirets
  phone: z.string()
    .regex(/^(\+33|0)[\s.-]?[1-9]([\s.-]?\d{2}){4}$/, 'Numéro de téléphone français invalide (ex: 06 12 34 56 78)'),
  
  address: z.object({
    street: z.string().min(1, 'Adresse requise').max(100),
    city: z.string().min(1, 'Ville requise').max(50),
    postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    country: z.string().default('France')
  }),
  
  comments: z.string().max(1000, 'Commentaires trop longs').optional(),
  managerPayment: z.number().min(0, 'Montant invalide').max(10000, 'Montant trop élevé').optional(),
  freelancePayment: z.number().min(0, 'Montant invalide').max(10000, 'Montant trop élevé').optional()
})

// Fonction de sanitization avancée
export class DataSanitizer {
  static sanitizeString(input: string): string {
    // Configuration DOMPurify stricte
    const clean = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Aucun tag HTML autorisé
      ALLOWED_ATTR: [], // Aucun attribut autorisé
      KEEP_CONTENT: true, // Garder le contenu texte
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false
    })
    
    // Échapper les caractères spéciaux
    return clean
      .replace(/[<>]/g, '') // Supprimer < et >
      .replace(/javascript:/gi, '') // Supprimer javascript:
      .replace(/on\w+=/gi, '') // Supprimer les event handlers
      .trim()
  }
  
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = {} as T
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key as keyof T] = this.sanitizeString(value) as T[keyof T]
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key as keyof T] = this.sanitizeObject(value) as T[keyof T]
      } else {
        sanitized[key as keyof T] = value
      }
    }
    
    return sanitized
  }
  
  static validateAndSanitize<T>(data: unknown, schema: z.ZodSchema<T>): T {
    // D'abord sanitizer
    const sanitized = typeof data === 'object' && data !== null 
      ? this.sanitizeObject(data as Record<string, any>)
      : data
    
    // Puis valider
    const result = schema.safeParse(sanitized)
    
    if (!result.success) {
      throw new ValidationError('Données invalides', result.error.issues)
    }
    
    return result.data
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: z.ZodIssue[]
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}