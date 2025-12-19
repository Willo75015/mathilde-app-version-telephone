import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Save, User, Mail, Phone, MapPin, Calendar, 
  Plus, Trash2, MessageCircle, Euro, Camera, Upload
} from 'lucide-react'
import { Florist, FloristAvailability, UnavailabilityPeriod } from '@/types'
import { FloristStatusManager } from '@/utils/floristStatus'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'

interface EditFloristModalProps {
  isOpen: boolean
  onClose: () => void
  florist: Florist | null
  onSave: (updatedFlorist: Partial<Florist>) => void
}

const EditFloristModal: React.FC<EditFloristModalProps> = ({
  isOpen,
  onClose,
  florist,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Florist>>({})
  const [unavailabilityPeriods, setUnavailabilityPeriods] = useState<UnavailabilityPeriod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form when florist changes + Calcul automatique du statut
  useEffect(() => {
    if (florist) {
      // Calculer le statut automatiquement
      const today = new Date()
      const activeUnavailabilityPeriods = (florist.unavailabilityPeriods || [])
        .filter(period => period.isActive && period.startDate <= today && period.endDate >= today)
      
      let calculatedStatus = FloristAvailability.AVAILABLE
      
      // Si il y a des périodes d'indisponibilité actives aujourd'hui
      if (activeUnavailabilityPeriods.length > 0) {
        calculatedStatus = FloristAvailability.UNAVAILABLE
      }
      // TODO: Ajouter la vérification des missions en cours
      // else if (hasMissionsToday) {
      //   calculatedStatus = FloristAvailability.ON_MISSION
      // }
      
      setFormData({
        firstName: florist.firstName,
        lastName: florist.lastName,
        email: florist.email,
        phone: florist.phone,
        location: florist.location,
        hourlyRate: florist.hourlyRate,
        experience: florist.experience,
        rating: florist.rating,
        availability: calculatedStatus, // Statut calculé automatiquement
        comments: florist.comments || '',
        avatar: florist.avatar
      })
      
      // 🔧 DEBUG : Vérifier l'état des périodes d'indisponibilité au chargement
      console.log('🔍 Chargement périodes d\'indisponibilité:', florist.unavailabilityPeriods?.map(p => ({
        id: p.id.substring(0, 8),
        reason: p.reason,
        isActive: p.isActive,
        startDate: p.startDate.toLocaleDateString(),
        endDate: p.endDate.toLocaleDateString()
      })))
      
      setUnavailabilityPeriods(florist.unavailabilityPeriods || [])
      
      // Initialiser la preview avec l'avatar existant s'il s'agit d'une URL ou base64
      if (florist.avatar && (florist.avatar.startsWith('http') || florist.avatar.startsWith('data:image/'))) {
        setPhotoPreview(florist.avatar)
      } else {
        setPhotoPreview('')
      }
    }
  }, [florist])

  // Recalculer le statut quand les périodes d'indisponibilité changent
  useEffect(() => {
    if (formData.firstName) { // S'assurer que le form est initialisé
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time pour comparaison de date seulement
      
      const activeUnavailabilityPeriods = unavailabilityPeriods
        .filter(period => {
          if (!period.isActive) return false
          const start = new Date(period.startDate)
          const end = new Date(period.endDate)
          start.setHours(0, 0, 0, 0)
          end.setHours(23, 59, 59, 999)
          return start <= today && end >= today
        })
      
      let newStatus = FloristAvailability.AVAILABLE
      
      if (activeUnavailabilityPeriods.length > 0) {
        newStatus = FloristAvailability.UNAVAILABLE
      }
      // TODO: Ajouter la vérification des missions en cours
      
      console.log('🔧 Recalcul statut:', newStatus, 'Périodes actives:', activeUnavailabilityPeriods.length)
      
      if (formData.availability !== newStatus) {
        setFormData(prev => ({ ...prev, availability: newStatus }))
      }
    }
  }, [unavailabilityPeriods, formData.firstName])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image (JPG, PNG, etc.)')
        return
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 5MB')
        return
      }
      
      // Créer une preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPhotoPreview(result)
        setFormData({...formData, avatar: result})
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoPreview('')
    setFormData({...formData, avatar: '👤'})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!florist) return

    setIsLoading(true)
    try {
      // Recalculer le statut final avant sauvegarde
      const today = new Date()
      const activeUnavailabilityPeriods = unavailabilityPeriods
        .filter(period => period.isActive && period.startDate <= today && period.endDate >= today)
      
      let finalStatus = FloristAvailability.AVAILABLE
      if (activeUnavailabilityPeriods.length > 0) {
        finalStatus = FloristAvailability.UNAVAILABLE
      }
      // TODO: Ajouter la vérification des missions en cours
      
      const updatedData = {
        ...formData,
        availability: finalStatus, // Forcer le statut calculé
        unavailabilityPeriods
      }
      
      console.log('🔧 Sauvegarde avec statut:', finalStatus)
      console.log('🔧 Périodes actives:', activeUnavailabilityPeriods.length)
      console.log('🔧 Toutes les périodes:', unavailabilityPeriods.map(p => ({
        id: p.id.substring(0, 8),
        reason: p.reason,
        isActive: p.isActive,
        startDate: p.startDate.toLocaleDateString(),
        endDate: p.endDate.toLocaleDateString()
      })))
      
      await onSave(updatedData)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addUnavailabilityPeriod = () => {
    const newPeriod: UnavailabilityPeriod = {
      id: crypto.randomUUID(),
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
      isActive: false // Pas active par défaut, faut cliquer "Valider"
    }
    setUnavailabilityPeriods([...unavailabilityPeriods, newPeriod])
  }

  const updateUnavailabilityPeriod = (id: string, updates: Partial<UnavailabilityPeriod>) => {
    console.log('🔧 Validation période:', id, updates)
    setUnavailabilityPeriods(periods =>
      periods.map(period =>
        period.id === id ? { ...period, ...updates } : period
      )
    )
  }

  const removeUnavailabilityPeriod = (id: string) => {
    setUnavailabilityPeriods(periods =>
      periods.filter(period => period.id !== id)
    )
  }

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
      case FloristAvailability.AVAILABLE:
        return 'Disponible'
      case FloristAvailability.ON_MISSION:
        return 'Programmé sur une mission'
      case FloristAvailability.UNAVAILABLE:
        return 'Indisponible'
      default:
        return 'Inconnu'
    }
  }

  if (!florist) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le fleuriste"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-20 md:pb-6">
        {/* Informations de base */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Informations personnelles</span>
          </h3>
          
          {/* Section Photo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              📷 Photo du fleuriste
            </label>
            <div className="flex items-center space-x-4">
              {/* Preview de la photo */}
              <div className="relative">
                {photoPreview ? (
                  <div className="relative group">
                    <img 
                      src={photoPreview} 
                      alt="Photo du fleuriste"
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                    <span className="text-3xl">
                      {formData.avatar && !formData.avatar.startsWith('http') && !formData.avatar.startsWith('data:image/') ? formData.avatar : '👤'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Boutons d'action */}
              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  {photoPreview ? 'Changer photo' : 'Ajouter photo'}
                </Button>
                
                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removePhoto}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
              
              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.firstName || ''}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            
            <Input
              label="Nom"
              value={formData.lastName || ''}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            
            <Input
              label="Téléphone"
              value={formData.phone || ''}
              onChange={(e) => {
                // Format automatique du téléphone : 06-12-34-56-78
                let value = e.target.value.replace(/\D/g, '') // Enlever tout sauf les chiffres
                if (value.length >= 2) {
                  value = value.match(/.{1,2}/g)?.join('-') || value
                }
                if (value.length > 14) { // 06-12-34-56-78 = 14 caractères
                  value = value.substring(0, 14)
                }
                setFormData({...formData, phone: value})
              }}
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="06-12-34-56-78"
              maxLength={14}
              required
            />
            
            <Input
              label="Localisation"
              value={formData.location || ''}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
            
            <Input
              label="Tarif horaire (€)"
              type="number"
              value={formData.hourlyRate || 0}
              onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})}
              leftIcon={<Euro className="w-4 h-4" />}
              min="0"
              step="1"
              required
            />
            
            <Input
              label="Années d'expérience"
              type="number"
              value={formData.experience || 0}
              onChange={(e) => setFormData({...formData, experience: Number(e.target.value)})}
              leftIcon={<Calendar className="w-4 h-4" />}
              min="0"
              max="50"
              step="1"
              placeholder="Ex: 5"
              required
            />
            
            <Input
              label="Note (sur 5)"
              type="number"
              value={formData.rating || 4.0}
              onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
              leftIcon={<span className="text-yellow-400">⭐</span>}
              min="1"
              max="5"
              step="0.1"
              placeholder="Ex: 4.5"
              required
            />
          </div>
        </Card>

        {/* Statut selon le calendrier - LECTURE SEULE */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>📅 Statut selon le calendrier</span>
          </h3>
          
          <div className="space-y-4">
            {/* Statut actuel calculé automatiquement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Statut actuel (calculé automatiquement)
              </label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    formData.availability === FloristAvailability.AVAILABLE ? 'bg-green-500' :
                    formData.availability === FloristAvailability.ON_MISSION ? 'bg-blue-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formData.availability === FloristAvailability.AVAILABLE && '✅ Disponible'}
                    {formData.availability === FloristAvailability.ON_MISSION && '📅 Sur une mission'}
                    {formData.availability === FloristAvailability.UNAVAILABLE && '🚫 Indisponible'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Le statut est calculé automatiquement selon les missions en cours et les périodes d'indisponibilité
                </p>
              </div>
            </div>

            {/* Section Missions en cours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                📅 Missions en cours
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  <strong>Missions d'aujourd'hui et à venir :</strong>
                </p>
                {/* TODO: Récupérer les vraies missions depuis le contexte */}
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Les missions seront affichées automatiquement selon le planning
                </div>
              </div>
            </div>

            {/* Périodes d'indisponibilité */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Périodes d'indisponibilité
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUnavailabilityPeriod}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Ajouter période
                </Button>
              </div>
              
              <div className="space-y-3">
                {unavailabilityPeriods.map((period) => (
                  <div key={period.id} className={`p-3 rounded-lg border-l-4 ${
                    period.isActive 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                  }`}>
                    {/* Indicateur de statut */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        period.isActive 
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                      }`}>
                        {period.isActive ? '✅ Validée' : '⏳ En attente de validation'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <Input
                        label="Date de début"
                        type="date"
                        value={period.startDate.toISOString().split('T')[0]}
                        onChange={(e) => updateUnavailabilityPeriod(period.id, {
                          startDate: new Date(e.target.value)
                        })}
                      />
                      
                      <Input
                        label="Date de fin"
                        type="date"
                        value={period.endDate.toISOString().split('T')[0]}
                        onChange={(e) => updateUnavailabilityPeriod(period.id, {
                          endDate: new Date(e.target.value)
                        })}
                      />
                      
                      <div className="flex items-end space-x-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => updateUnavailabilityPeriod(period.id, { isActive: true })}
                          className="flex-1"
                        >
                          ✅ Valider
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeUnavailabilityPeriod(period.id)}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                    
                    <Input
                      label="Raison (optionnel)"
                      value={period.reason || ''}
                      onChange={(e) => updateUnavailabilityPeriod(period.id, {
                        reason: e.target.value
                      })}
                      placeholder="Ex: Congés, formation, maladie..."
                    />
                  </div>
                ))}
                
                {unavailabilityPeriods.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Aucune période d'indisponibilité définie
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Section commentaires - AMÉLIORÉE */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>💬 Commentaires & Notes</span>
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes sur le fleuriste
            </label>
            <textarea
              value={formData.comments || ''}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              placeholder="Ex: Excellente créativité, préfère les événements en extérieur, très ponctuelle, spécialiste des mariages..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Ajoutez des observations sur les compétences, préférences de travail, points forts...
            </p>
          </div>
        </Card>

        </div>

        {/* Actions - Footer fixe sur mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 pb-safe flex justify-end space-x-3 z-[100] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Sauvegarder
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditFloristModal