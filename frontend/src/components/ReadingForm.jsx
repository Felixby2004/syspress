import React, { useState, useEffect } from 'react';

const ReadingForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [measuredAt, setMeasuredAt] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const isEditing = !!initialData;

  // Convertir fecha UTC a datetime-local (sin zona horaria)
  const toLocalDatetime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    // Ajustar a la zona horaria local
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (initialData) {
      setSystolic(initialData.systolic.toString());
      setDiastolic(initialData.diastolic.toString());
      setPulse(initialData.pulse ? initialData.pulse.toString() : '');
      setMeasuredAt(toLocalDatetime(initialData.measured_at));
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const resetForm = () => {
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setMeasuredAt('');
    setNotes('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!systolic || !diastolic) {
      setError('Sistólica y diastólica son obligatorias');
      return;
    }
    const payload = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: pulse ? parseInt(pulse) : null,
      notes: notes || undefined,
    };
    // Si measuredAt está vacío, el backend usará la fecha actual (por defecto)
    if (measuredAt) {
      payload.measuredAt = new Date(measuredAt).toISOString();
    }
    onSubmit(payload);
    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <form className="reading-form" onSubmit={handleSubmit}>
      <h2>
        <i className="bi bi-plus-circle"></i> 
        {isEditing ? ' Editar Lectura' : ' Nueva Lectura'}
        {isEditing && (
          <button type="button" className="btn-outline" onClick={onCancel} style={{ marginLeft: '1rem' }}>
            <i className="bi bi-x-circle"></i> Cancelar
          </button>
        )}
      </h2>
      <div className="form-row">
        <div className="form-group">
          <label><i className="bi bi-arrow-up"></i> Sistólica (mmHg)</label>
          <input type="number" value={systolic} onChange={e => setSystolic(e.target.value)} min="70" max="250" required />
        </div>
        <div className="form-group">
          <label><i className="bi bi-arrow-down"></i> Diastólica (mmHg)</label>
          <input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} min="40" max="180" required />
        </div>
        <div className="form-group">
          <label><i className="bi bi-heart"></i> Pulso (lpm)</label>
          <input type="number" value={pulse} onChange={e => setPulse(e.target.value)} min="30" max="250" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label><i className="bi bi-calendar"></i> Fecha y hora</label>
          <input type="datetime-local" value={measuredAt} onChange={e => setMeasuredAt(e.target.value)} />
        </div>
        <div className="form-group">
          <label><i className="bi bi-pencil"></i> Notas</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: después de comer" />
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" className="btn-primary">
        <i className="bi bi-save"></i> {isEditing ? ' Actualizar' : ' Registrar'}
      </button>
    </form>
  );
};

export default ReadingForm;