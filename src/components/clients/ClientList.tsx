import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Edit3, Trash2, Eye, MessageSquare, DollarSign, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { Client } from '@/types'
import { useClients } from '@/contexts/AppContext'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface ClientListProps {
  clients: Client[]
  viewMode?: 'list' | 'grid'
  isLoading?: boolean
  onEditClient?: (clientId: string) => void
  onDeleteClient?: (clientId: string) => void
  onViewClient?: (clientId: string) => void
  onContactClient?: (clientId: string) => void
}

const ClientList: React.FC<ClientListProps> = ({ 
  clients, 
  viewMode = 'list', 
  isLoading = false,
  onEditClient,
  onDeleteClient,
  onViewClient,
  onContactClient
}) => {
  // 🆕 État pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const clientsPerPage = 5
  
  // Calculs de pagination
  const totalPages = Math.ceil(clients.length / clientsPerPage)
  const startIndex = (currentPage - 1) * clientsPerPage
  const endIndex = startIndex + clientsPerPage
  const paginatedClients = clients.slice(startIndex, endIndex)
  
  // Fonctions de navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  // Reset de la page quand la liste change (après filtrage)
  React.useEffect(() => {
    setCurrentPage(1)
  }, [clients.length])
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucun client trouvé
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Commencez par ajouter vos premiers clients ou chargez les données d'exemple
        </p>
      </motion.div>
    )
  }

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

  if (viewMode === 'grid') {
    return (
      <div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedClients.map((client) => (
            <motion.div key={client.id} variants={itemVariants}>
              <ClientCard 
                client={client} 
                onEditClient={onEditClient}
                onDeleteClient={onDeleteClient}
                onViewClient={onViewClient}
                onContactClient={onContactClient}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* 🆕 Pagination pour grid */}
        {totalPages > 1 && (
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            totalClients={clients.length}
            startIndex={startIndex}
            endIndex={Math.min(endIndex, clients.length)}
            onPrevPage={goToPrevPage}
            onNextPage={goToNextPage}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {paginatedClients.map((client) => (
          <motion.div key={client.id} variants={itemVariants}>
            <ClientRow 
              client={client} 
              onEditClient={onEditClient}
              onDeleteClient={onDeleteClient}
              onViewClient={onViewClient}
              onContactClient={onContactClient}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* 🆕 Pagination pour liste */}
      {totalPages > 1 && (
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          totalClients={clients.length}
          startIndex={startIndex}
          endIndex={Math.min(endIndex, clients.length)}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
        />
      )}
    </div>
  )
}

// Composant pour la vue carte
const ClientCard: React.FC<{ 
  client: Client; 
  onEditClient?: (clientId: string) => void;
  onDeleteClient?: (clientId: string) => void;
  onViewClient?: (clientId: string) => void;
  onContactClient?: (clientId: string) => void;
}> = ({ client, onEditClient, onDeleteClient, onViewClient, onContactClient }) => {
  const comments = (client as any).comments || ''
  const managerPayment = (client as any).managerPayment || 0
  const freelancePayment = (client as any).freelancePayment || 0

  const handleEdit = () => {
    if (onEditClient) {
      onEditClient(client.id)
    } else {
      // Fallback vers navigation (si pas de fonction passée)
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { page: 'clients/edit', clientId: client.id } 
      }))
    }
  }

  const handleView = () => {
    if (onViewClient) {
      onViewClient(client.id)
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { page: 'clients/profile', clientId: client.id } 
      }))
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${client.firstName} ${client.lastName} ?`)) {
      console.log('🗑️ Suppression client:', client.id)
      if (onDeleteClient) {
        onDeleteClient(client.id)
      }
    }
  }

  const handleContact = () => {
    console.log('📧 Contact client:', client.email)
    if (onContactClient) {
      onContactClient(client.id)
    } else {
      // Fallback : ouvrir le client email par défaut
      window.location.href = `mailto:${client.email}`
    }
  }

  // Formater le téléphone avec des tirets
  const formatPhone = (phone: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/[^\d]/g, '')
    if (cleaned.length !== 10) return phone
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {client.firstName} {client.lastName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {client.address.city}
            </p>
          </div>
          {/* Actions en haut à droite */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleView}
              title="Voir le profil"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleContact}
              title="Contacter"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
              title="Modifier"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{formatPhone(client.phone)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium">{client.address.street}</div>
              <div className="text-xs text-gray-500">
                {client.address.postalCode} {client.address.city}, {client.address.country}
              </div>
            </div>
          </div>
        </div>

        {/* Commentaires */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <MessageSquare className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Commentaires
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {comments || 'Aucun commentaire'}
          </p>
        </div>

        {/* Paiements */}
        {(managerPayment > 0 || freelancePayment > 0) && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <DollarSign className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Paiements
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {managerPayment > 0 && (
                <div className="flex justify-between">
                  <span>Manager:</span>
                  <span className="font-medium text-green-600">{managerPayment}€</span>
                </div>
              )}
              {freelancePayment > 0 && (
                <div className="flex justify-between">
                  <span>Freelance:</span>
                  <span className="font-medium text-green-600">{freelancePayment}€</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(client.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Composant pour la vue liste
const ClientRow: React.FC<{ 
  client: Client; 
  onEditClient?: (clientId: string) => void;
  onDeleteClient?: (clientId: string) => void;
  onViewClient?: (clientId: string) => void;
  onContactClient?: (clientId: string) => void;
}> = ({ client, onEditClient, onDeleteClient, onViewClient, onContactClient }) => {
  const comments = (client as any).comments || ''
  const managerPayment = (client as any).managerPayment || 0
  const freelancePayment = (client as any).freelancePayment || 0
  const { deleteClient } = useClients()

  const handleEdit = () => {
    if (onEditClient) {
      onEditClient(client.id)
    } else {
      // Fallback vers navigation (si pas de fonction passée)
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { page: 'clients/edit', clientId: client.id } 
      }))
    }
  }

  const handleView = () => {
    if (onViewClient) {
      onViewClient(client.id)
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { page: 'clients/profile', clientId: client.id } 
      }))
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${client.firstName} ${client.lastName} ?`)) {
      console.log('🗑️ Suppression client:', client.id)
      if (onDeleteClient) {
        onDeleteClient(client.id)
      } else {
        // Fallback avec l'ancienne méthode
        try {
          await deleteClient(client.id)
          console.log('✅ Client supprimé:', client.id)
        } catch (error) {
          console.error('❌ Erreur suppression:', error)
        }
      }
    }
  }

  const handleContact = () => {
    console.log('📧 Contact client:', client.email)
    if (onContactClient) {
      onContactClient(client.id)
    } else {
      // Fallback : ouvrir le client email par défaut
      window.location.href = `mailto:${client.email}`
    }
  }

  // Formater le téléphone avec des tirets
  const formatPhone = (phone: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/[^\d]/g, '')
    if (cleaned.length !== 10) return phone
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {client.firstName} {client.lastName}
              </h3>
            </div>
          </div>
          
          {/* Actions en haut à droite */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleView}
              title="Voir le profil"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleContact}
              title="Contacter"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
              title="Modifier"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{formatPhone(client.phone)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{client.address.city}</span>
            </div>
          </div>

          {/* Adresse complète */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center mb-1">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Adresse complète</span>
            </div>
            <div className="ml-6">
              <div>{client.address.street}</div>
              <div>{client.address.postalCode} {client.address.city}, {client.address.country}</div>
            </div>
          </div>

          {/* Commentaires */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center mb-1">
              <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">Commentaires</span>
            </div>
            <div className="ml-6">
              <p className="leading-relaxed">{comments || 'Aucun commentaire'}</p>
            </div>
          </div>

          {/* Paiements */}
          <div className="flex flex-wrap gap-6">
            {/* Paiements */}
            {(managerPayment > 0 || freelancePayment > 0) && (
              <div className="text-sm">
                <div className="flex items-center mb-1">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Paiements</span>
                </div>
                <div className="ml-6 space-y-1 text-gray-600 dark:text-gray-400">
                  {managerPayment > 0 && (
                    <div className="flex justify-between min-w-[120px]">
                      <span>Manager:</span>
                      <span className="font-medium text-green-600">{managerPayment}€</span>
                    </div>
                  )}
                  {freelancePayment > 0 && (
                    <div className="flex justify-between min-w-[120px]">
                      <span>Freelance:</span>
                      <span className="font-medium text-green-600">{freelancePayment}€</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            Ajouté le {new Date(client.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  )
}

// 🆕 Composant de contrôles de pagination
const PaginationControls: React.FC<{
  currentPage: number
  totalPages: number
  totalClients: number
  startIndex: number
  endIndex: number
  onPrevPage: () => void
  onNextPage: () => void
}> = ({ currentPage, totalPages, totalClients, startIndex, endIndex, onPrevPage, onNextPage }) => {
  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Informations de pagination */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Affichage de {startIndex + 1} à {endIndex} sur {totalClients} client{totalClients > 1 ? 's' : ''}
        </div>
        
        {/* Contrôles de navigation */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={currentPage === 1}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Précédent
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} sur {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ClientList
