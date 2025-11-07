import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { syncData, isOnline } from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      handleSync();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline()) return;
    setSyncing(true);
    await syncData();
    setSyncing(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>KIS COUTURE</h2>
      </div>
      <ul className="navbar-menu">
        <li><Link to="/dashboard">Tableau de bord</Link></li>
        <li><Link to="/clients">Clients</Link></li>
        <li><Link to="/orders">Commandes</Link></li>
        <li><Link to="/measurements">Mesures</Link></li>
      </ul>
      <div className="navbar-status">
        <span className={`status-indicator ${online ? 'online' : 'offline'}`}>
          {online ? '🟢 En ligne' : '🔴 Hors ligne'}
        </span>
        {online && (
          <button 
            className="btn btn-sync" 
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Synchronisation...' : '🔄 Sync'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
