<template>
  <div class="setup-container">
    <div class="setup-card">
      <div class="logo-section">
        <img 
          src="../image-logo/256029840_429328851932740_2140541780136962484_n.jpg" 
          alt="KIS COUTURE Logo" 
          class="setup-logo"
        />
        <h1>🔐 Configuration Initiale</h1>
        <p class="tagline">Définissez vos identifiants personnalisés</p>
      </div>

      <div v-if="!isSetupComplete" class="setup-form">
        <div class="info-box">
          <p>⚠️ <strong>Important :</strong> Cette page ne s'affiche qu'une seule fois.</p>
          <p>Choisissez des identifiants forts et notez-les en lieu sûr.</p>
        </div>

        <form @submit.prevent="handleSetup">
          <div class="form-group">
            <label>
              <i class="icon">👤</i>
              Nom d'utilisateur personnalisé
            </label>
            <input
              type="text"
              v-model="newUsername"
              placeholder="Choisissez un nom d'utilisateur"
              required
              minlength="4"
            />
            <small>Minimum 4 caractères</small>
          </div>

          <div class="form-group">
            <label>
              <i class="icon">🔒</i>
              Mot de passe personnalisé
            </label>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="newPassword"
              placeholder="Choisissez un mot de passe fort"
              required
              minlength="8"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
            <small>Minimum 8 caractères</small>
          </div>

          <div class="form-group">
            <label>
              <i class="icon">🔒</i>
              Confirmer le mot de passe
            </label>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Retapez le mot de passe"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="accountExists" class="info-message">
            <p>👋 Un compte existe déjà !</p>
            <button type="button" @click="goToLogin" class="btn-login-existing">
              🔑 Se Connecter
            </button>
          </div>

          <button v-else type="submit" class="btn-setup" :disabled="loading">
            {{ loading ? '⏳ Configuration...' : '✅ Valider et Sécuriser' }}
          </button>
        </form>

        <div class="warning-box">
          <p>⚠️ <strong>Note importante :</strong></p>
          <p>Ces identifiants seront stockés localement et synchronisés.</p>
          <p>Assurez-vous de les mémoriser ou de les noter en sécurité.</p>
        </div>
      </div>

      <div v-else class="success-message">
        <div class="success-icon">✅</div>
        <h2>Configuration terminée !</h2>
        <p>Vos identifiants ont été enregistrés avec succès.</p>
        <button @click="goToLogin" class="btn-setup">
          Se Connecter
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import localforage from 'localforage';
import axios from 'axios';

export default {
  name: 'FirstSetup',
  setup() {
    const router = useRouter();
    const newUsername = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const loading = ref(false);
    const error = ref('');
    const isSetupComplete = ref(false);
    const accountExists = ref(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    onMounted(async () => {
      // Vérifier si un utilisateur existe déjà sur le backend
      try {
        const response = await axios.get(`${API_URL}/auth/check`);
        if (response.data.has_user) {
          // Un utilisateur existe, rediriger vers login
          router.push('/login');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification:', err);
      }
    });

    const handleSetup = async () => {
      error.value = '';

      // Validation
      if (newUsername.value.length < 4) {
        error.value = 'Le nom d\'utilisateur doit contenir au moins 4 caractères';
        return;
      }

      if (newPassword.value.length < 8) {
        error.value = 'Le mot de passe doit contenir au moins 8 caractères';
        return;
      }

      if (newPassword.value !== confirmPassword.value) {
        error.value = 'Les mots de passe ne correspondent pas';
        return;
      }

      loading.value = true;

      try {
        // Enregistrer sur le backend
        const response = await axios.post(`${API_URL}/auth/register`, {
          username: newUsername.value,
          password: newPassword.value
        });

        if (response.data.success) {
          // Marquer le setup comme terminé localement
          await localforage.setItem('initial_setup_done', true);
          await localforage.setItem('setup_date', new Date().toISOString());

          isSetupComplete.value = true;

          // Rediriger après 2 secondes
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          const errorMsg = err.response.data.error;
          if (errorMsg.includes('existe déjà') || errorMsg.includes('already exists')) {
            // Un compte existe, montrer le bouton de connexion
            accountExists.value = true;
            error.value = '';
          } else {
            error.value = errorMsg;
          }
        } else {
          error.value = 'Erreur de connexion au serveur. Vérifiez votre connexion.';
        }
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const goToLogin = () => {
      router.push('/login');
    };

    return {
      newUsername,
      newPassword,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      loading,
      error,
      isSetupComplete,
      accountExists,
      handleSetup,
      goToLogin
    };
  }
};
</script>

<style scoped>
.setup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%);
  padding: 20px;
}

.setup-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(233, 30, 99, 0.3);
  padding: 40px;
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.setup-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e91e63;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
  margin-bottom: 15px;
}

.logo-section h1 {
  color: #e91e63;
  font-size: 28px;
  margin: 10px 0 5px 0;
  font-weight: bold;
}

.tagline {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

.info-box {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-box p {
  margin: 5px 0;
  font-size: 14px;
  color: #1976d2;
}

.warning-box {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.warning-box p {
  margin: 5px 0;
  font-size: 13px;
  color: #e65100;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
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
  border-color: #e91e63;
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
}

.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #7f8c8d;
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
  border-left: 4px solid #e91e63;
}

.info-message {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
}

.info-message p {
  color: #1976d2;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
}

.btn-login-existing {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-login-existing:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.btn-setup {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
}

.btn-setup:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
}

.btn-setup:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  text-align: center;
  padding: 20px;
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

.success-message h2 {
  color: #27ae60;
  margin-bottom: 10px;
}

.success-message p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .setup-card {
    padding: 30px 20px;
  }

  .setup-logo {
    width: 80px;
    height: 80px;
  }

  .logo-section h1 {
    font-size: 24px;
  }
}
</style>
