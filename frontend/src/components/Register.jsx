import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');
  const [userId, setUserId] = useState(null);
  const [code, setCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setUserId(res.data.userId);
      setStep('verify');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      await login(email, password);
      navigate('/');
    } catch (err) {
      setVerificationError(err.response?.data?.error || 'Código incorrecto');
    }
  };

  return (
    <div className="auth-container">
      <button className="theme-toggle-auth" onClick={toggleTheme}>
        <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`}></i>
      </button>
      <div className="auth-card">
        {step === 'form' ? (
          <>
            <h1>
              <i className="bi bi-heart-pulse" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i> Crear cuenta
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="bi bi-person"></i> Nombre completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label><i className="bi bi-envelope"></i> Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" />
              </div>
              <div className="form-group">
                <label><i className="bi bi-lock"></i> Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label><i className="bi bi-shield-lock"></i> Confirmar contraseña</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••" />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn-primary">
                <i className="bi bi-person-plus"></i> Registrarse
              </button>
            </form>
            <div className="auth-footer">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </div>
          </>
        ) : (
          <>
            <div className="logo">
              <i className="bi bi-envelope-check" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i>
            </div>
            <h1>Verifica tu correo</h1>
            <p className="subtitle">
              Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label><i className="bi bi-pin"></i> Código de verificación</label>
                <input
                  type="text"
                  maxLength="6"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder=". . . . . ."
                  style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: '8px' }}
                />
              </div>
              {verificationError && <div className="error">{verificationError}</div>}
              <button type="submit" className="btn-primary">
                <i className="bi bi-check-circle"></i> Verificar
              </button>
            </form>
            <div className="auth-footer">
              <button
                onClick={() => { setStep('form'); setVerificationError(''); }}
                className="btn-outline"
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                <i className="bi bi-arrow-left"></i> Volver al registro
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;