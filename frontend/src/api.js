import axios from 'axios';
import localforage from 'localforage';

// API URL - utilise la variable d'environnement ou localhost par défaut
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure localforage
localforage.config({
  name: 'KisCouture',
  storeName: 'offline_data'
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const isOnline = () => navigator.onLine;

// Clients API
export const clientAPI = {
  async getAll() {
    if (isOnline()) {
      try {
        const response = await api.get('/clients');
        await localforage.setItem('clients', response.data);
        return response.data;
      } catch (error) {
        return await localforage.getItem('clients') || [];
      }
    }
    return await localforage.getItem('clients') || [];
  },

  async create(data) {
    if (isOnline()) {
      try {
        const response = await api.post('/clients', data);
        const clients = await localforage.getItem('clients') || [];
        clients.push(response.data);
        await localforage.setItem('clients', clients);
        return response.data;
      } catch (error) {
        const tempId = `temp_${Date.now()}`;
        const newClient = { ...data, id: tempId, created_at: new Date().toISOString() };
        const clients = await localforage.getItem('clients') || [];
        clients.push(newClient);
        await localforage.setItem('clients', clients);
        return newClient;
      }
    }
    const tempId = `temp_${Date.now()}`;
    const newClient = { ...data, id: tempId, created_at: new Date().toISOString() };
    const clients = await localforage.getItem('clients') || [];
    clients.push(newClient);
    await localforage.setItem('clients', clients);
    return newClient;
  },

  async update(id, data) {
    if (isOnline()) {
      try {
        const response = await api.put(`/clients/${id}`, data);
        const clients = await localforage.getItem('clients') || [];
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
          clients[index] = response.data;
          await localforage.setItem('clients', clients);
        }
        return response.data;
      } catch (error) {
        const clients = await localforage.getItem('clients') || [];
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
          clients[index] = { ...clients[index], ...data };
          await localforage.setItem('clients', clients);
          return clients[index];
        }
        throw error;
      }
    }
    // Mode hors ligne
    const clients = await localforage.getItem('clients') || [];
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data };
      await localforage.setItem('clients', clients);
      return clients[index];
    }
    throw new Error('Client non trouvé');
  },

  async delete(id) {
    if (isOnline()) {
      try {
        await api.delete(`/clients/${id}`);
      } catch (error) {
        console.error(error);
      }
    }
    const clients = await localforage.getItem('clients') || [];
    const filtered = clients.filter(c => c.id !== id);
    await localforage.setItem('clients', filtered);
  }
};

// Orders API
export const orderAPI = {
  async getAll(status) {
    if (isOnline()) {
      try {
        const response = await api.get('/orders', { params: { status } });
        await localforage.setItem('orders', response.data);
        return response.data;
      } catch (error) {
        const data = await localforage.getItem('orders') || [];
        return status ? data.filter(o => o.status === status) : data;
      }
    }
    const data = await localforage.getItem('orders') || [];
    return status ? data.filter(o => o.status === status) : data;
  },

  async create(data) {
    if (isOnline()) {
      try {
        const response = await api.post('/orders', data);
        const orders = await localforage.getItem('orders') || [];
        orders.push(response.data);
        await localforage.setItem('orders', orders);
        return response.data;
      } catch (error) {
        const tempId = `temp_${Date.now()}`;
        const newOrder = { ...data, id: tempId };
        const orders = await localforage.getItem('orders') || [];
        orders.push(newOrder);
        await localforage.setItem('orders', orders);
        return newOrder;
      }
    }
    const tempId = `temp_${Date.now()}`;
    const newOrder = { ...data, id: tempId, status: 'en_cours' };
    const orders = await localforage.getItem('orders') || [];
    orders.push(newOrder);
    await localforage.setItem('orders', orders);
    return newOrder;
  },

  async update(id, data) {
    if (isOnline()) {
      try {
        const response = await api.put(`/orders/${id}`, data);
        const orders = await localforage.getItem('orders') || [];
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
          orders[index] = response.data;
          await localforage.setItem('orders', orders);
        }
        return response.data;
      } catch (error) {
        const orders = await localforage.getItem('orders') || [];
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
          orders[index] = { ...orders[index], ...data };
          await localforage.setItem('orders', orders);
        }
        return orders[index];
      }
    }
    const orders = await localforage.getItem('orders') || [];
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...data };
      await localforage.setItem('orders', orders);
    }
    return orders[index];
  },

  async delete(id) {
    if (isOnline()) {
      try {
        await api.delete(`/orders/${id}`);
      } catch (error) {
        console.error(error);
      }
    }
    const orders = await localforage.getItem('orders') || [];
    const filtered = orders.filter(o => o.id !== id);
    await localforage.setItem('orders', filtered);
  }
};

