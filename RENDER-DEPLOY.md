# 🚀 Guide de Déploiement sur Render

## Étape 1 : Code sur GitHub ✅

Le code est déjà poussé sur : https://github.com/alanz0209/KisCoutureApp

---

## Étape 2 : Créer un compte Render

1. Aller sur [https://render.com](https://render.com)
2. Cliquer sur **"Get Started for Free"**
3. S'inscrire avec GitHub (recommandé)
4. Autoriser Render à accéder à vos repositories

---

## Étape 3 : Déployer le Backend (API Python)

### 3.1 Créer un nouveau Web Service

1. Dans le dashboard Render, cliquer **"New +"** → **"Web Service"**
2. Connecter votre repository : `alanz0209/KisCoutureApp`
3. Configurer le service :

**Configuration :**
```
Name: kis-couture-backend
Runtime: Python 3
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

**Variables d'environnement :**
```
PYTHON_VERSION = 3.11
DATABASE_URL = sqlite:///kis_couture.db
SECRET_KEY = (généré automatiquement par Render)
UPLOAD_FOLDER = uploads
```

4. Sélectionner le plan **Free**
5. Cliquer **"Create Web Service"**
6. ⏳ Attendre 2-3 minutes (le déploiement)

### 3.2 Noter l'URL du backend

Une fois déployé, vous aurez une URL comme :
```
https://kis-couture-backend.onrender.com
```

**⚠️ IMPORTANT : Copier cette URL, vous en aurez besoin pour le frontend !**

---

## Étape 4 : Déployer le Frontend (Vue.js)

### 4.1 Créer un nouveau Static Site

1. Dans Render, cliquer **"New +"** → **"Static Site"**
2. Sélectionner le même repository : `alanz0209/KisCoutureApp`
3. Configurer le site :

**Configuration :**
```
Name: kis-couture-frontend
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

**Variables d'environnement :**
```
VITE_API_URL = https://kis-couture-backend.onrender.com/api
```

⚠️ **Remplacer l'URL ci-dessus par celle obtenue à l'étape 3.2**

4. Sélectionner le plan **Free**
5. Cliquer **"Create Static Site"**
6. ⏳ Attendre 2-3 minutes

### 4.2 Votre application est en ligne ! 🎉

Vous aurez une URL comme :
```
https://kis-couture-frontend.onrender.com
```

---

## Étape 5 : Configurer CORS sur le Backend

Si vous rencontrez des erreurs CORS, retournez dans les paramètres du backend et ajoutez :

**Variable d'environnement :**
```
ALLOWED_ORIGINS = https://kis-couture-frontend.onrender.com
```

---

## 📱 Partager avec le Couturier

**Envoyez simplement :**

```
🌐 Application KIS COUTURE
https://kis-couture-frontend.onrender.com

🔑 Identifiants :
- Utilisateur : admin
- Mot de passe : kiscouture2025

✅ Fonctionne sur :
- 💻 Ordinateur (Windows, Mac, Linux)
- 📱 Téléphone (Android, iPhone)
- 📲 Tablette (iPad, Android)
- 🔌 Mode hors ligne disponible
```

---

## 🔄 Mettre à Jour l'Application

Après chaque modification du code :

1. **Push sur GitHub :**
```bash
git add .
git commit -m "Description des modifications"
git push
```

2. **Render détectera automatiquement** les changements et redéploiera l'application (2-3 minutes)

---

## ⚡ Plan Gratuit Render - Limitations

✅ **Avantages :**
- Hébergement gratuit à vie
- HTTPS automatique
- Déploiement automatique depuis GitHub
- 750 heures/mois (suffisant pour 1 projet)

⚠️ **Limitations :**
- Le serveur s'endort après 15 minutes d'inactivité
- Premier chargement peut prendre 30-60 secondes (réveil du serveur)
- 512 MB RAM (largement suffisant pour cette app)

💡 **Astuce :** Pour des performances optimales 24/7, upgrader vers le plan payant (7$/mois)

---

## 🆘 Résolution de Problèmes

### Le backend ne démarre pas ?
- Vérifier les logs dans Render Dashboard
- S'assurer que `gunicorn` est dans `requirements.txt` ✅

### Le frontend ne trouve pas le backend ?
- Vérifier que `VITE_API_URL` pointe vers la bonne URL
- Vérifier la console du navigateur (F12)

### Erreur 404 sur les routes ?
- S'assurer que le `_redirects` est dans `frontend/public/`

### L'application fonctionne localement mais pas en production ?
- Vérifier les variables d'environnement
- Vérifier les logs Render

---

## 📞 Support

Si vous rencontrez des problèmes, vérifier :
1. Les logs sur Render Dashboard
2. La console du navigateur (F12)
3. L'état des services sur status.render.com

---

Bonne chance avec le déploiement ! 🎉
