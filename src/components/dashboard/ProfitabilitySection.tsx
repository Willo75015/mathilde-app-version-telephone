import React from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Euro, Flower2, Package,
  Truck, Users, MoreHorizontal, AlertTriangle, CheckCircle
} from 'lucide-react'
import { useEvents } from '@/contexts/AppContext'
import { useProfitability } from '@/hooks/useProfitability'
import { ExpenseCategory } from '@/types'
import Card from '@/components/ui/Card'

// Configuration des catégories
const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: React.ReactNode; color: string }> = {
  [ExpenseCategory.FLOWERS]: {
    label: 'Fleurs',
    icon: <Flower2 className="w-4 h-4" />,
    color: 'text-pink-600'
  },
  [ExpenseCategory.MATERIALS]: {
    label: 'Matériel',
    icon: <Package className="w-4 h-4" />,
    color: 'text-blue-600'
  },
  [ExpenseCategory.TRANSPORT]: {
    label: 'Transport',
    icon: <Truck className="w-4 h-4" />,
    color: 'text-orange-600'
  },
  [ExpenseCategory.FLORIST_FEES]: {
    label: 'Fleuristes',
    icon: <Users className="w-4 h-4" />,
    color: 'text-purple-600'
  },
  [ExpenseCategory.OTHER]: {
    label: 'Autres',
    icon: <MoreHorizontal className="w-4 h-4" />,
    color: 'text-gray-600'
  }
}

interface ProfitabilitySectionProps {
  navigate?: (page: string, params?: any) => void
}

const ProfitabilitySection: React.FC<ProfitabilitySectionProps> = ({ navigate }) => {
  const { events } = useEvents()
  const profitability = useProfitability(events)

  // Couleur selon la marge
  const getMarginColor = (percent: number) => {
    if (percent >= 50) return 'text-green-600 dark:text-green-400'
    if (percent >= 30) return 'text-yellow-600 dark:text-yellow-400'
    if (percent >= 0) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getMarginBg = (percent: number) => {
    if (percent >= 50) return 'bg-green-50 dark:bg-green-900/20'
    if (percent >= 30) return 'bg-yellow-50 dark:bg-yellow-900/20'
    if (percent >= 0) return 'bg-orange-50 dark:bg-orange-900/20'
    return 'bg-red-50 dark:bg-red-900/20'
  }

  // Trouver l'événement le plus rentable
  const mostProfitableEvent = profitability.mostProfitable
    ? events.find(e => e.id === profitability.mostProfitable?.eventId)
    : null

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
              Rentabilité
            </h2>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {profitability.eventsWithExpenses} événement{profitability.eventsWithExpenses > 1 ? 's' : ''} avec dépenses
            </p>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenus</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {profitability.totalRevenue.toLocaleString()}€
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dépenses</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {profitability.totalExpenses.toLocaleString()}€
          </p>
        </div>

        <div className={`p-4 rounded-lg shadow-sm ${getMarginBg(profitability.avgMarginPercent)}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Marge totale</p>
          <div className="flex items-center space-x-2">
            {profitability.totalMargin >= 0 ? (
              <TrendingUp className={`w-5 h-5 ${getMarginColor(profitability.avgMarginPercent)}`} />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <p className={`text-xl font-bold ${getMarginColor(profitability.avgMarginPercent)}`}>
              {profitability.totalMargin.toLocaleString()}€
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg shadow-sm ${getMarginBg(profitability.avgMarginPercent)}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Marge moyenne</p>
          <p className={`text-xl font-bold ${getMarginColor(profitability.avgMarginPercent)}`}>
            {profitability.avgMarginPercent}%
          </p>
        </div>
      </div>

      {/* Répartition des dépenses par catégorie */}
      {profitability.totalExpenses > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Répartition des dépenses
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
              const amount = profitability.expensesByCategory[cat as ExpenseCategory] || 0
              const percent = profitability.totalExpenses > 0
                ? Math.round((amount / profitability.totalExpenses) * 100)
                : 0

              if (amount === 0) {
                return (
                  <div key={cat} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center opacity-50">
                    <div className={`flex justify-center mb-1 ${config.color}`}>{config.icon}</div>
                    <p className="text-xs text-gray-400">0€</p>
                  </div>
                )
              }

              return (
                <div key={cat} className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center shadow-sm">
                  <div className={`flex justify-center mb-1 ${config.color}`}>{config.icon}</div>
                  <p className={`text-sm font-bold ${config.color}`}>{amount.toLocaleString()}€</p>
                  <p className="text-xs text-gray-500">{percent}%</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Alertes */}
      {profitability.atRiskEvents.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800 dark:text-yellow-200">
              {profitability.atRiskEvents.length} événement{profitability.atRiskEvents.length > 1 ? 's' : ''} à faible marge
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Ces événements ont une marge inférieure à 20%. Vérifiez les dépenses.
          </p>
        </div>
      )}

      {/* Événement le plus rentable */}
      {mostProfitableEvent && profitability.mostProfitable && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800 dark:text-green-200">
              Meilleure performance
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {mostProfitableEvent.title}
              </p>
              <p className="text-sm text-gray-500">
                Budget: {profitability.mostProfitable.budget.toLocaleString()}€ • Dépenses: {profitability.mostProfitable.totalExpenses.toLocaleString()}€
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {profitability.mostProfitable.marginPercent}%
              </p>
              <p className="text-sm text-green-600">
                +{profitability.mostProfitable.margin.toLocaleString()}€
              </p>
            </div>
          </div>
        </div>
      )}

      {/* État vide */}
      {profitability.eventsWithExpenses === 0 && (
        <div className="text-center py-8">
          <Euro className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune dépense enregistrée
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Ajoutez des dépenses à vos événements pour suivre la rentabilité.
          </p>
        </div>
      )}
    </Card>
  )
}

export default ProfitabilitySection
