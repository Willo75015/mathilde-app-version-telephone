/**
 * 🧪 E2E TESTS - Gestion des clients
 * Tests end-to-end pour la gestion des clients
 */

import { test, expect, type Page } from '@playwright/test'

// Helper pour se connecter
async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'mathilde@fleurs.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
}

test.describe('Gestion des Clients', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/clients')
  })

  test.describe('Liste des clients', () => {
    test('devrait afficher la liste des clients', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Clients')
      await expect(page.locator('[data-testid="new-client-button"]')).toBeVisible()
      await expect(page.locator('[data-testid="client-card"]').first()).toBeVisible()
    })

    test('devrait permettre de rechercher un client', async ({ page }) => {
      await page.fill('[data-testid="search-input"]', 'Sophie')
      await page.keyboard.press('Enter')
      
      const clientNames = page.locator('[data-testid="client-name"]')
      const count = await clientNames.count()
      
      for (let i = 0; i < count; i++) {
        await expect(clientNames.nth(i)).toContainText(/sophie/i)
      }
    })

    test('devrait trier les clients par nom', async ({ page }) => {
      await page.click('[data-testid="sort-button"]')
      await page.click('[data-testid="sort-by-name"]')
      
      const firstClientName = await page.locator('[data-testid="client-name"]').first().textContent()
      const secondClientName = await page.locator('[data-testid="client-name"]').nth(1).textContent()
      
      expect(firstClientName?.localeCompare(secondClientName || '') <= 0).toBeTruthy()
    })

    test('devrait filtrer par ville', async ({ page }) => {
      await page.click('[data-testid="filter-button"]')
      await page.fill('input[name="city"]', 'Paris')
      await page.click('[data-testid="apply-filters"]')
      
      const clientCities = page.locator('[data-testid="client-city"]')
      const count = await clientCities.count()
      
      for (let i = 0; i < count; i++) {
        await expect(clientCities.nth(i)).toContainText('Paris')
      }
    })
  })

  test.describe('Création de client', () => {
    test('devrait créer un nouveau client complet', async ({ page }) => {
      await page.click('[data-testid="new-client-button"]')
      
      await expect(page).toHaveURL('/clients/new')
      await expect(page.locator('h1')).toContainText('Nouveau client')
      
      // Informations personnelles
      await page.fill('input[name="firstName"]', 'Marie')
      await page.fill('input[name="lastName"]', 'Dubois')
      await page.fill('input[type="email"]', 'marie.dubois@email.com')
      await page.fill('input[name="phone"]', '0123456789')
      
      // Adresse
      await page.fill('input[name="street"]', '123 Rue de la République')
      await page.fill('input[name="city"]', 'Lyon')
      await page.fill('input[name="postalCode"]', '69001')
      
      // Préférences
      await page.click('[data-testid="add-preference-button"]')
      await page.selectOption('select[name="favoriteFlower"]', 'roses')
      await page.click('[data-testid="confirm-preference"]')
      
      // Budget préféré
      await page.fill('input[name="budgetMin"]', '500')
      await page.fill('input[name="budgetMax"]', '2000')
      
      // Notes
      await page.fill('textarea[name="notes"]', 'Cliente régulière, préfère les arrangements classiques')
      
      await page.click('button[type="submit"]')
      
      // Vérifications
      await expect(page).toHaveURL(/\/clients\/[a-z0-9-]+/)
      await expect(page.locator('[role="alert"]')).toContainText('Client créé avec succès')
      await expect(page.locator('h1')).toContainText('Marie Dubois')
      await expect(page.locator('[data-testid="client-email"]')).toContainText('marie.dubois@email.com')
    })

    test('devrait valider les champs obligatoires', async ({ page }) => {
      await page.click('[data-testid="new-client-button"]')
      await page.click('button[type="submit"]')
      
      await expect(page.locator('text=Le prénom est requis')).toBeVisible()
      await expect(page.locator('text=Le nom est requis')).toBeVisible()
      await expect(page.locator('text=L\'email est requis')).toBeVisible()
    })

    test('devrait valider le format de l\'email', async ({ page }) => {
      await page.click('[data-testid="new-client-button"]')
      
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'Test')
      await page.fill('input[type="email"]', 'email-invalide')
      
      await page.click('button[type="submit"]')
      
      await expect(page.locator('text=Email invalide')).toBeVisible()
    })

    test('devrait valider le numéro de téléphone français', async ({ page }) => {
      await page.click('[data-testid="new-client-button"]')
      
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'Test')
      await page.fill('input[type="email"]', 'test@test.com')
      await page.fill('input[name="phone"]', '123')
      
      await page.click('button[type="submit"]')
      
      await expect(page.locator('text=Numéro de téléphone français invalide')).toBeVisible()
    })

    test('devrait vérifier l\'unicité de l\'email', async ({ page }) => {
      await page.click('[data-testid="new-client-button"]')
      
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'Test')
      await page.fill('input[type="email"]', 'sophie.martin@email.com') // Email existant
      
      await page.click('button[type="submit"]')
      
      await expect(page.locator('text=Cet email est déjà utilisé')).toBeVisible()
    })
  })

  test.describe('Profil client', () => {
    test('devrait afficher les détails complets du client', async ({ page }) => {
      await page.click('[data-testid="client-card"]').first()
      
      // Vérifier les sections principales
      await expect(page.locator('[data-testid="client-info"]')).toBeVisible()
      await expect(page.locator('[data-testid="client-address"]')).toBeVisible()
      await expect(page.locator('[data-testid="client-preferences"]')).toBeVisible()
      await expect(page.locator('[data-testid="client-events"]')).toBeVisible()
      
      // Vérifier les actions disponibles
      await expect(page.locator('[data-testid="edit-client-button"]')).toBeVisible()
      await expect(page.locator('[data-testid="new-event-for-client"]')).toBeVisible()
    })

    test('devrait afficher l\'historique des événements', async ({ page }) => {
      await page.click('[data-testid="client-card"]').first()
      
      // Vérifier la section événements
      await expect(page.locator('[data-testid="client-events"]')).toBeVisible()
      
      // Vérifier qu'il y a au moins un événement
      await expect(page.locator('[data-testid="event-history-item"]').first()).toBeVisible()
      
      // Vérifier les statistiques
      await expect(page.locator('[data-testid="total-events"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-spent"]')).toBeVisible()
      await expect(page.locator('[data-testid="average-budget"]')).toBeVisible()
    })

    test('devrait permettre de créer un événement pour le client', async ({ page }) => {
      await page.click('[data-testid="client-card"]').first()
      await page.click('[data-testid="new-event-for-client"]')
      
      // Vérifier qu'on est sur la page de création d'événement
      await expect(page).toHaveURL('/events/new')
      
      // Vérifier que le client est pré-sélectionné
      const selectedClient = await page.locator('select[name="clientId"]').inputValue()
      expect(selectedClient).toBeTruthy()
    })
  })

  test.describe('Modification de client', () => {
    test('devrait modifier les informations d\'un client', async ({ page }) => {
      await page.click('[data-testid="client-card"]').first()
      await page.click('[data-testid="edit-client-button"]')
      
      // Modifier le téléphone
      const phoneInput = page.locator('input[name="phone"]')
      await phoneInput.clear()
      await phoneInput.fill('0987654321')
      
      // Modifier l\'adresse
      const cityInput = page.locator('input[name="city"]')
      await cityInput.clear()
      await cityInput.fill('Marseille')
      
      // Ajouter une préférence
      await page.click('[data-testid="add-preference-button"]')
      await page.selectOption('select[name="favoriteFlower"]', 'tulipes')
      await page.click('[data-testid="confirm-preference"]')
      
      await page.click('button[type="submit"]')
      
      // Vérifications
      await expect(page.locator('[role="alert"]')).toContainText('Client mis à jour')
      await expect(page.locator('[data-testid="client-phone"]')).toContainText('09 87 65 43 21')
      await expect(page.locator('[data-testid="client-city"]')).toContainText('Marseille')
      await expect(page.locator('text=tulipes')).toBeVisible()
    })

    test('devrait permettre de mettre à jour les préférences', async ({ page }) => {
      await page.click('[data-testid="client-card"]').first()
      await page.click('[data-testid="edit-client-button"]')
      
      // Modifier le budget préféré
      await page.fill('input[name="budgetMin"]', '800')
      await page.fill('input[name="budgetMax"]', '3000')
      
      // Ajouter une allergie
      await page.click('[data-testid="add-allergy-button"]')
      await page.fill('input[name="allergy"]', 'Pollen de graminées')
      await page.click('[data-testid="confirm-allergy"]')
      
      await page.click('button[type="submit"]')
      
      await expect(page.locator('[data-testid="budget-range"]')).toContainText('800 € - 3 000 €')
      await expect(page.locator('text=Pollen de graminées')).toBeVisible()
    })
  })

  test.describe('Suppression de client', () => {
    test('devrait empêcher la suppression d\'un client avec événements', async ({ page }) => {
      // Aller sur un client qui a des événements
      await page.click('[data-testid="client-card"]').first()
      
      await page.click('[data-testid="client-actions-menu"]')
      await page.click('[data-testid="delete-client-button"]')
      
      // Vérifier le message d'avertissement
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await expect(page.locator('text=Ce client a des événements associés')).toBeVisible()
      
      // Vérifier que le bouton de confirmation est désactivé
      await expect(page.locator('[data-testid="confirm-delete"]')).toBeDisabled()
    })

    test('devrait permettre la suppression d\'un client sans événements', async ({ page }) => {
      // Créer d'abord un client sans événements
      await page.click('[data-testid="new-client-button"]')
      await page.fill('input[name="firstName"]', 'Client')
      await page.fill('input[name="lastName"]', 'Temporaire')
      await page.fill('input[type="email"]', 'temp@test.com')
      await page.fill('input[name="phone"]', '0123456789')
      await page.click('button[type="submit"]')
      
      // Maintenant le supprimer
      await page.click('[data-testid="client-actions-menu"]')
      await page.click('[data-testid="delete-client-button"]')
      
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await page.click('[data-testid="confirm-delete"]')
      
      await expect(page).toHaveURL('/clients')
      await expect(page.locator('[role="alert"]')).toContainText('Client supprimé')
    })
  })

  test.describe('Export des clients', () => {
    test('devrait exporter la liste des clients', async ({ page }) => {
      await page.click('[data-testid="export-button"]')
      await page.click('[data-testid="export-excel"]')
      
      // Configurer l'export
      await page.check('input[name="includePreferences"]')
      await page.check('input[name="includeStatistics"]')
      
      const downloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="confirm-export"]')
      
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/clients.*\.xlsx/)
    })
  })

  test.describe('Communication avec les clients', () => {
    test('devrait permettre d\'envoyer un email', async ({ page }) => {
      await page.click('[data-testid="client-card"]').first()
      
      await page.click('[data-testid="contact-client-button"]')
      await page.click('[data-testid="send-email"]')
      
      // Remplir l'email
      await page.fill('input[name="subject"]', 'Confirmation de votre événement')
      await page.fill('textarea[name="message"]', 'Bonjour, je vous confirme...')
      
      await page.click('[data-testid="send-email-button"]')
      
      await expect(page.locator('[role="alert"]')).toContainText('Email envoyé')
    })

    test('devrait formater automatiquement le téléphone pour l\'appel', async ({ page }) => {
      await page.click('[data-testid="client-card"]').first()
      
      const phoneLink = page.locator('[data-testid="phone-link"]')
      await expect(phoneLink).toHaveAttribute('href', /^tel:/)
      
      // Vérifier que le numéro est formaté pour l'affichage
      await expect(page.locator('[data-testid="client-phone"]')).toContainText(/\d{2} \d{2} \d{2} \d{2} \d{2}/)
    })
  })

  test.describe('Recherche avancée', () => {
    test('devrait permettre une recherche par critères multiples', async ({ page }) => {
      await page.click('[data-testid="advanced-search-button"]')
      
      // Remplir plusieurs critères
      await page.fill('input[name="searchName"]', 'Sophie')
      await page.fill('input[name="searchCity"]', 'Paris')
      await page.selectOption('select[name="favoriteFlower"]', 'roses')
      
      await page.click('[data-testid="apply-advanced-search"]')
      
      // Vérifier que les résultats correspondent aux critères
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
      await expect(page.locator('[data-testid="client-name"]').first()).toContainText('Sophie')
    })

    test('devrait sauvegarder les recherches fréquentes', async ({ page }) => {
      await page.click('[data-testid="advanced-search-button"]')
      await page.fill('input[name="searchCity"]', 'Lyon')
      
      await page.click('[data-testid="save-search-button"]')
      await page.fill('input[name="searchName"]', 'Clients Lyon')
      await page.click('[data-testid="confirm-save-search"]')
      
      // Vérifier que la recherche sauvegardée apparaît
      await expect(page.locator('[data-testid="saved-searches"]')).toContainText('Clients Lyon')
    })
  })

  test.describe('Responsive design', () => {
    test('devrait s\'adapter aux écrans mobiles', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Vérifier que la liste de clients reste utilisable
      await expect(page.locator('[data-testid="client-card"]').first()).toBeVisible()
      
      // Tester la création de client sur mobile
      await page.click('[data-testid="new-client-button"]')
      
      // Vérifier que le formulaire est accessible
      await expect(page.locator('input[name="firstName"]')).toBeVisible()
      
      // Tester le scroll des champs
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'Mobile')
      
      // Vérifier que les champs restent visibles
      await expect(page.locator('input[name="lastName"]')).toBeVisible()
    })

    test('devrait optimiser l\'affichage des cartes sur tablette', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // Vérifier que les cartes s'adaptent à la largeur
      const clientCards = page.locator('[data-testid="client-card"]')
      const firstCard = clientCards.first()
      
      const boundingBox = await firstCard.boundingBox()
      expect(boundingBox?.width).toBeGreaterThan(300)
      expect(boundingBox?.width).toBeLessThan(500)
    })
  })

  test.describe('Accessibilité', () => {
    test('devrait être navigable au clavier', async ({ page }) => {
      // Navigation dans la liste
      await page.keyboard.press('Tab')
      await expect(page.locator('[data-testid="search-input"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('[data-testid="new-client-button"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      await expect(page.locator('[data-testid="client-card"]').first()).toBeFocused()
    })

    test('devrait avoir des labels et descriptions appropriés', async ({ page }) => {
      await page.click('[data-testid="new-client-button"]')
      
      // Vérifier les labels
      await expect(page.locator('label[for*="firstName"]')).toBeVisible()
      await expect(page.locator('label[for*="email"]')).toBeVisible()
      
      // Vérifier les descriptions d'aide
      await expect(page.locator('[id*="firstName-help"]')).toBeVisible()
      await expect(page.locator('[id*="phone-help"]')).toBeVisible()
    })
  })
})
