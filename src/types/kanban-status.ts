// 🎯 STATUTS KANBAN SYNCHRONISÉS - ÉVÉNEMENTS & CALENDRIER
// Configuration unifiée des statuts pour toute l'application

export enum EventStatus {
  DRAFT = 'draft',
  PLANNING = 'planning', // Phase de planification avant confirmation
  CONFIRMED = 'confirmed', 
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  INVOICED = 'invoiced', // Nouveau : Facturé
  PAID = 'paid', // Nouveau : Payé
  CANCELLED = 'cancelled'
}

// Configuration Kanban unified
export interface KanbanColumn {
  id: string
  title: string
  status: EventStatus
  bgColor: string
  headerColor: string
  textColor: string
  borderColor?: string
  icon: string
  iconColor: string
  emoji: string
  description: string
  count?: number
}

// Colonnes Kanban standardisées
export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'draft',
    title: 'À planifier',
    status: EventStatus.DRAFT,
    bgColor: 'bg-gray-50',
    headerColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: 'Clock',
    iconColor: 'text-gray-500',
    emoji: '📝',
    description: 'Événements en cours de création'
  },
  {
    id: 'planning',
    title: 'En planification',
    status: EventStatus.PLANNING,
    bgColor: 'bg-orange-50',
    headerColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: 'Calendar',
    iconColor: 'text-orange-500',
    emoji: '📋',
    description: 'Phase de planification avant confirmation'
  },
  {
    id: 'confirmed', 
    title: 'Confirmé',
    status: EventStatus.CONFIRMED,
    bgColor: 'bg-blue-50',
    headerColor: 'bg-blue-100', 
    textColor: 'text-blue-800',
    icon: 'CheckCircle',
    iconColor: 'text-blue-600',
    emoji: '⏳',
    description: 'Mission confirmée, en attente du jour J'
  },
  {
    id: 'in_progress',
    title: 'En cours',
    status: EventStatus.IN_PROGRESS,
    bgColor: 'bg-amber-50',
    headerColor: 'bg-amber-100',
    textColor: 'text-amber-800', 
    icon: 'AlertCircle',
    iconColor: 'text-amber-500',
    emoji: '🔄',
    description: 'Événement en cours de réalisation'
  },
  {
    id: 'completed',
    title: 'Terminé', 
    status: EventStatus.COMPLETED,
    bgColor: 'bg-pink-100',
    headerColor: 'bg-pink-200',
    textColor: 'text-pink-900',
    icon: 'CheckCircle',
    iconColor: 'text-pink-600', 
    emoji: '✅',
    description: 'Mission terminée - Prêt à facturer'
  },
  {
    id: 'invoiced',
    title: 'Facturé',
    status: EventStatus.INVOICED,
    bgColor: 'bg-purple-50',
    headerColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: 'FileText',
    iconColor: 'text-purple-500',
    emoji: '💼',
    description: 'Facture envoyée - En attente de paiement'
  },
  {
    id: 'paid',
    title: 'Payé',
    status: EventStatus.PAID,
    bgColor: 'bg-green-50',
    headerColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'DollarSign',
    iconColor: 'text-green-500',
    emoji: '💰',
    description: 'Paiement encaissé - Mission finalisée'
  },
  {
    id: 'cancelled',
    title: 'Annulé',
    status: EventStatus.CANCELLED,
    bgColor: 'bg-red-50', 
    headerColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'XCircle',
    iconColor: 'text-red-500',
    emoji: '❌', 
    description: 'Événement annulé'
  }
]

// Utilitaires pour les statuts
export const getKanbanColumn = (status: EventStatus): KanbanColumn => {
  return KANBAN_COLUMNS.find(col => col.status === status) || KANBAN_COLUMNS[0]
}

export const getStatusBadgeClass = (status: EventStatus): string => {
  const column = getKanbanColumn(status)
  return `${column.bgColor} ${column.textColor} border border-current border-opacity-20`
}

export const getStatusLabel = (status: EventStatus): string => {
  return getKanbanColumn(status).title
}

export const getStatusEmoji = (status: EventStatus): string => {
  return getKanbanColumn(status).emoji
}

// Priorités pour le tri
export const STATUS_PRIORITY: Record<EventStatus, number> = {
  [EventStatus.IN_PROGRESS]: 1,  // Plus urgent
  [EventStatus.CONFIRMED]: 2,
  [EventStatus.PLANNING]: 3,     // En planification
  [EventStatus.DRAFT]: 4,
  [EventStatus.COMPLETED]: 5,
  [EventStatus.INVOICED]: 6,     // À surveiller pour le paiement
  [EventStatus.PAID]: 7,         // Finalisé
  [EventStatus.CANCELLED]: 8     // Moins urgent
}

// Transitions autorisées entre statuts
export const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  [EventStatus.DRAFT]: [EventStatus.PLANNING, EventStatus.CONFIRMED, EventStatus.CANCELLED],
  [EventStatus.PLANNING]: [EventStatus.CONFIRMED, EventStatus.CANCELLED],
  [EventStatus.CONFIRMED]: [EventStatus.IN_PROGRESS, EventStatus.CANCELLED],
  [EventStatus.IN_PROGRESS]: [EventStatus.COMPLETED, EventStatus.CANCELLED],
  [EventStatus.COMPLETED]: [EventStatus.INVOICED, EventStatus.CANCELLED], // Peut passer à facturé
  [EventStatus.INVOICED]: [EventStatus.PAID, EventStatus.CANCELLED], // Peut passer à payé
  [EventStatus.PAID]: [], // Statut final
  [EventStatus.CANCELLED]: [EventStatus.DRAFT] // Peut être réactivé
}

export const canTransitionTo = (from: EventStatus, to: EventStatus): boolean => {
  return ALLOWED_TRANSITIONS[from].includes(to)
}
