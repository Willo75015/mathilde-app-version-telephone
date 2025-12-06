import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, User, Euro, Calendar, Archive, DollarSign, CheckCircle, X, Edit } from 'lucide-react'
import { EventStatus } from '@/types'
import Button from '@/components/ui/Button'
import {
  getStatusColors,
  getPaymentOverdueIndicator,
  getStatusText
} from '@/utils/eventHelpers'

interface EventCardProps {
  event: {
    id: string
    title: string
    description?: string
    notes?: string
    date: Date | string
    endDate?: Date | string
    time: string
    endTime?: string
    location: string
    budget: number
    status: EventStatus
    clientId: string
    clientName?: string
    clientPhone?: string
    assignedFlorists?: Array<{
      floristId: string
      floristName?: string
      isConfirmed: boolean
      role?: string
    }>
    floristsRequired?: number
    invoiced?: boolean
    paid?: boolean
    invoiceDate?: Date
    paidDate?: Date
    completedDate?: Date
    cancelledAt?: Date
    archivedAt?: Date
  }
  view?: 'list' | 'kanban' | 'calendar'
  onClick?: (event: any) => void
  onEdit?: (event: any) => void
  onCancel?: (event: any) => void
  onDelete?: (event: any) => void // Alias pour onCancel
  onCall?: (phone: string) => void
  onEmail?: (email: string) => void
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
  onCancel,
  onDelete,
  onStatusChange,
  onArchiveAndInvoice,
  onPaymentTracking,
  onDragStart,
  onDragEnd,
  isDragging = false,
  className = ''
}) => {
  // Utiliser onDelete comme alias de onCancel si onCancel n'est pas défini
  const handleCancel = onCancel || onDelete
  const [showFirstConfirm, setShowFirstConfirm] = useState(false)
  const [showSecondConfirm, setShowSecondConfirm] = useState(false)
  
  const handleCancelClick = () => {
    setShowFirstConfirm(true)
  }
  
  const handleFirstConfirm = () => {
    setShowFirstConfirm(false)
    setShowSecondConfirm(true)
  }
  
  const handleSecondConfirm = () => {
    setShowSecondConfirm(false)
    if (handleCancel) {
      handleCancel(event)
    }
  }
  
  const handleCancelDialog = () => {
    setShowFirstConfirm(false)
    setShowSecondConfirm(false)
  }
  
  const statusColors = getStatusColors(event)
  const paymentIndicator = getPaymentOverdueIndicator(event)
  
  // BUG #15 FIX: Vérification de la validité de la date avant formatage
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    // Vérifier si la date est valide
    if (!d || isNaN(d.getTime())) {
      return 'Date non définie'
    }
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
    ${statusColors.bgColor} rounded-lg border ${statusColors.borderColor} p-4 shadow-sm
    hover:shadow-md transition-all duration-200 ${statusColors.textColor}
    ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
    ${view === 'kanban' ? 'cursor-move' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  const handleCardClick = (e: React.MouseEvent) => {
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
      data-event-id={event.id}
      draggable={view === 'kanban'}
      onClick={handleCardClick}
      onDragStart={() => onDragStart?.(event)}
      onDragEnd={onDragEnd}
      whileHover={view !== 'kanban' ? { y: -2 } : undefined}
      layout
    >
      {/* Header plus visible */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg ${statusColors.textColor} truncate`}>
            {event.title}
          </h3>
          {event.notes && (
            <p className={`text-sm ${statusColors.textColor} opacity-75 mt-1 line-clamp-2`}>
              {event.notes}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-3">
          {/* Statut plus visible */}
          <div className={`
            px-3 py-2 rounded-lg font-semibold text-sm text-center min-w-[100px]
            ${statusColors.bgColor} ${statusColors.borderColor} border-2
            ${view !== 'kanban' && onStatusChange ? 'cursor-pointer hover:scale-105' : ''}
            transition-all duration-200
          `}
          onClick={onStatusChange && view !== 'kanban' ? () => {
            const statuses = Object.values(EventStatus)
            const currentIndex = statuses.indexOf(event.status)
            const nextStatus = statuses[(currentIndex + 1) % statuses.length]
            onStatusChange(event.id, nextStatus)
          } : undefined}
          >
            {getStatusText(event.status)}
          </div>
          
          {/* Indicateur retard */}
          {paymentIndicator.show && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                px-2 py-1 rounded text-xs font-bold flex items-center space-x-1
                ${paymentIndicator.severity === 'danger' 
                  ? 'bg-red-100 text-red-800 border border-red-300' 
                  : 'bg-orange-100 text-orange-800 border border-orange-300'
                }
                animate-pulse
              `}
            >
              <span>{paymentIndicator.icon}</span>
              <span>{paymentIndicator.text}</span>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Informations détaillées */}
      <div className="space-y-3 mb-4">
        {/* Date et horaires */}
        <div className={`flex items-center text-sm ${statusColors.textColor} opacity-90`}>
          <Calendar className={`w-4 h-4 mr-3 ${statusColors.textColor} opacity-60`} />
          <div className="flex-1">
            <div className="font-medium">{formatDate(event.date)}</div>
            <div className="text-xs opacity-75">
              Début: {event.time}
              {event.endTime && (
                <> • Fin: {event.endTime}</>
              )}
            </div>
          </div>
        </div>
        
        {/* Lieu */}
        <div className={`flex items-center text-sm ${statusColors.textColor} opacity-90`}>
          <MapPin className={`w-4 h-4 mr-3 ${statusColors.textColor} opacity-60`} />
          <span className="truncate font-medium">{event.location}</span>
        </div>
        
        {/* Client */}
        <div className={`flex items-center text-sm ${statusColors.textColor} opacity-90`}>
          <User className={`w-4 h-4 mr-3 ${statusColors.textColor} opacity-60`} />
          <div className="flex-1">
            <div className="font-medium truncate">{event.clientName}</div>
            {event.clientPhone && (
              <div className="text-xs opacity-75">{event.clientPhone}</div>
            )}
          </div>
        </div>
        
        {/* Fleuristes confirmés seulement */}
        {event.assignedFlorists && event.assignedFlorists.filter(f => f.isConfirmed).length > 0 && (
          <div className={`flex items-center text-sm ${statusColors.textColor} opacity-90`}>
            <span className="w-4 h-4 mr-3 text-center">🌸</span>
            <div className="flex-1">
              <div className="font-medium">
                {event.assignedFlorists.filter(f => f.isConfirmed).length} fleuriste{event.assignedFlorists.filter(f => f.isConfirmed).length > 1 ? 's' : ''} confirmé{event.assignedFlorists.filter(f => f.isConfirmed).length > 1 ? 's' : ''}
              </div>
              <div className="text-xs opacity-75">
                {event.assignedFlorists.filter(f => f.isConfirmed).map(f => f.floristName || f.floristId).join(', ')}
              </div>
            </div>
          </div>
        )}
        
        {/* Budget */}
        <div className={`flex items-center text-sm font-semibold ${statusColors.textColor}`}>
          <Euro className={`w-4 h-4 mr-3 ${statusColors.textColor} opacity-60`} />
          <span className="text-base">{formatCurrency(event.budget)}</span>
        </div>
      </div>
      
      {/* Actions */}
      {(onEdit || onCancel || onArchiveAndInvoice || onPaymentTracking) && (
        <div className={`flex items-center justify-between pt-3 border-t ${statusColors.borderColor}`}>
          {/* Boutons de workflow plus grands */}
          <div className="flex items-center space-x-3">
            {event.status === EventStatus.COMPLETED && onArchiveAndInvoice && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Archive className="w-4 h-4" />}
                onClick={() => onArchiveAndInvoice(event)}
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 px-4 py-2"
              >
                Terminer
              </Button>
            )}
            
            {event.status === EventStatus.INVOICED && onPaymentTracking && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<DollarSign className="w-4 h-4" />}
                onClick={() => onPaymentTracking(event)}
                className="text-sm font-semibold bg-purple-600 hover:bg-purple-700 px-4 py-2"
              >
                Facturé
              </Button>
            )}
            
            {event.status === EventStatus.PAID && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Payé</span>
                {event.paidDate && (
                  <span className="text-xs text-green-600">
                    {new Date(event.paidDate).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Actions principales plus grandes */}
          <div className="flex items-center space-x-3">
            {/* Bouton MODIFIER TRÈS VISIBLE */}
            {onEdit && (
              <Button
                variant="primary"
                size="md"
                onClick={() => onEdit(event)}
                leftIcon={<Edit className="w-5 h-5" />}
                className="text-base font-bold bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                Modifier
              </Button>
            )}
            
            {onCancel && (
              <Button
                variant="outline"
                size="md"
                onClick={handleCancelClick}
                className="text-sm font-semibold text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 px-4 py-2"
              >
                Annuler
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Modales de confirmation */}
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
