@echo off
echo 🧹 Nettoyage du cache de développement...

REM Arrêter tous les processus Vite existants
echo ⏹️ Arrêt des serveurs existants...
taskkill /F /IM node.exe 2>nul >nul
timeout /t 2 >nul

REM Nettoyer les caches
echo 🗑️ Suppression des caches...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul
if exist "dist" rmdir /s /q "dist" 2>nul
if exist ".vite" rmdir /s /q ".vite" 2>nul

echo ✅ Nettoyage terminé!
echo 🚀 Démarrage du serveur propre...

REM Démarrer Vite avec options anti-refresh
npx vite --host 127.0.0.1 --port 3023 --clearScreen false --force
