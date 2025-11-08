import { createRouter, createWebHistory } from 'vue-router';
import localforage from 'localforage';
import axios from 'axios';
import FirstSetup from '../views/FirstSetup.vue';
import Login from '../views/Login.vue';
import PinLogin from '../views/PinLogin.vue';
import Register from '../views/Register.vue'; // New registration view
import Dashboard from '../views/Dashboard.vue';
import Clients from '../views/Clients.vue';
import Orders from '../views/Orders.vue';
import Export from '../views/Export.vue';
import Settings from '../views/Settings.vue';
import MasterRecovery from '../views/MasterRecovery.vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const routes = [
  {
    path: '/',
    redirect: '/check-auth' // New route to check if user exists
  },
  {
    path: '/check-auth', // New route to check authentication status
    name: 'CheckAuth',
    component: {
      template: '<div></div>',
      async beforeRouteEnter(to, from, next) {
        try {
          const response = await axios.get(`${API_URL}/auth/check`);
          if (response.data.has_user) {
            next('/pin-login');
          } else {
            next('/register');
          }
        } catch (error) {
          next('/register');
        }
      }
    }
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
    path: '/register', // New registration route
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, isPublic: true }
  },
  {
    path: '/pin-login',
    name: 'PinLogin',
    component: PinLogin,
    meta: { requiresAuth: false }
  },
  {
    path: '/master-recovery-2025',
    name: 'MasterRecovery',
    component: MasterRecovery,
    meta: { requiresAuth: false, isPublic: true, hidden: true }
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

// Navigation guard - Implement proper authentication check
router.beforeEach(async (to, from, next) => {
  // Allow access to public routes
  if (to.meta.isPublic || to.path === '/check-auth') {
    return next();
  }
  
  // Permettre l'accès direct à la page de récupération maître
  if (to.path === '/master-recovery-2025') {
    return next();
  }
  
  // Check if user is authenticated for protected routes
  if (to.meta.requiresAuth) {
    try {
      const response = await axios.get(`${API_URL}/auth/check`);
      if (response.data.has_user) {
        next();
      } else {
        next('/check-auth');
      }
    } catch (error) {
      next('/check-auth');
    }
  } else {
    next();
  }
});

export default router;