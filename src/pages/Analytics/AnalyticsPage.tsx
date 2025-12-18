import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, RefreshCw, Calendar,
  Users, Euro, Flower2, Filter, CalendarDays, Home, Shield,
  Clock, CreditCard, Target, Award, Download, FileText
} from 'lucide-react'
import { useEvents, useClients } from '@/contexts/AppContext'
import { useEventTimeSync } from '@/hooks/useEventTimeSync'
import { usePerformance } from '@/hooks/usePerformance'
import PerformanceMonitor from '@/components/analytics/PerformanceMonitor'
import SecurityDashboard from '@/components/analytics/SecurityDashboard'
import UsageStats from '@/components/analytics/UsageStats'
import Charts from '@/components/dashboard/Charts'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import { AnalyticsExporter } from '@/lib/export'

// 🔧 TYPES POUR LES 4 ONGLETS 
type AnalyticsTheme = 'missions' | 'top-clients' | 'facturation' | 'paiement'
type DateRangeType = 'day' | 'week' | 'month' | 'year' | 'custom'

// 🆕 TYPES POUR LE SYSTÈME DE CHALLENGE MENSUEL
interface PaymentMetrics {
  avgPaymentDelay: number // Délai réel calculé
  rapideCount: number // ≤ 1 jour
  correctCount: number // 2-3 jours  
  lentCount: number // > 3 jours
  totalEvents: number
  challenge?: MonthlyChallenge
}

interface MonthlyChallenge {
  targetAvg: number // Objectif de délai moyen
  improvement: number // Amélioration souhaitée en %
  status: 'excellent' | 'good' | 'warning' | 'urgent'
  message: string
}

// 🆕 FONCTION UTILITAIRE pour calculs de croissance robustes
const calculateGrowthPercentage = (current: number, previous: number): number => {
  // Cas spéciaux
  if (previous === 0 && current === 0) return 0 // Pas de changement (0 → 0)
  if (previous === 0 && current > 0) return 100 // Nouvelle donnée (0 → X)
  if (previous > 0 && current === 0) return -100 // Perte totale (X → 0)
  
  // Calcul normal
  const growth = ((current - previous) / previous) * 100
  
  // Plafonnement pour éviter les valeurs extrêmes
  if (growth > 999) return 999
  if (growth < -100) return -100
  
  return Math.round(growth * 10) / 10 // Arrondi à 1 décimale
}

