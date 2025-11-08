<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-section">
        <img 
          src="../image-logo/256029840_429328851932740_2140541780136962484_n.jpg" 
          alt="KIS COUTURE Logo" 
          class="register-logo"
        />
        <h1>🔐 Configuration Initiale</h1>
        <p class="tagline">Définissez votre email et votre code PIN</p>
      </div>

      <div class="register-form">
        <h2>Créer votre compte</h2>
        <p>Entrez votre email et définissez un code PIN pour sécuriser l'application</p>
        
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>Email</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="votre@email.com" 
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label>Code PIN (4 chiffres)</label>
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
          </div>
          
          <div class="form-group">
            <label>Confirmer le code PIN</label>
            <div class="pin-input-container">
              <input 
                v-for="(digit, index) in confirmPinDigits" 
                :key="index"
                :ref="el => confirmPinInputs[index] = el"
                v-model="confirmPinDigits[index]"
                type="password" 
                maxlength="1"
                class="pin-digit"
                @input="handleConfirmPinInput(index)"
                @keydown="handleConfirmPinKeydown(index, $event)"
              />
            </div>
          </div>
          
          <button type="submit" class="btn-register" :disabled="loading">
            {{ loading ? 'Création...' : 'Créer le compte' }}
          </button>
        </form>
        
        <!-- Add login option -->
        <div class="login-option">
          <p>Déjà un compte ? 
            <button @click="goToLogin" class="link-button">Se connecter</button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { showNotification } from '../utils/notifications';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default {
  name: 'Register',
  setup() {
    const router = useRouter();
    const email = ref('');
    const pin = ref('');
    const confirmPin = ref('');
    const pinDigits = reactive(['', '', '', '']);
    const confirmPinDigits = reactive(['', '', '', '']);
    const pinInputs = ref([]);
    const confirmPinInputs = ref([]);
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

    const handleConfirmPinInput = (index) => {
      // Move to next input if current is filled
      if (confirmPinDigits[index] && index < 3 && confirmPinInputs.value[index + 1]) {
        confirmPinInputs.value[index + 1].focus();
      }
      
      // Update full confirm PIN
      confirmPin.value = confirmPinDigits.join('');
    };

    const handleConfirmPinKeydown = (index, event) => {
      // Handle backspace
      if (event.key === 'Backspace' && !confirmPinDigits[index] && index > 0) {
        confirmPinInputs.value[index - 1].focus();
      }
      
      // Only allow digits
      if (event.key !== 'Backspace' && 
          event.key !== 'Tab' && 
          event.key !== 'Enter' && 
          !/[0-9]/.test(event.key)) {
        event.preventDefault();
      }
    };

    const handleRegister = async () => {
      if (!email.value) {
        showNotification('Erreur', 'Veuillez entrer votre email', 'error');
        return;
      }
      
      if (pin.value.length !== 4) {
        showNotification('Erreur', 'Veuillez entrer un PIN de 4 chiffres', 'error');
        return;
      }
      
      if (confirmPin.value.length !== 4) {
        showNotification('Erreur', 'Veuillez confirmer votre PIN', 'error');
        return;
      }
      
      if (pin.value !== confirmPin.value) {
        showNotification('Erreur', 'Les codes PIN ne correspondent pas', 'error');
        return;
      }

      loading.value = true;
      
      try {
        // Register user with email and PIN
        const response = await axios.post(`${API_URL}/auth/register`, {
          username: email.value.split('@')[0], // Use part of email as username
          password: 'default_password', // Default password since we're using PIN
          pin: pin.value,
          email: email.value
        });
        
        if (response.data.success) {
          loading.value = false;
          showNotification('Succès', 'Compte créé avec succès', 'success');
          // Automatically login the user after successful registration
          handleAutoLogin(pin.value);
        } else {
          loading.value = false;
          showNotification('Erreur', response.data.error || 'Erreur lors de la création du compte', 'error');
        }
      } catch (error) {
        loading.value = false;
        showNotification('Erreur', error.response?.data?.error || 'Erreur lors de la création du compte', 'error');
      }
    };

    const handleAutoLogin = async (userPin) => {
      try {
        const response = await axios.post(`${API_URL}/auth/pin-login`, { pin: userPin });
        if (response.data.success) {
          showNotification('Succès', 'Connexion réussie', 'success');
          router.push('/dashboard');
        } else {
          showNotification('Erreur', response.data.error || 'Erreur de connexion', 'error');
          router.push('/pin-login');
        }
      } catch (error) {
        showNotification('Erreur', error.response?.data?.error || 'Erreur de connexion', 'error');
        router.push('/pin-login');
      }
    };

    const goToLogin = () => {
      router.push('/pin-login');
    };

    return {
      email,
      pin,
      confirmPin,
      pinDigits,
      confirmPinDigits,
      pinInputs,
      confirmPinInputs,
      loading,
      handlePinInput,
      handlePinKeydown,
      handleConfirmPinInput,
      handleConfirmPinKeydown,
      handleRegister,
      goToLogin
    };
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%);
  padding: 20px;
}

.register-card {
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

.register-logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e91e63;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
  margin-bottom: 15px;
  transition: transform 0.3s ease;
}

.register-logo:hover {
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

.register-form h2 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
}

.register-form p {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 25px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
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

.pin-input-container {
  display: flex;
  justify-content: center;
  gap: 15px;
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

.btn-register {
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

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-option {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.login-option p {
  color: #7f8c8d;
  margin: 0;
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
  .register-card {
    padding: 30px 20px;
  }

  .register-logo {
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