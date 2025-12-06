import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface DropdownProps {
  options: Option[]
  value?: string
  placeholder?: string
  onSelect: (value: string) => void
  disabled?: boolean
  className?: string
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Sélectionner...',
  onSelect,
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(option => option.value === value)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSelect = (optionValue: string) => {
    onSelect(optionValue)
    setIsOpen(false)
  }
  
  return (
    <div ref={dropdownRef} className={clsx('relative w-full', className)}>
      <motion.button
        type="button"
        className={clsx(
          'w-full px-3 py-2 text-left border rounded-lg',
          'flex items-center justify-between',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'transition-all duration-200',
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white hover:bg-gray-50 text-gray-900',
          'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={clsx(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'absolute z-50 w-full mt-1',
              'bg-white border border-gray-200 rounded-lg shadow-lg',
              'dark:bg-gray-800 dark:border-gray-600',
              'max-h-60 overflow-auto'
            )}
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                className={clsx(
                  'w-full px-3 py-2 text-left text-sm',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700',
                  'transition-colors duration-150',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  value === option.value && 'bg-primary-50 text-primary-700 dark:bg-primary-900/20'
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
                whileHover={!option.disabled ? { backgroundColor: 'rgba(0,0,0,0.05)' } : {}}
                disabled={option.disabled}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dropdown