import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Users, Flower, DollarSign,
  TrendingUp, TrendingDown
} from 'lucide-react'
import Card, { CardContent } from '@/components/ui/Card'
import { useEvents, useClients } from '@/contexts/AppContext'
import { EventStatus } from '@/types'

const StatsCards: React.FC = () => {
  const { events, eventStats } = useEvents()
  const { clients } = useClients()

  const { total: totalEvents, completed, upcoming } = eventStats

  // 📊 Calcul des tendances RÉELLES basées sur les données
  const trends = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Mois précédent
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Filtrer les événements par mois de création
    const eventsThisMonth = events.filter(e => {
      const created = new Date(e.createdAt)
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear
    })

    const eventsLastMonth = events.filter(e => {
      const created = new Date(e.createdAt)
      return created.getMonth() === lastMonth && created.getFullYear() === lastMonthYear
    })

    // Événements terminés ce mois vs mois dernier
    const completedThisMonth = events.filter(e => {
      if (e.status !== EventStatus.COMPLETED && e.status !== EventStatus.INVOICED && e.status !== EventStatus.PAID) return false
      const updated = new Date(e.updatedAt)
      return updated.getMonth() === currentMonth && updated.getFullYear() === currentYear
    })

    const completedLastMonth = events.filter(e => {
      if (e.status !== EventStatus.COMPLETED && e.status !== EventStatus.INVOICED && e.status !== EventStatus.PAID) return false
      const updated = new Date(e.updatedAt)
      return updated.getMonth() === lastMonth && updated.getFullYear() === lastMonthYear
    })

    // Clients créés ce mois vs mois dernier
    const clientsThisMonth = clients.filter(c => {
      const created = new Date(c.createdAt)
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear
    })

    const clientsLastMonth = clients.filter(c => {
      const created = new Date(c.createdAt)
      return created.getMonth() === lastMonth && created.getFullYear() === lastMonthYear
    })

    // Calcul des pourcentages de variation
    const calcTrend = (current: number, previous: number): { value: number, up: boolean } => {
      if (previous === 0) {
        return current > 0 ? { value: 100, up: true } : { value: 0, up: true }
      }
      const diff = ((current - previous) / previous) * 100
      return { value: Math.round(Math.abs(diff)), up: diff >= 0 }
    }

    return {
      events: calcTrend(eventsThisMonth.length, eventsLastMonth.length),
      clients: calcTrend(clientsThisMonth.length, clientsLastMonth.length),
      completed: calcTrend(completedThisMonth.length, completedLastMonth.length),
      upcoming: { value: upcoming, up: upcoming > 0 } // Pas de tendance pour "à venir", c'est un état actuel
    }
  }, [events, clients, upcoming])

  const stats = [
    {
      title: 'Événements totaux',
      value: totalEvents,
      icon: Calendar,
      color: 'bg-blue-500',
      trend: trends.events.value > 0 ? `${trends.events.up ? '+' : '-'}${trends.events.value}%` : null,
      trendUp: trends.events.up
    },
    {
      title: 'Clients actifs',
      value: clients.length,
      icon: Users,
      color: 'bg-green-500',
      trend: trends.clients.value > 0 ? `${trends.clients.up ? '+' : '-'}${trends.clients.value}%` : null,
      trendUp: trends.clients.up
    },
    {
      title: 'Événements terminés',
      value: completed,
      icon: Flower,
      color: 'bg-purple-500',
      trend: trends.completed.value > 0 ? `${trends.completed.up ? '+' : '-'}${trends.completed.value}%` : null,
      trendUp: trends.completed.up
    },
    {
      title: 'Événements à venir',
      value: upcoming,
      icon: DollarSign,
      color: 'bg-orange-500',
      trend: null, // Pas de tendance pour les événements à venir
      trendUp: true
    }
  ]
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card variant="elevated" className="hover:shadow-xl transition-shadow h-full">
            <CardContent className="p-1.5 sm:p-2 lg:p-3">
              {/* Layout adaptatif selon la taille d'écran */}
              <div className="flex flex-col space-y-1 sm:space-y-2">
                {/* Header avec icône et titre */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 dark:text-gray-400 leading-tight truncate">
                      {stat.title}
                    </p>
                  </div>
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${stat.color} rounded flex items-center justify-center ml-1 flex-shrink-0`}>
                    <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                </div>
                
                {/* Valeur principale */}
                <div>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                
                {/* Tendance - affichée uniquement si disponible */}
                {stat.trend ? (
                  <div className="flex items-center space-x-1">
                    <div className={`flex items-center space-x-0.5 text-xs ${
                      stat.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trendUp ? (
                        <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      )}
                      <span className="font-medium text-xs">{stat.trend}</span>
                    </div>
                    <span className="text-xs text-gray-500">vs mois dernier</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-400">—</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default StatsCards