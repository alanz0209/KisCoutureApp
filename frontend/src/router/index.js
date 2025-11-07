import { createRouter, createWebHistory } from 'vue-router';
import localforage from 'localforage';
import axios from 'axios';
import FirstSetup from '../views/FirstSetup.vue';
import Login from '../views/Login.vue';
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

// Navigation guard pour vérifier l'authentification
router.beforeEach(async (to, from, next) => {
  // Permettre l'accès direct à la page de récupération maître
  if (to.path === '/master-recovery-2025') {
    return next();
  }
  
  // Vérifier si un utilisateur existe sur le backend
  try {
    const response = await axios.get(`${API_URL}/auth/check`);
    const hasUser = response.data.has_user;
    
    // Si pas d'utilisateur et qu'on ne va pas vers /setup, rediriger vers /setup
    if (!hasUser && to.path !== '/setup') {
      return next('/setup');
    }
    
    // Si utilisateur existe et qu'on va vers /setup, rediriger vers /login
    if (hasUser && to.path === '/setup') {
      return next('/login');
    }
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'utilisateur:', err);
    // En cas d'erreur réseau, continuer avec la vérification locale
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
