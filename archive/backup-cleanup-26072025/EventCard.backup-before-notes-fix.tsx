import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, User, Euro, Calendar, Clock, Archive, DollarSign, CheckCircle, X } from 'lucide-react'
import { EventStatus, getKanbanColumn } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'

interface EventCardProps {
  event: {
    id: string
    title: string
    description?: string
    date: Date | string
    time: string
    location: string
    budget: number
    status: EventStatus
    clientName: string
    floristName?: string
    invoiced?: boolean
    paid?: boolean
    invoiceDate?: Date
    paidDate?: Date
  }
  view?: 'list' | 'kanban' | 'calendar'
  onClick?: (event: any) => void
  onEdit?: (event: any) => void
  onCancel?: (event: any) => void          // 🔄 Changé de onDelete à onCancel
  onStatusChange?: (eventId: string, newStatus: EventStatus) => void
  onArchiveAndInvoice?: (event: any) => void
  onPaymentTracking?: (event: any) => void
  onDragStart?: (event: any) => void
  onDragEnd?: () => void
  isDragging?: boolean
  className?: string
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  view = 'list',
  onClick,
  onEdit,
  onCancel,              // 🔄 Changé de onDelete à onCancel
  onStatusChange,
  onArchiveAndInvoice,
  onPaymentTracking,
  onDragStart,
  onDragEnd,
  isDragging = false,
  className = ''
}) => {
  // 🆕 États pour la double vérification d'annulation
  const [showFirstConfirm, setShowFirstConfirm] = useState(false)
  const [showSecondConfirm, setShowSecondConfirm] = useState(false)
  
  // 🆕 Gestion de l'annulation avec double vérification
  const handleCancelClick = () => {
    setShowFirstConfirm(true)
  }
  
  const handleFirstConfirm = () => {
    setShowFirstConfirm(false)
    setShowSecondConfirm(true)
  }
  
  const handleSecondConfirm = () => {
    setShowSecondConfirm(false)
    if (onCancel) {
      onCancel(event)
    }
  }
  
  const handleCancelDialog = () => {
    setShowFirstConfirm(false)
    setShowSecondConfirm(false)
  }
  
  const column = getKanbanColumn(event.status)
  
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  const cardClasses = `
    bg-white rounded-lg border border-gray-200 p-4 shadow-sm
    hover:shadow-md transition-all duration-200
    ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
    ${view === 'kanban' ? 'cursor-move' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  const handleCardClick = (e: React.MouseEvent) => {
    // Ne pas déclencher onClick si on clique sur les boutons d'action
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="button"]')) {
      return
    }
    
    if (onClick) {
      onClick(event)
    }
  }
  
  return (
    <motion.div
      className={cardClasses}
      draggable={view === 'kanban'}
      onClick={handleCardClick}
      onDragStart={() => onDragStart?.(event)}
      onDragEnd={onDragEnd}
      whileHover={view !== 'kanban' ? { y: -2 } : undefined}
      layout
    >
      {/* Header avec titre et statut */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
        
        {view !== 'kanban' && (
          <StatusBadge 
            status={event.status}
            size="sm"
            onClick={onStatusChange ? () => {
              // Cycle through statuses for quick change
              const statuses = Object.values(EventStatus)
              const currentIndex = statuses.indexOf(event.status)
              const nextStatus = statuses[(currentIndex + 1) % statuses.length]
              onStatusChange(event.id, nextStatus)
            } : undefined}
          />
        )}
      </div>
      
      {/* Informations principales */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatDate(event.date)} à {event.time}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          <span className="truncate">{event.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="truncate">{event.clientName}</span>
        </div>
        
        {event.floristName && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2 text-center">🌸</span>
            <span className="truncate">{event.floristName}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm font-medium text-gray-900">
          <Euro className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatCurrency(event.budget)}</span>
        </div>
      </div>
      
      {/* Actions */}
      {(onEdit || onDelete || onArchiveAndInvoice || onPaymentTracking) && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Boutons de workflow à gauche */}
          <div className="flex items-center space-x-2">
            {/* Bouton Terminer/Archiver pour événements COMPLETED */}
            {event.status === EventStatus.COMPLETED && onArchiveAndInvoice && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Archive className="w-3 h-3" />}
                onClick={() => onArchiveAndInvoice(event)}
                className="text-xs bg-blue-600 hover:bg-blue-700"
              >
                Terminer
              </Button>
            )}
            
            {/* Bouton Facturé pour événements INVOICED */}
            {event.status === EventStatus.INVOICED && onPaymentTracking && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<DollarSign className="w-3 h-3" />}
                onClick={() => onPaymentTracking(event)}
                className="text-xs bg-purple-600 hover:bg-purple-700"
              >
                Facturé
              </Button>
            )}
            
            {/* Badge Payé pour événements PAID */}
            {event.status === EventStatus.PAID && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs font-medium">Payé</span>
                {event.paidDate && (
                  <span className="text-xs text-green-600">
                    {new Date(event.paidDate).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Actions existantes à droite */}
          <div className="flex items-center space-x-2">
            {onClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClick(event)}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                👁️ Voir
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(event)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Modifier
              </Button>
            )}
            
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelClick}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Annuler
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* 🆕 PREMIÈRE MODALE DE CONFIRMATION */}
      {showFirstConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-lg">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmation d'annulation
                </h3>
                <p className="text-sm text-gray-500">
                  Première vérification
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Êtes-vous sûr d'annuler cet événement ?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                <strong>"{event.title}"</strong> - {formatDate(event.date)}
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={handleCancelDialog}
                className="text-sm"
              >
                Non, garder
              </Button>
              <Button
                variant="primary"
                onClick={handleFirstConfirm}
                className="text-sm bg-orange-600 hover:bg-orange-700"
              >
                Oui, continuer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* 🆕 DEUXIÈME MODALE DE CONFIRMATION */}
      {showSecondConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Suppression définitive
                </h3>
                <p className="text-sm text-gray-500">
                  Dernière confirmation
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-red-700 font-medium">
                Vous êtes sur le point de supprimer toutes les informations de cet événement.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Cette action est <strong>irréversible</strong>. Toutes les données seront perdues définitivement.
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                <p className="text-sm text-red-800">
                  <strong>Événement :</strong> {event.title}<br />
                  <strong>Date :</strong> {formatDate(event.date)}<br />
                  <strong>Budget :</strong> {formatCurrency(event.budget)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={handleCancelDialog}
                className="text-sm"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSecondConfirm}
                className="text-sm bg-red-600 hover:bg-red-700"
              >
                Supprimer définitivement
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default EventCard
