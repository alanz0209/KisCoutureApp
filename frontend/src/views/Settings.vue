<template>
  <div class="container">
    <h1>⚙️ Paramètres</h1>

    <div class="settings-grid">
      <!-- Changement de mot de passe -->
      <div class="card">
        <h2>🔐 Sécurité</h2>
        <p class="card-description">Modifiez vos identifiants de connexion</p>

        <form @submit.prevent="handleChangePassword" class="settings-form">
          <div class="form-group">
            <label>Nom d'utilisateur actuel</label>
            <input
              type="text"
              v-model="currentUsername"
              placeholder="admin"
              required
            />
          </div>

          <div class="form-group">
            <label>Mot de passe actuel</label>
            <input
              type="password"
              v-model="currentPassword"
              placeholder="••••••••"
              required
            />
          </div>

          <hr class="divider" />

          <div class="form-group">
            <label>Nouveau nom d'utilisateur</label>
            <input
              type="text"
              v-model="newUsername"
              placeholder="Nouveau nom d'utilisateur"
              required
            />
          </div>

          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              v-model="newPassword"
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              v-model="confirmPassword"
              placeholder="Confirmer le mot de passe"
              required
            />
          </div>

          <div v-if="message" :class="['message', messageType]">
            {{ message }}
          </div>

          <button type="submit" class="btn btn-primary">
            💾 Enregistrer les modifications
          </button>
        </form>
      </div>

      <!-- Déconnexion -->
      <div class="card">
        <h2>🚪 Session</h2>
        <p class="card-description">Gérez votre session actuelle</p>

        <div class="session-info">
          <p><strong>Connecté depuis:</strong> {{ loginTime }}</p>
          <p><strong>Statut:</strong> <span class="status-active">✅ Actif</span></p>
        </div>

        <button @click="handleLogout" class="btn btn-danger">
          🚪 Se Déconnecter
        </button>
      </div>

      <!-- Informations de l'application -->
      <div class="card">
        <h2>ℹ️ À propos</h2>
        <p class="card-description">Informations sur l'application</p>

        <div class="app-info">
          <p><strong>Application:</strong> KIS COUTURE</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Développé par:</strong> Alain Narcisse ZONGO</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import localforage from 'localforage';
import { showNotification } from '../utils/notifications';

export default {
  name: 'Settings',
  setup() {
    const router = useRouter();
    const currentUsername = ref('');
    const currentPassword = ref('');
    const newUsername = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const message = ref('');
    const messageType = ref('');
    const loginTime = ref('');

    onMounted(async () => {
      const time = await localforage.getItem('loginTime');
      if (time) {
        loginTime.value = new Date(time).toLocaleString('fr-FR');
      }
    });

    const handleChangePassword = async () => {
      message.value = '';
      messageType.value = '';

      // Vérifier que les nouveaux mots de passe correspondent
      if (newPassword.value !== confirmPassword.value) {
        message.value = 'Les nouveaux mots de passe ne correspondent pas';
        messageType.value = 'error';
        return;
      }

      try {
        // Récupérer les credentials actuels
        const storedUsername = await localforage.getItem('admin_username') || 'admin';
        const storedPassword = await localforage.getItem('admin_password') || 'kiscouture2025';

        // Vérifier les credentials actuels
        if (currentUsername.value !== storedUsername || currentPassword.value !== storedPassword) {
          message.value = 'Nom d\'utilisateur ou mot de passe actuel incorrect';
          messageType.value = 'error';
          return;
        }

        // Enregistrer les nouveaux credentials
        await localforage.setItem('admin_username', newUsername.value);
        await localforage.setItem('admin_password', newPassword.value);

        message.value = '✅ Identifiants modifiés avec succès !';
        messageType.value = 'success';

        showNotification('Identifiants modifiés', 'Vos nouveaux identifiants ont été enregistrés.', 'success');

        // Réinitialiser le formulaire
        currentUsername.value = '';
        currentPassword.value = '';
        newUsername.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
      } catch (error) {
        message.value = 'Erreur lors de la modification';
        messageType.value = 'error';
        console.error(error);
      }
    };

    const handleLogout = async () => {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        await localforage.setItem('isAuthenticated', false);
        await localforage.removeItem('loginTime');
        router.push('/login');
      }
    };

    return {
      currentUsername,
      currentPassword,
      newUsername,
      newPassword,
      confirmPassword,
      message,
      messageType,
      loginTime,
      handleChangePassword,
      handleLogout
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 20px;
}

.card-description {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 20px;
}

.settings-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #e91e63;
}

.divider {
  border: none;
  border-top: 2px solid #f0f0f0;
  margin: 20px 0;
}

.message {
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.session-info,
.app-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.session-info p,
.app-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

.status-active {
  color: #28a745;
  font-weight: 600;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #e91e63;
  color: white;
  width: 100%;
}

.btn-primary:hover {
  background-color: #c2185b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  width: 100%;
}

.btn-danger:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
