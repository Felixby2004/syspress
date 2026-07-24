// frontend/src/components/LoadingScreen.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const LoadingScreen = () => {
  const { theme } = useTheme();

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <i className="bi bi-heart-pulse"></i>
        </div>
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">...</span>
          </div>
        </div>
        <p className="loading-text">Cargando SysPress...</p>
        <p className="loading-subtext">Preparando tu panel de control</p>
      </div>
    </div>
  );
};

export default LoadingScreen;