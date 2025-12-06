import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Calendar, Euro,
  Heart, Flower2, AlertTriangle, MessageSquare,
  ArrowLeft, Edit, Trash2, Clock, CheckCircle,
  XCircle, FileText, CreditCard, TrendingUp
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Client, Event, EventStatus } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface ClientDetailsProps {
  clientId: string
  onBack?: () => void
  onEdit?: (clientId: string) => void
  navigate?: (page: string, params?: any) => void
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  clientId,
  onBack,
  onEdit,
  navigate
}) => {
  const { state } = useApp()

  // Trouver le client
  const client = useMemo(() => {
    return state.clients.find(c => c.id === clientId)
  }, [state.clients, clientId])

  // Événements du client
  const clientEvents = useMemo(() => {
    return state.events.filter(e => e.clientId === clientId)
  }, [state.events, clientId])

  // Statistiques du client
  const clientStats = useMemo(() => {
    const events = clientEvents

    // Événements par statut
    const completed = events.filter(e =>
      e.status === EventStatus.COMPLETED ||
      e.status === EventStatus.INVOICED ||
      e.status === EventStatus.PAID
    )
    const cancelled = events.filter(e => e.status === EventStatus.CANCELLED)
    const upcoming = events.filter(e =>
      e.status === EventStatus.DRAFT ||
      e.status === EventStatus.PLANNING ||
      e.status === EventStatus.CONFIRMED ||
      e.status === EventStatus.IN_PROGRESS
    )

    // Revenus
    const totalRevenue = events
      .filter(e => e.status === EventStatus.PAID)
      .reduce((sum, e) => sum + (e.budget || 0), 0)

    const totalInvoiced = events
      .filter(e => e.status === EventStatus.INVOICED || e.status === EventStatus.PAID)
      .reduce((sum, e) => sum + (e.budget || 0), 0)

    const pendingPayment = events
      .filter(e => e.status === EventStatus.INVOICED)
      .reduce((sum, e) => sum + (e.budget || 0), 0)

    // Panier moyen
    const avgBasket = completed.length > 0
      ? completed.reduce((sum, e) => sum + (e.budget || 0), 0) / completed.length
      : 0

    // Délai de paiement moyen
    const paidEvents = events.filter(e =>
      e.status === EventStatus.PAID && e.invoiceDate && e.paidDate
    )
    let avgPaymentDelay = 0
    if (paidEvents.length > 0) {
      const totalDelay = paidEvents.reduce((sum, e) => {
        const invoiceDate = new Date(e.invoiceDate!)
        const paidDate = new Date(e.paidDate!)
        const delayDays = Math.max(0, Math.round((paidDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)))
        return sum + delayDays
      }, 0)
      avgPaymentDelay = Math.round(totalDelay / paidEvents.length)
    }

    return {
      totalEvents: events.length,
      completedEvents: completed.length,
      cancelledEvents: cancelled.length,
      upcomingEvents: upcoming.length,
      totalRevenue,
      totalInvoiced,
      pendingPayment,
      avgBasket: Math.round(avgBasket),
      avgPaymentDelay,
      paidEventsCount: paidEvents.length
    }
  }, [clientEvents])

  // Trier les événements par date (plus récents en premier)
  const sortedEvents = useMemo(() => {
    return [...clientEvents].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [clientEvents])

  if (!client) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Client non trouvé
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Le client demandé n'existe pas ou a été supprimé.
        </p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    )
  }

  // Formater le statut d'événement
  const getStatusBadge = (status: EventStatus) => {
    const statusConfig: Record<EventStatus, { label: string; color: string; icon: React.ReactNode }> = {
      [EventStatus.DRAFT]: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-3 h-3" /> },
      [EventStatus.PLANNING]: { label: 'Planification', color: 'bg-blue-100 text-blue-800', icon: <Calendar className="w-3 h-3" /> },
      [EventStatus.CONFIRMED]: { label: 'Confirmé', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      [EventStatus.IN_PROGRESS]: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      [EventStatus.COMPLETED]: { label: 'Terminé', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="w-3 h-3" /> },
      [EventStatus.INVOICED]: { label: 'Facturé', color: 'bg-orange-100 text-orange-800', icon: <FileText className="w-3 h-3" /> },
      [EventStatus.PAID]: { label: 'Payé', color: 'bg-emerald-100 text-emerald-800', icon: <CreditCard className="w-3 h-3" /> },
      [EventStatus.CANCELLED]: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> }
    }

    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Client depuis {new Date(client.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => onEdit?.(clientId)}>
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne 1 : Informations de contact */}
        <div className="space-y-6">
          {/* Contact */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              Informations de contact
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                  <a href={`tel:${client.phone}`} className="text-gray-900 dark:text-white hover:text-green-600">
                    {client.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                  <p className="text-gray-900 dark:text-white">
                    {client.address.street}<br />
                    {client.address.postalCode} {client.address.city}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Préférences */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-500" />
              Préférences
            </h2>

            {client.preferences ? (
              <div className="space-y-4">
                {/* Couleurs favorites */}
                {client.preferences.favoriteColors && client.preferences.favoriteColors.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Couleurs favorites</p>
                    <div className="flex flex-wrap gap-2">
                      {client.preferences.favoriteColors.map((color, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fleurs favorites */}
                {client.preferences.favoriteFlowers && client.preferences.favoriteFlowers.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <Flower2 className="w-4 h-4 mr-1" />
                      Fleurs favorites
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {client.preferences.favoriteFlowers.map((flower, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 rounded-full text-sm text-pink-700 dark:text-pink-300"
                        >
                          {flower}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {client.preferences.allergies && client.preferences.allergies.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {client.preferences.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-sm text-orange-700 dark:text-orange-300"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                Aucune préférence enregistrée
              </p>
            )}
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
              Notes & Commentaires
            </h2>

            {client.comments ? (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {client.comments}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                Aucune note pour ce client
              </p>
            )}
          </Card>
        </div>

        {/* Colonne 2 & 3 : Stats et historique */}
        <div className="lg:col-span-2 space-y-6">

          {/* Statistiques financières */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Euro className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">CA Total</p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                    {clientStats.totalRevenue.toLocaleString()}€
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Événements</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {clientStats.totalEvents}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Panier moyen</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {clientStats.avgBasket.toLocaleString()}€
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Délai paiement</p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {clientStats.avgPaymentDelay}j
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Résumé paiements */}
          {clientStats.pendingPayment > 0 && (
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 dark:text-yellow-200">
                    <strong>{clientStats.pendingPayment.toLocaleString()}€</strong> en attente de paiement
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Historique des événements */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Historique des événements
              </span>
              <span className="text-sm font-normal text-gray-500">
                {clientStats.totalEvents} événement{clientStats.totalEvents > 1 ? 's' : ''}
              </span>
            </h2>

            {sortedEvents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => navigate?.('events', { eventId: event.id })}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(event.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {event.budget.toLocaleString()}€
                      </p>
                      {event.paidDate && (
                        <p className="text-xs text-green-600">
                          Payé le {new Date(event.paidDate).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun événement pour ce client
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate?.('events', { action: 'create', clientId })}
                >
                  Créer un événement
                </Button>
              </div>
            )}
          </Card>

          {/* Résumé par statut */}
          {clientStats.totalEvents > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Répartition des événements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{clientStats.completedEvents}</p>
                  <p className="text-xs text-green-600">Terminés</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{clientStats.upcomingEvents}</p>
                  <p className="text-xs text-blue-600">À venir</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">{clientStats.paidEventsCount}</p>
                  <p className="text-xs text-emerald-600">Payés</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{clientStats.cancelledEvents}</p>
                  <p className="text-xs text-red-600">Annulés</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ClientDetails
