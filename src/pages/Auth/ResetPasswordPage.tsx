import React, { useState } from 'react'
import { Flower, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface ResetPasswordPageProps {
  onUpdatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  onBackToLogin: () => void
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onUpdatePassword, onBackToLogin }) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    const result = await onUpdatePassword(password)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Erreur lors de la mise à jour')
    }

    setLoading(false)
  }

  // Succès
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Flower className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Mathilde Fleurs</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Mot de passe mis à jour !
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Flower className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mathilde Fleurs</h1>
          <p className="text-gray-600 mt-2">Nouveau mot de passe</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>

            {/* Retour */}
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full text-gray-600 font-medium text-sm py-2"
            >
              Retour à la connexion
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
