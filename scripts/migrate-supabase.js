/**
 * Script de migration Supabase
 * Exécute le SQL de migration via l'API Management de Supabase
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://swaqyrgffqqexnnklner.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3YXF5cmdmZnFxZXhubmtsbmVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDk0MDM1MCwiZXhwIjoyMDgwNTE2MzUwfQ.3gVnsClV5qsYAm8BnXLlv16gYi8Rf9ltQqo2u9kEL8o'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Fonction pour créer une table via l'API
async function createTable(tableName, createSQL) {
  console.log(`📦 Création de la table: ${tableName}...`)

  // On utilise une requête RPC pour créer la table
  // Mais d'abord on doit vérifier si la table existe déjà
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)

  if (!error) {
    console.log(`   ✅ Table ${tableName} existe déjà`)
    return true
  }

  if (error.code === 'PGRST116') {
    console.log(`   ⚠️ Table ${tableName} n'existe pas, création nécessaire via SQL Editor`)
    return false
  }

  console.log(`   ❓ Statut inconnu pour ${tableName}:`, error.message)
  return false
}

// Liste des tables à vérifier
const tables = [
  'florists',
  'clients',
  'events',
  'event_florists',
  'event_flowers',
  'expenses',
  'event_templates',
  'user_settings'
]

async function checkTables() {
  console.log('🔍 Vérification des tables Supabase...\n')

  const results = []

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (!error) {
      console.log(`✅ ${table} - OK`)
      results.push({ table, exists: true })
    } else if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
      console.log(`❌ ${table} - N'EXISTE PAS`)
      results.push({ table, exists: false })
    } else {
      console.log(`⚠️ ${table} - Erreur: ${error.message}`)
      results.push({ table, exists: false, error: error.message })
    }
  }

  console.log('\n' + '='.repeat(50))

  const missing = results.filter(r => !r.exists)
  if (missing.length === 0) {
    console.log('🎉 Toutes les tables existent ! La synchronisation est prête.')
  } else {
    console.log(`⚠️ ${missing.length} table(s) manquante(s): ${missing.map(m => m.table).join(', ')}`)
    console.log('\n📋 Pour créer les tables, exécutez le SQL dans:')
    console.log('   supabase/migrations/001_initial_schema.sql')
    console.log('\n🔗 Via le SQL Editor de Supabase:')
    console.log('   https://supabase.com/dashboard/project/swaqyrgffqqexnnklner/sql')
  }

  return missing.length === 0
}

// Lancer la vérification
checkTables()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('Erreur:', err)
    process.exit(1)
  })
