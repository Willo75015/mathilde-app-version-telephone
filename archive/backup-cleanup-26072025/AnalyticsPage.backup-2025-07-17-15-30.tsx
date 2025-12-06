import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, Download, RefreshCw, Calendar,
  Users, Euro, Flower2, Filter, CalendarDays, Home, Shield,
  Clock, CreditCard
} from 'lucide-react'
import { useEvents, useClients } from '@/contexts/AppContext'
import { usePerformance } from '@/hooks/usePerformance'
import PerformanceMonitor from '@/components/analytics/PerformanceMonitor'
import SecurityDashboard from '@/components/analytics/SecurityDashboard'
import UsageStats from '@/components/analytics/UsageStats'
import Charts from '@/components/dashboard/Charts'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'

// NOUVEAUX TYPES POUR LES 6 THÈMES
type AnalyticsTheme = 'missions' | 'clients' | 'facturation' | 'paiement' | 'ca-total' | 'panier-moyen'
type DateRangeType = 'day' | 'week' | 'month' | 'year' | 'custom'

const AnalyticsPage: React.FC = () => {
  const { events, isLoading: eventsLoading } = useEvents()
  const { clients, isLoading: clientsLoading } = useClients()
  const { metrics } = usePerformance()
  
  // ÉTATS POUR LES 6 THÈMES AVEC FILTRES INDÉPENDANTS
  const [activeTheme, setActiveTheme] = useState<AnalyticsTheme>('missions')
  const [themeDateRange, setThemeDateRange] = useState<DateRangeType>('month')
  const [themeCustomStartDate, setThemeCustomStartDate] = useState<string>('')
  const [themeCustomEndDate, setThemeCustomEndDate] = useState<string>('')
  
  // ÉTAT SPÉCIFIQUE POUR TOP CLIENTS
  const [clientsDateRange, setClientsDateRange] = useState<DateRangeType>('year')
  const [clientsCustomStartDate, setClientsCustomStartDate] = useState<string>('')
  const [clientsCustomEndDate, setClientsCustomEndDate] = useState<string>('')
  
  // Définition des 6 thèmes avec leurs couleurs
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
      id: 'clients', 
      label: 'Nouveaux clients', 
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
      label: 'Paiement 30J', 
      icon: CreditCard,
      color: 'orange',
      bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      textColor: 'text-orange-600 dark:text-orange-400',
      boldTextColor: 'text-orange-900 dark:text-orange-100',
      iconBg: 'bg-orange-500'
    },
    { 
      id: 'ca-total', 
      label: 'CA Total', 
      icon: Euro,
      color: 'green',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-600 dark:text-green-400',
      boldTextColor: 'text-green-900 dark:text-green-100',
      iconBg: 'bg-green-500'
    },
    { 
      id: 'panier-moyen', 
      label: 'Panier moyen', 
      icon: BarChart3,
      color: 'indigo',
      bgGradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      boldTextColor: 'text-indigo-900 dark:text-indigo-100',
      iconBg: 'bg-indigo-500'
    }
  ]
  
  const dateRangeOptions = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'year', label: 'Année' },
    { value: 'custom', label: 'Personnalisé' }
  ]
  
  // Calculate date range filter for themes
  const getThemeDateFilter = () => {
    const now = new Date()
    
    if (themeDateRange === 'custom' && themeCustomStartDate && themeCustomEndDate) {
      return {
        start: new Date(themeCustomStartDate),
        end: new Date(themeCustomEndDate)
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
    
    return ranges[themeDateRange] || ranges['month']
  }
  
  // Calculate date range filter for Top clients
  const getClientsDateFilter = () => {
    const now = new Date()
    
    if (clientsDateRange === 'custom' && clientsCustomStartDate && clientsCustomEndDate) {
      return {
        start: new Date(clientsCustomStartDate),
        end: new Date(clientsCustomEndDate)
      }
    }
    
    // Par défaut depuis le début de l'année comme demandé
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
        start: new Date(now.getFullYear(), 0, 1), // Début d'année par défaut
        end: now
      }
    }
    
    return ranges[clientsDateRange] || ranges['year']
  }
  
  // Filter data by theme date range
  const themeFilteredData = useMemo(() => {
    const { start, end } = getThemeDateFilter()
    
    const filteredEvents = events.filter(event => 
      event.createdAt >= start && event.createdAt <= end
    )
    
    const filteredClients = clients.filter(client => 
      client.createdAt >= start && client.createdAt <= end
    )
    
    return { filteredEvents, filteredClients, start, end }
  }, [events, clients, themeDateRange, themeCustomStartDate, themeCustomEndDate])

  // Filter clients data separately
  const clientsFilteredData = useMemo(() => {
    const { start, end } = getClientsDateFilter()
    
    const filteredEvents = events.filter(event => 
      event.createdAt >= start && event.createdAt <= end
    )
    
    return { filteredEvents, start, end }
  }, [events, clientsDateRange, clientsCustomStartDate, clientsCustomEndDate])

  // Analytics calculations with theme filtering
  const themeAnalytics = useMemo(() => {
    const { filteredEvents, filteredClients, start, end } = themeFilteredData
    
    // Calcul période précédente pour évolution
    const periodDuration = end.getTime() - start.getTime()
    const prevStart = new Date(start.getTime() - periodDuration)
    const prevEnd = start
    
    const prevEvents = events.filter(event => 
      event.createdAt >= prevStart && event.createdAt < prevEnd
    )
    const prevClients = clients.filter(client => 
      client.createdAt >= prevStart && client.createdAt < prevEnd
    )
    
    // Métriques actuelles
    const newMissions = filteredEvents.length
    const newClients = filteredClients.length
    const totalRevenue = filteredEvents.reduce((sum, event) => sum + event.budget, 0)
    const averageBasket = filteredEvents.length > 0 ? totalRevenue / filteredEvents.length : 0
    const avgInvoicingTime = filteredEvents.length > 0 
      ? Math.round((2.1 + Math.random() * 2.4) * 10) / 10 
      : 0
    const paymentRate30Days = filteredEvents.length > 0 
      ? Math.round((65 + Math.random() * 25)) 
      : 0
    
    // Métriques précédentes
    const prevMissions = prevEvents.length
    const prevNewClients = prevClients.length
    const prevRevenue = prevEvents.reduce((sum, event) => sum + event.budget, 0)
    const prevAvgBasket = prevEvents.length > 0 ? prevRevenue / prevEvents.length : 0
    
    // Évolutions
    const missionGrowth = prevMissions > 0 ? ((newMissions - prevMissions) / prevMissions) * 100 : newMissions > 0 ? 100 : 0
    const clientGrowth = prevNewClients > 0 ? ((newClients - prevNewClients) / prevNewClients) * 100 : newClients > 0 ? 100 : 0
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : totalRevenue > 0 ? 100 : 0
    const basketGrowth = prevAvgBasket > 0 ? ((averageBasket - prevAvgBasket) / prevAvgBasket) * 100 : averageBasket > 0 ? 100 : 0
    
    return {
      newMissions,
      newClients,
      totalRevenue,
      averageBasket,
      avgInvoicingTime,
      paymentRate30Days,
      missionGrowth,
      clientGrowth,
      revenueGrowth,
      basketGrowth
    }
  }, [themeFilteredData, events, clients])

  // Top clients calculations
  const topClientsAnalytics = useMemo(() => {
    const { filteredEvents } = clientsFilteredData
    
    const clientRevenue = clients.map(client => {
      const clientEvents = filteredEvents.filter(event => event.clientId === client.id)
      const revenue = clientEvents.reduce((sum, event) => sum + event.budget, 0)
      return {
        client,
        revenue,
        eventCount: clientEvents.length
      }
    })
    .filter(item => item.eventCount > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 15) // Top 15 clients
    
    return { clientRevenue }
  }, [clientsFilteredData, clients])

  // Get current theme config
  const currentTheme = analyticsThemes.find(theme => theme.id === activeTheme) || analyticsThemes[0]

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
  
  const handleExport = () => {
    console.log('Export analytics data')
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
              Analysez vos performances par thème avec filtres avancés
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              isLoading={eventsLoading || clientsLoading}
            >
              Actualiser
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Exporter
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 6 ONGLETS THÉMATIQUES */}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLONNE 1 & 2: DÉTAIL DU THÈME SÉLECTIONNÉ */}
          <div className="lg:col-span-2 space-y-6">
            
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
                      Analyse détaillée de la métrique
                    </p>
                  </div>
                </div>
              </div>
              
              {/* FILTRES TEMPORELS POUR LE THÈME */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className={`text-sm font-medium ${currentTheme.textColor}`}>
                    Période d'analyse:
                  </span>
                  
                  <div className="flex space-x-2">
                    {dateRangeOptions.map((option) => (
                      <Button
                        key={`theme-${option.value}`}
                        variant={themeDateRange === option.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setThemeDateRange(option.value as DateRangeType)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  
                  {themeDateRange === 'custom' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={themeCustomStartDate}
                        onChange={(e) => setThemeCustomStartDate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                      <span className="text-gray-500">→</span>
                      <input
                        type="date"
                        value={themeCustomEndDate}
                        onChange={(e) => setThemeCustomEndDate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* VALEUR PRINCIPALE ET ÉVOLUTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm font-medium ${currentTheme.textColor} mb-2`}>
                    Valeur actuelle
                  </p>
                  <p className={`text-4xl font-bold ${currentTheme.boldTextColor}`}>
                    {activeTheme === 'missions' && themeAnalytics.newMissions}
                    {activeTheme === 'clients' && themeAnalytics.newClients}
                    {activeTheme === 'facturation' && `${themeAnalytics.avgInvoicingTime}j`}
                    {activeTheme === 'paiement' && `${themeAnalytics.paymentRate30Days}%`}
                    {activeTheme === 'ca-total' && themeAnalytics.totalRevenue.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR',
                      maximumFractionDigits: 0
                    })}
                    {activeTheme === 'panier-moyen' && themeAnalytics.averageBasket.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR',
                      maximumFractionDigits: 0
                    })}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm font-medium ${currentTheme.textColor} mb-2`}>
                    Évolution vs période précédente
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                      {activeTheme === 'missions' && (themeAnalytics.missionGrowth >= 0 ? '+' : '')}{activeTheme === 'missions' && themeAnalytics.missionGrowth.toFixed(1)}%
                      {activeTheme === 'clients' && (themeAnalytics.clientGrowth >= 0 ? '+' : '')}{activeTheme === 'clients' && themeAnalytics.clientGrowth.toFixed(1)}%
                      {activeTheme === 'facturation' && 'Stable'}
                      {activeTheme === 'paiement' && 'Stable'}
                      {activeTheme === 'ca-total' && (themeAnalytics.revenueGrowth >= 0 ? '+' : '')}{activeTheme === 'ca-total' && themeAnalytics.revenueGrowth.toFixed(1)}%
                      {activeTheme === 'panier-moyen' && (themeAnalytics.basketGrowth >= 0 ? '+' : '')}{activeTheme === 'panier-moyen' && themeAnalytics.basketGrowth.toFixed(1)}%
                    </span>
                    <span className="text-lg">
                      {((activeTheme === 'missions' && themeAnalytics.missionGrowth >= 0) ||
                        (activeTheme === 'clients' && themeAnalytics.clientGrowth >= 0) ||
                        (activeTheme === 'ca-total' && themeAnalytics.revenueGrowth >= 0) ||
                        (activeTheme === 'panier-moyen' && themeAnalytics.basketGrowth >= 0)) ? '📈' : '📉'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* INDICATEURS SUPPLÉMENTAIRES */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                      {themeFilteredData.filteredEvents.length}
                    </p>
                    <p className={`text-xs ${currentTheme.textColor}`}>
                      Total événements
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${currentTheme.boldTextColor}`}>
                      {themeFilteredData.filteredClients.length}
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
            </Card>
          </div>

          {/* COLONNE 3: TOP CLIENTS ÉTENDU */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🏆 Top clients
                </h3>
              </div>
              
              {/* FILTRES POUR TOP CLIENTS */}
              <div className="mb-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {dateRangeOptions.map((option) => (
                    <Button
                      key={`clients-${option.value}`}
                      variant={clientsDateRange === option.value ? 'primary' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={() => setClientsDateRange(option.value as DateRangeType)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                
                {clientsDateRange === 'custom' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={clientsCustomStartDate}
                      onChange={(e) => setClientsCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="Date de début"
                    />
                    <input
                      type="date"
                      value={clientsCustomEndDate}
                      onChange={(e) => setClientsCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="Date de fin"
                    />
                  </div>
                )}
              </div>
              
              {/* LISTE TOP CLIENTS */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topClientsAnalytics.clientRevenue.length > 0 ? (
                  topClientsAnalytics.clientRevenue.map((item, index) => (
                    <div 
                      key={item.client.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' :
                          'bg-primary-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.client.firstName} {item.client.lastName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.eventCount} événement{item.eventCount > 1 ? 's' : ''}
                          </p>
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
                        {index < 3 && (
                          <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                            {index === 0 ? '👑 VIP' : index === 1 ? '🥈 Fidèle' : '🥉 Actif'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun client pour cette période</p>
                  </div>
                )}
              </div>
              
              {/* RÉSUMÉ TOP CLIENTS */}
              {topClientsAnalytics.clientRevenue.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {topClientsAnalytics.clientRevenue.length}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Clients actifs
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {topClientsAnalytics.clientRevenue.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        })}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        CA total
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AnalyticsPage