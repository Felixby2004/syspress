import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import PasswordInput from './PasswordInput';

const Register = () => {
  const [name, setName] = useState(''); // ← AGREGADO
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');
  const [userId, setUserId] = useState(null);
  const [code, setCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password }); // ← incluye name
      setUserId(res.data.userId);
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setVerificationError('');
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      await login(email, password);
      navigate('/');
    } catch (err) {
      setVerificationError(err.response?.data?.error || 'Código incorrecto');
    } finally {
      setIsLoading(false);
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
            <div className="logo">
              <i className="bi bi-heart-pulse" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i>
            </div>
            <h1>Crear cuenta</h1>
            <p className="subtitle">Comienza a monitorear tu presión</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="bi bi-person"></i> Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Tu nombre"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label><i className="bi bi-envelope"></i> Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </div>
              <PasswordInput
                label="Contraseña"
                id="register-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={isLoading}
              />
              <PasswordInput
                label="Confirmar contraseña"
                id="register-confirm"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                required
                disabled={isLoading}
              />
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="bi bi-spinner bi-spin"></i> Registrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus"></i> Registrarse
                  </>
                )}
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
                  disabled={isLoading}
                />
              </div>
              {verificationError && <div className="error">{verificationError}</div>}
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="bi bi-spinner bi-spin"></i> Verificando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i> Verificar
                  </>
                )}
              </button>
            </form>
            <div className="auth-footer">
              <button
                onClick={() => { setStep('form'); setVerificationError(''); }}
                className="btn-outline"
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                disabled={isLoading}
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