#!/usr/bin/env node

/**
 * 📊 AUDIT DE PERFORMANCE - Mathilde Fleurs
 * Script d'audit automatisé des performances avec Lighthouse et métriques custom
 */

const fs = require('fs').promises
const path = require('path')
const { execSync, spawn } = require('child_process')

// Configuration
const CONFIG = {
  baseUrl: process.env.AUDIT_URL || 'http://localhost:3000',
  outputDir: 'performance-reports',
  thresholds: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 90,
    pwa: 85,
    fcp: 1500, // First Contentful Paint (ms)
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1,  // Cumulative Layout Shift
    tti: 3500  // Time to Interactive (ms)
  },
  pages: [
    '/',
    '/login',
    '/events',
    '/clients',
    '/calendar'
  ]
}

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  metric: (name, value, unit = '', good = true) => {
    const color = good ? colors.green : colors.red
    console.log(`  ${color}${name}: ${value}${unit}${colors.reset}`)
  }
}

/**
 * Vérifier que Lighthouse est installé
 */
async function checkLighthouse() {
  try {
    execSync('lighthouse --version', { stdio: 'pipe' })
    log.success('Lighthouse installé')
    return true
  } catch (error) {
    log.error('Lighthouse non installé')
    log.info('Installation: npm install -g lighthouse')
    return false
  }
}

/**
 * Vérifier que l'application est accessible
 */
async function checkAppAvailability() {
  try {
    const response = await fetch(CONFIG.baseUrl)
    if (response.ok) {
      log.success(`Application accessible sur ${CONFIG.baseUrl}`)
      return true
    }
  } catch (error) {
    log.error(`Application non accessible: ${CONFIG.baseUrl}`)
    log.info('Démarrez l\'application avec: npm run dev')
    return false
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  console.log(`${colors.blue}🌸 Mathilde Fleurs - Audit de Performance${colors.reset}`)
  console.log(`${colors.blue}==========================================${colors.reset}`)
  console.log(`URL cible: ${CONFIG.baseUrl}`)
  console.log(`Pages à auditer: ${CONFIG.pages.length}`)
  console.log('')

  const startTime = Date.now()

  // Créer le dossier de sortie
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true })
  } catch (error) {
    // Dossier existe déjà
  }

  // Vérifications préliminaires
  const lighthouseAvailable = await checkLighthouse()
  const appAvailable = await checkAppAvailability()

  if (!lighthouseAvailable || !appAvailable) {
    process.exit(1)
  }

  const results = {
    lighthouseResults: [],
    bundleStats: null,
    loadingPerformance: null,
    pwaOptimizations: null
  }

  // Audits Lighthouse pour chaque page
  console.log(`${colors.yellow}🔍 Audits Lighthouse${colors.reset}`)
  for (const page of CONFIG.pages) {
    const url = `${CONFIG.baseUrl}${page}`
    const pageName = page === '/' ? 'home' : page.substring(1)
    
    const result = await runLighthouseAudit(url, pageName)
    if (result) {
      results.lighthouseResults.push(result)
      
      // Afficher les scores
      console.log(`  📄 ${pageName}:`)
      log.metric('Performance', `${result.scores.performance}%`, '', result.scores.performance >= CONFIG.thresholds.performance)
      log.metric('Accessibilité', `${result.scores.accessibility}%`, '', result.scores.accessibility >= CONFIG.thresholds.accessibility)
      log.metric('Bonnes pratiques', `${result.scores.bestPractices}%`, '', result.scores.bestPractices >= CONFIG.thresholds.bestPractices)
      log.metric('SEO', `${result.scores.seo}%`, '', result.scores.seo >= CONFIG.thresholds.seo)
      
      if (result.scores.pwa > 0) {
        log.metric('PWA', `${result.scores.pwa}%`, '', result.scores.pwa >= CONFIG.thresholds.pwa)
      }
      
      console.log('')
    }
  }

  // Analyse du bundle
  console.log(`${colors.yellow}📦 Analyse du Bundle${colors.reset}`)
  results.bundleStats = await analyzeBundleMetrics()
  console.log('')

  // Performances de chargement
  console.log(`${colors.yellow}⚡ Performances de Chargement${colors.reset}`)
  results.loadingPerformance = await analyzeLoadingPerformance()
  console.log('')

  // Optimisations PWA
  console.log(`${colors.yellow}📱 Optimisations PWA${colors.reset}`)
  results.pwaOptimizations = await checkPWAOptimizations()
  console.log('')

  // Génération du rapport
  console.log(`${colors.yellow}📊 Génération du Rapport${colors.reset}`)
  const report = await generateReport(results)

  // Résumé final
  const endTime = Date.now()
  const duration = Math.round((endTime - startTime) / 1000)
  
  console.log(`${colors.green}🎉 Audit terminé en ${duration}s${colors.reset}`)
  console.log(`${colors.blue}================================${colors.reset}`)
  
  // Afficher le résumé
  const avgPerformance = report.summary.averagePerformance
  console.log(`Performance moyenne: ${avgPerformance >= CONFIG.thresholds.performance ? colors.green : colors.red}${avgPerformance}%${colors.reset}`)
  console.log(`Pages auditées: ${report.summary.totalPages}`)
  console.log(`Pages conformes: ${report.summary.passedAudits}/${report.summary.totalPages}`)
  
  // Recommandations
  if (report.summary.passedAudits < report.summary.totalPages) {
    console.log('')
    console.log(`${colors.yellow}💡 Recommandations:${colors.reset}`)
    
    for (const result of results.lighthouseResults) {
      if (result.scores.performance < CONFIG.thresholds.performance) {
        console.log(`  - Optimiser les performances de ${result.pageName}`)
        
        // Identifier les principales opportunités
        const opportunities = Object.entries(result.opportunities)
          .filter(([key, audit]) => audit.score !== null && audit.score < 0.9 && audit.details && audit.details.overallSavingsMs > 100)
          .sort((a, b) => b[1].details.overallSavingsMs - a[1].details.overallSavingsMs)
          .slice(0, 3)
        
        for (const [key, audit] of opportunities) {
          const savings = Math.round(audit.details.overallSavingsMs)
          console.log(`    • ${audit.title} (économie: ${savings}ms)`)
        }
      }
    }
  }
  
  console.log('')
  console.log(`Rapports disponibles dans: ${CONFIG.outputDir}/`)
  console.log(`  - performance-report.json`)
  console.log(`  - performance-report.html`)
  console.log(`  - lighthouse-*.json`)
  
  // Code de sortie
  process.exit(report.summary.passedAudits === report.summary.totalPages ? 0 : 1)
}

