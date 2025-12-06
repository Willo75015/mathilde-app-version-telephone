import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Calendar, MapPin, DollarSign, Phone, 
  User, Clock, FileText, Users, Edit
} from 'lucide-react'
import { Event, Client } from '@/types'
import Button from '@/components/ui/Button'

interface EventReadOnlyModalProps {
  event: Event | null
  client?: Client
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

const EventReadOnlyModal: React.FC<EventReadOnlyModalProps> = ({
  event,
  client,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!event) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '📝 Brouillon', color: 'bg-gray-100 text-gray-800' },
      confirmed: { label: '✅ Confirmé', color: 'bg-green-100 text-green-800' },
      in_progress: { label: '🔄 En cours', color: 'bg-blue-100 text-blue-800' },
      completed: { label: '🎉 Terminé', color: 'bg-purple-100 text-purple-800' },
      cancelled: { label: '❌ Annulé', color: 'bg-red-100 text-red-800' }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  }

  const statusBadge = getStatusBadge(event.status)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header coloré et attractif */}
            <div className="relative overflow-hidden">
              {/* Fond dégradé selon le statut */}
              <div className={`p-6 ${
                event.status === 'draft' ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600' :
                event.status === 'confirmed' ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600' :
                event.status === 'in_progress' ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600' :
                event.status === 'completed' ? 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600' :
                'bg-gradient-to-br from-red-400 via-red-500 to-red-600'
              }`}>
                
                {/* Motif décoratif */}
                <div className="absolute top-0 right-0 opacity-10">
                  <div className="text-6xl">🌸</div>
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur rounded-xl flex items-center justify-center">
                      <span className="text-2xl">
                        {event.status === 'draft' ? '📝' :
                         event.status === 'confirmed' ? '✅' :
                         event.status === 'in_progress' ? '🔄' :
                         event.status === 'completed' ? '🎉' : '❌'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                        {event.title}
                      </h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white backdrop-blur">
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    leftIcon={<X className="w-5 h-5" />}
                    onClick={onClose}
                    className="text-white hover:bg-white hover:bg-opacity-20 backdrop-blur border border-white border-opacity-30"
                  />
                </div>
              </div>
            </div>

            {/* Content super coloré et informatif */}
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <div className="space-y-6">
                
                {/* 🗓️ Informations principales - Section Date/Heure */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                  <h3 className="flex items-center space-x-2 text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">
                    <Calendar className="w-6 h-6" />
                    <span>📅 Quand ?</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-100 dark:border-blue-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">📅</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-lg">
                            {formatDate(event.date)}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            Date de l'événement
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-100 dark:border-blue-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-lg">
                            {event.time}{event.endTime && ` - ${event.endTime}`}
                          </div>
                          <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            Horaire prévu
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📍 Section Lieu */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-700">
                  <h3 className="flex items-center space-x-2 text-lg font-bold text-green-800 dark:text-green-300 mb-4">
                    <MapPin className="w-6 h-6" />
                    <span>📍 Où ?</span>
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-green-100 dark:border-green-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🏛️</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-lg">
                          {event.location}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Lieu de l'événement
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 💰 Section Budget */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
                  <h3 className="flex items-center space-x-2 text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-4">
                    <DollarSign className="w-6 h-6" />
                    <span>💰 Budget</span>
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-yellow-100 dark:border-yellow-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">💶</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-2xl">
                          {event.budget.toLocaleString()} €
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                          Budget total alloué
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 👤 Section Client */}
                {client && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
                    <h3 className="flex items-center space-x-2 text-lg font-bold text-purple-800 dark:text-purple-300 mb-4">
                      <User className="w-6 h-6" />
                      <span>👤 Client</span>
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-100 dark:border-purple-700">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">👨‍💼</span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-lg">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                              Client principal
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-100 dark:border-purple-700">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                {client.phone}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg p-3 border border-pink-100 dark:border-pink-700">
                            <div className="flex items-center space-x-2">
                              <span className="text-pink-500">📧</span>
                              <span className="text-sm font-medium text-pink-700 dark:text-pink-300 truncate">
                                {client.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 👥 Section Équipe */}
                {event.assignedFlorists && event.assignedFlorists.length > 0 && (
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-5 border border-teal-200 dark:border-teal-700">
                    <h3 className="flex items-center space-x-2 text-lg font-bold text-teal-800 dark:text-teal-300 mb-4">
                      <Users className="w-6 h-6" />
                      <span>👥 Équipe assignée</span>
                    </h3>
                    <div className="space-y-3">
                      {event.assignedFlorists.map((florist, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-teal-100 dark:border-teal-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">🌸</span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {florist.floristName || `Fleuriste ${florist.floristId}`}
                              </span>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              florist.status === 'confirmed' || florist.isConfirmed 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : florist.status === 'refused' || florist.isRefused
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-orange-100 text-orange-800 border border-orange-200'
                            }`}>
                              {florist.status === 'confirmed' || florist.isConfirmed 
                                ? '✅ Confirmé' 
                                : florist.status === 'refused' || florist.isRefused
                                ? '❌ Refusé'
                                : '⏳ En attente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 📝 Section Description */}
                {event.description && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
                    <h3 className="flex items-center space-x-2 text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-4">
                      <FileText className="w-6 h-6" />
                      <span>📝 Description</span>
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-indigo-100 dark:border-indigo-700">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* 💼 Section Informations métier */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="flex items-center space-x-2 text-lg font-bold text-slate-800 dark:text-slate-300 mb-4">
                    <span className="text-2xl">💼</span>
                    <span>Informations métier</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">📋</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            ID: {event.id.slice(0, 8)}...
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            Identifiant unique
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">📊</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {event.status.toUpperCase()}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            Statut actuel
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">⏰</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {new Date(event.createdAt || event.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            Date de création
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🌸 Section Fleurs (si disponible) */}
                {event.flowers && event.flowers.length > 0 && (
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-5 border border-pink-200 dark:border-pink-700">
                    <h3 className="flex items-center space-x-2 text-lg font-bold text-pink-800 dark:text-pink-300 mb-4">
                      <span className="text-2xl">🌸</span>
                      <span>Fleurs sélectionnées</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {event.flowers.map((flower, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-pink-100 dark:border-pink-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🌺</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {flower.flowerId || `Fleur ${index + 1}`}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                              {flower.quantity || 1}x
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 📱 Section Actions rapides */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-cyan-200 dark:border-cyan-700">
                  <h3 className="flex items-center space-x-2 text-lg font-bold text-cyan-800 dark:text-cyan-300 mb-4">
                    <span className="text-2xl">📱</span>
                    <span>Actions rapides</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-cyan-100 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-white">📞</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">Contacter</div>
                          <div className="text-xs text-cyan-600 dark:text-cyan-400">Appeler le client</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-cyan-100 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-white">📄</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">Exporter</div>
                          <div className="text-xs text-cyan-600 dark:text-cyan-400">Générer PDF</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EventReadOnlyModal
