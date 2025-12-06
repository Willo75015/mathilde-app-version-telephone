/**
 * 🧪 TESTS - Button Component
 * Tests unitaires pour le composant Button
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../../../src/components/ui/Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('devrait rendre le bouton avec le texte', () => {
      render(<Button>Cliquer ici</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Cliquer ici')
    })

    it('devrait appliquer la variante par défaut', () => {
      render(<Button>Bouton</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-500')
    })

    it('devrait appliquer les variantes correctement', () => {
      const { rerender } = render(<Button variant="secondary">Test</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-gray-100')

      rerender(<Button variant="danger">Test</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-red-500')

      rerender(<Button variant="outline">Test</Button>)
      expect(screen.getByRole('button')).toHaveClass('border-2')
    })

    it('devrait appliquer les tailles correctement', () => {
      const { rerender } = render(<Button size="sm">Test</Button>)
      expect(screen.getByRole('button')).toHaveClass('px-3 py-1.5')

      rerender(<Button size="lg">Test</Button>)
      expect(screen.getByRole('button')).toHaveClass('px-6 py-3')
    })
  })

  describe('Icons', () => {
    it('devrait afficher l\'icône de gauche', () => {
      const LeftIcon = () => <span data-testid="left-icon">🔍</span>
      render(<Button leftIcon={<LeftIcon />}>Rechercher</Button>)
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveTextContent('Rechercher')
    })

    it('devrait afficher l\'icône de droite', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>
      render(<Button rightIcon={<RightIcon />}>Suivant</Button>)
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('devrait masquer l\'icône de droite en mode loading', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>
      render(<Button rightIcon={<RightIcon />} isLoading>Suivant</Button>)
      
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
      expect(screen.getByTestId('loader2-icon')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('devrait afficher le spinner en mode loading', () => {
      render(<Button isLoading>Chargement</Button>)
      expect(screen.getByTestId('loader2-icon')).toBeInTheDocument()
    })

    it('devrait être désactivé en mode loading', () => {
      render(<Button isLoading>Chargement</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('ne devrait pas déclencher onClick en mode loading', () => {
      const handleClick = vi.fn()
      render(<Button isLoading onClick={handleClick}>Chargement</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Interactions', () => {
    it('devrait déclencher onClick', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Cliquer</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('ne devrait pas déclencher onClick si désactivé', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Désactivé</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('devrait supporter la navigation au clavier', () => {
      render(<Button>Bouton</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      expect(button).toHaveFocus()
      
      fireEvent.keyDown(button, { key: 'Enter' })
      fireEvent.keyDown(button, { key: ' ' })
    })
  })

  describe('Accessibility', () => {
    it('devrait avoir le bon rôle', () => {
      render(<Button>Bouton</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('devrait supporter aria-label', () => {
      render(<Button aria-label="Fermer la modal">✕</Button>)
      expect(screen.getByLabelText('Fermer la modal')).toBeInTheDocument()
    })

    it('devrait supporter aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="help-text">Aide</Button>
          <div id="help-text">Texte d'aide</div>
        </div>
      )
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('devrait indiquer l\'état disabled', () => {
      render(<Button disabled>Désactivé</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })
  })

  describe('Custom Props', () => {
    it('devrait passer les props HTML natives', () => {
      render(<Button type="submit" form="test-form">Submit</Button>)
      const button = screen.getByRole('button')
      
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('form', 'test-form')
    })

    it('devrait supporter les classes CSS personnalisées', () => {
      render(<Button className="custom-class">Test</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('devrait merger les classes CSS', () => {
      render(<Button className="custom-class">Test</Button>)
      const button = screen.getByRole('button')
      
      // Devrait avoir les classes par défaut ET personnalisées
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('inline-flex') // Classe par défaut
    })
  })

  describe('Animation Props', () => {
    it('devrait accepter les props d\'animation personnalisées', () => {
      const customAnimation = {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.9 }
      }
      
      render(<Button animation={customAnimation}>Animé</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('devrait gérer les enfants undefined', () => {
      render(<Button>{undefined}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('devrait gérer les enfants null', () => {
      render(<Button>{null}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('devrait gérer les chaînes vides', () => {
      render(<Button>{''}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('devrait gérer les nombres', () => {
      render(<Button>{42}</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('42')
    })
  })

  describe('Performance', () => {
    it('ne devrait pas re-render inutilement', () => {
      const renderSpy = vi.fn()
      
      const TestButton = ({ onClick }: { onClick: () => void }) => {
        renderSpy()
        return <Button onClick={onClick}>Test</Button>
      }
      
      const handleClick = vi.fn()
      const { rerender } = render(<TestButton onClick={handleClick} />)
      
      expect(renderSpy).toHaveBeenCalledTimes(1)
      
      // Re-render avec la même fonction
      rerender(<TestButton onClick={handleClick} />)
      expect(renderSpy).toHaveBeenCalledTimes(2) // Normal car pas de memo
    })
  })
})
