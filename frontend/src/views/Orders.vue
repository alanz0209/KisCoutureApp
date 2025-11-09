<template>
  <div class="container">
    <div class="page-header">
      <h1>Gestion des Commandes</h1>
      <button class="btn btn-primary" @click="showForm = !showForm; editMode = false; resetForm()">
        {{ showForm ? 'Annuler' : '➕ Nouvelle Commande' }}
      </button>
    </div>

    <div v-if="showForm" class="card">
      <h2>{{ editMode ? 'Modifier Commande' : 'Nouvelle Commande' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Client *</label>
          <select v-model="formData.client_id" required :disabled="editMode">
            <option value="">Sélectionnez un client</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.nom }} {{ client.prenoms }}
            </option>
          </select>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Montant Total *</label>
            <input
              type="number"
              step="0.01"
              v-model="formData.montant_total"
              required
            />
          </div>
          <div class="form-group">
            <label>Montant Avancé *</label>
            <input
              type="number"
              step="0.01"
              v-model="formData.montant_avance"
              required
            />
          </div>
          <div class="form-group">
            <label>Montant Restant</label>
            <input
              type="text"
              :value="formatCurrency(montantRestant)"
              disabled
            />
          </div>
        </div>
        <div v-if="editMode" class="form-group">
          <label>Statut *</label>
          <select v-model="formData.status" required>
            <option value="en_cours">🔄 En Cours</option>
            <option value="termine">✅ Terminée</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">{{ editMode ? 'Mettre à jour' : 'Créer la Commande' }}</button>
      </form>
    </div>

    <div class="card">
      <div class="orders-header">
        <h2>Liste des Commandes ({{ orders.length }})</h2>
        <div class="filter-buttons">
          <button
            :class="['filter-btn', activeFilter === 'all' ? 'active' : '']"
            @click="activeFilter = 'all'"
          >
            📋 Toutes ({{ orders.length }})
          </button>
          <button
            :class="['filter-btn', activeFilter === 'en_cours' ? 'active' : '']"
            @click="activeFilter = 'en_cours'"
          >
            🔄 En Cours ({{ ordersEnCours.length }})
          </button>
          <button
            :class="['filter-btn', activeFilter === 'termine' ? 'active' : '']"
            @click="activeFilter = 'termine'"
          >
            ✅ Terminées ({{ ordersTermine.length }})
          </button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Montant Total</th>
            <th>Avancé</th>
            <th>Restant</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>
              {{ getClientName(order.client_id) }}
              <span v-if="String(order.id).startsWith('temp_')" class="badge-offline">📱 Local</span>
            </td>
            <td class="amount">{{ formatCurrency(order.montant_total) }}</td>
            <td class="amount green">{{ formatCurrency(order.montant_avance) }}</td>
            <td class="amount orange">{{ formatCurrency(order.montant_restant) }}</td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td>
              <button
                class="btn btn-secondary"
                @click="editOrder(order)"
                style="margin-right: 5px;"
              >
                ✏️ Modifier
              </button>
              <button
                v-if="order.status === 'en_cours'"
                class="btn btn-success"
                @click="markAsComplete(order.id)"
                style="margin-right: 5px;"
              >
                ✅ Terminer
              </button>
              <button
                v-else
                class="btn btn-warning"
                @click="markAsInProgress(order.id)"
                style="margin-right: 5px;"
              >
                🔄 Réouvrir
              </button>
              <button
                class="btn btn-danger"
                @click="handleDelete(order.id)"
              >
                🗑️
              </button>
            </td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="6" style="text-align: center; padding: 20px;">
              Aucune commande trouvée
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { orderAPI, clientAPI, isOnline } from '../api';
import { showNotification } from '../utils/notifications';

