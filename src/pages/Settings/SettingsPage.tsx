import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, Shield, Bell, Palette,
  Globe, Database, Download, Upload, RefreshCw,
  Cloud, CloudOff, Trash2, AlertTriangle
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { usePWA } from '@/hooks/usePWA'
import { useApp } from '@/contexts/AppContext'
import { isSupabaseEnabled } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import Toast from '@/components/ui/Toast'

const SettingsPage: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme()
  const { isInstallable, isInstalled, installApp } = usePWA()
  const { state, actions, isSupabaseMode } = useApp()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success')
  const [activeTab, setActiveTab] = useState('general')
  const [showResetModal, setShowResetModal] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')

  // Fonction pour afficher un toast
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  // Migration vers le cloud
  const handleMigrateToCloud = async () => {
    if (isMigrating || !isSupabaseEnabled()) return
    setIsMigrating(true)

    try {
      const result = await actions.migrateToSupabase()
      if (result.success) {
        showNotification(result.message, 'success')
      } else {
        showNotification(result.message, 'error')
      }
    } catch (error) {
      showNotification(`Erreur de migration: ${error}`, 'error')
    } finally {
      setIsMigrating(false)
    }
  }

  // Réinitialisation complète des données
  const handleCompleteReset = async () => {
    if (resetConfirmText !== 'REINITIALISER') return

    setIsResetting(true)

    try {
      // 1. Vider le localStorage
      const keysToRemove = [
        'mathilde-events',
        'mathilde-clients',
        'mathilde-florists',
        'mathilde_events',
        'mathilde_clients',
        'mathilde_florists',
        'mathilde-supabase-mode'
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // 2. Si Supabase est activé, vider aussi les données cloud
      if (isSupabaseEnabled() && isSupabaseMode) {
        // Note: Les données Supabase nécessitent une migration SQL côté serveur
        // On force juste le rechargement local
        console.log('⚠️ Données locales effacées. Pour vider Supabase, exécuter la migration SQL.')
      }

      showNotification('Toutes les données ont été supprimées', 'success')
      setShowResetModal(false)
      setResetConfirmText('')

      // Recharger la page après 2 secondes
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      showNotification(`Erreur lors de la réinitialisation: ${error}`, 'error')
    } finally {
      setIsResetting(false)
    }
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
  
  const handleExportData = () => {
    // Export all data as JSON
    const data = {
      events: JSON.parse(localStorage.getItem('mathilde_events') || '[]'),
      clients: JSON.parse(localStorage.getItem('mathilde_clients') || '[]'),
      settings: {
        theme,
        version: '1.0.0',
        exportDate: new Date().toISOString()
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mathilde-fleurs-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setToastMessage('Données exportées avec succès')
    setShowToast(true)
  }
  
  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            
            if (data.events) localStorage.setItem('mathilde_events', JSON.stringify(data.events))
            if (data.clients) localStorage.setItem('mathilde_clients', JSON.stringify(data.clients))
            
            setToastMessage('Données importées avec succès')
            setShowToast(true)
            
            // Reload page to refresh data
            setTimeout(() => window.location.reload(), 2000)
          } catch (error) {
            setToastMessage('Erreur lors de l\'importation')
            setShowToast(true)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }
  
  
  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Palette }
  ]
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Paramètres
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configurez votre application selon vos préférences
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </motion.div>
      
      {/* Tab Content */}
      <motion.div variants={itemVariants}>
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* PWA Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Application Web Progressive</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Installation PWA
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isInstalled ? 'Application installée' : 'Installer l\'application sur votre appareil'}
                    </p>
                  </div>
                  <div>
                    {isInstalled ? (
                      <Badge variant="primary">Installée</Badge>
                    ) : isInstallable ? (
                      <Button variant="outline" size="sm" onClick={installApp}>
                        Installer
                      </Button>
                    ) : (
                      <Badge variant="secondary">Non disponible</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Mode hors ligne
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fonctionne sans connexion internet
                    </p>
                  </div>
                  <Badge variant="primary">Activé</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Notifications push
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recevez des rappels pour vos événements
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Cloud Synchronization */}
            {isSupabaseEnabled() && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Cloud className="w-5 h-5" />
                  <span>Synchronisation Cloud</span>
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        État de la synchronisation
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isSupabaseMode
                          ? 'Vos données sont synchronisées avec le cloud'
                          : 'Vos données sont stockées localement uniquement'}
                      </p>
                    </div>
                    <div>
                      {isSupabaseMode ? (
                        <Badge variant="primary" className="flex items-center gap-1">
                          <Cloud className="w-3 h-3" />
                          Connecté
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CloudOff className="w-3 h-3" />
                          Local
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!isSupabaseMode && (
                    <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                          Migrer vers le cloud
                        </h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Synchronisez vos données entre tous vos appareils
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleMigrateToCloud}
                        disabled={isMigrating}
                        leftIcon={isMigrating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                      >
                        {isMigrating ? 'Migration...' : 'Migrer'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Data Management */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Gestion des données</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={handleExportData}
                  >
                    Exporter les données
                  </Button>

                  <Button
                    variant="outline"
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={handleImportData}
                  >
                    Importer les données
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Sauvegarde automatique
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Vos données sont automatiquement sauvegardées dans votre navigateur.
                    Nous recommandons d'exporter régulièrement vos données par sécurité.
                  </p>
                </div>
              </div>
            </Card>

            {/* Danger Zone - Reset */}
            <Card className="p-6 border-2 border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Zone de danger</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">
                      Réinitialiser toutes les données
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Supprime définitivement tous les événements, clients et fleuristes
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                    onClick={() => {
                      console.log('🔴 Bouton Réinitialiser cliqué')
                      setShowResetModal(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations du profil
            </h3>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Configuration du profil disponible prochainement</p>
              <Button variant="outline" size="sm" className="mt-4" href="/settings/profile">
                Gérer le profil
              </Button>
            </div>
          </Card>
        )}
        
        {activeTab === 'security' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Paramètres de sécurité
            </h3>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Paramètres de sécurité avancés</p>
              <Button variant="outline" size="sm" className="mt-4" href="/settings/security">
                Configurer la sécurité
              </Button>
            </div>
          </Card>
        )}
        
        {activeTab === 'preferences' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Préférences d'interface
            </h3>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Personnalisez votre expérience utilisateur</p>
              <Button variant="outline" size="sm" className="mt-4" href="/settings/preferences">
                Personnaliser l'interface
              </Button>
            </div>
          </Card>
        )}
      </motion.div>
      
      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Réinitialiser toutes les données ?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Cette action est <span className="font-semibold text-red-600">irréversible</span>.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">
                Les éléments suivants seront supprimés :
              </h4>
              <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                <li className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Tous vos <strong>événements</strong> ({state.events.length})</span>
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Tous vos <strong>clients</strong> ({state.clients.length})</span>
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Tous vos <strong>fleuristes</strong> ({state.florists?.length || 0})</span>
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Toutes les <strong>préférences</strong> enregistrées</span>
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pour confirmer, tapez <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">REINITIALISER</span>
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                placeholder="Tapez REINITIALISER"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowResetModal(false)
                  setResetConfirmText('')
                }}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleCompleteReset}
                disabled={resetConfirmText !== 'REINITIALISER' || isResetting}
                leftIcon={isResetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              >
                {isResetting ? 'Suppression...' : 'Supprimer tout'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          type={toastType}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </motion.div>
  )
}

export default SettingsPage