// 🆕 FONCTION pour formater l'affichage des pourcentages
const formatGrowthDisplay = (growth: number): string => {
  if (growth === 0) return '0.0%'
  if (growth === 999) return '+999%'
  if (growth === -100) return '-100%'
  
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${growth.toFixed(1)}%`
}

// 🔧 FONCTION FINALE - CALCUL PAIEMENT AVEC CACHE BUST
const calculateRealPaymentDelay = (events: any[]): PaymentMetrics => {
  console.log('🔍 Analytics - CACHE BUST - Nouvelle analyse paiements:', Date.now())
  
  // 🚨 RESET COMPLET - ignorer le cache
  const freshEvents = JSON.parse(JSON.stringify(events)) // Deep clone
  
  console.log('📋 Événements à analyser:', {
    total: freshEvents.length,
    details: freshEvents.map(e => ({ 
      title: e.title?.substring(0, 20), 
      status: e.status,
      hasInvoice: !!(e.invoiceDate || e.invoicedAt),
      hasPaid: !!(e.paidDate || e.paidAt)
    }))
  })
  
  // 🔧 FILTRAGE ULTRA-STRICT
  const validPaidEvents = freshEvents.filter(event => {
    const conditions = {
      isPaid: event.status === 'paid',
      hasInvoiceDate: !!(event.invoiceDate || event.invoicedAt),
      hasPaidDate: !!(event.paidDate || event.paidAt)
    }
    
    const isValid = conditions.isPaid && conditions.hasInvoiceDate && conditions.hasPaidDate
    
    console.log(`🔍 "${event.title}":`, { ...conditions, isValid })
    
    return isValid
  })
  
  console.log('✅ ÉVÉNEMENTS VALIDES FINAUX:', validPaidEvents.length)
  
  // 🚨 SI AUCUN ÉVÉNEMENT VALIDE
  if (validPaidEvents.length === 0) {
    console.log('🚫 RÉSULTAT: ZÉRO paiement valide trouvé')
    return {
      avgPaymentDelay: 0,
      rapideCount: 0,
      correctCount: 0,
      lentCount: 0,
      totalEvents: 0
    }
  }
  
  // Calcul des délais (seulement si événements valides)
  const delays = validPaidEvents.map(event => {
    const invoiceDate = new Date(event.invoiceDate || event.invoicedAt)
    const paidDate = new Date(event.paidDate || event.paidAt)
    const delayMs = paidDate.getTime() - invoiceDate.getTime()
    const delayDays = Math.max(0, Math.round(delayMs / (1000 * 60 * 60 * 24)))
    
    console.log(`⏱️ "${event.title}": ${delayDays} jours`)
    return delayDays
  })
  
  const result = {
    avgPaymentDelay: delays.reduce((s, d) => s + d, 0) / delays.length,
    rapideCount: delays.filter(d => d <= 1).length,
    correctCount: delays.filter(d => d >= 2 && d <= 3).length,
    lentCount: delays.filter(d => d > 3).length,
    totalEvents: validPaidEvents.length
  }
  
  console.log('🎯 RÉSULTAT FINAL CACHE-BUST:', result)
  return result
}

// 🆕 FONCTION pour générer le challenge mensuel
const generateMonthlyChallenge = (currentMetrics: PaymentMetrics, previousMetrics?: PaymentMetrics): MonthlyChallenge => {
  const { avgPaymentDelay, rapideCount, correctCount, lentCount, totalEvents } = currentMetrics
  
  // Calcul du pourcentage d'événements rapides
  const rapidePercentage = totalEvents > 0 ? (rapideCount / totalEvents) * 100 : 0
  
  let status: MonthlyChallenge['status']
  let targetAvg: number
  let improvement: number
  let message: string
  
  if (avgPaymentDelay <= 1.5 && rapidePercentage >= 70) {
    status = 'excellent'
    targetAvg = Math.max(1.0, avgPaymentDelay - 0.2)
    improvement = 5
    message = `🏆 Excellent ! Maintenez ce rythme exceptionnel. Défi : atteindre ${targetAvg}j de moyenne.`
  } else if (avgPaymentDelay <= 2.5 && rapidePercentage >= 50) {
    status = 'good'
    targetAvg = Math.max(1.5, avgPaymentDelay - 0.3)
    improvement = 10
    message = `💪 Bonne performance ! Objectif : réduire à ${targetAvg}j et augmenter les paiements rapides.`
  } else if (avgPaymentDelay <= 4) {
    status = 'warning'
    targetAvg = Math.max(2.0, avgPaymentDelay - 0.5)
    improvement = 15
    message = `⚠️ À améliorer. Objectif ambitieux : passer à ${targetAvg}j de moyenne le mois prochain.`
  } else {
    status = 'urgent'
    targetAvg = Math.max(2.5, avgPaymentDelay - 1.0)
    improvement = 20
    message = `🚨 Action requise ! Réduire drastiquement à ${targetAvg}j. Focus sur les relances.`
  }
  
  return { targetAvg, improvement, status, message }
}

interface AnalyticsPageProps {
  navigate?: (page: string, params?: any) => void
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ navigate }) => {
  const { events, isLoading: eventsLoading } = useEvents()
  const { clients, isLoading: clientsLoading } = useClients()
  const { metrics } = usePerformance()
  
  // 🆕 Synchronisation temps réel avec les événements
  const { currentTime, syncEventStatuses } = useEventTimeSync()
  
  // 🔧 ÉTATS UNIFIÉS (déclarés en premier)
  const [activeTheme, setActiveTheme] = useState<AnalyticsTheme>('missions')
  
  // 🆕 États pour la pagination des Top clients
  const [topClientsPage, setTopClientsPage] = useState(1)
  const clientsPerPage = 5
  
  // 🆕 Forcer la synchronisation des statuts au chargement des analytics
  useEffect(() => {
    if (!eventsLoading && events.length > 0) {
      console.log('📊 Analytics - Synchronisation des statuts au chargement')
      syncEventStatuses()
    }
  }, [eventsLoading, events.length, syncEventStatuses])
  
  // 🆕 Re-synchroniser automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (events.length > 0) {
        console.log('📊 Analytics - Synchronisation automatique des statuts')
        syncEventStatuses()
      }
    }, 30000) // 30 secondes
    
    return () => clearInterval(interval)
  }, [events.length, syncEventStatuses])
  
  // 🆕 Reset pagination clients quand on change d'onglet
  useEffect(() => {
    setTopClientsPage(1)
  }, [activeTheme])
  const [dateRange, setDateRange] = useState<DateRangeType>('month')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  
  // 🔧 Définition des 4 thèmes
  const analyticsThemes = [
    { 
      id: 'missions', 
      label: 'Nouvelles missions', 
      icon: Calendar,
      color: 'emerald',
      bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      boldTextColor: 'text-emerald-900 dark:text-emerald-100',
      iconBg: 'bg-emerald-500'
    },
    { 
      id: 'top-clients', 
      label: 'Top clients', 
      icon: Users,
      color: 'blue',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-600 dark:text-blue-400',
      boldTextColor: 'text-blue-900 dark:text-blue-100',
      iconBg: 'bg-blue-500'
    },
    { 
      id: 'facturation', 
      label: 'Temps facturation', 
      icon: Clock,
      color: 'purple',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-600 dark:text-purple-400',
      boldTextColor: 'text-purple-900 dark:text-purple-100',
      iconBg: 'bg-purple-500'
    },
    { 
      id: 'paiement', 
      label: 'Paiement', 
      icon: CreditCard,
      color: 'orange',
      bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      textColor: 'text-orange-600 dark:text-orange-400',
      boldTextColor: 'text-orange-900 dark:text-orange-100',
      iconBg: 'bg-orange-500'
    }
  ]
  
  const dateRangeOptions = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'year', label: 'Année' },
    { value: 'custom', label: 'Personnalisé' }
  ]
  
  // 🔧 FONCTION UNIFIÉE pour le filtre de date (synchronisé)
  const getDateFilter = () => {
    const now = new Date()
    
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate)
      }
    }
    
    const ranges = {
      'day': {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      },
      'week': {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      },
      'month': {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      },
      'year': {
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      }
    }
    
    return ranges[dateRange] || ranges['month']
  }
  
  // 🔧 DONNÉES FILTRÉES UNIFIÉES avec logique spéciale pour Paiement + STATUTS TEMPS RÉEL
  const filteredData = useMemo(() => {
    const { start, end } = getDateFilter()
    
    // 🆕 IMPORTANT: Utiliser les événements mis à jour en temps réel
    const realtimeEvents = events.map(event => ({
      ...event,
      // Assurer que les dates sont des objets Date
      date: new Date(event.date),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      invoiceDate: event.invoiceDate ? new Date(event.invoiceDate) : null,
      paidDate: event.paidDate ? new Date(event.paidDate) : null,
      completedDate: event.completedDate ? new Date(event.completedDate) : null
    }))
    
    let filteredEvents, filteredClients
    
    // 🎯 FILTRAGE SPÉCIAL pour l'onglet Paiement : filtrer par paidDate
    if (activeTheme === 'paiement') {
      filteredEvents = realtimeEvents.filter(event => {
        const paidDate = event.paidDate
        return paidDate && paidDate >= start && paidDate <= end
      })
    } else {
      // Filtrage normal par createdAt pour les autres onglets
      filteredEvents = realtimeEvents.filter(event => 
        event.createdAt >= start && event.createdAt <= end
      )
    }
    
    filteredClients = clients.filter(client => 
      client.createdAt >= start && client.createdAt <= end
    )
    
    console.log(`📊 Filtrage ${activeTheme} (temps réel):`, {
      theme: activeTheme,
      period: `${start.toLocaleDateString()} → ${end.toLocaleDateString()}`,
      totalEvents: realtimeEvents.length,
      filteredEvents: filteredEvents.length,
      filterType: activeTheme === 'paiement' ? 'paidDate' : 'createdAt',
      syncTime: currentTime.toLocaleTimeString()
    })
    
    return { 
      filteredEvents, 
      filteredClients, 
      start, 
      end,
      realtimeEvents // 🆕 Exposer les événements temps réel
    }
  }, [events, clients, dateRange, customStartDate, customEndDate, activeTheme, currentTime])

  // 🔧 Analytics calculations avec VRAIS DÉLAIS + TEMPS RÉEL
  const themeAnalytics = useMemo(() => {
    const { filteredEvents, filteredClients, start, end, realtimeEvents } = filteredData
    
    // Calcul période précédente pour évolution
    const periodDuration = end.getTime() - start.getTime()
    const prevStart = new Date(start.getTime() - periodDuration)
    const prevEnd = start
    
    let prevEvents
    if (activeTheme === 'paiement') {
      // Période précédente filtrée par paidDate pour l'onglet Paiement
      prevEvents = realtimeEvents.filter(event => {
        const paidDate = event.paidDate
        return paidDate && paidDate >= prevStart && paidDate < prevEnd
      })
    } else {
      // Période précédente normale par createdAt
      prevEvents = realtimeEvents.filter(event => 
        event.createdAt >= prevStart && event.createdAt < prevEnd
      )
    }
    
    const prevClients = clients.filter(client => 
      client.createdAt >= prevStart && client.createdAt < prevEnd
    )
    
    // Métriques actuelles
    const newMissions = filteredEvents.length
    const newClients = filteredClients.length
    const totalRevenue = filteredEvents.reduce((sum, event) => sum + (event.budget || 0), 0)
    const averageBasket = filteredEvents.length > 0 ? totalRevenue / filteredEvents.length : 0
    
    // 🔧 Temps de facturation RÉEL (basé sur completedDate → invoiceDate)
    const invoicedEvents = filteredEvents.filter(event => 
      event.completedDate && event.invoiceDate
    )
    
    let avgInvoicingTime = 0
    if (invoicedEvents.length > 0) {
      const invoicingDelays = invoicedEvents.map(event => {
        const completedDate = new Date(event.completedDate)
        const invoiceDate = new Date(event.invoiceDate)
        const delayMs = invoiceDate.getTime() - completedDate.getTime()
        const delayDays = Math.round(delayMs / (1000 * 60 * 60 * 24))
        return Math.max(0, delayDays)
      })
      avgInvoicingTime = invoicingDelays.reduce((sum, delay) => sum + delay, 0) / invoicingDelays.length
    }
    
    // 🔧 NOUVEAUX DÉLAIS DE PAIEMENT RÉELS
    const currentPaymentMetrics = calculateRealPaymentDelay(filteredEvents)
    const prevPaymentMetrics = calculateRealPaymentDelay(prevEvents)
    
    // Métriques précédentes
    const prevMissions = prevEvents.length
    const prevNewClients = prevClients.length
    const prevRevenue = prevEvents.reduce((sum, event) => sum + (event.budget || 0), 0)
    const prevAvgBasket = prevEvents.length > 0 ? prevRevenue / prevEvents.length : 0
    
    // Calculs d'évolution
    const missionGrowth = calculateGrowthPercentage(newMissions, prevMissions)
    const clientGrowth = calculateGrowthPercentage(newClients, prevNewClients)
    const revenueGrowth = calculateGrowthPercentage(totalRevenue, prevRevenue)
    const basketGrowth = calculateGrowthPercentage(averageBasket, prevAvgBasket)
    
    // Temps de facturation précédent
    const prevInvoicedEvents = prevEvents.filter(event => 
      event.completedDate && event.invoiceDate
    )
    let prevInvoicingTime = 0
    if (prevInvoicedEvents.length > 0) {
      const prevInvoicingDelays = prevInvoicedEvents.map(event => {
        const completedDate = new Date(event.completedDate)
        const invoiceDate = new Date(event.invoiceDate)
        const delayMs = invoiceDate.getTime() - completedDate.getTime()
        const delayDays = Math.round(delayMs / (1000 * 60 * 60 * 24))
        return Math.max(0, delayDays)
      })
      prevInvoicingTime = prevInvoicingDelays.reduce((sum, delay) => sum + delay, 0) / prevInvoicingDelays.length
    }
    
    const invoicingGrowth = calculateGrowthPercentage(avgInvoicingTime, prevInvoicingTime)
    const paymentGrowth = calculateGrowthPercentage(currentPaymentMetrics.avgPaymentDelay, prevPaymentMetrics.avgPaymentDelay)
    
    // 🆕 CHALLENGE MENSUEL
    const challenge = generateMonthlyChallenge(currentPaymentMetrics, prevPaymentMetrics)
    
    return {
      newMissions,
      newClients,
      totalRevenue,
      averageBasket,
      avgInvoicingTime: Math.round(avgInvoicingTime * 10) / 10,
      paymentMetrics: { ...currentPaymentMetrics, challenge },
      missionGrowth,
      clientGrowth,
      revenueGrowth,
      basketGrowth,
      invoicingGrowth,
      paymentGrowth
    }
  }, [filteredData, events, clients])

  // 🔧 Top clients avec données synchronisées selon le thème actif + PAGINATION
  const topClientsAnalytics = useMemo(() => {
    const { filteredEvents } = filteredData
    
    // 🆕 Adaptation du calcul selon le thème actif
    const clientRevenue = clients.map(client => {
      const clientEvents = filteredEvents.filter(event => event.clientId === client.id)
      let primaryMetric = 0
      let secondaryInfo = ''
      
      // 🔧 Calcul adapté au thème
      switch (activeTheme) {
        case 'missions':
          primaryMetric = clientEvents.length
          secondaryInfo = `${clientEvents.length} mission${clientEvents.length > 1 ? 's' : ''}`
          break
        case 'facturation':
          // Temps de facturation réel par client
          const clientInvoicedEvents = clientEvents.filter(event => 
            event.completedDate && event.invoiceDate
          )
          if (clientInvoicedEvents.length > 0) {
            const delays = clientInvoicedEvents.map(event => {
              const completedDate = new Date(event.completedDate)
              const invoiceDate = new Date(event.invoiceDate)
              const delayMs = invoiceDate.getTime() - completedDate.getTime()
              return Math.max(0, Math.round(delayMs / (1000 * 60 * 60 * 24)))
            })
            primaryMetric = delays.reduce((sum, delay) => sum + delay, 0) / delays.length
          }
          secondaryInfo = `${Math.round(primaryMetric * 10) / 10}j moy.`
          break
        case 'paiement':
          // Délai de paiement réel par client (INVOICED → PAID)
          const clientPaidEvents = clientEvents.filter(event => 
            event.status === 'paid' && event.invoiceDate && event.paidDate
          )
          if (clientPaidEvents.length > 0) {
            const delays = clientPaidEvents.map(event => {
              const invoiceDate = new Date(event.invoiceDate)
              const paidDate = new Date(event.paidDate)
              const delayMs = paidDate.getTime() - invoiceDate.getTime()
              return Math.max(0, Math.round(delayMs / (1000 * 60 * 60 * 24)))
            })
            primaryMetric = delays.reduce((sum, delay) => sum + delay, 0) / delays.length
          }
          secondaryInfo = `${Math.round(primaryMetric * 10) / 10}j moy.`
          break
        case 'top-clients':
        default:
          primaryMetric = clientEvents.reduce((sum, event) => sum + (event.budget || 0), 0)
          secondaryInfo = `${clientEvents.length} événement${clientEvents.length > 1 ? 's' : ''}`
          break
      }
      
      // Badge intelligent basé sur la métrique principale
      let badge = ''
      let badgeColor = 'bg-gray-500'
      
      if (activeTheme === 'missions') {
        if (primaryMetric >= 5) {
          badge = '🏆 Expert'
          badgeColor = 'bg-yellow-500'
        } else if (primaryMetric >= 3) {
          badge = '🥈 Régulier'
          badgeColor = 'bg-blue-500'
        } else if (primaryMetric >= 2) {
          badge = '🥉 Actif'
          badgeColor = 'bg-green-500'
        }
      } else if (activeTheme === 'facturation') {
        if (primaryMetric <= 1) {
          badge = '⚡ Rapide'
          badgeColor = 'bg-green-500'
        } else if (primaryMetric <= 3) {
          badge = '🟡 Normal'
          badgeColor = 'bg-yellow-500'
        } else {
          badge = '🔴 Lent'
          badgeColor = 'bg-red-500'
        }
      } else if (activeTheme === 'paiement') {
        if (primaryMetric <= 1) {
          badge = '💚 Rapide'
          badgeColor = 'bg-green-500'
        } else if (primaryMetric <= 3) {
          badge = '🟡 Correct'
          badgeColor = 'bg-yellow-500'
        } else {
          badge = '🔴 Lent'
          badgeColor = 'bg-red-500'
        }
      } else {
        // Top clients par défaut
        if (primaryMetric >= 10000) {
          badge = '👑 VIP'
          badgeColor = 'bg-yellow-500'
        } else if (primaryMetric >= 5000) {
          badge = '🥈 Fidèle'
          badgeColor = 'bg-blue-500'
        } else if (primaryMetric >= 1000) {
          badge = '🥉 Actif'
          badgeColor = 'bg-green-500'
        }
      }
      
      return {
        client,
        primaryMetric,
        revenue: clientEvents.reduce((sum, event) => sum + (event.budget || 0), 0),
        eventCount: clientEvents.length,
        secondaryInfo,
        badge,
        badgeColor
      }
    })
    .filter(item => item.eventCount > 0)
    .sort((a, b) => {
      // Tri selon le thème actif
      if (activeTheme === 'facturation' || activeTheme === 'paiement') {
        return a.primaryMetric - b.primaryMetric // Croissant pour temps (moins = mieux)
      }
      return b.primaryMetric - a.primaryMetric // Décroissant pour le reste
    })
    
    // 🆕 PAGINATION pour Top clients
    const totalClients = clientRevenue.length
    const totalPages = Math.ceil(totalClients / clientsPerPage)
    const startIndex = (topClientsPage - 1) * clientsPerPage
    const endIndex = startIndex + clientsPerPage
    const paginatedClients = clientRevenue.slice(startIndex, endIndex)
    
    return { 
      clientRevenue: paginatedClients,
      totalClients,
      totalPages,
      currentPage: topClientsPage,
      hasNextPage: topClientsPage < totalPages,
      hasPrevPage: topClientsPage > 1
    }
  }, [filteredData, clients, activeTheme, topClientsPage, clientsPerPage])

  // Get current theme config
  const currentTheme = analyticsThemes.find(theme => theme.id === activeTheme) || analyticsThemes[0]

  // 📊 Fonction d'export du rapport
  const handleExportReport = useCallback(async (format: 'csv' | 'json') => {
    const periodLabel = dateRange === 'custom'
      ? `${customStartDate} au ${customEndDate}`
      : dateRangeOptions.find(o => o.value === dateRange)?.label || 'Mois'

    const analyticsData = {
      totalEvents: themeAnalytics.newMissions,
      totalRevenue: themeAnalytics.totalRevenue,
      activeClients: themeAnalytics.newClients,
      averageOrderValue: themeAnalytics.averageBasket,
      eventsChange: themeAnalytics.missionGrowth,
      revenueChange: themeAnalytics.revenueGrowth,
      clientsChange: themeAnalytics.clientGrowth,
      aovChange: themeAnalytics.basketGrowth,
      avgInvoicingTime: themeAnalytics.avgInvoicingTime,
      paymentMetrics: themeAnalytics.paymentMetrics
    }

    try {
      await AnalyticsExporter.exportAnalytics(analyticsData, periodLabel, { format })
      console.log(`✅ Rapport exporté en ${format.toUpperCase()}`)
    } catch (error) {
      console.error('❌ Erreur export:', error)
    }
  }, [dateRange, customStartDate, customEndDate, themeAnalytics, dateRangeOptions])

  // 🆕 Fonction pour obtenir l'affichage d'évolution par thème
  const getThemeGrowthDisplay = (theme: AnalyticsTheme): string => {
    switch (theme) {
      case 'missions':
        return formatGrowthDisplay(themeAnalytics.missionGrowth)
      case 'top-clients':
        return '+0.0%' // Pas d'évolution pour top clients
      case 'facturation':
        return formatGrowthDisplay(themeAnalytics.invoicingGrowth)
      case 'paiement':
        return formatGrowthDisplay(themeAnalytics.paymentGrowth)
      default:
        return '0.0%'
    }
  }
  
  // 🆕 Fonction pour déterminer si la croissance est positive
  const isGrowthPositive = (theme: AnalyticsTheme): boolean => {
    switch (theme) {
      case 'missions':
        return themeAnalytics.missionGrowth >= 0
      case 'top-clients':
        return true // Toujours positif pour top clients
      case 'facturation':
        return themeAnalytics.invoicingGrowth <= 0 // Inversé: moins de temps = mieux
      case 'paiement':
        return themeAnalytics.paymentGrowth <= 0 // Inversé: moins de délai = mieux
      default:
        return true
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Analyses précises avec délais réels et challenges mensuels
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                🔄 Sync: {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            {/* Boutons d'export */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => handleExportReport('csv')}
                title="Exporter en CSV"
              >
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileText className="w-4 h-4" />}
                onClick={() => handleExportReport('json')}
                title="Exporter en JSON"
              >
                JSON
              </Button>
            </div>

            <Button
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              isLoading={eventsLoading || clientsLoading}
            >
              Actualiser
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 🔧 4 ONGLETS THÉMATIQUES */}
      <motion.div variants={itemVariants}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {analyticsThemes.map((theme) => {
              const Icon = theme.icon
              const isActive = activeTheme === theme.id
              
              return (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id as AnalyticsTheme)}
                  className={`
                    flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${isActive 
                      ? `border-${theme.color}-500 ${theme.textColor}` 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{theme.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </motion.div>

      {/* CONTENU PRINCIPAL EN 2 COLONNES */}
      <motion.div variants={itemVariants}>
        <div className={`grid grid-cols-1 gap-6 ${activeTheme === 'top-clients' ? '' : 'lg:grid-cols-3'}`}>
          
          {/* COLONNE 1 & 2: DÉTAIL DU THÈME SÉLECTIONNÉ */}
          <div className={`space-y-6 ${activeTheme === 'top-clients' ? '' : 'lg:col-span-2'}`}>
            
            {/* CARD MÉTRIQUE PRINCIPALE DU THÈME */}
            <Card className={`p-6 bg-gradient-to-br ${currentTheme.bgGradient} ${currentTheme.borderColor}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${currentTheme.iconBg} rounded-lg flex items-center justify-center`}>
                    <currentTheme.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${currentTheme.boldTextColor}`}>
                      {currentTheme.label}
                    </h2>
                    <p className={`text-sm ${currentTheme.textColor}`}>
                      🔗 Données réelles calculées depuis le Kanban
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 🔧 FILTRES TEMPORELS UNIFIÉS */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className={`text-sm font-medium ${currentTheme.textColor}`}>
                    Période d'analyse:
                  </span>
                  
                  <div className="flex space-x-2">
                    {dateRangeOptions.map((option) => (
                      <Button
                        key={`unified-${option.value}`}
                        variant={dateRange === option.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setDateRange(option.value as DateRangeType)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  
                  {dateRange === 'custom' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                      <span className="text-gray-500">→</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* 🔧 CONTENU CONDITIONNEL - TOP CLIENTS OU MÉTRIQUES */}
              {activeTheme === 'top-clients' ? (
                // 🆕 AFFICHAGE DE LA LISTE TOP CLIENTS DANS LA PARTIE PRINCIPALE
                <div className="space-y-4">
                  {/* Liste complète des top clients */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {topClientsAnalytics.clientRevenue.length > 0 ? (
                      topClientsAnalytics.clientRevenue.map((item, index) => (
                        <div 
                          key={item.client.id} 
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-600' :
                              index === 3 ? 'bg-green-500' :
                              'bg-primary-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-base">
                                {item.client.firstName} {item.client.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {item.secondaryInfo}
                              </p>
                              {/* Badge de statut */}
                              {item.badge && (
                                <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium text-white mt-1 ${item.badgeColor}`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white text-lg">
                              {item.revenue.toLocaleString('fr-FR', { 
                                style: 'currency', 
                                currency: 'EUR',
                                maximumFractionDigits: 0
                              })}
                            </p>
                            {/* 🆕 AFFICHAGE DES MÉTRIQUES SELON LE THÈME */}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {item.secondaryInfo}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Aucun client pour cette période</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Résumé en bas */}
                  {topClientsAnalytics.clientRevenue.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-6 text-center">
                        <div>
                          <p className={`text-3xl font-bold ${currentTheme.boldTextColor}`}>
                            {topClientsAnalytics.clientRevenue.length}
                          </p>
                          <p className={`text-sm ${currentTheme.textColor}`}>
                            Clients actifs
                          </p>
                        </div>
                        <div>
                          <p className={`text-3xl font-bold ${currentTheme.boldTextColor}`}>
                            {topClientsAnalytics.clientRevenue.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            })}
                          </p>
                          <p className={`text-sm ${currentTheme.textColor}`}>
                            CA total
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTheme === 'paiement' ? (
                // 🆕 AFFICHAGE SPÉCIAL POUR PAIEMENT AVEC CHALLENGE
                <div className="space-y-6">
                  {/* VALEUR PRINCIPALE ET ÉVOLUTION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className={`text-sm font-medium ${currentTheme.textColor} mb-2`}>
                        Délai moyen réel (Facturé → Payé)
                      </p>
                      <p className={`text-4xl font-bold ${currentTheme.boldTextColor}`}>
                        {themeAnalytics.paymentMetrics.totalEvents === 0 
                          ? 'N/A' 
                          : `${themeAnalytics.paymentMetrics.avgPaymentDelay}j`
                        }
                      </p>
                      <p className={`text-xs ${currentTheme.textColor} mt-1`}>
                        {themeAnalytics.paymentMetrics.totalEvents === 0 
                          ? 'Aucun paiement complet'
                          : `Basé sur ${themeAnalytics.paymentMetrics.totalEvents} paiement${themeAnalytics.paymentMetrics.totalEvents > 1 ? 's' : ''} complet${themeAnalytics.paymentMetrics.totalEvents > 1 ? 's' : ''}`
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${currentTheme.textColor} mb-2`}>
                        Évolution vs période précédente
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                          {getThemeGrowthDisplay(activeTheme)}
                        </span>
                        <span className="text-lg">
                          {isGrowthPositive(activeTheme) ? '📈' : '📉'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* RÉPARTITION DES DÉLAIS - AFFICHAGE CONDITIONNEL */}
                  {themeAnalytics.paymentMetrics.totalEvents > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {themeAnalytics.paymentMetrics.rapideCount}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          💚 Rapide (≤1j)
                        </p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                          {themeAnalytics.paymentMetrics.correctCount}
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          🟡 Correct (2-3j)
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                          {themeAnalytics.paymentMetrics.lentCount}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          🔴 Lent ({'>'} 3j)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="text-4xl mb-4">💳</div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun paiement complet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Les analytics de paiement apparaîtront quand des événements<br />
                        seront facturés ET payés avec les vraies dates.
                      </p>
                    </div>
                  )}
                  
                  {/* 🆕 CHALLENGE MENSUEL */}
                  {themeAnalytics.paymentMetrics.challenge && (
                    <div className={`p-4 rounded-lg border-2 ${
                      themeAnalytics.paymentMetrics.challenge.status === 'excellent' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      themeAnalytics.paymentMetrics.challenge.status === 'good' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                      themeAnalytics.paymentMetrics.challenge.status === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                      'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    }`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-6 h-6 text-orange-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Challenge du mois prochain
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {themeAnalytics.paymentMetrics.challenge.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {themeAnalytics.paymentMetrics.challenge.targetAvg}j
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Objectif moyen
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              -{themeAnalytics.paymentMetrics.challenge.improvement}%
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Amélioration
                            </p>
                          </div>
                        </div>
                        <Award className={`w-8 h-8 ${
                          themeAnalytics.paymentMetrics.challenge.status === 'excellent' ? 'text-yellow-500' :
                          themeAnalytics.paymentMetrics.challenge.status === 'good' ? 'text-blue-500' :
                          themeAnalytics.paymentMetrics.challenge.status === 'warning' ? 'text-orange-500' :
                          'text-red-500'
                        }`} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // AFFICHAGE NORMAL DES MÉTRIQUES POUR LES AUTRES THÈMES
                <>
                  {/* VALEUR PRINCIPALE ET ÉVOLUTION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className={`text-sm font-medium ${currentTheme.textColor} mb-2`}>
                        Valeur actuelle
                      </p>
                      <p className={`text-4xl font-bold ${currentTheme.boldTextColor}`}>
                        {activeTheme === 'missions' && themeAnalytics.newMissions}
                        {activeTheme === 'facturation' && `${themeAnalytics.avgInvoicingTime}j`}
                      </p>
                      {activeTheme === 'facturation' && (
                        <p className={`text-xs ${currentTheme.textColor} mt-1`}>
                          Délai réel Terminé → Facturé
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${currentTheme.textColor} mb-2`}>
                        Évolution vs période précédente
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                          {getThemeGrowthDisplay(activeTheme)}
                        </span>
                        <span className="text-lg">
                          {isGrowthPositive(activeTheme) ? '📈' : '📉'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* INDICATEURS SUPPLÉMENTAIRES */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                          {filteredData.filteredEvents.length}
                        </p>
                        <p className={`text-xs ${currentTheme.textColor}`}>
                          Total événements
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                          {filteredData.filteredClients.length}
                        </p>
                        <p className={`text-xs ${currentTheme.textColor}`}>
                          Nouveaux clients
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                          {themeAnalytics.totalRevenue.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR',
                            maximumFractionDigits: 0
                          })}
                        </p>
                        <p className={`text-xs ${currentTheme.textColor}`}>
                          CA période
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                          {themeAnalytics.averageBasket.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR',
                            maximumFractionDigits: 0
                          })}
                        </p>
                        <p className={`text-xs ${currentTheme.textColor}`}>
                          Panier moyen
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* 🔧 COLONNE 3: TOP CLIENTS SYNCHRONISÉ - Masqué si onglet top-clients actif */}
          {activeTheme !== 'top-clients' && (
            <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🏆 Top clients
                </h3>
                <p className={`text-xs ${currentTheme.textColor}`}>
                  🔗 Données réelles selon {currentTheme.label.toLowerCase()}
                </p>
              </div>
              
              {/* 🔧 LISTE TOP CLIENTS SYNCHRONISÉE AVEC PAGINATION */}
              <div className="space-y-3">
                {topClientsAnalytics.clientRevenue.length > 0 ? (
                  topClientsAnalytics.clientRevenue.map((item, index) => {
                    // Calculer l'index global pour l'affichage du rang
                    const globalIndex = (topClientsAnalytics.currentPage - 1) * clientsPerPage + index
                    
                    return (
                      <div 
                        key={item.client.id} 
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            globalIndex === 0 ? 'bg-yellow-500' :
                            globalIndex === 1 ? 'bg-gray-400' :
                            globalIndex === 2 ? 'bg-orange-600' :
                            globalIndex === 3 ? 'bg-green-500' :
                            'bg-primary-500'
                          }`}>
                            {globalIndex + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {item.client.firstName} {item.client.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.secondaryInfo}
                            </p>
                            {/* Badge de statut adapté au thème */}
                            {item.badge && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white mt-1 ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {item.revenue.toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            })}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activeTheme === 'facturation' ? `${Math.round(item.primaryMetric * 10) / 10}j` :
                             activeTheme === 'paiement' ? `${Math.round(item.primaryMetric * 10) / 10}j` :
                             activeTheme === 'missions' ? `${item.primaryMetric}` :
                             item.secondaryInfo}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun client pour cette période</p>
                  </div>
                )}
              </div>
              
              {/* 🆕 CONTRÔLES DE PAGINATION POUR TOP CLIENTS */}
              {topClientsAnalytics.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {((topClientsAnalytics.currentPage - 1) * clientsPerPage) + 1} à {Math.min(topClientsAnalytics.currentPage * clientsPerPage, topClientsAnalytics.totalClients)} sur {topClientsAnalytics.totalClients}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTopClientsPage(prev => Math.max(1, prev - 1))}
                      disabled={!topClientsAnalytics.hasPrevPage}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      ← Préc
                    </button>
                    
                    <span className="text-xs text-gray-500">
                      {topClientsAnalytics.currentPage}/{topClientsAnalytics.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setTopClientsPage(prev => Math.min(topClientsAnalytics.totalPages, prev + 1))}
                      disabled={!topClientsAnalytics.hasNextPage}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Suiv →
                    </button>
                  </div>
                </div>
              )}
              
              {/* RÉSUMÉ TOP CLIENTS SYNCHRONISÉ */}
              {topClientsAnalytics.totalClients > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {topClientsAnalytics.totalClients}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Clients actifs
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {activeTheme === 'missions' 
                          ? topClientsAnalytics.clientRevenue.reduce((sum, item) => sum + item.primaryMetric, 0)
                          : topClientsAnalytics.clientRevenue.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            })
                        }
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activeTheme === 'missions' ? 'Total missions (page)' : 'CA total (page)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AnalyticsPage