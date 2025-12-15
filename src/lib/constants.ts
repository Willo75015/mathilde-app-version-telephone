/* ==========================================================================
   CONSTANTES GLOBALES - MATHILDE FLEURS
   Configuration centralisée de l'application
   ========================================================================== */

// Informations de l'application
export const APP_CONFIG = {
  name: 'Mathilde Fleurs',
  version: '1.0.0',
  description: 'Application PWA pour la gestion d\'événements fleuriste',
  author: 'Mathilde Dupont',
  website: 'https://mathilde-fleurs.com',
  email: 'mathilde@fleurs.com',
  phone: '+33 6 12 34 56 78',
  address: {
    street: '123 Rue des Fleurs',
    city: 'Paris',
    postalCode: '75001',
    country: 'France'
  }
} as const

// Configuration PWA
export const PWA_CONFIG = {
  name: APP_CONFIG.name,
  shortName: 'Mathilde Fleurs',
  description: APP_CONFIG.description,
  themeColor: '#10b981',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  startUrl: '/',
  scope: '/',
  lang: 'fr-FR',
  dir: 'ltr'
} as const

// URLs et endpoints API
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.mathilde-fleurs.com',
  version: 'v1',
  timeout: 30000, // 30 secondes
  retryAttempts: 3,
  retryDelay: 1000, // 1 seconde
} as const

// Configuration de sécurité
export const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes en ms
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 heures en ms
  csrfTokenName: 'X-CSRF-Token',
  encryptionKeySize: 256,
  hashIterations: 10000,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  rateLimitWindow: 60 * 1000, // 1 minute
  rateLimitMaxRequests: 100
} as const

// Configuration des événements
export const EVENT_CONFIG = {
  statuses: {
    DRAFT: 'draft',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  defaultStatus: 'draft',
  maxDuration: 30, // jours
  reminderTimes: [
    { label: '1 heure avant', value: 60 },
    { label: '2 heures avant', value: 120 },
    { label: '1 jour avant', value: 1440 },
    { label: '1 semaine avant', value: 10080 }
  ],
  budgetLimits: {
    min: 50,
    max: 50000,
    defaultCurrency: 'EUR'
  }
} as const

// Configuration des fleurs
export const FLOWER_CONFIG = {
  categories: {
    ROSES: 'roses',
    TULIPS: 'tulips',
    CARNATIONS: 'carnations',
    LILIES: 'lilies',
    ORCHIDS: 'orchids',
    SEASONAL: 'seasonal',
    EXOTIC: 'exotic'
  },
  seasons: {
    SPRING: 'spring',
    SUMMER: 'summer',
    AUTUMN: 'autumn',
    WINTER: 'winter'
  },
  colors: [
    'Rouge', 'Rose', 'Blanc', 'Jaune', 'Orange', 
    'Violet', 'Bleu', 'Vert', 'Multicolore'
  ],
  priceRanges: [
    { label: 'Économique', min: 0, max: 100 },
    { label: 'Standard', min: 100, max: 300 },
    { label: 'Premium', min: 300, max: 600 },
    { label: 'Luxe', min: 600, max: 1500 }
  ]
} as const

// Configuration de l'interface utilisateur
export const UI_CONFIG = {
  themes: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  },
  defaultTheme: 'system',
  languages: [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ],
  defaultLanguage: 'fr',
  dateFormats: [
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'DD-MM-YYYY'
  ],
  timeFormats: ['24h', '12h'],
  currencies: [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar US' },
    { code: 'GBP', symbol: '£', name: 'Livre Sterling' },
    { code: 'CHF', symbol: 'CHF', name: 'Franc Suisse' }
  ],
  defaultCurrency: 'EUR',
  itemsPerPage: {
    events: 12,
    clients: 15,
    flowers: 20
  },
  maxSearchResults: 50
} as const

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  types: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  duration: {
    short: 3000,   // 3 secondes
    medium: 5000,  // 5 secondes
    long: 8000     // 8 secondes
  },
  position: 'top-right',
  maxVisible: 5,
  pushNotifications: {
    vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
    endpoint: '/api/notifications/subscribe'
  }
} as const

