/**
 * 🧪 HELPERS E2E - Setup Global
 * Configuration globale pour les tests Playwright
 */

import { chromium, FullConfig } from '@playwright/test'
import path from 'path'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setup global des tests E2E Mathilde Fleurs')
  
  // Configuration de la base URL
  const baseURL = process.env.BASE_URL || 'http://localhost:3000'
  console.log(`📍 Base URL: ${baseURL}`)
  
  // Lancer un navigateur pour vérifier que l'app est accessible
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    console.log('🔍 Vérification de la disponibilité de l\'application...')
    
    // Attendre que l'application soit prête (avec retry)
    let retries = 30
    let isReady = false
    
    while (retries > 0 && !isReady) {
      try {
        const response = await page.goto(baseURL, { 
          waitUntil: 'networkidle',
          timeout: 5000 
        })
        
        if (response?.ok()) {
          isReady = true
          console.log('✅ Application accessible')
        }
      } catch (error) {
        retries--
        console.log(`⏳ Tentative ${31 - retries}/30 - En attente...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    if (!isReady) {
      throw new Error('❌ L\'application n\'est pas accessible après 30 tentatives')
    }
    
    // Vérifier que les éléments essentiels sont présents
    console.log('🔍 Vérification des éléments essentiels...')
    
    // Vérifier le manifest
    const manifestResponse = await page.request.get('/manifest.json')
    if (!manifestResponse.ok()) {
      console.warn('⚠️ Manifest.json non accessible')
    } else {
      console.log('✅ Manifest PWA accessible')
    }
    
    // Vérifier le service worker
    const swResponse = await page.request.get('/sw.js')
    if (!swResponse.ok()) {
      console.warn('⚠️ Service Worker non accessible')
    } else {
      console.log('✅ Service Worker accessible')
    }
    
    // Initialiser les données de test si nécessaire
    await setupTestData(page)
    
  } finally {
    await page.close()
    await browser.close()
  }
  
  console.log('✅ Setup global terminé avec succès')
}

/**
 * Initialise les données de test dans localStorage
 */
async function setupTestData(page: any) {
  console.log('📊 Initialisation des données de test...')
  
  await page.evaluate(() => {
    // Nettoyer les données existantes
    localStorage.clear()
    
    // Données de test pour les clients
    const testClients = [
      {
        id: 'client-test-1',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'client-test-2',
        firstName: 'Marie',
        lastName: 'Dubois',
        email: 'marie.dubois@email.com',
        phone: '0987654321',
        address: {
          street: '456 Avenue des Champs',
          city: 'Lyon',
          postalCode: '69001',
          country: 'France'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    // Données de test pour les événements
    const testEvents = [
      {
        id: 'event-test-1',
        title: 'Mariage Sophie & Pierre',
        description: 'Décoration florale pour mariage en extérieur',
        date: new Date('2024-06-15').toISOString(),
        time: '14:00',
        location: 'Château de Versailles',
        clientId: 'client-test-1',
        budget: 1500,
        status: 'confirmed',
        flowers: [
          { flowerId: 'flower-1', quantity: 50 },
          { flowerId: 'flower-2', quantity: 30 }
        ],
        notes: 'Préférence pour les roses blanches et roses',
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'event-test-2',
        title: 'Anniversaire Marie',
        description: 'Bouquet d\'anniversaire',
        date: new Date('2024-07-20').toISOString(),
        time: '16:00',
        location: 'Domicile Lyon',
        clientId: 'client-test-2',
        budget: 80,
        status: 'draft',
        flowers: [
          { flowerId: 'flower-3', quantity: 12 }
        ],
        notes: 'Livraison à domicile',
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    // Données de test pour les fleurs
    const testFlowers = [
      {
        id: 'flower-1',
        name: 'Rose Rouge',
        category: 'roses',
        color: 'rouge',
        seasonality: ['spring', 'summer'],
        pricePerUnit: 3.50,
        stock: 200,
        description: 'Rose rouge classique'
      },
      {
        id: 'flower-2',
        name: 'Rose Blanche',
        category: 'roses',
        color: 'blanc',
        seasonality: ['spring', 'summer'],
        pricePerUnit: 3.50,
        stock: 150,
        description: 'Rose blanche pure'
      },
      {
        id: 'flower-3',
        name: 'Pivoine Rose',
        category: 'seasonal',
        color: 'rose',
        seasonality: ['spring'],
        pricePerUnit: 8.00,
        stock: 50,
        description: 'Pivoine de saison'
      }
    ]
    
    // Utilisateur de test
    const testUser = {
      id: 'user-test-1',
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
      }
    }
    
    // Stocker dans localStorage
    localStorage.setItem('mathilde_clients', JSON.stringify(testClients))
    localStorage.setItem('mathilde_events', JSON.stringify(testEvents))
    localStorage.setItem('mathilde_flowers', JSON.stringify(testFlowers))
    localStorage.setItem('mathilde_user', JSON.stringify(testUser))
    localStorage.setItem('mathilde_auth_token', 'test-auth-token')
    
    // Configuration PWA de test
    localStorage.setItem('mathilde_pwa_config', JSON.stringify({
      installPromptShown: false,
      lastUpdate: new Date().toISOString(),
      version: '1.0.0'
    }))
    
    console.log('✅ Données de test initialisées')
  })
}

export default globalSetup
