import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ReadingForm from './ReadingForm';
import ReadingList from './ReadingList';
import Reports from './Reports';
import WeightManager from './WeightManager';
import Profile from './Profile';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [readings, setReadings] = useState([]);
  const [view, setView] = useState('list');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);

  const fetchReadings = async () => {
    const res = await api.get('/readings');
    setReadings(res.data);
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const addReading = async (data) => {
    await api.post('/readings', data);
    setEditingReading(null);
    fetchReadings();
  };

  const updateReading = async (data) => {
    if (!editingReading) return;
    await api.put(`/readings/${editingReading.id}`, data);
    setEditingReading(null);
    fetchReadings();
  };

  const handleEdit = (reading) => {
    setEditingReading(reading);
    setView('list'); // cambiar a vista lista para ver el formulario
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'list':
        return (
          <>
            <ReadingForm 
              onSubmit={editingReading ? updateReading : addReading} 
              initialData={editingReading}
              onCancel={handleCancelEdit}
            />
            <ReadingList readings={readings} onRefresh={fetchReadings} onEdit={handleEdit} />
          </>
        );
      case 'report':
        return <Reports />;
      case 'weight':
        return <WeightManager />;
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>
          <i className="bi bi-heart-pulse" style={{ color: 'var(--accent)' }}></i> SysPress
        </h1>
        <div className="header-actions">
          <ThemeToggle />
          <span className="user-email">
            <i className="bi bi-person-circle"></i> {user?.name || user?.email}
          </span>
          <MobileMenu activeView={view} setView={setView} isOpen={menuOpen} setIsOpen={setMenuOpen} />
          <button onClick={logout} className="btn-outline logout-desktop">
            <i className="bi bi-box-arrow-right"></i> Salir
          </button>
        </div>
      </header>

      <div className="dashboard-nav">
        <button onClick={() => setView('list')} className={view === 'list' ? 'active' : ''}>
          <i className="bi bi-list-ul"></i> Lecturas
        </button>
        <button onClick={() => setView('report')} className={view === 'report' ? 'active' : ''}>
          <i className="bi bi-bar-chart"></i> Reportes
        </button>
        <button onClick={() => setView('weight')} className={view === 'weight' ? 'active' : ''}>
          <i class="bi bi-speedometer2"></i> Peso
        </button>
        <button onClick={() => setView('profile')} className={view === 'profile' ? 'active' : ''}>
          <i className="bi bi-person-gear"></i> Perfil
        </button>
      </div>

      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;