import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MapPin, Save, MessageSquare, DollarSign } from 'lucide-react'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ClientValidationSchema } from '@/utils/validation'
import { useClients } from '@/contexts/AppContext'
import { Client } from '@/types'

// Schema de validation pour le formulaire
const ClientFormSchema = ClientValidationSchema

type ClientFormData = z.infer<typeof ClientFormSchema>

interface ClientFormProps {
  initialData?: Partial<Client>
  onSubmit?: (data: ClientFormData) => Promise<void>
  onSuccess?: () => void
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  initialData,
  onSubmit: externalOnSubmit,
  onSuccess, 
  onCancel,
  isLoading: externalIsLoading,
  submitLabel = "Créer le client"
}) => {
  const { createClient, isLoading: contextIsLoading } = useClients()
  
  const isLoading = externalIsLoading ?? contextIsLoading
  const isEditing = !!initialData?.id
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<ClientFormData>({
    resolver: zodResolver(ClientFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: {
        street: initialData?.address?.street || '',
        city: initialData?.address?.city || '',
        postalCode: initialData?.address?.postalCode || '',
        country: initialData?.address?.country || 'France'
      },
      comments: (initialData as any)?.comments || ''
      // managerPayment et freelancePayment temporairement retirés
    }
  })
  
  const onSubmit = async (data: ClientFormData) => {
    try {
      if (externalOnSubmit) {
        // Mode édition avec callback externe
        await externalOnSubmit(data)
      } else {
        // Mode création avec contexte
        await createClient(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error)
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
            <User className="w-6 h-6 text-primary-500" />
            <span>{isEditing ? 'Modifier le client' : 'Nouveau Client'}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Prénom"
                placeholder="Marie"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              
              <Input
                label="Nom"
                placeholder="Dupont"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
            
            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                type="email"
                placeholder="marie.dupont@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              
              {/* Téléphone avec 5 cases */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  📱 Téléphone
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.phone?.message}
                      placeholder="01 23 45 67 89"
                    />
                  )}
                />
              </div>
            </div>
            
            {/* Adresse */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Adresse</span>
              </h3>
              
              <Input
                label="Rue"
                placeholder="123 Rue de la Paix"
                error={errors.address?.street?.message}
                {...register('address.street')}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Ville"
                  placeholder="Paris"
                  error={errors.address?.city?.message}
                  {...register('address.city')}
                />
                
                <Input
                  label="Code postal"
                  placeholder="75001"
                  error={errors.address?.postalCode?.message}
                  {...register('address.postalCode')}
                />
                
                <Input
                  label="Pays"
                  placeholder="France"
                  error={errors.address?.country?.message}
                  {...register('address.country')}
                />
              </div>
            </div>

            {/* Informations complémentaires */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Informations complémentaires</span>
              </h3>
              
              {/* Commentaires */}
              <Textarea
                label="Commentaires"
                placeholder="Notes, préférences, allergies, informations spéciales..."
                rows={4}
                hint="Informations utiles pour personnaliser le service (max 1000 caractères)"
                error={errors.comments?.message}
                {...register('comments')}
              />

              {/* Paiements - Temporairement désactivés pour debug */}
              {/* 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Paiement Manager (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10000"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  hint="Montant réservé pour le manager"
                  error={errors.managerPayment?.message}
                  {...register('managerPayment', { valueAsNumber: true })}
                />
                
                <Input
                  label="Paiement Freelance (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10000"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  hint="Montant réservé pour le freelance"
                  error={errors.freelancePayment?.message}
                  {...register('freelancePayment', { valueAsNumber: true })}
                />
              </div>
              */}
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
                leftIcon={<Save className="w-4 h-4" />}
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

export default ClientForm