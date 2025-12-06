import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { useEvents } from '@/contexts/AppContext'
import { EventStatus } from '@/types'

const Charts: React.FC = () => {
  const { events } = useEvents()

  // 📊 Données mensuelles RÉELLES calculées depuis les événements
  const monthlyData = useMemo(() => {
    const now = new Date()
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const data: { month: string; events: number; revenue: number }[] = []

    // 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const targetMonth = targetDate.getMonth()
      const targetYear = targetDate.getFullYear()

      const monthEvents = events.filter(e => {
        const eventDate = new Date(e.date)
        return eventDate.getMonth() === targetMonth && eventDate.getFullYear() === targetYear
      })

      const monthRevenue = monthEvents
        .filter(e => e.status === EventStatus.PAID)
        .reduce((sum, e) => sum + (e.budget || 0), 0)

      data.push({
        month: months[targetMonth],
        events: monthEvents.length,
        revenue: monthRevenue
      })
    }

    return data
  }, [events])

  // 📊 Données des statuts RÉELLES
  const statusData = useMemo(() => {
    const confirmed = events.filter(e => e.status === EventStatus.CONFIRMED).length
    const inProgress = events.filter(e => e.status === EventStatus.IN_PROGRESS).length
    const completed = events.filter(e =>
      e.status === EventStatus.COMPLETED ||
      e.status === EventStatus.INVOICED ||
      e.status === EventStatus.PAID
    ).length
    const cancelled = events.filter(e => e.status === EventStatus.CANCELLED).length

    return [
      { status: 'Confirmés', count: confirmed, color: '#3B82F6' },
      { status: 'En cours', count: inProgress, color: '#F59E0B' },
      { status: 'Terminés', count: completed, color: '#10B981' },
      { status: 'Annulés', count: cancelled, color: '#EF4444' }
    ]
  }, [events])

  // Calcul des stats pour l'affichage
  const currentMonthEvents = useMemo(() => {
    const now = new Date()
    return events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
    }).length
  }, [events])

  const lastMonthEvents = useMemo(() => {
    const now = new Date()
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.getMonth() === lastMonth && eventDate.getFullYear() === lastMonthYear
    }).length
  }, [events])

  const trendPercent = useMemo(() => {
    if (lastMonthEvents === 0) return currentMonthEvents > 0 ? 100 : 0
    return Math.round(((currentMonthEvents - lastMonthEvents) / lastMonthEvents) * 100)
  }, [currentMonthEvents, lastMonthEvents])
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique des événements par mois */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Événements par mois</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="month" 
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                  <YAxis 
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tw-color-white)',
                      border: '1px solid var(--tw-color-gray-200)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total ce mois: <span className="font-medium text-gray-900 dark:text-white">{currentMonthEvents} événement{currentMonthEvents > 1 ? 's' : ''}</span>
              </span>
              {trendPercent !== 0 && (
                <span className={`font-medium ${trendPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trendPercent >= 0 ? '+' : ''}{trendPercent}% vs mois dernier
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Graphique des statuts d'événements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Statuts des événements</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="status" 
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                  <YAxis 
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tw-color-white)',
                      border: '1px solid var(--tw-color-gray-200)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              {statusData.map(item => (
                <div key={item.status} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Charts