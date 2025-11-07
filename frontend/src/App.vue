<template>
  <div id="app">
    <Navbar v-if="isAuthenticated" />
    <NotificationContainer />
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import localforage from 'localforage';
import Navbar from './components/Navbar.vue';
import NotificationContainer from './components/NotificationContainer.vue';
import { requestNotificationPermission } from './utils/notifications';

export default {
  name: 'App',
  components: {
    Navbar,
    NotificationContainer
  },
  setup() {
    const route = useRoute();
    const isAuthenticated = ref(false);

    const checkAuth = async () => {
      isAuthenticated.value = await localforage.getItem('isAuthenticated') || false;
    };

    onMounted(async () => {
      await checkAuth();
      requestNotificationPermission();
    });

    watch(() => route.path, async () => {
      await checkAuth();
    });

    return {
      isAuthenticated
    };
  }
};
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
