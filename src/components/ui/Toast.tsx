import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  const toastVariants = {
    hidden: { 
      opacity: 0, 
      y: -50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: -50,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  const getToastStyles = () => {
    if (type === 'success') {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />
      }
    } else {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: <XCircle className="w-5 h-5 text-red-500" />
      }
    }
  }

  const styles = getToastStyles()

  return (
    <motion.div
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`
        fixed top-4 right-4 z-[60] 
        ${styles.bg} 
        border rounded-lg shadow-lg 
        p-4 min-w-[300px] max-w-[400px]
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${styles.text}`}>
            {message}
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default Toast
