<template>
  <div class="container">
    <div class="page-header">
      <h1>👥 Gestion des Clients</h1>
      <button @click="showForm = true" class="btn btn-primary btn-large">
        ➕ Ajouter un Client
      </button>
    </div>

    <div class="clients-layout">
      <!-- Liste des clients avec barre de recherche -->
      <div class="clients-list-panel">
        <h2>📋 Liste des Clients</h2>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="🔍 Rechercher un client..." 
            class="search-input"
          />
        </div>
        <div class="clients-list">
          <div
            v-for="client in filteredClients"
            :key="client.id"
            :class="['client-item', selectedClient?.id === client.id ? 'active' : '']"
            @click="selectClient(client)"
          >
            <div class="client-info">
              <h3>{{ client.nom }} {{ client.prenoms }}</h3>
              <p>📞 {{ client.telephone }}</p>
              <p v-if="client.email">✉️ {{ client.email }}</p>
              <span v-if="String(client.id).startsWith('temp_')" class="badge-offline">📱 Local</span>
            </div>
          </div>
          <div v-if="filteredClients.length === 0" class="no-data">
            Aucun client trouvé
          </div>
        </div>
      </div>

      <!-- Formulaire ou détails à droite -->
      <div class="client-details-panel">
        <!-- Formulaire nouveau client -->
        <div v-if="showForm" class="card">
          <h2>{{ editMode ? 'Modifier Client' : 'Nouveau Client' }}</h2>
          <form @submit.prevent="handleSubmit">
            <div class="section">
              <h3>Informations Client</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" v-model="formData.nom" required />
                </div>
                <div class="form-group">
                  <label>Prénoms *</label>
                  <input type="text" v-model="formData.prenoms" required />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" v-model="formData.email" />
                </div>
                <div class="form-group">
                  <label>Téléphone *</label>
                  <input type="tel" v-model="formData.telephone" required />
                </div>
              </div>
            </div>

            <div class="section">
              <h3>Mesures</h3>
              <p style="color: #7f8c8d; font-size: 13px; margin-bottom: 15px;">
                💡 Astuce : Vous pouvez utiliser des tirets pour plusieurs valeurs (ex: 90-95-100)
              </p>
              <div class="measurements-grid">
                <div class="form-group">
                  <label>Dos (cm)</label>
                  <input type="text" v-model="formData.measurements.do" placeholder="Ex: 90 ou 90-95" />
                </div>
                <div class="form-group">
                  <label>Poitrine (cm)</label>
                  <input type="text" v-model="formData.measurements.poitrine" placeholder="Ex: 95 ou 95-100" />
                </div>
                <div class="form-group">
                  <label>Taille (cm)</label>
                  <input type="text" v-model="formData.measurements.taille" placeholder="Ex: 80 ou 80-85" />
                </div>
                <div class="form-group">
                  <label>Longueur (cm)</label>
                  <input type="text" v-model="formData.measurements.longueur" placeholder="Ex: 100 ou 100-105" />
                </div>
                <div class="form-group">
                  <label>Manche (cm)</label>
                  <input type="text" v-model="formData.measurements.manche" placeholder="Ex: 60 ou 60-62" />
                </div>
                <div class="form-group">
                  <label>Tour Manche (cm)</label>
                  <input type="text" v-model="formData.measurements.tour_manche" placeholder="Ex: 35 ou 35-38" />
                </div>
                <div class="form-group">
                  <label>Ceinture (cm)</label>
                  <input type="text" v-model="formData.measurements.ceinture" placeholder="Ex: 85 ou 85-90" />
                </div>
                <div class="form-group">
                  <label>Bassin (cm)</label>
                  <input type="text" v-model="formData.measurements.bassin" placeholder="Ex: 100 ou 100-105" />
                </div>
                <div class="form-group">
                  <label>Cuisse (cm)</label>
                  <input type="text" v-model="formData.measurements.cuisse" placeholder="Ex: 55 ou 55-60" />
                </div>
                <div class="form-group">
                  <label>Longueur Pantalon (cm)</label>
                  <input type="text" v-model="formData.measurements.longueur_pantalon" placeholder="Ex: 105 ou 105-110" />
                </div>
                <div class="form-group">
                  <label>Bas (cm)</label>
                  <input type="text" v-model="formData.measurements.bas" placeholder="Ex: 40 ou 40-42" />
                </div>
                <div class="form-group">
                  <label>Longueur Genou (cm)</label>
                  <input type="text" v-model="formData.measurements.longueur_genou" placeholder="Ex: 45 ou 45-50" />
                </div>
                <div class="form-group">
                  <label>Tour Mollet (cm)</label>
                  <input type="text" v-model="formData.measurements.tour_mollet" placeholder="Ex: 30 ou 30-35" />
                </div>
                <div class="form-group full-width">
                  <label>Description</label>
                  <textarea v-model="formData.measurements.description" placeholder="Informations supplémentaires sur le client ou les mesures..."></textarea>
                </div>
                <div class="form-group full-width">
                  <label>Image de référence (optionnelle)</label>
                  <input type="file" accept="image/*" @change="handleImageChange" />
                  <small v-if="!isOnline" style="color: #f39c12;">📱 Mode hors ligne - L'image sera sauvegardée localement</small>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-large">
              {{ editMode ? 'Mettre à jour' : 'Créer le Client' }}
            </button>
          </form>
        </div>

        <!-- Détails du client sélectionné -->
        <div v-else-if="selectedClient" class="card">
          <div class="client-detail-header">
            <div>
              <h2>{{ selectedClient.nom }} {{ selectedClient.prenoms }}</h2>
              <span v-if="String(selectedClient.id).startsWith('temp_')" class="badge-offline">📱 Local</span>
            </div>
            <div class="action-buttons">
              <button class="btn btn-secondary" @click="editClient(selectedClient)">✏️ Modifier</button>
              <button class="btn btn-danger" @click="handleDelete(selectedClient.id)">🗑️ Supprimer</button>
            </div>
          </div>

          <div class="section">
            <h3>Informations de Contact</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Téléphone:</strong>
                <span>{{ selectedClient.telephone }}</span>
              </div>
              <div class="info-item">
                <strong>Email:</strong>
                <span>{{ selectedClient.email || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Mesures</h3>
            <div class="measurements-display" v-if="clientMeasurements">
              <div v-if="clientMeasurements.do" class="measure-item">
                <strong>Dos:</strong> {{ clientMeasurements.do }} cm
              </div>
              <div v-if="clientMeasurements.poitrine" class="measure-item">
                <strong>Poitrine:</strong> {{ clientMeasurements.poitrine }} cm
              </div>
              <div v-if="clientMeasurements.taille" class="measure-item">
                <strong>Taille:</strong> {{ clientMeasurements.taille }} cm
              </div>
              <div v-if="clientMeasurements.longueur" class="measure-item">
                <strong>Longueur:</strong> {{ clientMeasurements.longueur }} cm
              </div>
              <div v-if="clientMeasurements.manche" class="measure-item">
                <strong>Manche:</strong> {{ clientMeasurements.manche }} cm
              </div>
              <div v-if="clientMeasurements.tour_manche" class="measure-item">
                <strong>Tour Manche:</strong> {{ clientMeasurements.tour_manche }} cm
              </div>
              <div v-if="clientMeasurements.ceinture" class="measure-item">
                <strong>Ceinture:</strong> {{ clientMeasurements.ceinture }} cm
              </div>
              <div v-if="clientMeasurements.bassin" class="measure-item">
                <strong>Bassin:</strong> {{ clientMeasurements.bassin }} cm
              </div>
              <div v-if="clientMeasurements.cuisse" class="measure-item">
                <strong>Cuisse:</strong> {{ clientMeasurements.cuisse }} cm
              </div>
              <div v-if="clientMeasurements.longueur_pantalon" class="measure-item">
                <strong>Long. Pantalon:</strong> {{ clientMeasurements.longueur_pantalon }} cm
              </div>
              <div v-if="clientMeasurements.bas" class="measure-item">
                <strong>Bas:</strong> {{ clientMeasurements.bas }} cm
              </div>
              <div v-if="clientMeasurements.longueur_genou" class="measure-item">
                <strong>Long. Genou:</strong> {{ clientMeasurements.longueur_genou }} cm
              </div>
              <div v-if="clientMeasurements.tour_mollet" class="measure-item">
                <strong>Tour Mollet:</strong> {{ clientMeasurements.tour_mollet }} cm
              </div>
              <div v-if="clientMeasurements.description" class="measure-item">
                <strong>Description:</strong> {{ clientMeasurements.description }}
              </div>
              <div v-if="!hasMeasurements" class="no-data">
                Aucune mesure enregistrée
              </div>
            </div>
            <div class="no-data" v-else>
              Aucune mesure enregistrée
            </div>

            <div v-if="clientMeasurements?.image_path || clientMeasurements?.image_data" class="image-preview">
              <h4>Image de référence</h4>
              <img 
                v-if="clientMeasurements.image_data" 
                :src="clientMeasurements.image_data" 
                alt="Référence" 
              />
              <img 
                v-else-if="clientMeasurements.image_path" 
                :src="`http://localhost:5000/uploads/${clientMeasurements.image_path}`" 
                alt="Référence" 
              />
            </div>
          </div>

          <div class="section">
            <h3>Commandes ({{ clientOrders.length }})</h3>
            <div v-if="clientOrders.length > 0" class="orders-list">
              <div v-for="order in clientOrders" :key="order.id" class="order-item">
                <div class="order-info">
                  <span :class="['status-badge', order.status]">
                    {{ order.status === 'en_cours' ? '🔄 En Cours' : '✅ Terminée' }}
                  </span>
                  <span class="order-date">{{ formatDate(order.created_at) }}</span>
                </div>
                <div class="order-amounts">
                  <div><strong>Total:</strong> {{ formatCurrency(order.montant_total) }}</div>
                  <div class="green"><strong>Avancé:</strong> {{ formatCurrency(order.montant_avance) }}</div>
                  <div class="orange"><strong>Restant:</strong> {{ formatCurrency(order.montant_restant) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              Aucune commande
            </div>
          </div>
        </div>

        <!-- Message par défaut -->
        <div v-else class="card welcome-message">
          <h2>👈 Sélectionnez un client</h2>
          <p>Cliquez sur un client dans la liste pour voir ses informations détaillées, ses mesures et ses commandes.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { clientAPI, measurementAPI, orderAPI, isOnline } from '../api';
import { showNotification } from '../utils/notifications';

export default {
  name: 'Clients',
  setup() {
    const clients = ref([]);
    const selectedClient = ref(null);
    const clientMeasurements = ref(null);
    const clientOrders = ref([]);
    const showForm = ref(false);
    const editMode = ref(false);
    const searchQuery = ref(''); // New search query ref

    const formData = ref({
      nom: '',
      prenoms: '',
      email: '',
      telephone: '',
      measurements: {
        do: '',
        poitrine: '',
        taille: '',
        longueur: '',
        manche: '',
        tour_manche: '',
        ceinture: '',
        bassin: '',
        cuisse: '',
        longueur_pantalon: '',
        bas: '',
        longueur_genou: '',  // New field
        tour_mollet: '',  // New field
        description: ''  // New field
      },
      image: null
    });

    // Computed property for filtered clients based on search query
    const filteredClients = computed(() => {
      if (!searchQuery.value) {
        return clients.value;
      }
      
      const query = searchQuery.value.toLowerCase().trim();
      return clients.value.filter(client => 
        client.nom.toLowerCase().includes(query) ||
        client.prenoms.toLowerCase().includes(query) ||
        client.telephone.includes(query) ||
        (client.email && client.email.toLowerCase().includes(query))
      );
    });

    const hasMeasurements = computed(() => {
      if (!clientMeasurements.value) return false;
      const m = clientMeasurements.value;
      return m.do || m.poitrine || m.taille || m.longueur || m.manche || 
             m.tour_manche || m.ceinture || m.bassin || m.cuisse || 
             m.longueur_pantalon || m.bas || m.longueur_genou || m.tour_mollet || m.description; // Added new fields
    });

    const fetchClients = async () => {
      try {
        clients.value = await clientAPI.getAll();
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    const selectClient = async (client) => {
      selectedClient.value = client;
      showForm.value = false;
      
      // Charger les mesures du client
      try {
        // Ne pas essayer de récupérer les mesures pour les clients temporaires
        if (String(client.id).startsWith('temp_')) {
          clientMeasurements.value = null;
        } else {
          const measurements = await measurementAPI.getByClient(client.id);
          clientMeasurements.value = measurements.length > 0 ? measurements[0] : null;
        }
      } catch (error) {
        console.error('Erreur chargement mesures:', error);
        clientMeasurements.value = null;
      }

      // Charger les commandes du client
      try {
        const allOrders = await orderAPI.getAll();
        clientOrders.value = allOrders.filter(o => {
          // Comparer en string pour gérer les IDs temporaires
          return String(o.client_id) === String(client.id);
        });
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
        clientOrders.value = [];
      }
    };

    const editClient = (client) => {
      editMode.value = true;
      showForm.value = true;
      formData.value = {
        id: client.id,
        nom: client.nom,
        prenoms: client.prenoms,
        email: client.email || '',
        telephone: client.telephone,
        measurements: {
          do: clientMeasurements.value?.do || '',
          poitrine: clientMeasurements.value?.poitrine || '',
          taille: clientMeasurements.value?.taille || '',
          longueur: clientMeasurements.value?.longueur || '',
          manche: clientMeasurements.value?.manche || '',
          tour_manche: clientMeasurements.value?.tour_manche || '',
          ceinture: clientMeasurements.value?.ceinture || '',
          bassin: clientMeasurements.value?.bassin || '',
          cuisse: clientMeasurements.value?.cuisse || '',
          longueur_pantalon: clientMeasurements.value?.longueur_pantalon || '',
          bas: clientMeasurements.value?.bas || '',
          longueur_genou: clientMeasurements.value?.longueur_genou || '',  // New field
          tour_mollet: clientMeasurements.value?.tour_mollet || '',  // New field
          description: clientMeasurements.value?.description || ''  // New field
        }
      };
    };

    const handleImageChange = (event) => {
      if (event.target.files && event.target.files[0]) {
        formData.value.image = event.target.files[0];
      }
    };

    const handleSubmit = async () => {
      try {
        let client;
        
        if (editMode.value) {
          // Mise à jour d'un client existant
          const clientData = {
            nom: formData.value.nom,
            prenoms: formData.value.prenoms,
            email: formData.value.email,
            telephone: formData.value.telephone
          };
          
          client = await clientAPI.update(formData.value.id, clientData);
          
          // Mettre à jour les mesures
          const hasMeasurementData = Object.values(formData.value.measurements).some(v => v && v !== '');
          if (hasMeasurementData) {
            const measurementFormData = new FormData();
            measurementFormData.append('client_id', client.id);
            
            Object.keys(formData.value.measurements).forEach(key => {
              if (formData.value.measurements[key] && key !== 'image') {
                measurementFormData.append(key, formData.value.measurements[key]);
              }
            });
            
            const hasImage = formData.value.image && formData.value.image.size > 0;
            if (hasImage) {
              measurementFormData.append('image', formData.value.image);
            }
            
            await measurementAPI.update(client.id, measurementFormData, hasImage);
          }
        } else {
          // Création d'un nouveau client
          const clientData = {
            nom: formData.value.nom,
            prenoms: formData.value.prenoms,
            email: formData.value.email,
            telephone: formData.value.telephone
          };

          client = await clientAPI.create(clientData);
          
          // Créer les mesures si renseignées
          const hasMeasurementData = Object.values(formData.value.measurements).some(v => v && v !== '');
          if (hasMeasurementData) {
            const measurementFormData = new FormData();
            measurementFormData.append('client_id', client.id);
            
            Object.keys(formData.value.measurements).forEach(key => {
              if (formData.value.measurements[key] && key !== 'image') {
                measurementFormData.append(key, formData.value.measurements[key]);
              }
            });
            
            if (formData.value.image) {
              measurementFormData.append('image', formData.value.image);
            }
            
            await measurementAPI.create(measurementFormData);
          }
        }

        showForm.value = false;
        editMode.value = false;
        resetForm();
        await fetchClients();
        
        // Si on était en train de visualiser ce client, rafraîchir ses données
        if (selectedClient.value && selectedClient.value.id === client.id) {
          await selectClient(client);
        }
        
        if (!isOnline()) {
          showNotification(
            editMode.value ? 'Modifications enregistrées' : 'Client créé',
            'Les données ont été sauvegardées localement.',
            'success'
          );
        } else {
          showNotification(
            editMode.value ? 'Modifications enregistrées' : 'Client créé',
            'Les données ont été sauvegardées avec succès.',
            'success'
          );
        }
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur',
          error.message || 'Erreur lors de l\'enregistrement',
          'error'
        );
      }
    };

    const handleDelete = async (id) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        try {
          await clientAPI.delete(id);
          selectedClient.value = null;
          await fetchClients();
          showNotification(
            'Client supprimé',
            'Le client a été supprimé avec succès.',
            'success'
          );
        } catch (error) {
          console.error('Erreur:', error);
          showNotification(
            'Erreur',
            'Impossible de supprimer le client.',
            'error'
          );
        }
      }
    };

    const resetForm = () => {
      formData.value = {
        nom: '',
        prenoms: '',
        email: '',
        telephone: '',
        measurements: {
          do: '',
          poitrine: '',
          taille: '',
          longueur: '',
          manche: '',
          tour_manche: '',
          ceinture: '',
          bassin: '',
          cuisse: '',
          longueur_pantalon: '',
          bas: '',
          longueur_genou: '',  // New field
          tour_mollet: '',  // New field
          description: ''  // New field
        },
        image: null
      };
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(amount || 0);
    };

    const formatDate = (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('fr-FR');
    };

    onMounted(() => {
      fetchClients();
    });

    return {
      clients,
      selectedClient,
      clientMeasurements,
      clientOrders,
      showForm,
      editMode,
      formData,
      hasMeasurements,
      filteredClients,
      searchQuery,
      selectClient,
      editClient,
      handleImageChange,
      handleSubmit,
      handleDelete,
      formatCurrency,
      formatDate,
      isOnline: computed(() => isOnline())
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 10px;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 20px;
  }
  
  .page-header {
    margin-bottom: 15px;
  }
}

.clients-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
}

@media (max-width: 1200px) {
  .clients-layout {
    grid-template-columns: 300px 1fr;
    gap: 15px;
  }
}

@media (max-width: 992px) {
  .clients-layout {
    grid-template-columns: 250px 1fr;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .clients-layout {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .clients-list-panel {
    max-height: 300px;
    overflow-y: auto;
  }
}

@media (max-width: 480px) {
  .clients-layout {
    gap: 10px;
  }
  
  .clients-list-panel {
    max-height: 250px;
  }
}

.clients-list-panel {
  flex: 1;
  min-width: 300px;
}

.search-container {
  margin-bottom: 20px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23999' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 12px center;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

@media (max-width: 768px) {
  .search-input {
    padding: 14px 16px 14px 40px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .search-container {
    margin-bottom: 15px;
  }
  
  .search-input {
    padding: 12px 14px 12px 36px;
    font-size: 16px;
  }
}

.clients-list-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 150px);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .clients-list-panel {
    padding: 15px;
    height: auto;
  }
}

@media (max-width: 480px) {
  .clients-list-panel {
    padding: 12px;
  }
}

.clients-list-panel h2 {
  margin-bottom: 15px;
  font-size: 18px;
}

@media (max-width: 480px) {
  .clients-list-panel h2 {
    font-size: 16px;
    margin-bottom: 12px;
  }
}

.clients-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 480px) {
  .clients-list {
    gap: 8px;
  }
}

.client-item {
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (max-width: 480px) {
  .client-item {
    padding: 12px;
  }
}

.client-item:hover {
  border-color: #e91e63;
  background: #f8f9fa;
}

.client-item.active {
  border-color: #e91e63;
  background: #fce4ec;
}

.client-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #2c3e50;
}

@media (max-width: 480px) {
  .client-info h3 {
    font-size: 15px;
    margin: 0 0 6px 0;
  }
}

.client-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #7f8c8d;
}

@media (max-width: 480px) {
  .client-info p {
    font-size: 12px;
    margin: 3px 0;
  }
}

.client-details-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 150px);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .client-details-panel {
    padding: 15px;
    height: auto;
  }
}

@media (max-width: 480px) {
  .client-details-panel {
    padding: 12px;
  }
}

.card {
  background: white;
}

.client-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 768px) {
  .client-detail-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .client-detail-header {
    margin-bottom: 15px;
    padding-bottom: 12px;
    gap: 12px;
  }
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .action-buttons {
    width: 100%;
  }
  
  .action-buttons .btn {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    gap: 8px;
  }
  
  .action-buttons .btn {
    min-width: 100px;
    padding: 10px;
    font-size: 14px;
  }
}

