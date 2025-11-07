<template>
  <div class="container">
    <h1>Export des Données</h1>

    <div class="export-cards">
      <!-- Export Tous les Clients -->
      <div class="export-card">
        <div class="card-icon">👥</div>
        <h2>Tous les Clients</h2>
        <p>Exporter la liste complète des clients avec leurs informations et mesures</p>
        <div class="stats">
          <span>{{ clients.length }} clients</span>
        </div>
        <div class="export-buttons">
          <button class="btn btn-primary" @click="exportAllClientsJSON">
            📄 JSON
          </button>
          <button class="btn btn-success" @click="exportAllClientsCSV">
            📊 CSV
          </button>
          <button class="btn btn-info" @click="exportAllClientsPDF">
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Export Client Spécifique -->
      <div class="export-card">
        <div class="card-icon">👤</div>
        <h2>Client Spécifique</h2>
        <p>Exporter les informations complètes d'un client avec ses commandes et mesures</p>
        <select v-model="selectedClientId" class="client-select">
          <option value="">Sélectionnez un client</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.nom }} {{ client.prenoms }}
          </option>
        </select>
        <div class="export-buttons">
          <button 
            class="btn btn-primary" 
            @click="exportSingleClientJSON"
            :disabled="!selectedClientId"
          >
            📄 JSON
          </button>
          <button 
            class="btn btn-success" 
            @click="exportSingleClientPDF"
            :disabled="!selectedClientId"
          >
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Export Commandes -->
      <div class="export-card">
        <div class="card-icon">📦</div>
        <h2>Toutes les Commandes</h2>
        <p>Exporter la liste complète des commandes avec les détails financiers</p>
        <div class="stats">
          <span>{{ orders.length }} commandes</span>
          <span class="orange">{{ ordersEnCours.length }} en cours</span>
          <span class="green">{{ ordersTermine.length }} terminées</span>
        </div>
        <div class="export-buttons">
          <button class="btn btn-primary" @click="exportOrdersJSON">
            📄 JSON
          </button>
          <button class="btn btn-success" @click="exportOrdersCSV">
            📊 CSV
          </button>
        </div>
      </div>

      <!-- Export Statistiques -->
      <div class="export-card">
        <div class="card-icon">📊</div>
        <h2>Rapport Financier</h2>
        <p>Exporter un rapport complet avec statistiques et bilan financier</p>
        <div class="stats">
          <div>Total: {{ formatCurrency(stats.total_revenue) }}</div>
          <div class="green">Avancé: {{ formatCurrency(stats.total_avance) }}</div>
          <div class="orange">Restant: {{ formatCurrency(stats.total_restant) }}</div>
        </div>
        <div class="export-buttons">
          <button class="btn btn-primary" @click="exportStatsJSON">
            📄 JSON
          </button>
          <button class="btn btn-info" @click="exportStatsPDF">
            📕 PDF
          </button>
        </div>
      </div>

      <!-- Backup Complet -->
      <div class="export-card featured">
        <div class="card-icon">💾</div>
        <h2>Backup Complet</h2>
        <p>Sauvegarder toutes les données de l'application (clients, commandes, mesures, statistiques)</p>
        <div class="stats">
          <span>Base de données complète</span>
        </div>
        <div class="export-buttons">
          <button class="btn btn-warning" @click="exportFullBackup">
            💾 Télécharger Backup Complet
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { clientAPI, orderAPI, measurementAPI, statsAPI } from '../api';

