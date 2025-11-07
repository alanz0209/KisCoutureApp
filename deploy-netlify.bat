@echo off
echo ========================================
echo   DEPLOYMENT KIS COUTURE - NETLIFY
echo ========================================
echo.

cd frontend

echo [1/3] Installation des dependances...
call npm install
echo.

echo [2/3] Build de production...
call npm run build
echo.

echo [3/3] Pret pour le deploiement !
echo.
echo ========================================
echo   FICHIERS GENERES : frontend/dist
echo ========================================
echo.
echo PROCHAINES ETAPES :
echo 1. Aller sur https://app.netlify.com/drop
echo 2. Glisser-deposer le dossier 'dist'
echo 3. Votre site sera en ligne !
echo.
echo Ou installer Netlify CLI :
echo   npm install -g netlify-cli
echo   netlify deploy --prod --dir=dist
echo.
pause
