import React, { useState } from 'react';
import api from '../services/api';
import Modal from './Modal';

const ReadingList = ({ readings, onRefresh, onEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState('reading');

  const handleDelete = (id, type = 'reading') => {
    setDeleteId(id);
    setDeleteType(type);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/${deleteType}s/${deleteId}`);
      onRefresh();
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="reading-list">
      <h2><i className="bi bi-clock-history"></i> Historial de lecturas</h2>
      {readings.length === 0 ? (
        <p>No hay registros aún.</p>
      ) : (
        <div className="table-responsive">
          <table className="readings-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Sistólica</th>
                <th>Diastólica</th>
                <th>Presión</th>
                <th>Pulso</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {readings.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.measuredAt).toLocaleString()}</td>
                  <td data-label="Sistólica">{r.systolic}</td>
                  <td data-label="Diastólica">{r.diastolic}</td>
                  <td data-label="Presión">{r.systolic}/{r.diastolic}</td>
                  <td data-label="Pulso">{r.pulse}</td>
                  <td data-label="Notas">{r.notes || '-'}</td>
                  <td data-label="Acciones" className="actions">
                    <button onClick={() => onEdit(r)} className="btn btn-outline btn-sm">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button onClick={() => handleDelete(r.id, 'reading')} className="btn btn-danger btn-sm">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar este ${deleteType === 'reading' ? 'registro de presión' : 'peso'}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ReadingList;