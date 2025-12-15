// Export des statuts Kanban synchronisés
export * from './kanban-status'

// Types de base
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Fleuristes
export interface Florist extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  phone: string
  experience: number
  rating: number
  hourlyRate: number
  availability: FloristAvailability
  location: string
  completedEvents: number
  avatar: string
  skills: string[]
  languages: string[]
  certifications: string[]
  comments?: string
  unavailabilityPeriods?: UnavailabilityPeriod[]
}

export enum FloristAvailability {
  AVAILABLE = 'available',
  ON_MISSION = 'on_mission',
  UNAVAILABLE = 'unavailable'
}

export interface UnavailabilityPeriod {
  id: string
  startDate: Date
  endDate: Date
  reason?: string
  isActive?: boolean // Calculé automatiquement
}

// Fonction utilitaire pour calculer le statut automatique
export interface FloristStatusCalculation {
  currentStatus: FloristAvailability
  reason: string
  nextStatusChange?: Date
  assignedEvents?: string[] // IDs des événements assignés
}

// Événements
export interface Event extends BaseEntity {
  title: string
  description?: string
  date: Date
  endDate?: Date
  time: string
  endTime?: string
  location: string
  clientId: string
  clientName?: string // Nom complet du client pour affichage rapide
  clientPhone?: string // Téléphone du client pour cet événement
  budget: number
  status: EventStatus
  flowers: FlowerSelection[]
  assignedFlorists?: EventFlorist[]
  floristsRequired?: number
  notes?: string
  images?: string[]
  invoiced?: boolean // Pour la gestion de facturation
  invoiceDate?: Date // Date de facturation
  completedDate?: Date // Date de fin d'événement
  paid?: boolean // Statut de paiement
  paidDate?: Date // Date de paiement
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check' // Mode de paiement
  archived?: boolean // Événement archivé après facturation
  cancelledAt?: Date // Date d'annulation
  archivedAt?: Date // Date d'archivage
  expenses?: Expense[] // 🆕 Dépenses liées à l'événement
}

// Association Événement-Fleuriste
export interface EventFlorist {
  id?: string
  floristId: string
  floristName?: string
  florist?: Florist
  phone?: string // Téléphone du fleuriste
  isConfirmed: boolean
  isRefused?: boolean
  status?: 'pending' | 'confirmed' | 'refused' | 'not_selected'
  assignedAt: Date
  confirmedAt?: Date
  role?: string // Chef d'équipe, Assistant, etc.
  notes?: string
  preWrittenMessage?: string // Message pré-écrit pour les "non retenus"
}

export enum EventStatus {
  DRAFT = 'draft',
  PLANNING = 'planning', // Phase de planification avant confirmation
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  INVOICED = 'invoiced', // Nouveau : Facturé mais pas encore payé
  PAID = 'paid', // Nouveau : Payé (statut final)
  CANCELLED = 'cancelled'
}

// Nouveaux types pour le workflow de facturation
export interface InvoiceWorkflow {
  eventId: string
  completedAt: Date
  invoicedAt?: Date
  paidAt?: Date
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check'
  daysToInvoice?: number // Calculé automatiquement
  daysToPay?: number // Calculé automatiquement
}

// 🆕 Types pour le suivi des dépenses
export enum ExpenseCategory {
  FLOWERS = 'flowers',           // Achat de fleurs
  MATERIALS = 'materials',       // Matériel (vases, rubans, etc.)
  TRANSPORT = 'transport',       // Frais de déplacement
  FLORIST_FEES = 'florist_fees', // Paiement des fleuristes
  OTHER = 'other'                // Autres dépenses
}

export interface Expense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  date: Date
  receipt?: string // URL ou référence du justificatif
}

// Calcul de rentabilité d'un événement
export interface EventProfitability {
  eventId: string
  budget: number           // Montant facturé au client
  totalExpenses: number    // Total des dépenses
  margin: number           // Budget - Dépenses
  marginPercent: number    // (Marge / Budget) * 100
}

// 🆕 Types pour le système de rappels
export enum ReminderType {
  EVENT_UPCOMING = 'event_upcoming',       // Événement dans X jours
  FLORIST_PENDING = 'florist_pending',     // Fleuriste en attente de confirmation
  INVOICE_OVERDUE = 'invoice_overdue',     // Facturation en retard
  PAYMENT_PENDING = 'payment_pending',     // Paiement en attente
  CLIENT_FOLLOWUP = 'client_followup',     // Suivi client post-événement
  TEAM_INCOMPLETE = 'team_incomplete'      // Équipe incomplète
}

