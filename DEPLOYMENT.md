# 🚀 Guide de Déploiement - KIS COUTURE

Ce guide vous explique comment déployer votre application KIS COUTURE en ligne gratuitement.

---

## 📱 **Option 1 : Netlify (RECOMMANDÉ - Frontend uniquement)**

### ✅ Avantages :
- 100% gratuit
- Déploiement en 2 minutes
- HTTPS automatique
- Domaine personnalisé gratuit (.netlify.app)
- Mises à jour automatiques depuis GitHub
- Compatible PWA

### 📝 Étapes :

#### 1. Créer un compte Netlify
1. Aller sur [https://www.netlify.com](https://www.netlify.com)
2. Cliquer "Sign up" (gratuit)
3. S'inscrire avec GitHub, GitLab ou Email

#### 2. Déployer depuis GitHub (Méthode recommandée)

**A. Créer un repository GitHub :**
```bash
# Ouvrir le terminal dans le dossier du projet
cd c:\Users\Narcx\Desktop\KisCoutureApp

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - KIS COUTURE App"

# Créer un nouveau repo sur GitHub.com
# Puis lier le repo local :
git remote add origin https://github.com/VOTRE-USERNAME/kis-couture.git
git branch -M main
git push -u origin main
```

**B. Connecter à Netlify :**
1. Sur Netlify, cliquer "Add new site" → "Import an existing project"
2. Choisir "GitHub"
3. Autoriser l'accès à vos repos
4. Sélectionner le repo `kis-couture`
5. Configuration du build :
   - **Base directory** : `frontend`
   - **Build command** : `npm run build`
   - **Publish directory** : `frontend/dist`
6. Cliquer "Deploy site"

**C. Personnaliser le domaine :**
1. Dans Site settings → Domain management
2. Cliquer "Options" → "Edit site name"
3. Changer en : `kis-couture` (devient kis-couture.netlify.app)

✅ **Votre site est en ligne !**  
URL : `https://kis-couture.netlify.app`

---

#### 3. Déployer manuellement (Sans GitHub)

**A. Préparer les fichiers :**
```bash
cd c:\Users\Narcx\Desktop\KisCoutureApp\frontend
npm run build
```

**B. Déployer sur Netlify :**
1. Sur Netlify, cliquer "Add new site" → "Deploy manually"
2. Glisser-déposer le dossier `frontend/dist`
3. Attendre la fin du déploiement (30 secondes)

✅ **Terminé !** Votre site est en ligne

---

## 🌐 **Option 2 : Vercel (Frontend + Backend)**

### ✅ Avantages :
- Gratuit
- Supporte le backend Python
- Déploiement automatique
- HTTPS gratuit

### 📝 Étapes :

1. Aller sur [https://vercel.com](https://vercel.com)
2. S'inscrire (gratuit)
3. Installer Vercel CLI :
   ```bash
   npm install -g vercel
   ```
4. Déployer :
   ```bash
   cd c:\Users\Narcx\Desktop\KisCoutureApp
   vercel
   ```
5. Suivre les instructions :
   - Link to existing project? **No**
   - Project name? **kis-couture**
   - Directory? **.**
   - Build command? **npm run build**

✅ **URL** : `https://kis-couture.vercel.app`

---

## 🔥 **Option 3 : Render (Frontend + Backend)**

### ✅ Avantages :
- Gratuit (avec limitations)
- Backend Python inclus
- Base de données PostgreSQL gratuite
- Facile à configurer

### 📝 Étapes :

1. Aller sur [https://render.com](https://render.com)
2. S'inscrire (gratuit)
3. Cliquer "New +" → "Web Service"
4. Connecter votre repo GitHub
5. Configuration :
   - **Name** : kis-couture-backend
   - **Runtime** : Python 3
   - **Build Command** : `pip install -r backend/requirements.txt`
   - **Start Command** : `cd backend && python app.py`
6. Pour le frontend, créer un "Static Site" séparé

---

## 📦 **Option 4 : GitHub Pages (Frontend uniquement - Gratuit)**

### 📝 Étapes :

1. Installer `gh-pages` :
   ```bash
   cd c:\Users\Narcx\Desktop\KisCoutureApp\frontend
   npm install --save-dev gh-pages
   ```

2. Ajouter dans `package.json` :
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. Déployer :
   ```bash
   npm run deploy
   ```

4. Activer GitHub Pages :
   - Aller sur GitHub → Settings → Pages
   - Source : `gh-pages` branch
   - Sauvegarder

✅ **URL** : `https://VOTRE-USERNAME.github.io/kis-couture`

---

## 🎯 **Recommandation pour KIS COUTURE**

### Pour démarrer rapidement (Frontend seulement) :
**→ Utilisez Netlify** (Option 1)
- Le plus simple
- Gratuit à vie
- Parfait pour la PWA
- Déploiement en 2 minutes

### Pour une solution complète (Frontend + Backend) :
**→ Utilisez Render** (Option 3)
- Backend Python inclus
- Base de données gratuite
- Un peu plus lent mais complet

---

## ⚙️ **Configuration Post-Déploiement**

### 1. Mettre à jour l'URL du backend

Dans `frontend/src/api.js`, ligne 7 :
```javascript
// Avant (local)
const API_URL = 'http://localhost:5000/api';

// Après (production)
const API_URL = 'https://VOTRE-BACKEND-URL.onrender.com/api';
// Ou utiliser une variable d'environnement
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 2. Variables d'environnement sur Netlify

1. Site settings → Environment variables
2. Ajouter :
   - `VITE_API_URL` = URL de votre backend

### 3. Tester la PWA

1. Ouvrir votre site sur mobile
2. Navigateur → Menu → "Ajouter à l'écran d'accueil"
3. L'app s'installe comme une app native !

---

## 📱 **Partager l'Application**

Une fois déployée, envoyez simplement le lien :
```
https://kis-couture.netlify.app
```

Le couturier peut :
- ✅ Ouvrir dans le navigateur
- ✅ Installer comme app sur mobile
- ✅ Utiliser hors ligne
- ✅ Recevoir des notifications

---

## 🔄 **Mises à Jour**

### Avec GitHub + Netlify :
1. Modifier le code localement
2. Commit et push :
   ```bash
   git add .
   git commit -m "Amélioration XYZ"
   git push
   ```
3. Netlify redéploie automatiquement !

### Manuellement :
1. Rebuild :
   ```bash
   npm run build
   ```
2. Glisser-déposer `dist/` sur Netlify

---

## 💡 **Astuces**

1. **Domaine personnalisé** : Acheter un domaine (ex: kis-couture.com) sur Namecheap (10$/an)
2. **Analytics** : Ajouter Google Analytics pour voir les statistiques
3. **Backup** : GitHub sert de sauvegarde automatique
4. **Performance** : Netlify optimise automatiquement

---

## ❓ **Besoin d'aide ?**

- [Documentation Netlify](https://docs.netlify.com)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Render](https://render.com/docs)

---

**Bonne chance avec le déploiement ! 🚀**
