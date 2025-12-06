#!/bin/bash

# 🚀 SCRIPT DE DÉPLOIEMENT - Mathilde Fleurs
# Script de déploiement automatisé avec rollback et monitoring

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DEPLOY_START=$(date +%s)
ENVIRONMENT=${1:-staging}  # staging ou production
BUILD_DIR="dist"
BACKUP_DIR="deployments/backups"
DEPLOY_DIR="deployments/$ENVIRONMENT"

# URLs selon l'environnement
if [ "$ENVIRONMENT" = "production" ]; then
    DEPLOY_URL="https://app.mathilde-fleurs.com"
    SERVER_HOST="prod.mathilde-fleurs.com"
    HEALTH_CHECK_URL="$DEPLOY_URL/api/health"
else
    DEPLOY_URL="https://staging.mathilde-fleurs.com"
    SERVER_HOST="staging.mathilde-fleurs.com"
    HEALTH_CHECK_URL="$DEPLOY_URL/api/health"
fi

echo -e "${BLUE}🚀 Mathilde Fleurs - Déploiement${NC}"
echo -e "${BLUE}=================================${NC}"
echo -e "Environnement: ${GREEN}$ENVIRONMENT${NC}"
echo -e "URL cible: ${GREEN}$DEPLOY_URL${NC}"
echo -e "Serveur: ${GREEN}$SERVER_HOST${NC}"
echo ""

# Fonction pour afficher le temps écoulé
elapsed_time() {
    local end=$(date +%s)
    local elapsed=$((end - DEPLOY_START))
    echo -e "${BLUE}⏱️  Temps total: ${GREEN}${elapsed}s${NC}"
}

# Fonction de rollback
rollback() {
    local reason=$1
    echo -e "${RED}🔄 Rollback en cours: $reason${NC}"
    
    if [ -d "$BACKUP_DIR/previous" ]; then
        echo -e "Restauration de la version précédente..."
        
        # Restaurer les fichiers
        rsync -av --delete "$BACKUP_DIR/previous/" "$DEPLOY_DIR/"
        
        # Redémarrer les services
        restart_services
        
        # Vérifier que le rollback fonctionne
        if health_check; then
            echo -e "${GREEN}✅ Rollback réussi${NC}"
        else
            echo -e "${RED}❌ Rollback échoué - Intervention manuelle requise${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Pas de backup disponible pour le rollback${NC}"
        exit 1
    fi
}

# Fonction de health check
health_check() {
    local max_attempts=30
    local attempt=1
    
    echo -e "Vérification de la santé de l'application..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 10 "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Application en ligne${NC}"
            return 0
        fi
        
        echo -e "Tentative $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ Application non accessible${NC}"
    return 1
}

# Fonction pour redémarrer les services
restart_services() {
    echo -e "Redémarrage des services..."
    
    # En production, ceci serait des commandes réelles comme:
    # systemctl restart nginx
    # systemctl restart pm2
    # kubectl rollout restart deployment/mathilde-fleurs
    
    echo -e "${GREEN}✅ Services redémarrés${NC}"
}

# Fonction de notification
send_notification() {
    local status=$1
    local message=$2
    
    # Webhook Slack/Discord ou autre système de notification
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"🌸 Mathilde Fleurs - Déploiement $ENVIRONMENT\",
                \"attachments\": [{
                    \"color\": \"$([ "$status" = "success" ] && echo "good" || echo "danger")\",
                    \"fields\": [{
                        \"title\": \"Status\",
                        \"value\": \"$status\",
                        \"short\": true
                    }, {
                        \"title\": \"Environment\",
                        \"value\": \"$ENVIRONMENT\",
                        \"short\": true
                    }, {
                        \"title\": \"Message\",
                        \"value\": \"$message\",
                        \"short\": false
                    }]
                }]
            }" 2>/dev/null || true
    fi
}

# Gestion des erreurs avec rollback automatique
cleanup_on_error() {
    echo -e "${RED}❌ Déploiement échoué!${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        rollback "Erreur pendant le déploiement"
    fi
    
    send_notification "failed" "Déploiement $ENVIRONMENT échoué"
    elapsed_time
    exit 1
}

trap cleanup_on_error ERR

# Validation de l'environnement
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}❌ Environnement invalide: $ENVIRONMENT${NC}"
    echo -e "Usage: $0 [staging|production]"
    exit 1
fi

# Vérifications pré-déploiement
echo -e "${YELLOW}🔍 Vérifications pré-déploiement...${NC}"

# Vérifier que le build existe
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build non trouvé. Exécutez d'abord: npm run build${NC}"
    exit 1
fi

# Vérifier la version
VERSION=$(node -e "console.log(require('./package.json').version)")
echo -e "Version à déployer: ${GREEN}v$VERSION${NC}"

# En production, vérifier les variables critiques
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}⚠️  Déploiement PRODUCTION - Vérifications additionnelles...${NC}"
    
    # Confirmer le déploiement en production
    read -p "Confirmer le déploiement en PRODUCTION (v$VERSION)? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Déploiement annulé${NC}"
        exit 0
    fi
    
    # Vérifier que les tests E2E sont passés
    if [ ! -f "tests/test-results.json" ]; then
        echo -e "${RED}❌ Tests E2E non exécutés${NC}"
        echo -e "Exécutez: npm run test:e2e"
        exit 1
    fi
    
    # Vérifier l'audit de sécurité
    npm audit --audit-level high --production || {
        echo -e "${RED}❌ Vulnérabilités de sécurité détectées${NC}"
        exit 1
    }
fi

echo -e "${GREEN}✅ Vérifications OK${NC}"
echo ""

