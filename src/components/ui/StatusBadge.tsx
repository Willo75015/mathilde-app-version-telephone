import React from 'react'
import { motion } from 'framer-motion'
import { EventStatus, getKanbanColumn } from '@/types'
import Badge from '@/components/ui/Badge'

interface StatusBadgeProps {
  status: EventStatus
  showIcon?: boolean
  showEmoji?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  onClick?: () => void
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = false,
  showEmoji = true,
  size = 'md',
  animated = true,
  onClick,
  className = ''
}) => {
  const column = getKanbanColumn(status)
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', 
    lg: 'px-4 py-2 text-base'
  }
  
  const badgeClasses = `
    inline-flex items-center gap-1.5 font-medium rounded-full
    ${column.bgColor} ${column.textColor} 
    border border-current border-opacity-20
    ${sizeClasses[size]}
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `
  
  const content = (
    <>
      {showEmoji && <span>{column.emoji}</span>}
      {showIcon && <span className={column.iconColor}>●</span>}
      <span>{column.title}</span>
    </>
  )
  
  if (animated && onClick) {
    return (
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={badgeClasses}
        onClick={onClick}
      >
        {content}
      </motion.span>
    )
  }
  
  return (
    <span className={badgeClasses} onClick={onClick}>
      {content}
    </span>
  )
}

// Hook pour calculer les compteurs par statut
export const useStatusCounts = (events: any[]) => {
  return React.useMemo(() => {
    const counts = {
      [EventStatus.DRAFT]: 0,
      [EventStatus.CONFIRMED]: 0,
      [EventStatus.IN_PROGRESS]: 0,
      [EventStatus.COMPLETED]: 0,
      [EventStatus.INVOICED]: 0,     // 🆕 Ajouté
      [EventStatus.PAID]: 0,         // 🆕 Ajouté
      [EventStatus.CANCELLED]: 0
    }
    
    events.forEach(event => {
      if (counts[event.status] !== undefined) {
        counts[event.status]++
      }
    })
    
    return counts
  }, [events])
}

export default StatusBadge
