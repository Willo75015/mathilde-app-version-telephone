#!/bin/bash

# Script de nettoyage pour développement stable
echo "🧹 Nettoyage du cache de développement..."

# Arrêter tous les processus Vite existants
echo "⏹️ Arrêt des serveurs existants..."
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true

# Nettoyer les caches
echo "🗑️ Suppression des caches..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# Attendre un peu
sleep 2

echo "✅ Nettoyage terminé!"
echo "🚀 Démarrage du serveur propre..."

# Démarrer Vite avec options anti-refresh
exec npx vite --host 127.0.0.1 --port 3023 --clearScreen false --force
