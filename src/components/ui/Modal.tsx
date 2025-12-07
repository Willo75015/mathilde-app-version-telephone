import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft } from 'lucide-react'
import { clsx } from 'clsx'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

// Hook pour détecter mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className
}) => {
  const isMobile = useIsMobile()
  const shouldReduceMotion = useReducedMotion()

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl mx-4'
  }

  // Animations différentes pour mobile vs desktop
  // Version ultra-légère si animations réduites
  const mobileModalVariants = shouldReduceMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  } : {
    hidden: {
      y: '100%',
      opacity: 1
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300
      }
    },
    exit: {
      y: '100%',
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  }

  const desktopModalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        duration: 0.3,
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay - seulement visible sur desktop */}
          {!isMobile && (
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeOnOverlayClick ? onClose : undefined}
            />
          )}

          {/* Modal Container */}
          {isMobile ? (
            // VERSION MOBILE - Plein écran, slide from bottom
            <motion.div
              variants={mobileModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col"
            >
              {/* Header Mobile - Sticky */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 safe-top">
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {title && (
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white text-center flex-1 truncate px-2">
                    {title}
                  </h2>
                )}

                {/* Spacer pour centrer le titre */}
                <div className="w-10" />
              </div>

              {/* Content Mobile - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="p-4 pb-safe">
                  {children}
                </div>
              </div>
            </motion.div>
          ) : (
            // VERSION DESKTOP - Modal centré
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                variants={desktopModalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                className={clsx(
                  'relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl',
                  'border border-gray-200 dark:border-gray-700',
                  'max-h-[90vh] overflow-hidden flex flex-col',
                  sizes[size],
                  className
                )}
              >
                {/* Header Desktop */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    {title && (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                      </h2>
                    )}

                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content Desktop */}
                <div className="p-6 overflow-y-auto flex-1">
                  {children}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
