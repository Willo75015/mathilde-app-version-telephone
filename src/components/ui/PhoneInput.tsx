import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  label?: string
  required?: boolean
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  className,
  error,
  placeholder = "01-23-45-67-89",
  disabled = false,
  label,
  required = false
}) => {
  const [displayValue, setDisplayValue] = useState('')

  // Formater le numéro avec des traits d'union
  const formatPhoneNumber = (phoneNumber: string) => {
    // Enlever tous les caractères non-numériques
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    
    // Limiter à 10 chiffres
    const limitedNumber = cleanNumber.slice(0, 10)
    
    // Ajouter les traits d'union automatiquement
    if (limitedNumber.length <= 2) {
      return limitedNumber
    } else if (limitedNumber.length <= 4) {
      return `${limitedNumber.slice(0, 2)}-${limitedNumber.slice(2)}`
    } else if (limitedNumber.length <= 6) {
      return `${limitedNumber.slice(0, 2)}-${limitedNumber.slice(2, 4)}-${limitedNumber.slice(4)}`
    } else if (limitedNumber.length <= 8) {
      return `${limitedNumber.slice(0, 2)}-${limitedNumber.slice(2, 4)}-${limitedNumber.slice(4, 6)}-${limitedNumber.slice(6)}`
    } else {
      return `${limitedNumber.slice(0, 2)}-${limitedNumber.slice(2, 4)}-${limitedNumber.slice(4, 6)}-${limitedNumber.slice(6, 8)}-${limitedNumber.slice(8)}`
    }
  }

  // Mettre à jour l'affichage quand la valeur change
  useEffect(() => {
    if (value) {
      setDisplayValue(formatPhoneNumber(value))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Enlever les traits d'union pour obtenir juste les chiffres
    const cleanNumber = inputValue.replace(/\D/g, '')
    
    // Formater avec les traits d'union
    const formattedNumber = formatPhoneNumber(cleanNumber)
    
    // Mettre à jour l'affichage
    setDisplayValue(formattedNumber)
    
    // Retourner juste les chiffres à la fonction onChange
    onChange(cleanNumber)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Permettre les touches de navigation et suppression
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]
    
    // Permettre Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return
    }
    
    // Permettre les chiffres
    if (e.key >= '0' && e.key <= '9') {
      return
    }
    
    // Bloquer tout le reste sauf les touches autorisées
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <div className={clsx("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        required={required}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={clsx(
          'w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'font-mono tracking-wider', // Police monospace pour un meilleur alignement
          error 
            ? 'border-red-300 text-red-900 bg-red-50 focus:ring-red-500' 
            : 'border-gray-300 text-gray-900 bg-white focus:ring-primary-500',
          'dark:bg-gray-700 dark:border-gray-600 dark:text-white',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={14} // 10 chiffres + 4 traits d'union
      />
      
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Format automatique : {placeholder}
      </p>
    </div>
  )
}

export default PhoneInput
