import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const MobileMenu = ({ activeView, setView, isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  const handleNavigation = (view) => {
    setView(view);
    setIsOpen(false);
  };

  return (
    <div className="hamburger-container">
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
      </button>
      {isOpen && (
        <div className="hamburger-menu">
          <button className={`menu-item ${activeView === 'list' ? 'active' : ''}`} onClick={() => handleNavigation('list')}>
            <i className="bi bi-list-ul"></i> Lecturas
          </button>
          <button className={`menu-item ${activeView === 'report' ? 'active' : ''}`} onClick={() => handleNavigation('report')}>
            <i className="bi bi-bar-chart"></i> Reportes
          </button>
          <button className={`menu-item ${activeView === 'weight' ? 'active' : ''}`} onClick={() => handleNavigation('weight')}>
            <i class="bi bi-speedometer2"></i> Peso
          </button>
          <button className={`menu-item ${activeView === 'profile' ? 'active' : ''}`} onClick={() => handleNavigation('profile')}>
            <i className="bi bi-person-gear"></i> Perfil
          </button>
          <button className="menu-item logout" onClick={() => { logout(); setIsOpen(false); }}>
            <i className="bi bi-box-arrow-right"></i> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;