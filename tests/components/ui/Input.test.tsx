/**
 * 🧪 TESTS UNITAIRES - Composant Input
 * Tests pour le composant Input avec toutes ses fonctionnalités
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Input from '@/components/ui/Input'

describe('Input Component', () => {
  const defaultProps = {
    label: 'Test Label',
    placeholder: 'Test placeholder'
  }

  test('devrait s\'afficher avec les props de base', () => {
    render(<Input {...defaultProps} />)
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument()
  })

  test('devrait afficher une erreur quand fournie', () => {
    render(<Input {...defaultProps} error="Erreur de test" />)
    
    expect(screen.getByText('Erreur de test')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300')
  })

  test('devrait afficher un hint quand fourni', () => {
    render(<Input {...defaultProps} hint="Hint de test" />)
    
    expect(screen.getByText('Hint de test')).toBeInTheDocument()
  })

  test('devrait appeler onChange quand l\'utilisateur tape', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    
    render(<Input {...defaultProps} onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    
    expect(handleChange).toHaveBeenCalledTimes(4) // Une fois par caractère
  })

  test('devrait gérer le focus et blur', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    
    render(<Input {...defaultProps} onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    
    expect(handleFocus).toHaveBeenCalledOnce()
    
    await user.tab()
    expect(handleBlur).toHaveBeenCalledOnce()
  })

  describe('Variant filled', () => {
    test('devrait appliquer les bonnes classes pour variant filled', () => {
      render(<Input {...defaultProps} variant="filled" />)
      
      expect(screen.getByRole('textbox')).toHaveClass('bg-gray-50')
    })
  })

  describe('Icônes', () => {
    test('devrait afficher l\'icône de gauche', () => {
      const LeftIcon = () => <span data-testid="left-icon">Icon</span>
      render(<Input {...defaultProps} leftIcon={<LeftIcon />} />)
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    test('devrait afficher l\'icône de droite', () => {
      const RightIcon = () => <span data-testid="right-icon">Icon</span>
      render(<Input {...defaultProps} rightIcon={<RightIcon />} />)
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('Champ password', () => {
    test('devrait basculer la visibilité du mot de passe', async () => {
      const user = userEvent.setup()
      
      render(<Input {...defaultProps} type="password" showPasswordToggle />)
      
      const input = screen.getByLabelText('Test Label')
      expect(input).toHaveAttribute('type', 'password')
      
      const toggleButton = screen.getByRole('button')
      await user.click(toggleButton)
      
      expect(input).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('États disabled', () => {
    test('devrait être disabled quand la prop est fournie', () => {
      render(<Input {...defaultProps} disabled />)
      
      expect(screen.getByRole('textbox')).toBeDisabled()
      expect(screen.getByRole('textbox')).toHaveClass('disabled:opacity-50')
    })
  })

  describe('Animations', () => {
    test('devrait animer le label au focus', async () => {
      const user = userEvent.setup()
      
      render(<Input {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      
      // Le label devrait avoir la classe de focus
      const label = screen.getByText('Test Label')
      expect(label).toHaveClass('text-primary-600')
    })
  })

  describe('Accessibilité', () => {
    test('devrait avoir les bonnes propriétés ARIA', () => {
      render(<Input {...defaultProps} error="Erreur test" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    test('devrait être associé au label', () => {
      render(<Input {...defaultProps} />)
      
      const input = screen.getByLabelText('Test Label')
      expect(input).toBeInTheDocument()
    })
  })
})