// Measurements API
export const measurementAPI = {
  async getByClient(clientId) {
    if (isOnline()) {
      try {
        const response = await api.get(`/measurements/client/${clientId}`);
        const measurements = await localforage.getItem('measurements') || [];
        const filtered = measurements.filter(m => m.client_id !== clientId);
        const updated = [...filtered, ...response.data];
        await localforage.setItem('measurements', updated);
        return response.data;
      } catch (error) {
        const data = await localforage.getItem('measurements') || [];
        return data.filter(m => m.client_id === clientId);
      }
    }
    const data = await localforage.getItem('measurements') || [];
    return data.filter(m => m.client_id === clientId);
  },

  async create(formData) {
    const hasImage = formData.get('image') && formData.get('image').size > 0;
    
    if (isOnline()) {
      try {
        const response = await api.post('/measurements', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const measurements = await localforage.getItem('measurements') || [];
        measurements.push(response.data);
        await localforage.setItem('measurements', measurements);
        return response.data;
      } catch (error) {
        // En cas d'erreur, sauvegarder localement
        return await this.saveOffline(formData, hasImage);
      }
    }
    
    // Mode hors ligne - tout sauvegarder localement
    return await this.saveOffline(formData, hasImage);
  },

  async update(clientId, formData, hasImage) {
    if (isOnline()) {
      try {
        const response = await api.put(`/measurements/client/${clientId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const measurements = await localforage.getItem('measurements') || [];
        const filtered = measurements.filter(m => m.client_id !== clientId);
        filtered.push(response.data);
        await localforage.setItem('measurements', filtered);
        return response.data;
      } catch (error) {
        return await this.updateOffline(clientId, formData, hasImage);
      }
    }
    // Mode hors ligne
    return await this.updateOffline(clientId, formData, hasImage);
  },

  async updateOffline(clientId, formData, hasImage) {
    const measurements = await localforage.getItem('measurements') || [];
    const index = measurements.findIndex(m => m.client_id === clientId);
    
    const updatedMeasurement = {
      id: index !== -1 ? measurements[index].id : `temp_${Date.now()}`,
      client_id: parseInt(formData.get('client_id')),
      do: parseFloat(formData.get('do')) || null,
      poitrine: parseFloat(formData.get('poitrine')) || null,
      taille: parseFloat(formData.get('taille')) || null,
      longueur: parseFloat(formData.get('longueur')) || null,
      manche: parseFloat(formData.get('manche')) || null,
      tour_manche: parseFloat(formData.get('tour_manche')) || null,
      ceinture: parseFloat(formData.get('ceinture')) || null,
      bassin: parseFloat(formData.get('bassin')) || null,
      cuisse: parseFloat(formData.get('cuisse')) || null,
      longueur_pantalon: parseFloat(formData.get('longueur_pantalon')) || null,
      bas: parseFloat(formData.get('bas')) || null,
      image_path: null,
      image_data: null,
      created_at: index !== -1 ? measurements[index].created_at : new Date().toISOString()
    };
    
    // Stocker l'image en base64 si présente
    if (hasImage) {
      const imageFile = formData.get('image');
      const base64 = await this.fileToBase64(imageFile);
      updatedMeasurement.image_data = base64;
      updatedMeasurement.image_path = imageFile.name;
    } else if (index !== -1 && measurements[index].image_data) {
      // Conserver l'image existante si pas de nouvelle image
      updatedMeasurement.image_data = measurements[index].image_data;
      updatedMeasurement.image_path = measurements[index].image_path;
    }
    
    if (index !== -1) {
      measurements[index] = updatedMeasurement;
    } else {
      measurements.push(updatedMeasurement);
    }
    
    await localforage.setItem('measurements', measurements);
    return updatedMeasurement;
  },

  async saveOffline(formData, hasImage) {
    const tempId = `temp_${Date.now()}`;
    const measurement = {
      id: tempId,
      client_id: parseInt(formData.get('client_id')),
      do: parseFloat(formData.get('do')) || null,
      poitrine: parseFloat(formData.get('poitrine')) || null,
      taille: parseFloat(formData.get('taille')) || null,
      longueur: parseFloat(formData.get('longueur')) || null,
      manche: parseFloat(formData.get('manche')) || null,
      tour_manche: parseFloat(formData.get('tour_manche')) || null,
      ceinture: parseFloat(formData.get('ceinture')) || null,
      bassin: parseFloat(formData.get('bassin')) || null,
      cuisse: parseFloat(formData.get('cuisse')) || null,
      longueur_pantalon: parseFloat(formData.get('longueur_pantalon')) || null,
      bas: parseFloat(formData.get('bas')) || null,
      image_path: null,
      image_data: null,
      created_at: new Date().toISOString()
    };
    
    // Stocker l'image en base64 si présente
    if (hasImage) {
      const imageFile = formData.get('image');
      const base64 = await this.fileToBase64(imageFile);
      measurement.image_data = base64;
      measurement.image_path = imageFile.name;
    }
    
    const measurements = await localforage.getItem('measurements') || [];
    measurements.push(measurement);
    await localforage.setItem('measurements', measurements);
    return measurement;
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
};

// Stats API
export const statsAPI = {
  async get() {
    if (isOnline()) {
      try {
        const response = await api.get('/stats');
        await localforage.setItem('stats', response.data);
        return response.data;
      } catch (error) {
        return await this.calculateOfflineStats();
      }
    }
    return await this.calculateOfflineStats();
  },

  async calculateOfflineStats() {
    const clients = await localforage.getItem('clients') || [];
    const orders = await localforage.getItem('orders') || [];
    
    // Filtrer les commandes valides (avec client_id)
    const validOrders = orders.filter(o => o.client_id);
    const ordersEnCours = validOrders.filter(o => o.status === 'en_cours');
    const ordersTermine = validOrders.filter(o => o.status === 'termine');
    
    const totalRevenue = validOrders.reduce((sum, o) => sum + (parseFloat(o.montant_total) || 0), 0);
    const totalAvance = validOrders.reduce((sum, o) => sum + (parseFloat(o.montant_avance) || 0), 0);
    const totalRestant = validOrders.reduce((sum, o) => sum + (parseFloat(o.montant_restant) || 0), 0);
    
    return {
      total_clients: clients.length,
      total_orders: validOrders.length,
      orders_en_cours: ordersEnCours.length,
      orders_termine: ordersTermine.length,
      total_revenue: totalRevenue,
      total_avance: totalAvance,
      total_restant: totalRestant
    };
  }
};

export const syncData = async () => {
  if (!isOnline()) return false;
  
  try {
    // Synchroniser les données locales vers le serveur
    const clients = await localforage.getItem('clients') || [];
    const orders = await localforage.getItem('orders') || [];
    const measurements = await localforage.getItem('measurements') || [];
    
    // Synchroniser les clients temporaires
    const tempClients = clients.filter(c => String(c.id).startsWith('temp_'));
    for (const client of tempClients) {
      try {
        const { id, ...clientData } = client;
        await api.post('/clients', clientData);
      } catch (error) {
        console.error('Erreur sync client:', error);
      }
    }
    
    // Synchroniser les commandes temporaires
    const tempOrders = orders.filter(o => String(o.id).startsWith('temp_'));
    for (const order of tempOrders) {
      try {
        const { id, ...orderData } = order;
        await api.post('/orders', orderData);
      } catch (error) {
        console.error('Erreur sync order:', error);
      }
    }
    
    // Synchroniser les mesures temporaires avec images en base64
    const tempMeasurements = measurements.filter(m => String(m.id).startsWith('temp_'));
    for (const measurement of tempMeasurements) {
      try {
        const formData = new FormData();
        const { id, image_data, created_at, ...measurementData } = measurement;
        
        Object.keys(measurementData).forEach(key => {
          if (measurementData[key] !== null && key !== 'image_path') {
            formData.append(key, measurementData[key]);
          }
        });
        
        // Convertir base64 en fichier si image présente
        if (image_data) {
          const blob = await fetch(image_data).then(r => r.blob());
          const file = new File([blob], measurement.image_path || 'image.jpg', { type: blob.type });
          formData.append('image', file);
        }
        
        await api.post('/measurements', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (error) {
        console.error('Erreur sync measurement:', error);
      }
    }
    
    // Recharger les données du serveur
    const [newClients, newOrders] = await Promise.all([
      api.get('/clients'),
      api.get('/orders')
    ]);
    
    await localforage.setItem('clients', newClients.data);
    await localforage.setItem('orders', newOrders.data);
    
    return true;
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    return false;
  }
};
