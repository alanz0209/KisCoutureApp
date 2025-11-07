import { createRouter, createWebHistory } from 'vue-router';
import localforage from 'localforage';
import FirstSetup from '../views/FirstSetup.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Clients from '../views/Clients.vue';
import Orders from '../views/Orders.vue';
import Export from '../views/Export.vue';
import Settings from '../views/Settings.vue';

const routes = [
  {
    path: '/',
    redirect: '/setup'
  },
  {
    path: '/setup',
    name: 'FirstSetup',
    component: FirstSetup,
    meta: { requiresAuth: false, isPublic: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/export',
    name: 'Export',
    component: Export,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard pour vérifier l'authentification
router.beforeEach(async (to, from, next) => {
  // Vérifier si la configuration initiale est faite
  const setupDone = await localforage.getItem('initial_setup_done');
  
  // Si pas de setup et qu'on ne va pas vers /setup, rediriger vers /setup
  if (!setupDone && to.path !== '/setup') {
    return next('/setup');
  }
  
  // Si setup fait et qu'on va vers /setup, rediriger vers /login
  if (setupDone && to.path === '/setup') {
    return next('/login');
  }
  
  const isAuthenticated = await localforage.getItem('isAuthenticated');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Rediriger vers la page de connexion
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    // Si déjà connecté, rediriger vers le dashboard
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
