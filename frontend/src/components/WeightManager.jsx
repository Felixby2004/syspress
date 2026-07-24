import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeightManager = () => {
  const [weights, setWeights] = useState([]);
  const [weight, setWeight] = useState('');
  const [measuredAt, setMeasuredAt] = useState(''); // ← INICIAR VACÍO (igual que en ReadingForm)
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [showChart, setShowChart] = useState(false);

  const fetchWeights = async () => {
    const res = await api.get('/weights');
    setWeights(res.data);
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  // Convertir fecha UTC a datetime-local (sin zona horaria) - igual que en ReadingForm
  const toLocalDatetime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d)) return '';
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  // Resetear formulario (deja measuredAt vacío)
  const resetForm = () => {
    setWeight('');
    setMeasuredAt('');
    setNotes('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight) return setError('Ingresa un peso válido');
    const data = {
      weight: parseFloat(weight),
      notes: notes || undefined,
    };
    // Solo enviar measuredAt si el usuario lo estableció manualmente
    if (measuredAt) {
      data.measuredAt = new Date(measuredAt).toISOString();
    }
    // Si measuredAt está vacío, el backend usará now() (por defecto en Prisma)
    try {
      if (editingId) {
        await api.put(`/weights/${editingId}`, data);
        setEditingId(null);
      } else {
        await api.post('/weights', data);
      }
      resetForm(); // Limpiar después de guardar (igual que en ReadingForm)
      fetchWeights();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de peso? Esta acción no se puede deshacer.')) {
      await api.delete(`/weights/${id}`);
      fetchWeights();
    }
  };

  const startEdit = (w) => {
    setEditingId(w.id);
    setWeight(w.weight.toString());
    setMeasuredAt(toLocalDatetime(w.measuredAt)); // Convertir a local
    setNotes(w.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm(); // Al cancelar, limpiar todo
  };

  // Datos para la gráfica
  const sorted = [...weights].sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
  const chartData = {
    labels: sorted.map(w => {
      const d = new Date(w.measuredAt);
      return !isNaN(d) ? d.toLocaleString() : 'Fecha inválida';
    }),
    datasets: [{
      label: 'Peso (kg)',
      data: sorted.map(w => w.weight),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
    }]
  };

  // Función para mostrar fecha en tabla (igual que en ReadingList)
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return !isNaN(d) ? d.toLocaleString() : 'Fecha inválida';
  };

  return (
    <div className="weight-container">
      <h2><i className="bi bi-weight"></i> Control de Peso</h2>
      <form onSubmit={handleSubmit} className="weight-form">
        <div className="form-row">
          <div className="form-group">
            <label><i className="bi bi-weight"></i> Peso (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required />
          </div>
          <div className="form-group">
            <label><i className="bi bi-calendar"></i> Fecha</label>
            <input type="datetime-local" value={measuredAt} onChange={e => setMeasuredAt(e.target.value)} />
          </div>
          <div className="form-group">
            <label><i className="bi bi-pencil"></i> Notas</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn-primary">
          <i className={`bi ${editingId ? 'bi-pencil' : 'bi-plus-circle'}`}></i>
          {editingId ? ' Actualizar' : ' Registrar'}
        </button>
        {editingId && (
          <button type="button" className="btn-outline" onClick={cancelEdit}>
            <i className="bi bi-x-circle"></i> Cancelar
          </button>
        )}
      </form>

      {weights.length > 0 && (
        <>
          <div className="weight-header">
            <h3>Historial</h3>
            <button className="btn-outline" onClick={() => setShowChart(!showChart)}>
              <i className="bi bi-graph-up"></i> {showChart ? 'Ocultar gráfica' : 'Ver gráfica'}
            </button>
          </div>

          {showChart && (
            <div className="chart-container">
              <h4>Evolución del peso</h4>
              <Line data={chartData} options={{ responsive: true }} />
            </div>
          )}

          <div className="weight-list">
            <div className="table-responsive">
              <table className="readings-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Peso (kg)</th>
                    <th>Notas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {weights.map(w => (
                    <tr key={w.id}>
                      <td>{formatDate(w.measuredAt)}</td>
                      <td>{w.weight}</td>
                      <td>{w.notes || '-'}</td>
                      <td className="actions">
                        <button onClick={() => startEdit(w)} className="btn btn-outline btn-sm">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button onClick={() => handleDelete(w.id)} className="btn btn-danger btn-sm">
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeightManager;