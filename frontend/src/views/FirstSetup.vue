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

      <div class="setup-form">
        <div class="info-box">
          <p>👋 Bienvenue dans KIS COUTURE !</p>
          <p>L'application est maintenant accessible sans authentification.</p>
        </div>

        <div class="welcome-message">
          <h2>Application prête à l'emploi</h2>
          <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de KIS COUTURE.</p>
          <button @click="goToDashboard" class="btn-setup">
            Accéder à l'Application
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'FirstSetup',
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

.welcome-message {
  text-align: center;
}

.welcome-message h2 {
  color: #27ae60;
  margin-bottom: 15px;
}

.welcome-message p {
  color: #7f8c8d;
  margin-bottom: 25px;
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

.btn-setup:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
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
