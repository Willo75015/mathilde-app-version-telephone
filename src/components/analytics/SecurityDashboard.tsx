import React from 'react'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

const SecurityDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tableau de Bord Sécurité
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700 dark:text-green-300">
              Chiffrement actif
            </span>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-yellow-700 dark:text-yellow-300">
              3 tentatives suspectes
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Validation des données
          </span>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Rate limiting
          </span>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Audit des événements
          </span>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
      </div>
      
      <p className="text-gray-500 mt-4 text-sm">
        SecurityDashboard component à implémenter complètement
      </p>
    </div>
  )
}

export default SecurityDashboard