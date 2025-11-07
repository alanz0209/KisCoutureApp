<template>
  <div class="recovery-container">
    <div class="recovery-card">
      <div class="logo-section">
        <h1>🔑 Récupération Maître</h1>
        <p class="warning-text">⚠️ Accès Administrateur Uniquement</p>
      </div>

      <div v-if="!isMasterVerified" class="master-login">
        <p class="info-text">
          Cette page permet de réinitialiser l'accès en cas d'oubli des identifiants.
        </p>

        <form @submit.prevent="handleMasterLogin">
          <div class="form-group">
            <label>Nom d'utilisateur Maître</label>
            <input
              type="text"
              v-model="masterUsername"
              placeholder="admin_rescue_kiscouture"
              required
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label>Mot de passe Maître</label>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="masterPassword"
              placeholder="Mot de passe de récupération"
              required
              autocomplete="off"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="btn-verify" :disabled="loading">
            {{ loading ? '⏳ Vérification...' : '🔓 Vérifier' }}
          </button>
        </form>
      </div>

      <div v-else class="reset-section">
        <div class="success-icon">✅</div>
        <h2>Accès Maître Vérifié</h2>
        <p>Vous pouvez maintenant réinitialiser les identifiants du couturier.</p>

        <div class="actions">
          <button @click="resetToDefaults" class="btn-action btn-warning">
            🔄 Réinitialiser aux Valeurs par Défaut
          </button>
          <button @click="goToSetup" class="btn-action btn-primary">
            🆕 Configurer de Nouveaux Identifiants
          </button>
          <button @click="logout" class="btn-action btn-secondary">
            ← Retour
          </button>
        </div>

        <div class="info-box">
          <h4>Informations:</h4>
          <ul>
            <li><strong>Réinitialiser aux Valeurs par Défaut</strong>: Restaure admin / kiscouture2025</li>
            <li><strong>Nouveaux Identifiants</strong>: Permet de définir de nouveaux identifiants personnalisés</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import localforage from 'localforage';
import axios from 'axios';

export default {
  name: 'MasterRecovery',
  setup() {
    const router = useRouter();
    const masterUsername = ref('');
    const masterPassword = ref('');
    const showPassword = ref(false);
    const loading = ref(false);
    const error = ref('');
    const isMasterVerified = ref(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleMasterLogin = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await axios.post(`${API_URL}/master-recovery/verify`, {
          username: masterUsername.value,
          password: masterPassword.value
        });

        if (response.data.valid) {
          isMasterVerified.value = true;
        } else {
          error.value = 'Identifiants maître incorrects';
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          error.value = 'Identifiants maître incorrects';
        } else {
          error.value = 'Erreur de connexion au serveur. Vérifiez que le backend est accessible.';
        }
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const resetToDefaults = async () => {
      if (confirm('Réinitialiser les identifiants aux valeurs par défaut (admin / kiscouture2025) ?')) {
        try {
          // Réinitialiser le stockage local
          await localforage.clear();
          await localforage.setItem('admin_username', 'admin');
          await localforage.setItem('admin_password', 'kiscouture2025');
          await localforage.setItem('initial_setup_done', true);
          
          alert('✅ Identifiants réinitialisés avec succès!\n\nNouveau username: admin\nNouveau password: kiscouture2025');
          
          router.push('/login');
        } catch (err) {
          error.value = 'Erreur lors de la réinitialisation';
          console.error(err);
        }
      }
    };

    const goToSetup = async () => {
      try {
        // Effacer tout sauf la vérification master
        await localforage.clear();
        
        alert('✅ Vous allez être redirigé vers la configuration initiale.\nLe couturier pourra définir de nouveaux identifiants.');
        
        router.push('/setup');
      } catch (err) {
        error.value = 'Erreur lors de la redirection';
        console.error(err);
      }
    };

    const logout = () => {
      router.push('/login');
    };

    return {
      masterUsername,
      masterPassword,
      showPassword,
      loading,
      error,
      isMasterVerified,
      handleMasterLogin,
      resetToDefaults,
      goToSetup,
      logout
    };
  }
};
</script>

<style scoped>
.recovery-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  padding: 20px;
}

.recovery-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 500px;
  width: 100%;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-section h1 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 10px;
}

.warning-text {
  color: #e74c3c;
  font-weight: bold;
  font-size: 14px;
}

.info-text {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #1976d2;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 38px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  text-align: center;
  border-left: 4px solid #e74c3c;
}

.btn-verify {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-verify:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(44, 62, 80, 0.4);
}

.btn-verify:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-section {
  text-align: center;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.reset-section h2 {
  color: #27ae60;
  margin-bottom: 10px;
}

.reset-section p {
  color: #7f8c8d;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-action {
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.info-box {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  padding: 15px;
  border-radius: 8px;
  text-align: left;
}

.info-box h4 {
  margin-top: 0;
  color: #e65100;
}

.info-box ul {
  margin: 10px 0;
  padding-left: 20px;
}

.info-box li {
  margin: 5px 0;
  font-size: 13px;
  color: #e65100;
}

@media (max-width: 768px) {
  .recovery-card {
    padding: 30px 20px;
  }
}
</style>
