import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const HamburgerMenu = ({ activeView, setActiveView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="hamburger-container">
      <button className="hamburger-btn" onClick={toggleMenu}>
        <i className={`bi ${isOpen ? 'bi-x' : 'bi-list'}`}></i>
      </button>
      {isOpen && (
        <div className="hamburger-menu">
          <button 
            className={`menu-item ${activeView === 'readings' ? 'active' : ''}`}
            onClick={() => { setActiveView('readings'); closeMenu(); }}
          >
            <i className="bi bi-list-ul"></i> Lecturas
          </button>
          <button 
            className={`menu-item ${activeView === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveView('reports'); closeMenu(); }}
          >
            <i className="bi bi-bar-chart"></i> Reportes
          </button>
          <button 
            className={`menu-item ${activeView === 'weight' ? 'active' : ''}`}
            onClick={() => { setActiveView('weight'); closeMenu(); }}
          >
            <i class="bi bi-speedometer2"></i> Peso
          </button>
          <button 
            className={`menu-item ${activeView === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveView('profile'); closeMenu(); }}
          >
            <i className="bi bi-person"></i> Perfil
          </button>
          <button className="menu-item theme-toggle" onClick={() => { toggleTheme(); closeMenu(); }}>
            <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`}></i> {theme === 'light' ? 'Oscuro' : 'Claro'}
          </button>
          <button className="menu-item logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Salir
          </button>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;