/**
 * Exécuter l'audit Lighthouse pour une page
 */
async function runLighthouseAudit(url, pageName) {
  const outputPath = path.join(CONFIG.outputDir, `lighthouse-${pageName}.json`)
  
  try {
    const command = [
      'lighthouse',
      url,
      '--output=json',
      `--output-path=${outputPath}`,
      '--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"',
      '--throttling-method=devtools',
      '--form-factor=desktop',
      '--preset=desktop',
      '--quiet'
    ].join(' ')
    
    execSync(command, { stdio: 'pipe' })
    
    // Lire et parser les résultats
    const reportData = await fs.readFile(outputPath, 'utf8')
    const report = JSON.parse(reportData)
    
    return {
      url,
      pageName,
      scores: {
        performance: Math.round(report.lhr.categories.performance.score * 100),
        accessibility: Math.round(report.lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(report.lhr.categories['best-practices'].score * 100),
        seo: Math.round(report.lhr.categories.seo.score * 100),
        pwa: report.lhr.categories.pwa ? Math.round(report.lhr.categories.pwa.score * 100) : 0
      },
      metrics: {
        fcp: report.lhr.audits['first-contentful-paint'].numericValue,
        lcp: report.lhr.audits['largest-contentful-paint'].numericValue,
        fid: report.lhr.audits['max-potential-fid'] ? report.lhr.audits['max-potential-fid'].numericValue : 0,
        cls: report.lhr.audits['cumulative-layout-shift'].numericValue,
        tti: report.lhr.audits['interactive'].numericValue,
        speed: report.lhr.audits['speed-index'].numericValue
      },
      opportunities: report.lhr.audits
    }
  } catch (error) {
    log.error(`Échec audit Lighthouse pour ${pageName}: ${error.message}`)
    return null
  }
}

/**
 * Analyser les métriques Bundle
 */
async function analyzeBundleMetrics() {
  const distPath = path.join(process.cwd(), 'dist')
  
  try {
    const stats = await getBundleStats(distPath)
    
    log.metric('Taille totale', `${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`, '', stats.totalSize < 5 * 1024 * 1024)
    log.metric('Fichiers JS', `${(stats.jsSize / 1024).toFixed(0)}KB`, '', stats.jsSize < 1024 * 1024)
    log.metric('Fichiers CSS', `${(stats.cssSize / 1024).toFixed(0)}KB`, '', stats.cssSize < 100 * 1024)
    log.metric('Images', `${(stats.imageSize / 1024).toFixed(0)}KB`)
    log.metric('Autres', `${(stats.otherSize / 1024).toFixed(0)}KB`)
    
    return stats
  } catch (error) {
    log.warning('Impossible d\'analyser le bundle')
    return null
  }
}

/**
 * Calculer les statistiques du bundle
 */
async function getBundleStats(distPath) {
  const stats = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    imageSize: 0,
    otherSize: 0,
    fileCount: 0
  }
  
  async function processDir(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory()) {
          await processDir(fullPath)
        } else {
          const stat = await fs.stat(fullPath)
          const ext = path.extname(entry.name).toLowerCase()
          
          stats.totalSize += stat.size
          stats.fileCount++
          
          if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            stats.jsSize += stat.size
          } else if (['.css', '.scss', '.sass'].includes(ext)) {
            stats.cssSize += stat.size
          } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
            stats.imageSize += stat.size
          } else {
            stats.otherSize += stat.size
          }
        }
      }
    } catch (error) {
      // Dossier non accessible, continuer
    }
  }
  
  await processDir(distPath)
  return stats
}

