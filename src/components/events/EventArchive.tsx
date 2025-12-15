import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Archive, Calendar, Filter, Search, SortAsc, SortDesc, 
  CheckCircle, CheckCircle2, XCircle, Clock, Download, RefreshCw, Receipt 
} from 'lucide-react'
import { useEvents } from '@/contexts/AppContext'
import { EventStatus } from '@/types'
import { format, isToday, isThisWeek, isThisMonth, isThisYear, 
         startOfDay, endOfDay, startOfWeek, endOfWeek,
         startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EventCard from './EventCard'

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'custom'
type ArchiveCategory = 'completed' | 'invoiced' | 'paid' | 'cancelled'
type SortField = 'date' | 'title' | 'budget'
type SortOrder = 'asc' | 'desc'

interface EventArchiveProps {
  onClose: () => void
}

const EventArchive: React.FC<EventArchiveProps> = ({ onClose }) => {
  const { events, isLoading } = useEvents()
  
  // États pour les filtres
  const [activeCategory, setActiveCategory] = useState<ArchiveCategory>('completed')
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  
  // Fonctions utilitaires pour les filtres temporels
  const isInTimeFilter = (eventDate: Date, filter: TimeFilter): boolean => {
    const now = new Date()
    
    switch (filter) {
      case 'today':
        return isToday(eventDate)
      case 'week':
        return isThisWeek(eventDate, { locale: fr })
      case 'month':
        return isThisMonth(eventDate)
      case 'year':
        return isThisYear(eventDate)
      case 'custom':
        if (!customDateFrom || !customDateTo) return true
        const from = startOfDay(new Date(customDateFrom))
        const to = endOfDay(new Date(customDateTo))
        return eventDate >= from && eventDate <= to
      default:
        return true
    }
  }
  
  // Événements filtrés par catégorie
  const categoryEvents = useMemo(() => {
    return events.filter(event => {
      if (activeCategory === 'completed') {
        return event.status === EventStatus.COMPLETED
      } else if (activeCategory === 'invoiced') {
        return event.status === EventStatus.INVOICED
      } else if (activeCategory === 'paid') {
        return event.status === EventStatus.PAID
      } else {
        return event.status === EventStatus.CANCELLED
      }
    })
  }, [events, activeCategory])
  
  // Événements filtrés et triés
  const filteredEvents = useMemo(() => {
    let filtered = categoryEvents
    
    // Filtre de recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        (event.description || '').toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.clientName?.toLowerCase().includes(query)
      )
    }
    
    // Filtre temporel
    filtered = filtered.filter(event => isInTimeFilter(event.date, timeFilter))
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'budget':
          comparison = a.budget - b.budget
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [categoryEvents, searchQuery, timeFilter, customDateFrom, customDateTo, sortField, sortOrder])
  
  // Stats pour les badges
  const completedCount = events.filter(e => e.status === EventStatus.COMPLETED).length
  const invoicedCount = events.filter(e => e.status === EventStatus.INVOICED).length
  const paidCount = events.filter(e => e.status === EventStatus.PAID).length
  const cancelledCount = events.filter(e => e.status === EventStatus.CANCELLED).length
  
  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc') // Par défaut desc pour les dates
    }
  }
  
  const handleExport = () => {
    console.log('Export archived events:', activeCategory)
    // TODO: Implement export functionality
  }
  
  const handleEdit = (event: any) => {
    console.log('Edit archived event:', event.id)
    // TODO: Ouvrir la modal d'édition
  }
  
  const handleDelete = (event: any) => {
    console.log('Delete archived event:', event.id)
    // TODO: Confirmation de suppression
  }
  
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`)
  }
  
  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header avec retour */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            leftIcon={<Archive className="w-4 h-4" />}
            onClick={onClose}
          >
            Retour aux événements
          </Button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Archive className="w-6 h-6 text-gray-500" />
              <span>Archive des événements</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Événements terminés et archivés (payés et annulés)
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            size="sm"
          >
            Exporter
          </Button>
        </div>
      </div>
      
      {/* Onglets des catégories */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Catégories */}
          <div className="flex items-center space-x-1">
            <Button
              variant={activeCategory === 'completed' ? 'primary' : 'ghost'}
              leftIcon={<CheckCircle className="w-4 h-4" />}
              onClick={() => setActiveCategory('completed')}
              className="flex items-center space-x-2"
            >
              <span>Terminés</span>
              <Badge variant="default" size="sm" className="bg-pink-100 text-pink-900 border-pink-200">
                {completedCount}
              </Badge>
            </Button>
            
            <Button
              variant={activeCategory === 'invoiced' ? 'primary' : 'ghost'}
              leftIcon={<Receipt className="w-4 h-4" />}
              onClick={() => setActiveCategory('invoiced')}
              className="flex items-center space-x-2"
            >
              <span>Facturés</span>
              <Badge variant="default" size="sm" className="bg-purple-50 text-purple-800 border-purple-200">
                {invoicedCount}
              </Badge>
            </Button>
            
            <Button
              variant={activeCategory === 'paid' ? 'primary' : 'ghost'}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => setActiveCategory('paid')}
              className="flex items-center space-x-2"
            >
              <span>Payés</span>
              <Badge variant="default" size="sm" className="bg-green-50 text-green-800 border-green-200">
                {paidCount}
              </Badge>
            </Button>
            
            <Button
              variant={activeCategory === 'cancelled' ? 'primary' : 'ghost'}
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => setActiveCategory('cancelled')}
              className="flex items-center space-x-2"
            >
              <span>Annulés</span>
              <Badge variant="default" size="sm" className="bg-red-50 text-red-800 border-red-200">
                {cancelledCount}
              </Badge>
            </Button>
          </div>
          
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Rechercher dans les archives..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>
      
      {/* Filtres temporels et tri */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Filtres temporels */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
                Période :
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'today', label: 'Aujourd\'hui', icon: Clock },
                  { value: 'week', label: 'Cette semaine', icon: Calendar },
                  { value: 'month', label: 'Ce mois', icon: Calendar },
                  { value: 'year', label: 'Cette année', icon: Calendar },
                  { value: 'custom', label: 'Personnalisé', icon: Filter }
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={timeFilter === value ? 'primary' : 'ghost'}
                    size="sm"
                    leftIcon={<Icon className="w-3 h-3" />}
                    onClick={() => setTimeFilter(value as TimeFilter)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Filtres de tri */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                Trier par :
              </span>
              <div className="flex gap-1">
                {[
                  { field: 'date', label: 'Date' },
                  { field: 'title', label: 'Titre' },
                  { field: 'budget', label: 'Budget' }
                ].map(({ field, label }) => (
                  <Button
                    key={field}
                    variant={sortField === field ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleSort(field as SortField)}
                    rightIcon={
                      sortField === field 
                        ? (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)
                        : undefined
                    }
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Filtre date personnalisé */}
          {timeFilter === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </div>
      </Card>
      
      {/* Résultats */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {filteredEvents.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
            </span>
            {activeCategory === 'completed' && (
              <Badge variant="default" size="sm" className="bg-pink-100 text-pink-900 border-pink-200">
                🎉 Terminés
              </Badge>
            )}
            {activeCategory === 'invoiced' && (
              <Badge variant="default" size="sm" className="bg-purple-50 text-purple-800 border-purple-200">
                💼 Facturés
              </Badge>
            )}
            {activeCategory === 'paid' && (
              <Badge variant="default" size="sm" className="bg-green-50 text-green-800 border-green-200">
                💰 Payés
              </Badge>
            )}
            {activeCategory === 'cancelled' && (
              <Badge variant="default" size="sm" className="bg-red-50 text-red-800 border-red-200">
                ❌ Annulés
              </Badge>
            )}
          </div>
          
          {filteredEvents.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Dernière mise à jour : {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </div>
          )}
        </div>
        
        {/* Liste des événements archivés */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? `Aucun événement trouvé pour "${searchQuery}"`
                  : `Aucun événement ${
                      activeCategory === 'completed' ? 'terminé' : 
                      activeCategory === 'invoiced' ? 'facturé' :
                      activeCategory === 'paid' ? 'payé' : 'annulé'
                    } dans cette période`
                }
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  clientName: event.clientName || `${event.clientId}` // Fallback si clientName n'est pas défini
                }}
                view="list"
                onEdit={handleEdit}
                onCancel={handleDelete} // EventCard utilise onCancel au lieu de onDelete
                onClick={() => console.log('View archived event:', event.id)}
              />
            ))
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default EventArchive