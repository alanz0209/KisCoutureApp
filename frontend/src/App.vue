<template>
  <div id="app">
    <Navbar />
    <NotificationContainer />
    <router-view />
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import Navbar from './components/Navbar.vue';
import NotificationContainer from './components/NotificationContainer.vue';
import { requestNotificationPermission } from './utils/notifications';
import { autoSync } from './api';

export default {
  name: 'App',
  components: {
    Navbar,
    NotificationContainer
  },
  setup() {
    let syncInterval = null;
    
    onMounted(async () => {
      requestNotificationPermission();
      
      // Automatically sync data when app starts if online
      setTimeout(() => {
        autoSync();
      }, 2000); // Wait 2 seconds for everything to load
      
      // Set up periodic sync every 5 minutes when online
      syncInterval = setInterval(() => {
        autoSync();
      }, 5 * 60 * 1000); // 5 minutes
    });
    
    onUnmounted(() => {
      // Clean up interval when component is destroyed
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    });
  }
};
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>