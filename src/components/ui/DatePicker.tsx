import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerDay {
  date: Date
  isCurrentMonth: boolean
}

interface DatePickerProps {
  value?: Date
  onChange: (date: Date) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  disabled = false,
  minDate,
  maxDate,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(value || new Date())
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  const getDaysInMonth = (date: Date): DatePickerDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: DatePickerDay[] = []
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i)
      days.push({ date: day, isCurrentMonth: false })
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Jours du mois suivant pour compléter la grille
    const totalCells = Math.ceil(days.length / 7) * 7
    const remainingCells = totalCells - days.length
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const selectDate = (date: Date) => {
    if (minDate && date < minDate) return
    if (maxDate && date > maxDate) return
    
    onChange(date)
    setIsOpen(false)
  }
  
  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }
  
  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
  
  return (
    <div className={clsx('relative', className)}>
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
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
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled}
      >
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </motion.button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={clsx(
            'absolute z-50 mt-1 p-4',
            'bg-white border border-gray-200 rounded-lg shadow-lg',
            'dark:bg-gray-800 dark:border-gray-600'
          )}
        >
          {/* Header avec navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <h3 className="font-medium text-gray-900 dark:text-white capitalize">
              {monthYear}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isSelected = value && day.date.toDateString() === value.toDateString()
              const isToday = day.date.toDateString() === new Date().toDateString()
              const isDisabled = isDateDisabled(day.date)
              
              return (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => day.isCurrentMonth && !isDisabled && selectDate(day.date)}
                  className={clsx(
                    'p-2 text-sm rounded transition-colors',
                    day.isCurrentMonth 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-300 dark:text-gray-600',
                    isSelected && 'bg-primary-500 text-white',
                    isToday && !isSelected && 'bg-primary-100 text-primary-700 dark:bg-primary-900/20',
                    !isSelected && !isToday && 'hover:bg-gray-100 dark:hover:bg-gray-700',
                    isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  disabled={isDisabled || !day.isCurrentMonth}
                >
                  {day.date.getDate()}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default DatePicker