/**
 * Analyser les performances de chargement
 */
async function analyzeLoadingPerformance() {
  const startTime = Date.now()
  
  try {
    const response = await fetch(CONFIG.baseUrl)
    const loadTime = Date.now() - startTime
    
    const headers = response.headers
    const contentLength = headers.get('content-length')
    const cacheControl = headers.get('cache-control')
    const compression = headers.get('content-encoding')
    
    log.metric('Temps de réponse serveur', `${loadTime}ms`, '', loadTime < 200)
    log.metric('Taille de la page', contentLength ? `${Math.round(contentLength / 1024)}KB` : 'N/A')
    log.metric('Compression', compression || 'Aucune', '', !!compression)
    log.metric('Cache-Control', cacheControl || 'Aucun', '', !!cacheControl)
    
    return {
      loadTime,
      contentLength: contentLength ? parseInt(contentLength) : 0,
      compression: !!compression,
      cacheControl: !!cacheControl
    }
  } catch (error) {
    log.error(`Erreur analyse chargement: ${error.message}`)
    return null
  }
}

/**
 * Vérifier les optimisations PWA
 */
async function checkPWAOptimizations() {
  const checks = {
    manifest: false,
    serviceWorker: false,
    https: false,
    icons: false
  }
  
  try {
    // Vérifier le manifest
    const manifestResponse = await fetch(`${CONFIG.baseUrl}/manifest.json`)
    if (manifestResponse.ok) {
      checks.manifest = true
      const manifest = await manifestResponse.json()
      checks.icons = manifest.icons && manifest.icons.length > 0
    }
    
    // Vérifier le service worker
    const swResponse = await fetch(`${CONFIG.baseUrl}/sw.js`)
    checks.serviceWorker = swResponse.ok
    
    // Vérifier HTTPS (en production)
    checks.https = CONFIG.baseUrl.startsWith('https')
    
    log.metric('Manifest PWA', checks.manifest ? 'Présent' : 'Manquant', '', checks.manifest)
    log.metric('Service Worker', checks.serviceWorker ? 'Présent' : 'Manquant', '', checks.serviceWorker)
    log.metric('HTTPS', checks.https ? 'Activé' : 'Désactivé', '', checks.https)
    log.metric('Icônes PWA', checks.icons ? 'Présentes' : 'Manquantes', '', checks.icons)
    
  } catch (error) {
    log.warning(`Erreur vérification PWA: ${error.message}`)
  }
  
  return checks
}

/**
 * Générer le rapport consolidé
 */
