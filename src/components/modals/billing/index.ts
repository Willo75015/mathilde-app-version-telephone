// Export des modales de facturation
export { default as ArchiveEventModal } from './ArchiveEventModal'
export { default as PaymentTrackingModal } from './PaymentTrackingModal'

// Types pour les modales
export interface BillingModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export interface PaymentStatus {
  status: 'paid' | 'pending' | 'overdue'
  daysSinceInvoiced: number
  urgencyLevel: 'normal' | 'warning' | 'critical'
}