export default {
  name: 'Export',
  setup() {
    const clients = ref([]);
    const orders = ref([]);
    const measurements = ref([]);
    const stats = ref({});
    const selectedClientId = ref('');

    const ordersEnCours = computed(() => orders.value.filter(o => o.status === 'en_cours'));
    const ordersTermine = computed(() => orders.value.filter(o => o.status === 'termine'));

    const fetchData = async () => {
      try {
        clients.value = await clientAPI.getAll();
        orders.value = await orderAPI.getAll();
        stats.value = await statsAPI.get();
        
        // Charger toutes les mesures
        const allMeasurements = [];
        for (const client of clients.value) {
          const clientMeasurements = await measurementAPI.getByClient(client.id);
          allMeasurements.push(...clientMeasurements);
        }
        measurements.value = allMeasurements;
      } catch (error) {
        console.error('Erreur chargement données:', error);
      }
    };

    const downloadFile = (content, filename, type = 'application/json') => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(amount || 0);
    };

    // Export JSON
    const exportAllClientsJSON = () => {
      const data = clients.value.map(client => {
        const clientMeasurements = measurements.value.find(m => m.client_id === client.id);
        const clientOrders = orders.value.filter(o => o.client_id === client.id);
        return {
          ...client,
          mesures: clientMeasurements,
          commandes: clientOrders
        };
      });
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, `clients_${new Date().toISOString().split('T')[0]}.json`);
    };

    const exportSingleClientJSON = () => {
      const client = clients.value.find(c => c.id === selectedClientId.value);
      if (!client) return;
      
      const clientMeasurements = measurements.value.find(m => m.client_id === client.id);
      const clientOrders = orders.value.filter(o => o.client_id === client.id);
      
      const data = {
        ...client,
        mesures: clientMeasurements,
        commandes: clientOrders
      };
      
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, `client_${client.nom}_${client.prenoms}_${new Date().toISOString().split('T')[0]}.json`);
    };

    const exportOrdersJSON = () => {
      const data = orders.value.map(order => {
        const client = clients.value.find(c => c.id === order.client_id);
        return {
          ...order,
          client_nom: client ? `${client.nom} ${client.prenoms}` : 'Inconnu'
        };
      });
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, `commandes_${new Date().toISOString().split('T')[0]}.json`);
    };

    const exportStatsJSON = () => {
      const json = JSON.stringify(stats.value, null, 2);
      downloadFile(json, `statistiques_${new Date().toISOString().split('T')[0]}.json`);
    };

    const exportFullBackup = () => {
      const backup = {
        date_export: new Date().toISOString(),
        clients: clients.value,
        commandes: orders.value,
        mesures: measurements.value,
        statistiques: stats.value
      };
      const json = JSON.stringify(backup, null, 2);
      downloadFile(json, `backup_kis_couture_${new Date().toISOString().split('T')[0]}.json`);
      alert('✅ Backup complet téléchargé avec succès !');
    };

    // Export CSV
    const exportAllClientsCSV = () => {
      const headers = ['Nom', 'Prénoms', 'Téléphone', 'Email', 'Dos', 'Poitrine', 'Taille', 'Longueur', 'Manche', 'Tour Manche', 'Ceinture', 'Bassin', 'Cuisse', 'Long. Pantalon', 'Bas'];
      const rows = clients.value.map(client => {
        const m = measurements.value.find(mes => mes.client_id === client.id);
        return [
          client.nom,
          client.prenoms,
          client.telephone,
          client.email || '',
          m?.do || '',
          m?.poitrine || '',
          m?.taille || '',
          m?.longueur || '',
          m?.manche || '',
          m?.tour_manche || '',
          m?.ceinture || '',
          m?.bassin || '',
          m?.cuisse || '',
          m?.longueur_pantalon || '',
          m?.bas || ''
        ];
      });
      
      const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
      downloadFile('\uFEFF' + csv, `clients_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
    };

    const exportOrdersCSV = () => {
      const headers = ['Client', 'Montant Total', 'Avancé', 'Restant', 'Status', 'Date'];
      const rows = orders.value.map(order => {
        const client = clients.value.find(c => c.id === order.client_id);
        return [
          client ? `${client.nom} ${client.prenoms}` : 'Inconnu',
          order.montant_total,
          order.montant_avance,
          order.montant_restant,
          order.status === 'en_cours' ? 'En Cours' : 'Terminée',
          new Date(order.created_at).toLocaleDateString('fr-FR')
        ];
      });
      
      const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
      downloadFile('\uFEFF' + csv, `commandes_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
    };

    // Export PDF (simple version - text based)
    const exportAllClientsPDF = () => {
      let content = 'KIS COUTURE - LISTE DES CLIENTS\n';
      content += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
      content += '='.repeat(80) + '\n\n';
      
      clients.value.forEach((client, index) => {
        const m = measurements.value.find(mes => mes.client_id === client.id);
        const clientOrders = orders.value.filter(o => o.client_id === client.id);
        
        content += `${index + 1}. ${client.nom} ${client.prenoms}\n`;
        content += `   Téléphone: ${client.telephone}\n`;
        if (client.email) content += `   Email: ${client.email}\n`;
        
        if (m) {
          content += `   MESURES:\n`;
          if (m.do) content += `     - Dos: ${m.do} cm\n`;
          if (m.poitrine) content += `     - Poitrine: ${m.poitrine} cm\n`;
          if (m.taille) content += `     - Taille: ${m.taille} cm\n`;
          if (m.longueur) content += `     - Longueur: ${m.longueur} cm\n`;
          if (m.manche) content += `     - Manche: ${m.manche} cm\n`;
          if (m.tour_manche) content += `     - Tour Manche: ${m.tour_manche} cm\n`;
          if (m.ceinture) content += `     - Ceinture: ${m.ceinture} cm\n`;
          if (m.bassin) content += `     - Bassin: ${m.bassin} cm\n`;
          if (m.cuisse) content += `     - Cuisse: ${m.cuisse} cm\n`;
          if (m.longueur_pantalon) content += `     - Long. Pantalon: ${m.longueur_pantalon} cm\n`;
          if (m.bas) content += `     - Bas: ${m.bas} cm\n`;
        }
        
        if (clientOrders.length > 0) {
          content += `   COMMANDES: ${clientOrders.length}\n`;
        }
        
        content += '\n' + '-'.repeat(80) + '\n\n';
      });
      
      downloadFile(content, `clients_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
    };

    const exportSingleClientPDF = () => {
      const client = clients.value.find(c => c.id === selectedClientId.value);
      if (!client) return;
      
      const m = measurements.value.find(mes => mes.client_id === client.id);
      const clientOrders = orders.value.filter(o => o.client_id === client.id);
      
      let content = 'KIS COUTURE - FICHE CLIENT\n';
      content += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
      content += '='.repeat(80) + '\n\n';
      
      content += `CLIENT: ${client.nom} ${client.prenoms}\n`;
      content += `Téléphone: ${client.telephone}\n`;
      if (client.email) content += `Email: ${client.email}\n`;
      content += '\n';
      
      if (m) {
        content += 'MESURES:\n';
        content += '-'.repeat(80) + '\n';
        if (m.do) content += `Dos: ${m.do} cm\n`;
        if (m.poitrine) content += `Poitrine: ${m.poitrine} cm\n`;
        if (m.taille) content += `Taille: ${m.taille} cm\n`;
        if (m.longueur) content += `Longueur: ${m.longueur} cm\n`;
        if (m.manche) content += `Manche: ${m.manche} cm\n`;
        if (m.tour_manche) content += `Tour Manche: ${m.tour_manche} cm\n`;
        if (m.ceinture) content += `Ceinture: ${m.ceinture} cm\n`;
        if (m.bassin) content += `Bassin: ${m.bassin} cm\n`;
        if (m.cuisse) content += `Cuisse: ${m.cuisse} cm\n`;
        if (m.longueur_pantalon) content += `Longueur Pantalon: ${m.longueur_pantalon} cm\n`;
        if (m.bas) content += `Bas: ${m.bas} cm\n`;
        content += '\n';
      }
      
      if (clientOrders.length > 0) {
        content += `COMMANDES (${clientOrders.length}):\n`;
        content += '-'.repeat(80) + '\n';
        clientOrders.forEach((order, index) => {
          content += `${index + 1}. ${order.status === 'en_cours' ? 'EN COURS' : 'TERMINÉE'}\n`;
          content += `   Total: ${formatCurrency(order.montant_total)}\n`;
          content += `   Avancé: ${formatCurrency(order.montant_avance)}\n`;
          content += `   Restant: ${formatCurrency(order.montant_restant)}\n`;
          content += `   Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}\n\n`;
        });
      }
      
      downloadFile(content, `client_${client.nom}_${client.prenoms}.txt`, 'text/plain');
    };

    const exportStatsPDF = () => {
      let content = 'KIS COUTURE - RAPPORT FINANCIER\n';
      content += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
      content += '='.repeat(80) + '\n\n';
      
      content += 'STATISTIQUES GÉNÉRALES:\n';
      content += '-'.repeat(80) + '\n';
      content += `Total Clients: ${stats.value.total_clients}\n`;
      content += `Total Commandes: ${stats.value.total_orders}\n`;
      content += `Commandes En Cours: ${stats.value.orders_en_cours}\n`;
      content += `Commandes Terminées: ${stats.value.orders_termine}\n\n`;
      
      content += 'BILAN FINANCIER:\n';
      content += '-'.repeat(80) + '\n';
      content += `Montant Total: ${formatCurrency(stats.value.total_revenue)}\n`;
      content += `Avances Reçues: ${formatCurrency(stats.value.total_avance)}\n`;
      content += `Montant Restant: ${formatCurrency(stats.value.total_restant)}\n\n`;
      
      downloadFile(content, `rapport_financier_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
    };

    onMounted(() => {
      fetchData();
    });

    return {
      clients,
      orders,
      stats,
      selectedClientId,
      ordersEnCours,
      ordersTermine,
      formatCurrency,
      exportAllClientsJSON,
      exportSingleClientJSON,
      exportOrdersJSON,
      exportStatsJSON,
      exportFullBackup,
      exportAllClientsCSV,
      exportOrdersCSV,
      exportAllClientsPDF,
      exportSingleClientPDF,
      exportStatsPDF
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
    padding: 10px;
  }
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.export-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .export-cards {
    grid-template-columns: 1fr;
  }
}

.export-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.export-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.export-card.featured {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #f06292 0%, #e91e63 100%);
  color: white;
}

.export-card.featured h2,
.export-card.featured p {
  color: white;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.export-card h2 {
  margin: 0 0 10px 0;
  font-size: 22px;
  color: #2c3e50;
}

.export-card p {
  color: #7f8c8d;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.export-card.featured .stats {
  background: rgba(255, 255, 255, 0.2);
}

.stats span {
  padding: 5px 10px;
  background: white;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.stats .orange {
  color: #f39c12;
}

.stats .green {
  color: #27ae60;
}

.client-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.export-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 80px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #e91e63;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #c2185b;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #138496;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
  font-size: 16px;
  padding: 12px 24px;
}

.btn-warning:hover {
  background-color: #e0a800;
}
</style>