export enum ReminderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Reminder {
  id: string
  type: ReminderType
  priority: ReminderPriority
  title: string
  description: string
  eventId?: string           // Lié à un événement
  clientId?: string          // Lié à un client
  dueDate: Date              // Date limite/échéance
  createdAt: Date
  isRead: boolean            // Marqué comme lu
  isDismissed: boolean       // Masqué par l'utilisateur
  actionLabel?: string       // Texte du bouton d'action
  actionType?: 'navigate' | 'call' | 'whatsapp' | 'email' // Type d'action
  actionData?: string        // Données pour l'action (page, numéro, etc.)
}

// 🆕 Types pour les templates d'événements
export enum EventTemplateCategory {
  WEDDING = 'wedding',           // Mariage
  CORPORATE = 'corporate',       // Événement d'entreprise
  BIRTHDAY = 'birthday',         // Anniversaire
  FUNERAL = 'funeral',           // Funérailles
  BAPTISM = 'baptism',           // Baptême
  RECEPTION = 'reception',       // Réception
  CUSTOM = 'custom'              // Personnalisé
}

export interface EventTemplate {
  id: string
  name: string
  category: EventTemplateCategory
  description: string
  icon: string                   // Emoji ou nom d'icône
  defaultBudget: number
  defaultDuration: number        // En heures
  defaultFloristsRequired: number
  suggestedFlowers?: string[]    // IDs ou noms de fleurs suggérées
  suggestedMaterials?: string[]  // Matériel suggéré
  checklistItems?: string[]      // Liste de contrôle par défaut
  notes?: string                 // Notes par défaut
  isCustom: boolean              // True si créé par l'utilisateur
  usageCount: number             // Nombre de fois utilisé
  createdAt: Date
  updatedAt: Date
}

// Clients
export interface Client extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: Address
  preferences?: ClientPreferences
  events?: Event[]
  comments?: string
  managerPayment?: number
  freelancePayment?: number
}

export interface Address {
  street: string
  city: string
  postalCode: string
  country?: string // Optionnel, valeur par défaut "France"
}

export interface ClientPreferences {
  favoriteColors: string[]
  favoriteFlowers: string[]
  allergies?: string[]
}

// Fleurs
export interface Flower {
  id: string
  name: string
  category: FlowerCategory
  color: string
  seasonality: Season[]
  pricePerUnit: number
  stock: number
  description?: string
  imageUrl?: string
}

export interface FlowerSelection {
  flowerId: string
  quantity: number
  notes?: string
}

export enum FlowerCategory {
  ROSES = 'roses',
  TULIPS = 'tulips',
  CARNATIONS = 'carnations',
  LILIES = 'lilies',
  ORCHIDS = 'orchids',
  SEASONAL = 'seasonal',
  EXOTIC = 'exotic'
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}

// États de l'application
export interface AppState {
  user: User | null
  events: Event[]
  clients: Client[]
  flowers: Flower[]
  florists: Florist[]
  isLoading: boolean
  error: string | null
  theme: Theme
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  preferences: UserPreferences
}

export enum UserRole {
  ADMIN = 'admin',
  FLORIST = 'florist',
  CLIENT = 'client'
}

export interface UserPreferences {
  theme: Theme
  language: string
  notifications: NotificationSettings
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  reminders: boolean
}

// Analytics et Monitoring
export interface AnalyticsEvent {
  id: string
  type: string
  data: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId: string
}

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  context?: Record<string, any>
}

// Sécurité
export interface SecurityAudit {
  id: string
  type: SecurityEventType
  severity: SecuritySeverity
  message: string
  timestamp: Date
  userId?: string
  ip?: string
  userAgent?: string
}

export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  DATA_ACCESS = 'data_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  XSS_ATTEMPT = 'xss_attempt',
  INVALID_INPUT = 'invalid_input'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// PWA
export interface PWAInstallPrompt {
  platforms: string[]
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

export interface SyncTask {
  id: string
  type: string
  data: any
  timestamp: Date
  retries: number
  maxRetries: number
}

// Validation schemas avec Zod
import { z } from 'zod'

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Le titre est requis').max(100),
  description: z.string().max(500),
  date: z.date(),
  endDate: z.date().optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  location: z.string().min(1, 'Le lieu est requis'),
  clientId: z.string().uuid(),
  budget: z.number().positive(),
  status: z.nativeEnum(EventStatus),
  flowers: z.array(z.object({
    flowerId: z.string().uuid(),
    quantity: z.number().positive()
  })),
  florists: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    specialty: z.string().optional()
  })).optional()
})

export const ClientSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro invalide'),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().regex(/^\d{5}$/),
    country: z.string().default('France')
  })
})