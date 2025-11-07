import axios from 'axios';
import { offlineStorage } from './offlineStorage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// Check online status
export const isOnline = () => navigator.onLine;

// Sync function
export const syncData = async () => {
  if (!isOnline()) return false;
  
  try {
    const pendingChanges = await offlineStorage.getPendingChanges();
    
    if (pendingChanges.length > 0) {
      const response = await api.post('/sync', {
        clients: pendingChanges.filter(c => c.type === 'client').map(c => c.data),
        orders: pendingChanges.filter(c => c.type === 'order').map(c => c.data)
      });
      
      // Update local storage with server data
      await offlineStorage.saveClients(response.data.clients);
      await offlineStorage.saveOrders(response.data.orders);
      await offlineStorage.saveMeasurements(response.data.measurements);
      await offlineStorage.clearPendingChanges();
    }
    
    return true;
  } catch (error) {
    console.error('Sync error:', error);
    return false;
  }
};

export const clientAPI = {
  getAll: async () => {
    if (isOnline()) {
      try {
        const response = await api.get('/clients');
        await offlineStorage.saveClients(response.data);
        return response;
      } catch (error) {
        const data = await offlineStorage.getClients();
        return { data };
      }
    } else {
      const data = await offlineStorage.getClients();
      return { data };
    }
  },
  
  getOne: async (id) => {
    const clients = await offlineStorage.getClients();
    const client = clients.find(c => c.id === id);
    return { data: client };
  },
  
  create: async (data) => {
    if (isOnline()) {
      try {
        const response = await api.post('/clients', data);
        const clients = await offlineStorage.getClients();
        clients.push(response.data);
        await offlineStorage.saveClients(clients);
        return response;
      } catch (error) {
        // Save offline
        const tempId = `temp_${Date.now()}`;
        const newClient = { ...data, id: tempId };
        const clients = await offlineStorage.getClients();
        clients.push(newClient);
        await offlineStorage.saveClients(clients);
        await offlineStorage.addPendingChange({ type: 'client', action: 'create', data: newClient });
        return { data: newClient };
      }
    } else {
      const tempId = `temp_${Date.now()}`;
      const newClient = { ...data, id: tempId };
      const clients = await offlineStorage.getClients();
      clients.push(newClient);
      await offlineStorage.saveClients(clients);
      await offlineStorage.addPendingChange({ type: 'client', action: 'create', data: newClient });
      return { data: newClient };
    }
  },
  
  update: async (id, data) => {
    if (isOnline()) {
      try {
        const response = await api.put(`/clients/${id}`, data);
        const clients = await offlineStorage.getClients();
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
          clients[index] = response.data;
          await offlineStorage.saveClients(clients);
        }
        return response;
      } catch (error) {
        const clients = await offlineStorage.getClients();
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
          clients[index] = { ...clients[index], ...data };
          await offlineStorage.saveClients(clients);
          await offlineStorage.addPendingChange({ type: 'client', action: 'update', data: clients[index] });
        }
        return { data: clients[index] };
      }
    } else {
      const clients = await offlineStorage.getClients();
      const index = clients.findIndex(c => c.id === id);
      if (index !== -1) {
        clients[index] = { ...clients[index], ...data };
        await offlineStorage.saveClients(clients);
        await offlineStorage.addPendingChange({ type: 'client', action: 'update', data: clients[index] });
      }
      return { data: clients[index] };
    }
  },
  
  delete: async (id) => {
    if (isOnline()) {
      try {
        const response = await api.delete(`/clients/${id}`);
        const clients = await offlineStorage.getClients();
        const filtered = clients.filter(c => c.id !== id);
        await offlineStorage.saveClients(filtered);
        return response;
      } catch (error) {
        const clients = await offlineStorage.getClients();
        const filtered = clients.filter(c => c.id !== id);
        await offlineStorage.saveClients(filtered);
        await offlineStorage.addPendingChange({ type: 'client', action: 'delete', data: { id } });
        return { data: { message: 'Client supprimé' } };
      }
    } else {
      const clients = await offlineStorage.getClients();
      const filtered = clients.filter(c => c.id !== id);
      await offlineStorage.saveClients(filtered);
      await offlineStorage.addPendingChange({ type: 'client', action: 'delete', data: { id } });
      return { data: { message: 'Client supprimé' } };
    }
  }
};

