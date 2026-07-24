import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';  // ← Importa useNavigate
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();  // ← Hook para navegar

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Revisa tu correo para el código de recuperación.');
      
      // ✅ Redirigir a reset-password con el email como parámetro
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000); // 2 segundos para leer el mensaje

    } catch (err) {
      setError(err.response?.data?.error || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="theme-toggle-auth" onClick={toggleTheme}>
        <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`}></i>
      </button>
      <div className="auth-card">
        <div className="logo">
          <i className="bi bi-key" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i>
        </div>
        <h1>Recuperar contraseña</h1>
        <p className="subtitle">Ingresa tu email para recibir un código de verificación</p>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><i className="bi bi-envelope"></i> Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <i className="bi bi-send"></i> {loading ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;