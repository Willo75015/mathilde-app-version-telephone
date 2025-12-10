import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  isAuthenticated: boolean
}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Vérifier la session au chargement
  useEffect(() => {
    if (!isSupabaseEnabled() || !supabase) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Erreur récupération session:', error)
          setState(prev => ({ ...prev, loading: false, error: error.message }))
          return
        }

        setState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          error: null
        })
      } catch (err) {
        console.error('Erreur getSession:', err)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    getSession()

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        setState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          error: null
        })
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Connexion
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' }
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }))
        return { success: false, error: error.message }
      }

      setState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null
      })

      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur de connexion'
      setState(prev => ({ ...prev, loading: false, error: errorMsg }))
      return { success: false, error: errorMsg }
    }
  }, [])

  // Déconnexion
  const signOut = useCallback(async () => {
    if (!supabase) return

    setState(prev => ({ ...prev, loading: true }))

    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        session: null,
        loading: false,
        error: null
      })
    } catch (err) {
      console.error('Erreur déconnexion:', err)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Réinitialisation du mot de passe (envoie un email)
  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l\'envoi' }
    }
  }, [])

  // Mise à jour du mot de passe (après clic sur le lien email)
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la mise à jour' }
    }
  }, [])

  return {
    ...state,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!state.user
  }
}

export default useAuth
