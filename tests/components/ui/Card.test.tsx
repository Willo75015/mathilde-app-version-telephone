/**
 * 🧪 TESTS UNITAIRES - Composant Card
 * Tests pour le composant Card avec toutes ses variantes
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Card from '@/components/ui/Card'

// Mock du composant Framer Motion pour éviter les erreurs
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

describe('Card Component', () => {
  test('devrait s\'afficher avec le contenu de base', () => {
    render(
      <Card>
        <p>Contenu de test</p>
      </Card>
    )
    
    expect(screen.getByText('Contenu de test')).toBeInTheDocument()
  })

  test('devrait appliquer les classes de base', () => {
    render(
      <Card data-testid="card">
        Contenu
      </Card>
    )
    
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm')
  })

  describe('Variantes', () => {
    test('variant outlined devrait avoir une bordure', () => {
      render(
        <Card variant="outlined" data-testid="card">
          Contenu
        </Card>
      )
      
      expect(screen.getByTestId('card')).toHaveClass('border')
    })

    test('variant elevated devrait avoir une ombre plus importante', () => {
      render(
        <Card variant="elevated" data-testid="card">
          Contenu
        </Card>
      )
      
      expect(screen.getByTestId('card')).toHaveClass('shadow-lg')
    })
  })

  describe('Tailles', () => {
    test('size sm devrait avoir un padding réduit', () => {
      render(
        <Card size="sm" data-testid="card">
          Contenu
        </Card>
      )
      
      expect(screen.getByTestId('card')).toHaveClass('p-3')
    })

    test('size lg devrait avoir un padding augmenté', () => {
      render(
        <Card size="lg" data-testid="card">
          Contenu
        </Card>
      )
      
      expect(screen.getByTestId('card')).toHaveClass('p-8')
    })
  })

  describe('Interactivité', () => {
    test('devrait être cliquable quand onClick est fourni', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(
        <Card onClick={handleClick} data-testid="card">
          Contenu cliquable
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('cursor-pointer')
      
      await user.click(card)
      expect(handleClick).toHaveBeenCalledOnce()
    })

    test('devrait avoir les effets hover quand cliquable', () => {
      render(
        <Card onClick={() => {}} data-testid="card">
          Contenu
        </Card>
      )
      
      expect(screen.getByTestId('card')).toHaveClass('hover:shadow-md')
    })
  })

  describe('Header et Footer', () => {
    test('devrait afficher un header quand fourni', () => {
      render(
        <Card header={<h2>Titre de la carte</h2>}>
          Contenu
        </Card>
      )
      
      expect(screen.getByText('Titre de la carte')).toBeInTheDocument()
    })

    test('devrait afficher un footer quand fourni', () => {
      render(
        <Card footer={<p>Footer de la carte</p>}>
          Contenu
        </Card>
      )
      
      expect(screen.getByText('Footer de la carte')).toBeInTheDocument()
    })
  })

  describe('États', () => {
    test('devrait afficher un état de chargement', () => {
      render(
        <Card loading data-testid="card">
          Contenu
        </Card>
      )
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    test('devrait être disabled', () => {
      render(
        <Card disabled data-testid="card">
          Contenu
        </Card>
      )
      
      expect(screen.getByTestId('card')).toHaveClass('opacity-50')
    })
  })

  describe('Mode dark', () => {
    test('devrait avoir les bonnes classes pour le mode dark', () => {
      render(
        <Card data-testid="card">
          Contenu
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('dark:bg-gray-800')
    })
  })
})
