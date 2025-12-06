/**
 * 🧪 MATHILDE FLEURS - SETUP DES TESTS
 * Configuration globale pour Jest et React Testing Library
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'

// Nettoyage automatique après chaque test
afterEach(() => {
  cleanup()
})

// Configuration des mocks globaux
beforeAll(() => {
  // Mock de l'API Web
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock de ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock de IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock de fetch
  global.fetch = vi.fn()

  // Mock de localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Mock de sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  })

  // Mock de window.location
  delete (window as any).location
  window.location = {
    ...window.location,
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  }

  // Mock de crypto pour les UUIDs
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: vi.fn(() => 'mock-uuid-1234'),
      getRandomValues: vi.fn((arr) => arr.fill(1))
    }
  })

  // Mock de Date.now pour des tests déterministes
  vi.spyOn(Date, 'now').mockImplementation(() => 1640995200000) // 1er janvier 2022

  // Mock de console.error pour éviter les logs pendant les tests
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterAll(() => {
  vi.restoreAllMocks()
})

// Configuration des timeouts pour les tests asynchrones
vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 10000
})

// Helpers globaux pour les tests
declare global {
  var testHelpers: {
    mockEvent: (overrides?: Partial<Event>) => Event
    mockClient: (overrides?: any) => any
    mockUser: (overrides?: any) => any
    waitForLoadingToFinish: () => Promise<void>
  }
}

global.testHelpers = {
  // Mock d'un événement
  mockEvent: (overrides = {}) => ({
    id: 'event-1',
    title: 'Mariage Sophie & Pierre',
    description: 'Décoration florale pour mariage',
    date: new Date('2024-06-15'),
    time: '14:00',
    location: 'Château de Versailles',
    clientId: 'client-1',
    budget: 1500,
    status: 'confirmed',
    flowers: [
      { flowerId: 'flower-1', quantity: 50 },
      { flowerId: 'flower-2', quantity: 30 }
    ],
    notes: 'Préférence pour les roses blanches',
    images: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  }),

  // Mock d'un client
  mockClient: (overrides = {}) => ({
    id: 'client-1',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@email.com',
    phone: '0123456789',
    address: {
      street: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    preferences: {
      favoriteColors: ['blanc', 'rose'],
      favoriteFlowers: ['rose', 'pivoine'],
      allergies: [],
      budget: { min: 500, max: 2000, currency: 'EUR' }
    },
    events: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  }),

  // Mock d'un utilisateur
  mockUser: (overrides = {}) => ({
    id: 'user-1',
    email: 'mathilde@fleurs.com',
    firstName: 'Mathilde',
    lastName: 'Dupont',
    role: 'florist',
    preferences: {
      theme: 'light',
      language: 'fr',
      notifications: {
        email: true,
        push: true,
        reminders: true
      }
    },
    ...overrides
  }),

  // Attendre la fin du loading
  waitForLoadingToFinish: async () => {
    const { waitForElementToBeRemoved, screen } = await import('@testing-library/react')
    try {
      await waitForElementToBeRemoved(() => screen.queryByTestId('loading'), {
        timeout: 5000
      })
    } catch {
      // Ignore si pas de loading
    }
  }
}

// Export pour utilisation dans les tests
export { global as testHelpers }
