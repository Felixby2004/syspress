import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Leer email de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) setEmail(emailParam);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        code,
        newPassword,
      });
      setMessage(res.data.message || 'Contraseña actualizada. Redirigiendo...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
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
          <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i>
        </div>
        <h1>Restablecer contraseña</h1>
        <p className="subtitle">Ingresa el código que recibiste y tu nueva contraseña</p>
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
          <div className="form-group">
            <label><i className="bi bi-pin"></i> Código de verificación</label>
            <input
              type="text"
              maxLength="6"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              required
              placeholder=". . . . . ."
              style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px' }}
            />
          </div>
          <div className="form-group">
            <label><i className="bi bi-lock"></i> Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="form-group">
            <label><i className="bi bi-shield-lock"></i> Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repite la nueva contraseña"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <i className="bi bi-check-circle"></i> {loading ? 'Actualizando...' : 'Restablecer contraseña'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;