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
        // For online-created clients, we don't need to store them in local storage
        // They will be fetched from the server when needed
        // But we still add sync_source for consistency
        return { ...response.data, sync_source: 'online' };
      } catch (error) {
        // If online creation fails, fallback to offline creation
        const tempId = `temp_${Date.now()}`;
        const newClient = { ...data, id: tempId, created_at: new Date().toISOString(), sync_source: 'offline' };
        const clients = await localforage.getItem('clients') || [];
        clients.push(newClient);
        await localforage.setItem('clients', clients);
        return newClient;
      }
    }
    // Offline mode - create temporary client
    const tempId = `temp_${Date.now()}`;
    const newClient = { ...data, id: tempId, created_at: new Date().toISOString(), sync_source: 'offline' };
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
        // For online-created orders, we don't need to store them in local storage
        // They will be fetched from the server when needed
        // But we still add sync_source for consistency
        return { ...response.data, sync_source: 'online' };
      } catch (error) {
        // If online creation fails, fallback to offline creation
        const tempId = `temp_${Date.now()}`;
        // Determine status based on payment completion for offline orders too
        const total = parseFloat(data.montant_total) || 0;
        const avance = parseFloat(data.montant_avance) || 0;
        const restant = total - avance;
        const status = restant <= 0 ? 'termine' : 'en_cours';
        const newOrder = { ...data, id: tempId, status, montant_restant: restant, sync_source: 'offline' };
        const orders = await localforage.getItem('orders') || [];
        orders.push(newOrder);
        await localforage.setItem('orders', orders);
        return newOrder;
      }
    }
    // Offline mode - create temporary order
    const tempId = `temp_${Date.now()}`;
    // Determine status based on payment completion for offline orders too
    const total = parseFloat(data.montant_total) || 0;
    const avance = parseFloat(data.montant_avance) || 0;
    const restant = total - avance;
    const status = restant <= 0 ? 'termine' : 'en_cours';
    const newOrder = { ...data, id: tempId, status, montant_restant: restant, sync_source: 'offline' };
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
    // For temporary client IDs, check local storage directly
    if (String(clientId).startsWith('temp_')) {
      const data = await localforage.getItem('measurements') || [];
      const measurements = data.filter(m => String(m.client_id) === String(clientId));
      return measurements;
    }
    
    if (isOnline()) {
      try {
        const response = await api.get(`/measurements/client/${clientId}`);
        const measurements = await localforage.getItem('measurements') || [];
        // Merge server data with local data, prioritizing server data
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
        // For online-created measurements, we don't need to store them in local storage
        // They will be fetched from the server when needed
        // But we still add sync_source for consistency
        return { ...response.data, sync_source: 'online' };
      } catch (error) {
        // If online creation fails, fallback to offline creation
        return await this.saveOffline(formData, hasImage);
      }
    }
    
    // Offline mode - save to local storage
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
      client_id: formData.get('client_id'), // Keep as string to handle temp IDs
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
      longueur_genou: parseFloat(formData.get('longueur_genou')) || null,  // New field
      tour_mollet: parseFloat(formData.get('tour_mollet')) || null,  // New field
      description: formData.get('description') || null,  // New field
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
      client_id: formData.get('client_id'), // Keep as string to handle temp IDs
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
      longueur_genou: parseFloat(formData.get('longueur_genou')) || null,  // New field
      tour_mollet: parseFloat(formData.get('tour_mollet')) || null,  // New field
      description: formData.get('description') || null,  // New field
      image_path: null,
      image_data: null,
      created_at: new Date().toISOString(),
      sync_source: 'offline' // Explicitly mark as offline created
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
    // Get the last sync timestamp
    const lastSync = await localforage.getItem('last_sync') || null;
    
    // Get current local data
    const clients = await localforage.getItem('clients') || [];
    const orders = await localforage.getItem('orders') || [];
    const measurements = await localforage.getItem('measurements') || [];
    
    // Separate new/modified data from existing data
    // For offline-created items (temporary IDs)
    const newClients = clients.filter(c => String(c.id).startsWith('temp_'));
    const newOrders = orders.filter(o => String(o.id).startsWith('temp_'));
    const newMeasurements = measurements.filter(m => String(m.id).startsWith('temp_'));
    
    // For online-created items that have been modified offline
    const modifiedClients = clients.filter(c => 
      !String(c.id).startsWith('temp_') && 
      c.sync_source === 'online' &&
      (!lastSync || new Date(c.updated_at) > new Date(lastSync))
    );
    
    const modifiedOrders = orders.filter(o => 
      !String(o.id).startsWith('temp_') && 
      o.sync_source === 'online' &&
      (!lastSync || new Date(o.updated_at) > new Date(lastSync))
    );
    
    const modifiedMeasurements = measurements.filter(m => 
      !String(m.id).startsWith('temp_') && 
      m.sync_source === 'online' &&
      (!lastSync || new Date(m.updated_at) > new Date(lastSync))
    );
    
    // Prepare sync data
    const syncData = {
      clients: [...newClients, ...modifiedClients],
      orders: [...newOrders, ...modifiedOrders],
      measurements: [...newMeasurements, ...modifiedMeasurements]
    };
    
    // Only sync if there's data to sync
    if (syncData.clients.length > 0 || syncData.orders.length > 0 || syncData.measurements.length > 0) {
      // Send data to server
      const response = await api.post('/sync', syncData);
      
      // Handle ID mappings if provided
      if (response.data.id_mappings) {
        // Update local data with new IDs
        const updatedClients = [...clients];
        const updatedMeasurements = [...measurements];
        const updatedOrders = [...orders];
        
        // Update client IDs
        Object.keys(response.data.id_mappings).forEach(tempId => {
          const realId = response.data.id_mappings[tempId];
          
          // Update clients
          const clientIndex = updatedClients.findIndex(c => c.id === tempId);
          if (clientIndex !== -1) {
            updatedClients[clientIndex] = { 
              ...updatedClients[clientIndex], 
              id: realId,
              sync_source: 'online' // Now marked as online after sync
            };
          }
          
          // Update measurements that reference this client
          updatedMeasurements.forEach((measurement, index) => {
            if (measurement.client_id === tempId) {
              updatedMeasurements[index] = { 
                ...measurement, 
                client_id: realId,
                sync_source: 'online' // Now marked as online after sync
              };
            }
          });
          
          // Update orders that reference this client
          updatedOrders.forEach((order, index) => {
            if (order.client_id === tempId) {
              updatedOrders[index] = { 
                ...order, 
                client_id: realId,
                sync_source: 'online' // Now marked as online after sync
              };
            }
          });
        });
        
        // Save updated data
        await localforage.setItem('clients', updatedClients);
        await localforage.setItem('measurements', updatedMeasurements);
        await localforage.setItem('orders', updatedOrders);
      }
    }
    
    // Get all server data
    const [serverClients, serverOrders, serverMeasurements] = await Promise.all([
      api.get('/clients'),
      api.get('/orders'),
      api.get('/measurements') // New endpoint to get all measurements
    ]);
    
    // Add sync_source to server data
    const serverClientsWithSource = serverClients.data.map(client => ({
      ...client,
      sync_source: 'online'
    }));
    
    const serverOrdersWithSource = serverOrders.data.map(order => ({
      ...order,
      sync_source: 'online'
    }));
    
    const serverMeasurementsWithSource = serverMeasurements.data.map(measurement => ({
      ...measurement,
      sync_source: 'online'
    }));
    
    // Merge server data with local data
    const mergedClients = mergeData(clients, serverClientsWithSource, 'id');
    const mergedOrders = mergeData(orders, serverOrdersWithSource, 'id');
    const mergedMeasurements = mergeData(measurements, serverMeasurementsWithSource, 'id');
    
    // Save merged data
    await localforage.setItem('clients', mergedClients);
    await localforage.setItem('orders', mergedOrders);
    await localforage.setItem('measurements', mergedMeasurements);
    
    // Update last sync timestamp
    await localforage.setItem('last_sync', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    return false;
  }
};

