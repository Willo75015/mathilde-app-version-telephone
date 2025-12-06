import React from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useBackgroundSync, useOnlineStatus } from '@/hooks/usePWA'

export const SyncStatus: React.FC = () => {
  const { pendingSync } = useBackgroundSync()
  const isOnline = useOnlineStatus()
  
  const hasPendingSync = pendingSync.length > 0
  
  if (!hasPendingSync && isOnline) {
    return null
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-40"
    >
      <div className="flex items-center space-x-2">
        {hasPendingSync ? (
          <>
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Synchronisation...
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {pendingSync.length}
            </span>
          </>
        ) : (
          <>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-orange-500" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default SyncStatus