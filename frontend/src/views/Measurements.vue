<template>
  <div class="container">
    <h1>Gestion des Mesures</h1>

    <div v-if="!selectedClient" class="card">
      <h2>Sélectionnez un Client</h2>
      <div class="client-list">
        <div
          v-for="client in clients"
          :key="client.id"
          class="client-card"
          @click="selectClient(client)"
        >
          <h3>{{ client.nom }} {{ client.prenoms }}</h3>
          <p>📞 {{ client.telephone }}</p>
          <p v-if="client.email">✉️ {{ client.email }}</p>
        </div>
        <div v-if="clients.length === 0" style="text-align: center; padding: 20px;">
          Aucun client disponible
        </div>
      </div>
    </div>

    <div v-else>
      <div class="card">
        <div class="client-header">
          <div>
            <h2>Client: {{ selectedClient.nom }} {{ selectedClient.prenoms }}</h2>
            <p>📞 {{ selectedClient.telephone }}</p>
          </div>
          <div>
            <button class="btn btn-primary" @click="showForm = !showForm">
              {{ showForm ? 'Annuler' : '➕ Nouvelle Mesure' }}
            </button>
            <button class="btn btn-secondary" @click="selectedClient = null" style="margin-left: 10px;">
              ← Retour
            </button>
          </div>
        </div>
      </div>

      <div v-if="showForm" class="card">
        <h2>Nouvelle Mesure</h2>
        <form @submit.prevent="handleSubmit">
          <div class="measurements-grid">
            <div class="form-group">
              <label>Dos (cm)</label>
              <input type="number" step="0.1" v-model="formData.do" />
            </div>
            <div class="form-group">
              <label>Poitrine (cm)</label>
              <input type="number" step="0.1" v-model="formData.poitrine" />
            </div>
            <div class="form-group">
              <label>Taille (cm)</label>
              <input type="number" step="0.1" v-model="formData.taille" />
            </div>
            <div class="form-group">
              <label>Longueur (cm)</label>
              <input type="number" step="0.1" v-model="formData.longueur" />
            </div>
            <div class="form-group">
              <label>Manche (cm)</label>
              <input type="number" step="0.1" v-model="formData.manche" />
            </div>
            <div class="form-group">
              <label>Tour Manche (cm)</label>
              <input type="number" step="0.1" v-model="formData.tour_manche" />
            </div>
            <div class="form-group">
              <label>Ceinture (cm)</label>
              <input type="number" step="0.1" v-model="formData.ceinture" />
            </div>
            <div class="form-group">
              <label>Bassin (cm)</label>
              <input type="number" step="0.1" v-model="formData.bassin" />
            </div>
            <div class="form-group">
              <label>Cuisse (cm)</label>
              <input type="number" step="0.1" v-model="formData.cuisse" />
            </div>
            <div class="form-group">
              <label>Longueur Pantalon (cm)</label>
              <input type="number" step="0.1" v-model="formData.longueur_pantalon" />
            </div>
            <div class="form-group">
              <label>Bas (cm)</label>
              <input type="number" step="0.1" v-model="formData.bas" />
            </div>
            <div class="form-group full-width">
              <label>Description (Informations supplémentaires)</label>
              <textarea v-model="formData.description" rows="3" placeholder="Ajoutez des informations supplémentaires sur les mesures..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>Image de référence (optionnelle)</label>
              <input type="file" accept="image/*" @change="handleImageChange" />
              <small v-if="!isOnline" style="color: #f39c12;">📱 Mode hors ligne - L'image sera sauvegardée localement</small>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Enregistrer les Mesures</button>
        </form>
      </div>

      <div class="card">
        <h2>Historique des Mesures ({{ measurements.length }})</h2>
        <div v-if="measurements.length > 0" class="measurements-history">
          <div v-for="measurement in measurements" :key="measurement.id" class="measurement-item">
            <h3>
              Mesure du {{ formatDate(measurement.created_at) }}
              <span v-if="String(measurement.id).startsWith('temp_')" class="badge-offline">📱 Local</span>
            </h3>
            <div class="measurements-grid">
              <p v-if="measurement.do"><strong>Dos:</strong> {{ measurement.do }} cm</p>
              <p v-if="measurement.poitrine"><strong>Poitrine:</strong> {{ measurement.poitrine }} cm</p>
              <p v-if="measurement.taille"><strong>Taille:</strong> {{ measurement.taille }} cm</p>
              <p v-if="measurement.longueur"><strong>Longueur:</strong> {{ measurement.longueur }} cm</p>
              <p v-if="measurement.manche"><strong>Manche:</strong> {{ measurement.manche }} cm</p>
              <p v-if="measurement.tour_manche"><strong>Tour Manche:</strong> {{ measurement.tour_manche }} cm</p>
              <p v-if="measurement.ceinture"><strong>Ceinture:</strong> {{ measurement.ceinture }} cm</p>
              <p v-if="measurement.bassin"><strong>Bassin:</strong> {{ measurement.bassin }} cm</p>
              <p v-if="measurement.cuisse"><strong>Cuisse:</strong> {{ measurement.cuisse }} cm</p>
              <p v-if="measurement.longueur_pantalon"><strong>Long. Pantalon:</strong> {{ measurement.longueur_pantalon }} cm</p>
              <p v-if="measurement.bas"><strong>Bas:</strong> {{ measurement.bas }} cm</p>
              <p v-if="measurement.description"><strong>Description:</strong> {{ measurement.description }}</p>
            </div>
            <div v-if="measurement.image_path || measurement.image_data" class="image-preview">
              <img 
                v-if="measurement.image_data" 
                :src="measurement.image_data" 
                alt="Référence" 
              />
              <img 
                v-else-if="measurement.image_path" 
                :src="`http://localhost:5000/uploads/${measurement.image_path}`" 
                alt="Référence" 
              />
            </div>
          </div>
        </div>
        <p v-else style="text-align: center; padding: 20px;">Aucune mesure enregistrée</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { measurementAPI, clientAPI, isOnline } from '../api';

