import React, { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  animation?: MotionProps
  href?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  animation,
  href,
  onAnimationStart,
  onDrag,
  onDragEnd,
  onDragStart,
  ...props
}, ref) => {
  const shouldReduceMotion = useReducedMotion()
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95'
  ]
  
  const variants = {
    primary: [
      'bg-primary-500 hover:bg-primary-600 text-white',
      'focus:ring-primary-500 dark:focus:ring-primary-400',
      'shadow-lg hover:shadow-xl'
    ],
    secondary: [
      'bg-gray-100 hover:bg-gray-200 text-gray-900',
      'dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100',
      'focus:ring-gray-500'
    ],
    outline: [
      'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
      'dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-gray-900',
      'focus:ring-primary-500'
    ],
    ghost: [
      'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
      'focus:ring-gray-500'
    ],
    danger: [
      'bg-red-500 hover:bg-red-600 text-white',
      'focus:ring-red-500 shadow-lg hover:shadow-xl'
    ]
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )
  
  // Animations réduites sur mobile pour de meilleures performances
  const defaultAnimation: MotionProps = shouldReduceMotion ? {} : {
    whileHover: { scale: disabled ? 1 : 1.02 },
    whileTap: { scale: disabled ? 1 : 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }

  const content = (
    <>
      {isLoading ? (
        <Loader2 className={clsx(iconSizes[size], 'animate-spin')} />
      ) : leftIcon ? (
        <span className={iconSizes[size]}>{leftIcon}</span>
      ) : null}

      {children}

      {rightIcon && !isLoading && (
        <span className={iconSizes[size]}>{rightIcon}</span>
      )}
    </>
  )

  // Si href est fourni, rendre un lien <a>
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(disabled && { 'aria-disabled': true, tabIndex: -1 })}
      >
        {content}
      </a>
    )
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      className={classes}
      disabled={disabled || isLoading}
      {...defaultAnimation}
      {...animation}
      {...props}
    >
      {content}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button