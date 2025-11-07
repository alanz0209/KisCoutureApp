import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { clientAPI } from '../utils/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    telephone: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

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
      await clientAPI.create(formData);
      setShowForm(false);
      fetchClients();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await clientAPI.delete(id);
        fetchClients();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenoms: '',
      email: '',
      telephone: ''
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Gestion des Clients</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '➕ Nouveau Client'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h2>Nouveau Client</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prénoms *</label>
                  <input
                    type="text"
                    value={formData.prenoms}
                    onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Créer le Client</button>
            </form>
          </div>
        )}

        <div className="card">
          <h2>Liste des Clients ({clients.length})</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénoms</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.nom}</td>
                  <td>{client.prenoms}</td>
                  <td>{client.email || '-'}</td>
                  <td>{client.telephone}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(client.id)}>
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    Aucun client trouvé
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

export default Clients;
