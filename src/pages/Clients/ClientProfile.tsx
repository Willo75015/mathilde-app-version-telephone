import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Edit, Mail, Phone, MapPin, Calendar,
  Plus, Filter, TrendingUp, Euro, Star
} from 'lucide-react'
import { useClients, useEvents } from '@/contexts/AppContext'
import { Client } from '@/types'
import ClientDetails from '@/components/clients/ClientDetails'
import EventList from '@/components/events/EventList'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'

interface ClientProfileProps {
  clientId: string
  navigate: (page: string, params?: any) => void
}

const ClientProfile: React.FC<ClientProfileProps> = ({ clientId, navigate }) => {
  const { clients } = useClients()
  const { getEventsByClient } = useEvents()
  const [client, setClient] = useState<Client | null>(null)
  const [clientEvents, setClientEvents] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  
  // Find client and their events
  useEffect(() => {
    const foundClient = clients.find(c => c.id === clientId)
    if (foundClient) {
      setClient(foundClient)
      const events = getEventsByClient(clientId)
      setClientEvents(events)
    } else {
      // Client not found, redirect
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'clients' } }))
    }
  }, [clientId, clients, getEventsByClient])
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
  
  // Calculate client statistics
  const clientStats = {
    totalEvents: clientEvents.length,
    totalSpent: clientEvents.reduce((sum, event) => sum + event.budget, 0),
    averageSpent: clientEvents.length > 0 ? clientEvents.reduce((sum, event) => sum + event.budget, 0) / clientEvents.length : 0,
    upcomingEvents: clientEvents.filter(event => event.date > new Date()).length,
    completedEvents: clientEvents.filter(event => event.status === 'completed').length
  }
  
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'events', label: `Événements (${clientEvents.length})`, icon: Calendar },
    { id: 'preferences', label: 'Préférences', icon: Star }
  ]
  
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du profil client...</p>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => {
              console.log('🔙 Retour à la liste depuis ClientProfile')
              if (navigate) {
                navigate('clients')
              } else {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'clients' } }))
              }
            }}
          >
            Retour aux clients
          </Button>
          
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Client depuis {client.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<Plus className="w-4 h-4" />}
            href={`/events/new?clientId=${clientId}`}
          >
            Nouvel Événement
          </Button>
          <Button
            variant="primary"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate && navigate('clients/edit', { clientId })}
          >
            Modifier
          </Button>
        </div>
      </motion.div>
      
      {/* Client Info Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informations de contact
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a 
                      href={`mailto:${client.email}`}
                      className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {client.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                    <a 
                      href={`tel:${client.phone}`}
                      className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {client.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                    <div className="text-gray-900 dark:text-white">
                      <p>{client.address.street}</p>
                      <p>{client.address.postalCode} {client.address.city}</p>
                      <p>{client.address.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Statistiques
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Événements totaux</span>
                  <span className="font-bold text-gray-900 dark:text-white">{clientStats.totalEvents}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Événements terminés</span>
                  <span className="font-bold text-green-600">{clientStats.completedEvents}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">À venir</span>
                  <span className="font-bold text-blue-600">{clientStats.upcomingEvents}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">💰 Total rapporté</span>
                  <span className="font-bold text-purple-600">
                    {clientStats.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">📊 Commande moyenne</span>
                  <span className="font-bold text-orange-600">
                    {clientStats.averageSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Client Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Statut client
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Badge 
                    variant={clientStats.totalEvents >= 5 ? 'primary' : clientStats.totalEvents >= 2 ? 'secondary' : 'outline'}
                    className="mb-2"
                  >
                    {clientStats.totalEvents >= 5 ? 'Client VIP' : 
                     clientStats.totalEvents >= 2 ? 'Client fidèle' : 'Nouveau client'}
                  </Badge>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {clientStats.totalEvents >= 5 ? 'Client privilégié avec avantages exclusifs' :
                     clientStats.totalEvents >= 2 ? 'Client régulier de confiance' :
                     'Bienvenue dans notre communauté'}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Membre depuis
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {Math.floor((Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24))} jours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </motion.div>
      
      {/* Tab Content */}
      <motion.div variants={itemVariants}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Events */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Événements récents
              </h3>
              
              {clientEvents.slice(0, 3).length > 0 ? (
                <div className="space-y-3">
                  {clientEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.date.toLocaleDateString()} - {event.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.budget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab('events')}
                  >
                    Voir tous les événements
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun événement</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    href={`/events/new?clientId=${clientId}`}
                  >
                    Créer le premier événement
                  </Button>
                </div>
              )}
            </Card>
            
            {/* Preferences */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Préférences
              </h3>
              
              {client.preferences ? (
                <div className="space-y-4">
                  {client.preferences.favoriteColors && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Couleurs préférées</p>
                      <div className="flex flex-wrap gap-2">
                        {client.preferences.favoriteColors.map((color, index) => (
                          <Badge key={index} variant="outline">{color}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {client.preferences.favoriteFlowers && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Fleurs préférées</p>
                      <div className="flex flex-wrap gap-2">
                        {client.preferences.favoriteFlowers.map((flower, index) => (
                          <Badge key={index} variant="outline">{flower}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {client.preferences.allergies && client.preferences.allergies.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {client.preferences.allergies.map((allergy, index) => (
                          <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune préférence définie</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    href={`/clients/${clientId}/edit`}
                  >
                    Ajouter des préférences
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
        
        {activeTab === 'events' && (
          <EventList 
            events={clientEvents} 
            viewMode="list"
            showClient={false}
          />
        )}
        
        {activeTab === 'preferences' && (
          <ClientDetails
            clientId={clientId}
            onBack={() => navigate && navigate('clients')}
            onEdit={(id) => navigate && navigate('clients/edit', { clientId: id })}
            navigate={navigate}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export default ClientProfile