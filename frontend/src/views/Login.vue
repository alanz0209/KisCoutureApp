<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <img 
          src="../image-logo/256029840_429328851932740_2140541780136962484_n.jpg" 
          alt="KIS COUTURE Logo" 
          class="login-logo"
        />
        <h1>KIS COUTURE</h1>
        <p class="tagline">Gestion d'Atelier de Couture</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>
            <i class="icon">👤</i>
            Nom d'utilisateur
          </label>
          <input
            type="text"
            v-model="username"
            placeholder="Entrez votre nom d'utilisateur"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label>
            <i class="icon">🔒</i>
            Mot de passe
          </label>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Entrez votre mot de passe"
            required
            autocomplete="current-password"
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
          ⚠️ {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se Connecter' }}
        </button>
      </form>

      <div class="first-time-info">
        <p>🔐 <strong>Première connexion ?</strong></p>
        <p>Utilisateur par défaut : <code>admin</code></p>
        <p>Mot de passe par défaut : <code>kiscouture2025</code></p>
        <p class="info-text">Vous pourrez changer ces informations après connexion</p>
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
  name: 'Login',
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const loading = ref(false);
    const error = ref('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleLogin = async () => {
      loading.value = true;
      error.value = '';

      try {
        // Vérifier les credentials via l'API backend
        const response = await axios.post(`${API_URL}/auth/login`, {
          username: username.value,
          password: password.value
        });

        if (response.data.success) {
          // Enregistrer la session localement
          await localforage.setItem('isAuthenticated', true);
          await localforage.setItem('loginTime', new Date().toISOString());
          await localforage.setItem('username', username.value);
          
          // Rediriger vers le dashboard
          router.push('/dashboard');
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          error.value = 'Nom d\'utilisateur ou mot de passe incorrect';
        } else if (err.response && err.response.data) {
          error.value = err.response.data.error || 'Erreur de connexion';
        } else {
          error.value = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
        }
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      showPassword,
      loading,
      error,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(233, 30, 99, 0.3);
  padding: 40px;
  max-width: 450px;
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

.login-logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e91e63;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
  margin-bottom: 15px;
  transition: transform 0.3s ease;
}

.login-logo:hover {
  transform: scale(1.05);
}

.logo-section h1 {
  color: #e91e63;
  font-size: 32px;
  margin: 10px 0 5px 0;
  font-weight: bold;
}

.tagline {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-top: 30px;
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

.icon {
  font-size: 16px;
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

.btn-login {
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

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.first-time-info {
  margin-top: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #e91e63;
}

.first-time-info p {
  margin: 8px 0;
  font-size: 13px;
  color: #555;
}

.first-time-info strong {
  color: #e91e63;
}

.first-time-info code {
  background: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #e91e63;
  font-weight: 600;
}

.info-text {
  font-style: italic;
  color: #7f8c8d;
  font-size: 12px !important;
}

@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-logo {
    width: 100px;
    height: 100px;
  }

  .logo-section h1 {
    font-size: 26px;
  }
}
</style>
