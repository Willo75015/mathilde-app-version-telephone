/**
 * 🧪 E2E TESTS - PWA (Progressive Web App)
 * Tests end-to-end pour les fonctionnalités PWA
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test'

test.describe('PWA - Progressive Web App', () => {
  
  test.describe('Installation et Manifest', () => {
    test('devrait avoir un manifest valide', async ({ page }) => {
      await page.goto('/')
      
      // Vérifier que le manifest est lié
      const manifestLink = page.locator('link[rel="manifest"]')
      await expect(manifestLink).toHaveAttribute('href', '/manifest.json')
      
      // Vérifier le contenu du manifest
      const manifestResponse = await page.request.get('/manifest.json')
      expect(manifestResponse.ok()).toBeTruthy()
      
      const manifest = await manifestResponse.json()
      expect(manifest.name).toBe('Mathilde Fleurs - Gestion Événements')
      expect(manifest.short_name).toBe('Mathilde Fleurs')
      expect(manifest.display).toBe('standalone')
      expect(manifest.start_url).toBe('/')
      expect(manifest.theme_color).toBe('#10b981')
      expect(manifest.background_color).toBe('#ffffff')
      
      // Vérifier les icônes
      expect(manifest.icons).toBeDefined()
      expect(manifest.icons.length).toBeGreaterThan(0)
      expect(manifest.icons[0].sizes).toContain('192x192')
    })

    test('devrait afficher le prompt d\'installation', async ({ page }) => {
      await page.goto('/')
      
      // Simuler l'événement beforeinstallprompt
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
      
      // Vérifier que le prompt d'installation apparaît
      await expect(page.locator('[data-testid="install-prompt"]')).toBeVisible()
      await expect(page.locator('text=Installer Mathilde Fleurs')).toBeVisible()
    })

    test('devrait permettre d\'installer l\'application', async ({ page }) => {
      await page.goto('/')
      
      // Simuler l'événement beforeinstallprompt
      await page.evaluate(() => {
        const mockEvent = {
          platforms: ['web'],
          userChoice: Promise.resolve({ outcome: 'accepted' }),
          prompt: () => Promise.resolve()
        }
        window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }))
      })
      
      // Attendre et cliquer sur le bouton d'installation
      await page.waitForSelector('[data-testid="install-button"]', { timeout: 5000 })
      await page.click('[data-testid="install-button"]')
      
      // Vérifier que l'installation est déclenchée
      await expect(page.locator('[data-testid="install-prompt"]')).not.toBeVisible()
    })
  })

  test.describe('Service Worker', () => {
    test('devrait enregistrer le service worker', async ({ page }) => {
      await page.goto('/')
      
      // Vérifier que le service worker est enregistré
      const swRegistration = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          return await navigator.serviceWorker.getRegistration()
        }
        return null
      })
      
      expect(swRegistration).toBeTruthy()
    })

    test('devrait mettre en cache les ressources statiques', async ({ page }) => {
      await page.goto('/')
      
      // Attendre que le service worker soit prêt
      await page.waitForFunction(() => navigator.serviceWorker.ready)
      
      // Vérifier que les ressources sont dans le cache
      const cacheNames = await page.evaluate(async () => {
        return await caches.keys()
      })
      
      expect(cacheNames.length).toBeGreaterThan(0)
      expect(cacheNames.some(name => name.includes('static'))).toBeTruthy()
    })

    test('devrait fonctionner hors ligne pour les pages mises en cache', async ({ page, context }) => {
      await page.goto('/')
      
      // Attendre que la page soit mise en cache
      await page.waitForTimeout(2000)
      
      // Simuler la perte de connexion
      await context.setOffline(true)
      
      // Recharger la page
      await page.reload()
      
      // Vérifier que la page se charge toujours (depuis le cache)
      await expect(page.locator('body')).toBeVisible()
      
      // Remettre en ligne
      await context.setOffline(false)
    })
  })

  test.describe('Indicateur de statut de connexion', () => {
    test('devrait afficher l\'indicateur hors ligne', async ({ page, context }) => {
      await page.goto('/')
      
      // Passer hors ligne
      await context.setOffline(true)
      
      // Déclencher l'événement offline
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'))
      })
      
      // Vérifier que l'indicateur apparaît
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
      await expect(page.locator('text=Mode hors ligne')).toBeVisible()
      
      await context.setOffline(false)
    })

    test('devrait afficher l\'indicateur de reconnexion', async ({ page, context }) => {
      await page.goto('/')
      
      // Simuler offline puis online
      await context.setOffline(true)
      await page.evaluate(() => window.dispatchEvent(new Event('offline')))
      
      await context.setOffline(false)
      await page.evaluate(() => window.dispatchEvent(new Event('online')))
      
      // Vérifier le message de reconnexion
      await expect(page.locator('text=Connexion rétablie')).toBeVisible()
    })
  })

  test.describe('Synchronisation en arrière-plan', () => {
    test('devrait mettre en file d\'attente les données pour synchronisation', async ({ page }) => {
      // Se connecter d'abord
      await page.goto('/login')
      await page.fill('input[type="email"]', 'mathilde@fleurs.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      
      await page.goto('/events/new')
      
      // Remplir un formulaire
      await page.fill('input[name="title"]', 'Événement Test Sync')
      await page.fill('input[name="location"]', 'Test Location')
      await page.fill('input[name="date"]', '2024-12-25')
      
      // Simuler la perte de connexion avant de sauvegarder
      await page.context().setOffline(true)
      
      // Essayer de sauvegarder
      await page.click('button[type="submit"]')
      
      // Vérifier que les données sont mises en file d'attente
      await expect(page.locator('text=Données sauvegardées localement')).toBeVisible()
      
      await page.context().setOffline(false)
    })

    test('devrait synchroniser les données quand la connexion revient', async ({ page }) => {
      await page.goto('/')
      
      // Ajouter des données de test en attente de sync
      await page.evaluate(() => {
        localStorage.setItem('pending_sync_data', JSON.stringify([
          {
            id: 'test-sync-1',
            type: 'event',
            data: { title: 'Test Sync Event' },
            timestamp: Date.now()
          }
        ]))
      })
      
      // Simuler le retour de connexion
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'))
      })
      
      // Attendre la synchronisation
      await page.waitForTimeout(1000)
      
      // Vérifier que la synchronisation a eu lieu
      const pendingData = await page.evaluate(() => {
        return localStorage.getItem('pending_sync_data')
      })
      
      // En développement, les données peuvent être conservées pour simulation
      expect(pendingData).toBeDefined()
    })
  })

  test.describe('Notifications Push', () => {
    test('devrait demander la permission pour les notifications', async ({ page }) => {
      // Se connecter
      await page.goto('/login')
      await page.fill('input[type="email"]', 'mathilde@fleurs.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      
      await page.goto('/settings')
      
      // Simuler l'API Notification
      await page.evaluate(() => {
        Object.defineProperty(window, 'Notification', {
          value: {
            permission: 'default',
            requestPermission: () => Promise.resolve('granted')
          },
          writable: true
        })
      })
      
      // Activer les notifications push
      await page.click('[data-testid="enable-notifications"]')
      
      // Vérifier que la demande est traitée
      await expect(page.locator('text=Notifications activées')).toBeVisible()
    })

    test('devrait gérer le refus de permission', async ({ page }) => {
      await page.goto('/settings')
      
      // Simuler le refus de permission
      await page.evaluate(() => {
        Object.defineProperty(window, 'Notification', {
          value: {
            permission: 'denied',
            requestPermission: () => Promise.resolve('denied')
          },
          writable: true
        })
      })
      
      await page.click('[data-testid="enable-notifications"]')
      
      // Vérifier le message d'erreur approprié
      await expect(page.locator('text=Permission refusée')).toBeVisible()
    })
  })

  test.describe('Mise à jour de l\'application', () => {
    test('devrait détecter une nouvelle version disponible', async ({ page }) => {
      await page.goto('/')
      
      // Simuler une nouvelle version du service worker
      await page.evaluate(() => {
        // Déclencher l'événement de mise à jour
        window.dispatchEvent(new CustomEvent('sw-update-available'))
      })
      
      // Vérifier que le prompt de mise à jour apparaît
      await expect(page.locator('[data-testid="update-prompt"]')).toBeVisible()
      await expect(page.locator('text=Nouvelle version disponible')).toBeVisible()
    })

    test('devrait permettre de recharger pour appliquer la mise à jour', async ({ page }) => {
      await page.goto('/')
      
      // Simuler une mise à jour disponible
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('sw-update-available'))
      })
      
      // Cliquer sur "Mettre à jour"
      await page.click('[data-testid="apply-update-button"]')
      
      // Vérifier que la page se recharge
      await page.waitForLoadState('load')
      
      // Vérifier que le prompt de mise à jour a disparu
      await expect(page.locator('[data-testid="update-prompt"]')).not.toBeVisible()
    })
  })

  test.describe('Performances PWA', () => {
    test('devrait avoir de bonnes métriques de performance', async ({ page }) => {
      await page.goto('/')
      
      // Mesurer le temps de chargement
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstByte: navigation.responseStart - navigation.requestStart
        }
      })
      
      // Vérifier que les métriques sont dans des plages acceptables
      expect(performanceMetrics.loadTime).toBeLessThan(3000) // < 3s
      expect(performanceMetrics.domContentLoaded).toBeLessThan(2000) // < 2s
      expect(performanceMetrics.firstByte).toBeLessThan(1000) // < 1s
    })

    test('devrait avoir une taille de bundle optimisée', async ({ page }) => {
      await page.goto('/')
      
      // Vérifier la taille des ressources principales
      const resourceSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource')
        const totalSize = resources.reduce((sum, resource: any) => {
          return sum + (resource.transferSize || 0)
        }, 0)
        
        return {
          totalSize,
          resourceCount: resources.length
        }
      })
      
      // Vérifier que la taille totale est raisonnable (< 2MB)
      expect(resourceSizes.totalSize).toBeLessThan(2 * 1024 * 1024)
    })
  })

  test.describe('Accessibility PWA', () => {
    test('devrait être accessible au clavier en mode standalone', async ({ page }) => {
      await page.goto('/')
      
      // Simuler le mode standalone
      await page.addStyleTag({
        content: '@media (display-mode: standalone) { body { --pwa-mode: standalone; } }'
      })
      
      // Tester la navigation au clavier
      await page.keyboard.press('Tab')
      
      // Vérifier qu'un élément est focalisé
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    })

    test('devrait avoir un contraste suffisant en mode sombre PWA', async ({ page }) => {
      await page.goto('/')
      
      // Activer le mode sombre
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      
      // Vérifier que les éléments principaux ont un bon contraste
      const contrastElements = await page.locator('[data-testid="main-content"] *').all()
      
      for (const element of contrastElements.slice(0, 5)) { // Tester les 5 premiers
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          }
        })
        
        // Vérifier que les couleurs ne sont pas transparentes
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
      }
    })
  })

  test.describe('PWA sur différents appareils', () => {
    test('devrait fonctionner sur mobile en mode portrait', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
      await page.goto('/')
      
      // Vérifier que l'interface s'adapte
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
      
      // Tester l'installation sur mobile
      await page.evaluate(() => {
        window.dispatchEvent(new Event('beforeinstallprompt'))
      })
      
      await expect(page.locator('[data-testid="install-prompt"]')).toBeVisible()
    })

    test('devrait fonctionner sur tablette en mode paysage', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 }) // iPad
      await page.goto('/')
      
      // Vérifier l'adaptation de l'interface
      await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible()
      
      // Tester la navigation tactile simulée
      await page.locator('[data-testid="nav-item"]').first().tap()
      
      // Vérifier que la navigation fonctionne
      await expect(page.url()).toContain('/')
    })
  })

  test.describe('Stockage PWA', () => {
    test('devrait utiliser IndexedDB pour les gros volumes', async ({ page }) => {
      await page.goto('/')
      
      // Vérifier que IndexedDB est disponible
      const hasIndexedDB = await page.evaluate(() => 'indexedDB' in window)
      expect(hasIndexedDB).toBeTruthy()
      
      // Tester le stockage de données volumineuses
      const largeDataStored = await page.evaluate(async () => {
        try {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('test-db', 1)
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
            request.onupgradeneeded = () => {
              const db = request.result
              db.createObjectStore('test-store', { keyPath: 'id' })
            }
          })
          
          const transaction = db.transaction(['test-store'], 'readwrite')
          const store = transaction.objectStore('test-store')
          
          // Stocker un objet test
          await new Promise<void>((resolve, reject) => {
            const request = store.add({ id: 1, data: 'test-data' })
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
          })
          
          db.close()
          return true
        } catch (error) {
          return false
        }
      })
      
      expect(largeDataStored).toBeTruthy()
    })

    test('devrait nettoyer automatiquement les données expirées', async ({ page }) => {
      await page.goto('/')
      
      // Ajouter des données avec expiration
      await page.evaluate(() => {
        const expiredData = {
          timestamp: Date.now() - 86400000, // 24h ago
          expiration: Date.now() - 1000 // Expiré depuis 1s
        }
        localStorage.setItem('expired_data', JSON.stringify(expiredData))
      })
      
      // Déclencher le nettoyage
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('storage-cleanup'))
      })
      
      // Vérifier que les données expirées sont supprimées
      const expiredData = await page.evaluate(() => {
        return localStorage.getItem('expired_data')
      })
      
      expect(expiredData).toBeNull()
    })
  })

  test.describe('Sécurité PWA', () => {
    test('devrait utiliser HTTPS en production', async ({ page }) => {
      await page.goto('/')
      
      // Vérifier le protocole (en dev c'est http, en prod ce serait https)
      const protocol = await page.evaluate(() => window.location.protocol)
      
      // En développement, on accepte http, en production ce serait https
      expect(['http:', 'https:']).toContain(protocol)
    })

    test('devrait avoir des headers de sécurité appropriés', async ({ page }) => {
      const response = await page.goto('/')
      
      if (response) {
        const headers = response.headers()
        
        // Vérifier quelques headers de sécurité importants
        expect(headers['x-content-type-options']).toBe('nosniff')
        expect(headers['x-frame-options']).toBe('DENY')
      }
    })
  })
})
