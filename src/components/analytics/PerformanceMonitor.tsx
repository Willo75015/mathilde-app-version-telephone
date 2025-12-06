import React from 'react'

const PerformanceMonitor: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Monitoring des Performances
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Temps de chargement
          </p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            1.2s
          </p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            Score Performance
          </p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            95/100
          </p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Mémoire utilisée
          </p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            12MB
          </p>
        </div>
      </div>
      <p className="text-gray-500 mt-4">
        PerformanceMonitor component à implémenter complètement
      </p>
    </div>
  )
}

export default PerformanceMonitor