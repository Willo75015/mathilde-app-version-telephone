/**
 * 🧪 HELPERS E2E - Teardown Global
 * Nettoyage après les tests Playwright
 */

import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Nettoyage global après les tests E2E')
  
  try {
    // Nettoyer les fichiers temporaires de test
    await cleanupTestFiles()
    
    // Nettoyer les rapports anciens (garder les 5 derniers)
    await cleanupOldReports()
    
    // Afficher un résumé
    console.log('📊 Résumé du nettoyage :')
    console.log('  ✅ Fichiers temporaires supprimés')
    console.log('  ✅ Anciens rapports nettoyés')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
  
  console.log('✅ Nettoyage global terminé')
}

/**
 * Nettoie les fichiers temporaires créés pendant les tests
 */
async function cleanupTestFiles() {
  const tempDirs = [
    'tests/temp',
    'tests/downloads',
    'tests/uploads'
  ]
  
  for (const dir of tempDirs) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
        console.log(`🗑️ Supprimé: ${dir}`)
      }
    } catch (error) {
      console.warn(`⚠️ Impossible de supprimer ${dir}:`, error)
    }
  }
}

/**
 * Nettoie les anciens rapports de test (garde les 5 derniers)
 */
async function cleanupOldReports() {
  const reportDirs = [
    'tests/playwright-report',
    'tests/coverage',
    'tests/test-results'
  ]
  
  for (const reportDir of reportDirs) {
    try {
      if (!fs.existsSync(reportDir)) continue
      
      const items = fs.readdirSync(reportDir, { withFileTypes: true })
      const directories = items
        .filter(item => item.isDirectory())
        .map(item => ({
          name: item.name,
          path: path.join(reportDir, item.name),
          mtime: fs.statSync(path.join(reportDir, item.name)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
      
      // Garder les 5 derniers, supprimer les autres
      const toDelete = directories.slice(5)
      
      for (const dir of toDelete) {
        fs.rmSync(dir.path, { recursive: true, force: true })
        console.log(`🗑️ Ancien rapport supprimé: ${dir.name}`)
      }
      
    } catch (error) {
      console.warn(`⚠️ Erreur lors du nettoyage de ${reportDir}:`, error)
    }
  }
}

export default globalTeardown
