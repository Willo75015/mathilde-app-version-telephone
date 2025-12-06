import React from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, Calendar, Edit, TrendingUp,
  CheckCircle, Clock
} from 'lucide-react'
import { Event, EventStatus } from '@/types'
import Button from '@/components/ui/Button'

interface InvoicingSectionProps {
  eventsToInvoice: Event[]
  allEvents: Event[] // 🆕 Tous les événements pour calculer la moyenne de paiement
  navigate?: (page: string, params?: any) => void
}

const InvoicingSection: React.FC<InvoicingSectionProps> = ({
  eventsToInvoice,
  allEvents,
  navigate
}) => {
  const calculateDaysSinceCompleted = (event: Event) => {
    if (!event.updatedAt) return 0
    return Math.floor((new Date().getTime() - new Date(event.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
  }

  const getInvoiceUrgency = (daysSince: number) => {
    if (daysSince > 7) return { level: 'critical', label: '🚨 Urgent', color: 'border-red-300 bg-red-50' }
    if (daysSince > 3) return { level: 'high', label: '⚠️ À traiter', color: 'border-orange-300 bg-orange-50' }
    return { level: 'normal', label: '✅ Récent', color: 'border-green-300 bg-green-50' }
  }

  const totalToInvoice = eventsToInvoice.reduce((sum, event) => sum + event.budget, 0)

  // Statistiques facturation
  const invoiceStats = {
    total: eventsToInvoice.length,
    overdue: eventsToInvoice.filter(e => calculateDaysSinceCompleted(e) > 7).length,
    thisMonth: eventsToInvoice.filter(e => {
      const eventDate = new Date(e.updatedAt || e.date)
      const now = new Date()
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
    }).length
  }

  // 💰 NOUVELLE MÉTRIQUE : Temps de paiement moyen
  const calculateAveragePaymentTime = () => {
    // Récupérer tous les événements PAYÉS pour calculer la moyenne
    const paidEvents = allEvents?.filter(event => 
      event.status === EventStatus.PAID && 
      event.paidDate && 
      event.updatedAt
    ) || []

    if (paidEvents.length === 0) return 0

    const totalDays = paidEvents.reduce((sum, event) => {
      const completedDate = new Date(event.updatedAt)
      const paidDate = new Date(event.paidDate!)
      const daysDiff = Math.floor((paidDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
      return sum + Math.max(0, daysDiff) // Éviter les valeurs négatives
    }, 0)

    return Math.round(totalDays / paidEvents.length)
  }

  return (
    <div className="bg-green-500 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold text-white">Facturation en Attente</h2>
              <p className="text-green-100 text-sm">Cash flow prioritaire - Argent qui dort</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {totalToInvoice.toLocaleString()}€
            </div>
            <div className="text-green-100 text-sm">À facturer</div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-white dark:bg-gray-800 p-6">
        {eventsToInvoice.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Aucune facturation en attente
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tous les événements terminés sont facturés ! 🎉
            </p>
          </div>
        ) : (
          <>
            {/* Liste des événements à facturer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {eventsToInvoice.slice(0, 6).map((event) => {
                const daysSince = calculateDaysSinceCompleted(event)
                const urgency = getInvoiceUrgency(daysSince)
                
                return (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 ${urgency.color} transition-all`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Client à facturer
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {event.budget.toLocaleString()}€
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          urgency.level === 'critical' ? 'bg-red-100 text-red-800' :
                          urgency.level === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {urgency.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Terminé le {new Date(event.updatedAt || event.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <span className="text-gray-500">
                          Il y a {daysSince} jour{daysSince > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        leftIcon={<DollarSign className="w-4 h-4" />}
                        onClick={() => {
                          // Logique création facture
                          navigate?.('invoices', { eventId: event.id, action: 'create' })
                        }}
                      >
                        Créer Facture
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit className="w-4 h-4" />}
                        onClick={() => {
                          navigate?.('events', { eventId: event.id, action: 'edit' })
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Bouton voir plus si nécessaire */}
            {eventsToInvoice.length > 6 && (
              <div className="text-center mb-6">
                <Button
                  variant="outline"
                  onClick={() => navigate?.('invoices', { filter: 'pending' })}
                >
                  Voir toutes les facturations ({eventsToInvoice.length})
                </Button>
              </div>
            )}
          </>
        )}

        {/* Statistiques facturation */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {invoiceStats.total}
                </div>
                <div className="text-sm text-gray-600">À facturer</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {invoiceStats.overdue}
                </div>
                <div className="text-sm text-gray-600">En retard (+7j)</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {invoiceStats.thisMonth}
                </div>
                <div className="text-sm text-gray-600">Ce mois</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {eventsToInvoice.length > 0 ? Math.round(totalToInvoice / eventsToInvoice.length).toLocaleString() : 0}€
                </div>
                <div className="text-sm text-gray-600">Facture moyenne</div>
              </div>
            </div>
          </div>
          
          {/* 🆕 NOUVELLE MÉTRIQUE : Temps de paiement moyen */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {calculateAveragePaymentTime()}j
                </div>
                <div className="text-sm text-gray-600">Temps paiement moyen</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoicingSection