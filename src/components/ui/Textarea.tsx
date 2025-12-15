import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { AlertCircle } from 'lucide-react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'filled'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  label,
  error,
  hint,
  variant = 'default',
  disabled,
  rows = 4,
  ...props
}, ref) => {
  const textareaClasses = clsx(
    'w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'resize-none',
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
    error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
  )

  return (
    <div className="w-full">
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          className={textareaClasses}
          disabled={disabled}
          {...props}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-start pt-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
