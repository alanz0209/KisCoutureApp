import localforage from 'localforage';

// Configure offline storage
localforage.config({
  name: 'KisCouture',
  storeName: 'offline_data'
});

export const offlineStorage = {
  // Clients
  saveClients: async (clients) => {
    await localforage.setItem('clients', clients);
  },
  
  getClients: async () => {
    return await localforage.getItem('clients') || [];
  },
  
  // Orders
  saveOrders: async (orders) => {
    await localforage.setItem('orders', orders);
  },
  
  getOrders: async () => {
    return await localforage.getItem('orders') || [];
  },
  
  // Measurements
  saveMeasurements: async (measurements) => {
    await localforage.setItem('measurements', measurements);
  },
  
  getMeasurements: async () => {
    return await localforage.getItem('measurements') || [];
  },
  
  // Pending changes (for sync)
  addPendingChange: async (change) => {
    const pending = await localforage.getItem('pending_changes') || [];
    pending.push({ ...change, timestamp: Date.now() });
    await localforage.setItem('pending_changes', pending);
  },
  
  getPendingChanges: async () => {
    return await localforage.getItem('pending_changes') || [];
  },
  
  clearPendingChanges: async () => {
    await localforage.setItem('pending_changes', []);
  },
  
  // Stats
  saveStats: async (stats) => {
    await localforage.setItem('stats', stats);
  },
  
  getStats: async () => {
    return await localforage.getItem('stats') || {
      total_clients: 0,
      total_orders: 0,
      orders_en_cours: 0,
      orders_termine: 0,
      total_revenue: 0,
      total_avance: 0,
      total_restant: 0
    };
  }
};
