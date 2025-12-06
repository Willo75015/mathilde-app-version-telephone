import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  clickable = false,
  onClick
}) => {
  const baseClasses = [
    'rounded-lg transition-all duration-200',
    clickable && 'cursor-pointer'
  ]
  
  const variants = {
    default: [
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700'
    ],
    elevated: [
      'bg-white dark:bg-gray-800',
      'shadow-lg hover:shadow-xl',
      'border border-gray-100 dark:border-gray-700'
    ],
    outlined: [
      'bg-transparent',
      'border-2 border-gray-200 dark:border-gray-700',
      'hover:border-primary-300 dark:hover:border-primary-600'
    ],
    ghost: [
      'bg-gray-50 dark:bg-gray-900/50',
      'border border-transparent',
      'hover:bg-gray-100 dark:hover:bg-gray-800'
    ]
  }
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const classes = clsx(
    baseClasses,
    variants[variant],
    paddings[padding],
    className
  )
  
  const cardProps = {
    className: classes,
    onClick: clickable ? onClick : undefined,
    ...(clickable && {
      whileHover: { scale: 1.02, y: -2 },
      whileTap: { scale: 0.98 },
      transition: { type: "spring", stiffness: 300, damping: 20 }
    })
  }
  
  return (
    <motion.div {...cardProps}>
      {children}
    </motion.div>
  )
}

// Composants sous-éléments pour une structure claire
export const CardHeader: React.FC<{ 
  children: React.ReactNode
  className?: string 
}> = ({ children, className }) => (
  <div className={clsx('border-b border-gray-200 dark:border-gray-700 pb-3 mb-3', className)}>
    {children}
  </div>
)

export const CardTitle: React.FC<{ 
  children: React.ReactNode
  className?: string 
}> = ({ children, className }) => (
  <h3 className={clsx('text-lg font-semibold text-gray-900 dark:text-white', className)}>
    {children}
  </h3>
)

export const CardContent: React.FC<{ 
  children: React.ReactNode
  className?: string 
}> = ({ children, className }) => (
  <div className={clsx('text-gray-600 dark:text-gray-300', className)}>
    {children}
  </div>
)

export const CardFooter: React.FC<{ 
  children: React.ReactNode
  className?: string 
}> = ({ children, className }) => (
  <div className={clsx('border-t border-gray-200 dark:border-gray-700 pt-3 mt-3', className)}>
    {children}
  </div>
)

export default Card