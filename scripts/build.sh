#!/bin/bash

# 🏗️ SCRIPT DE BUILD - Mathilde Fleurs
# Script de build optimisé avec vérifications complètes

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BUILD_START=$(date +%s)
NODE_ENV=${NODE_ENV:-production}
BUILD_DIR="dist"
ANALYZE=${ANALYZE:-false}

echo -e "${BLUE}🌸 Mathilde Fleurs - Build Script${NC}"
echo -e "${BLUE}===================================${NC}"
echo -e "Environment: ${GREEN}$NODE_ENV${NC}"
echo -e "Build directory: ${GREEN}$BUILD_DIR${NC}"
echo -e "Analyze bundle: ${GREEN}$ANALYZE${NC}"
echo ""

# Fonction pour afficher le temps écoulé
elapsed_time() {
    local end=$(date +%s)
    local elapsed=$((end - BUILD_START))
    echo -e "${BLUE}⏱️  Temps total: ${GREEN}${elapsed}s${NC}"
}

# Fonction de nettoyage en cas d'erreur
cleanup_on_error() {
    echo -e "${RED}❌ Build failed! Cleaning up...${NC}"
    elapsed_time
    exit 1
}

# Trap pour gérer les erreurs
trap cleanup_on_error ERR

# 1. Vérification de l'environnement
echo -e "${YELLOW}🔍 Vérification de l'environnement...${NC}"

# Vérifier Node.js version
NODE_VERSION=$(node --version)
echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"

if ! node --version | grep -E "v1[89]|v[2-9][0-9]" > /dev/null; then
    echo -e "${RED}❌ Node.js 18+ requis${NC}"
    exit 1
fi

# Vérifier npm version
NPM_VERSION=$(npm --version)
echo -e "npm version: ${GREEN}$NPM_VERSION${NC}"

# Vérifier les variables d'environnement requises
if [ "$NODE_ENV" = "production" ]; then
    if [ -z "$VITE_API_BASE_URL" ]; then
        echo -e "${RED}❌ VITE_API_BASE_URL requis en production${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environnement vérifié${NC}"
echo ""

# 2. Nettoyage
echo -e "${YELLOW}🧹 Nettoyage des fichiers précédents...${NC}"
rm -rf $BUILD_DIR
rm -rf node_modules/.vite
rm -rf .eslintcache
echo -e "${GREEN}✅ Nettoyage terminé${NC}"
echo ""

