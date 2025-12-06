/**
 * 🧪 TESTS UNITAIRES - Formulaire Événement
 * Tests pour le composant EventForm avec validation et soumission
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import EventForm from '@/components/forms/EventForm'

// Mock des hooks et contexts
const mockCreateEvent = vi.fn()
const mockUpdateEvent = vi.fn()

vi.mock('@/contexts/AppContext', () => ({
  useEvents: () => ({
    createEvent: mockCreateEvent,
    updateEvent: mockUpdateEvent,
    isLoading: false,
    error: null
  })
}))

// Mock des validations
vi.mock('@/utils/validation', () => ({
  EventValidationSchema: {
    safeParse: vi.fn().mockReturnValue({ success: true, data: {} })
  },
  DataSanitizer: {
    validateAndSanitize: vi.fn().mockImplementation((data) => data)
  }
}))

describe('EventForm Component', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn()
  }

  const mockClients = [
    {
      id: 'client-1',
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie@email.com'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('devrait afficher tous les champs du formulaire', () => {
    render(<EventForm {...defaultProps} clients={mockClients} />)
    
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/heure/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lieu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/budget/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/statut/i)).toBeInTheDocument()
  })

  test('devrait pré-remplir le formulaire en mode édition', () => {
    const existingEvent = {
      id: 'event-1',
      title: 'Mariage Sophie',
      description: 'Décoration florale',
      date: new Date('2024-06-15'),
      time: '14:00',
      location: 'Château de Versailles',
      clientId: 'client-1',
      budget: 1500,
      status: 'confirmed'
    }

    render(
      <EventForm 
        {...defaultProps} 
        clients={mockClients}
        initialData={existingEvent} 
      />
    )
    
    expect(screen.getByDisplayValue('Mariage Sophie')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Décoration florale')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument()
  })

  describe('Validation', () => {
    test('devrait valider les champs requis', async () => {
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} />)
      
      const submitButton = screen.getByText(/enregistrer/i)
      await user.click(submitButton)
      
      // Vérifier les messages d'erreur pour les champs requis
      await waitFor(() => {
        expect(screen.getByText(/titre.*requis/i)).toBeInTheDocument()
        expect(screen.getByText(/date.*requise/i)).toBeInTheDocument()
        expect(screen.getByText(/lieu.*requis/i)).toBeInTheDocument()
      })
    })

    test('devrait valider le format de l\'heure', async () => {
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} />)
      
      const timeInput = screen.getByLabelText(/heure/i)
      await user.type(timeInput, '25:30') // Heure invalide
      
      await user.click(screen.getByText(/enregistrer/i))
      
      await waitFor(() => {
        expect(screen.getByText(/format.*heure.*invalide/i)).toBeInTheDocument()
      })
    })

    test('devrait valider que la date n\'est pas dans le passé', async () => {
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} />)
      
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, '2020-01-01') // Date passée
      
      await user.click(screen.getByText(/enregistrer/i))
      
      await waitFor(() => {
        expect(screen.getByText(/date.*passé/i)).toBeInTheDocument()
      })
    })

    test('devrait valider le budget positif', async () => {
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} />)
      
      const budgetInput = screen.getByLabelText(/budget/i)
      await user.type(budgetInput, '-100') // Budget négatif
      
      await user.click(screen.getByText(/enregistrer/i))
      
      await waitFor(() => {
        expect(screen.getByText(/budget.*positif/i)).toBeInTheDocument()
      })
    })
  })

  describe('Soumission du formulaire', () => {
    test('devrait créer un nouvel événement', async () => {
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} />)
      
      // Remplir le formulaire
      await user.type(screen.getByLabelText(/titre/i), 'Nouveau Mariage')
      await user.type(screen.getByLabelText(/description/i), 'Décoration florale')
      await user.type(screen.getByLabelText(/date/i), '2024-12-25')
      await user.type(screen.getByLabelText(/heure/i), '15:30')
      await user.type(screen.getByLabelText(/lieu/i), 'Paris')
      await user.selectOptions(screen.getByLabelText(/client/i), 'client-1')
      await user.type(screen.getByLabelText(/budget/i), '2000')
      
      await user.click(screen.getByText(/enregistrer/i))
      
      await waitFor(() => {
        expect(mockCreateEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Nouveau Mariage',
            description: 'Décoration florale',
            budget: 2000
          })
        )
      })
    })

    test('devrait mettre à jour un événement existant', async () => {
      const user = userEvent.setup()
      const existingEvent = {
        id: 'event-1',
        title: 'Mariage Sophie',
        clientId: 'client-1'
      }
      
      render(
        <EventForm 
          {...defaultProps} 
          clients={mockClients}
          initialData={existingEvent}
        />
      )
      
      // Modifier le titre
      const titleInput = screen.getByDisplayValue('Mariage Sophie')
      await user.clear(titleInput)
      await user.type(titleInput, 'Mariage Sophie et Pierre')
      
      await user.click(screen.getByText(/enregistrer/i))
      
      await waitFor(() => {
        expect(mockUpdateEvent).toHaveBeenCalledWith(
          'event-1',
          expect.objectContaining({
            title: 'Mariage Sophie et Pierre'
          })
        )
      })
    })
  })

  describe('Sélection des fleurs', () => {
    test('devrait permettre d\'ajouter des fleurs', async () => {
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} />)
      
      const addFlowerButton = screen.getByText(/ajouter.*fleur/i)
      await user.click(addFlowerButton)
      
      expect(screen.getByText(/sélectionner.*fleurs/i)).toBeInTheDocument()
    })
  })

  describe('Gestion des erreurs', () => {
    test('devrait afficher les erreurs de l\'API', async () => {
      mockCreateEvent.mockRejectedValue(new Error('Erreur serveur'))
      
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} />)
      
      // Remplir le formulaire valide
      await user.type(screen.getByLabelText(/titre/i), 'Test')
      await user.type(screen.getByLabelText(/date/i), '2024-12-25')
      await user.type(screen.getByLabelText(/lieu/i), 'Paris')
      await user.selectOptions(screen.getByLabelText(/client/i), 'client-1')
      
      await user.click(screen.getByText(/enregistrer/i))
      
      await waitFor(() => {
        expect(screen.getByText(/erreur.*serveur/i)).toBeInTheDocument()
      })
    })
  })

  describe('Annulation', () => {
    test('devrait appeler onCancel au clic sur Annuler', async () => {
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} />)
      
      await user.click(screen.getByText(/annuler/i))
      
      expect(defaultProps.onCancel).toHaveBeenCalledOnce()
    })
  })

  describe('Sauvegarde automatique', () => {
    test('devrait sauvegarder automatiquement en brouillon', async () => {
      const user = userEvent.setup()
      
      render(<EventForm {...defaultProps} clients={mockClients} enableAutoSave />)
      
      await user.type(screen.getByLabelText(/titre/i), 'Brouillon')
      
      // Attendre la sauvegarde automatique
      await waitFor(() => {
        expect(screen.getByText(/sauvegardé.*automatiquement/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })
})
