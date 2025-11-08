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

      <div class="welcome-message">
        <h2>Bienvenue dans KIS COUTURE</h2>
        <p>L'application de gestion d'atelier de couture est maintenant accessible sans authentification.</p>
        <button @click="goToDashboard" class="btn-login">
          Accéder à l'Application
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();

    const goToDashboard = () => {
      router.push('/dashboard');
    };

    return {
      goToDashboard
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

.welcome-message {
  text-align: center;
  margin-top: 30px;
}

.welcome-message h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.welcome-message p {
  color: #7f8c8d;
  margin-bottom: 25px;
  line-height: 1.5;
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

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
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