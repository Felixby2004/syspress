import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>
      <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`}></i>
      {theme === 'light' ? ' Oscuro' : ' Claro'}
    </button>
  );
};

export default ThemeToggle;