// Configuration du stockage
export const STORAGE_CONFIG = {
  keys: {
    events: 'mathilde_events',
    clients: 'mathilde_clients',
    flowers: 'mathilde_flowers',
    settings: 'mathilde_settings',
    theme: 'mathilde_theme',
    preferences: 'mathilde_preferences',
    profile: 'mathilde_profile',
    auth: 'mathilde_auth',
    cache: 'mathilde_cache'
  },
  quotaWarningThreshold: 0.8, // 80% du quota utilisé
  cleanupInterval: 7 * 24 * 60 * 60 * 1000, // 7 jours
  maxCacheAge: 24 * 60 * 60 * 1000, // 24 heures
  compressionEnabled: true
} as const

// Configuration des médias
export const MEDIA_CONFIG = {
  images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    compressionQuality: 0.8,
    maxDimensions: {
      width: 2048,
      height: 2048
    },
    thumbnailSizes: [
      { name: 'small', width: 150, height: 150 },
      { name: 'medium', width: 300, height: 300 },
      { name: 'large', width: 600, height: 600 }
    ]
  },
  documents: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['application/pdf', 'text/plain', 'application/msword']
  }
} as const

// Configuration de performance
export const PERFORMANCE_CONFIG = {
  metrics: {
    enabled: import.meta.env.DEV,
    sampleRate: 0.1, // 10% des sessions
    maxMetrics: 1000,
    flushInterval: 30000 // 30 secondes
  },
  caching: {
    staticAssets: 365 * 24 * 60 * 60, // 1 an en secondes
    apiResponses: 5 * 60, // 5 minutes en secondes
    images: 30 * 24 * 60 * 60 // 30 jours en secondes
  },
  lazyLoading: {
    enabled: true,
    rootMargin: '50px',
    threshold: 0.1
  },
  bundleSize: {
    warningThreshold: 244 * 1024, // 244KB
    errorThreshold: 512 * 1024    // 512KB
  }
} as const

// Configuration des analytics
export const ANALYTICS_CONFIG = {
  enabled: import.meta.env.PROD,
  trackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
  events: {
    PAGE_VIEW: 'page_view',
    USER_ENGAGEMENT: 'user_engagement',
    EVENT_CREATE: 'event_create',
    EVENT_UPDATE: 'event_update',
    EVENT_DELETE: 'event_delete',
    CLIENT_CREATE: 'client_create',
    SEARCH: 'search',
    EXPORT: 'export',
    PWA_INSTALL: 'pwa_install'
  },
  customDimensions: {
    USER_TYPE: 'user_type',
    THEME: 'theme',
    LANGUAGE: 'language',
    DEVICE_TYPE: 'device_type'
  }
} as const

// Configuration de validation
export const VALIDATION_CONFIG = {
  client: {
    nameMinLength: 2,
    nameMaxLength: 50,
    emailMaxLength: 100,
    phonePattern: /^(\+33|0)[1-9](\d{8})$/,
    postalCodePattern: /^\d{5}$/
  },
  event: {
    titleMinLength: 1,
    titleMaxLength: 100,
    descriptionMaxLength: 1000,
    budgetMin: 1,
    budgetMax: 100000,
    maxFlowerTypes: 50,
    maxImages: 10
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 jours
  }
} as const

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  // Erreurs génériques
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
  NETWORK_ERROR: 'Erreur de connexion réseau',
  TIMEOUT_ERROR: 'La requête a expiré',
  PERMISSION_DENIED: 'Accès refusé',

  // Erreurs HTTP (utilisées par api.ts)
  networkError: 'Erreur de connexion réseau',
  timeout: 'La requête a expiré',
  unauthorized: 'Non autorisé',
  forbidden: 'Accès interdit',
  notFound: 'Ressource introuvable',
  rateLimitExceeded: 'Trop de requêtes, veuillez réessayer plus tard',
  serverError: 'Erreur serveur',

  // Erreurs de validation
  REQUIRED_FIELD: 'Ce champ est requis',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  INVALID_DATE: 'Date invalide',
  PASSWORD_TOO_WEAK: 'Mot de passe trop faible',

  // Erreurs métier
  EVENT_NOT_FOUND: 'Événement introuvable',
  CLIENT_NOT_FOUND: 'Client introuvable',
  BUDGET_EXCEEDED: 'Budget dépassé',
  DATE_IN_PAST: 'La date ne peut pas être dans le passé',

  // Erreurs de stockage
  STORAGE_QUOTA_EXCEEDED: 'Espace de stockage insuffisant',
  STORAGE_ACCESS_DENIED: 'Accès au stockage refusé',

  // Erreurs PWA
  PWA_NOT_SUPPORTED: 'Installation PWA non supportée',
  NOTIFICATION_PERMISSION_DENIED: 'Permissions de notification refusées'
} as const

