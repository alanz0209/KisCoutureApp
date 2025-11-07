# KIS COUTURE - Application de Gestion

## 🚀 Installation et Démarrage

### 1. Backend (Python)

```bash
cd backend
pip install -r requirements.txt
```

Créer un fichier `.env` (copier depuis `.env.example`):
```
FLASK_ENV=development
SECRET_KEY=votre_cle_secrete
DATABASE_URL=sqlite:///kis_couture.db
UPLOAD_FOLDER=uploads
```

Démarrer le serveur:
```bash
python app.py
```
Le backend sera disponible sur http://localhost:5000

### 2. Frontend (React)

```bash
cd client
npm install
npm start
```
Le frontend sera disponible sur http://localhost:3000

## ✨ Fonctionnalités

### 📊 Tableau de bord
- Statistiques en temps réel
- Total des clients et commandes
- Bilan financier avec option masquer/afficher
- Suivi des commandes en cours et terminées

### 👥 Gestion des Clients
- Ajouter un nouveau client (Nom, Prénoms, Email, Téléphone)
- Liste complète des clients
- Supprimer un client

### 📏 Gestion des Mesures
- Sélection du client
- Enregistrement détaillé des mesures:
  - Dos, Poitrine, Taille, Longueur
  - Manche, Tour Manche
  - Ceinture, Bassin, Cuisse
  - Longueur Pantalon, Bas
- Upload d'image de référence
- Historique des mesures par client

### 📦 Gestion des Commandes
- Créer une commande pour un client
- Montant total, avancé et restant (calcul automatique)
- Onglets "En Cours" et "Terminées"
- Changer le statut des commandes
- Voir l'historique complet

### 🔄 Mode Hors Ligne
- Fonctionne sans connexion internet
- Stockage local des données (IndexedDB)
- Synchronisation automatique lors de la reconnexion
- Indicateur de statut en ligne/hors ligne
- Bouton de synchronisation manuelle

## 🛠️ Technologies Utilisées

**Backend:**
- Python 3.x
- Flask (API REST)
- SQLAlchemy (ORM)
- SQLite (Base de données)

**Frontend:**
- React 18
- React Router
- Axios (HTTP)
- LocalForage (Stockage hors ligne)

## 📱 Structure du Projet

```
KisCoutureApp/
├── backend/
│   ├── app.py              # Application Flask principale
│   ├── requirements.txt    # Dépendances Python
│   ├── uploads/           # Images uploadées
│   └── .env               # Configuration
│
└── client/
    ├── src/
    │   ├── components/    # Composants réutilisables
    │   ├── pages/         # Pages de l'application
    │   ├── utils/         # API et stockage offline
    │   └── App.js         # Application principale
    └── package.json
```

## 🎨 Branding
- Nom de l'entreprise: **KIS COUTURE** (affiché en haut à gauche)
- Interface en français
- Design moderne et responsive