export default {
  name: 'Measurements',
  setup() {
    const clients = ref([]);
    const selectedClient = ref(null);
    const measurements = ref([]);
    const showForm = ref(false);
    const formData = ref({
      client_id: '',
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
      description: '',  // New field
      image: null
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
      formData.value.client_id = client.id;
      await fetchMeasurements(client.id);
    };

    const fetchMeasurements = async (clientId) => {
      try {
        measurements.value = await measurementAPI.getByClient(clientId);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    const handleImageChange = (event) => {
      if (event.target.files && event.target.files[0]) {
        formData.value.image = event.target.files[0];
      }
    };

    const handleSubmit = async () => {
      try {
        const data = new FormData();
        Object.keys(formData.value).forEach(key => {
          if (formData.value[key] && key !== 'image') {
            data.append(key, formData.value[key]);
          }
        });
        
        // Ajouter l'image seulement si elle existe
        if (formData.value.image) {
          data.append('image', formData.value.image);
        }

        await measurementAPI.create(data);
        showForm.value = false;
        resetForm();
        await fetchMeasurements(selectedClient.value.id);
        
        if (!isOnline()) {
          alert('✅ Mesure enregistrée localement (mode hors ligne)');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Erreur lors de l\'enregistrement');
      }
    };

    const resetForm = () => {
      formData.value = {
        client_id: selectedClient.value?.id || '',
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
        description: '',  // New field
        image: null
      };
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
      measurements,
      showForm,
      formData,
      selectClient,
      handleImageChange,
      handleSubmit,
      formatDate,
      isOnline: computed(() => isOnline())
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
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

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .card {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 12px;
    margin-bottom: 15px;
  }
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .client-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
}

.client-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .client-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 15px;
  }
}

@media (max-width: 480px) {
  .client-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.client-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (max-width: 480px) {
  .client-card {
    padding: 15px;
  }
}

.client-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: #f8f9fa;
}

.client-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

@media (max-width: 480px) {
  .client-card h3 {
    font-size: 16px;
    margin: 0 0 8px 0;
  }
}

.client-card p {
  margin: 5px 0;
  color: #7f8c8d;
  font-size: 14px;
}

@media (max-width: 480px) {
  .client-card p {
    font-size: 13px;
    margin: 4px 0;
  }
}

.measurements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .measurements-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .measurements-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 15px;
  }
}

.full-width {
  grid-column: 1 / -1;
}

.full-width small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
}

@media (max-width: 480px) {
  .full-width small {
    font-size: 11px;
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

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

@media (max-width: 480px) {
  .form-group label {
    font-size: 14px;
  }
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
}

@media (max-width: 768px) {
  .form-group textarea {
    padding: 12px 14px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .form-group textarea {
    padding: 10px 12px;
    font-size: 16px;
  }
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

.measurements-history {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 480px) {
  .measurements-history {
    gap: 15px;
  }
}

.measurement-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

@media (max-width: 768px) {
  .measurement-item {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .measurement-item {
    padding: 12px;
    border-radius: 6px;
  }
}

.measurement-item h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

@media (max-width: 480px) {
  .measurement-item h3 {
    font-size: 16px;
    margin-bottom: 12px;
  }
}

.measurement-item p {
  margin: 5px 0;
  color: #555;
}

@media (max-width: 480px) {
  .measurement-item p {
    font-size: 14px;
    margin: 4px 0;
  }
}

.image-preview {
  margin-top: 15px;
  text-align: center;
}

@media (max-width: 480px) {
  .image-preview {
    margin-top: 12px;
  }
}

.image-preview img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .image-preview img {
    max-width: 100%;
    height: auto;
  }
}

@media (max-width: 480px) {
  .image-preview img {
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.badge-offline {
  display: inline-block;
  margin-left: 10px;
  padding: 4px 10px;
  background-color: #f39c12;
  color: white;
  font-size: 12px;
  border-radius: 12px;
  font-weight: normal;
}

@media (max-width: 480px) {
  .badge-offline {
    margin-left: 8px;
    padding: 3px 8px;
    font-size: 11px;
  }
}
}
</style>
