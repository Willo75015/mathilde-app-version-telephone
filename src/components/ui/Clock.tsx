import React from 'react'
import { Clock as ClockIcon } from 'lucide-react'
import { useTime } from '@/contexts/TimeContext'

interface ClockProps {
  format?: 'full' | 'time' | 'date' | 'datetime'
  showIcon?: boolean
}

export const Clock: React.FC<ClockProps> = ({ 
  format = 'time', 
  showIcon = true
}) => {
  const { formatTime, formatDate, formatDateTime } = useTime()
  
  const getDisplayText = () => {
    switch (format) {
      case 'full':
        return formatDateTime()
      case 'date':
        return formatDate()
      case 'datetime':
        return { time: formatTime(), date: formatDate() }
      case 'time':
      default:
        return formatTime()
    }
  }
  
  const displayText = getDisplayText()
  
  if (format === 'datetime' && typeof displayText === 'object') {
    return (
      <div className="flex flex-col items-end text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2 mb-1">
          {showIcon && <ClockIcon className="w-4 h-4" />}
          <span className="font-mono text-sm font-medium">
            {displayText.time}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {displayText.date}
        </span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
      {showIcon && <ClockIcon className="w-4 h-4" />}
      <span className="font-mono text-sm">
        {displayText as string}
      </span>
    </div>
  )
}