// Messages de succès
export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Événement créé avec succès',
  EVENT_UPDATED: 'Événement mis à jour avec succès',
  EVENT_DELETED: 'Événement supprimé avec succès',
  CLIENT_CREATED: 'Client créé avec succès',
  CLIENT_UPDATED: 'Client mis à jour avec succès',
  CLIENT_DELETED: 'Client supprimé avec succès',
  SETTINGS_SAVED: 'Paramètres sauvegardés avec succès',
  DATA_EXPORTED: 'Données exportées avec succès',
  DATA_IMPORTED: 'Données importées avec succès',
  PWA_INSTALLED: 'Application installée avec succès',
  NOTIFICATION_ENABLED: 'Notifications activées avec succès'
} as const

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_CREATE: '/events/new',
  EVENT_EDIT: '/events/:id/edit',
  EVENT_DETAILS: '/events/:id',
  CLIENTS: '/clients',
  CLIENT_CREATE: '/clients/new',
  CLIENT_EDIT: '/clients/:id/edit',
  CLIENT_PROFILE: '/clients/:id',
  CALENDAR: '/calendar',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_PREFERENCES: '/settings/preferences',
  NOT_FOUND: '/404'
} as const

// Regex patterns utiles
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_FR: /^(\+33|0)[1-9](\d{8})$/,
  POSTAL_CODE_FR: /^\d{5}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
} as const

// Formats de date et heure
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  ISO_TIME: 'YYYY-MM-DDTHH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_LONG: 'dddd DD MMMM YYYY',
  TIME_24: 'HH:mm',
  TIME_12: 'hh:mm A',
  DATETIME: 'DD/MM/YYYY HH:mm',
  RELATIVE: 'fromNow'
} as const

// Labels des statuts d'événement (utilisé par format.ts)
export const EVENT_STATUS_LABELS = {
  draft: 'Brouillon',
  confirmed: 'Confirmé',
  in_progress: 'En cours',
  completed: 'Terminé',
  invoiced: 'Facturé',
  paid: 'Payé',
  cancelled: 'Annulé',
  archived: 'Archivé'
} as const

// Labels des catégories de fleurs (utilisé par format.ts)
export const FLOWER_CATEGORY_LABELS = {
  roses: 'Roses',
  tulips: 'Tulipes',
  carnations: 'Œillets',
  lilies: 'Lys',
  orchids: 'Orchidées',
  seasonal: 'Saisonnières',
  exotic: 'Exotiques'
} as const

// Labels des rôles utilisateur (utilisé par format.ts)
export const USER_ROLE_LABELS = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  florist: 'Fleuriste',
  client: 'Client'
} as const

// Saisons (utilisé par date.ts)
export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter'
} as const

// Mois par saison (utilisé par date.ts)
export const SEASON_MONTHS = {
  spring: [3, 4, 5],   // Mars, Avril, Mai
  summer: [6, 7, 8],   // Juin, Juillet, Août
  autumn: [9, 10, 11], // Septembre, Octobre, Novembre
  winter: [12, 1, 2]   // Décembre, Janvier, Février
} as const

// Export par défaut pour accès global
export default {
  APP_CONFIG,
  PWA_CONFIG,
  API_CONFIG,
  SECURITY_CONFIG,
  EVENT_CONFIG,
  FLOWER_CONFIG,
  UI_CONFIG,
  NOTIFICATION_CONFIG,
  STORAGE_CONFIG,
  MEDIA_CONFIG,
  PERFORMANCE_CONFIG,
  ANALYTICS_CONFIG,
  VALIDATION_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  PATTERNS,
  DATE_FORMATS,
  EVENT_STATUS_LABELS,
  FLOWER_CATEGORY_LABELS,
  USER_ROLE_LABELS,
  SEASONS,
  SEASON_MONTHS
} as const