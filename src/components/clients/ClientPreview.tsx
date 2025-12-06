import React from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { Client } from '@/types'

interface ClientPreviewProps {
  clientData: Partial<Client>
  onEdit: () => void
  onConfirm: () => void
}

const ClientPreview: React.FC<ClientPreviewProps> = ({ 
  clientData, 
  onEdit, 
  onConfirm 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <User className="w-5 h-5 mr-2 text-primary-600" />
          Aperçu du client
        </h4>
        <button
          onClick={onEdit}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Modifier
        </button>
      </div>

      <div className="space-y-3">
        {/* Nom complet */}
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {clientData.firstName} {clientData.lastName}
          </span>
        </div>

        {/* Email */}
        {clientData.email && (
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {clientData.email}
            </span>
          </div>
        )}

        {/* Téléphone */}
        {clientData.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {clientData.phone}
            </span>
          </div>
        )}

        {/* Adresse */}
        {clientData.address && (
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="text-gray-700 dark:text-gray-300">
              <div>{clientData.address.street}</div>
              <div>{clientData.address.postalCode} {clientData.address.city}</div>
              <div>{clientData.address.country}</div>
            </div>
          </div>
        )}

        {/* Date de création */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Créé le {new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div className="mt-6 flex space-x-3">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Retour à l'édition
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
        >
          Créer le client
        </button>
      </div>
    </motion.div>
  )
}

export default ClientPreview
