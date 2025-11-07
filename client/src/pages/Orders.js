import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { orderAPI, clientAPI } from '../utils/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('en_cours'); // en_cours, termine
  const [formData, setFormData] = useState({
    client_id: '',
    montant_total: '',
    montant_avance: ''
  });

  useEffect(() => {
    fetchClients();
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll(activeTab);
      setOrders(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientAPI.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        client_id: parseInt(formData.client_id),
        montant_total: parseFloat(formData.montant_total),
        montant_avance: parseFloat(formData.montant_avance)
      };
      await orderAPI.create(data);
      setShowForm(false);
      fetchOrders();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.update(orderId, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      try {
        await orderAPI.delete(id);
        fetchOrders();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      montant_total: '',
      montant_avance: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.nom} ${client.prenoms}` : '-';
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Gestion des Commandes</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '➕ Nouvelle Commande'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h2>Nouvelle Commande</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Client *</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom} {client.prenoms}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Montant Total *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montant_total}
                    onChange={(e) => setFormData({ ...formData, montant_total: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Montant Avancé *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montant_avance}
                    onChange={(e) => setFormData({ ...formData, montant_avance: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Montant Restant</label>
                  <input
                    type="text"
                    value={formatCurrency((parseFloat(formData.montant_total) || 0) - (parseFloat(formData.montant_avance) || 0))}
                    disabled
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Créer la Commande</button>
            </form>
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'en_cours' ? 'active' : ''}`}
            onClick={() => setActiveTab('en_cours')}
          >
            🔄 En Cours
          </button>
          <button 
            className={`tab ${activeTab === 'termine' ? 'active' : ''}`}
            onClick={() => setActiveTab('termine')}
          >
            ✅ Terminées
          </button>
        </div>

        <div className="card">
          <h2>{activeTab === 'en_cours' ? 'Commandes En Cours' : 'Commandes Terminées'} ({orders.length})</h2>
          <table className="table">
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
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.client ? `${order.client.nom} ${order.client.prenoms}` : getClientName(order.client_id)}</td>
                  <td className="amount">{formatCurrency(order.montant_total)}</td>
                  <td className="amount green">{formatCurrency(order.montant_avance)}</td>
                  <td className="amount orange">{formatCurrency(order.montant_restant)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    {activeTab === 'en_cours' ? (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleStatusChange(order.id, 'termine')}
                      >
                        ✅ Terminer
                      </button>
                    ) : (
                      <button 
                        className="btn btn-warning"
                        onClick={() => handleStatusChange(order.id, 'en_cours')}
                      >
                        🔄 Réouvrir
                      </button>
                    )}
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(order.id)}
                      style={{ marginLeft: '5px' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
