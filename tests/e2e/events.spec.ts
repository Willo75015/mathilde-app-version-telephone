/**
 * 🧪 E2E TESTS - Gestion des événements
 * Tests end-to-end pour la création, modification et gestion des événements
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

test.describe('Gestion des Événements', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/events')
  })

  test.describe('Liste des événements', () => {
    test('devrait afficher la liste des événements', async ({ page }) => {
      // Vérifier le titre de la page
      await expect(page.locator('h1')).toContainText('Événements')
      
      // Vérifier la présence du bouton "Nouvel événement"
      await expect(page.locator('[data-testid="new-event-button"]')).toBeVisible()
      
      // Vérifier qu'au moins une carte d'événement est visible
      await expect(page.locator('[data-testid="event-card"]').first()).toBeVisible()
    })

    test('devrait permettre de filtrer les événements', async ({ page }) => {
      // Ouvrir les filtres
      await page.click('[data-testid="filter-button"]')
      
      // Filtrer par statut "Confirmé"
      await page.selectOption('select[name="status"]', 'confirmed')
      await page.click('[data-testid="apply-filters"]')
      
      // Vérifier que seuls les événements confirmés sont affichés
      const eventCards = page.locator('[data-testid="event-card"]')
      const count = await eventCards.count()
      
      for (let i = 0; i < count; i++) {
        await expect(eventCards.nth(i).locator('[data-testid="event-status"]'))
          .toContainText('Confirmé')
      }
    })

    test('devrait permettre de rechercher un événement', async ({ page }) => {
      // Utiliser la barre de recherche
      await page.fill('[data-testid="search-input"]', 'Mariage')
      await page.keyboard.press('Enter')
      
      // Vérifier que les résultats contiennent le terme recherché
      const eventTitles = page.locator('[data-testid="event-title"]')
      const count = await eventTitles.count()
      
      for (let i = 0; i < count; i++) {
        await expect(eventTitles.nth(i)).toContainText(/mariage/i)
      }
    })

    test('devrait permettre de changer la vue (grille/liste)', async ({ page }) => {
      // Vérifier la vue par défaut (grille)
      await expect(page.locator('[data-testid="events-grid"]')).toBeVisible()
      
      // Passer à la vue liste
      await page.click('[data-testid="list-view-button"]')
      await expect(page.locator('[data-testid="events-list"]')).toBeVisible()
      
      // Retourner à la vue grille
      await page.click('[data-testid="grid-view-button"]')
      await expect(page.locator('[data-testid="events-grid"]')).toBeVisible()
    })
  })

  test.describe('Création d\'événement', () => {
    test('devrait créer un nouvel événement complet', async ({ page }) => {
      // Cliquer sur "Nouvel événement"
      await page.click('[data-testid="new-event-button"]')
      
      // Vérifier qu'on est sur la page de création
      await expect(page).toHaveURL('/events/new')
      await expect(page.locator('h1')).toContainText('Nouvel événement')
      
      // Remplir le formulaire
      await page.fill('input[name="title"]', 'Mariage Sophie & Pierre')
      await page.fill('textarea[name="description"]', 'Décoration florale pour mariage en extérieur')
      
      // Sélectionner une date future
      await page.fill('input[name="date"]', '2024-08-15')
      await page.fill('input[name="time"]', '14:00')
      
      // Remplir le lieu
      await page.fill('input[name="location"]', 'Château de Versailles')
      
      // Sélectionner un client
      await page.click('select[name="clientId"]')
      await page.selectOption('select[name="clientId"]', { label: 'Sophie Martin' })
      
      // Définir le budget
      await page.fill('input[name="budget"]', '1500')
      
      // Ajouter des fleurs
      await page.click('[data-testid="add-flower-button"]')
      await page.selectOption('select[name="flowerId"]', { label: 'Roses blanches' })
      await page.fill('input[name="quantity"]', '50')
      await page.click('[data-testid="confirm-flower"]')
      
      // Ajouter une note
      await page.fill('textarea[name="notes"]', 'Client préfère les tons pastel')
      
      // Sauvegarder
      await page.click('button[type="submit"]')
      
      // Vérifier la redirection et le message de succès
      await expect(page).toHaveURL(/\/events\/[a-z0-9-]+/)
      await expect(page.locator('[role="alert"]')).toContainText('Événement créé avec succès')
      
      // Vérifier que les données sont affichées
      await expect(page.locator('h1')).toContainText('Mariage Sophie & Pierre')
      await expect(page.locator('[data-testid="event-date"]')).toContainText('15 août 2024')
      await expect(page.locator('[data-testid="event-budget"]')).toContainText('1 500 €')
    })

    test('devrait valider les champs obligatoires', async ({ page }) => {
      await page.click('[data-testid="new-event-button"]')
      
      // Essayer de sauvegarder sans remplir les champs
      await page.click('button[type="submit"]')
      
      // Vérifier les messages d'erreur
      await expect(page.locator('text=Le titre est requis')).toBeVisible()
      await expect(page.locator('text=La date est requise')).toBeVisible()
      await expect(page.locator('text=Le lieu est requis')).toBeVisible()
    })

    test('devrait empêcher la création d\'événements dans le passé', async ({ page }) => {
      await page.click('[data-testid="new-event-button"]')
      
      await page.fill('input[name="title"]', 'Test événement')
      await page.fill('input[name="date"]', '2020-01-01') // Date passée
      await page.fill('input[name="location"]', 'Test lieu')
      
      await page.click('button[type="submit"]')
      
      await expect(page.locator('text=La date ne peut pas être dans le passé')).toBeVisible()
    })
  })

  test.describe('Modification d\'événement', () => {
    test('devrait modifier un événement existant', async ({ page }) => {
      // Cliquer sur le premier événement
      await page.click('[data-testid="event-card"]').first()
      
      // Cliquer sur le bouton de modification
      await page.click('[data-testid="edit-event-button"]')
      
      // Modifier le titre
      const titleInput = page.locator('input[name="title"]')
      await titleInput.clear()
      await titleInput.fill('Mariage Sophie & Pierre - Modifié')
      
      // Modifier le budget
      const budgetInput = page.locator('input[name="budget"]')
      await budgetInput.clear()
      await budgetInput.fill('2000')
      
      // Sauvegarder
      await page.click('button[type="submit"]')
      
      // Vérifier les modifications
      await expect(page.locator('h1')).toContainText('Modifié')
      await expect(page.locator('[data-testid="event-budget"]')).toContainText('2 000 €')
      await expect(page.locator('[role="alert"]')).toContainText('Événement mis à jour')
    })

    test('devrait permettre de changer le statut', async ({ page }) => {
      await page.click('[data-testid="event-card"]').first()
      
      // Changer le statut via le menu déroulant
      await page.click('[data-testid="status-dropdown"]')
      await page.click('[data-testid="status-completed"]')
      
      // Confirmer le changement
      await page.click('[data-testid="confirm-status-change"]')
      
      // Vérifier le nouveau statut
      await expect(page.locator('[data-testid="event-status"]')).toContainText('Terminé')
      await expect(page.locator('[role="alert"]')).toContainText('Statut mis à jour')
    })
  })

  test.describe('Suppression d\'événement', () => {
    test('devrait supprimer un événement avec confirmation', async ({ page }) => {
      // Aller sur un événement
      await page.click('[data-testid="event-card"]').first()
      
      // Ouvrir le menu d'actions
      await page.click('[data-testid="event-actions-menu"]')
      
      // Cliquer sur supprimer
      await page.click('[data-testid="delete-event-button"]')
      
      // Confirmer la suppression dans la modal
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await expect(page.locator('text=Êtes-vous sûr')).toBeVisible()
      
      await page.click('[data-testid="confirm-delete"]')
      
      // Vérifier la redirection et le message
      await expect(page).toHaveURL('/events')
      await expect(page.locator('[role="alert"]')).toContainText('Événement supprimé')
    })

    test('devrait annuler la suppression', async ({ page }) => {
      await page.click('[data-testid="event-card"]').first()
      await page.click('[data-testid="event-actions-menu"]')
      await page.click('[data-testid="delete-event-button"]')
      
      // Annuler la suppression
      await page.click('[data-testid="cancel-delete"]')
      
      // Vérifier qu'on reste sur la page de l'événement
      await expect(page).toHaveURL(/\/events\/[a-z0-9-]+/)
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    })
  })

  test.describe('Gestion des fleurs', () => {
    test('devrait ajouter plusieurs types de fleurs', async ({ page }) => {
      await page.click('[data-testid="new-event-button"]')
      
      // Ajouter première fleur
      await page.click('[data-testid="add-flower-button"]')
      await page.selectOption('select[name="flowerId"]', { label: 'Roses blanches' })
      await page.fill('input[name="quantity"]', '30')
      await page.click('[data-testid="confirm-flower"]')
      
      // Ajouter deuxième fleur
      await page.click('[data-testid="add-flower-button"]')
      await page.selectOption('select[name="flowerId"]', { label: 'Pivoines roses' })
      await page.fill('input[name="quantity"]', '20')
      await page.click('[data-testid="confirm-flower"]')
      
      // Vérifier que les deux fleurs sont listées
      await expect(page.locator('[data-testid="flower-item"]')).toHaveCount(2)
      await expect(page.locator('text=Roses blanches')).toBeVisible()
      await expect(page.locator('text=Pivoines roses')).toBeVisible()
    })

    test('devrait supprimer une fleur de la liste', async ({ page }) => {
      await page.click('[data-testid="new-event-button"]')
      
      // Ajouter une fleur
      await page.click('[data-testid="add-flower-button"]')
      await page.selectOption('select[name="flowerId"]', { label: 'Roses blanches' })
      await page.fill('input[name="quantity"]', '30')
      await page.click('[data-testid="confirm-flower"]')
      
      // Supprimer la fleur
      await page.click('[data-testid="remove-flower-button"]')
      
      // Vérifier que la liste est vide
      await expect(page.locator('[data-testid="flower-item"]')).toHaveCount(0)
    })
  })

  test.describe('Vue calendrier', () => {
    test('devrait afficher les événements dans le calendrier', async ({ page }) => {
      // Aller à la vue calendrier
      await page.click('[data-testid="calendar-view-button"]')
      
      // Vérifier que le calendrier est affiché
      await expect(page.locator('[data-testid="calendar"]')).toBeVisible()
      
      // Vérifier qu'il y a des événements affichés
      await expect(page.locator('[data-testid="calendar-event"]').first()).toBeVisible()
    })

    test('devrait permettre de naviguer entre les mois', async ({ page }) => {
      await page.click('[data-testid="calendar-view-button"]')
      
      // Note du mois actuel
      const currentMonth = await page.locator('[data-testid="current-month"]').textContent()
      
      // Aller au mois suivant
      await page.click('[data-testid="next-month-button"]')
      
      // Vérifier que le mois a changé
      const newMonth = await page.locator('[data-testid="current-month"]').textContent()
      expect(newMonth).not.toBe(currentMonth)
      
      // Revenir au mois précédent
      await page.click('[data-testid="prev-month-button"]')
      
      // Vérifier qu'on est revenu au mois initial
      await expect(page.locator('[data-testid="current-month"]')).toContainText(currentMonth || '')
    })
  })

  test.describe('Export des données', () => {
    test('devrait exporter la liste des événements en PDF', async ({ page }) => {
      // Ouvrir le menu d'export
      await page.click('[data-testid="export-button"]')
      
      // Sélectionner PDF
      await page.click('[data-testid="export-pdf"]')
      
      // Attendre le début du téléchargement
      const downloadPromise = page.waitForEvent('download')
      
      // Confirmer l'export
      await page.click('[data-testid="confirm-export"]')
      
      const download = await downloadPromise
      
      // Vérifier que le fichier a le bon nom
      expect(download.suggestedFilename()).toMatch(/evenements.*\.pdf/)
    })

    test('devrait exporter en Excel avec options', async ({ page }) => {
      await page.click('[data-testid="export-button"]')
      await page.click('[data-testid="export-excel"]')
      
      // Configurer les options d'export
      await page.check('input[name="includeClientInfo"]')
      await page.check('input[name="includeFlowerDetails"]')
      
      const downloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="confirm-export"]')
      
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/evenements.*\.xlsx/)
    })
  })

  test.describe('Responsive design', () => {
    test('devrait s\'adapter aux écrans mobiles', async ({ page }) => {
      // Changer la taille de l'écran
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Vérifier que la liste d'événements reste utilisable
      await expect(page.locator('[data-testid="event-card"]').first()).toBeVisible()
      
      // Vérifier que le bouton "Nouvel événement" est accessible
      await expect(page.locator('[data-testid="new-event-button"]')).toBeVisible()
      
      // Tester la création d'événement sur mobile
      await page.click('[data-testid="new-event-button"]')
      await expect(page.locator('input[name="title"]')).toBeVisible()
    })
  })
})
