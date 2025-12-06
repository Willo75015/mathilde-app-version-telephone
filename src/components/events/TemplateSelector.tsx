import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layout, ChevronDown, ChevronUp, Clock, Users, Euro,
  Star, Sparkles, Check, X
} from 'lucide-react'
import { EventTemplate, EventTemplateCategory } from '@/types'
import { useEventTemplates } from '@/hooks/useEventTemplates'
import Card from '@/components/ui/Card'

interface TemplateSelectorProps {
  onSelect: (template: EventTemplate) => void
  onSkip: () => void
  selectedTemplateId?: string
}

// Configuration des catégories
const CATEGORY_CONFIG: Record<EventTemplateCategory, { label: string; color: string }> = {
  [EventTemplateCategory.WEDDING]: { label: 'Mariage', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  [EventTemplateCategory.CORPORATE]: { label: 'Corporate', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  [EventTemplateCategory.BIRTHDAY]: { label: 'Anniversaire', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  [EventTemplateCategory.FUNERAL]: { label: 'Funérailles', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  [EventTemplateCategory.BAPTISM]: { label: 'Baptême', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  [EventTemplateCategory.RECEPTION]: { label: 'Réception', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  [EventTemplateCategory.CUSTOM]: { label: 'Personnalisé', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' }
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  onSkip,
  selectedTemplateId
}) => {
  const { templates, getMostUsedTemplates } = useEventTemplates()
  const [selectedCategory, setSelectedCategory] = useState<EventTemplateCategory | 'all' | 'popular'>('popular')
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null)

  // Templates les plus utilisés
  const popularTemplates = useMemo(() => getMostUsedTemplates(5), [getMostUsedTemplates])

  // Filtrer les templates selon la catégorie sélectionnée
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'popular') {
      return popularTemplates
    }
    if (selectedCategory === 'all') {
      return templates
    }
    return templates.filter(t => t.category === selectedCategory)
  }, [templates, selectedCategory, popularTemplates])

  // Catégories disponibles (avec au moins un template)
  const availableCategories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category))
    return Object.values(EventTemplateCategory).filter(cat => cats.has(cat))
  }, [templates])

  const handleTemplateClick = (template: EventTemplate) => {
    if (expandedTemplateId === template.id) {
      setExpandedTemplateId(null)
    } else {
      setExpandedTemplateId(template.id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Choisir un template
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Démarrez rapidement avec une base prédéfinie
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Créer sans template
        </button>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('popular')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
            selectedCategory === 'popular'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Populaires</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Tous
        </button>
        {availableCategories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-500 text-white'
                : CATEGORY_CONFIG[cat].color + ' hover:opacity-80'
            }`}
          >
            {CATEGORY_CONFIG[cat].label}
          </button>
        ))}
      </div>

      {/* Liste des templates */}
      <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence>
          {filteredTemplates.map((template) => {
            const isExpanded = expandedTemplateId === template.id
            const isSelected = selectedTemplateId === template.id
            const catConfig = CATEGORY_CONFIG[template.category]

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700'
                  }`}
                  onClick={() => handleTemplateClick(template)}
                >
                  {/* En-tête du template */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </h4>
                          {template.isCustom && (
                            <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                              Personnalisé
                            </span>
                          )}
                          {template.usageCount > 0 && (
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Utilisé {template.usageCount}x</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {template.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Euro className="w-3.5 h-3.5" />
                            <span>{template.defaultBudget.toLocaleString()}€</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{template.defaultDuration}h</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{template.defaultFloristsRequired} fleuriste{template.defaultFloristsRequired > 1 ? 's' : ''}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${catConfig.color}`}>
                        {catConfig.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Détails expandables */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                          {/* Fleurs suggérées */}
                          {template.suggestedFlowers && template.suggestedFlowers.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fleurs suggérées
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {template.suggestedFlowers.map((flower, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 text-xs rounded"
                                  >
                                    {flower}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Matériel suggéré */}
                          {template.suggestedMaterials && template.suggestedMaterials.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Matériel inclus
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {template.suggestedMaterials.map((material, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                                  >
                                    {material}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Checklist */}
                          {template.checklistItems && template.checklistItems.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Checklist
                              </p>
                              <ul className="space-y-1">
                                {template.checklistItems.slice(0, 3).map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400"
                                  >
                                    <Check className="w-3 h-3 text-green-500" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                                {template.checklistItems.length > 3 && (
                                  <li className="text-xs text-gray-500">
                                    +{template.checklistItems.length - 3} autres étapes...
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Notes */}
                          {template.notes && (
                            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
                              💡 {template.notes}
                            </div>
                          )}

                          {/* Bouton de sélection */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelect(template)
                            }}
                            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>Utiliser ce template</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun template dans cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateSelector
