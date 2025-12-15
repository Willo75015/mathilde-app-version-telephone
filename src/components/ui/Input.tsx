import React, { forwardRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled'
  showPasswordToggle?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type,
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  showPasswordToggle = false,
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const inputType = type === 'password' && showPassword ? 'text' : type
  
  const containerClasses = clsx(
    'relative w-full'
  )
  
  const inputClasses = clsx(
    'w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    leftIcon && 'pl-10',
    (rightIcon || showPasswordToggle || error) && 'pr-10',
    {
      // Variant default
      'bg-white border-gray-300 text-gray-900 placeholder-gray-500': variant === 'default' && !error,
      'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400': variant === 'default' && !error,
      
      // Variant filled
      'bg-gray-50 border-transparent text-gray-900 placeholder-gray-500': variant === 'filled' && !error,
      'dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400': variant === 'filled' && !error,
      
      // Error state
      'border-red-300 text-red-900 placeholder-red-300': error,
      'focus:ring-red-500 focus:border-red-500': error,
      'dark:border-red-600 dark:text-red-100': error,
    },
    className
  )
  
  const labelClasses = clsx(
    'block text-sm font-medium mb-1 transition-colors duration-200',
    error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
    isFocused && !error && 'text-primary-600 dark:text-primary-400'
  )
  
  return (
    <div className={containerClasses}>
      {label && (
        <motion.label
          className={labelClasses}
          animate={{ scale: isFocused ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={clsx(
              'w-4 h-4 transition-colors duration-200',
              error ? 'text-red-400' : 'text-gray-400',
              isFocused && !error && 'text-primary-500'
            )}>
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {error && (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          
          {rightIcon && !error && !showPasswordToggle && (
            <span className={clsx(
              'w-4 h-4 transition-colors duration-200',
              isFocused ? 'text-primary-500' : 'text-gray-400'
            )}>
              {rightIcon}
            </span>
          )}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
        
        {hint && !error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

Input.displayName = 'Input'

export default Input