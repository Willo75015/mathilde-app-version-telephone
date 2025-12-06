import { useMemo } from 'react'
import { Event, EventStatus, ExpenseCategory, EventProfitability } from '@/types'

interface ProfitabilityStats {
  // Par événement
  eventProfitability: EventProfitability[]

  // Globaux
  totalRevenue: number          // Total des budgets (payés)
  totalExpenses: number         // Total des dépenses
  totalMargin: number           // Revenu - Dépenses
  avgMarginPercent: number      // Marge moyenne en %

  // Par catégorie
  expensesByCategory: Record<ExpenseCategory, number>

  // Top/Bottom performers
  mostProfitable: EventProfitability | null
  leastProfitable: EventProfitability | null

  // Événements à risque (marge < 20%)
  atRiskEvents: EventProfitability[]

  // Tendances
  eventsWithExpenses: number
  eventsWithoutExpenses: number
}

/**
 * Hook pour calculer la rentabilité des événements
 */
export function useProfitability(events: Event[]): ProfitabilityStats {
  return useMemo(() => {
    // Filtrer les événements terminés/payés (ceux qui ont un budget réel)
    const completedEvents = events.filter(e =>
      e.status === EventStatus.COMPLETED ||
      e.status === EventStatus.INVOICED ||
      e.status === EventStatus.PAID
    )

    // Calculer la rentabilité par événement
    const eventProfitability: EventProfitability[] = completedEvents.map(event => {
      const totalExpenses = (event.expenses || []).reduce((sum, exp) => sum + exp.amount, 0)
      const margin = event.budget - totalExpenses
      const marginPercent = event.budget > 0 ? (margin / event.budget) * 100 : 0

      return {
        eventId: event.id,
        budget: event.budget,
        totalExpenses,
        margin,
        marginPercent: Math.round(marginPercent * 10) / 10
      }
    })

    // Totaux
    const totalRevenue = eventProfitability.reduce((sum, ep) => sum + ep.budget, 0)
    const totalExpenses = eventProfitability.reduce((sum, ep) => sum + ep.totalExpenses, 0)
    const totalMargin = totalRevenue - totalExpenses

    // Marge moyenne
    const avgMarginPercent = eventProfitability.length > 0
      ? eventProfitability.reduce((sum, ep) => sum + ep.marginPercent, 0) / eventProfitability.length
      : 0

    // Dépenses par catégorie (sur tous les événements)
    const expensesByCategory = Object.values(ExpenseCategory).reduce((acc, cat) => {
      acc[cat] = events.reduce((sum, event) => {
        const catExpenses = (event.expenses || [])
          .filter(exp => exp.category === cat)
          .reduce((s, exp) => s + exp.amount, 0)
        return sum + catExpenses
      }, 0)
      return acc
    }, {} as Record<ExpenseCategory, number>)

    // Trier par rentabilité
    const sortedByMargin = [...eventProfitability].sort((a, b) => b.marginPercent - a.marginPercent)
    const mostProfitable = sortedByMargin.length > 0 ? sortedByMargin[0] : null
    const leastProfitable = sortedByMargin.length > 0 ? sortedByMargin[sortedByMargin.length - 1] : null

    // Événements à risque (marge < 20%)
    const atRiskEvents = eventProfitability.filter(ep => ep.marginPercent < 20)

    // Compter les événements avec/sans dépenses
    const eventsWithExpenses = completedEvents.filter(e => (e.expenses || []).length > 0).length
    const eventsWithoutExpenses = completedEvents.length - eventsWithExpenses

    return {
      eventProfitability,
      totalRevenue,
      totalExpenses,
      totalMargin,
      avgMarginPercent: Math.round(avgMarginPercent * 10) / 10,
      expensesByCategory,
      mostProfitable,
      leastProfitable,
      atRiskEvents,
      eventsWithExpenses,
      eventsWithoutExpenses
    }
  }, [events])
}

/**
 * Calculer la rentabilité d'un seul événement
 */
export function calculateEventProfitability(event: Event): EventProfitability {
  const totalExpenses = (event.expenses || []).reduce((sum, exp) => sum + exp.amount, 0)
  const margin = event.budget - totalExpenses
  const marginPercent = event.budget > 0 ? (margin / event.budget) * 100 : 0

  return {
    eventId: event.id,
    budget: event.budget,
    totalExpenses,
    margin,
    marginPercent: Math.round(marginPercent * 10) / 10
  }
}

export default useProfitability
