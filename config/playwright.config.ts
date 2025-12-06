/**
 * 🎭 CONFIGURATION PLAYWRIGHT
 * Configuration optimisée pour tests E2E avec Playwright
 */

import { defineConfig, devices } from '@playwright/test'

/**
 * Configuration Playwright pour Mathilde Fleurs
 */
export default defineConfig({
  // Dossier des tests E2E
  testDir: '../tests/e2e',
  
  // Pattern des fichiers de test
  testMatch: '**/*.spec.ts',
  
  // Timeout global
  timeout: 30 * 1000, // 30 secondes
  
  // Expect timeout
  expect: {
    timeout: 5 * 1000 // 5 secondes
  },
  
  // Nombre de workers en parallèle
  workers: process.env.CI ? 1 : undefined,
  
  // Configuration de retry
  retries: process.env.CI ? 2 : 0,
  
  // Reporter de test
  reporter: [
    ['html', { outputFolder: '../tests/playwright-report' }],
    ['json', { outputFile: '../tests/test-results.json' }],
    ['line'],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Configuration globale
  use: {
    // URL de base
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Timeout pour les actions
    actionTimeout: 10 * 1000,
    
    // Timeout pour la navigation
    navigationTimeout: 10 * 1000,
    
    // Capture d'écran en cas d'échec
    screenshot: 'only-on-failure',
    
    // Vidéo en cas d'échec
    video: 'retain-on-failure',
    
    // Trace en cas d'échec
    trace: 'on-first-retry',
    
    // Headers par défaut
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
    },
    
    // Géolocalisation par défaut (Paris)
    geolocation: { longitude: 2.3522, latitude: 48.8566 },
    permissions: ['geolocation'],
    
    // Timezone
    timezoneId: 'Europe/Paris',
    
    // Locale
    locale: 'fr-FR',
    
    // User Agent personnalisé
    userAgent: 'Mathilde-Fleurs-E2E-Tests'
  },
  
  // Configuration des projets (différents navigateurs/appareils)
  projects: [
    {
      name: 'setup',
      testMatch: '**/setup.global.ts',
      teardown: 'cleanup'
    },
    
    {
      name: 'cleanup',
      testMatch: '**/cleanup.global.ts'
    },
    
    // Tests sur Desktop Chrome
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },
    
    // Tests sur Desktop Firefox
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },
    
    // Tests sur Desktop Safari
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup']
    },
    
    // Tests Mobile Chrome
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5']
      },
      dependencies: ['setup']
    },
    
    // Tests Mobile Safari
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12']
      },
      dependencies: ['setup']
    },
    
    // Tests Tablet
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro']
      },
      dependencies: ['setup']
    },
    
    // Tests PWA spécifiques
    {
      name: 'pwa-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Simuler une PWA installée
        contextOptions: {
          reducedMotion: 'reduce',
          forcedColors: 'none'
        }
      },
      dependencies: ['setup']
    }
  ],
  
  // Serveur de développement
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe'
  },
  
  // Dossiers de sortie
  outputDir: '../tests/test-results',
  
  // Configuration de la capture
  use: {
    ...devices['Desktop Chrome'],
    
    // Screenshots
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    // Video recording
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    }
  },
  
  // Configuration spécifique par environnement
  ...(process.env.NODE_ENV === 'ci' && {
    // Configuration CI/CD
    forbidOnly: true,
    retries: 3,
    workers: 2,
    reporter: [
      ['junit', { outputFile: '../tests/junit-results.xml' }],
      ['github']
    ]
  }),
  
  // Hooks globaux
  globalSetup: require.resolve('../tests/helpers/global-setup.ts'),
  globalTeardown: require.resolve('../tests/helpers/global-teardown.ts')
})
