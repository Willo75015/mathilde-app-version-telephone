import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Shield, Key, Eye, EyeOff, AlertTriangle,
  Clock, Activity, Lock, Unlock, Database, CheckCircle2
} from 'lucide-react'
import { SecurityManager, SecurityAuditor, RateLimiter } from '@/utils/security'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Toast from '@/components/ui/Toast'

const SecuritySettings: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [isLoading, setIsLoading] = useState(false)
  const [securityStats, setSecurityStats] = useState<any>({})
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  
  // Initialize security components
  const securityManager = SecurityManager.getInstance()
  const securityAuditor = SecurityAuditor.getInstance()
  const rateLimiter = new RateLimiter()
  
  useEffect(() => {
    // Load security statistics
    const stats = securityAuditor.getSecurityStats()
    setSecurityStats(stats)
    
    // Load recent audit logs
    const logs = securityAuditor.getRecentAudits(10)
    setAuditLogs(logs)
  }, [])
  
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
  
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    }
  }
  
  const passwordValidation = validatePassword(newPassword)
  
  const handlePasswordChange = async () => {
    if (!passwordValidation.isValid) {
      setToastMessage('Le mot de passe ne respecte pas les critères de sécurité')
      setToastType('error')
      setShowToast(true)
      return
    }
    
    if (newPassword !== confirmPassword) {
      setToastMessage('Les mots de passe ne correspondent pas')
      setToastType('error')
      setShowToast(true)
      return
    }
    
    if (!rateLimiter.isAllowed('password_change')) {
      setToastMessage('Trop de tentatives. Veuillez patienter.')
      setToastType('error')
      setShowToast(true)
      return
    }
    
    setIsLoading(true)
    try {
      // Hash and store new password
      const hashedPassword = securityManager.hash(newPassword)
      localStorage.setItem('user_password_hash', hashedPassword)
      
      // Log security event
      securityAuditor.logSecurityEvent(
        'PASSWORD_CHANGE' as any,
        'MEDIUM' as any,
        'Mot de passe modifié avec succès'
      )
      
      rateLimiter.recordAttempt('password_change')
      
      setToastMessage('Mot de passe modifié avec succès')
      setToastType('success')
      setShowToast(true)
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
    } catch (error) {
      setToastMessage('Erreur lors de la modification du mot de passe')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleClearAuditLogs = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer les logs de sécurité ?')) {
      // Clear audit logs (in a real app, this would be restricted)
      setAuditLogs([])
      setToastMessage('Logs de sécurité effacés')
      setToastType('success')
      setShowToast(true)
    }
  }
  
  const toggleEncryption = () => {
    setEncryptionEnabled(!encryptionEnabled)
    
    if (!encryptionEnabled) {
      securityAuditor.logSecurityEvent(
        'DATA_ACCESS' as any,
        'MEDIUM' as any,
        'Chiffrement des données activé'
      )
    } else {
      securityAuditor.logSecurityEvent(
        'DATA_ACCESS' as any,
        'MEDIUM' as any,
        'Chiffrement des données désactivé'
      )
    }
    
    setToastMessage(`Chiffrement ${!encryptionEnabled ? 'activé' : 'désactivé'}`)
    setToastType('success')
    setShowToast(true)
  }
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
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
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            href="/settings"
          >
            Retour aux paramètres
          </Button>
          
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Sécurité
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez la sécurité de votre compte et de vos données
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Security Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Niveau de sécurité</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">Élevé</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Événements sécurité</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {securityStats.totalEvents || 0}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Chiffrement</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {encryptionEnabled ? 'Actif' : 'Inactif'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
      
      {/* Password Change */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Modifier le mot de passe</span>
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Mot de passe actuel"
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            
            <Input
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            
            {newPassword && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Critères de sécurité
                </h4>
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordValidation.minLength ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Au moins 8 caractères</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordValidation.hasUpper ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Une majuscule</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordValidation.hasLower ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Une minuscule</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordValidation.hasNumber ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Un chiffre</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${passwordValidation.hasSpecial ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Un caractère spécial</span>
                  </div>
                </div>
              </div>
            )}
            
            <Input
              label="Confirmer le mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword && newPassword !== confirmPassword ? 'Les mots de passe ne correspondent pas' : undefined}
            />
            
            <Button
              variant="primary"
              onClick={handlePasswordChange}
              isLoading={isLoading}
              disabled={!passwordValidation.isValid || newPassword !== confirmPassword}
              leftIcon={<Key className="w-4 h-4" />}
            >
              Modifier le mot de passe
            </Button>
          </div>
        </Card>
      </motion.div>
      
      {/* Security Features */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Fonctionnalités de sécurité</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {encryptionEnabled ? <Lock className="w-5 h-5 text-green-500" /> : <Unlock className="w-5 h-5 text-red-500" />}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Chiffrement des données
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chiffre automatiquement vos données sensibles
                  </p>
                </div>
              </div>
              <Button
                variant={encryptionEnabled ? 'outline' : 'primary'}
                size="sm"
                onClick={toggleEncryption}
              >
                {encryptionEnabled ? 'Désactiver' : 'Activer'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Surveillance d'activité
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Surveille les tentatives d'accès suspects
                  </p>
                </div>
              </div>
              <Badge variant="primary">Actif</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Limitation de débit
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protège contre les attaques par force brute
                  </p>
                </div>
              </div>
              <Badge variant="primary">Actif</Badge>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Security Audit Logs */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Journal de sécurité</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAuditLogs}
            >
              Effacer les logs
            </Button>
          </div>
          
          {auditLogs.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {auditLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="outline" 
                      className={getSeverityColor(log.severity)}
                    >
                      {log.severity}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {log.type} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun événement de sécurité récent</p>
            </div>
          )}
        </Card>
      </motion.div>
      
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

export default SecuritySettings