// Helper function to merge local and server data
const mergeData = (localData, serverData, idField) => {
  // Create a map of server data for quick lookup
  const serverMap = new Map();
  serverData.forEach(item => {
    serverMap.set(item[idField], item);
  });
  
  // Start with server data
  const merged = [...serverData];
  
  // Add local temporary items that aren't on server yet
  localData.forEach(localItem => {
    if (String(localItem[idField]).startsWith('temp_')) {
      // For temp items, we'll keep them in local storage until they're properly synced
      // Check if a similar item already exists on server
      const exists = serverData.some(serverItem => 
        serverItem.nom === localItem.nom && 
        serverItem.prenoms === localItem.prenoms
      );
      
      if (!exists) {
        merged.push(localItem);
      }
    } else {
      // For non-temp items, check the sync_source
      const serverItem = serverMap.get(localItem[idField]);
      if (serverItem) {
        // If server item exists, check sync_source and timestamps
        if (localItem.sync_source === 'offline') {
          // Local item was created offline, but has been synced - keep server version
          // But check if local data is more recent
          const localUpdated = new Date(localItem.updated_at || localItem.created_at || 0);
          const serverUpdated = new Date(serverItem.updated_at || serverItem.created_at || 0);
          
          if (localUpdated > serverUpdated) {
            // Local data is more recent, update the merged item
            const index = merged.findIndex(item => item[idField] === localItem[idField]);
            if (index !== -1) {
              merged[index] = { ...localItem, sync_source: 'online' }; // Mark as online after merge
            }
          }
        } else {
          // Both items are online, check timestamps
          const localUpdated = new Date(localItem.updated_at || localItem.created_at || 0);
          const serverUpdated = new Date(serverItem.updated_at || serverItem.created_at || 0);
          
          if (localUpdated > serverUpdated) {
            // Local data is more recent, update the merged item
            const index = merged.findIndex(item => item[idField] === localItem[idField]);
            if (index !== -1) {
              merged[index] = localItem;
            }
          }
        }
      } else {
        // Item doesn't exist on server, add it
        merged.push(localItem);
      }
    }
  });
  
  return merged;
};

// Auto-sync function that can be called periodically
export const autoSync = async () => {
  if (isOnline()) {
    const lastAttempt = await localforage.getItem('last_sync_attempt');
    const now = new Date().getTime();
    
    // Only attempt sync if it's been more than 5 minutes since last attempt
    if (!lastAttempt || now - lastAttempt > 5 * 60 * 1000) {
      await localforage.setItem('last_sync_attempt', now);
      return await syncData();
    }
  }
  return false;
};
