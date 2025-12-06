import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, Calendar as CalendarIcon, Kanban, Plus, X, MapPin, User, Euro, Archive, DollarSign, Smile, Bell, Edit, Settings, Phone } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

const CalendarPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'calendrier' | 'kanban'>('calendrier')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  
  // Utiliser le state global
  const { state, actions } = useApp()
  const events = state.events

  console.log('📅 CalendarPage - Événements depuis state global:', {
    count: events.length,
    source: 'AppContext'
  })

  // ✨ FONCTION PRINCIPALE : Calcul automatique du statut selon les fleuristes assignés
  const getActualEventStatus = (event: any) => {
    // Si l'événement est terminé ou annulé, garder le statut original
    if (event.status === 'completed' || event.status === 'cancelled') {
      return event.status
    }
    
    // Si pas de fleuristes requis, utiliser le statut original
    if (!event.floristsRequired || event.floristsRequired === 0) {
      return event.status
    }
    
    // Calculer le nombre de fleuristes assignés et confirmés
    const assignedCount = event.assignedFlorists?.length || 0
    const confirmedCount = event.assignedFlorists?.filter((f: any) => f.isConfirmed && f.status === 'confirmed').length || 0
    
    // LOGIQUE AUTOMATIQUE DU STATUT :
    if (confirmedCount >= event.floristsRequired) {
      // Tous les fleuristes nécessaires sont confirmés → CONFIRMÉ
      return 'confirmed'
    } else if (assignedCount >= event.floristsRequired) {
      // Assez de fleuristes assignés mais pas tous confirmés → EN COURS
      return 'in_progress'
    } else {
      // Pas assez de fleuristes → BROUILLON
      return 'draft'
    }
  }

  // ✨ NOUVELLE FONCTION : Changer le statut d'un événement selon la logique métier
  const changeEventStatus = (eventId: string, newStatus: string) => {
    const event = events.find((e: any) => e.id === eventId)
    if (!event) return

    console.log('🔄 Changement de statut demandé:', { eventId, newStatus, event: event.title })

    // Vérifications selon la logique métier
    if (newStatus === 'confirmed') {
      // Pour passer en confirmé, il faut que tous les fleuristes soient assignés ET confirmés
      const requiredFlorists = event.floristsRequired || 0
      const confirmedFlorists = event.assignedFlorists?.filter((f: any) => f.isConfirmed && f.status === 'confirmed').length || 0
      
      if (requiredFlorists > 0 && confirmedFlorists < requiredFlorists) {
        showNotificationMessage(`❌ Impossible de confirmer : ${confirmedFlorists}/${requiredFlorists} fleuristes confirmés. Assignez d'abord tous les fleuristes nécessaires.`)
        return
      }
    }

    if (newStatus === 'in_progress') {
      // Pour passer en cours, il faut au moins avoir assigné les fleuristes (même s'ils ne sont pas encore confirmés)
      const requiredFlorists = event.floristsRequired || 0
      const assignedFlorists = event.assignedFlorists?.length || 0
      
      if (requiredFlorists > 0 && assignedFlorists < requiredFlorists) {
        showNotificationMessage(`❌ Impossible de passer en cours : ${assignedFlorists}/${requiredFlorists} fleuristes assignés. Assignez d'abord des fleuristes.`)
        return
      }
    }

    // Appliquer le changement via le contexte global
    actions.updateEvent(eventId, { status: newStatus })
    
    // Message de confirmation
    const statusLabels: Record<string, string> = {
      'draft': 'brouillon',
      'confirmed': 'confirmé',
      'in_progress': 'en cours',
      'completed': 'terminé',
      'cancelled': 'annulé'
    }
    
    showNotificationMessage(`✅ Événement "${event.title}" passé en ${statusLabels[newStatus]}`)
  }

  // ✨ FONCTION UTILITAIRE : Afficher les messages de notification
  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  // Vue Kanban avec logique automatique des fleuristes
  const renderKanbanView = () => {
    const kanbanColumns = [
      { id: 'draft', title: '📝 À Planifier', status: 'draft', bgColor: 'bg-gray-50', headerColor: 'bg-gray-100' },
      { id: 'in_progress', title: '⏳ En Cours', status: 'in_progress', bgColor: 'bg-blue-50', headerColor: 'bg-blue-100' },
      { id: 'confirmed', title: '✅ Confirmé', status: 'confirmed', bgColor: 'bg-yellow-50', headerColor: 'bg-yellow-100' },
      { id: 'completed', title: '🎉 Terminé', status: 'completed', bgColor: 'bg-green-50', headerColor: 'bg-green-100' }
    ]

    return (
      <div className="space-y-6">
        {/* Panneau d'explication */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                🎯 Logique automatique du statut selon les fleuristes
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li><strong>📝 À Planifier :</strong> Fleuristes manquants</li>
                <li><strong>⏳ En Cours :</strong> Fleuristes assignés mais non confirmés</li>
                <li><strong>✅ Confirmé :</strong> TOUS les fleuristes nécessaires confirmés</li>
                <li><strong>🎉 Terminé :</strong> Événement accompli, prêt à facturer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kanbanColumns.map(column => {
            // ✨ CORRECTION : Utiliser le statut automatique au lieu du statut stocké
            const columnEvents = events.filter((e: any) => getActualEventStatus(e) === column.status)
            
            return (
              <div
                key={column.id}
                className={`${column.bgColor} rounded-xl p-4 min-h-[400px] border-2 border-gray-200`}
              >
                <div className={`${column.headerColor} rounded-lg p-3 mb-4 flex items-center justify-between`}>
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="bg-white text-gray-700 text-sm px-2 py-1 rounded-full font-medium">
                    {columnEvents.length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {columnEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-xl p-4 border-l-4 border-primary-500 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <h4 className="font-bold text-gray-900 text-base leading-tight mb-3">
                        {event.title}
                      </h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          <div>📅 {new Date(event.date).toLocaleDateString('fr-FR')}</div>
                          <div>⏰ {event.time}</div>
                          <div>💰 {event.budget?.toLocaleString('fr-FR') || 0}€</div>
                          <div>👤 {event.clientName}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {getActualEventStatus(event) !== 'confirmed' && (
                          <button
                            onClick={() => changeEventStatus(event.id, 'confirmed')}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                          >
                            ✅ Confirmer
                          </button>
                        )}
                        {getActualEventStatus(event) !== 'completed' && (
                          <button
                            onClick={() => changeEventStatus(event.id, 'completed')}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                          >
                            🎉 Terminer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Calendrier - Gestion par Fleuristes
        </h1>
        
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setViewMode('calendrier')}
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'calendrier' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            📅 Calendrier
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            📋 Kanban
          </button>
        </div>

        {viewMode === 'calendrier' ? (
          <div className="bg-white rounded-lg p-4 border">
            <h2 className="text-lg font-medium mb-4">Vue Calendrier</h2>
            <p className="mb-4">Événements: {events.length} (statut automatique selon fleuristes)</p>
            <div className="grid grid-cols-7 gap-2 mt-4">
              {/* En-têtes des jours */}
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="h-8 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{day}</span>
                </div>
              ))}
              
              {/* Cases du calendrier */}
              {Array.from({length: 31}, (_, i) => {
                const day = i + 1
                const dayEvents = events.filter((e: any) => {
                  const eventDate = new Date(e.date)
                  return eventDate.getDate() === day
                })
                
                return (
                  <div key={i} className="h-20 border border-gray-200 p-1 relative hover:bg-gray-50 cursor-pointer">
                    <span className="text-sm font-medium">{day}</span>
                    
                    {/* Indicateurs d'événements avec statut automatique */}
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event: any, idx: number) => {
                        const status = getActualEventStatus(event)
                        const statusColor = status === 'draft' ? 'bg-gray-400' :
                                           status === 'confirmed' ? 'bg-yellow-400' :
                                           status === 'in_progress' ? 'bg-blue-400' :
                                           status === 'completed' ? 'bg-green-400' :
                                           'bg-gray-400'
                        
                        return (
                          <div 
                            key={idx} 
                            className={`h-1 ${statusColor} rounded-full`}
                            title={`${event.title} - ${status}`}
                          />
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          renderKanbanView()
        )}
      </div>
      
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarPage
