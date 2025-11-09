<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <img 
        src="../image-logo/256029840_429328851932740_2140541780136962484_n.jpg" 
        alt="KIS COUTURE Logo" 
        class="navbar-logo"
      />
      <h2>KIS COUTURE</h2>
    </div>
    <ul class="navbar-menu">
      <li><router-link to="/dashboard">Tableau de bord</router-link></li>
      <li><router-link to="/clients">Clients</router-link></li>
      <li><router-link to="/orders">Commandes</router-link></li>
      <li><router-link to="/export">Export</router-link></li>
      <li><router-link to="/settings">⚙️ Paramètres</router-link></li>
    </ul>
    <div class="navbar-status">
      <span :class="['status-indicator', online ? 'online' : 'offline']">
        {{ online ? '🟢 En ligne' : '🔴 Hors ligne' }}
      </span>
      <button v-if="online" class="btn btn-sync" @click="handleSync" :disabled="syncing">
        {{ syncing ? 'Synchronisation...' : '🔄 Sync' }}
      </button>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { syncData, isOnline } from '../api';
import { showNotification } from '../utils/notifications';

export default {
  name: 'Navbar',
  setup() {
    const online = ref(navigator.onLine);
    const syncing = ref(false);
    let syncInterval = null;

    const updateOnlineStatus = () => {
      online.value = navigator.onLine;
      if (online.value) {
        handleSync();
      }
    };

    const handleSync = async () => {
      if (!isOnline()) return;
      syncing.value = true;
      const success = await syncData();
      syncing.value = false;
      
      if (success) {
        showNotification(
          'Synchronisation réussie',
          'Toutes les données locales ont été envoyées au serveur.',
          'success'
        );
        // Recharger la page pour rafraîchir les données
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotification(
          'Erreur de synchronisation',
          'Vérifiez votre connexion internet.',
          'error'
        );
      }
    };

    onMounted(() => {
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      // Set up periodic sync every 3 minutes when online
      syncInterval = setInterval(() => {
        if (isOnline()) {
          handleSync();
        }
      }, 3 * 60 * 1000); // 3 minutes
    });

    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      // Clean up interval when component is destroyed
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    });

    return {
      online,
      syncing,
      handleSync
    };
  }
};
</script>

<style scoped>
.navbar {
  background-color: #e91e63;
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 768px) {
  .navbar {
    padding: 10px 15px;
    flex-direction: column;
    align-items: stretch;
  }
  
  .navbar-brand {
    justify-content: center;
  }
  
  .navbar-logo {
    width: 40px;
    height: 40px;
  }
  
  .navbar-brand h2 {
    font-size: 20px;
  }
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-logo {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.navbar-logo:hover {
  transform: rotate(360deg) scale(1.1);
}

.navbar-brand h2 {
  margin: 0;
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .navbar-menu {
    flex-direction: column;
    gap: 5px;
    width: 100%;
  }
  
  .navbar-menu li {
    width: 100%;
  }
  
  .navbar-menu li a {
    display: block;
    text-align: center;
  }
}

.navbar-menu li a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.navbar-menu li a:hover,
.navbar-menu li a.router-link-active {
  background-color: #c2185b;
}

.navbar-status {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .navbar-status {
    width: 100%;
    justify-content: space-between;
  }
}

.status-indicator {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.status-indicator.online {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.status-indicator.offline {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.btn-sync {
  background-color: #f06292;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-sync:hover:not(:disabled) {
  background-color: #ec407a;
}

.btn-sync:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
