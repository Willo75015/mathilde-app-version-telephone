import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, X } from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { useApp } from '../../contexts/AppContext'

interface ContactFloristModalProps {
  florist: {
    id: string
    name: string
    phone?: string
    email?: string
    preWrittenMessage?: string // 🆕 Message pré-écrit
  } | null
  event: {
    id: string
    title: string
    date: Date
  } | null
  floristStatus: 'pending' | 'confirmed' | 'refused' | 'not_selected'
  isOpen: boolean
  onClose: () => void
}

export const ContactFloristModal: React.FC<ContactFloristModalProps> = ({
  florist,
  event,
  floristStatus,
  isOpen,
  onClose
}) => {
  const { actions } = useApp()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Générer le message pré-écrit selon le statut
  React.useEffect(() => {
    if (florist && event && floristStatus === 'not_selected') {
      // 🆕 Utiliser le message pré-écrit s'il existe, sinon générer
      const messageToUse = florist.preWrittenMessage || actions.generateNotSelectedMessage(
        florist.name.split(' ')[0], // Prénom seulement
        event.title,
        event.date
      )
      setMessage(messageToUse)
    } else {
      setMessage('') // Message vide pour les autres statuts
    }
  }, [florist, event, floristStatus, actions])

  const handleSend = async () => {
    if (!florist || !message.trim()) return

    setIsSending(true)
    try {
      // Simuler l'envoi (remplacer par vraie logique d'envoi)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('📱 Message envoyé à:', florist.name)
      console.log('📝 Contenu:', message)
      
      // Fermer la modal après envoi
      onClose()
      
      // Reset le message
      setMessage('')
      
    } catch (error) {
      console.error('Erreur envoi message:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (!florist || !event) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contacter {florist.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                À propos de : {event.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Informations de contact */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm space-y-1">
            {florist.phone && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">📱</span>
                <span className="text-gray-900 dark:text-white">{florist.phone}</span>
              </div>
            )}
            {florist.email && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">📧</span>
                <span className="text-gray-900 dark:text-white">{florist.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message pré-écrit pour "Non retenu" */}
        {floristStatus === 'not_selected' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium mb-2">
              💬 Message pré-écrit (statut: Non retenu)
            </p>
            <p className="text-blue-700 text-xs">
              Le message ci-dessous a été généré automatiquement. Vous pouvez le modifier avant envoi.
            </p>
          </div>
        )}

        {/* Zone de saisie du message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tapez votre message..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <div className="mt-1 text-xs text-gray-500">
            {message.length} caractères
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isSending}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSend}
            className="flex-1"
            isLoading={isSending}
            leftIcon={<Send className="w-4 h-4" />}
            disabled={!message.trim()}
          >
            {isSending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ContactFloristModal