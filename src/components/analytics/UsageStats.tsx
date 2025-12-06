import React from 'react'
import { BarChart3, Users, Calendar, TrendingUp } from 'lucide-react'

const UsageStats: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Statistiques d'Utilisation
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
            247
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Clients actifs
          </p>
        </div>
        
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            89
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Événements ce mois
          </p>
        </div>
        
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            +23%
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Croissance
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Événements terminés
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            156/189
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-primary-500 h-2 rounded-full" style={{ width: '82%' }}></div>
        </div>
      </div>
      
      <p className="text-gray-500 mt-4 text-sm">
        UsageStats component à implémenter complètement
      </p>
    </div>
  )
}

export default UsageStats