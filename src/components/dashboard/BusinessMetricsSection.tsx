import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, DollarSign, Users, TrendingUp,
  Target, Award, Clock, BarChart3
} from 'lucide-react'
import { Event, Client, EventStatus } from '@/types'

interface BusinessMetricsSectionProps {
  events: Event[]
  clients: Client[]
  futureEvents: Event[]
  eventsToInvoice: Event[]
}

const BusinessMetricsSection: React.FC<BusinessMetricsSectionProps> = ({
  events = [],        // 🛡️ Valeur par défaut
  clients = [],       // 🛡️ Valeur par défaut
  futureEvents = [],  // 🛡️ Valeur par défaut
  eventsToInvoice = [] // 🛡️ Valeur par défaut
}) => {
  // 🛡️ Vérifications de sécurité supplémentaires
  const safeEvents = events || []
  const safeClients = clients || []
  const safeFutureEvents = futureEvents || []
  const safeEventsToInvoice = eventsToInvoice || []
  
  // Calculs des métriques business - NETTOYÉ selon demandes Bill
  const getCurrentMonthRevenue = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // 🎯 LOGIQUE BILL : CA du mois en cours SEULEMENT sur les événements PAYÉS
    return safeEvents
      .filter(event => {
        // Vérifier si l'événement est payé ET dans le mois en cours
        if (event.status !== EventStatus.PAID || !event.paidDate) return false
        
        const paidDate = new Date(event.paidDate)
        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear
      })
      .reduce((sum, event) => sum + (event.budget || 0), 0)
  }

  const metrics = {
    futureEventsCount: safeFutureEvents.length,
    invoicePendingCount: safeEventsToInvoice.length,
    averageBasket: safeEvents.length > 0 ? Math.round(safeEvents.reduce((sum, e) => sum + (e.budget || 0), 0) / safeEvents.length) : 0,
    currentMonthRevenue: getCurrentMonthRevenue()
  }

  const MetricCard: React.FC<{
    icon: React.ReactNode
    value: string | number
    label: string
    bgColor: string
    iconBgColor: string
    iconColor: string
    trend?: number
    suffix?: string
  }> = ({ icon, value, label, bgColor, iconBgColor, iconColor, trend, suffix = '' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${bgColor} rounded-lg p-4 shadow-sm`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </div>
            {trend && (
              <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-500" />
          <span>Métriques Business</span>
        </h2>
      </div>

      {/* Métriques principales - NETTOYÉES selon Bill */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Calendar className="w-5 h-5" />}
          value={metrics.futureEventsCount}
          label="Événements 30j"
          bgColor="bg-blue-50"
          iconBgColor="bg-blue-500"
          iconColor="text-white"
        />
        
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          value={metrics.invoicePendingCount}
          label="À facturer"
          bgColor="bg-red-50"
          iconBgColor="bg-red-500"
          iconColor="text-white"
        />
        
        <MetricCard
          icon={<Target className="w-5 h-5" />}
          value={metrics.averageBasket}
          label="Panier moyen"
          bgColor="bg-orange-50"
          iconBgColor="bg-orange-500"
          iconColor="text-white"
          suffix="€"
        />
      </div>

      {/* Chiffre d'affaires du mois en cours (payé uniquement) */}
      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.currentMonthRevenue.toLocaleString()}€
            </div>
            <div className="text-sm text-gray-600">
              Chiffre d'affaires ce mois (événements payés uniquement)
            </div>
            <div className="text-xs text-green-600 mt-1">
              💰 Revenus encaissés en {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessMetricsSection