import React from 'react'
import { motion } from 'framer-motion'

interface HomeProps {
  navigate?: (page: string, params?: any) => void
}

const Home: React.FC<HomeProps> = ({ navigate }) => {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🌸 Mathilde Fleurs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Tableau de bord simplifié - Version de debug
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => {
              console.log('🎯 Navigation vers clients')
              if (navigate) {
                navigate('clients')
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium">Clients</div>
          </button>
          
          <button
            onClick={() => {
              console.log('🎯 Navigation vers événements')
              if (navigate) {
                navigate('events')
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">🎉</div>
            <div className="font-medium">Événements</div>
          </button>
          
          <button
            onClick={() => {
              console.log('🎯 Navigation vers calendrier')
              if (navigate) {
                navigate('calendar')
              }
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-medium">Calendrier</div>
          </button>
          
          <button
            onClick={() => {
              console.log('🎯 Navigation vers analytics')
              if (navigate) {
                navigate('analytics')
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Statistiques</div>
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ Version simplifiée pour debug - Le dashboard complet sera restauré après correction
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Home