export const orderAPI = {
  getAll: async (status) => {
    if (isOnline()) {
      try {
        const response = await api.get('/orders', { params: { status } });
        await offlineStorage.saveOrders(response.data);
        return response;
      } catch (error) {
        const data = await offlineStorage.getOrders();
        const filtered = status ? data.filter(o => o.status === status) : data;
        return { data: filtered };
      }
    } else {
      const data = await offlineStorage.getOrders();
      const filtered = status ? data.filter(o => o.status === status) : data;
      return { data: filtered };
    }
  },
  
  create: async (data) => {
    if (isOnline()) {
      try {
        const response = await api.post('/orders', data);
        const orders = await offlineStorage.getOrders();
        orders.push(response.data);
        await offlineStorage.saveOrders(orders);
        return response;
      } catch (error) {
        const tempId = `temp_${Date.now()}`;
        const newOrder = { ...data, id: tempId };
        const orders = await offlineStorage.getOrders();
        orders.push(newOrder);
        await offlineStorage.saveOrders(orders);
        await offlineStorage.addPendingChange({ type: 'order', action: 'create', data: newOrder });
        return { data: newOrder };
      }
    } else {
      const tempId = `temp_${Date.now()}`;
      const newOrder = { ...data, id: tempId };
      const orders = await offlineStorage.getOrders();
      orders.push(newOrder);
      await offlineStorage.saveOrders(orders);
      await offlineStorage.addPendingChange({ type: 'order', action: 'create', data: newOrder });
      return { data: newOrder };
    }
  },
  
  update: async (id, data) => {
    if (isOnline()) {
      try {
        const response = await api.put(`/orders/${id}`, data);
        const orders = await offlineStorage.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
          orders[index] = response.data;
          await offlineStorage.saveOrders(orders);
        }
        return response;
      } catch (error) {
        const orders = await offlineStorage.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
          orders[index] = { ...orders[index], ...data };
          await offlineStorage.saveOrders(orders);
          await offlineStorage.addPendingChange({ type: 'order', action: 'update', data: orders[index] });
        }
        return { data: orders[index] };
      }
    } else {
      const orders = await offlineStorage.getOrders();
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...data };
        await offlineStorage.saveOrders(orders);
        await offlineStorage.addPendingChange({ type: 'order', action: 'update', data: orders[index] });
      }
      return { data: orders[index] };
    }
  },
  
  delete: async (id) => {
    if (isOnline()) {
      try {
        const response = await api.delete(`/orders/${id}`);
        const orders = await offlineStorage.getOrders();
        const filtered = orders.filter(o => o.id !== id);
        await offlineStorage.saveOrders(filtered);
        return response;
      } catch (error) {
        const orders = await offlineStorage.getOrders();
        const filtered = orders.filter(o => o.id !== id);
        await offlineStorage.saveOrders(filtered);
        await offlineStorage.addPendingChange({ type: 'order', action: 'delete', data: { id } });
        return { data: { message: 'Commande supprimée' } };
      }
    } else {
      const orders = await offlineStorage.getOrders();
      const filtered = orders.filter(o => o.id !== id);
      await offlineStorage.saveOrders(filtered);
      await offlineStorage.addPendingChange({ type: 'order', action: 'delete', data: { id } });
      return { data: { message: 'Commande supprimée' } };
    }
  }
};

export const measurementAPI = {
  getByClient: async (clientId) => {
    if (isOnline()) {
      try {
        const response = await api.get(`/measurements/client/${clientId}`);
        return response;
      } catch (error) {
        const data = await offlineStorage.getMeasurements();
        const filtered = data.filter(m => m.client_id === clientId);
        return { data: filtered };
      }
    } else {
      const data = await offlineStorage.getMeasurements();
      const filtered = data.filter(m => m.client_id === clientId);
      return { data: filtered };
    }
  },
  
  create: async (formData) => {
    if (isOnline()) {
      try {
        const response = await api.post('/measurements', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response;
      } catch (error) {
        console.error('Error creating measurement:', error);
        throw error;
      }
    } else {
      throw new Error('Cannot create measurement with image offline');
    }
  },
  
  update: async (id, formData) => {
    if (isOnline()) {
      try {
        const response = await api.put(`/measurements/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response;
      } catch (error) {
        console.error('Error updating measurement:', error);
        throw error;
      }
    } else {
      throw new Error('Cannot update measurement with image offline');
    }
  }
};

export const statsAPI = {
  get: async () => {
    if (isOnline()) {
      try {
        const response = await api.get('/stats');
        await offlineStorage.saveStats(response.data);
        return response;
      } catch (error) {
        const data = await offlineStorage.getStats();
        return { data };
      }
    } else {
      const data = await offlineStorage.getStats();
      return { data };
    }
  }
};

export default api;
