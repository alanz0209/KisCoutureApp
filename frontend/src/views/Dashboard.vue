<template>
  <div class="container">
    <div class="dashboard-header">
      <h1>Tableau de bord</h1>
      <button class="btn btn-primary" @click="showBalance = !showBalance">
        {{ showBalance ? '🙈 Masquer le solde' : '👁️ Afficher le solde' }}
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Clients</h3>
        <p class="stat-number">{{ stats.total_clients }}</p>
      </div>

      <div class="stat-card">
        <h3>Total Commandes</h3>
        <p class="stat-number">{{ stats.total_orders }}</p>
      </div>

      <div class="stat-card">
        <h3>En Cours</h3>
        <p class="stat-number orange">{{ stats.orders_en_cours }}</p>
      </div>

      <div class="stat-card">
        <h3>Terminées</h3>
        <p class="stat-number green">{{ stats.orders_termine }}</p>
      </div>
    </div>

    <div v-if="showBalance" class="balance-section">
      <h2>Bilan Financier</h2>
      <div class="stats-grid">
        <div class="stat-card balance-card">
          <h3>Montant Total</h3>
          <p class="stat-number blue">{{ formatCurrency(stats.total_revenue) }}</p>
        </div>

        <div class="stat-card balance-card">
          <h3>Avances Reçues</h3>
          <p class="stat-number green">{{ formatCurrency(stats.total_avance) }}</p>
        </div>

        <div class="stat-card balance-card">
          <h3>Montant Restant</h3>
          <p class="stat-number orange">{{ formatCurrency(stats.total_restant) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { statsAPI } from '../api';

export default {
  name: 'Dashboard',
  setup() {
    const stats = ref({
      total_clients: 0,
      total_orders: 0,
      orders_en_cours: 0,
      orders_termine: 0,
      total_revenue: 0,
      total_avance: 0,
      total_restant: 0
    });
    const showBalance = ref(true);

    const fetchStats = async () => {
      try {
        stats.value = await statsAPI.get();
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(amount);
    };

    onMounted(() => {
      fetchStats();
    });

    return {
      stats,
      showBalance,
      formatCurrency
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
    padding: 10px;
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .dashboard-header h1 {
    font-size: 24px;
  }
  
  .dashboard-header .btn {
    width: 100%;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 20px 15px;
  }
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-card h3 {
  color: #7f8c8d;
  font-size: 15px;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .stat-card h3 {
    font-size: 13px;
  }
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

@media (max-width: 768px) {
  .stat-number {
    font-size: 26px;
  }
}

.stat-number.orange {
  color: #e91e63;
}

.stat-number.green {
  color: #27ae60;
}

.stat-number.blue {
  color: #e91e63;
}

.balance-section {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.balance-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.balance-card {
  background: linear-gradient(135deg, #f06292 0%, #e91e63 100%);
  color: white;
}

.balance-card h3 {
  color: rgba(255, 255, 255, 0.9);
}

.balance-card .stat-number {
  color: white;
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
</style>
