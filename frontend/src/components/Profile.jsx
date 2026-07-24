import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setName(user.name || '');
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', { name });
      setUser(res.data.user);
      setMessage('Nombre actualizado correctamente');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setMessage('Contraseña actualizada correctamente');
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  return (
    <div className="profile-container">
      <h2><i className="bi bi-person-gear"></i> Mi Perfil</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="profile-card">
        <div className="profile-info">
          <p><strong><i className="bi bi-person"></i> Nombre:</strong> {user?.name || 'Sin nombre'}</p>
          <p><strong><i className="bi bi-envelope"></i> Email:</strong> {user?.email}</p>
        </div>

        <div className="profile-form">
          <h3>Actualizar nombre</h3>
          <form onSubmit={handleUpdateName}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">
              <i className="bi bi-save"></i> Actualizar nombre
            </button>
          </form>
        </div>

        <div className="profile-form">
          <h3>Cambiar contraseña</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Contraseña actual</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirmar nueva contraseña</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">
              <i className="bi bi-shield-lock"></i> Cambiar contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;