import React from 'react'

const AppPreferences: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Préférences de l'application
      </h1>
      <p className="text-gray-500">AppPreferences component à implémenter</p>
    </div>
  )
}

export default AppPreferences                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    display: { ...prev.display, compactMode: !prev.display.compactMode }
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.display.compactMode ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    preferences.display.compactMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Animations
                </span>
                <button
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    display: { ...prev.display, animationsEnabled: !prev.display.animationsEnabled }
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.display.animationsEnabled ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    preferences.display.animationsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Language & Region */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Langue et région</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Langue
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Devise
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format de date
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {dateFormats.map(format => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format d'heure
              </label>
              <select
                value={preferences.timeFormat}
                onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value as '12h' | '24h' }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="24h">24 heures (14:30)</option>
                <option value="12h">12 heures (2:30 PM)</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Notifications email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recevez des emails pour les événements importants
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('email')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.notifications.email ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.notifications.email ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Notifications push</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifications en temps réel sur votre appareil
                  </p>
                  {!pushSupported && (
                    <Badge variant="secondary" className="mt-1">Non supporté</Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('push')}
                disabled={!pushSupported}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.notifications.push ? 'bg-primary-500' : 'bg-gray-300'
                } ${!pushSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.notifications.push ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {preferences.notifications.sound ? 
                  <Volume2 className="w-5 h-5 text-purple-500" /> : 
                  <VolumeX className="w-5 h-5 text-gray-500" />
                }
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Sons de notification</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Jouer un son pour les notifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('sound')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.notifications.sound ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.notifications.sound ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Rappels d'événements</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifications automatiques avant vos événements
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('reminders')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.notifications.reminders ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.notifications.reminders ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Privacy */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Confidentialité</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Données d'utilisation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aide à améliorer l'application en partageant des statistiques anonymes
                </p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, usageStats: !prev.privacy.usageStats }
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.privacy.usageStats ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.privacy.usageStats ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Rapports de plantage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Envoie automatiquement les rapports d'erreur pour diagnostics
                </p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, crashReports: !prev.privacy.crashReports }
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.privacy.crashReports ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.privacy.crashReports ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Reset Preferences */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-orange-200 dark:border-orange-800">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Réinitialiser les préférences
          </h3>
          <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
            Remet toutes les préférences à leurs valeurs par défaut
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les préférences ?')) {
                localStorage.removeItem('mathilde_preferences')
                window.location.reload()
              }
            }}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            Réinitialiser
          </Button>
        </Card>
      </motion.div>
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </motion.div>
  )
}

export default AppPreferences