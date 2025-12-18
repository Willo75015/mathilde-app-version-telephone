import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Search, Filter, User, Grid, List,
  Download, RefreshCw, UserPlus, Mail, Phone
} from 'lucide-react'
import { useClients } from '@/contexts/AppContext'
import { initializeSampleData } from '@/utils/sampleData'
import ClientList from '@/components/clients/ClientList'
import { CreateClientModal, EditClientModal } from '@/components/modals'
import ClientSearch from '@/components/clients/ClientSearch'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'

type ViewMode = 'list' | 'grid'
type SortField = 'name' | 'email' | 'createdAt' | 'city'
type SortOrder = 'asc' | 'desc'

interface ClientsPageProps {
  navigate?: (page: string, params?: any) => void
}

const ClientsPage: React.FC<ClientsPageProps> = ({ navigate }) => {
  const { clients, isLoading } = useClients()
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editClientId, setEditClientId] = useState<string | null>(null)
  
  // Get unique cities for filter
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(clients.map(client => client.address.city)))
    return uniqueCities.sort()
  }, [clients])
  
  // Filtered and sorted clients
  const filteredClients = useMemo(() => {
    let filtered = clients
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        client.address.city.toLowerCase().includes(query)
      )
    }
    
    // City filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(client => client.address.city === cityFilter)
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'city':
          comparison = a.address.city.localeCompare(b.address.city)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [clients, searchQuery, cityFilter, sortField, sortOrder])
  
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
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  
  const handleRefresh = async () => {
    await loadClients()
  }
  
  const handleLoadSampleData = async () => {
    // Charger les données d'exemple
    initializeSampleData()
    await loadClients()
    console.log('🌸 Données d\'exemple chargées!')
  }
  
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clients')
  }

  // Nouvelles fonctions pour les actions clients
  const handleDeleteClient = async (clientId: string) => {
    console.log('🗑️ Suppression client:', clientId)
    // TODO: Utiliser le hook deleteClient du context
    // await deleteClient(clientId)
  }

  const handleViewClient = (clientId: string) => {
    console.log('👁️ Voir profil client:', clientId)
    if (navigate) {
      navigate('clients/profile', { clientId })
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { page: 'clients/profile', clientId } 
      }))
    }
  }

  const handleContactClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      console.log('📧 Contact client:', client.email)
      window.location.href = `mailto:${client.email}?subject=Contact depuis Mathilde Fleurs`
    }
  }
  
  const handleCreateClient = () => {
    console.log('🎯 Ouverture du modal de création client')
    setCreateModalOpen(true)
  }

  const handleCreateModalClose = () => {
    console.log('🔒 Fermeture du modal de création')
    setCreateModalOpen(false)
  }

  const handleCreateSuccess = (newClient: any) => {
    console.log('✅ Client créé avec succès:', newClient)
    // Le client sera automatiquement ajouté via le context
    // On pourrait ajouter une animation de highlight ici
  }
  
  // Fonctions pour le modal d'édition
  const handleEditClient = (clientId: string) => {
    setEditClientId(clientId)
    setEditModalOpen(true)
  }
  
  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditClientId(null)
  }
  
  const tabs = [
    { id: 'list', label: 'Liste', icon: List },
    { id: 'grid', label: 'Grille', icon: Grid }
  ]
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez votre carnet d'adresses et vos relations clients
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
            isLoading={isLoading}
          >
            Actualiser
          </Button>
          <Button
            variant="outline"
            leftIcon={<User className="w-4 h-4" />}
            onClick={handleLoadSampleData}
          >
            Données d'exemple
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Exporter
          </Button>
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={handleCreateClient}
          >
            Nouveau Client
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total clients</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {clients.length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Avec email</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {clients.filter(c => c.email).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Avec téléphone</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {clients.filter(c => c.phone).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Ce mois</p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {clients.filter(client => {
                    const thisMonth = new Date()
                    thisMonth.setDate(1)
                    return client.createdAt >= thisMonth
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Left section - Search and filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Rechercher clients..."
                  leftIcon={<Search className="w-4 h-4" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">Toutes les villes</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  leftIcon={<Filter className="w-4 h-4" />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtres
                </Button>
              </div>
            </div>

            {/* Right section - View mode and sort */}
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' 
                    ? 'bg-white shadow text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' 
                    ? 'bg-white shadow text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [SortField, SortOrder]
                  setSortField(field)
                  setSortOrder(order)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
                <option value="city-asc">Ville (A-Z)</option>
                <option value="city-desc">Ville (Z-A)</option>
                <option value="createdAt-desc">Plus récents</option>
                <option value="createdAt-asc">Plus anciens</option>
              </select>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} 
              {searchQuery && ` correspondant à "${searchQuery}"`}
              {cityFilter !== 'all' && ` à ${cityFilter}`}
            </span>
            
            {filteredClients.length > 0 && (
              <span>
                Trié par {sortField === 'name' ? 'nom' : sortField === 'email' ? 'email' : sortField === 'city' ? 'ville' : 'date'} 
                ({sortOrder === 'asc' ? 'croissant' : 'décroissant'})
              </span>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Client List Component */}
      <ClientList 
        clients={filteredClients}
        viewMode={viewMode}
        isLoading={isLoading}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
        onViewClient={handleViewClient}
        onContactClient={handleContactClient}
      />

      {/* Empty State */}
      {filteredClients.length === 0 && !isLoading && (
        <motion.div
          variants={itemVariants}
          className="text-center py-12"
        >
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun client trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || cityFilter !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par ajouter votre premier client'
            }
          </p>
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={handleCreateClient}
          >
            Ajouter un client
          </Button>
        </motion.div>
      )}
      
      {/* Modal d'édition */}
      <EditClientModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        clientId={editClientId}
      />

      {/* Modal de création */}
      <CreateClientModal
        isOpen={createModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
      />
    </motion.div>
  )
}

export default ClientsPage