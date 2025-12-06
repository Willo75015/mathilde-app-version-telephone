import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import Button from '@/components/ui/Button'

export const UpdatePrompt: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Nouvelle version disponible
        setShowUpdate(true)
      })
      
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Vérifier s'il y a une mise à jour en attente
        if (reg.waiting) {
          setShowUpdate(true)
        }
      })
    }
  }, [])
  
  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setShowUpdate(false)
      // Recharger la page pour appliquer la mise à jour
      window.location.reload()
    }
  }
  
  const handleDismiss = () => {
    setShowUpdate(false)
  }
  
  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Mise à jour disponible
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Une nouvelle version de l'application est prête
                </p>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-blue-400 hover:text-blue-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Mettre à jour
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-blue-700 dark:text-blue-300"
              >
                Plus tard
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UpdatePrompt