import React, { useState } from 'react'
import { useApp } from '@/contexts/AppContext'

const CalendarPage: React.FC = () => {
  const { state } = useApp()
  const [viewMode, setViewMode] = useState<'calendrier' | 'kanban'>('calendrier')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Calendrier - Test Minimal
        </h1>
        
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setViewMode('calendrier')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'calendrier' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Calendrier
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Kanban
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          {viewMode === 'calendrier' ? (
            <div>
              <h2 className="text-lg font-medium mb-4">Vue Calendrier</h2>
              <p>Événements: {state.events.length}</p>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {Array.from({length: 31}, (_, i) => (
                  <div key={i} className="h-20 border border-gray-200 p-1">
                    <span className="text-sm">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-medium mb-4">Vue Kanban</h2>
              <p>Mode Kanban - {state.events.length} événements</p>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-100 p-4 rounded">
                  <h3>À Planifier</h3>
                </div>
                <div className="bg-yellow-100 p-4 rounded">
                  <h3>En Cours</h3>
                </div>
                <div className="bg-blue-100 p-4 rounded">
                  <h3>Confirmé</h3>
                </div>
                <div className="bg-green-100 p-4 rounded">
                  <h3>Terminé</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarPage
