/**
 * Composant SyncStatus
 * Affiche l'état de synchronisation (localStorage ou Supabase)
 * et permet de migrer les données vers Supabase
 */

import React, { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { isSupabaseEnabled } from '@/lib/supabase'
import { CloudIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

export const SyncStatus: React.FC = () => {
  const { state, actions, isSupabaseMode } = useApp()
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{ success: boolean, message: string } | null>(null)

  const handleMigrate = async () => {
    if (isMigrating) return

    setIsMigrating(true)
    setMigrationResult(null)

    try {
      const result = await actions.migrateToSupabase()
      setMigrationResult(result)
    } catch (error) {
      setMigrationResult({ success: false, message: `Erreur: ${error}` })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleRefresh = async () => {
    await actions.refreshFromSupabase()
  }

  const supabaseConfigured = isSupabaseEnabled()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <CloudIcon className="h-5 w-5 text-gray-500" />
          Synchronisation des données
        </h3>
        {isSupabaseMode && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Sync Cloud
          </span>
        )}
        {!isSupabaseMode && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
            Local
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* État actuel */}
        <div className="text-sm text-gray-600">
          {isSupabaseMode ? (
            <p>
              Vos données sont synchronisées en temps réel via Supabase.
              Les modifications sur un appareil apparaissent instantanément sur les autres.
            </p>
          ) : (
            <p>
              Vos données sont stockées localement sur cet appareil.
              {supabaseConfigured
                ? ' Migrez vers le cloud pour synchroniser entre vos appareils.'
                : ' Configurez Supabase pour activer la synchronisation cloud.'}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-gray-500">
          <span>{state.events.length} événements</span>
          <span>{state.clients.length} clients</span>
          <span>{state.florists.length} fleuristes</span>
        </div>

        {/* Actions */}
        {supabaseConfigured && !isSupabaseMode && (
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            {isMigrating ? 'Migration en cours...' : 'Migrer vers le cloud'}
          </button>
        )}

        {isSupabaseMode && (
          <button
            onClick={handleRefresh}
            disabled={state.isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 transition-colors"
          >
            {state.isLoading ? 'Rafraîchissement...' : 'Rafraîchir depuis le cloud'}
          </button>
        )}

        {/* Résultat migration */}
        {migrationResult && (
          <div className={`p-3 rounded-lg text-sm ${migrationResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
            {migrationResult.message}
          </div>
        )}

        {!supabaseConfigured && (
          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            Pour activer la synchronisation cloud, configurez les variables d'environnement Supabase :
            <code className="block mt-1 p-2 bg-gray-100 rounded">
              VITE_SUPABASE_URL<br />
              VITE_SUPABASE_ANON_KEY
            </code>
          </div>
        )}
      </div>
    </div>
  )
}

export default SyncStatus
