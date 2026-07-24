import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="auth-container">
      <button className="theme-toggle-auth" onClick={toggleTheme}>
        <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`}></i>
      </button>
      <div className="auth-card">
        <div className="logo">
          <i className="bi bi-heart-pulse" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i>
        </div>
        <h1>SysPress</h1>
        <p className="subtitle">Anota su presión arterial y peso corporal</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><i className="bi bi-envelope"></i> Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" />
          </div>
          <div className="form-group">
            <label><i className="bi bi-lock"></i> Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn-primary">
            <i className="bi bi-box-arrow-in-right"></i> Ingresar
          </button>
        </form>
        <div className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;