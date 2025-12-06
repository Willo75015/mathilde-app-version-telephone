import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Euro, Flower2, Truck, Package,
  Users, MoreHorizontal, Receipt, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { Expense, ExpenseCategory } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

interface ExpenseManagerProps {
  expenses: Expense[]
  budget: number
  onChange: (expenses: Expense[]) => void
  readOnly?: boolean
}

// Configuration des catégories de dépenses
const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: React.ReactNode; color: string }> = {
  [ExpenseCategory.FLOWERS]: {
    label: 'Fleurs',
    icon: <Flower2 className="w-4 h-4" />,
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
  },
  [ExpenseCategory.MATERIALS]: {
    label: 'Matériel',
    icon: <Package className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  },
  [ExpenseCategory.TRANSPORT]: {
    label: 'Transport',
    icon: <Truck className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  },
  [ExpenseCategory.FLORIST_FEES]: {
    label: 'Fleuristes',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  },
  [ExpenseCategory.OTHER]: {
    label: 'Autres',
    icon: <MoreHorizontal className="w-4 h-4" />,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  expenses = [],
  budget,
  onChange,
  readOnly = false
}) => {
  const [isExpanded, setIsExpanded] = useState(expenses.length > 0)
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: ExpenseCategory.FLOWERS,
    description: '',
    amount: 0
  })

  // Calculs de rentabilité
  const profitability = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const margin = budget - totalExpenses
    const marginPercent = budget > 0 ? (margin / budget) * 100 : 0

    // Répartition par catégorie
    const byCategory = Object.values(ExpenseCategory).reduce((acc, cat) => {
      acc[cat] = expenses
        .filter(exp => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0)
      return acc
    }, {} as Record<ExpenseCategory, number>)

    return {
      totalExpenses,
      margin,
      marginPercent: Math.round(marginPercent * 10) / 10,
      byCategory
    }
  }, [expenses, budget])

  // Ajouter une dépense
  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || newExpense.amount <= 0) {
      return
    }

    const expense: Expense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: newExpense.category || ExpenseCategory.OTHER,
      description: newExpense.description,
      amount: newExpense.amount,
      date: new Date()
    }

    onChange([...expenses, expense])
    setNewExpense({
      category: ExpenseCategory.FLOWERS,
      description: '',
      amount: 0
    })
  }

  // Supprimer une dépense
  const handleRemoveExpense = (expenseId: string) => {
    onChange(expenses.filter(exp => exp.id !== expenseId))
  }

  // Couleur de la marge selon le pourcentage
  const getMarginColor = () => {
    if (profitability.marginPercent >= 50) return 'text-green-600'
    if (profitability.marginPercent >= 30) return 'text-yellow-600'
    if (profitability.marginPercent >= 0) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Card className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
      {/* Header avec toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Dépenses & Rentabilité
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {expenses.length} dépense{expenses.length > 1 ? 's' : ''} • Total: {profitability.totalExpenses.toLocaleString()}€
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Indicateur de marge */}
          <div className={`text-right ${getMarginColor()}`}>
            <div className="flex items-center space-x-1">
              {profitability.margin >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-bold">{profitability.marginPercent}%</span>
            </div>
            <p className="text-xs">
              Marge: {profitability.margin.toLocaleString()}€
            </p>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Contenu expansible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">

              {/* Résumé par catégorie */}
              {profitability.totalExpenses > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(EXPENSE_CATEGORIES).map(([cat, config]) => {
                    const amount = profitability.byCategory[cat as ExpenseCategory] || 0
                    if (amount === 0) return null
                    return (
                      <div key={cat} className={`p-2 rounded-lg text-center ${config.color}`}>
                        <div className="flex justify-center mb-1">{config.icon}</div>
                        <p className="text-xs font-medium">{amount}€</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Liste des dépenses */}
              {expenses.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {expenses.map((expense) => {
                    const catConfig = EXPENSE_CATEGORIES[expense.category]
                    return (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`p-1.5 rounded ${catConfig.color}`}>
                            {catConfig.icon}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {expense.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {catConfig.label} • {new Date(expense.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {expense.amount.toLocaleString()}€
                          </span>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExpense(expense.id)}
                              className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Formulaire d'ajout */}
              {!readOnly && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white"
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([cat, config]) => (
                      <option key={cat} value={cat}>{config.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Description"
                    value={newExpense.description || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white"
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Montant"
                      min="0"
                      step="0.01"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white"
                    />
                    <span className="text-gray-500">€</span>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddExpense}
                    disabled={!newExpense.description || !newExpense.amount}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Résumé financier */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Budget</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {budget.toLocaleString()}€
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-xs text-red-600 dark:text-red-400">Dépenses</p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">
                    {profitability.totalExpenses.toLocaleString()}€
                  </p>
                </div>
                <div className={`p-3 rounded-lg text-center ${
                  profitability.margin >= 0
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <p className={`text-xs ${
                    profitability.margin >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>Marge</p>
                  <p className={`text-lg font-bold ${
                    profitability.margin >= 0
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {profitability.margin.toLocaleString()}€
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default ExpenseManager
