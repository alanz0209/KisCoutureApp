import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { measurementAPI, clientAPI } from '../utils/api';
import './Measurements.css';

const Measurements = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
    image: null
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientAPI.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchMeasurements = async (clientId) => {
    try {
      const response = await measurementAPI.getByClient(clientId);
      setMeasurements(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setFormData({ ...formData, client_id: client.id });
    fetchMeasurements(client.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      await measurementAPI.create(data);
      setShowForm(false);
      fetchMeasurements(formData.client_id);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur: Cette fonctionnalité nécessite une connexion internet pour l\'upload d\'images');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: selectedClient?.id || '',
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
      image: null
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Gestion des Mesures</h1>

        {!selectedClient ? (
          <div className="card">
            <h2>Sélectionnez un Client</h2>
            <div className="client-list">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className="client-card"
                  onClick={() => handleClientSelect(client)}
                >
                  <h3>{client.nom} {client.prenoms}</h3>
                  <p>📞 {client.telephone}</p>
                  {client.email && <p>✉️ {client.email}</p>}
                </div>
              ))}
              {clients.length === 0 && (
                <p style={{ textAlign: 'center', padding: '20px' }}>Aucun client disponible</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Client: {selectedClient.nom} {selectedClient.prenoms}</h2>
                  <p>📞 {selectedClient.telephone}</p>
                </div>
                <div>
                  <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Annuler' : '➕ Nouvelle Mesure'}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { setSelectedClient(null); setMeasurements([]); }}
                    style={{ marginLeft: '10px' }}
                  >
                    ← Retour
                  </button>
                </div>
              </div>
            </div>

            {showForm && (
              <div className="card">
                <h2>Nouvelle Mesure</h2>
                <form onSubmit={handleSubmit}>
                  <div className="measurements-grid">
                    <div className="form-group">
                      <label>Dos (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.do}
                        onChange={(e) => setFormData({ ...formData, do: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Poitrine (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.poitrine}
                        onChange={(e) => setFormData({ ...formData, poitrine: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Taille (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.taille}
                        onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Longueur (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.longueur}
                        onChange={(e) => setFormData({ ...formData, longueur: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Manche (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.manche}
                        onChange={(e) => setFormData({ ...formData, manche: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tour Manche (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.tour_manche}
                        onChange={(e) => setFormData({ ...formData, tour_manche: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Ceinture (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.ceinture}
                        onChange={(e) => setFormData({ ...formData, ceinture: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bassin (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.bassin}
                        onChange={(e) => setFormData({ ...formData, bassin: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Cuisse (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.cuisse}
                        onChange={(e) => setFormData({ ...formData, cuisse: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Longueur Pantalon (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.longueur_pantalon}
                        onChange={(e) => setFormData({ ...formData, longueur_pantalon: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bas (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.bas}
                        onChange={(e) => setFormData({ ...formData, bas: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Image de référence</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Enregistrer les Mesures</button>
                </form>
              </div>
            )}

            <div className="card">
              <h2>Historique des Mesures ({measurements.length})</h2>
              {measurements.length > 0 ? (
                <div className="measurements-history">
                  {measurements.map((measurement) => (
                    <div key={measurement.id} className="measurement-item">
                      <h3>Mesure du {new Date(measurement.created_at).toLocaleDateString('fr-FR')}</h3>
                      <div className="measurements-grid">
                        {measurement.do && <p><strong>Dos:</strong> {measurement.do} cm</p>}
                        {measurement.poitrine && <p><strong>Poitrine:</strong> {measurement.poitrine} cm</p>}
                        {measurement.taille && <p><strong>Taille:</strong> {measurement.taille} cm</p>}
                        {measurement.longueur && <p><strong>Longueur:</strong> {measurement.longueur} cm</p>}
                        {measurement.manche && <p><strong>Manche:</strong> {measurement.manche} cm</p>}
                        {measurement.tour_manche && <p><strong>Tour Manche:</strong> {measurement.tour_manche} cm</p>}
                        {measurement.ceinture && <p><strong>Ceinture:</strong> {measurement.ceinture} cm</p>}
                        {measurement.bassin && <p><strong>Bassin:</strong> {measurement.bassin} cm</p>}
                        {measurement.cuisse && <p><strong>Cuisse:</strong> {measurement.cuisse} cm</p>}
                        {measurement.longueur_pantalon && <p><strong>Long. Pantalon:</strong> {measurement.longueur_pantalon} cm</p>}
                        {measurement.bas && <p><strong>Bas:</strong> {measurement.bas} cm</p>}
                      </div>
                      {measurement.image_path && (
                        <div className="image-preview">
                          <img 
                            src={`http://localhost:5000/uploads/${measurement.image_path}`} 
                            alt="Référence" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px' }}>Aucune mesure enregistrée</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Measurements;
