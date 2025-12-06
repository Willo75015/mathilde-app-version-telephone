/**
 * 🧪 HELPERS E2E - Utilitaires de Test
 * Fonctions utilitaires pour les tests E2E
 */

import { Page, expect } from '@playwright/test'

/**
 * Helpers pour l'authentification
 */
export class AuthHelpers {
  static async login(page: Page, email = 'mathilde@fleurs.com', password = 'password123') {
    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  }
  
  static async logout(page: Page) {
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')
    await expect(page).toHaveURL('/login')
  }
  
  static async ensureLoggedIn(page: Page) {
    // Vérifier si déjà connecté
    try {
      await page.goto('/dashboard', { timeout: 5000 })
      if (page.url().includes('/dashboard')) {
        return // Déjà connecté
      }
    } catch {
      // Pas connecté, procéder à la connexion
    }
    
    await this.login(page)
  }
}

/**
 * Helpers pour la navigation
 */
export class NavigationHelpers {
  static async goToEvents(page: Page) {
    await page.click('a[href="/events"]')
    await expect(page).toHaveURL('/events')
    await page.waitForSelector('[data-testid="events-page"]')
  }
  
  static async goToClients(page: Page) {
    await page.click('a[href="/clients"]')
    await expect(page).toHaveURL('/clients')
    await page.waitForSelector('[data-testid="clients-page"]')
  }
  
  static async goToCalendar(page: Page) {
    await page.click('a[href="/calendar"]')
    await expect(page).toHaveURL('/calendar')
    await page.waitForSelector('[data-testid="calendar-page"]')
  }
  
  static async goToDashboard(page: Page) {
    await page.click('a[href="/"]')
    await expect(page).toHaveURL('/')
    await page.waitForSelector('[data-testid="dashboard-page"]')
  }
}

/**
 * Helpers pour les formulaires
 */
export class FormHelpers {
  static async fillEventForm(page: Page, eventData: {
    title: string
    description?: string
    date: string
    time: string
    location: string
    clientId?: string
    budget: number
  }) {
    await page.fill('[data-testid="event-title"]', eventData.title)
    
    if (eventData.description) {
      await page.fill('[data-testid="event-description"]', eventData.description)
    }
    
    await page.fill('[data-testid="event-date"]', eventData.date)
    await page.fill('[data-testid="event-time"]', eventData.time)
    await page.fill('[data-testid="event-location"]', eventData.location)
    await page.fill('[data-testid="event-budget"]', eventData.budget.toString())
    
    if (eventData.clientId) {
      await page.selectOption('[data-testid="event-client"]', eventData.clientId)
    }
  }
  
  static async fillClientForm(page: Page, clientData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    street: string
    city: string
    postalCode: string
  }) {
    await page.fill('[data-testid="client-firstName"]', clientData.firstName)
    await page.fill('[data-testid="client-lastName"]', clientData.lastName)
    await page.fill('[data-testid="client-email"]', clientData.email)
    await page.fill('[data-testid="client-phone"]', clientData.phone)
    await page.fill('[data-testid="client-street"]', clientData.street)
    await page.fill('[data-testid="client-city"]', clientData.city)
    await page.fill('[data-testid="client-postalCode"]', clientData.postalCode)
  }
}

/**
 * Helpers pour les assertions
 */
export class AssertionHelpers {
  static async expectEventInList(page: Page, eventTitle: string) {
    await expect(page.locator(`[data-testid="event-card"]:has-text("${eventTitle}")`)).toBeVisible()
  }
  
  static async expectClientInList(page: Page, clientName: string) {
    await expect(page.locator(`[data-testid="client-card"]:has-text("${clientName}")`)).toBeVisible()
  }
  
  static async expectToast(page: Page, message: string, type: 'success' | 'error' | 'warning' = 'success') {
    await expect(page.locator(`[data-testid="toast-${type}"]:has-text("${message}")`)).toBeVisible()
  }
  
  static async expectLoadingToFinish(page: Page) {
    await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 10000 })
  }
}

/**
 * Helpers pour les données de test
 */
export class DataHelpers {
  static generateRandomEmail(): string {
    const timestamp = Date.now()
    return `test.${timestamp}@example.com`
  }
  
  static generateRandomPhone(): string {
    const randomNumber = Math.floor(Math.random() * 900000000) + 100000000
    return `01${randomNumber.toString().substring(0, 8)}`
  }
  
  static getFutureDate(daysFromNow: number = 30): string {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0] // Format YYYY-MM-DD
  }
  
  static getRandomBudget(min: number = 100, max: number = 5000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

/**
 * Helpers pour la PWA
 */
export class PWAHelpers {
  static async simulateOffline(page: Page) {
    await page.context().setOffline(true)
  }
  
  static async simulateOnline(page: Page) {
    await page.context().setOffline(false)
  }
  
  static async expectOfflineIndicator(page: Page) {
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
  }
  
  static async expectInstallPrompt(page: Page) {
    await expect(page.locator('[data-testid="install-prompt"]')).toBeVisible()
  }
  
  static async simulateInstallPrompt(page: Page) {
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      Object.defineProperty(event, 'platforms', { value: ['web'] })
      Object.defineProperty(event, 'userChoice', { 
        value: Promise.resolve({ outcome: 'accepted' })
      })
      Object.defineProperty(event, 'prompt', { 
        value: () => Promise.resolve()
      })
      window.dispatchEvent(event)
    })
  }
}

/**
 * Helpers pour les performances
 */
export class PerformanceHelpers {
  static async measurePageLoad(page: Page, url: string) {
    const startTime = Date.now()
    await page.goto(url, { waitUntil: 'networkidle' })
    const endTime = Date.now()
    return endTime - startTime
  }
  
  static async measureFirstContentfulPaint(page: Page): Promise<number> {
    const fcpMetric = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            resolve(fcpEntry.startTime)
          }
        }).observe({ entryTypes: ['paint'] })
      })
    })
    
    return fcpMetric as number
  }
  
  static async expectFastPageLoad(page: Page, url: string, maxTime: number = 3000) {
    const loadTime = await this.measurePageLoad(page, url)
    expect(loadTime).toBeLessThan(maxTime)
  }
}

/**
 * Helpers pour l'accessibilité
 */
export class AccessibilityHelpers {
  static async testKeyboardNavigation(page: Page, selectors: string[]) {
    for (const selector of selectors) {
      await page.keyboard.press('Tab')
      await expect(page.locator(selector)).toBeFocused()
    }
  }
  
  static async expectAriaLabel(page: Page, selector: string, expectedLabel: string) {
    await expect(page.locator(selector)).toHaveAttribute('aria-label', expectedLabel)
  }
  
  static async expectRole(page: Page, selector: string, expectedRole: string) {
    await expect(page.locator(selector)).toHaveAttribute('role', expectedRole)
  }
}

/**
 * Helpers pour le responsive design
 */
export class ResponsiveHelpers {
  static async setMobileViewport(page: Page) {
    await page.setViewportSize({ width: 375, height: 667 })
  }
  
  static async setTabletViewport(page: Page) {
    await page.setViewportSize({ width: 768, height: 1024 })
  }
  
  static async setDesktopViewport(page: Page) {
    await page.setViewportSize({ width: 1920, height: 1080 })
  }
  
  static async expectMobileMenu(page: Page) {
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
  }
  
  static async expectDesktopSidebar(page: Page) {
    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible()
  }
}
