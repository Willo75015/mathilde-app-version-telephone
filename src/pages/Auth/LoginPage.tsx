import React, { useState } from 'react'
import { Flower, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  onForgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onForgotPassword }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await onLogin(email, password)

    if (!result.success) {
      setError(translateError(result.error || 'Erreur de connexion'))
    }

    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Veuillez entrer votre adresse email')
      return
    }

    setError(null)
    setLoading(true)

    const result = await onForgotPassword(email)

    if (result.success) {
      setResetEmailSent(true)
    } else {
      setError(translateError(result.error || 'Erreur lors de l\'envoi'))
    }

    setLoading(false)
  }

  const translateError = (error: string): string => {
    const translations: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email',
      'User not found': 'Aucun compte trouvé avec cet email',
      'Invalid email': 'Adresse email invalide',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères'
    }
    return translations[error] || error
  }

  // Vue "Mot de passe oublié"
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Flower className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Mathilde Fleurs</h1>
            <p className="text-gray-600 mt-2">Réinitialiser le mot de passe</p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {resetEmailSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Email envoyé !</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Un lien de réinitialisation a été envoyé à <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  Vérifiez votre boîte mail (et les spams)
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmailSent(false)
                  }}
                  className="text-green-600 font-medium text-sm"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </p>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mathilde@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                      required
                      autoComplete="email"
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
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>

                {/* Retour */}
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-gray-600 font-medium text-sm py-2"
                >
                  Retour à la connexion
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Vue connexion normale
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Flower className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mathilde Fleurs</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre espace</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mathilde@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
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
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Application de gestion florale
        </p>
      </div>
    </div>
  )
}

export default LoginPage
