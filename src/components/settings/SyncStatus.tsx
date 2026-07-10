/**
 * Composant SyncStatus
 * Affiche l'état de synchronisation (Supabase, mode full cloud)
 */

import React from 'react'
import { useApp } from '@/contexts/AppContext'
import { isSupabaseEnabled } from '@/lib/supabase'
import { CloudIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export const SyncStatus: React.FC = () => {
  const { state, actions } = useApp()

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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Sync Cloud
        </span>
      </div>

      <div className="space-y-3">
        {/* État actuel */}
        <div className="text-sm text-gray-600">
          <p>
            Vos données sont synchronisées en temps réel via Supabase.
            Les modifications sur un appareil apparaissent instantanément sur les autres.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-gray-500">
          <span>{state.events.length} événements</span>
          <span>{state.clients.length} clients</span>
          <span>{state.florists.length} fleuristes</span>
        </div>

        {/* Actions */}
        <button
          onClick={handleRefresh}
          disabled={state.isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 transition-colors"
        >
          {state.isLoading ? 'Rafraîchissement...' : 'Rafraîchir depuis le cloud'}
        </button>

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
