import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, MapPin, DollarSign, Users, Flower, AlertTriangle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import DatePicker from '@/components/ui/DatePicker'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EventValidationSchema } from '@/utils/validation'
import { useEvents, useClients, useFlorists } from '@/contexts/AppContext'
import { Event, EventStatus } from '@/types'
import { validateEventDate } from '@/utils/floristAvailability'

// Schema de validation simplifié pour le formulaire
const EventFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  date: z.date({
    required_error: 'La date est requise',
    invalid_type_error: 'Date invalide'
  }),
  time: z.string().min(1, 'L\'heure est requise'),
  location: z.string().min(1, 'Le lieu est requis'),
  clientId: z.string().min(1, 'Veuillez sélectionner un client'),
  budget: z.number().min(0, 'Le budget doit être positif'),
  status: z.nativeEnum(EventStatus),
  notes: z.string().optional(),
  flowers: z.array(z.object({
    flowerId: z.string(),
    quantity: z.number()
  })).optional()
})

type EventFormData = z.infer<typeof EventFormSchema>

interface EventFormProps {
  initialData?: Event
  onSubmit?: (data: any) => void
  onSuccess?: () => void
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

const EventForm: React.FC<EventFormProps> = ({ 
  onSubmit: onSubmitProp, 
  onSuccess, 
  onCancel, 
  isLoading: externalLoading = false,
  submitLabel = "Créer l'événement"
}) => {
  const { createEvent, isLoading: contextLoading } = useEvents()
  const { clients } = useClients()
  const { florists } = useFlorists()
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([])
  const [dateValidationError, setDateValidationError] = useState<string | null>(null)
  
  const isLoading = externalLoading || contextLoading
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      status: EventStatus.DRAFT,
      flowers: []
    }
  })
  
  const watchedDate = watch('date')
  
  // Options pour les clients
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: `${client.firstName} ${client.lastName}`
  }))
  
  // Options pour le statut
  const statusOptions = [
    { value: EventStatus.DRAFT, label: 'Brouillon' },
    { value: EventStatus.CONFIRMED, label: 'Confirmé' },
    { value: EventStatus.IN_PROGRESS, label: 'En cours' },
    { value: EventStatus.COMPLETED, label: 'Terminé' },
    { value: EventStatus.CANCELLED, label: 'Annulé' }
  ]
  
  const onSubmit = async (data: EventFormData) => {
    try {
      // Vérifier les indisponibilités avant soumission
      const validation = validateEventDate(data.date, florists)
      if (!validation.isValid) {
        setDateValidationError(validation.error || 'Date indisponible')
        return
      }
      
      const eventData = {
        ...data,
        flowers: selectedFlowers.map(flowerId => ({ flowerId, quantity: 1 }))
      }
      
      console.log('🎯 EventForm - Données à envoyer:', eventData)
      
      // Utiliser la fonction onSubmit externe si fournie, sinon createEvent
      if (onSubmitProp) {
        await onSubmitProp(eventData)
      } else {
        await createEvent(eventData)
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'événement:', error)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flower className="w-6 h-6 text-primary-500" />
            <span>Nouvel Événement</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Titre de l'événement"
                placeholder="Ex: Mariage de Marie et Pierre"
                leftIcon={<Flower className="w-4 h-4" />}
                error={errors.title?.message}
                {...register('title')}
              />
              
              <Dropdown
                options={clientOptions}
                placeholder="Sélectionner un client"
                onSelect={(value) => setValue('clientId', value)}
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Décrivez l'événement en détail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            {/* Date et lieu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <DatePicker
                  value={watchedDate}
                  onChange={(date) => {
                    setValue('date', date)
                    
                    // Vérifier les indisponibilités
                    if (date) {
                      const validation = validateEventDate(date, florists)
                      setDateValidationError(validation.isValid ? null : validation.error || null)
                    } else {
                      setDateValidationError(null)
                    }
                  }}
                  minDate={new Date()}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
                {dateValidationError && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {dateValidationError}
                      </p>
                    </div>
                    <p className="text-xs text-red-500 dark:text-red-300 mt-1">
                      Veuillez choisir une autre date.
                    </p>
                  </div>
                )}
              </div>
              
              <Input
                label="Heure"
                type="time"
                placeholder="14:30"
                error={errors.time?.message}
                {...register('time')}
              />
              
              <Input
                label="Lieu"
                placeholder="Château de Versailles"
                leftIcon={<MapPin className="w-4 h-4" />}
                error={errors.location?.message}
                {...register('location')}
              />
            </div>
            
            {/* Budget et statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Budget (€)"
                type="number"
                step="0.01"
                placeholder="1500.00"
                leftIcon={<DollarSign className="w-4 h-4" />}
                error={errors.budget?.message}
                {...register('budget', { valueAsNumber: true })}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <Dropdown
                  options={statusOptions}
                  value={watch('status')}
                  onSelect={(value) => setValue('status', value as EventStatus)}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
            
            {/* Notes optionnelles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                rows={3}
                placeholder="Notes additionnelles..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                {...register('notes')}
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                >
                  Annuler
                </Button>
              )}
              
              <Button
                type="submit"
                isLoading={isSubmitting || isLoading}
                disabled={!!dateValidationError || isSubmitting || isLoading}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                {submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default EventForm