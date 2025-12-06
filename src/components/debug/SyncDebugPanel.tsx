import React from 'react'
import { useEventSync } from '@/hooks/useEventSync'

// Composant debug pour tester la synchronisation
export const SyncDebugPanel: React.FC<{ eventId?: string }> = ({ eventId }) => {
  const { emitEventSync, getLatestEvent } = useEventSync()
  
  if (!eventId) return null
  
  const testSync = () => {
    const currentEvent = getLatestEvent(eventId)
    if (currentEvent) {
      const testEvent = {
        ...currentEvent,
        title: `${currentEvent.title} [SYNC TEST ${Date.now()}]`,
        updatedAt: new Date()
      }
      emitEventSync(testEvent, 'DebugPanel')
    }
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-lg text-xs z-50">
      <button onClick={testSync} className="bg-blue-600 px-2 py-1 rounded">
        🔄 Test Sync
      </button>
      <div className="mt-1">Event: {eventId.slice(-4)}</div>
    </div>
  )
}

export default SyncDebugPanel