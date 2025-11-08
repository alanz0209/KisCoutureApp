<template>
  <div id="app">
    <Navbar />
    <NotificationContainer />
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue';
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
    onMounted(async () => {
      requestNotificationPermission();
      
      // Automatically sync data when app starts if online
      setTimeout(() => {
        autoSync();
      }, 2000); // Wait 2 seconds for everything to load
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