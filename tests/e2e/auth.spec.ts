/**
 * 🧪 E2E TESTS - Authentification
 * Tests end-to-end pour le système d'authentification
 */

import { test, expect, type Page } from '@playwright/test'

// Configuration des tests
test.describe('Authentification', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page de connexion
    await page.goto('/login')
  })

  test.describe('Page de connexion', () => {
    test('devrait afficher le formulaire de connexion', async ({ page }) => {
      // Vérifier les éléments de la page
      await expect(page.locator('h1')).toContainText('Connexion')
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('devrait afficher le logo Mathilde Fleurs', async ({ page }) => {
      await expect(page.locator('img[alt*="Mathilde"]')).toBeVisible()
    })

    test('devrait avoir un lien vers l\'inscription', async ({ page }) => {
      await expect(page.locator('a[href*="register"]')).toBeVisible()
    })
  })

  test.describe('Connexion avec des identifiants', () => {
    test('devrait se connecter avec des identifiants valides', async ({ page }) => {
      // Remplir le formulaire
      await page.fill('input[type="email"]', 'mathilde@fleurs.com')
      await page.fill('input[type="password"]', 'password123')
      
      // Soumettre le formulaire
      await page.click('button[type="submit"]')
      
      // Vérifier la redirection vers le dashboard
      await expect(page).toHaveURL('/dashboard')
      
      // Vérifier que l'utilisateur est connecté
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
      await expect(page.locator('text=Mathilde Dupont')).toBeVisible()
    })

    test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
      // Remplir avec de mauvais identifiants
      await page.fill('input[type="email"]', 'wrong@email.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      
      // Soumettre le formulaire
      await page.click('button[type="submit"]')
      
      // Vérifier l'affichage de l'erreur
      await expect(page.locator('[role="alert"]')).toContainText('Identifiants invalides')
      
      // Vérifier qu'on reste sur la page de connexion
      await expect(page).toHaveURL('/login')
    })

    test('devrait valider le format de l\'email', async ({ page }) => {
      // Entrer un email invalide
      await page.fill('input[type="email"]', 'email-invalide')
      await page.fill('input[type="password"]', 'password123')
      
      // Essayer de soumettre
      await page.click('button[type="submit"]')
      
      // Vérifier la validation HTML5
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    })

    test('devrait exiger un mot de passe', async ({ page }) => {
      // Remplir seulement l'email
      await page.fill('input[type="email"]', 'mathilde@fleurs.com')
      
      // Essayer de soumettre
      await page.click('button[type="submit"]')
      
      // Vérifier que le champ mot de passe est requis
      const passwordInput = page.locator('input[type="password"]')
      await expect(passwordInput).toHaveAttribute('required')
    })
  })

  test.describe('Fonctionnalités de sécurité', () => {
    test('devrait masquer/afficher le mot de passe', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]')
      const toggleButton = page.locator('[data-testid="password-toggle"]')
      
      // Vérifier que le mot de passe est masqué par défaut
      await expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Cliquer sur le bouton pour afficher
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Cliquer à nouveau pour masquer
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('devrait bloquer après plusieurs tentatives échouées', async ({ page }) => {
      // Simuler 5 tentatives échouées
      for (let i = 0; i < 5; i++) {
        await page.fill('input[type="email"]', 'test@test.com')
        await page.fill('input[type="password"]', 'wrongpassword')
        await page.click('button[type="submit"]')
        
        // Attendre un peu entre les tentatives
        await page.waitForTimeout(500)
      }
      
      // La 6ème tentative devrait être bloquée
      await page.fill('input[type="email"]', 'test@test.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Vérifier le message de blocage
      await expect(page.locator('[role="alert"]')).toContainText('Trop de tentatives')
    })
  })

  test.describe('Déconnexion', () => {
    test('devrait pouvoir se déconnecter', async ({ page }) => {
      // Se connecter d'abord
      await page.fill('input[type="email"]', 'mathilde@fleurs.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      
      // Attendre d'être sur le dashboard
      await expect(page).toHaveURL('/dashboard')
      
      // Ouvrir le menu utilisateur
      await page.click('[data-testid="user-menu"]')
      
      // Cliquer sur déconnexion
      await page.click('[data-testid="logout-button"]')
      
      // Vérifier la redirection vers la page de connexion
      await expect(page).toHaveURL('/login')
      
      // Vérifier qu'on ne peut plus accéder au dashboard
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Persistance de session', () => {
    test('devrait maintenir la session après rafraîchissement', async ({ page }) => {
      // Se connecter
      await page.fill('input[type="email"]', 'mathilde@fleurs.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      
      // Attendre d'être sur le dashboard
      await expect(page).toHaveURL('/dashboard')
      
      // Rafraîchir la page
      await page.reload()
      
      // Vérifier qu'on reste connecté
      await expect(page).toHaveURL('/dashboard')
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })
  })

  test.describe('Accessibilité', () => {
    test('devrait être navigable au clavier', async ({ page }) => {
      // Tester la navigation au clavier
      await page.keyboard.press('Tab') // Email input
      await expect(page.locator('input[type="email"]')).toBeFocused()
      
      await page.keyboard.press('Tab') // Password input
      await expect(page.locator('input[type="password"]')).toBeFocused()
      
      await page.keyboard.press('Tab') // Submit button
      await expect(page.locator('button[type="submit"]')).toBeFocused()
    })
  })
})

// Tests spécifiques pour l'inscription
test.describe('Inscription', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('devrait permettre de créer un nouveau compte', async ({ page }) => {
    // Remplir le formulaire d'inscription
    await page.fill('input[name="firstName"]', 'Sophie')
    await page.fill('input[name="lastName"]', 'Martin')
    await page.fill('input[type="email"]', 'sophie.martin@email.com')
    await page.fill('input[type="password"]', 'motdepasse123')
    await page.fill('input[name="confirmPassword"]', 'motdepasse123')
    
    // Accepter les conditions
    await page.check('input[type="checkbox"][name="terms"]')
    
    // Soumettre
    await page.click('button[type="submit"]')
    
    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Vérifier que l'utilisateur est connecté
    await expect(page.locator('text=Sophie Martin')).toBeVisible()
  })

  test('devrait valider la confirmation du mot de passe', async ({ page }) => {
    await page.fill('input[type="password"]', 'motdepasse123')
    await page.fill('input[name="confirmPassword"]', 'motdepasse456')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Les mots de passe ne correspondent pas')).toBeVisible()
  })
})
