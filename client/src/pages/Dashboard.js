import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { statsAPI } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_clients: 0,
    total_orders: 0,
    orders_en_cours: 0,
    orders_termine: 0,
    total_revenue: 0,
    total_avance: 0,
    total_restant: 0
  });
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsAPI.get();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>Tableau de bord</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? '🙈 Masquer le solde' : '👁️ Afficher le solde'}
          </button>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Clients</h3>
            <p className="stat-number">{stats.total_clients}</p>
          </div>
          
          <div className="stat-card">
            <h3>Total Commandes</h3>
            <p className="stat-number">{stats.total_orders}</p>
          </div>
          
          <div className="stat-card">
            <h3>En Cours</h3>
            <p className="stat-number orange">{stats.orders_en_cours}</p>
          </div>
          
          <div className="stat-card">
            <h3>Terminées</h3>
            <p className="stat-number green">{stats.orders_termine}</p>
          </div>
        </div>

        {showBalance && (
          <div className="balance-section">
            <h2>Bilan Financier</h2>
            <div className="stats-grid">
              <div className="stat-card balance-card">
                <h3>Montant Total</h3>
                <p className="stat-number blue">{formatCurrency(stats.total_revenue)}</p>
              </div>
              
              <div className="stat-card balance-card">
                <h3>Avances Reçues</h3>
                <p className="stat-number green">{formatCurrency(stats.total_avance)}</p>
              </div>
              
              <div className="stat-card balance-card">
                <h3>Montant Restant</h3>
                <p className="stat-number orange">{formatCurrency(stats.total_restant)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
