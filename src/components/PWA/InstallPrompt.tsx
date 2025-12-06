import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWA'

export const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWAInstall()
  const [isVisible, setIsVisible] = React.useState(true)
  
  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
    }
  }
  
  const handleDismiss = () => {
    setIsVisible(false)
    // Se souvenir que l'utilisateur a refusé
    localStorage.setItem('pwa-install-dismissed', 'true')
  }
  
  // Ne pas afficher si déjà refusé
  React.useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsVisible(false)
    }
  }, [])
  
  return (
    <AnimatePresence>
      {isInstallable && isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Installer Mathilde Fleurs
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Accédez rapidement à l'app depuis votre écran d'accueil
                </p>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstall}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Installer</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDismiss}
                className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Plus tard
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InstallPrompt