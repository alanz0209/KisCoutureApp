<template>
  <div class="container">
    <h1>⚙️ Paramètres</h1>

    <div class="settings-grid">
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

      <!-- Options de compte -->
      <div class="card">
        <h2>👤 Compte</h2>
        <p class="card-description">Gérer votre compte et vos préférences</p>

        <div class="account-actions">
          <button @click="handleLogout" class="btn-logout">
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { showNotification } from '../utils/notifications';

export default {
  name: 'Settings',
  setup() {
    const router = useRouter();

    const handleLogout = () => {
      // Show confirmation dialog
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        // Redirect to PIN login
        showNotification('Succès', 'Déconnexion réussie', 'success');
        router.push('/pin-login');
      }
    };

    return {
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

.app-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.app-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

.account-actions {
  text-align: center;
}

.btn-logout {
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>