export default {
  name: 'Orders',
  setup() {
    const orders = ref([]);
    const clients = ref([]);
    const showForm = ref(false);
    const editMode = ref(false);
    const activeFilter = ref('all');
    const formData = ref({
      id: null,
      client_id: '',
      montant_total: '',
      montant_avance: '',
      status: 'en_cours'
    });

    const montantRestant = computed(() => {
      const total = parseFloat(formData.value.montant_total) || 0;
      const avance = parseFloat(formData.value.montant_avance) || 0;
      return total - avance;
    });

    const ordersEnCours = computed(() => {
      return orders.value.filter(o => o.status === 'en_cours');
    });

    const ordersTermine = computed(() => {
      return orders.value.filter(o => o.status === 'termine');
    });

    const filteredOrders = computed(() => {
      if (activeFilter.value === 'all') return orders.value;
      return orders.value.filter(o => o.status === activeFilter.value);
    });

    const fetchOrders = async () => {
      try {
        orders.value = await orderAPI.getAll();
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    const fetchClients = async () => {
      try {
        clients.value = await clientAPI.getAll();
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    const handleSubmit = async () => {
      try {
        if (editMode.value) {
          // Mise à jour d'une commande existante
          const data = {
            montant_total: parseFloat(formData.value.montant_total),
            montant_avance: parseFloat(formData.value.montant_avance),
            montant_restant: montantRestant.value,
            status: formData.value.status
          };
          await orderAPI.update(formData.value.id, data);
        } else {
          // Création d'une nouvelle commande
          const total = parseFloat(formData.value.montant_total);
          const avance = parseFloat(formData.value.montant_avance);
          const restant = total - avance;
          
          // Déterminer le statut automatiquement
          const status = restant <= 0 ? 'termine' : 'en_cours';
          
          const data = {
            client_id: parseInt(formData.value.client_id),
            montant_total: total,
            montant_avance: avance,
            montant_restant: restant,
            status: status
          };
          await orderAPI.create(data);
        }
        
        showForm.value = false;
        editMode.value = false;
        resetForm();
        await fetchOrders();
        
        if (!isOnline()) {
          showNotification(
            editMode.value ? 'Commande modifiée' : 'Commande créée',
            'Les données ont été sauvegardées localement.',
            'success'
          );
        } else {
          showNotification(
            editMode.value ? 'Commande modifiée' : 'Commande créée',
            'La commande a été enregistrée avec succès.',
            'success'
          );
        }
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur',
          'Impossible d\'enregistrer la commande.',
          'error'
        );
      }
    };

    const editOrder = (order) => {
      editMode.value = true;
      showForm.value = true;
      formData.value = {
        id: order.id,
        client_id: order.client_id,
        montant_total: order.montant_total,
        montant_avance: order.montant_avance,
        status: order.status
      };
      // Scroll vers le formulaire
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const markAsComplete = async (orderId) => {
      if (confirm('Marquer cette commande comme terminée ?')) {
        try {
          await orderAPI.update(orderId, { status: 'termine' });
          await fetchOrders();
        } catch (error) {
          console.error('Erreur:', error);
        }
      }
    };

    const markAsInProgress = async (orderId) => {
      if (confirm('Réouvrir cette commande ?')) {
        try {
          await orderAPI.update(orderId, { status: 'en_cours' });
          await fetchOrders();
        } catch (error) {
          console.error('Erreur:', error);
        }
      }
    };

    const handleDelete = async (id) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        try {
          await orderAPI.delete(id);
          await fetchOrders();
        } catch (error) {
          console.error('Erreur:', error);
        }
      }
    };

    const resetForm = () => {
      formData.value = {
        id: null,
        client_id: '',
        montant_total: '',
        montant_avance: '',
        status: 'en_cours'
      };
    };

    const getClientName = (clientId) => {
      const client = clients.value.find(c => String(c.id) === String(clientId));
      return client ? `${client.nom} ${client.prenoms}` : '-';
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
      fetchOrders();
      fetchClients();
    });

    return {
      orders,
      clients,
      showForm,
      editMode,
      activeFilter,
      ordersEnCours,
      ordersTermine,
      formData,
      montantRestant,
      filteredOrders,
      handleSubmit,
      editOrder,
      markAsComplete,
      markAsInProgress,
      handleDelete,
      getClientName,
      formatCurrency,
      formatDate
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

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card form {
  border: 2px solid #e0e0e0;
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .filter-buttons {
    width: 100%;
  }
  
  .filter-btn {
    flex: 1;
    min-width: 100px;
  }
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #f8f9fa;
  border-color: #e91e63;
}

.filter-btn.active {
  background: #e91e63;
  color: white;
  border-color: #e91e63;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .form-group input,
  .form-group select {
    padding: 12px 14px;
    font-size: 16px;
  }
}

.form-group input[type="tel"] {
  font-family: monospace;
  letter-spacing: 0.5px;
  font-size: 16px;
}

.form-group input[type="number"] {
  font-family: inherit;
}

@media (max-width: 768px) {
  .form-group input[type="tel"],
  .form-group input[type="number"] {
    font-size: 17px;
    padding: 14px;
  }
}

.form-group input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.form-group select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  display: block;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -10px;
  padding: 0 10px;
}

@media (max-width: 768px) {
  .table {
    font-size: 13px;
  }
  
  .table th,
  .table td {
    padding: 10px 6px;
    font-size: 13px;
  }
  
  .table-wrapper {
    margin: 0 -15px;
    padding: 0 15px;
  }
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.amount {
  font-weight: bold;
}

.amount.green {
  color: #27ae60;
}

.amount.orange {
  color: #f39c12;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #e91e63;
  color: white;
}

.btn-primary:hover {
  background-color: #c2185b;
}

.btn-success {
  background-color: #27ae60;
  color: white;
  padding: 6px 12px;
  font-size: 13px;
}

.btn-success:hover {
  background-color: #229954;
}

.btn-warning {
  background-color: #f39c12;
  color: white;
  padding: 6px 12px;
  font-size: 13px;
}

.btn-warning:hover {
  background-color: #d68910;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  padding: 6px 12px;
  font-size: 13px;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 6px 12px;
  font-size: 13px;
}

.btn-secondary:hover {
  background-color: #5a6268;
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
