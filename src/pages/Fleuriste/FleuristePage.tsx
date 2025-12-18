import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Grid, List, Users, 
  Star, Phone, Mail, MapPin, Plus, Edit, Clock, AlertCircle
} from 'lucide-react'
import { Florist, FloristAvailability } from '@/types'
import { FloristStatusManager, useFloristStatus } from '@/utils/floristStatus'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FloristStatusBadge from '@/components/ui/FloristStatusBadge'
import EditFloristModal from '@/components/modals/EditFloristModal'

// Utilisons directement l'interface Florist pour éviter la duplication
interface FloristData extends Florist {}

interface FleuristePageProps {
  navigate?: (page: string, params?: any) => void
}

const FleuristePage: React.FC<FleuristePageProps> = ({ navigate }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState('all')
  const [selectedFlorist, setSelectedFlorist] = useState<FloristData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Simulation d'événements assignés (tu peux récupérer ça depuis ton context)
  // Type any[] utilisé car ces données simulées sont incomplètes - en production, utiliser les vrais Event[] du contexte
  const [assignedEvents] = useState<any[]>([
    {
      id: '1',
      title: 'Mariage Sophie & Thomas',
      date: new Date('2024-12-28T14:00:00'),
      endDate: new Date('2024-12-28T22:00:00'),
      clientId: '1'
    },
    {
      id: '2',
      title: 'Événement Entreprise',
      date: new Date('2024-12-29T09:00:00'),
      endDate: new Date('2024-12-29T18:00:00'),
      clientId: '2'
    }
  ])

  // Données des fleuristes avec périodes d'indisponibilité - AVEC PERSISTANCE
  const [fleuristes, setFleuristes] = useState<FloristData[]>(() => {
    // Charger depuis localStorage au démarrage
    const savedFleuristes = localStorage.getItem('mathilde_fleuristes')
    if (savedFleuristes) {
      try {
        const parsed = JSON.parse(savedFleuristes)
        // Reconstituer les dates
        return parsed.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt),
          updatedAt: new Date(f.updatedAt),
          unavailabilityPeriods: (f.unavailabilityPeriods || []).map((p: any) => ({
            ...p,
            startDate: new Date(p.startDate),
            endDate: new Date(p.endDate)
          }))
        }))
      } catch (error) {
        console.error('Erreur chargement fleuristes:', error)
      }
    }
    
    // Données par défaut si rien en localStorage
    return [
    {
      id: '1',
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@email.com',
      phone: '06 12 34 56 78',
      experience: 8,
      rating: 4.9,
      hourlyRate: 45,
      availability: FloristAvailability.AVAILABLE,
      location: 'Paris 15ème',
      completedEvents: 127,
      avatar: '👩‍🦰',
      skills: ['Design floral', 'Compositions modernes', 'Événements haut de gamme'],
      languages: ['Français', 'Anglais'],
      certifications: ['CAP Fleuriste', 'Formation Mariages de Prestige'],
      comments: 'Excellente créativité et ponctualité remarquable.',
      unavailabilityPeriods: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-27')
    },
    {
      id: '2',
      firstName: 'Thomas',
      lastName: 'Dubois',
      email: 'thomas.dubois@email.com', 
      phone: '06 98 76 54 32',
      experience: 5,
      rating: 4.7,
      hourlyRate: 38,
      availability: FloristAvailability.ON_MISSION,
      location: 'Boulogne',
      completedEvents: 89,
      avatar: '👨‍🦱',
      skills: ['Arrangements corporatifs', 'Installations florales', 'Gestion d\'équipe'],
      languages: ['Français', 'Espagnol'],
      certifications: ['BP Fleuriste', 'Formation Événementiel'],
      unavailabilityPeriods: [],
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-12-27')
    },
    {
      id: '3',
      firstName: 'Marie',
      lastName: 'Lemoine',
      email: 'marie.lemoine@email.com',
      phone: '06 55 43 21 09',
      experience: 12,
      rating: 4.8,
      hourlyRate: 42,
      availability: FloristAvailability.AVAILABLE,
      location: 'Neuilly',
      completedEvents: 203,
      avatar: '👩‍🦳',
      skills: ['Art funéraire', 'Compositions traditionnelles', 'Relation client'],
      languages: ['Français'],
      certifications: ['CAP Fleuriste', 'Spécialisation Funéraire', '15 ans d\'expérience'],
      comments: 'Très expérimentée, spécialiste des événements traditionnels.',
      unavailabilityPeriods: [],
      createdAt: new Date('2022-01-05'),
      updatedAt: new Date('2024-12-27')
    },
    {
      id: '4',
      firstName: 'Lucas',
      lastName: 'Petit',
      email: 'lucas.petit@email.com',
      phone: '06 77 88 99 11',
      experience: 3,
      rating: 4.5,
      hourlyRate: 32,
      availability: FloristAvailability.AVAILABLE,
      location: 'Vincennes',
      completedEvents: 45,
      avatar: '👨‍🦲',
      skills: ['Techniques innovantes', 'Formation clients', 'Réseaux sociaux'],
      languages: ['Français', 'Anglais', 'Italien'],
      certifications: ['CAP Fleuriste', 'Formation Digitale'],
      unavailabilityPeriods: [],
      createdAt: new Date('2024-06-20'),
      updatedAt: new Date('2024-12-27')
    },
    {
      id: '5',
      firstName: 'Emma',
      lastName: 'Rousseau',
      email: 'emma.rousseau@email.com',
      phone: '06 33 44 55 66',
      experience: 6,
      rating: 4.6,
      hourlyRate: 40,
      availability: FloristAvailability.UNAVAILABLE,
      location: 'Montreuil',
      completedEvents: 98,
      avatar: '👩‍🦱',
      skills: ['Style bohème', 'Fleurs de saison', 'Éco-responsabilité'],
      languages: ['Français', 'Anglais'],
      certifications: ['CAP Fleuriste', 'Formation Éco-florale'],
      comments: 'En congés maternité jusqu\'en mars.',
      unavailabilityPeriods: [
        {
          id: 'unavail-1',
          startDate: new Date('2024-12-01'),
          endDate: new Date('2025-03-15'),
          reason: 'Congés maternité',
          isActive: true
        }
      ],
      createdAt: new Date('2023-08-12'),
      updatedAt: new Date('2024-12-27')
    },
    {
      id: '6',
      firstName: 'Pierre',
      lastName: 'Vincent',
      email: 'pierre.vincent@email.com',
      phone: '06 11 22 33 44',
      experience: 15,
      rating: 5.0,
      hourlyRate: 55,
      availability: FloristAvailability.ON_MISSION,
      location: 'Paris 8ème',
      completedEvents: 287,
      avatar: '👨‍🦰',
      skills: ['Installations monumentales', 'Gestion VIP', 'Management d\'équipe'],
      languages: ['Français', 'Anglais', 'Allemand'],
      certifications: ['Maître Fleuriste', 'Formation Luxury Events', 'Management'],
      comments: 'Expert en événements de prestige, très demandé.',
      unavailabilityPeriods: [],
      createdAt: new Date('2020-01-10'),
      updatedAt: new Date('2024-12-27')
    }
    ] // Fermeture du tableau par défaut
  })

  // Sauvegarde automatique dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('mathilde_fleuristes', JSON.stringify(fleuristes))
    console.log('💾 Fleuristes sauvegardés:', fleuristes.length)
  }, [fleuristes])

  // 🔧 SYNCHRONISATION INITIALE au chargement de la page
  useEffect(() => {
    console.log('🚀 Synchronisation initiale des statuts au chargement')
    setFleuristes(prevFleuristes => 
      FloristStatusManager.updateAllFloristStatuses(prevFleuristes, assignedEvents)
    )
  }, []) // Seulement au premier rendu

  // Mise à jour automatique des statuts selon le calendrier
  useEffect(() => {
    const updateStatuses = () => {
      console.log('🔄 Mise à jour automatique des statuts des fleuristes')
      setFleuristes(prevFleuristes => {
        const updatedFleuristes = FloristStatusManager.updateAllFloristStatuses(prevFleuristes, assignedEvents)
        
        // Vérifier si des changements ont eu lieu
        const hasChanges = updatedFleuristes.some((florist, index) => 
          florist.availability !== prevFleuristes[index]?.availability
        )
        
        if (hasChanges) {
          console.log('✅ Statuts mis à jour:', updatedFleuristes.map(f => 
            `${f.firstName} ${f.lastName}: ${f.availability}`
          ))
        }
        
        return updatedFleuristes
      })
    }

    // Mise à jour immédiate
    updateStatuses()

    // Mise à jour toutes les 30 secondes pour être plus réactif
    const interval = setInterval(updateStatuses, 30000)

    return () => clearInterval(interval)
  }, [assignedEvents])

  const availabilityOptions = [
    { id: 'all', name: 'Tous statuts', color: 'gray' },
    { id: FloristAvailability.AVAILABLE, name: 'Disponible', color: 'green' },
    { id: FloristAvailability.ON_MISSION, name: 'Programmé sur une mission', color: 'blue' },
    { id: FloristAvailability.UNAVAILABLE, name: 'Indisponible', color: 'red' }
  ]

  // Filtrer les fleuristes - SIMPLIFIÉ
  const filteredFleuristes = fleuristes.filter(fleuriste => {
    const matchesSearch = 
      fleuriste.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fleuriste.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAvailability = selectedAvailability === 'all' || 
      fleuriste.availability === selectedAvailability

    return matchesSearch && matchesAvailability
  })

  const getAvailabilityColor = (availability: FloristAvailability) => {
    switch (availability) {
      case FloristAvailability.AVAILABLE: 
        return 'bg-green-50 text-green-700 border-green-400 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
      case FloristAvailability.ON_MISSION: 
        return 'bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
      case FloristAvailability.UNAVAILABLE: 
        return 'bg-red-50 text-red-700 border-red-400 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600'
      default: 
        return 'bg-gray-50 text-gray-700 border-gray-400 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600'
    }
  }

  const getAvailabilityText = (availability: FloristAvailability) => {
    switch (availability) {
      case FloristAvailability.AVAILABLE: return 'Disponible'
      case FloristAvailability.ON_MISSION: return 'Programmé sur une mission'
      case FloristAvailability.UNAVAILABLE: return 'Indisponible'
      default: return 'Inconnu'
    }
  }

  // Handlers
  const handleEditFlorist = (fleuriste: FloristData) => {
    setSelectedFlorist(fleuriste)
    setIsEditModalOpen(true)
  }

  const handleSaveFlorist = (updatedData: Partial<FloristData>) => {
    if (!selectedFlorist) return
    
    setFleuristes(prev => {
      let updatedFleuristes: FloristData[]
      
      // Si c'est un nouveau fleuriste (ID commence par "new-")
      if (selectedFlorist.id.startsWith('new-')) {
        const newFlorist = {
          ...selectedFlorist,
          ...updatedData,
          id: crypto.randomUUID(), // Générer un vrai ID
          createdAt: new Date(),
          updatedAt: new Date()
        }
        updatedFleuristes = [...prev, newFlorist]
      } else {
        // Modification d'un fleuriste existant
        updatedFleuristes = prev.map(f => 
          f.id === selectedFlorist.id 
            ? { ...f, ...updatedData, updatedAt: new Date() }
            : f
        )
      }
      
      // 🔧 FORCER LA MISE À JOUR DES STATUTS après modification
      console.log('🔄 Mise à jour des statuts après modification du fleuriste')
      return FloristStatusManager.updateAllFloristStatuses(updatedFleuristes, assignedEvents)
    })
  }

  const handleCallFlorist = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const handleMessageFlorist = (phone: string, florist?: FloristData) => {
    // Déterminer le message selon le statut du fleuriste
    let message = ''
    
    if (florist) {
      if (florist.availability === FloristAvailability.AVAILABLE) {
        message = 'Bonjour ! Nous avons trouvé une mission qui pourrait vous intéresser. Êtes-vous disponible pour en discuter ?'
      } else if (florist.availability === FloristAvailability.ON_MISSION) {
        message = 'Bonjour ! J\'espère que votre mission se passe bien. Contactez-nous quand vous serez libre pour de nouvelles opportunités.'
      } else {
        message = 'Bonjour ! Comment allez-vous ? N\'hésitez pas à nous recontacter quand vous serez à nouveau disponible.'
      }
    } else {
      message = 'Bonjour ! Comment allez-vous ?'
    }
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message)
    window.open(`sms:${phone}?body=${encodedMessage}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                👥 Gestion des Fleuristes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez votre équipe de fleuristes freelances et leurs disponibilités
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{filteredFleuristes.length}</span> fleuriste{filteredFleuristes.length > 1 ? 's' : ''}
              </div>
              
              {/* Bouton de synchronisation manuelle */}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<AlertCircle className="w-4 h-4" />}
                onClick={() => {
                  console.log('🔄 Synchronisation manuelle des statuts')
                  setFleuristes(prevFleuristes => 
                    FloristStatusManager.updateAllFloristStatuses(prevFleuristes, assignedEvents)
                  )
                }}
              >
                Synchroniser
              </Button>
              
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  // Pour l'instant, créer un nouveau fleuriste vide
                  const newFlorist: FloristData = {
                    id: `new-${Date.now()}`,
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    experience: 0,
                    rating: 4.0,
                    hourlyRate: 35,
                    availability: FloristAvailability.AVAILABLE,
                    location: '',
                    completedEvents: 0,
                    avatar: '👤',
                    skills: [],
                    languages: ['Français'],
                    certifications: [],
                    comments: '',
                    unavailabilityPeriods: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                  setSelectedFlorist(newFlorist)
                  setIsEditModalOpen(true)
                }}
              >
                Ajouter Fleuriste
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtres et recherche - SIMPLIFIÉS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <Input
                placeholder="Rechercher un fleuriste par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Filtres de statut selon le calendrier */}
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map(option => (
                <Button
                  key={option.id}
                  variant={selectedAvailability === option.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAvailability(option.id)}
                  className={selectedAvailability === option.id ? '' : 'hover:border-gray-300'}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    option.color === 'green' ? 'bg-green-500' :
                    option.color === 'blue' ? 'bg-blue-500' :
                    option.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></span>
                  {option.name}
                </Button>
              ))}
            </div>
            
            {/* Mode d'affichage */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                leftIcon={<Grid className="w-4 h-4" />}
              />
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                leftIcon={<List className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Grille de fleuristes */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredFleuristes.map((fleuriste, index) => (
            <motion.div
              key={fleuriste.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {viewMode === 'grid' ? (
                // Mode Grille
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Photo ou emoji */}
                    <div className="flex-shrink-0">
                      {fleuriste.avatar && (fleuriste.avatar.startsWith('http') || fleuriste.avatar.startsWith('data:image/')) ? (
                        <img 
                          src={fleuriste.avatar} 
                          alt={`${fleuriste.firstName} ${fleuriste.lastName}`}
                          className="w-16 h-16 rounded-full object-cover border-3 border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-3 border-gray-200 dark:border-gray-600">
                          <span className="text-3xl">{fleuriste.avatar || '👤'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {fleuriste.firstName} {fleuriste.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {fleuriste.experience} ans d'expérience
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Stats principales */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {fleuriste.hourlyRate}€
                        </div>
                        <div className="text-xs text-gray-500">par heure</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {fleuriste.rating}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">note</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {fleuriste.completedEvents}
                        </div>
                        <div className="text-xs text-gray-500">événements</div>
                      </div>
                    </div>
                    
                    {/* Commentaires si disponibles */}
                    {fleuriste.comments && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-3 border-primary-500">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          💬 {fleuriste.comments}
                        </p>
                      </div>
                    )}
                    
                    {/* Actions - 3 boutons bien répartis */}
                    <div className="flex items-center space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCallFlorist(fleuriste.phone)}
                        leftIcon={<Phone className="w-3 h-3" />}
                        className="flex-1"
                      >
                        Appel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMessageFlorist(fleuriste.phone, fleuriste)}
                        leftIcon={<Mail className="w-3 h-3" />}
                        className="flex-1"
                      >
                        Message
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditFlorist(fleuriste)}
                        leftIcon={<Edit className="w-3 h-3" />}
                        className="flex-1"
                      >
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Mode Liste
                <div className="p-6 flex items-center space-x-6">
                  {/* Photo ou emoji - Mode Liste */}
                  <div className="flex-shrink-0">
                    {fleuriste.avatar && (fleuriste.avatar.startsWith('http') || fleuriste.avatar.startsWith('data:image/')) ? (
                      <img 
                        src={fleuriste.avatar} 
                        alt={`${fleuriste.firstName} ${fleuriste.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                        <span className="text-2xl">{fleuriste.avatar || '👤'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {fleuriste.firstName} {fleuriste.lastName}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {fleuriste.experience} ans d'expérience • {fleuriste.location}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{fleuriste.phone}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{fleuriste.rating}</span>
                      </span>
                      <span>{fleuriste.completedEvents} événements</span>
                    </div>
                    
                    {/* Commentaires en mode liste */}
                    {fleuriste.comments && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                        💬 {fleuriste.comments}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {fleuriste.hourlyRate}€/h
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCallFlorist(fleuriste.phone)}
                        leftIcon={<Phone className="w-3 h-3" />}
                      >
                        Appel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMessageFlorist(fleuriste.phone, fleuriste)}
                        leftIcon={<Mail className="w-3 h-3" />}
                      >
                        Message
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditFlorist(fleuriste)}
                        leftIcon={<Edit className="w-3 h-3" />}
                      >
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Message si aucun fleuriste trouvé */}
        {filteredFleuristes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun fleuriste trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Modal de modification */}
      <EditFloristModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFlorist(null)
        }}
        florist={selectedFlorist as any}
        onSave={handleSaveFlorist}
      />
    </div>
  )
}

export default FleuristePage