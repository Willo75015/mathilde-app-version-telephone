import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Event } from '@/types'
import EventCard from './EventCard'
import { clsx } from 'clsx'

interface EventListProps {
  events: Event[]
  isLoading?: boolean
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onCall?: (phone: string) => void
  onEmail?: (email: string) => void
  onArchiveAndInvoice?: (event: Event) => void
  onPaymentTracking?: (event: Event) => void
  className?: string
  emptyMessage?: string
}

const EventList: React.FC<EventListProps> = ({ 
  events, 
  isLoading = false,
  onEdit,
  onDelete,
  onCall,
  onEmail,
  onArchiveAndInvoice,
  onPaymentTracking,
  className = '',
  emptyMessage = "Aucun événement trouvé"
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  }
  
  // Gestion du loading
  if (isLoading) {
    return (
      <div className={clsx('space-y-2 sm:space-y-3', className)}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 animate-pulse"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="space-y-1">
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-12 h-3 bg-gray-300 dark:bg-gray-600 rounded ml-auto"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-1">
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Gestion de l'état vide
  if (!events || events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={clsx(
          'text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
          className
        )}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Créez votre premier événement pour commencer à organiser vos commandes florales.
        </p>
      </motion.div>
    )
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={clsx('space-y-2 sm:space-y-3', className)}
    >
      <AnimatePresence mode="popLayout">
        {events.map((event) => (
          <motion.div
            key={event.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="group"
          >
            <EventCard
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              onCall={onCall}
              onEmail={onEmail}
              onArchiveAndInvoice={onArchiveAndInvoice}
              onPaymentTracking={onPaymentTracking}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default EventList