.section {
  margin-bottom: 30px;
}

@media (max-width: 480px) {
  .section {
    margin-bottom: 20px;
  }
}

.section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

@media (max-width: 480px) {
  .section h3 {
    font-size: 16px;
    margin-bottom: 12px;
    padding-bottom: 6px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .form-grid {
    gap: 10px;
  }
}

.measurements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

@media (max-width: 992px) {
  .measurements-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .measurements-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .measurements-grid {
    gap: 10px;
  }
}

.form-group {
  margin-bottom: 15px;
}

@media (max-width: 480px) {
  .form-group {
    margin-bottom: 12px;
  }
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
}

@media (max-width: 480px) {
  .form-group label {
    font-size: 13px;
    margin-bottom: 4px;
  }
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .form-group input {
    padding: 12px 14px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .form-group input {
    padding: 10px 12px;
    font-size: 16px;
  }
}

.form-group input[type="tel"] {
  font-family: monospace;
  letter-spacing: 0.5px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .form-group input[type="tel"] {
    font-size: 17px;
    padding: 14px;
  }
}

@media (max-width: 480px) {
  .form-group input[type="tel"] {
    font-size: 16px;
    padding: 12px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .info-grid {
    gap: 10px;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

@media (min-width: 769px) {
  .info-item {
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .info-item {
    padding: 10px;
    gap: 4px;
  }
}

.info-item strong {
  color: #7f8c8d;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 480px) {
  .info-item strong {
    font-size: 12px;
  }
}

.info-item span {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  word-break: break-word;
}

@media (max-width: 480px) {
  .info-item span {
    font-size: 14px;
  }
}

@media (min-width: 769px) {
  .info-item strong {
    min-width: 100px;
  }
}

.measurements-display {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

@media (max-width: 1024px) {
  .measurements-display {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .measurements-display {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .measurements-display {
    gap: 10px;
  }
}

.measure-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

@media (max-width: 480px) {
  .measure-item {
    padding: 8px;
    font-size: 13px;
  }
}

.measure-item strong {
  color: #7f8c8d;
  margin-right: 5px;
}

.image-preview {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 480px) {
  .image-preview {
    margin-top: 15px;
  }
}

.image-preview h4 {
  margin-bottom: 10px;
  color: #7f8c8d;
}

@media (max-width: 480px) {
  .image-preview h4 {
    font-size: 15px;
    margin-bottom: 8px;
  }
}

.image-preview img {
  max-width: 100%;
  width: 400px;
  max-height: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .image-preview img {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .image-preview img {
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (max-width: 480px) {
  .orders-list {
    gap: 12px;
  }
}

.order-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e91e63;
}

@media (max-width: 480px) {
  .order-item {
    padding: 12px;
    border-radius: 6px;
  }
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

@media (max-width: 480px) {
  .order-info {
    margin-bottom: 8px;
  }
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 480px) {
  .status-badge {
    padding: 3px 10px;
    font-size: 12px;
  }
}

.status-badge.en_cours {
  background: #fff3cd;
  color: #856404;
}

.status-badge.termine {
  background: #d4edda;
  color: #155724;
}

.order-date {
  color: #7f8c8d;
  font-size: 13px;
}

@media (max-width: 480px) {
  .order-date {
    font-size: 12px;
  }
}

.order-amounts {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  font-size: 14px;
}

@media (max-width: 576px) {
  .order-amounts {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .order-amounts {
    font-size: 13px;
    gap: 6px;
  }
}

.order-amounts .green {
  color: #27ae60;
}

.order-amounts .orange {
  color: #f39c12;
}

.welcome-message {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .welcome-message {
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .welcome-message {
    padding: 30px 15px;
  }
}

.welcome-message h2 {
  margin-bottom: 15px;
}

@media (max-width: 480px) {
  .welcome-message h2 {
    font-size: 18px;
    margin-bottom: 12px;
  }
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
}

@media (max-width: 480px) {
  .no-data {
    padding: 15px;
    font-size: 14px;
  }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

@media (max-width: 480px) {
  .btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

.btn-primary {
  background-color: #e91e63;
  color: white;
}

.btn-primary:hover {
  background-color: #c2185b;
}

.btn-large {
  padding: 12px 30px;
  font-size: 16px;
  margin-top: 20px;
}

@media (max-width: 480px) {
  .btn-large {
    padding: 10px 20px;
    font-size: 15px;
    margin-top: 15px;
  }
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 8px 16px;
  font-size: 13px;
}

@media (max-width: 480px) {
  .btn-secondary {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.btn-secondary:hover {
  background-color: #5a6268;
}

@media (max-width: 480px) {
  .btn-secondary:hover {
    background-color: #545b62;
  }
}

.badge-offline {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #f39c12;
  color: white;
  font-size: 11px;
  border-radius: 12px;
  font-weight: normal;
}
</style>
