/**
 * 🧪 TESTS UNITAIRES - Layout Principal
 * Tests pour le composant Layout avec sidebar, header et navigation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Layout from '@/components/layout/Layout'

// Mock des contextes
const mockTheme = {
  isDark: false,
  toggleTheme: vi.fn(),
  theme: 'light',
  setTheme: vi.fn(),
  systemPreference: 'light'
}

const mockViewport = {
  width: 1024,
  height: 768
}

// Mock des hooks
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => mockTheme
}))

vi.mock('@/hooks/usePerformance', () => ({
  useViewport: () => mockViewport
}))

// Mock de Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock des composants PWA
vi.mock('@/components/PWA/OfflineIndicator', () => ({
  default: () => <div data-testid="offline-indicator" />
}))

vi.mock('@/components/PWA/InstallPrompt', () => ({
  default: () => <div data-testid="install-prompt" />
}))

describe('Layout Component', () => {
  const TestContent = () => <div data-testid="test-content">Contenu de test</div>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('devrait afficher le contenu enfant', () => {
    render(
      <Layout>
        <TestContent />
      </Layout>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  test('devrait afficher les composants PWA', () => {
    render(
      <Layout>
        <TestContent />
      </Layout>
    )
    
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument()
  })

  describe('Sidebar', () => {
    test('devrait afficher la sidebar avec la navigation', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      expect(screen.getByText('Mathilde Fleurs')).toBeInTheDocument()
      expect(screen.getByText('Accueil')).toBeInTheDocument()
      expect(screen.getByText('Calendrier')).toBeInTheDocument()
      expect(screen.getByText('Événements')).toBeInTheDocument()
      expect(screen.getByText('Clients')).toBeInTheDocument()
      expect(screen.getByText('Statistiques')).toBeInTheDocument()
    })

    test('devrait avoir un lien actif pour la page courante', () => {
      // Mock de window.location pour simuler la page courante
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/' }
      })
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      const homeLink = screen.getByText('Accueil').closest('a')
      expect(homeLink).toHaveClass('bg-primary-50')
    })
  })

  describe('Header', () => {
    test('devrait afficher le header avec le titre', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
      expect(screen.getByText('Gérez vos événements et clients')).toBeInTheDocument()
    })

    test('devrait afficher les boutons d\'action', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      expect(screen.getByText('Rechercher')).toBeInTheDocument()
      expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/utilisateur/i)).toBeInTheDocument()
    })
  })

  describe('Navigation Mobile', () => {
    test('devrait afficher le bouton menu sur mobile', () => {
      // Simuler une largeur mobile
      mockViewport.width = 500
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      expect(screen.getByLabelText(/menu/i)).toBeInTheDocument()
    })

    test('devrait ouvrir la sidebar mobile au clic', async () => {
      const user = userEvent.setup()
      mockViewport.width = 500
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      const menuButton = screen.getByLabelText(/menu/i)
      await user.click(menuButton)
      
      // Vérifier que la sidebar est ouverte (animation ou classe)
      expect(screen.getByRole('complementary')).toBeInTheDocument()
    })
  })

  describe('Thème', () => {
    test('devrait basculer le thème au clic', async () => {
      const user = userEvent.setup()
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      const themeButton = screen.getByText(/clair|sombre/i)
      await user.click(themeButton)
      
      expect(mockTheme.toggleTheme).toHaveBeenCalledOnce()
    })

    test('devrait afficher le bon texte selon le thème', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      expect(screen.getByText('Sombre')).toBeInTheDocument()
    })
  })

  describe('Recherche', () => {
    test('devrait ouvrir le modal de recherche', async () => {
      const user = userEvent.setup()
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      const searchButton = screen.getByText('Rechercher')
      await user.click(searchButton)
      
      expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
    })

    test('devrait fermer le modal avec Échap', async () => {
      const user = userEvent.setup()
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      // Ouvrir la recherche
      await user.click(screen.getByText('Rechercher'))
      
      // Fermer avec Échap
      await user.click(screen.getByText('Échap'))
      
      expect(screen.queryByPlaceholderText(/rechercher/i)).not.toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    test('devrait adapter la mise en page pour tablette', () => {
      mockViewport.width = 768
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      // Vérifier les adaptations pour tablette
      expect(screen.getByRole('main')).toHaveClass('ml-60')
    })

    test('devrait cacher certains éléments sur mobile', () => {
      mockViewport.width = 400
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      // Le bouton recherche devrait être caché sur très petit écran
      expect(screen.queryByText('Rechercher')).not.toBeInTheDocument()
    })
  })

  describe('Accessibilité', () => {
    test('devrait avoir les bons rôles ARIA', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      expect(screen.getByRole('complementary')).toBeInTheDocument() // Sidebar
      expect(screen.getByRole('banner')).toBeInTheDocument() // Header
      expect(screen.getByRole('main')).toBeInTheDocument() // Main content
      expect(screen.getByRole('navigation')).toBeInTheDocument() // Navigation
    })

    test('devrait être navigable au clavier', async () => {
      const user = userEvent.setup()
      
      render(
        <Layout>
          <TestContent />
        </Layout>
      )
      
      // Tester la navigation au clavier dans la sidebar
      const firstNavLink = screen.getByText('Accueil')
      await user.tab()
      expect(firstNavLink).toHaveFocus()
    })
  })
})
