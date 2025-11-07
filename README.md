# KIS COUTURE - Application de Gestion d'Atelier de Couture

Application complète de gestion pour atelier de couture permettant la gestion des clients, mesures, commandes et exports de données. L'application fonctionne **100% hors ligne** avec synchronisation automatique.

![Version](https://img.shields.io/badge/version-1.0.0-pink)
![License](https://img.shields.io/badge/license-MIT-pink)

## 🎯 Fonctionnalités Principales

### 📱 Mode Hors Ligne Complet
- ✅ Fonctionne sans connexion internet
- ✅ Stockage local avec IndexedDB
- ✅ Images sauvegardées en base64
- ✅ Synchronisation automatique lors de la reconnexion
- ✅ Indicateurs visuels (🟢 En ligne / 🔴 Hors ligne)
- ✅ Badge "📱 Local" sur les données non synchronisées

### 👥 Gestion des Clients
- Création de clients avec informations complètes
- Mesures intégrées (11 champs de mesures)
- Upload de photos de référence
- Vue détaillée avec historique des commandes
- Interface liste/détails responsive

#### Champs de mesures :
- Dos, Poitrine, Taille
- Longueur, Manche, Tour Manche
- Ceinture, Bassin, Cuisse
- Longueur Pantalon, Bas

### 📦 Gestion des Commandes
- Création et modification de commandes
- Calcul automatique du montant restant
- Changement de statut (En Cours ↔️ Terminée)
- Filtres : Toutes / En Cours / Terminées
- Actions rapides : Modifier, Terminer, Réouvrir, Supprimer

### 📊 Tableau de Bord
- Statistiques en temps réel
- Nombre total de clients
- Nombre total de commandes
- Commandes en cours et terminées
- Bilan financier avec option masquer/afficher
  - Montant total
  - Avances reçues
  - Montants restants

### 💾 Export de Données
5 types d'export disponibles :

1. **Tous les Clients** (JSON, CSV, PDF)
   - Informations + Mesures + Commandes

2. **Client Spécifique** (JSON, PDF)
   - Fiche complète individuelle

3. **Toutes les Commandes** (JSON, CSV)
   - Liste avec détails financiers

4. **Rapport Financier** (JSON, PDF)
   - Statistiques complètes

5. **Backup Complet** (JSON)
   - Sauvegarde totale de la base de données

## 🎨 Design

- **Couleur principale** : Rose (#e91e63) - Correspond au logo KIS COUTURE
- **Design moderne** : Interface épurée et professionnelle
- **Responsive** : Optimisé pour mobile, tablette et desktop
- **Navigation intuitive** : Menu clair avec indicateurs d'état

## 🛠️ Technologies Utilisées

### Backend
- **Python 3.13**
- **Flask 3.0.0** - Framework web
- **SQLAlchemy 2.0.44** - ORM
- **SQLite** - Base de données (mode hors ligne)
- **Pillow** - Traitement d'images
- **Flask-CORS** - Gestion CORS

### Frontend
- **Vue.js 3** - Framework JavaScript
- **Vue Router 4** - Gestion des routes
- **Vite 7.2** - Build tool (ultra-rapide)
- **Axios** - Requêtes HTTP
- **LocalForage** - Stockage local IndexedDB

## 📁 Structure du Projet

```
KisCoutureApp/
├── backend/                 # API Flask
│   ├── app.py              # Application principale
│   ├── requirements.txt    # Dépendances Python
│   ├── uploads/            # Images uploadées
│   └── instance/           # Base de données SQLite
│
└── frontend/               # Application Vue.js
    ├── src/
    │   ├── views/         # Pages (Dashboard, Clients, Orders, Export)
    │   ├── components/    # Composants réutilisables (Navbar)
    │   ├── router/        # Configuration des routes
    │   ├── api.js         # Gestion API + mode hors ligne
    │   └── main.js        # Point d'entrée
    ├── public/
    └── package.json
```

## 🚀 Installation et Lancement

### Prérequis
- Python 3.13+
- Node.js 16+
- npm ou yarn

### 1. Backend (Flask)

```bash
# Accéder au dossier backend
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur (port 5000)
python app.py
```

Le backend sera accessible sur : `http://localhost:5000`

### 2. Frontend (Vue.js)

```bash
# Accéder au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer en mode développement (port 5173 ou 5174)
npm run dev
```

Le frontend sera accessible sur : `http://localhost:5173` (ou 5174)

### 3. Build pour Production

```bash
# Dans le dossier frontend
npm run build

# Les fichiers de production seront dans le dossier dist/
```

## 📱 Utilisation Mobile

L'application est **100% responsive** et optimisée pour :
- 📱 Smartphones (iOS et Android)
- 📱 Tablettes
- 💻 Ordinateurs de bureau

Le couturier peut utiliser son téléphone pour :
- Prendre des mesures sur place
- Créer des clients directement
- Ajouter des photos de référence
- Gérer les commandes en déplacement
- Tout fonctionne hors ligne !

## 🔄 Synchronisation

### Automatique
- Détection automatique du retour en ligne
- Badge d'état visible dans la barre de navigation

### Manuelle
1. Cliquer sur le bouton **🔄 Sync** dans la barre de navigation
2. Confirmation "✅ Synchronisation réussie !"
3. Toutes les données locales sont envoyées au serveur

## 💡 Cas d'Usage

### Scénario 1 : Nouveau Client
1. Le couturier est chez le client (possiblement sans internet)
2. Il crée un nouveau client avec toutes les informations
3. Il prend les mesures et ajoute une photo
4. Tout est sauvegardé localement
5. De retour à l'atelier avec internet, il clique sur "Sync"
6. Les données sont envoyées au serveur

### Scénario 2 : Nouvelle Commande
1. Créer une commande pour un client existant
2. Entrer le montant total et l'avance
3. Le montant restant se calcule automatiquement
4. Suivre l'avancement (En Cours → Terminée)

### Scénario 3 : Export Mensuel
1. Aller dans l'onglet "Export"
2. Télécharger le rapport financier
3. Exporter tous les clients en CSV pour comptabilité
4. Backup complet pour sauvegarde

## 🔐 Sécurité

- Stockage local sécurisé avec IndexedDB
- Pas de données sensibles en clair
- Backend avec validation des données
- CORS configuré pour le développement

## 🎯 Roadmap Future

- [ ] Authentification utilisateur
- [ ] Multi-utilisateurs
- [ ] Notifications push
- [ ] Calendrier de rendez-vous
- [ ] Gestion des stocks de tissus
- [ ] Factures PDF automatiques
- [ ] Envoi d'emails aux clients

## 📄 License

MIT License - Libre d'utilisation

## 👨‍💻 Support

Pour toute question ou problème, contactez le développeur.

---

**KIS COUTURE** - Simplifie la gestion de votre atelier de couture ✂️💖
