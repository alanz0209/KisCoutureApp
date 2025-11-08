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

      <div v-if="!showForgotPin" class="login-form">
        <h2>Connexion avec PIN</h2>
        <p>Entrez votre code PIN pour accéder à l'application</p>
        
        <form @submit.prevent="handlePinLogin">
          <div class="pin-input-container">
            <input 
              v-for="(digit, index) in pinDigits" 
              :key="index"
              :ref="el => pinInputs[index] = el"
              v-model="pinDigits[index]"
              type="password" 
              maxlength="1"
              class="pin-digit"
              @input="handlePinInput(index)"
              @keydown="handlePinKeydown(index, $event)"
            />
          </div>
          
          <button type="submit" class="btn-login" :disabled="pin.length !== 4 || loading">
            {{ loading ? 'Vérification...' : 'Accéder à l\'Application' }}
          </button>
        </form>
        
        <div class="forgot-pin-link">
          <button @click="showForgotPin = true" class="link-button">
            Mot de passe oublié ?
          </button>
        </div>
      </div>

      <div v-else class="forgot-pin-form">
        <h2>Réinitialiser le PIN</h2>
        <p>Entrez votre email pour recevoir les instructions de réinitialisation</p>
        
        <form @submit.prevent="handleForgotPin">
          <div class="form-group">
            <input 
              v-model="email" 
              type="email" 
              placeholder="Votre email" 
              class="form-input"
              required
            />
          </div>
          
          <button type="submit" class="btn-login" :disabled="loading">
            {{ loading ? 'Envoi...' : 'Envoyer les instructions' }}
          </button>
        </form>
        
        <div class="back-to-login">
          <button @click="showForgotPin = false" class="link-button">
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showNotification } from '../utils/notifications';

export default {
  name: 'PinLogin',
  setup() {
    const router = useRouter();
    const pin = ref('');
    const pinDigits = reactive(['', '', '', '']);
    const pinInputs = ref([]);
    const email = ref('');
    const showForgotPin = ref(false);
    const loading = ref(false);

    // Focus first PIN input on mount
    onMounted(() => {
      if (pinInputs.value[0]) {
        pinInputs.value[0].focus();
      }
    });

    const handlePinInput = (index) => {
      // Move to next input if current is filled
      if (pinDigits[index] && index < 3 && pinInputs.value[index + 1]) {
        pinInputs.value[index + 1].focus();
      }
      
      // Update full PIN
      pin.value = pinDigits.join('');
    };

    const handlePinKeydown = (index, event) => {
      // Handle backspace
      if (event.key === 'Backspace' && !pinDigits[index] && index > 0) {
        pinInputs.value[index - 1].focus();
      }
      
      // Only allow digits
      if (event.key !== 'Backspace' && 
          event.key !== 'Tab' && 
          event.key !== 'Enter' && 
          !/[0-9]/.test(event.key)) {
        event.preventDefault();
      }
    };

    const handlePinLogin = async () => {
      if (pin.value.length !== 4) {
        showNotification('Erreur', 'Veuillez entrer un PIN de 4 chiffres', 'error');
        return;
      }

      loading.value = true;
      
      try {
        // Simulate PIN verification
        setTimeout(() => {
          loading.value = false;
          showNotification('Succès', 'Connexion réussie', 'success');
          router.push('/dashboard');
        }, 1000);
      } catch (error) {
        loading.value = false;
        showNotification('Erreur', 'PIN incorrect', 'error');
      }
    };

    const handleForgotPin = async () => {
      if (!email.value) {
        showNotification('Erreur', 'Veuillez entrer votre email', 'error');
        return;
      }

      loading.value = true;
      
      try {
        // Simulate forgot PIN request
        setTimeout(() => {
          loading.value = false;
          showNotification('Succès', 'Instructions envoyées à votre email', 'success');
          showForgotPin.value = false;
          // Reset form
          email.value = '';
        }, 1000);
      } catch (error) {
        loading.value = false;
        showNotification('Erreur', 'Erreur lors de l\'envoi', 'error');
      }
    };

    return {
      pin,
      pinDigits,
      pinInputs,
      email,
      showForgotPin,
      loading,
      handlePinInput,
      handlePinKeydown,
      handlePinLogin,
      handleForgotPin
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

.login-form h2,
.forgot-pin-form h2 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
}

.login-form p,
.forgot-pin-form p {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 25px;
  line-height: 1.5;
}

.pin-input-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.pin-digit {
  width: 60px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  transition: all 0.3s ease;
}

.pin-digit:focus {
  border-color: #e91e63;
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #e91e63;
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
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
}

.forgot-pin-link,
.back-to-login {
  text-align: center;
  margin-top: 20px;
}

.link-button {
  background: none;
  border: none;
  color: #e91e63;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.link-button:hover {
  background-color: rgba(233, 30, 99, 0.1);
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

  .pin-digit {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .pin-input-container {
    gap: 10px;
  }

  .pin-digit {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}
</style>