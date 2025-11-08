import { createRouter, createWebHistory } from 'vue-router';
import localforage from 'localforage';
import axios from 'axios';
import FirstSetup from '../views/FirstSetup.vue';
import Login from '../views/Login.vue';
import PinLogin from '../views/PinLogin.vue';
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
    redirect: '/dashboard' // Direct access to dashboard
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
    meta: { requiresAuth: false } // Remove authentication requirement
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients,
    meta: { requiresAuth: false } // Remove authentication requirement
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: false } // Remove authentication requirement
  },
  {
    path: '/export',
    name: 'Export',
    component: Export,
    meta: { requiresAuth: false } // Remove authentication requirement
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: false } // Remove authentication requirement
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Remove all authentication checks
router.beforeEach(async (to, from, next) => {
  // Allow access to all routes without authentication
  next();
});

export default router;