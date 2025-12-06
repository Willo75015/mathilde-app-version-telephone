import { useState, useCallback, useMemo } from 'react'
import { EventTemplate, EventTemplateCategory } from '@/types'

// Clé localStorage pour les templates personnalisés
const TEMPLATES_KEY = 'mathilde-event-templates'
const USAGE_KEY = 'mathilde-templates-usage'

// Templates par défaut (prédéfinis)
const DEFAULT_TEMPLATES: EventTemplate[] = [
  {
    id: 'tpl-wedding-classic',
    name: 'Mariage Classique',
    category: EventTemplateCategory.WEDDING,
    description: 'Décoration florale complète pour cérémonie et réception',
    icon: '💒',
    defaultBudget: 3500,
    defaultDuration: 10,
    defaultFloristsRequired: 3,
    suggestedFlowers: ['Roses', 'Pivoines', 'Lisianthus', 'Eucalyptus'],
    suggestedMaterials: ['Arche florale', 'Centres de table', 'Bouquet mariée', 'Boutonnières'],
    checklistItems: [
      'Rendez-vous client pour choix des fleurs',
      'Visite du lieu de cérémonie',
      'Préparation des compositions',
      'Livraison et installation',
      'Récupération du matériel'
    ],
    notes: 'Prévoir un essai bouquet 2 semaines avant',
    isCustom: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'tpl-wedding-intime',
    name: 'Mariage Intime',
    category: EventTemplateCategory.WEDDING,
    description: 'Décoration sobre pour petit comité (moins de 50 personnes)',
    icon: '💐',
    defaultBudget: 1500,
    defaultDuration: 6,
    defaultFloristsRequired: 2,
    suggestedFlowers: ['Roses', 'Gypsophile', 'Renoncules'],
    suggestedMaterials: ['Bouquet mariée', 'Décoration table d\'honneur', '5 centres de table'],
    checklistItems: [
      'Choix des fleurs',
      'Préparation des compositions',
      'Livraison'
    ],
    isCustom: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'tpl-corporate',
    name: 'Événement Corporate',
    category: EventTemplateCategory.CORPORATE,
    description: 'Compositions florales pour événement d\'entreprise',
    icon: '🏢',
    defaultBudget: 2000,
    defaultDuration: 4,
    defaultFloristsRequired: 2,
    suggestedFlowers: ['Orchidées', 'Anthuriums', 'Monstera'],
    suggestedMaterials: ['Compositions accueil', 'Décoration scène', 'Centres de table'],
    checklistItems: [
      'Brief client sur l\'image de marque',
      'Visite des locaux',
      'Installation le jour J'
    ],
    notes: 'Respecter la charte couleur de l\'entreprise',
    isCustom: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'tpl-birthday',
    name: 'Anniversaire',
    category: EventTemplateCategory.BIRTHDAY,
    description: 'Décoration festive pour anniversaire',
    icon: '🎂',
    defaultBudget: 500,
    defaultDuration: 3,
    defaultFloristsRequired: 1,
    suggestedFlowers: ['Roses', 'Gerberas', 'Alstroemeria'],
    suggestedMaterials: ['Centre de table', 'Composition principale', 'Petits bouquets'],
    checklistItems: [
      'Choix des couleurs avec le client',
      'Préparation',
      'Livraison'
    ],
    isCustom: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'tpl-funeral',
    name: 'Cérémonie Funéraire',
    category: EventTemplateCategory.FUNERAL,
    description: 'Compositions florales pour hommage',
    icon: '🕯️',
    defaultBudget: 800,
    defaultDuration: 2,
    defaultFloristsRequired: 1,
    suggestedFlowers: ['Lys blancs', 'Roses blanches', 'Chrysanthèmes', 'Gerberas'],
    suggestedMaterials: ['Gerbe', 'Coussin', 'Croix florale'],
    checklistItems: [
      'Contact famille pour les préférences',
      'Préparation des compositions',
      'Livraison au lieu de cérémonie'
    ],
    notes: 'Privilégier les tons blancs et pastels sauf demande spécifique',
    isCustom: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'tpl-baptism',
    name: 'Baptême',
    category: EventTemplateCategory.BAPTISM,
    description: 'Décoration douce et élégante pour baptême',
    icon: '👼',
    defaultBudget: 600,
    defaultDuration: 4,
    defaultFloristsRequired: 1,
    suggestedFlowers: ['Roses', 'Gypsophile', 'Lavande', 'Camomille'],
    suggestedMaterials: ['Décoration église', 'Centre de table réception', 'Petites compositions'],
    checklistItems: [
      'Rencontre famille',
      'Visite église',
      'Installation'
    ],
    notes: 'Tons pastel recommandés (rose, bleu ciel, blanc)',
    isCustom: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'tpl-reception',
    name: 'Réception / Cocktail',
    category: EventTemplateCategory.RECEPTION,
    description: 'Ambiance florale pour réception ou cocktail',
    icon: '🥂',
    defaultBudget: 1200,
    defaultDuration: 5,
    defaultFloristsRequired: 2,
    suggestedFlowers: ['Roses', 'Hortensias', 'Dahlias', 'Eucalyptus'],
    suggestedMaterials: ['Décoration buffet', 'Compositions d\'accueil', 'Centres de table'],
    checklistItems: [
      'Visite du lieu',
      'Définition de l\'ambiance',
      'Installation'
    ],
    isCustom: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

interface UseEventTemplatesReturn {
  // Données
  templates: EventTemplate[]
  defaultTemplates: EventTemplate[]
  customTemplates: EventTemplate[]

  // Actions
  createTemplate: (template: Omit<EventTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isCustom'>) => EventTemplate
  updateTemplate: (id: string, updates: Partial<EventTemplate>) => void
  deleteTemplate: (id: string) => void
  incrementUsage: (id: string) => void

  // Helpers
  getTemplateById: (id: string) => EventTemplate | undefined
  getTemplatesByCategory: (category: EventTemplateCategory) => EventTemplate[]
  getMostUsedTemplates: (limit?: number) => EventTemplate[]
}

/**
 * Hook pour gérer les templates d'événements
 */
export function useEventTemplates(): UseEventTemplatesReturn {
  // Charger les templates personnalisés depuis localStorage
  const [customTemplates, setCustomTemplates] = useState<EventTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }))
      }
      return []
    } catch {
      return []
    }
  })

  // Charger les compteurs d'utilisation
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(USAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Combiner templates par défaut et personnalisés
  const templates = useMemo(() => {
    const defaultWithUsage = DEFAULT_TEMPLATES.map(t => ({
      ...t,
      usageCount: usageCounts[t.id] || 0
    }))

    const customWithUsage = customTemplates.map(t => ({
      ...t,
      usageCount: usageCounts[t.id] || t.usageCount || 0
    }))

    return [...defaultWithUsage, ...customWithUsage]
  }, [customTemplates, usageCounts])

  // Créer un nouveau template
  const createTemplate = useCallback((
    templateData: Omit<EventTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isCustom'>
  ): EventTemplate => {
    const newTemplate: EventTemplate = {
      ...templateData,
      id: `tpl-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setCustomTemplates(prev => {
      const updated = [...prev, newTemplate]
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated))
      return updated
    })

    return newTemplate
  }, [])

  // Mettre à jour un template personnalisé
  const updateTemplate = useCallback((id: string, updates: Partial<EventTemplate>) => {
    setCustomTemplates(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      )
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Supprimer un template personnalisé
  const deleteTemplate = useCallback((id: string) => {
    setCustomTemplates(prev => {
      const updated = prev.filter(t => t.id !== id)
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Incrémenter le compteur d'utilisation
  const incrementUsage = useCallback((id: string) => {
    setUsageCounts(prev => {
      const updated = { ...prev, [id]: (prev[id] || 0) + 1 }
      localStorage.setItem(USAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Obtenir un template par ID
  const getTemplateById = useCallback((id: string): EventTemplate | undefined => {
    return templates.find(t => t.id === id)
  }, [templates])

  // Obtenir les templates par catégorie
  const getTemplatesByCategory = useCallback((category: EventTemplateCategory): EventTemplate[] => {
    return templates.filter(t => t.category === category)
  }, [templates])

  // Obtenir les templates les plus utilisés
  const getMostUsedTemplates = useCallback((limit: number = 5): EventTemplate[] => {
    return [...templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }, [templates])

  return {
    templates,
    defaultTemplates: DEFAULT_TEMPLATES.map(t => ({ ...t, usageCount: usageCounts[t.id] || 0 })),
    customTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    getTemplateById,
    getTemplatesByCategory,
    getMostUsedTemplates
  }
}

export default useEventTemplates
