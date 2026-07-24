import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Reports = ({ readings }) => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [fromDate, toDate]);

  const fetchReport = async () => {
    try {
      const params = {};
      if (fromDate) params.from = new Date(fromDate).toISOString();
      if (toDate) params.to = new Date(toDate).toISOString();
      const res = await api.get('/reports', { params });
      setReport(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar el reporte');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fromDate, toDate]);

  const downloadPDF = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from', new Date(fromDate).toISOString());
      if (toDate) params.append('to', new Date(toDate).toISOString());

      const response = await api.get(`/reports/pdf?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_syspress_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al descargar el PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!report) return <div>Cargando reporte...</div>;

  return (
    <div className="report-container">
      <h2><i className="bi bi-bar-chart"></i> Reporte Clínico</h2>
      <div className="filters">
        <label>
          <i className="bi bi-calendar"></i> Desde:
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </label>
        <label>
          <i className="bi bi-calendar"></i> Hasta:
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </label>
      </div>
      <button className="btn-primary" onClick={downloadPDF}>
        <i className="bi bi-file-pdf"></i> Descargar PDF
      </button>

      <div className="report-summary">
        <div className="stat-card">
          <span><i className="bi bi-list-ul"></i> Lecturas totales</span>
          <strong>{report.summary.total}</strong>
        </div>
        <div className="stat-card">
          <span><i className="bi bi-arrow-up"></i> Sistólica promedio</span>
          <strong>{Math.round(report.summary.avg_sys || 0)} mmHg</strong>
        </div>
        <div className="stat-card">
          <span><i className="bi bi-arrow-down"></i> Diastólica promedio</span>
          <strong>{Math.round(report.summary.avg_dia || 0)} mmHg</strong>
        </div>
        <div className="stat-card">
          <span><i className="bi bi-heart"></i> Pulso promedio</span>
          <strong>{Math.round(report.summary.avg_pulse || 0)} lpm</strong>
        </div>
        <div className="stat-card classification">
          <span><i className="bi bi-clipboard-check"></i> Clasificación</span>
          <strong>{report.classification}</strong>
        </div>
      </div>
    </div>
  );
};

export default Reports;