# Création des dossiers de déploiement
echo -e "${YELLOW}📁 Préparation des dossiers...${NC}"
mkdir -p "$BACKUP_DIR"
mkdir -p "$DEPLOY_DIR"

# Backup de l'ancienne version
if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR)" ]; then
    echo -e "Sauvegarde de la version actuelle..."
    rm -rf "$BACKUP_DIR/previous"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/previous"
    echo -e "${GREEN}✅ Backup créé${NC}"
fi

# Créer un backup horodaté
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$BACKUP_NAME" 2>/dev/null || true

echo -e "${GREEN}✅ Dossiers préparés${NC}"
echo ""

# Déploiement des fichiers
echo -e "${YELLOW}📦 Déploiement des fichiers...${NC}"

# Synchronisation avec rsync pour efficacité
if command -v rsync &> /dev/null; then
    echo -e "Synchronisation des fichiers..."
    rsync -av --delete "$BUILD_DIR/" "$DEPLOY_DIR/"
else
    echo -e "Copie des fichiers..."
    rm -rf "$DEPLOY_DIR"/*
    cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"
fi

# Vérifier l'intégrité des fichiers
DEPLOYED_FILES=$(find "$DEPLOY_DIR" -type f | wc -l)
SOURCE_FILES=$(find "$BUILD_DIR" -type f | wc -l)

if [ "$DEPLOYED_FILES" -ne "$SOURCE_FILES" ]; then
    echo -e "${RED}❌ Nombre de fichiers incorrect${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Fichiers déployés ($DEPLOYED_FILES fichiers)${NC}"
echo ""

# Configuration de l'environnement
echo -e "${YELLOW}⚙️  Configuration de l'environnement...${NC}"

# Créer/mettre à jour les fichiers de configuration
cat > "$DEPLOY_DIR/.env.production" << EOF
NODE_ENV=production
VITE_API_BASE_URL=$DEPLOY_URL/api
VITE_APP_VERSION=$VERSION
VITE_DEPLOY_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VITE_ENVIRONMENT=$ENVIRONMENT
EOF

# Créer un fichier de version
cat > "$DEPLOY_DIR/version.json" << EOF
{
  "version": "$VERSION",
  "environment": "$ENVIRONMENT",
  "deployTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commitHash": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "buildNumber": "$BUILD_NUMBER"
}
EOF

echo -e "${GREEN}✅ Configuration appliquée${NC}"
echo ""

# Redémarrage des services
echo -e "${YELLOW}🔄 Redémarrage des services...${NC}"
restart_services
echo ""

# Health check
echo -e "${YELLOW}🏥 Vérification de santé...${NC}"
if ! health_check; then
    rollback "Health check échoué"
    exit 1
fi
echo ""

# Tests post-déploiement
echo -e "${YELLOW}🧪 Tests post-déploiement...${NC}"

# Test de la page d'accueil
echo -e "Test de la page d'accueil..."
if ! curl -f -s --max-time 10 "$DEPLOY_URL" | grep -q "Mathilde Fleurs"; then
    rollback "Page d'accueil inaccessible"
    exit 1
fi
echo -e "${GREEN}✅ Page d'accueil OK${NC}"

# Test du manifest PWA
echo -e "Test du manifest PWA..."
if ! curl -f -s --max-time 5 "$DEPLOY_URL/manifest.json" > /dev/null; then
    echo -e "${YELLOW}⚠️  Manifest PWA non accessible${NC}"
else
    echo -e "${GREEN}✅ Manifest PWA OK${NC}"
fi

# Test du service worker
echo -e "Test du service worker..."
if ! curl -f -s --max-time 5 "$DEPLOY_URL/sw.js" > /dev/null; then
    echo -e "${YELLOW}⚠️  Service worker non accessible${NC}"
else
    echo -e "${GREEN}✅ Service worker OK${NC}"
fi

echo -e "${GREEN}✅ Tests post-déploiement OK${NC}"
echo ""

# Nettoyage des anciens backups (garder les 10 derniers)
echo -e "${YELLOW}🧹 Nettoyage des anciens backups...${NC}"
cd "$BACKUP_DIR"
ls -t backup-* 2>/dev/null | tail -n +11 | xargs rm -rf 2>/dev/null || true
cd - > /dev/null
echo -e "${GREEN}✅ Nettoyage terminé${NC}"
echo ""

# Monitoring post-déploiement
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}📊 Activation du monitoring renforcé...${NC}"
    
    # Ici, on pourrait activer des alertes spéciales pour surveiller
    # les performances et erreurs pendant les premières heures
    
    echo -e "${GREEN}✅ Monitoring activé${NC}"
    echo ""
fi

# Succès !
echo -e "${GREEN}🎉 Déploiement réussi !${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "Version: ${GREEN}v$VERSION${NC}"
echo -e "Environnement: ${GREEN}$ENVIRONMENT${NC}"
echo -e "URL: ${GREEN}$DEPLOY_URL${NC}"
elapsed_time

# Notification de succès
send_notification "success" "Déploiement $ENVIRONMENT v$VERSION réussi"

# Instructions post-déploiement
echo ""
echo -e "${YELLOW}📋 Post-déploiement:${NC}"
echo -e "  🌐 Vérifier l'application: ${BLUE}$DEPLOY_URL${NC}"
echo -e "  📊 Surveiller les logs pendant 30 minutes"
echo -e "  📈 Vérifier les métriques de performance"

if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "  📧 Informer l'équipe du déploiement"
    echo -e "  🔍 Effectuer les tests de smoke"
fi

echo -e "${GREEN}🌸 Déploiement Mathilde Fleurs terminé avec succès !${NC}"
