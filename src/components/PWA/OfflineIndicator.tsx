import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/usePWA'

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus()
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false)
  
  React.useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true)
    } else {
      // Montrer brièvement le message de reconnexion
      if (showOfflineMessage) {
        const timer = setTimeout(() => setShowOfflineMessage(false), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [isOnline, showOfflineMessage])
  
  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-4 right-4 z-50"
        >
          <div className={`
            ${isOnline 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-orange-50 border-orange-200 text-orange-800'
            } border rounded-lg p-3 shadow-lg backdrop-blur-sm
          `}>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-orange-500" />
              )}
              
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isOnline ? 'Connexion rétablie' : 'Mode hors ligne'}
                </p>
                <p className="text-xs opacity-75">
                  {isOnline 
                    ? 'Synchronisation en cours...' 
                    : 'Vos données seront synchronisées automatiquement'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineIndicator