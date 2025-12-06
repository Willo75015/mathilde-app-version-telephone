import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Save, User, Mail, Phone, MapPin, 
  Camera, Edit, Trash2, Shield, Key
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Toast from '@/components/ui/Toast'
import Modal from '@/components/ui/Modal'

const ProfileSettings: React.FC = () => {
  const [profileData, setProfileData] = useState({
    firstName: 'Mathilde',
    lastName: 'Dupont',
    email: 'mathilde@fleurs.com',
    phone: '+33 6 12 34 56 78',
    address: {
      street: '123 Rue des Fleurs',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    bio: 'Fleuriste passionnée depuis 15 ans, spécialisée dans les événements sur mesure.',
    website: 'https://mathilde-fleurs.com'
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
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
  
  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Save profile data
      localStorage.setItem('mathilde_profile', JSON.stringify(profileData))
      
      setToastMessage('Profil mis à jour avec succès')
      setShowToast(true)
      setIsEditing(false)
    } catch (error) {
      setToastMessage('Erreur lors de la sauvegarde')
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCancel = () => {
    // Reset to saved data
    const savedData = localStorage.getItem('mathilde_profile')
    if (savedData) {
      setProfileData(JSON.parse(savedData))
    }
    setIsEditing(false)
  }
  
  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      // Clear all user data
      localStorage.clear()
      
      setToastMessage('Compte supprimé avec succès')
      setShowToast(true)
      
      // Redirect to login or home
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      setToastMessage('Erreur lors de la suppression')
      setShowToast(true)
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
    }
  }
  
  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // In a real app, upload to server
        setToastMessage('Photo de profil mise à jour')
        setShowToast(true)
      }
    }
    input.click()
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
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
              Profil utilisateur
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos informations personnelles
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                isLoading={isLoading}
              >
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </Button>
          )}
        </div>
      </motion.div>
      
      {/* Profile Picture */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Photo de profil
          </h3>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
              {isEditing && (
                <button
                  onClick={handleImageUpload}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {profileData.firstName} {profileData.lastName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profileData.email}
              </p>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleImageUpload}
                >
                  Changer la photo
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Personal Information */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={profileData.firstName}
              onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
              disabled={!isEditing}
              leftIcon={<User className="w-4 h-4" />}
            />
            
            <Input
              label="Nom"
              value={profileData.lastName}
              onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
              disabled={!isEditing}
              leftIcon={<User className="w-4 h-4" />}
            />
            
            <Input
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            
            <Input
              label="Téléphone"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>
        </Card>
      </motion.div>
      
      {/* Address */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Adresse</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Rue"
                value={profileData.address.street}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value }
                }))}
                disabled={!isEditing}
              />
            </div>
            
            <Input
              label="Ville"
              value={profileData.address.city}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                address: { ...prev.address, city: e.target.value }
              }))}
              disabled={!isEditing}
            />
            
            <Input
              label="Code postal"
              value={profileData.address.postalCode}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                address: { ...prev.address, postalCode: e.target.value }
              }))}
              disabled={!isEditing}
            />
            
            <Input
              label="Pays"
              value={profileData.address.country}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                address: { ...prev.address, country: e.target.value }
              }))}
              disabled={!isEditing}
            />
          </div>
        </Card>
      </motion.div>
      
      {/* Additional Info */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations complémentaires
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Biographie
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                placeholder="Décrivez votre expertise..."
              />
            </div>
            
            <Input
              label="Site web"
              value={profileData.website}
              onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
              disabled={!isEditing}
              placeholder="https://votre-site.com"
            />
          </div>
        </Card>
      </motion.div>
      
      {/* Security Actions */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Sécurité du compte</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              leftIcon={<Key className="w-4 h-4" />}
              href="/settings/security"
            >
              Changer le mot de passe
            </Button>
            
            <Button
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeleteModal(true)}
            >
              Supprimer le compte
            </Button>
          </div>
        </Card>
      </motion.div>
      
      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le compte"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              ⚠️ Action irréversible
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              La suppression de votre compte entraînera la perte définitive de toutes vos données :
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 mt-2 list-disc list-inside">
              <li>Tous vos événements</li>
              <li>Votre carnet de clients</li>
              <li>Vos paramètres et préférences</li>
              <li>Votre historique d'activité</li>
            </ul>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Cette action ne peut pas être annulée. Êtes-vous absolument certain de vouloir supprimer votre compte ?
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={isLoading}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
      
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

export default ProfileSettings