# 3. Installation des dépendances
echo -e "${YELLOW}📦 Vérification des dépendances...${NC}"
if [ ! -d "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
    echo -e "Installation des dépendances..."
    npm ci --silent
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo -e "${GREEN}✅ Dépendances à jour${NC}"
fi
echo ""

# 4. Vérification de la qualité du code
echo -e "${YELLOW}🔍 Vérification de la qualité du code...${NC}"

# ESLint
echo -e "Running ESLint..."
npm run lint || {
    echo -e "${RED}❌ ESLint a détecté des erreurs${NC}"
    echo -e "${YELLOW}💡 Essayez: npm run lint:fix${NC}"
    exit 1
}
echo -e "${GREEN}✅ ESLint passed${NC}"

# TypeScript
echo -e "Vérification TypeScript..."
npm run type-check || {
    echo -e "${RED}❌ Erreurs TypeScript détectées${NC}"
    exit 1
}
echo -e "${GREEN}✅ TypeScript OK${NC}"

# Prettier
echo -e "Vérification du formatage..."
npm run format:check || {
    echo -e "${RED}❌ Code mal formaté${NC}"
    echo -e "${YELLOW}💡 Essayez: npm run format${NC}"
    exit 1
}
echo -e "${GREEN}✅ Formatage OK${NC}"
echo ""

# 5. Tests
echo -e "${YELLOW}🧪 Exécution des tests...${NC}"

# Tests unitaires
echo -e "Tests unitaires..."
npm run test:coverage || {
    echo -e "${RED}❌ Tests unitaires échoués${NC}"
    exit 1
}
echo -e "${GREEN}✅ Tests unitaires OK${NC}"

# Vérification du coverage
COVERAGE_THRESHOLD=80
COVERAGE_FILE="tests/coverage/coverage-summary.json"

if [ -f "$COVERAGE_FILE" ]; then
    COVERAGE=$(node -e "
        const coverage = require('./$COVERAGE_FILE');
        const lines = coverage.total.lines.pct;
        console.log(Math.round(lines));
    ")
    
    echo -e "Coverage: ${GREEN}${COVERAGE}%${NC}"
    
    if [ "$COVERAGE" -lt "$COVERAGE_THRESHOLD" ]; then
        echo -e "${RED}❌ Coverage insuffisant (< ${COVERAGE_THRESHOLD}%)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Coverage OK${NC}"
fi
echo ""

# 6. Build de production
echo -e "${YELLOW}🏗️  Build de production...${NC}"

# Configuration des variables d'environnement pour le build
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

# Afficher la configuration
echo -e "Configuration du build:"
echo -e "  NODE_ENV: ${GREEN}$NODE_ENV${NC}"
echo -e "  GENERATE_SOURCEMAP: ${GREEN}$GENERATE_SOURCEMAP${NC}"

# Exécution du build
if [ "$ANALYZE" = "true" ]; then
    echo -e "Build avec analyse du bundle..."
    npm run build:analyze
else
    npm run build
fi

echo -e "${GREEN}✅ Build terminé${NC}"
echo ""

# 7. Vérification du build
echo -e "${YELLOW}🔍 Vérification du build...${NC}"

# Vérifier que le dossier de build existe
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Dossier de build non trouvé${NC}"
    exit 1
fi

# Vérifier les fichiers essentiels
REQUIRED_FILES=("index.html" "assets")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -e "$BUILD_DIR/$file" ]; then
        echo -e "${RED}❌ Fichier manquant: $file${NC}"
        exit 1
    fi
done

# Calculer la taille du build
BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
echo -e "Taille du build: ${GREEN}$BUILD_SIZE${NC}"

# Vérifier la taille (alerte si > 5MB)
BUILD_SIZE_MB=$(du -sm $BUILD_DIR | cut -f1)
if [ "$BUILD_SIZE_MB" -gt 5 ]; then
    echo -e "${YELLOW}⚠️  Build volumineux (> 5MB)${NC}"
fi

echo -e "${GREEN}✅ Build vérifié${NC}"
echo ""

# 8. Optimisations post-build
echo -e "${YELLOW}⚡ Optimisations post-build...${NC}"

# Compression des assets
if command -v gzip &> /dev/null; then
    echo -e "Compression gzip des assets..."
    find $BUILD_DIR -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k {} \;
    echo -e "${GREEN}✅ Compression gzip terminée${NC}"
fi

# Génération du manifest des assets
echo -e "Génération du manifest..."
node -e "
const fs = require('fs');
const path = require('path');

function getFiles(dir, files = {}) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getFiles(filePath, files);
        } else {
            const relativePath = path.relative('$BUILD_DIR', filePath);
            files[relativePath] = {
                size: stat.size,
                modified: stat.mtime.toISOString()
            };
        }
    });
    return files;
}

const manifest = {
    buildTime: new Date().toISOString(),
    version: require('./package.json').version,
    files: getFiles('$BUILD_DIR')
};

fs.writeFileSync('$BUILD_DIR/build-manifest.json', JSON.stringify(manifest, null, 2));
console.log('✅ Manifest généré');
"

echo ""

# 9. Tests du build
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${YELLOW}🧪 Tests du build de production...${NC}"
    
    # Démarrer un serveur temporaire pour tester
    echo -e "Démarrage du serveur de test..."
    npm run preview &
    SERVER_PID=$!
    
    # Attendre que le serveur démarre
    sleep 5
    
    # Test basique avec curl
    if command -v curl &> /dev/null; then
        echo -e "Test de connectivité..."
        if curl -f -s http://localhost:4173 > /dev/null; then
            echo -e "${GREEN}✅ Serveur accessible${NC}"
        else
            echo -e "${RED}❌ Serveur inaccessible${NC}"
        fi
    fi
    
    # Arrêter le serveur de test
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
    
    echo -e "${GREEN}✅ Tests du build OK${NC}"
    echo ""
fi

# 10. Résumé final
echo -e "${GREEN}🎉 Build réussi !${NC}"
echo -e "${BLUE}===============${NC}"
echo -e "Dossier de build: ${GREEN}$BUILD_DIR${NC}"
echo -e "Taille: ${GREEN}$BUILD_SIZE${NC}"
echo -e "Fichiers générés:"

# Lister les fichiers principaux
find $BUILD_DIR -maxdepth 2 -type f -name "*.html" -o -name "*.js" -o -name "*.css" | head -10 | while read file; do
    filename=$(basename "$file")
    filesize=$(du -h "$file" | cut -f1)
    echo -e "  ${BLUE}$filename${NC} (${GREEN}$filesize${NC})"
done

echo ""
elapsed_time

# 11. Instructions pour le déploiement
if [ "$NODE_ENV" = "production" ]; then
    echo ""
    echo -e "${YELLOW}📋 Prêt pour le déploiement:${NC}"
    echo -e "  ${BLUE}npm run deploy:staging${NC}  # Déploiement staging"
    echo -e "  ${BLUE}npm run deploy:prod${NC}     # Déploiement production"
fi

echo -e "${GREEN}🌸 Build Mathilde Fleurs terminé avec succès !${NC}"