async function generateReport(results) {
  const reportPath = path.join(CONFIG.outputDir, 'performance-report.json')
  const htmlReportPath = path.join(CONFIG.outputDir, 'performance-report.html')
  
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: CONFIG.baseUrl,
    summary: {
      totalPages: results.lighthouseResults.length,
      averagePerformance: Math.round(
        results.lighthouseResults.reduce((sum, r) => sum + r.scores.performance, 0) / 
        results.lighthouseResults.length
      ),
      passedAudits: results.lighthouseResults.filter(r => 
        r.scores.performance >= CONFIG.thresholds.performance
      ).length
    },
    results,
    thresholds: CONFIG.thresholds
  }
  
  // Sauvegarder en JSON
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  
  // Générer le rapport HTML
  const html = generateHTMLReport(report)
  await fs.writeFile(htmlReportPath, html)
  
  log.success(`Rapport JSON: ${reportPath}`)
  log.success(`Rapport HTML: ${htmlReportPath}`)
  
  return report
}

/**
 * Générer le rapport HTML
 */
function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Performance - Mathilde Fleurs</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #10b981; margin-bottom: 30px; text-align: center; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8fafc; padding: 20px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #10b981; }
        .metric-label { color: #6b7280; margin-top: 5px; }
        .page-results { margin-bottom: 30px; }
        .page-card { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 20px; overflow: hidden; }
        .page-header { background: #10b981; color: white; padding: 15px; font-weight: bold; }
        .scores { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; padding: 20px; }
        .score { text-align: center; padding: 10px; border-radius: 4px; }
        .score.good { background: #dcfce7; color: #166534; }
        .score.bad { background: #fecaca; color: #991b1b; }
        .score-value { font-size: 1.5em; font-weight: bold; }
        .score-label { font-size: 0.8em; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌸 Rapport de Performance - Mathilde Fleurs</h1>
        
        <div class="summary">
            <div class="metric-card">
                <div class="metric-value">${report.summary.averagePerformance}%</div>
                <div class="metric-label">Performance Moyenne</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.totalPages}</div>
                <div class="metric-label">Pages Auditées</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.passedAudits}/${report.summary.totalPages}</div>
                <div class="metric-label">Pages Conformes</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${new Date(report.timestamp).toLocaleDateString('fr-FR')}</div>
                <div class="metric-label">Date d'Audit</div>
            </div>
        </div>
        
        <div class="page-results">
            <h2>Résultats par Page</h2>
            ${report.results.lighthouseResults.map(result => `
                <div class="page-card">
                    <div class="page-header">${result.pageName} - ${result.url}</div>
                    <div class="scores">
                        <div class="score ${result.scores.performance >= report.thresholds.performance ? 'good' : 'bad'}">
                            <div class="score-value">${result.scores.performance}%</div>
                            <div class="score-label">Performance</div>
                        </div>
                        <div class="score ${result.scores.accessibility >= report.thresholds.accessibility ? 'good' : 'bad'}">
                            <div class="score-value">${result.scores.accessibility}%</div>
                            <div class="score-label">Accessibilité</div>
                        </div>
                        <div class="score ${result.scores.bestPractices >= report.thresholds.bestPractices ? 'good' : 'bad'}">
                            <div class="score-value">${result.scores.bestPractices}%</div>
                            <div class="score-label">Bonnes Pratiques</div>
                        </div>
                        <div class="score ${result.scores.seo >= report.thresholds.seo ? 'good' : 'bad'}">
                            <div class="score-value">${result.scores.seo}%</div>
                            <div class="score-label">SEO</div>
                        </div>
                        <div class="score ${result.scores.pwa >= report.thresholds.pwa ? 'good' : 'bad'}">
                            <div class="score-value">${result.scores.pwa}%</div>
                            <div class="score-label">PWA</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <p style="text-align: center; color: #6b7280; font-size: 0.9em;">
            Généré le ${new Date(report.timestamp).toLocaleString('fr-FR')}
        </p>
    </div>
</body>
</html>`
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  log.error(`Erreur non gérée: ${error.message}`)
  process.exit(1)
})

// Point d'entrée
if (require.main === module) {
  main().catch(error => {
    log.error(`Erreur fatale: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { main, CONFIG }
